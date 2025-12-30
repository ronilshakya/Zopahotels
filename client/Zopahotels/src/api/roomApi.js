import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/rooms`;

export const getRoomById = async (id)=>{
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/${id}`);
        // console.log(res.data);
        return res.data;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export const getAllRooms = async () =>{
    try {
        const res = await axios.get(`${API_URL_EXTENDED}`,{
           headers: {
             "Content-Type": "application/json",
           }
         })
         return res.data;
        } catch (error) {
            console.log(error.message);
            throw error;    
    }
}
export const createRoom = async (payload, token) =>{
    try {
        const res = await axios.post(API_URL_EXTENDED, payload, {
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

export const updateRoom = async (id, payload, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", 
      },
    };
    const res = await axios.put(`${API_URL_EXTENDED}/${id}`, payload, config);
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};


export const deleteRoom = async (id, token) => {
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
};

export const updateRoomCleaningStatus = async (roomNumber, action, token) => {
  try{
    const res = await axios.put(`${API_URL_EXTENDED}/update-room-cleaning-status`, 
    { roomNumber, action },
    {
      headers: {  
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }catch(err){
    console.error(err);
    throw err;
  }
}