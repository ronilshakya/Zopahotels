import React from "react";
import { Outlet } from "react-router-dom"; // For nested routes
import Navbar from "../components/Navbar";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
      <Navbar /> 
        <main className="mt-16">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
