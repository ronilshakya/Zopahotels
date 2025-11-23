import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/booking`;

export const searchAvailableRooms = async ({ checkIn, checkOut, adults, children }) => {
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/available`, {
      params: { checkIn, checkOut, adults, children },
    });

    return res.data;
  } catch (error) {
    console.error("Booking API Error:", error.response?.data || error.message);
    throw error;
  }
};
export const getAvailableRoomNumbers = async ({ roomId, checkIn, checkOut }) => {
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/available-room-numbers`, {
      params: { roomId, checkIn, checkOut },
    });

    return res.data;
  } catch (error) {
    console.error("Booking API Error:", error.response?.data || error.message);
    throw error;
  }
};
export const getAvailableRoomNumbersByDate = async ({ roomId, checkIn, checkOut }) => {
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/available-room-numbers-by-date`, {
      params: { roomId, checkIn, checkOut },
    });

    return res.data;
  } catch (error) {
    console.error("Booking API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createBooking = async ({payload,token}) =>{
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/`, payload, {
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}` 
           }
         });
        return res.data;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export const getAllBookings = async (token) =>{
  try {
      const res = await axios.get(`${API_URL_EXTENDED}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });
      return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
    
export const getMyBookings = async (token) =>{
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
export const updateBooking = async ({token,payload,id}) =>{
  try {
    const res = await axios.put(`${API_URL_EXTENDED}/${id}`,payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}
export const getBookingById = async (id, token) => {
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching booking by ID:", error.message);
    throw error;
  }
};
export const deleteBooking = async ({token,id}) =>{
  try {
    const res = await axios.delete(`${API_URL_EXTENDED}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const getReport = async ( from, to ) => {
  const token = localStorage.getItem("adminToken");
  const res = await axios.get(`${API_URL_EXTENDED}/get-report?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const createBookingAdmin = async ({ payload, token }) => {
  try {
    const res = await axios.post(`${API_URL_EXTENDED}/create-booking-admin`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};
