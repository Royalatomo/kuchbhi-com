const mongoose = require("mongoose");

const otherSchema = mongoose.Schema({
  homeCat: {
    type: Object,
    default: [],
  },

  mainCarousel: {
    type: Object,
    default: [],
  },

  // {"name": "womens", "img": "img1", "query": "some"}
  categories: {
    type: Object,
    default: [],
  },
});

module.exports = mongoose.model("others", otherSchema);
