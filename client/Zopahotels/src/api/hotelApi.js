import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/hotel`;

export const createHotel = async (payload,token) =>{
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/`, payload, {
           headers: {
             "Content-Type": "multipart/form-data",
             Authorization: `Bearer ${token}` 
            }
          });
          return res.data;
        } catch (error) {
          console.log(error.message);
          throw error;
        }
      }
      
      export const getHotel = async () =>{
          const res = await axios.get(`${API_URL_EXTENDED}/`, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          return res.data;
      }
      
      export const updateHotel = async (payload,token) =>{
        try {
          const res = await axios.put(`${API_URL_EXTENDED}/`,payload, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}` 
            }
          });
            return res.data;
        } catch (error) {
          console.log(error.message);
          throw error;
        }
      }
      
      export const deleteHotel = async (token) =>{
        try {
          const res = await axios.delete(`${API_URL_EXTENDED}/`, {
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

export const addAmenity = async (formData, token) => {
  try {
    const res = await axios.post(
      `${API_URL_EXTENDED}/amenities`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const getAmenities = async (token) => {
  try {
    const res = await axios.get(`${API_URL_EXTENDED}/amenities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// Update Amenity
export const updateAmenity = async (id, formData, token) => {
  try {
    const res = await axios.put(`${API_URL_EXTENDED}/amenities/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// Delete Amenity
export const deleteAmenity = async (name, token) => {
  try {
    const res = await axios.delete(`${API_URL_EXTENDED}/amenities/${name}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};