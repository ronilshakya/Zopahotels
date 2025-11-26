import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { getHotel, deleteHotel } from '../../api/hotelApi'
import { useNavigate, Outlet } from 'react-router-dom'
import Swal from 'sweetalert2'
import { API_URL } from '../../config'
import HotelForm from './HotelForm'


const Settings = () => {
  const [hotel, setHotel] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')

  const fetchHotel = async () => {
      const data = await getHotel()
      setHotel(data)
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
    <div className="min-h-screen bg-gray-100 p-6">
    <div className="p-6 max-w-3xl mx-auto">

      {!hotel ? (
        <>
          <h1 className="text-2xl font-semibold mb-6">Hotel Settings</h1>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8">
          <p className="text-gray-600 mb-4">No hotel details available.</p>
          <Button onClick={() => navigate('/admin/hotel-form/add')}>Add Hotel</Button>
        </div>
        </>
      ) : (
        <HotelForm mode="edit" />
      )}
    </div>
    <Outlet />
    </div>
  )
}

export default Settings
