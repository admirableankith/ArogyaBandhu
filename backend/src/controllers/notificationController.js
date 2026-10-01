const Notification = require('../models/Notification');

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('patientId', 'name village phone abhaId')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom follow-up reminder / health alert
// @route   POST /api/notifications
// @access  Private (asha, doctor, admin)
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, patientId, title, message, category, priority, dueDate } = req.body;

    const notification = await Notification.create({
      userId,
      patientId,
      title,
      message,
      category: category || 'APPOINTMENT',
      priority: priority || 'MEDIUM',
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up notification created in database',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
