const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  }
});

const cartSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  roomBookingEntryId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  roomNumber: { type: String },
  items: [cartItemSchema],
  status: { 
    type: String, 
    enum: ["draft", "active", "checkedout"], 
    default: "active" 
}, 
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cart", cartSchema);
