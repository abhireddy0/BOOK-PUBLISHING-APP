// backend/utils/activityLogger.js
const ActivityLog = require("../models/activityLogModel");

/**
 * logActivity(req, {
 *   action: "Created a new book: 'Title'",
 *   entityType: "Book",
 *   entityId: book._id,
 *   meta: { price: book.price }
 * })
 */
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
    // we don't throw – logging must never break the main API flow
  }
}

module.exports = { logActivity };
