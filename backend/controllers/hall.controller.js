import Hall from "../model/hall.model.js";

const hallRegister = async (req, res) => {
  try {
    const { hall_name, hall_location, hall_contact, license, capacity } =
      req.body;
    const registeredDate = new Date();

    const hallPoster = req.file?.filename;

    if (
      !hall_name ||
      !hall_location ||
      !hall_contact ||
      !license ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message: "Mandatory to fill all the required hall details",
      });
    }

    const hall = await Hall.create({
      hall_name,
      hall_location,
      hall_contact,
      license,
      capacity,
      registeredDate: registeredDate,
      hallPoster: hallPoster,
    });

    return res.status(201).json({
      success: true,
      message: "Hall has been further processed for approval",
      data: hall,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while registering hall",
      error: err.message,
    });
  }
};

const hallUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const hall = await Hall.findByPk(id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall with ID doesnot exist",
      });
    }

    const {
      hall_name,
      hall_location,
      hall_contact,
      isActive,
      license,
      capacity,
      registeredDate,
    } = req.body;

    const hallPoster = req.file?.filename;

    const updateHall = await hall.update({
      hall_name,
      hall_location,
      hall_contact,
      isActive: isActive === "true" || isActive === true,
      license,
      capacity,
      registeredDate,
      hallPoster: hallPoster,
    });

    return res.status(201).json({
      success: true,
      message: "Hall has been updated successfully",
      data: updateHall,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while updating hall",
      error: err.message,
    });
  }
};

const hallGet = async (req, res) => {
  try {
    const halls = await Hall.findAll();

    res.status(200).json({
      success: true,
      message: "Hall fetched successfully",
      data: halls,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching data",
      error: err.message,
    });
  }
};

const hallGetActive = async (req, res) => {
  try {
    const halls = await Hall.findAll({
      where: {
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Hall fetched successfully",
      data: halls,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while fetching data",
      error: err.message,
    });
  }
};

const hallDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const hall = await Hall.findByPk(id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall with id doesnot found",
      });
    }

    hall.isActive = false;
    await hall.save();

    return res.status(200).json({
      success: true,
      message: "Hall has been deactivated",
      data: hall,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server failed while deleting",
      error: err.message,
    });
  }
};

export { hallRegister, hallUpdate, hallGet, hallDelete, hallGetActive };
