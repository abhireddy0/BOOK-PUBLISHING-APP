\// backend/models/activityLogModel.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    // who did this
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // short description of the action
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // what type of thing it was (Book, Order, Review, User, System)
    entityType: {
      type: String,
      enum: ["Book", "Order", "Review", "User", "System"],
      default: "System",
    },

    // which specific document (optional)
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // extra info (optional)
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
