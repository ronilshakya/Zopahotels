import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/pos`;

export const getCategories = async (token) =>{
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/get-categories`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addCategory = async (token, name, description) =>{
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/create-category`,
            {name,description},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateCategory = async (token, id, name,description) =>{
    try {
        const res = await axios.put(`${API_URL_EXTENDED}/update-category/${id}`,
            {name,description},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteCategory = async (token,id) =>{
    try {
        const res = await axios.delete(`${API_URL_EXTENDED}/delete-category/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getSubCategory = async (token, categoryId) =>{
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/get-sub-categories/${categoryId}`,            
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addSubCategory = async (token,name,categoryId,description) =>{
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/create-sub-category`,      
            {name,categoryId,description}
            ,      
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return res.data;
    } catch (error) {
         console.log(error);
        throw error;
    }
}

export const updateSubCategory = async (token, id, name,category,description) =>{
    try {
        const res = await axios.put(`${API_URL_EXTENDED}/update-sub-category/${id}`,
            {name,category,description},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteSubCategory = async (token,id) =>{
    try {
        const res = await axios.delete(`${API_URL_EXTENDED}/delete-sub-category/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getItems = async (token,subCategoryId) =>{
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/get-items/${subCategoryId}`,      
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return res.data;
    } catch (error) {
         console.log(error);
        throw error;
    }
}

export const addItem = async (token, { name, price, subcategoryId, description, image }) =>{
    try {
        const formData = new FormData();
        formData.append("name", name); 
        formData.append("price", price); 
        formData.append("subcategoryId", subcategoryId); 
        if (description) formData.append("description", description); 
        if (image) formData.append("image", image);

        const res = await axios.post(`${API_URL_EXTENDED}/create-item`,      
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            return res.data;
    } catch (error) {
         console.log(error);
        throw error;
    }
}

export const deleteItem = async (token,id) =>{
    try {
        const res = await axios.delete(`${API_URL_EXTENDED}/delete-item/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateItem = async (token, id, {name, price, subcategory, description,image}) =>{
    try {
        const formData = new FormData(); 
        if (name) formData.append("name", name); 
        if (price) formData.append("price", price); 
        if (description) formData.append("description", description); 
        if (subcategory) formData.append("subcategory", subcategory); 
        if (image) formData.append("image", image);

        const res = await axios.put(`${API_URL_EXTENDED}/update-item/${id}`,
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
        console.log(error);
        throw error;
    }
}

export const searchItems = async (token, query = '', page = 1, limit = 10) =>{
    try { 
        const res = await axios.get(`${API_URL_EXTENDED}/search-items`,{ 
            params: { q: query, page, limit },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }); 
        return res.data;
    } catch (err) { 
        console.error("Error fetching food items:", err); 
    }
}

export const createPOS = async (token,bookingId, roomBookingEntryId, items, paymentType, paymentMethod) =>{
    const res = await axios.post(`${API_URL_EXTENDED}/create-pos`,
       {bookingId, roomBookingEntryId, items, paymentType, paymentMethod},
       { 
           headers: {
               Authorization: `Bearer ${token}`,
           },
       }); 
       return res.data;
}

export const createPOSWalkIn = async (token, items) =>{
    const res = await axios.post(`${API_URL_EXTENDED}/create-pos-walkin`,
       { items },
         {
              headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
         return res.data;
}

export const createPOSMember = async (token,userId, items) =>{
    const res = await axios.post(`${API_URL_EXTENDED}/create-pos-member`,
       { userId, items },
         {
              headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
         return res.data;
}

export const getPOSOrders = async (
    token,
  type = "all",
  search = "",
  page = 1,
  limit = 10
) =>{
    const res = await axios.get(`${API_URL_EXTENDED}/get-pos-walkin?type=${type}&search=${search}&page=${page}&limit=${limit}`,
         {
              headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
         return res.data;
}

export const getPOSOrderById = async (token, orderId) => {
    const res = await axios.get(`${API_URL_EXTENDED}/get-pos-order/${orderId}`,
         {
              headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
         return res.data;
}

export const getPOSOrderByUserId = async (token, userId) => {
    const res = await axios.get(`${API_URL_EXTENDED}/get-pos-order-by-user/${userId}`,
         {
              headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
         return res.data;
}