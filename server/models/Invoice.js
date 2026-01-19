const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { 
        type: String, 
        required: true
    },

    customerType: { 
        type: String, 
        enum: ["walkIn", "booking", "member"], 
        required: true, 
    },

    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Booking", 
        default: null, 
    },

    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },

    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null 
    },
    
  
    items: [ 
        { 
            item: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Item", 
            }, 
            name: String,  
            quantity: { 
                type: Number, 
                required: true 
            }, 
            price: { 
                type: Number, 
                required: true 
            }, 
            converted: { USD: Number, }, 
        }, 
    ],

    subTotal: { 
        type: Number, 
        required: true, 
    }, 
    subTotalUSD: { 
        type: Number, 
        required: true, 
    }, 
    discounts: [ 
        { 
            type: { 
                type: String, 
                enum: ["percentage", "flat"], 
                required: true, 
            }, 
            value: { 
                type: Number, 
                required: true 
            },
            currency: { 
                type: String, 
                enum: ["NPR", "USD"], 
                default: "NPR" 
            },
            description: { 
                type: String,
                default: "General discount",
                set: v => v === "" ? "General discount" : v 
            },  
            appliedTo: { 
                type: String, 
                enum: ["item", "order"], 
                default: "order" 
            }, 
        } 
    ], 
    discountTotal: { 
        type: Number, 
        default: 0, 
    }, 
    discountTotalUSD: { 
        type: Number, 
        default: 0, 
    }, 
    netTotal: { 
        type: Number, 
        required: true, 
    },
    netTotalUSD: { 
        type: Number, 
        required: true, 
    },
    currency: { 
        type: String, 
        default: "NPR", 
    }, 
    paymentType: { 
        type: String, 
        enum: ["instant", "bill"], 
        required: true,
    }, 
    invoiceStatus: { 
        type: String, 
        enum: ["in_progress", "paid", "posted"], 
        default: "in_progress", 
    }, 
    vatRate: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 }, 
    vatAmountUSD: { type: Number, default: 0 },
    createdAt: { 
        type: Date, 
        default: Date.now, 
    },
    finalizedAt: { 
        type: Date, 
        default: null, 
    },
}, {
  timestamps: true
});

// Index for faster queries
invoiceSchema.index({ invoiceNumber: 1 },{unique:true});
invoiceSchema.index({ booking: 1 });
invoiceSchema.index({ invoiceDate: -1 });

module.exports = mongoose.model("Invoice", invoiceSchema);