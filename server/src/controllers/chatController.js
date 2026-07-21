const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/chat/conversation  -> customer: nijer conversation ta ber kore anbe, na thakle notun banabe
exports.getMyConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    let conversation = await Conversation.findOne({ user: userId });
    if (!conversation) {
      conversation = await Conversation.create({ user: userId });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/conversations -> admin: shob customer er conversation list (inbox)
exports.getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('user', 'name email')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/:conversationId/messages -> purono message history
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chat/upload-image -> chat e photo pathanor jonno (existing multer+cloudinary middleware use kore)
exports.uploadChatImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    // NOTE: tomar cloudinary multer storage already req.file.path e hosted URL rakhe (jemon ProductForm e hoy),
    // sheta assume kore likha hoyeche. Na thakle req.file.path er jaygay tomar actual URL field ta bosao.
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};