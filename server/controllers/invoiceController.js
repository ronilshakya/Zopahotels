const Invoice = require('../models/Invoice');
const { resetDiscountAndVAT } = require('../services/invoiceService');

function recalcInvoiceTotals(invoice) {
  invoice.netTotal = invoice.subTotal - invoice.discountTotal + invoice.vatAmount;
  invoice.netTotalUSD = invoice.subTotalUSD - invoice.discountTotalUSD + invoice.vatAmountUSD;
}


exports.getAllInvoices = async (req, res) => {
    try {
        const {
            search = "",
            date,
            invoiceStatus,
            customerType,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const skip = (page - 1) * limit;
        let query = {};

        // Search by invoice number, customer name, booking ID, or room number
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: "i" } },
                { "customer.name": { $regex: search, $options: "i" } },
                { "customer.bookingId": { $regex: search, $options: "i" } },
                { "customer.roomNumber": { $regex: search, $options: "i" } },
                { "customer.phone": { $regex: search, $options: "i" } },
                { "customer.email": { $regex: search, $options: "i" } }
            ];
        }

        // Date range filter
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            query.invoiceDate = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        
        if (customerType) {
            query.customerType = customerType;
        }
        
        if (invoiceStatus) {
            query.invoiceStatus = invoiceStatus;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Get total count for pagination
        const total = await Invoice.countDocuments(query);

        // Fetch invoices with pagination
        const invoices = await Invoice.find(query)
            .populate({path:"customer",select:"name"})
            .populate("booking")
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean(); // Use lean for better performance

        // Calculate summary statistics
        const stats = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$netTotal" },
                    totalAmountUSD: { $sum: "$netTotalUSD" },
                    totalPaid: { $sum: "$amountPaid" },
                    totalDue: { $sum: "$amountDue" },
                    paidInvoices: {
                        $sum: { $cond: [{ $eq: ["$invoiceStatus", "paid"] }, 1, 0] }
                    },
                    pendingInvoices: {
                        $sum: { $cond: [{ $eq: ["$invoiceStatus", "pending"] }, 1, 0] }
                    },
                    partialInvoices: {
                        $sum: { $cond: [{ $eq: ["$invoiceStatus", "partial"] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            invoices,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            },
            stats: stats.length > 0 ? stats[0] : {
                totalAmount: 0,
                totalAmountUSD: 0,
                totalPaid: 0,
                totalDue: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
                partialInvoices: 0
            }
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch invoices",
            error: error.message 
        });
    }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate("booking").populate("customer");

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invoice",
            error: error.message
        });
    }
};

// Get invoice by invoice number
exports.getInvoiceByNumber = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        
        const invoice = await Invoice.findOne({ invoiceNumber })
            .populate("booking")

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invoice",
            error: error.message
        });
    }
};

// Get invoice by booking
exports.getInvoiceByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const invoice = await Invoice.findOne({ booking: bookingId })
      .populate("booking")
      .sort({ createdAt: -1 }); // optional, in case multiple exist

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this booking"
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Error fetching booking invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking invoice",
      error: error.message
    });
  }
};

