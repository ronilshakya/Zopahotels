import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHotel } from '../../api/hotelApi'
import { useEffect } from 'react'
import Button from '../../components/Button'

const BookingSource = () => {
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
          <>
            <p>hotel ecitis</p>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingSource