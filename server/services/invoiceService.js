const Invoice = require('../models/Invoice');

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");
  
  let sequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
    sequence = lastNumber + 1;
  }
  
  return `INV-${year}-${sequence.toString().padStart(6, "0")}`;
};

exports.createInvoiceOnCheckIn = async (booking) => { 
    let invoice = await Invoice.findOne({ booking: booking._id }); 
    if (invoice) { 
        return invoice; 
    } 
    invoice = new Invoice(
        { 
            invoiceNumber: await generateInvoiceNumber(), 
            customerType: "booking", 
            booking: booking._id,
            items: [], 
            subTotal: booking.totalPrice || 0, 
            subTotalUSD: booking.totalPriceUSD || 0, 
            discountTotal: 0, 
            discountTotalUSD: 0, 
            netTotal: booking.totalPrice || 0, 
            netTotalUSD: booking.totalPriceUSD || 0,
            paymentType: "bill", 
            invoiceStatus: "in_progress",
        }
    ); 
    await invoice.save(); 
   return invoice; 
}

exports.createInvoiceForPOSWalkIn = async (orderItems, totalPrice, totalPriceUSD, paymentType = "instant") => { 
  const invoice = new Invoice({ 
    invoiceNumber: await generateInvoiceNumber(), 
    customerType: "walkIn", 
    items: orderItems, 
    subTotal: totalPrice, 
    subTotalUSD: totalPriceUSD, 
    discountTotal: 0, 
    discountTotalUSD: 0, 
    vatRate: 0, 
    vatAmount: 0, 
    vatAmountUSD: 0, 
    netTotal: totalPrice, 
    netTotalUSD: totalPriceUSD, 
    paymentType, 
    invoiceStatus: "in_progress" 
  }); 
  await invoice.save(); 
  return invoice; 
};

exports.createInvoiceForPOSMember = async (userId, orderItems, totalPrice, totalPriceUSD, paymentType = "instant") => { 
  const invoice = new Invoice({ 
    invoiceNumber: await generateInvoiceNumber(), 
    customerType: "member", 
    customer: userId,
    items: orderItems, 
    subTotal: totalPrice, 
    subTotalUSD: totalPriceUSD, 
    discountTotal: 0, 
    discountTotalUSD: 0, 
    vatRate: 0, 
    vatAmount: 0, 
      vatAmountUSD: 0, 
      netTotal: totalPrice, 
    netTotalUSD: totalPriceUSD, 
    paymentType, 
    invoiceStatus: "in_progress" 
  }); 
  await invoice.save(); 
  return invoice; 
};

exports.updateInvoiceFromBooking = async (booking) => {
  let invoice = await Invoice.findOne({ booking: booking._id });
  if (!invoice) {
    // If no invoice exists yet, create one
    return await exports.createInvoiceOnCheckIn(booking);
  }

  // Recalculate totals from booking
  invoice.subTotal = booking.totalPrice || 0;
  invoice.subTotalUSD = booking.totalPriceUSD || 0;
  invoice.netTotal = booking.totalPrice || 0;
  invoice.netTotalUSD = booking.totalPriceUSD || 0;

  await invoice.save();
  return invoice;
};

exports.finalizeInvoiceOnCheckout = async (bookingId) => { 
  const invoice = await Invoice.findOne({ booking: bookingId }); 
  if (!invoice) return null; 
  invoice.invoiceStatus = "paid";  
  invoice.finalizedAt = new Date();  
  await invoice.save(); return invoice; 
};


exports.resetDiscountAndVAT = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return null;

  // ✅ Clear discounts
  invoice.discounts = [];
  invoice.discountTotal = 0;
  invoice.discountTotalUSD = 0;

  // ✅ Clear VAT
  invoice.vatRate = 0;
  invoice.vatAmount = 0;
  invoice.vatAmountUSD = 0;

  // ✅ Reset net totals back to subtotal
  invoice.netTotal = invoice.subTotal;
  invoice.netTotalUSD = invoice.subTotalUSD;

  await invoice.save();
  return invoice;
};
