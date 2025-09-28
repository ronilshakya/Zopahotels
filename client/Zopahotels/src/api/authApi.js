import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/users`;

export const signup = async (payload) =>{
  try {
    const res = await axios.post(`${API_URL_EXTENDED}/register`,payload);
    return res.data;
  } catch (error) {
    console.log("Signup error" + error.message);
    throw error;
  }
}

export const login = async ({ email, password, turnstileToken }) => {
  try {
    const res = await axios.post(
      `${API_URL_EXTENDED}/login`,
      { email, password,turnstileToken },
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
    const res = await axios.get(`${API_URL_EXTENDED}?role=user`,{
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
    const res = await axios.get(`${API_URL_EXTENDED}?role=admin`,{
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
    const res = await axios.put(`${API_URL_EXTENDED}/${id}`,payload,{
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
    const res = await axios.delete(`${API_URL_EXTENDED}/${id}`,{
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
    const res = await axios.get(`${API_URL_EXTENDED}/${id}`,{
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

export const registerAdmin = async (payload,token) =>{
  try {
    const res = await axios.post(`${API_URL_EXTENDED}/register-admin`,payload,
      {headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      }});
    return res.data;
  } catch (error) {
    console.log("Signup error" + error.message);
    throw error;
  }
}