import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotel } from '../../context/HotelContext';
import { getBookingById, updateBookingStatus } from '../../api/bookingApi';
import preloader from '../../assets/preloader.gif'
import Button from '../../components/Button';
import { FiEdit } from "react-icons/fi";
import { IoArrowBackSharp } from "react-icons/io5";
import { RiPrinterLine } from "react-icons/ri";
import Swal from 'sweetalert2';
import { getInvoiceByBookingId, applyDiscount, applyVAT, resetInvoice, getInvoiceById, finalizeInvoice } from '../../api/invoiceApi';

const CheckoutPOS = () => {
  const { id } = useParams();
  const [invoice,setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hotel } = useHotel();
  const token = localStorage.getItem("adminToken");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountDescription, setDiscountDescription] = useState("");
  const [vatValue, setVatValue] = useState(0)

  const fetchInvoice = async () => {
    try {
      const res = await getInvoiceById( token, id );
      setInvoice(res.invoice);
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
    }
  };
  useEffect(() => {
    fetchInvoice();
  }, [id, token]);

  console.log("Invoice:", invoice);

  // const handleCheckOut = (bookingId) => {
  //     Swal.fire({
  //       title: 'Are you sure you want to check-out this guest?',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: 'green',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: 'Yes, check-out!'
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         try{
  //           const res =  await updateBookingStatus({
  //             token, 
  //             payload:{ bookingId: bookingId, newStatus: 'checked_out' }, 
  //           });
  //         }catch(error){
  //           Swal.fire('Error', 'Failed to check-out guest.', 'error');
  //         }
  //         Swal.fire(
  //           'Checked Out!',
  //           'The guest has been checked out successfully.',
  //           'success'
  //         );
  //       }
  //     });
  //   }

    const handleApplyDiscount = async (e) => {
      e.preventDefault();
      Swal.fire({
        title: 'Are you sure you want apply discount?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, apply discount!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try{
            const res =  await applyDiscount(token, invoice._id, discountType, discountValue, hotel.currency, discountDescription, "order");
            fetchInvoice();
          }catch(error){
            Swal.fire('Error', 'Failed to apply discount.', 'error');
          }
          Swal.fire(
            'Discount Applied!',
            'The discount has been applied successfully.',
            'success'
          );
        }
      });
    }

    const handleApplyVat = async (e) => {
      e.preventDefault();
      Swal.fire({
        title: 'Are you sure you want apply VAT?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, apply discount!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try{
            const res =  await applyVAT(token, invoice._id, vatValue);
            fetchInvoice();
          }catch(error){
            Swal.fire('Error', 'Failed to apply VAT.', 'error');
          }
          Swal.fire(
            'VAT Applied!',
            'The VAT has been applied successfully.',
            'success'
          );
        }
      });
    }
    const handleReset = async () => {
      Swal.fire({
        title: 'Are you sure you want reset invoice?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, apply reset!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try{
            const res =  await resetInvoice(token, invoice._id);
            fetchInvoice();
          }catch(error){
            Swal.fire('Error', 'Failed to reset.', 'error');
          }
          Swal.fire(
            'Invoice Reset!',
            'The invoice has been reset successfully.',
            'success'
          );
        }
      });
    }

    const handleCheckOut = () => {
      Swal.fire({
        title: 'Are you sure you want to finalize invoice?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, finalize invoice!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try{
            const res =  await finalizeInvoice(token, invoice._id);
            fetchInvoice();
          }catch(error){
            Swal.fire('Error', 'Failed to finalize invoice.', 'error');
          }
          Swal.fire(
            'Invoice Finalized!',
            'The invoice has been finalized successfully.',
            'success'
          );
        }
      });
    }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <img src={preloader} alt="Loading..." className="w-16" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-center text-red-500">Invoice not found.</p>;
  }


  return (
    <>
    <div className='bg-white p-6 border-b border-gray-300 flex justify-between items-center'>
      <div>
        <h1 className='px-2 py-1 text-2xl font-bold'>Guest Checkout</h1>
      </div>
      <div className='flex gap-2'>
        <Button 
              onClick={() =>handleReset()} 
              className="bg-red-600 text-white">
                Reset
            </Button>
        <Button 
            onClick={() =>handleCheckOut()} 
            className="bg-green-600 text-white">
              Confirm Checkout
          </Button>
      </div>
    </div>
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <div className="mx-auto">
            <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Folio Summary</h2>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-gray-300">
              <table className="w-full table-auto border-collapse overflow-x-scroll">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3 text-left font-bold text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Description</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Qty</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Unit Price</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">TOTAL</th>
                  </tr>
                </thead>
                <tbody className='bg-white'>
                    {invoice?.items?.length > 0 && invoice?.items?.map((item, index) => (
                      <tr key={index} className="border-t border-gray-300">
                        <td className="px-4 py-3">
                          {new Date(invoice?.invoiceDate).toLocaleDateString(
                            'en-US', { month: 'short', day: 'numeric' }
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{item.name}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {hotel?.currency === 'USD' ? `$${item.converted?.USD}` : `Rs. ${item.price}`}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          {hotel?.currency === 'USD' ? `$${(item.converted?.USD * item.quantity).toFixed(2)}` : `Rs. ${(item.price * item.quantity).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className='bg-white rounded-lg border border-gray-300 mt-6'>
              <div className='p-2'>
                <div className='flex justify-between items-center p-2'>
                  <p className='font-semibold text-gray-700'>Subtotal</p>
                  <p className='font-bold '>
                    {hotel?.currency === 'USD' ? `$${invoice?.subTotalUSD?.toFixed(2)}` : `Rs. ${invoice?.subTotal?.toFixed(2)}`}
                  </p>
                </div>
                {invoice?.discounts?.length > 0 && (
                  <div className=' p-2'>
                    <p className="font-semibold text-gray-700 text-sm mb-2">Applied Discounts</p>
                    <ul>
                      {invoice?.discounts?.map((discount) => (
                        <li key={discount._id} className='ms-1'>
                          {discount.type === 'percentage' ? (
                            <div className="flex justify-between items-center">
                              <p className='font-bold'>
                                {discount.description} ({discount.value}%)
                              </p>
                              <p className='font-bold text-blue-600'>-
                                {discount.currency === 'USD'
                                  ? `$${((invoice.subTotalUSD * discount.value) / 100).toFixed(2)}`
                                  : `Rs. ${((invoice.subTotal * discount.value) / 100).toFixed(2)}`}
                              </p>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <p className='font-bold'>{discount.description}</p>
                              <p className='font-bold text-blue-600'>-
                                {discount.currency === 'USD'
                                  ? `$${discount.value}`
                                  : `Rs. ${discount.value}`}
                              </p>
                            </div>
                          )}
                        </li>

                      ))}
                    </ul>
                  </div>
                )}
                {invoice?.vatRate !== 0 && (
                  <div className=' p-2'>
                    <div className="flex justify-between items-center">
                              <p className='font-bold'>
                                Applied VAT ({invoice?.vatRate}%)
                              </p>
                              <p className='font-bold text-blue-600'>+
                                {hotel.currency === 'USD'
                                  ? `$${invoice?.vatAmountUSD.toFixed(2)}`
                                  : `Rs. ${invoice?.vatAmount.toFixed(2)}`}
                              </p>
                            </div>
                  </div>
                )}
                <div className='flex justify-between items-center p-2 border-t border-gray-300'>
                  <p className='text-lg font-bold'>Grand Total</p>
                  <p className='font-bold text-lg  text-blue-600'>
                    {hotel?.currency === 'USD' ? `$${invoice?.netTotalUSD?.toFixed(2)}` : `Rs. ${invoice?.netTotal?.toFixed(2)}`} 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <form className="mx-auto bg-white rounded-xl border border-gray-300 p-6" onSubmit={handleApplyDiscount}>
            <h1 className="text-lg font-bold text-gray-800 mb-2">Discounts & Adjustments</h1>
              <div className='grid grid-cols-4 gap-2 mb-2'>
                <select 
                  name="" 
                  id=""
                  className='bg-gray-100 border col-span-1 border-gray-300 rounded-full px-2 py-2' 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">%</option>
                  <option value="flat">
                    {hotel?.currency === 'USD' ? '$' : 'Rs.'}
                  </option>
                </select>
                <input 
                  type="number" 
                  className='bg-gray-100 border col-span-3 border-gray-300 rounded-full px-2 py-2' 
                  placeholder='Value'
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>
              <textarea 
                name="" 
                id=""
                rows={2}
                className='bg-gray-100 border w-full border-gray-300 rounded-xl px-2 py-2 mb-2'
                placeholder='Reason for adjustment (Optional)'
                value={discountDescription}
                onChange={(e) => setDiscountDescription(e.target.value)}
              >
              </textarea>
            <Button 
              className="w-full text-white ">
                Apply Discount
            </Button>
          </form>
          <form className="mx-auto mt-6 bg-white rounded-xl border border-gray-300 p-6" onSubmit={handleApplyVat}>
            <h1 className="text-lg font-bold text-gray-800 mb-2">VAT</h1>
            <input 
                  type="number" 
                  className='bg-gray-100 border w-full border-gray-300 rounded-full px-2 py-2' 
                  placeholder='Value'
                  value={vatValue}
                  onChange={(e) => setVatValue(e.target.value)}
                />
              <Button 
                className="w-full text-white mt-2">
                  Apply VAT
              </Button>
          </form>
        </div>
      </div>

    </div>
    </>
  );
}

export default CheckoutPOS