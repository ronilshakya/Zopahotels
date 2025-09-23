import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { getHotel, deleteHotel } from '../../api/hotelApi'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { API_URL } from '../../config'


const Settings = () => {
  const [hotel, setHotel] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')

  const fetchHotel = async () => {
    try {
      const data = await getHotel()
      setHotel(data)
    } catch (error) {
      // Swal.fire('Error', error.message, 'error')
    }
  }

  useEffect(() => {
    fetchHotel()
  }, [])

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the hotel permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await deleteHotel(token)
        Swal.fire('Deleted!', 'Hotel deleted successfully.', 'success')
        setHotel(null)
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message, 'error')
      }
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Hotel Settings</h1>

      {!hotel ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8">
          <p className="text-gray-600 mb-4">No hotel details available.</p>
          <Button onClick={() => navigate('/admin/hotel-form/add')}>Add Hotel</Button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 flex-shrink-0">
              {hotel.logo ? (
                <img
                  src={`${API_URL}uploads/${hotel.logo}`}
                  alt="Hotel Logo"
                  className="w-full h-full object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                  <span className="text-gray-500 text-sm">No Logo</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{hotel.name}</h2>
              <p className="text-gray-600">{hotel.address}</p>
              <p className="text-gray-600">{hotel.phone}</p>
              <p className="text-gray-600">{hotel.email}</p>
            </div>
          </div>

          {hotel.description && (
            <div className="mt-4">
              <h3 className="font-semibold">Description</h3>
              <p className="text-gray-700">{hotel.description}</p>
            </div>
          )}
            <div className="mt-4">
              <h3 className="font-semibold">Currency</h3>
              <p className="text-gray-700">{hotel.currency}</p>
            </div>

          <div className="flex space-x-4 mt-6">
            <Button onClick={() => navigate('/admin/hotel-form/edit')}>Edit</Button>
            <Button onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
