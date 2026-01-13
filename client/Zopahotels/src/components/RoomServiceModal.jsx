import React from "react";
import { IoClose } from "react-icons/io5";
import { useHotel } from "../context/HotelContext";

const RoomServiceModal = ({ isOpen, onClose, order }) => {
  const {hotel} = useHotel();
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={24} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Room Service Receipt
        </h2>

        {/* order Info */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
          <p>
            <span className="font-medium">Room:</span> {order.roomNumber}
          </p>
          <p>
            <span className="font-medium">order Type:</span> {order.type}
          </p>
          
        </div>

        {/* Items */}
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Items</h3>
          <ul className="divide-y divide-gray-200">
            {order.items.map((i) => (
              <li key={i._id} className="py-2 flex justify-between">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>
                   {hotel.currency === "USD" ? (
                        `$ ${i.converted?.USD * i.quantity}`
                    ):(
                        `Rs. ${i.price * i.quantity}`
                    )}
                </span>
              </li>
            ))}
          </ul>
          <p className="flex justify-end gap-2 py-2 border-t border-gray-300">
            <span className="font-medium">Total Amount:</span> 

            {hotel.currency === "USD" ? (
                `$ ${order.converted?.USD.toFixed(2)}`
            ):(
                `Rs. ${order.amount}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomServiceModal;
