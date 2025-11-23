// src/context/HotelContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getHotel } from "../api/hotelApi";
import Swal from "sweetalert2";

const HotelContext = createContext();

export const useHotel = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
        const data = await getHotel();
        setHotel(data);
    };

    fetchHotel();
  }, []);

  return (
    <HotelContext.Provider value={{ hotel, setHotel, loading }}>
      {children}
    </HotelContext.Provider>
  );
};
