import axios from "axios";

const API_URL = "http://api1.hotelnutopia.com/api/rooms";

export const getRoomById = async (id)=>{
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export const getAllRooms = async () =>{
    try {
        const res = await axios.get(`${API_URL}`,{
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
        const res = await axios.post(API_URL, payload, {
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
    const res = await axios.put(`${API_URL}/${id}`, payload, config);
    return res.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};


export const deleteRoom = async (id, token) => {
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
};