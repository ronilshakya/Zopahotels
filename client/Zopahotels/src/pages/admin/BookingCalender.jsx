import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { getAllBookings } from "../../api/bookingApi";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useNavigate } from "react-router-dom";

const normalizeTime = (iso, fallbackHour) => {
  const date = new Date(iso);
  if (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0
  ) {
    date.setHours(fallbackHour, 0, 0, 0);
  }

  return date;
};


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

          return {
            id: booking._id,
            title: `${booking.user?.name || booking.guestFirstName + " " + booking.guestLastName} - ${
              booking.rooms.map((r) => r.roomNumber).join(", ")
            }`,
            start: normalizeTime(booking.checkIn, 13), // 1 PM
            end: normalizeTime(booking.checkOut, 12),  // 12 PM
   
            allDay: false,            
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
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay"
      }}
      timeZone="local"
      events={events}
      displayEventTime={false}
      height="80vh"
      eventDisplay="block"
      eventDidMount={(info) => {
        tippy(info.el, {
          content: `
            <strong>${info.event.title}</strong><br/>
            Check-in: ${info.event.start.toLocaleString()}<br/>
            Check-out: ${info.event.end.toLocaleString()}
          `,
          allowHTML: true,
        });
      }}
      eventClick={(info) => {
        navigate(`/admin/edit-booking/${info.event.id}`);
      }}
    />


    </div>
  );
};

export default BookingCalendar;
