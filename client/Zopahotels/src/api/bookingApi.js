import axios from "axios";

const API_URL = "http://localhost:3000/api/booking";

export const searchAvailableRooms = async ({ checkIn, checkOut, adults, children }) => {
  try {
    const res = await axios.get(`${API_URL}/available`, {
      params: { checkIn, checkOut, adults, children },
    });

    return res.data;
  } catch (error) {
    console.error("Booking API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createBooking = async ({payload,token}) =>{
    try {
        const res = await axios.post(`${API_URL}/`, payload, {
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
      const res = await axios.get(`${API_URL}/`, {
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
    const res = await axios.get(`${API_URL}/me`, {
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
    const res = await axios.put(`${API_URL}/${id}`,payload, {
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
    const res = await axios.get(`${API_URL}/${id}`, {
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
    const res = await axios.delete(`${API_URL}/${id}`, {
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
  const res = await axios.get(`${API_URL}/get-report?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};