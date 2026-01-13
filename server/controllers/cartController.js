const Cart = require("../models/Cart");
const {Item} = require("../models/Pos");
const Booking = require("../models/Booking");


// Get cart by booking
exports.getCartByBookingAndRoom = async (req, res) => {
  try {
    const { bookingId, roomBookingEntryId } = req.params;

    const cart = await Cart.findOne({ booking: bookingId, roomBookingEntryId })
      .populate({
        path: "items.foodItem",
        populate: {
          path: "subcategory",
          populate: { path: "category" }
        }
      });

    if (!cart) {
      return res.json({ items: [], status: null });
    }

    // Transform items but keep cart metadata
    const formattedItems = cart.items.map(i => ({
      ...i.foodItem.toObject(),
      quantity: i.quantity
    }));

    const response = {
      _id: cart._id,
      booking: cart.booking,
      roomBookingEntryId: cart.roomBookingEntryId,
      roomNumber: cart.roomNumber,
      status: cart.status,
      addedBy: cart.addedBy,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: formattedItems
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};


// Save draft
exports.saveDraft = async (req, res) => {
  try {
    const { bookingId, roomBookingEntryId, items } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if(roomBookingEntryId === ""){
      return res.status(400).json({ message: "Please assign a room" }); 
    }
    const roomExists = booking.rooms.find(r => r._id.toString() === roomBookingEntryId);
    if (!roomExists) return res.status(400).json({ message: "Room does not exist in this booking" });


    if (!items || items.length === 0) { return res.status(400).json({ message: "Please enter items." }); }

    let cart = await Cart.findOne({ booking: bookingId, roomBookingEntryId });
    if (!cart) {
      cart = new Cart({
        booking: bookingId,
        roomBookingEntryId,
        roomNumber: roomExists.roomNumber,
        items: [],
        status: "draft",
        addedBy: userId
      });
    }

    // Replace items with frontend payload (only foodItem + quantity)
    cart.items = items.map(i => ({
      foodItem: i._id,
      quantity: i.quantity
    }));

    cart.status = "draft";
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: "Cart saved as draft", cart });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};


exports.removeDraftCart = async (req, res) => {
  try {
    const { bookingId, roomBookingEntryId } = req.params;
    const cart = await Cart.findOneAndDelete({
      booking: bookingId,
      roomBookingEntryId,
      status: "draft"
    });

    if (!cart) {
      return res.status(404).json({ message: "Draft cart not found" });
    }

    res.json({ message: "Draft cart removed successfully", cartId: cart._id });
  } catch (error) {
    console.error("Error removing draft cart:", error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
