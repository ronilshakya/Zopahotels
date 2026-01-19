import React, { useRef, useState } from "react";
import { getReport } from "../../api/bookingApi";
import Button from "../../components/Button";
import Swal from "sweetalert2";
import { useHotel } from "../../context/HotelContext";
import dayjs from 'dayjs'

const BookingReportsPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const {hotel} = useHotel();
  const token = localStorage.getItem("adminToken");

  const tableRef = useRef();

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      Swal.fire({
        title: "Please select both dates",
        icon: "error"
      })
      return;
    }
    setLoading(true);
    try {
      const data = await getReport(fromDate, toDate, token);
      setBookings(data.bookings);
      setSummary(data.summary);
    } catch (error) {
      Swal.fire({
        title: `Failed to fetch report: ${error}`,
        icon: "error"
      })
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = tableRef?.current?.innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Booking Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Report</h2>

        {/* Filters + Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 print:hidden">
          <div>
            <label className="block text-sm font-medium text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={fetchReport}>Generate</Button>
            <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
              Print
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-xl font-bold">{summary.totalBookings}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Confirmed</p>
              <p className="text-xl font-bold">{summary.confirmed}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-xl font-bold">{summary.pending}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Cancelled</p>
              <p className="text-xl font-bold">{summary.cancelled}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center col-span-2 md:col-span-1">
              <p className="text-gray-600 text-sm">Total Guests</p>
              <p className="text-xl font-bold">{summary.totalGuests}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center col-span-2 md:col-span-1">
              <p className="text-gray-600 text-sm">Revenue</p>
              <p className="text-xl font-bold">
                {
                  hotel.currency === "NPR" ? (
                    "Rs. " + summary.revenue
                  ):(
                    "$" + summary.revenueUSD
                  )                  
                }
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && bookings.length > 0 && (
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Guest</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Rooms</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Check-In</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Check-Out</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Nights</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Guests</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const nights = dayjs(b.checkOut).startOf("day").diff(dayjs(b.checkIn).startOf("day"), "day");
                  return (
                    <tr key={b._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{b.guestFirstName + " " + b.guestLastName || "Deleted User"}</td>
                      <td className="px-4 py-2 text-gray-600 text-sm">
                    <ul className="flex flex-row md:flex-col flex-wrap gap-1 md:gap-0 w-[200px]">
                      {b.rooms.map((r, i) => (
                        <li key={i} className="mr-2">
                          {r.roomId?.type} - {r.roomNumber}
                        </li>
                      ))}
                    </ul>
                  </td>
                      <td className="px-4 py-2 text-sm">{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{nights}</td>
                      <td className="px-4 py-2 text-sm">
                        <ul>
                        {b.rooms.map((r, i) => (
                        <li key={i} className="mr-2">
                          {r.adults} Adults, {r.children} Children
                        </li>
                      ))}
                      </ul>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {
                          hotel.currency === "NPR" ? (
                            "Rs. " + b.totalPrice
                          ):(
                            "$" + b?.totalPriceUSD?.toFixed(2)
                          )                  
                        }
                      </td>
                      <td className="px-4 py-2 text-sm capitalize">{b.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {loading && <p className="text-gray-600 mt-4">Loading report...</p>}
        {!loading && bookings.length === 0 && summary && (
          <p className="text-gray-600 mt-4">No bookings found for this period.</p>
        )}
      </div>
    </div>
  );
};

export default BookingReportsPage;
