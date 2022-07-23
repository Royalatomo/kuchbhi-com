const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  pass: {
    type: String,
    required: true,
  },

  salt: {
    type: String,
    required: true,
  },

  recentViewed: {
    type: Object,
    default: [],
  },

  orders: {
    type: Object,
    default: [],
    required: true
  },

  cart: {
    type: Object,
    default: [],
    required: true
  },

  address: {
    type: String,
    default: "other",
  },

  admin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", userSchema);
