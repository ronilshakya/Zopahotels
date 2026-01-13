const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, 
  subcategories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubCategory" 
  }],
  description:{
    type: String
  }
});

const SubCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, 
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  description:{
    type: String
  }
});

const ItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  image: { 
    type: String 
  },
  currency: { 
    type: String, 
    default: "NPR" 
  },
  converted:{
    USD:{
      type: Number
    }
  },
  available: { 
    type: Boolean, 
    default: true 
  },
  stock: { 
    type: Number, 
    default: 0 
  },

  subcategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubCategory", 
    required: true 
  }
});

const POSSchema = new mongoose.Schema({
    customerType: { type: String, enum: ["booking", "walkIn"], required: true },
    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Booking", 
        default: null
    }, 
    roomBookingEntryId: { 
      type: mongoose.Schema.Types.ObjectId,
    },
    roomNumber: { 
        type: String, 
    }, 
    items: [{ 
        item: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Item", 
            required: true 
          },       
        quantity: { type: Number, default: 1 }, 
        price: { type: Number, required: true },
    } ], 
    totalPrice: { 
        type: Number, 
        required: true 
    }, 
    totalPriceUSD: { 
        type: Number, 
        required: true 
    }, 
    paymentType: { 
        type: String, 
        enum: ["bill", "instant"], 
        default: "bill" 
    }, 
    status: { 
        type: String, 
        enum: ["requested", "paid", "posted"], 
        default: "requested" 
    },
    createdAt: { type: Date, default: Date.now }
})

module.exports = {
  Category: mongoose.model("Category", CategorySchema),
  SubCategory: mongoose.model("SubCategory", SubCategorySchema),
  Item: mongoose.model("Item", ItemSchema),
  POS: mongoose.model("POS", POSSchema)
};
