
const ActivityLog = require("../models/activityModel")


async function logActivity(req, { action, entityType, entityId, meta = {} }) {
  try {
    if (!req.user || !req.user.id) return;

    await ActivityLog.create({
      user: req.user.id,
      action,
      entityType,
      entityId,
      meta,
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
 
  }
}

module.exports = { logActivity };
