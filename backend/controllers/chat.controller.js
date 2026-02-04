import Message from "../model/message.model.js";

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    const msg = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      message,
    });

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: userId },
          { sender_id: userId, receiver_id: req.user.id },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { sendMessage, getChat };
