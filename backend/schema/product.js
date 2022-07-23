const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  stars: {
    type: Number,
    default: 0
  },

  reviews: {
    type: Number,
    default: 0,
  },

  images: {
    type: Object,
    default: [],
  },

  about: {
    type: String,
    default: "",
  },

  tags: {
    type: Object,
    default: []
  },

  delivery: {
    type: Object,
    default: {}
  },

  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("product", productSchema);
