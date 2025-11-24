import React from "react";
import { Outlet } from "react-router-dom"; // For nested routes
import Sidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen">
      <Sidebar /> 
      <div className="flex-1 flex flex-col md:ml-64 max-md:mt-20"> {/* Add md:ml-64 to offset sidebar */}
        <main className="">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};


export default AdminLayout;