// Apply discount to invoice
exports.applyDiscount = async (req, res) => {
  try {
    const { invoiceId, type, value, currency, description, appliedTo } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Add discount entry
    invoice.discounts.push({ type, value, currency, description, appliedTo });

    // Recalculate totals
    let discountTotal = 0;
    let discountTotalUSD = 0;
    for (const d of invoice.discounts) {
      if (d.appliedTo === "order") {
        if (d.type === "percentage") {
            if (d.currency === "NPR") {
                discountTotal += (invoice.subTotal * d.value) / 100;
                discountTotalUSD += (invoice.subTotalUSD * d.value) / 100;
            } else if (d.currency === "USD") {
                discountTotalUSD += (invoice.subTotalUSD * d.value) / 100;
                discountTotal += (invoice.subTotal * d.value) / 100;
            }
            }

            if (d.type === "flat") {
            if (d.currency === "NPR") {
                discountTotal += d.value;
                discountTotalUSD += (d.value * invoice.subTotalUSD) / invoice.subTotal;
            } else if (d.currency === "USD") {
                discountTotalUSD += d.value;
                discountTotal += (d.value * invoice.subTotal) / invoice.subTotalUSD;
            }
        }
      }
      // item-level discounts could be handled here if needed
    }

    invoice.discountTotal = discountTotal;
    invoice.discountTotalUSD = discountTotalUSD;
    recalcInvoiceTotals(invoice);

    await invoice.save();
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyVAT = async (req, res) => { 
    try { 
        const { invoiceId, vatRate } = req.body; 
        const invoice = await Invoice.findById(invoiceId); 
        if (!invoice) { 
            return res.status(404).json({ success: false, message: "Invoice not found" }); 
        } 
        if (!vatRate || vatRate <= 0) { 
            return res.status(400).json({ success: false, message: "Invalid VAT rate" }); 
        }  
        const vatAmount = ((invoice.subTotal - invoice.discountTotal) * vatRate) / 100; 
        const vatAmountUSD = ((invoice.subTotalUSD - invoice.discountTotalUSD) * vatRate) / 100; 

        invoice.vatRate = vatRate;
        invoice.vatAmount = vatAmount; 
        invoice.vatAmountUSD = vatAmountUSD;  
        
        recalcInvoiceTotals(invoice);
        await invoice.save(); 
        res.json({ success: true, invoice }); 
    } catch (error) {
        console.error("applyVAT error:", error); 
        res.status(500).json({ success: false, message: error.message }); 
    } 
};

exports.resetInvoice = async (req, res) => { 
    try { 
        const { invoiceId } = req.body; 
        const invoice = await resetDiscountAndVAT(invoiceId); 
        if (!invoice) { return res.status(404).json({ success: false, message: "Invoice not found" }); } 
        res.json({ success: true, invoice }); } 
    catch (error) { 
        console.error("resetInvoice error:", error); 
        res.status(500).json({ success: false, message: error.message }); 
    } 
};

exports.paidInvoiceStatus = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }
        invoice.invoiceStatus = "paid";
        await invoice.save();
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteInvoice = async (req, res) => { 
    try { 
        const { invoiceId } = req.params;  
        const invoice = await Invoice.findByIdAndDelete(invoiceId); 
        if (!invoice) { 
            return res.status(404).json({ message: "Invoice not found" }); 
        } 
        return res.json({ message: "Invoice deleted successfully", invoice }); 
    } catch (error) {
        console.error("Error deleting invoice:", error); 
        return res.status(500).json({ message: error.message }); 
    } 
};

exports.getInvoiceReport = async (req, res) => {
    try {
        const { startDate, endDate, customerType, invoiceStatus } = req.query;

        // Build query
        let query = {};
        
        if (startDate || endDate) {
            query.invoiceDate = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.invoiceDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.invoiceDate.$lte = end;
            }
        }

        if (customerType) query.customerType = customerType;
        if (invoiceStatus) query.invoiceStatus = invoiceStatus;

        // Get all invoices for the period
        const invoices = await Invoice.find(query)
            .populate('customer', 'name email')
            .populate('booking', 'bookingId guestFirstName guestLastName')
            .sort({ invoiceDate: -1 });

        // Summary Statistics
        const summary = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalRevenue: { $sum: "$netTotal" },
                    totalRevenueUSD: { $sum: "$netTotalUSD" },
                    totalDiscount: { $sum: "$discountTotal" },
                    totalDiscountUSD: { $sum: "$discountTotalUSD" },
                    totalVAT: { $sum: "$vatAmount" },
                    totalVATUSD: { $sum: "$vatAmountUSD" },
                    avgInvoiceValue: { $avg: "$netTotal" },
                    avgInvoiceValueUSD: { $avg: "$netTotalUSD" },
                }
            }
        ]);

        // Revenue by Customer Type
        const revenueByCustomerType = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$customerType",
                    count: { $sum: 1 },
                    revenue: { $sum: "$netTotal" },
                    revenueUSD: { $sum: "$netTotalUSD" }
                }
            }
        ]);

        // Revenue by Status
        const revenueByStatus = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$invoiceStatus",
                    count: { $sum: 1 },
                    revenue: { $sum: "$netTotal" },
                    revenueUSD: { $sum: "$netTotalUSD" }
                }
            }
        ]);

        // Daily Revenue Trend
        const dailyRevenue = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$netTotal" },
                    revenueUSD: { $sum: "$netTotalUSD" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top Items Sold
        const topItems = await Invoice.aggregate([
            { $match: query },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
        ]);

        // Payment Type Distribution
        const paymentTypeDistribution = await Invoice.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$paymentType",
                    count: { $sum: 1 },
                    revenue: { $sum: "$netTotal" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            summary: summary[0] || {
                totalInvoices: 0,
                totalRevenue: 0,
                totalRevenueUSD: 0,
                totalDiscount: 0,
                totalDiscountUSD: 0,
                totalVAT: 0,
                totalVATUSD: 0,
                avgInvoiceValue: 0,
                avgInvoiceValueUSD: 0
            },
            revenueByCustomerType,
            revenueByStatus,
            dailyRevenue,
            topItems,
            paymentTypeDistribution,
            invoices: invoices.slice(0, 100) // Limit to 100 recent invoices
        });

    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: error.message
        });
    }
};

exports.exportInvoiceReport = async (req, res) => {
    try {
        const { startDate, endDate, customerType, invoiceStatus, format = 'json' } = req.query;

        let query = {};
        
        if (startDate || endDate) {
            query.invoiceDate = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.invoiceDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.invoiceDate.$lte = end;
            }
        }

        if (customerType) query.customerType = customerType;
        if (invoiceStatus) query.invoiceStatus = invoiceStatus;

        const invoices = await Invoice.find(query)
            .populate('customer', 'name email')
            .populate('booking', 'bookingId guestFirstName guestLastName')
            .sort({ invoiceDate: -1 });

        if (format === 'csv') {
            // Convert to CSV
            const csv = invoices.map(inv => ({
                'Invoice Number': inv.invoiceNumber,
                'Date': inv.invoiceDate.toLocaleDateString(),
                'Customer Type': inv.customerType,
                'Customer': inv.customer?.name || `${inv.booking?.guestFirstName} ${inv.booking?.guestLastName}`,
                'Subtotal': inv.subTotal,
                'Discount': inv.discountTotal,
                'VAT': inv.vatAmount,
                'Net Total': inv.netTotal,
                'Status': inv.invoiceStatus,
                'Payment Type': inv.paymentType
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-report-${Date.now()}.csv`);
            
            // Simple CSV generation
            const headers = Object.keys(csv[0]).join(',');
            const rows = csv.map(row => Object.values(row).join(',')).join('\n');
            res.send(`${headers}\n${rows}`);
        } else {
            res.json({ success: true, invoices });
        }

    } catch (error) {
        console.error("Error exporting report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export report",
            error: error.message
        });
    }
};