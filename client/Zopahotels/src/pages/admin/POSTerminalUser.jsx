import React, { useCallback, useEffect, useState,useRef } from 'react'
import { useParams } from 'react-router-dom';
import { checkedInBookings, getBookingById } from '../../api/bookingApi';
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import Button from '../../components/Button';
import { IoSearch } from "react-icons/io5";
import { 
    createPOS,
    createPOSMember,
    createPOSWalkIn,
    getPOSOrderByUserId,
    getPOSOrders,
    searchItems 
} from '../../api/posApi';
import { deleteDraftCart, getCartByBookingAndRoom, saveDraft } from '../../api/cartApi';
import { API_URL } from '../../config';
import preloader from '../../assets/preloader.gif'
import placeholder from '../../assets/placeholder.png'
import { IoSearchSharp } from "react-icons/io5";
import { BsArrowRight } from "react-icons/bs";
import { FaCartShopping } from "react-icons/fa6";
import { RiDraftLine } from "react-icons/ri";
import { IoBedOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import { FaTrashAlt } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import RoomServiceModal from '../../components/RoomServiceModal';
import {useHotel} from '../../context/HotelContext';
import { FaUserPlus } from "react-icons/fa";
import { FaBed } from "react-icons/fa6";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getUserById, searchUsers } from '../../api/authApi';

