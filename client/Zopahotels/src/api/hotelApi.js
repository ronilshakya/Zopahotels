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
        try {
          const res = await axios.get(`${API_URL_EXTENDED}/`, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          return res.data;
        } catch (error) {
          console.log(error.message);
          throw error;
        }
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