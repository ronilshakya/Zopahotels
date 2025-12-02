import React, { useEffect, useState } from "react";
import { getAllBookings } from "../../api/bookingApi";
import { getAllRooms } from "../../api/roomApi"; // Assume you have this API
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import preloader from '../../assets/preloader.gif';
import Chart from "react-apexcharts";

const AdminDashboard = () => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [latestBookings, setLatestBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const [monthlyStats, setMonthlyStats] = useState({ labels: [], data: [], revenue: [] });


  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const bookings = await getAllBookings(token);
        const rooms = await getAllRooms(token);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Arrivals
        const arrivalsToday = bookings.filter(
          (b) => new Date(b.checkIn).setHours(0,0,0,0) === today.getTime()
        );

        // Departures
        const departuresToday = bookings.filter(
          (b) => new Date(b.checkOut).setHours(0,0,0,0) === today.getTime()
        );

        // Available rooms
        const bookedRoomIds = bookings
          .filter(
            (b) =>
              new Date(b.checkIn) <= today &&
              new Date(b.checkOut) > today &&
              b.status !== "cancelled"
          )
          .flatMap((b) => b.rooms.map((r) => r.roomNumber + r.roomId));

        const totalRooms = rooms.flatMap((r) => r.rooms.map((rm) => rm.roomNumber + r._id));
        const availableRoomCount = totalRooms.filter((r) => !bookedRoomIds.includes(r)).length;

        // Latest bookings
        const sortedBookings = [...bookings].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setArrivals(arrivalsToday);
        setDepartures(departuresToday);
        setAvailableRooms(availableRoomCount);
        setLatestBookings(sortedBookings.slice(0, 5));

        // Create monthly bookings count for graph
        const monthlyData = {};
        bookings.forEach((b) => {
          const month = new Date(b.createdAt).toLocaleString("default", { month: "short" });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const monthlyRevenue = {};
        bookings.forEach((b) => {
          const month = new Date(b.createdAt).toLocaleString("default", { month: "short" });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.totalPrice || 0);
        });

        setMonthlyStats({
          labels: Object.keys(monthlyData),
          data: Object.values(monthlyData),
          revenue: Object.values(monthlyRevenue)
        });
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [token]);
  
  
  if (loading) return(
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600 text-lg"><img src={preloader} className="w-16" alt="preloader" /></p>
    </div>
  )
  
  const chartOptions = {
    chart: {
      id: "monthly-bookings",
      toolbar: { show: false },
    },
    xaxis: {
      categories: monthlyStats.labels,
    },
    yaxis: {
      min: 0,
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };
  
  console.log(arrivals)
  const chartSeries = [
    {
      name: "Bookings",
      data: monthlyStats.data,
    },
  ];

  const revenueChartOptions = {
    chart: {
      id: "monthly-revenue",
      toolbar: { show: false },
    },
    xaxis: {
      categories: monthlyStats.labels,
    },
    yaxis: {
      min: 0,
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };

  const revenueChartSeries = [
    {
      name: "Revenue ($)",
      data: monthlyStats.revenue || [],
    },
  ];


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Arrivals Today</p>
          <p className="text-2xl font-bold">{arrivals.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Departures Today</p>
          <p className="text-2xl font-bold">{departures.length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Available Rooms Today</p>
          <p className="text-2xl font-bold">{availableRooms}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Latest Bookings</p>
          <p className="text-2xl font-bold">{latestBookings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Revenue per Month</h2>
          <Chart options={revenueChartOptions} series={revenueChartSeries} type="line" height={300} />
        </div>

        {/* graph */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Bookings per Month</h2>
          <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />

        </div>
      </div>
      {/* <div className="grid grid-cols-2 mb-6">
        <div className="bg-white rounded-lg shadow p-4 mr-2">
          <h2 className="text-xl font-bold mb-4">Arrivals Today</h2>
          <ul className="list-disc list-inside">
            {arrivals.map((a) => (
              <li key={a._id} className="mb-2">
                {a.user?.name || "Deleted User"} - Rooms:{" "}
                {a.rooms.map((r) => `${r.roomId?.type}-${r.roomNumber}`).join(", ")}
              </li>
            ))}
            {arrivals.length === 0 && <p className="text-gray-600">No arrivals today.</p>}
          </ul>
        </div>
        </div> */}

      {/* Latest Bookings Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Latest Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left text-sm font-semibold">Guest</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Rooms</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Check-In</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Check-Out</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {latestBookings.map((b) => (
                <tr key={b._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{b.user?.name || "Deleted User"}</td>
                  {/* <td className="px-4 py-2">{b.rooms.map(r => `${r.roomId?.type}-${r.roomNumber}`).join(", ")}</td> */}
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    <ul className="flex flex-row md:flex-col flex-wrap gap-1 md:gap-0 w-[200px]">
                      {b.rooms.map((r, i) => (
                        <li key={i} className="mr-2">
                          {r.roomId?.type} - {r.roomNumber}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>
                  <td className="px-4 py-2">
                    <Button onClick={() => navigate(`/admin/edit-booking/${b._id}`)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
