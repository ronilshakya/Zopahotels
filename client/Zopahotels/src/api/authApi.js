import axios from "axios";

const API_URL = "http://api1.hotelnutopia.com/api/users";

export const signup = async (payload) =>{
  try {
    const res = await axios.post(`${API_URL}/register`,payload);
    return res.data;
  } catch (error) {
    console.log("Signup error" + error.message);
    throw error;
  }
}

export const login = async ({ email, password }) => {
  try {
    const res = await axios.post(
      `${API_URL}/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = () =>{
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export const adminLogout = () =>{
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

export const getAllUsers = async (token) =>{
  try {
    const res = await axios.get(`${API_URL}?role=user`,{
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
export const getAllAdmins = async (token) =>{
  try {
    const res = await axios.get(`${API_URL}?role=admin`,{
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

export const updateUser = async (id,payload,token) =>{
  try {
    const res = await axios.put(`${API_URL}/${id}`,payload,{
      headers:{
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

export const deleteUser = async ({id,token}) =>{
  try {
    const res = await axios.delete(`${API_URL}/${id}`,{
      headers:{
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

export const getUserById = async (id,token) =>{
  try {
    const res = await axios.get(`${API_URL}/${id}`,{
      headers:{
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