import React, { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoiceById } from '../../api/invoiceApi';
import { useEffect } from 'react';
import {useHotel} from '../../context/HotelContext';
import { useState } from 'react';

const InvoiceDetail = () => {
    const {id} = useParams();
    const token = localStorage.getItem('adminToken'); 
    const {hotel} = useHotel();
    const [invoice, setInvoice] = useState([]);
    const navigate = useNavigate();
    const printRef = useRef();
    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await getInvoiceById(token, id);
                setInvoice(data.invoice);
            } catch (error) {
                console.error("Error fetching invoice:", error);
            }
        };

        fetchInvoice();
    }, [id]);


  return (
    <>
      <div className='bg-white py-4 px-6 border-b flex justify-between items-center border-gray-300'>
        <div>
          <h1 className='px-2 py-1 text-2xl font-bold'>Invoice Details</h1>
          <p className='px-2 py-1 text-sm text-gray-500'>Manage and view invoice</p>
        </div>
        <div>
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
            onClick={() => {
              invoice.booking ?
              navigate(`/admin/check-out-page/${invoice.booking._id}`)
              : 
              navigate(`/admin/checkout-pos/${invoice._id}`)
            }}
          >
            Edit
          </button>
          <button
            type="submit"
            className="p-2 bg-green-600 ms-2 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 cursor-pointer"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
      </div>

      <div className="min-h-screen bg-gray-100 p-4">
        <div ref={printRef} className="print-area mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
          <div className='grid grid-cols-1 md:grid-cols-2 border-b border-gray-300'>
            <div className='p-5 '>
              <h1 className='text-3xl text-blue-600 font-semibold mb-2'>{hotel?.name}</h1>
              <p className='text-sm  text-gray-600'>{hotel?.address}</p>
              <p className='text-sm  text-gray-600'>{hotel?.phone} | {hotel?.email}</p>
            </div>
            <div className='flex flex-col items-end p-5'>
              <span className='bg-green-100 text-sm p-1 text-green-700 font-semibold px-2 py-1 rounded-full'>{invoice?.invoiceStatus}</span>
              <h1 className='font-bold text-2xl'>INVOICE #{invoice?.invoiceNumber}</h1>
              <p className='text-sm  text-gray-600'>Issued: {new Date(invoice?.invoiceDate).toLocaleDateString(
                'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
              )}</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2'>
            <div className='p-5  border-e border-gray-300'>
              {invoice.booking && (
                <>
                  <h1 className='font-semibold text-gray-600 text-xs mb-4'>GUEST DETAILS</h1>
                  <h1 className='font-semibold text-xl mb-2'>{invoice?.booking?.guestFirstName} {invoice?.booking?.guestLastName}</h1>
                  <p className='text-sm  text-gray-600'>{invoice?.booking?.guestEmail}</p>
                  <p className='text-sm  text-gray-600'>{invoice?.booking?.guestPhone}</p>
                  <p className='text-sm  text-gray-600'>{invoice?.booking?.guestAddress}, {invoice?.booking?.guestCity}, {invoice?.booking?.guestCountry}</p>              
                </>
              )}
              {invoice.customer && (
                <>
                  <h1 className='font-semibold text-gray-600 text-xs mb-4'>GUEST DETAILS</h1>
                  <h1 className='font-semibold text-xl mb-2'>{invoice?.customer?.name}</h1>
                  <p className='text-sm  text-gray-600'>{invoice?.customer?.email}</p>
                  <p className='text-sm  text-gray-600'>{invoice?.customer?.phone}</p>
                  <p className='text-sm  text-gray-600'>{invoice?.customer?.address}, {invoice?.customer?.city}, {invoice?.customer?.country}</p>              
                </>
              )}
            </div>
            <div className='p-5'>
              {invoice?.booking && (
                <>
                <h1 className='font-semibold text-gray-600 text-xs mb-4'>STAY INFORMATION</h1>
                <div className='grid grid-cols-2 mb-4'>
                    <div>
                      <h1 className='text-sm  text-gray-600'>Booking ID</h1>
                      <p className='font-semibold'>{invoice?.booking?.bookingId}</p>
                    </div>
                    <div>
                      <h1 className='text-sm  text-gray-600'>Room Type</h1>
                      <ul className='font-semibold'>
                        {[...new Set(invoice?.booking?.rooms.map(room => room.roomType))].map((type, idx) => ( <li key={idx}>{type}</li> ))}
                      </ul>
                    </div>
                </div>
                <div className='grid grid-cols-2'>
                    <div>
                      <h1 className='text-sm  text-gray-600'>Check-in</h1>
                      <p className='font-semibold'>{new Date(invoice?.booking?.checkIn).toLocaleDateString(
                        'en-US', { year: 'numeric', month: 'short', day: 'numeric' }
                      )}</p>
                    </div>
                    <div>
                      <h1 className='text-sm  text-gray-600'>Check-out</h1>
                      <p className='font-semibold'>{new Date(invoice?.booking?.checkOut).toLocaleDateString(
                        'en-US', { year: 'numeric', month: 'short', day: 'numeric' }
                      )}</p>
                    </div>
                </div>

                </>
              )}
            </div>
          </div>
          <table className="w-full border border-gray-300 table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-sm">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Unit Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                  {invoice.booking?.rooms.map((room, index) => (
                    <tr key={index} className="border-t border-gray-300">
                      <td className="px-4 py-3">{room.roomType} - Room {room.roomNumber}</td>
                      <td className="px-4 py-3">{new Date(invoice?.booking?.checkIn).toLocaleDateString(
                        'en-US', { year: 'numeric', month: 'short', day: 'numeric' }
                      )}</td>
                      <td className="px-4 py-3">{room.nights}</td>
                      <td className="px-4 py-3">
                        {hotel?.currency === 'USD' ? `$${room.basePriceUSD}` : `Rs. ${room.basePrice}`}
                      </td>
                      <td className="px-4 py-3 font-bold">{hotel?.currency === 'USD' ? `$${room.converted?.USD}` : `Rs. ${room.price}`}</td>
                    </tr>
                  ))}
                  {invoice?.items?.length > 0 && invoice?.items?.map((item, index) => (
                    <tr key={index} className="border-t border-gray-300">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{new Date(invoice?.invoiceDate).toLocaleDateString(
                        'en-US', { year: 'numeric', month: 'short', day: 'numeric' }
                      )}</td>
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
                  <div className="grid grid-cols-2">
            <div></div>
            <div className='mt-6'>
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
                                {hotel?.currency === 'USD'
                                  ? `$${invoice?.vatAmountUSD?.toFixed(2)}`
                                  : `Rs. ${invoice?.vatAmount?.toFixed(2)}`}
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

      </div>
      </>
  )
}

export default InvoiceDetail