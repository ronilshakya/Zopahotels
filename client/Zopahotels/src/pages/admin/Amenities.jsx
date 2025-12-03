import React, { useState, useEffect } from "react";
import { addAmenity, getAmenities, updateAmenity, deleteAmenity } from "../../api/hotelApi";
import Swal from "sweetalert2";
import { API_URL } from "../../config";

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const token = localStorage.getItem("adminToken");

  // Fetch amenities
  const fetchAmenities = async () => {
    try {
      const data = await getAmenities(token);
      setAmenities(data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch amenities", "error");
    }
  };

  useEffect(() => {
    fetchAmenities();
    
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  // During add, both name and icon are required
  if (!name || (!icon && editIndex === null)) {
    Swal.fire("Error", "Name and icon are required", "error");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    if (editIndex !== null) {
      // Update existing amenity
      const amenityId = amenities[editIndex]._id;
      formData.append("newName", name); // matches backend

      if (icon) {
        formData.append("icon", icon); // optional: only if a new file is selected
      }

      await updateAmenity(amenityId, formData, token);
      Swal.fire("Success", "Amenity updated", "success");
    } else {
      // Add new amenity
      formData.append("name", name);
      formData.append("icon", icon);

      await addAmenity(formData, token);
      Swal.fire("Success", "Amenity added", "success");
    }

    setName("");
    setIcon(null);
    setEditIndex(null);
    fetchAmenities();
  } catch (err) {
    Swal.fire("Error", err.response?.data?.message || err.message, "error");
  } finally {
    setLoading(false);
  }
};

const handleEdit = (index) => {
  setName(amenities[index].name);
  setIcon(null); // icon is optional; leave null to keep existing
  setEditIndex(index);
};


  const handleDelete = async (index) => {
    const amenityId = amenities[index]._id;
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the amenity permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteAmenity(amenityId, token);
        Swal.fire("Deleted!", "Amenity has been deleted.", "success");
        fetchAmenities();
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Amenity Management</h1>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amenity Name"
              className="flex-1 px-3 py-2 border rounded-md"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIcon(e.target.files[0])}
              className="px-2 py-2 border rounded-md"
              {...(editIndex === null ? { required: true } : {})}
            />
            {icon && (
              <img
                src={URL.createObjectURL(icon)}
                alt="preview"
                className="h-12 w-12 object-cover rounded-md"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editIndex !== null ? (loading ? "Updating..." : "Update") : (loading ? "Adding..." : "Add")}
            </button>
            {editIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditIndex(null);
                  setName("");
                  setIcon(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
        </form>

        {/* Amenities Table */}
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-3 text-left font-semibold text-sm">#</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Icon</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {amenities.map((amenity, index) => (
              <tr key={amenity._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-3 text-gray-600 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  <img
                    src={`${API_URL}uploads/amenities/${amenity.icon}`}
                    alt={amenity.name}
                    className="h-10 w-10 object-cover mx-auto rounded-md"
                  />
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">{amenity.name}</td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {amenities.length === 0 && (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                  No amenities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Amenities;
