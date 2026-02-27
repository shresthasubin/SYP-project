import { sequelize } from "../db/index.js";
import HallApplication from "../model/hallApplication.model.js";
import Hall from "../model/hall.model.js";
import User from "../model/user.model.js";

const createHallApplication = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const { hall_name, hall_location, hall_contact, license } = req.body;
    const hallPoster = req.file?.filename || null;

    if (!hall_name || !hall_location || !hall_contact || !license) {
      return res.status(400).json({
        success: false,
        message: "All required hall fields must be provided",
      });
    }

    const user = await User.findByPk(applicantId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(400).json({
        success: false,
        message: "Only normal users can submit hall staff applications",
      });
    }

    const existingPending = await HallApplication.findOne({
      where: { applicant_id: applicantId, status: "pending" },
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending application",
      });
    }

    const application = await HallApplication.create({
      applicant_id: applicantId,
      hall_name,
      hall_location,
      hall_contact,
      license,
      hallPoster,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted and waiting for admin verification",
      data: application,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while submitting application",
      error: err.message,
    });
  }
};

const getMyHallApplication = async (req, res) => {
  try {
    const latestApplication = await HallApplication.findOne({
      where: { applicant_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: latestApplication,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching your application",
      error: err.message,
    });
  }
};

const getPendingHallApplications = async (req, res) => {
  try {
    const applications = await HallApplication.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching applications",
      error: err.message,
    });
  }
};

const approveHallApplication = async (req, res) => {
  const tx = await sequelize.transaction();

  try {
    const { id } = req.params;
    const application = await HallApplication.findByPk(id, { transaction: tx });

    if (!application) {
      await tx.rollback();
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      await tx.rollback();
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be approved",
      });
    }

    const applicant = await User.findByPk(application.applicant_id, {
      transaction: tx,
    });

    if (!applicant) {
      await tx.rollback();
      return res.status(404).json({
        success: false,
        message: "Applicant user not found",
      });
    }

    const newHall = await Hall.create(
      {
        hall_name: application.hall_name,
        hall_location: application.hall_location,
        hall_contact: application.hall_contact,
        license: application.license,
        registeredDate: new Date(),
        isApproved: true,
        hallPoster: application.hallPoster,
      },
      { transaction: tx },
    );

    await applicant.update(
      {
        role: "hall-admin",
        license: application.license,
      },
      { transaction: tx },
    );

    await application.update(
      {
        status: "approved",
        reviewed_by: req.user.id,
        reviewed_at: new Date(),
        review_note: "Approved by admin",
      },
      { transaction: tx },
    );

    await tx.commit();

    return res.status(200).json({
      success: true,
      message: "Application approved and user promoted to hall-admin",
      data: { application, hall: newHall },
    });
  } catch (err) {
    await tx.rollback();
    return res.status(500).json({
      success: false,
      message: "Server failed while approving application",
      error: err.message,
    });
  }
};

const rejectHallApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;
    const application = await HallApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be rejected",
      });
    }

    await application.update({
      status: "rejected",
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      review_note: typeof reviewNote === "string" ? reviewNote.trim() : "",
    });

    return res.status(200).json({
      success: true,
      message: "Application rejected",
      data: application,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while rejecting application",
      error: err.message,
    });
  }
};

export {
  createHallApplication,
  getMyHallApplication,
  getPendingHallApplications,
  approveHallApplication,
  rejectHallApplication,
};
