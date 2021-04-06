const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  name: String,
  description: String,
  price: Number,
  details: Array,
  image: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = Offer;
