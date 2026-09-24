const SmartAlert = require('../models/SmartAlert');
const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

const processAlertsForItem = async (item, io = null) => {
  try {
    // Find active alerts matching criteria
    const alerts = await SmartAlert.find({
      isActive: true,
      userId: { $ne: item.owner },
    });

    for (const alert of alerts) {
      let isMatch = true;

      // 1. Check type
      if (alert.type !== 'both' && alert.type !== item.type) {
        continue;
      }

      // 2. Check category
      if (alert.category && alert.category.toLowerCase() !== item.category.toLowerCase()) {
        continue;
      }

      // 3. Check color
      if (alert.color && item.color) {
        if (!item.color.toLowerCase().includes(alert.color.toLowerCase())) {
          continue;
        }
      }

      // 4. Check campusZone
      if (alert.campusZone && alert.campusZone !== item.campusZone) {
        continue;
      }

      // 5. Check keywords
      if (alert.keywords && alert.keywords.length > 0) {
        const itemText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
        const matchesAnyKeyword = alert.keywords.some((kw) => itemText.includes(kw.toLowerCase()));
        if (!matchesAnyKeyword) {
          continue;
        }
      }

      // If all conditions passed, send notification
      const notification = await Notification.create({
        userId: alert.userId,
        type: NOTIFICATION_TYPES.SMART_ALERT,
        title: `Smart Alert Match: ${item.title}`,
        message: `An item matching your alert criteria (${item.category} at ${item.campusZone}) was just reported!`,
        relatedItem: item._id,
        link: `/items/${item._id}`,
      });

      // Update alert counter
      alert.notificationCount += 1;
      await alert.save();

      // Emit real-time notification if socket is connected
      if (io) {
        io.to(alert.userId.toString()).emit('new_notification', notification);
      }
    }
  } catch (error) {
    console.error(`[AlertService Error]: ${error.message}`);
  }
};

module.exports = {
  processAlertsForItem,
};
