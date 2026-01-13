import axios from "axios";
import { API_URL } from "../config";
const API_URL_EXTENDED = `${API_URL}api/cart`;

export const saveDraft = async (token ,bookingId,roomBookingEntryId, cart) => {
    const items = cart.map(item => ({ _id: item._id, quantity: item.quantity }));
    const res = await axios.post(`${API_URL_EXTENDED}/save-draft`, 
        { bookingId, roomBookingEntryId, items },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    ); 
    return res.data;
}

export const getCartByBookingAndRoom = async (token,bookingId,roomNumberId) =>{
    const res = await axios.get(`${API_URL_EXTENDED}/get-cart/${bookingId}/${roomNumberId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return res.data;
}

export const deleteDraftCart = async  (token,bookingId,roomNumberId) =>{
    const res = await axios.delete(`${API_URL_EXTENDED}/delete-cart/${bookingId}/${roomNumberId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return res.data;
}