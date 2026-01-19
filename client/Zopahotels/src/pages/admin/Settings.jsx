import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { getHotel } from '../../api/hotelApi'
import { useNavigate, Outlet } from 'react-router-dom'
import Swal from 'sweetalert2'
import { API_URL } from '../../config'
import HotelForm from './HotelForm'


const Settings = () => {
  const [hotel, setHotel] = useState(null)
  const navigate = useNavigate()

  const fetchHotel = async () => {
      const data = await getHotel()
      setHotel(data)
  }

  useEffect(() => {
    fetchHotel()
  }, [])


  return (
    <>
      <div className="min-h-screen bg-gray-100 ">
      <div className="">

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
    </>
  )
}

export default Settings
