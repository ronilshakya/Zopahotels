import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getAllBookings } from "../../api/bookingApi";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useNavigate } from "react-router-dom";

const BookingCalendar = () => {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllBookings(token);
        const formatted = data.map((booking) => {
          let color = "gray";

          if (booking.status === "confirmed") color = "green";
          else if (booking.status === "pending") color = "orange";
          else if (booking.status === "cancelled") color = "red";

          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);

          return {
            id: booking._id,
            title: `${booking.user?.name || booking.guestFirstName + ' ' + booking.guestLastName} - ${
              booking.rooms.map((r) => r.roomNumber).join(", ")
            }`,
            start: checkIn,
            end: new Date(checkOut.getTime() + 24 * 60 * 60 * 1000), // exclusive for FullCalendar
            displayEnd: checkOut, // 👈 REAL checkout date
            allDay: true,
            color,
          };
        });


        setEvents(formatted);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <div className="p-6 min-h-screen bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Booking Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventDidMount={(info) => {
          const displayEnd = info.event.extendedProps.displayEnd;

          tippy(info.el, {
            content: `
              <strong>${info.event.title}</strong><br/>
              From: ${info.event.start.toDateString()}<br/>
              To: ${displayEnd.toDateString()}
            `,
            allowHTML: true,
          });
        }}

      eventClick={(info) => {
        // Go to edit page
        navigate(`/admin/edit-booking/${info.event.id}`);
      }}
      height="80vh"
      />
    </div>
  );
};

export default BookingCalendar;