const POSTerminal = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("new-order");
    const token = localStorage.getItem("adminToken");
    const [activeCategory, setActiveCategory] = useState("All Items");
    const [items, setItems] = useState([]); 
    const [query, setQuery] = useState(""); 
    const [page, setPage] = useState(1); 
    const [limit] = useState(10); 
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [cartStatus, setCartStatus] = useState(null);
    const [foodImageLoading, setFoodImageLoading] = useState(false)
    const [orderHistory, setOrderHistory] = useState([])


    const {hotel} = useHotel();
    const navigate = useNavigate();

    // for modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUser= async () =>{
        try {
            setLoading(true);
            const res = await getUserById(userId,token);
            setUser(res);
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false);
        }
    }

    const fetchFoodItems= async () =>{
        try {
            setFoodImageLoading(true);
            const res = await searchItems(token,query,page,limit);
            setItems(res.items);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.log(error)
        } finally {
            setFoodImageLoading(false)
        }
    }

    const fetchPos = async () =>{
        try {
            const res = await getPOSOrderByUserId(token, userId);
            setOrderHistory(res.order);
        } catch (error) {
            console.log(error)
        }
    }
    console.log(orderHistory);
    

    useEffect(()=>{
        fetchFoodItems();
    },[query, page])

    useEffect(()=>{
        fetchUser();
        fetchPos();
    },[])


    const tabs = [ 
            { id: "new-order", label: "New Order" }, 
            { id: "order-history", label: "Order History" } 
        ];

    const categories = ["All Items", ...new Set(items.map(item => item.subcategory?.category?.name) )];

    const filteredItems = activeCategory === "All Items" 
        ? items : 
        items.filter(item => item.subcategory.category.name === activeCategory);

    const handleAddToCart = (item) =>{
        setCart((prev) => {
            const existing = prev.find((i) => i._id === item._id);
            if(existing){
                return prev.map((i)=> i._id === item._id ? {...i,quantity: i.quantity + 1} : i)
            }
            return [...prev,{ ...item, quantity: 1 }]
        })
    }

    const handleRemove = (itemId) =>{
        setCart((prev) => prev.filter((i) => i._id !== itemId));
    }

    const totalPrice = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        return hotel.currency === "USD"
            ? sum + item.converted.USD * item.quantity
            : sum + item.price * item.quantity;
        }, 0)
    : 0;

    const handleUpdateQuantity = (itemId, newQty) => { setCart((prevCart) => prevCart.map((i) => i._id === itemId ? { ...i, quantity: newQty } : i ) ); };

    const handleMemberPOSOrder = async () =>{
        const transformCartToOrderItems = (cart) => { 
                return cart.map(i => ({ 
                    item: i._id,  
                    quantity: i.quantity, 
                    price: i.price 
                })); 
            };
            Swal.fire({ 
                title: "Confirm Instant Member Order", 
                text: "Are you sure you want to post this order?", 
                icon: "warning", 
                showCancelButton: true, 
                confirmButtonColor: "#3085d6", 
                cancelButtonColor: "#d33", 
                confirmButtonText: "Yes, post it!" 
            }).then(async (result) => { 
                if (result.isConfirmed) { 
                    try {
                        const res = await createPOSMember(token,user._id,transformCartToOrderItems(cart))
                        Swal.fire({ 
                            position: "top-end", 
                            icon: "success", 
                            title: "Instant Member Order Executed",
                            showConfirmButton: false, 
                            timer: 1500 
                        });
                        setCart([]); 
                        setCartStatus(null);
                        navigate(`/admin/checkout-pos/${res.invoice._id}`);
                    } catch (err) {
                        Swal.fire("Error", err.response?.data?.message || err.message, "error");
                        console.log(err)
                    }
                }
            })
    }

  return (
     <>
        <div className='bg-white p-4 border-b border-gray-300'>
            <h1 className='px-2 py-1 text-2xl font-bold'>POS Terminal</h1>
            {/* <p className='px-2 py-1 text-sm text-gray-500'>Room Number</p> */}
        </div>
        <div className="min-h-screen bg-gray-100 p-4">
            <div className='grid grid-cols-12 gap-6'>
                <div className="col-span-12 md:col-span-8">
                    <div className="mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
                       
                            {/* Booking Details */}
                                <div className='grid grid-cols-1 md:grid-cols-3 border-b border-gray-300 py-4'>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <FaUserAlt className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>FULL NAME</h1>
                                            <h1 className=' font-semibold'>
                                                {user?.name}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <MdOutlineDateRange className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>EMAIL</h1>
                                            <span className='font-semibold'>
                                                {user?.email}
                                            </span>

                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <FaStar className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>ADDRESS</h1>
                                            <span className='font-semibold '>
                                                {user?.address || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                        <div className='mt-4'>
                            <div className='flex  border-b border-gray-300'>
                                {tabs.map((tab)=>(
                                    <button 
                                        key={tab.id}
                                        onClick={()=> setActiveTab(tab.id)}
                                        className={`p-2 cursor-pointer ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600":""}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className='py-5'>
                                {activeTab === "new-order" && (
                                    <div>
                                        <div className='flex items-center border border-gray-300 rounded-xl w-full px-4 py-2 gap-2'>
                                                <IoSearchSharp size={20}/>
                                                <input
                                                    type="text"
                                                    placeholder="Search food items"
                                                    className="grow focus:outline-0"
                                                    onChange={(e)=>{
                                                        setQuery(e.target.value);
                                                        setPage(1);
                                                    }}
                                                />
                                        </div>
                                        <div className='flex gap-2 py-5'>
                                            {categories.map(category=>(
                                                <button 
                                                    key={category} 
                                                    className={`py-2 px-3 text-sm cursor-pointer border border-gray-300 rounded-xl ${activeCategory === category ? "bg-blue-600 text-white":""}`}
                                                    onClick={()=>setActiveCategory(category)}
                                                >
                                                    {category}
                                                </button>
                                            ))
                                            }
                                        </div>
                                        
                                            {
                                                loading ? (
                                                    <div className='flex justify-center items-center'>
                                                        <img
                                                          src={preloader}
                                                          className="w-full h-32 object-contain rounded-lg m-4 animate-pulse"
                                                          alt="loading"
                                                        />
                                                    </div>
                                                ):(
                                                    <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                                                        {filteredItems.map((item)=>(
                                                            <div key={item._id} className='border border-gray-300 rounded-xl overflow-hidden'>
                                                                {item.image ? (
                                                                    foodImageLoading ? (
                                                                        <img src={preloader} className='h-40 w-full object-cover' alt='preloader'/>
                                                                    ):(
                                                                        <img src={`${API_URL}uploads/pos-items/${item.image}`} className='h-40 w-full object-cover' alt="food" />
                                                                    )
                                                                ):(
                                                                     foodImageLoading ? (
                                                                        <img src={preloader} className='h-40 w-full object-cover' alt='preloader'/>
                                                                    ):(
                                                                    <img src={placeholder} className='h-40 w-full object-cover' alt="foodpl" />       
                                                                    )                                                             
                                                                )}
                                                                <div className='p-4'>
                                                                    <h1 className='text-lg font-semibold mb-1'>{item.name}</h1>
                                                                    <h1 className='font-semibold text-blue-600 mb-2'>
                                                                        {hotel.currency === "USD" ? (
                                                                            `$ ${item.converted.USD}`
                                                                        ):(
                                                                            `Rs. ${item.price}`
                                                                        )}
                                                                    </h1>
                                                                    <Button className="w-full cursor-pointer" onClick={() => handleAddToCart(item)}>Add to Order</Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )                                                
                                            }
                                        <div className="flex justify-center gap-2 mt-4"> 
                                            {/* <button 
                                                disabled={page === 1} 
                                                onClick={() => setPage(p => p - 1)} 
                                                className="px-3 py-1 border rounded disabled:opacity-50"
                                            > 
                                                Prev 
                                            </button>  */}
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => ( 
                                                <button 
                                                    key={num} 
                                                    onClick={() => setPage(num)} 
                                                    className={`px-3 py-1 border rounded ${ page === num ? "bg-blue-600 text-white" : "hover:bg-blue-100" }`} 
                                                > 
                                                    {num} 
                                                </button> 
                                            ))}
                                            {/* <button 
                                                disabled={page === totalPages} 
                                                onClick={() => setPage(p => p + 1)} 
                                                className="px-3 py-1 border rounded disabled:opacity-50" 
                                            > 
                                                Next 
                                            </button>  */}
                                        </div>
                                        
                                    </div>
                                )}
                                {activeTab === "order-history" && (
                                    <div>
                                        {orderHistory.length < 0 ? (
                                            <p>No Orders found</p>
                                        ):(
                                            <div>
                                                    <h2 className="text-md font-semibold mb-2">Walk-In Orders</h2>
                                                    <table className="w-full border border-gray-300 table-auto border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-200 text-gray-700">
                                                        <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                                                        <th className="px-4 py-3 text-left font-semibold text-sm">Items</th>
                                                        <th className="px-4 py-3 text-left font-semibold text-sm">Total Amount</th>
                                                        <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderHistory
                                                        .map(order => (
                                                            <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                                {new Date(order.createdAt).toLocaleString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "numeric",
                                                                minute: "numeric",
                                                                second: "numeric",
                                                                hour12: true
                                                                })}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                                {order.items.length > 0 && (
                                                                <p>
                                                                    {order.items
                                                                    .map(i => i.item?.name || i.name)
                                                                    .slice(0, 3)
                                                                    .join(", ")}
                                                                    {order.items.length > 3 && " ..."}
                                                                </p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                                {hotel.currency === "USD"
                                                                ? `$ ${order.totalPriceUSD.toFixed(2)}`
                                                                : `Rs. ${order.totalPrice}`}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                                <button 
                                                                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-200"
                                                                    onClick={()=>{ navigate(`/admin/checkout-pos/${order.invoice}`) }}
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    </table>
                                                </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* cart */}
                <div className="col-span-12 md:col-span-4">
                    <div className="sticky top-4 mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
                        <div className='border-b border-gray-300 py-5'>
                            <div className='flex justify-between items-center'>
                                <div className='flex gap-3 mb-2'>
                                    <FaCartShopping className='text-blue-600' size={25}/>
                                    <h1 className='font-bold text-lg'>Current Order</h1>
                                </div>
                                {cartStatus && cartStatus === "draft" && (
                                    <div className='flex gap-2 mb-2'>
                                        <span className='bg-gray-500 rounded-md text-white py-1 px-2'>Draft</span>
                                        <button className='bg-red-600 rounded-md text-white py-1 px-2 flex justify-center items-center gap-1'><FaTrashAlt /> Remove Draft</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul className='h-[50vh] overflow-y-scroll'>
                            {  
                                cart?.length > 0 ?(
                                    cart.map((cartItem)=>(
                                        <li className='flex items-center  gap-4 py-5 px-3' key={cartItem._id}>
                                            {cartItem.image ? (
                                                <img src={`${API_URL}uploads/pos-items/${cartItem.image}`} className='h-16 w-16 object-cover rounded-lg border border-gray-300' alt="food" />
                                            ):(
                                                <img src={placeholder} className='h-16 w-16 object-cover rounded-lg border border-gray-300' alt="foodpl" />                                                                    
                                            )}
                                            <div className='grow flex flex-col items-start'>
                                                <div className='flex justify-between w-full items-center'>
                                                    <h1 className='font-semibold text-lg mb-2'>{cartItem.name}</h1>
                                                    <span className="ml-4 font-semibold text-lg">
                                                        {hotel.currency === "USD" ? (
                                                            `$ ${(cartItem.converted.USD * cartItem.quantity).toFixed(2)}`
                                                        ):(
                                                            `Rs. ${(cartItem.price * cartItem.quantity).toFixed(2)}`
                                                        )}
                                                    </span>
                                                </div>
                                                <div className='flex justify-between w-full items-center'>
                                                    <div className='border border-gray-300 rounded-lg'>
                                                        <button 
                                                        className="px-3 py-1 focus:outline-0 cursor-pointer" 
                                                        onClick={() => {
                                                            if (cartItem.quantity > 1) {
                                                                handleUpdateQuantity(cartItem._id, cartItem.quantity - 1);
                                                            } else {
                                                                handleRemove(cartItem._id); // remove if quantity hits 0
                                                            }
                                                            }}
                                                        >
                                                            -
                                                        </button>
        
                                                        {/* Quantity display */}
                                                        <span className="w-16 text-center ">{cartItem.quantity}</span>
        
                                                        {/* Plus button */}
                                                        <button 
                                                        className="px-3 py-1 focus:outline-0 cursor-pointer" 
                                                        onClick={() => handleUpdateQuantity(cartItem._id, cartItem.quantity + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemove(cartItem._id)} 
                                                        className='text-red-600 font-semibold cursor-pointer'>
                                                            Remove
                                                    </button>                                            
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ):(
                                    <div className='flex flex-col items-center justify-center gap-2 h-full'>
                                        <div className='bg-gray-300 rounded-full p-5'>
                                            <FaCartShopping className='' size={30}/>
                                        </div>
                                        <p className='text-gray-500'>Cart is Empty</p>
                                    </div>
                                )
                            
                            }
                        </ul>
                        
                       <div className="pt-4 border-t border-gray-300">
                            <div className='flex justify-between my-5'>
                                <h3 className="text-lg font-bold">Total:</h3>
                                <h3 className="text-lg font-bold">
                                    {hotel?.currency === "USD" ? (
                                        `$ ${totalPrice.toFixed(2)}`
                                    ):(
                                        `Rs. ${totalPrice}`
                                    )}
                                </h3>                                
                            </div>
                            <div className='flex gap-2'>
                                    <Button 
                                        className="grow flex justify-center items-center gap-1 cursor-pointer"
                                        onClick={handleMemberPOSOrder}
                                    >
                                        Instant Order <BsArrowRight size={20}/>
                                    </Button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
        <RoomServiceModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            order={selectedOrder}
        />
    </>
  )
}

export default POSTerminal