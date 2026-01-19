const {Category, SubCategory, Item, POS} = require('../models/Pos'); 
const Booking = require('../models/Booking');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { createInvoiceForPOSWalkIn, createInvoiceForPOSMember } = require('../services/invoiceService');

let conversionRate = 132;

async function updateConversionRate(){
  try {
    const res = await axios.get('https://v6.exchangerate-api.com/v6/bde75f96b5e4ec85a13ca280/latest/USD');
    conversionRate = res.data.conversion_rates.NPR;
  } catch (error) {
    console.error("Error fetching conversion rate:", err.message);
  }
}

updateConversionRate();

//  category
exports.createCategory = async (req,res) =>{
    try {
        const {name, description} = req.body;
        existing = await Category.findOne({name}) 
        if(existing){
            return res.status(400).json({message:"Category already exists"});
        }
        const category = await Category.create({name,description});
        return res.status(201).json({ 
            message: "Category created successfully", 
            category: category 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getCategories = async (req,res) =>{
    try {
        const categories = await Category.find().populate("subcategories"); 
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();

    return res.json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req,res) =>{
    try {
        const {id} = req.params;
        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({message: "Category not found"});
        }

        const subcategories = await SubCategory.find({ category: id }); 
        const subcategoryIds = subcategories.map(sc => sc._id);

        const items = await Item.find({ subcategory: { $in: subcategoryIds } });

        items.forEach(item => { 
          if (item.image) { 
            const imagePath = path.join(__dirname, "..", "uploads", "pos-items", item.image); 
            fs.unlink(imagePath, err => { 
              if (err) { 
                console.error("Error deleting image:", err); 
              } 
            }); 
          } 
        });

        await Item.deleteMany({ subcategory: { $in: subcategoryIds } });
        await SubCategory.deleteMany({ category: id });

        await category.deleteOne();
        return res.json({ message: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//  Subcategory
exports.createSubCategory = async (req,res) =>{
    try {
        const {name,categoryId,description} = req.body;

        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).json({message:"Parent category not found"});
        }

        const existing = await SubCategory.findOne({name,category: categoryId});
        if(existing){
            return res.status(400).json({message:"Sub category already exists in this category"});
        }

        const subCategory = await SubCategory.create({name, category: categoryId,description});

        category.subcategories.push(subCategory._id); await category.save();
        
        return res.status(201).json({ 
            message: "Sub category created successfully", 
            subCategory 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await SubCategory.find({ category: categoryId });
    return res.json(subcategories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    subCategory.name = name || subCategory.name;
    subCategory.category = category || subCategory.category;
    subCategory.description = description || subCategory.description;

    await subCategory.save();

    return res.json({ message: "Subcategory updated successfully", subCategory });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return res.status(500).json({ message: error.message });
  }
};


exports.deleteSubCategory = async (req,res) =>{
    try {
        const {id} = req.params;
        const subCategory = await SubCategory.findById(id);
        if(!subCategory){
            return res.status(404).json({message: "Sub category not found"});
        }
        await Category.updateOne( 
            { _id: subCategory.category }, 
            { $pull: { subcategories: subCategory._id } } 
        );
        const items = await Item.find({ subcategory: subCategory._id }); 
        items.forEach((item) => { 
          if (item.image) { 
            const imagePath = path.join(__dirname, "..", "uploads", "pos-items", item.image); 
            fs.unlink(imagePath, (err) => { 
              if (err) { 
                console.error("Error deleting image:", err); 
              } 
            }); 
          } 
        });
        await Item.deleteMany({ subcategory: subCategory._id  });
        await subCategory.deleteOne();
        return res.json({ message: "Sub category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Items
exports.createItem = async (req,res) =>{
    try {
        const {name,price,subcategoryId,description} =req.body;

        const subCategory = await SubCategory.findById(subcategoryId);
        if(!subCategory){
            return res.status(404).json({message: "Sub category not found"});
        }
        
        const existing = await Item.findOne({name, subcategory: subcategoryId});
        if(existing){
            return res.status(400).json({message: "Item already exists in sub category"});
        }

        let converted = {}; 
        if (conversionRate) { 
            converted.USD = +(price / conversionRate).toFixed(2); 
        }

        const item = await Item.create({
            name,
            price,
            description,
            subcategory: subcategoryId,
            converted,
            image: req.file ? req.file.filename : null
        })
        res.status(201).json({
            message: "Item created successfully",
            item
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getItems = async (req,res) =>{
    try {
        const {subcategoryId} = req.params;

        const subCategory = await SubCategory.findById(subcategoryId);
        if(!subCategory){
            return res.status(404).json({message:"Sub category not found"});
        }

        const items = await Item.find({subcategory: subcategoryId})
          .populate({
            path: "subcategory", 
            populate: { 
              path: "category", 
              model: "Category",
              select: "name _id" 
            }
          });
        return res.json({ 
            message: "Items fetched successfully", 
            subCategory: subCategory.name, 
            items: items 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.updateItem = async (req,res) =>{
    try {
        const {itemId} = req.params;
        const {name,price, description, subcategory} = req.body;

        const item = await Item.findById(itemId);
        if(!item){
            return res.status(404).json({message: "Item not found"});
        }

        item.name = name || item.name;
        item.price = price || item.price;
        item.description = description || item.description;
        item.subcategory = subcategory || item.subcategory;

        if (req.file) {  
          if (item.image) { 
            const oldImagePath = path.join(__dirname, "..", "uploads", "pos-items", item.image); 
            fs.unlink(oldImagePath, (err) => { 
              if (err) console.error("Error deleting old image:", err); 
            }); 
          } 
          item.image = req.file.filename; 
        }

        if (conversionRate && price) { 
            item.converted = { 
                ...item.converted, 
                USD: +(price / conversionRate).toFixed(2) 
            };
        }
        await item.save();
        return res.json({ message: "Item updated successfully", item });

    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
}

exports.deleteItem = async (req,res) =>{
    try {
        const {itemId} = req.params;
        const item = await Item.findById(itemId);
        if(!item){
            return res.status(404).json({message: "Item not found"});
        }
        if (item.image) { 
          const imagePath = path.join(__dirname, "..", "uploads", "pos-items", item.image); 
          fs.unlink(imagePath, (err) => { 
            if (err) { 
              console.error("Error deleting image:", err);
            } 
          }); 
        }
        await item.deleteOne();
        return res.json({ message: "Item deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.searchItems = async (req, res) => {
  try {
    const { q,page = 1, limit = 10 } = req.query; // search term from query string

    let filter = {};
    if (q && q.trim() !== "") {
      // case-insensitive search on name, description
      filter = {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } }
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([ 
      Item.find(filter) 
      .populate({ 
        path: "subcategory", 
        select: "name category",
        populate: { 
          path: "category", 
          model: "Category", 
          select: "name _id" 
        } 
      }) 
      .skip(skip) 
      .limit(parseInt(limit)), 
      Item.countDocuments(filter) 
    ]);

    return res.json({ 
      message: "Items fetched successfully", 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      items 
    });
  } catch (error) {
    console.error("Error in search Items:", error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Room Service
exports.createPOSBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, roomBookingEntryId, items, paymentType } = req.body;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    if(roomBookingEntryId === ""){
      await session.abortTransaction();
      return res.status(400).json({ message: "Please assign a room" }); 
    }

    const roomExists = booking.rooms.find(r => r._id.toString() === roomBookingEntryId);
    if (!roomExists) { 
      await session.abortTransaction();
      return res.status(400).json({ message: "Room not part of this booking" }); 
    }

    if (!items || items.length === 0) { 
      await session.abortTransaction(); 
      return res.status(400).json({ message: "Please enter items." }); 
    }

    let totalPrice = 0;
    let totalPriceUSD = 0;
    const orderItems = [];

    for (const i of items) {
      const item = await Item.findById(i.item).session(session);
      if (!item) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Item not found" });
      }

      const quantity = i.quantity || 1;
      totalPrice += item.price * quantity;
      totalPriceUSD += item.converted.USD * quantity;

      orderItems.push({
        item: item._id,
        name: item.name,
        quantity,
        price: item.price,
        converted:{USD: item.converted.USD}
      });
    }

    const order = new POS({
      customerType: "booking",
      booking: booking._id,
      roomBookingEntryId,
      roomNumber: roomExists.roomNumber,
      items: orderItems,
      totalPrice,
      totalPriceUSD,
      paymentType,
      status: paymentType === "instant" ? "paid" : "requested"
    });
    await order.save({ session });

    if (paymentType === "bill") {
      booking.totalPrice += totalPrice;
      booking.totalPriceUSD += totalPriceUSD;
      booking.charges.push({
        type: "room_service",
        amount: totalPrice,
        converted: {USD: totalPriceUSD},
        currency: "NPR",
        roomNumber: roomExists.roomNumber,
        items: orderItems
      });
      await booking.save({ session });

      const invoice = await Invoice.findOne({ 
        booking: booking._id, 
        invoiceStatus: "in_progress" 
      }).session(session); 
      
      if (invoice) { 
        invoice.items.push(...orderItems); 
        invoice.subTotal += totalPrice; 
        invoice.subTotalUSD += totalPriceUSD; 
        invoice.netTotal += totalPrice; 
        invoice.netTotalUSD += totalPriceUSD; 
        await invoice.save({ session }); 
      }

      order.invoice = invoice._id;
      await order.save({ session });
    }
    

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Room service order created", order, booking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating room service order:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.createPOSMember = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, items } = req.body;

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    if (!items || items.length === 0) { 
      await session.abortTransaction(); 
      return res.status(400).json({ message: "Please enter items." }); 
    }

    let totalPrice = 0;
    let totalPriceUSD = 0;
    const orderItems = [];

    for (const i of items) {
      const item = await Item.findById(i.item).session(session);
      if (!item) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Item not found" });
      }

      const quantity = i.quantity || 1;
      totalPrice += item.price * quantity;
      totalPriceUSD += item.converted.USD * quantity;

      orderItems.push({
        item: item._id,
        name: item.name,
        quantity,
        price: item.price,
        converted:{USD: item.converted.USD}
      });
    }

    const order = new POS({
      customerType: "member",
      customer: user._id,
      items: orderItems,
      totalPrice,
      totalPriceUSD,
      paymentType: "instant",
      status: "paid"
    });
    await order.save({ session });

    const invoice = await createInvoiceForPOSMember(
      user._id,
      orderItems,
      totalPrice,
      totalPriceUSD,
      "instant"
    );

    order.invoice = invoice._id;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Room service order created", order,invoice });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating room service order:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.createPOSWalkIn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {items } = req.body;
     if (!items || items.length === 0) { 
      await session.abortTransaction(); 
      return res.status(400).json({ message: "Please enter items." }); 
    }

    let totalPrice = 0;
    let totalPriceUSD = 0;
    const orderItems = [];

    for (const i of items) {
      const item = await Item.findById(i.item).session(session);
      if (!item) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Item not found" });
      }

      const quantity = i.quantity || 1;
      totalPrice += item.price * quantity;
      totalPriceUSD += item.converted.USD * quantity;

      orderItems.push({
        item: item._id,
        name: item.name,
        quantity,
        price: item.price,
        converted:{USD: item.converted.USD}
      });
    }

    const order = new POS({
      customerType: "walkIn",
      items: orderItems,
      totalPrice,
      totalPriceUSD,
      paymentType: "instant"
    });
    await order.save({ session });

    const invoice = await createInvoiceForPOSWalkIn(
      orderItems,
      totalPrice,
      totalPriceUSD,
      "instant"
    );

    order.invoice = invoice._id;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "POS order created for walk-in customer", order, invoice });
  }catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating POS order:", error);
    return res.status(500).json({ message: error.message });
  }
}

exports.getPOSOrders = async (req, res) => {
  try {
    const { type, search = "", page = 1, limit = 10 } = req.query;

    // base filters
    const filter = {};
    if (type === "walkIn") {
      filter.customerType = "walkIn";
    } else if (type === "booking") {
      filter.customerType = "booking";
    }

    // text search on a few string fields
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { roomNumber: regex },
        { paymentType: regex },
        { status: regex },
        { customerType: regex },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    const [orders, total] = await Promise.all([
      POS.find(filter)
        .populate("items.item")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      POS.countDocuments(filter),
    ]);

    return res.json({
      message: "POS orders fetched successfully",
      orders,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching POS orders:", error);
    return res.status(500).json({ message: error.message });
  }
}

exports.getPOSOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await POS.findById(orderId).populate("items.item");
    if (!order) {
      return res.status(404).json({ message: "POS order not found" });
    }
    return res.json({ message: "POS order fetched successfully", order });
  } catch (error) {
    console.error("Error fetching POS order:", error);
    return res.status(500).json({ message: error.message });
  }
}

exports.getPOSOrderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const order = await POS.find({ customer: userId }).populate("items.item");
    if (!order) {
      return res.status(404).json({ message: "POS order not found" });
    }
    return res.json({ message: "POS order fetched successfully", order });
  } catch (error) {
    console.error("Error fetching POS order:", error);
    return res.status(500).json({ message: error.message });
  }
}