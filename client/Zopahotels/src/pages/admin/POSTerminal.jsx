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
    createPOSWalkIn,
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
import { getAllUsers, searchUsers } from '../../api/authApi';

const POSTerminal = () => {
    const { bookingId } = useParams();
    const isWalkInAndBooking = !bookingId;

    const [booking, setBooking] = useState([]);
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
    const [roomNumber,setRoomNumber] = useState("");
    const [cartStatus, setCartStatus] = useState(null);
    const [draftLoading, setDraftLoading] = useState(false);
    const [customerType, setCustomerType] = useState("walkIn");

    const [walkInOrders, setWalkInOrders] = useState({
        orders: [],
        pagination: {}
    });
    const [orderHistorySearch, setOrderHistorySearch] = useState("");
    const [orderHistoryPage, setOrderHistoryPage] = useState(1);
    const orderHistoryLimit = 10;

    const [orderHistoryTab, setOrderHistoryTab] = useState("All");
    const [foodImageLoading, setFoodImageLoading] = useState(false)

    const [activeBookings, setActiveBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMemberQuery, setSearchMemberQuery] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [isSearching, setIsSearching] = useState(false);
    const [isMemberSearching, setIsMemberSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    const searchRef = useRef(null);
    const searchMemberRef = useRef(null);

    const {hotel} = useHotel();
    const navigate = useNavigate();

    // for modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBooking= async () =>{
        try {
            setLoading(true);
            const res = await getBookingById(bookingId,token);
            setBooking(res);
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false);
        }
    }

    const fetchCheckedInBookings = async (search = '', page = 1) => {
        try {
        setIsSearching(true);
        const res = await checkedInBookings(token, search, 1,3);
        setActiveBookings(res.bookings);
        setPagination(res.pagination);
        } catch (error) {
        console.error("Failed to fetch checked-in bookings", error);
        } finally {
        setIsSearching(false);
        }
    };

    const fetchUsers = async (search = '') => {
        try {
        setIsMemberSearching(true);
        const res = await searchUsers(token, search, 1, 3);
        setUsers(res.users);
        } catch (error) {
        console.error("Failed to fetch users", error);
        } finally {
        setIsMemberSearching(false);
        }
    };

    useEffect(() => {
         if (!showDropdown) return;
        const timer = setTimeout(() => {
            fetchCheckedInBookings(searchQuery, 1);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer); // Cleanup on each keystroke
    }, [searchQuery,showDropdown]);

    useEffect(() => {
         if (!showMemberDropdown) return;
        const timer = setTimeout(() => {
            fetchUsers(searchMemberQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer); // Cleanup on each keystroke
    }, [searchMemberQuery,showMemberDropdown]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    const handleMemberSearch = (e) => {
        setSearchMemberQuery(e.target.value);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchMemberRef.current && !searchMemberRef.current.contains(event.target)) {
                setShowMemberDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchWalkInOrders = async (
        type = "all",
        searchText = "",
        pageNumber = 1
        ) => {
        try {
            const res = await getPOSOrders(
            token,
            type,
            searchText,
            pageNumber,
            orderHistoryLimit
            );
            setWalkInOrders(res);
        } catch (error) {
            console.log(error);
        }
        };


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
    

    useEffect(()=>{
        fetchFoodItems();
    },[query, page])

    useEffect(()=>{
        if(!isWalkInAndBooking){
            fetchBooking();
        }else{
            fetchWalkInOrders("all", orderHistorySearch, orderHistoryPage);
        }
        fetchCheckedInBookings();
    },[orderHistoryPage])


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

    const handleRoomChange = async (roomBookingEntryId) => {
        setRoomNumber(roomBookingEntryId);
        setCart([]);
        setCartStatus(null);

        try {
            setDraftLoading(true);
            const res = await getCartByBookingAndRoom(token, booking._id, roomBookingEntryId);
            
            if (res.items && res.items.length > 0) {
                setCart(res.items);
                setCartStatus(res.status)
            } 
        } catch (err) {
            console.error("Error fetching cart:", err);
            setCart([]); 
        } finally{
            setDraftLoading(false);
        }
    };

    const handleSaveDraft = async () =>{
        try {
            await saveDraft(token,booking._id,roomNumber,cart);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Draft Saved",
                showConfirmButton: false,
                timer: 1000
            });
            await handleRoomChange(roomNumber);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error"); 
        }
    }
    const handleDeleteDraftCart = async () =>{
        try {
            await deleteDraftCart(token,booking._id,roomNumber);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Draft Deleted",
                showConfirmButton: false,
                timer: 1000
            });
            await handleRoomChange(roomNumber);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error"); 
        }
    }

    const handlePostRoomService = async () =>{
            const transformCartToOrderItems = (cart) => { 
                return cart.map(i => ({ 
                    item: i._id,  
                    quantity: i.quantity, 
                    price: i.price 
                })); 
            };
            Swal.fire({ 
                title: "Confirm Post Room Service", 
                text: "Are you sure you want to post this order to bill?", 
                icon: "warning", 
                showCancelButton: true, 
                confirmButtonColor: "#3085d6", 
                cancelButtonColor: "#d33", 
                confirmButtonText: "Yes, post it!" 
            }).then(async (result) => { 
                if (result.isConfirmed) { 
                    try {
                        await createPOS(token,booking._id,roomNumber,transformCartToOrderItems(cart),"bill")
                        Swal.fire({ 
                            position: "top-end", 
                            icon: "success", 
                            title: "Post Room Service Executed",
                            showConfirmButton: false, 
                            timer: 1500 
                        });
                        await fetchBooking();
                        setCart([]); 
                        setCartStatus(null);
                    } catch (err) {
                        Swal.fire("Error", err.response?.data?.message || err.message, "error");
                        console.log(err)
                    }
                }
            })
    }

    const handleWalkInPOSOrder = async () =>{
        const transformCartToOrderItems = (cart) => { 
                return cart.map(i => ({ 
                    item: i._id,  
                    quantity: i.quantity, 
                    price: i.price 
                })); 
            };
            Swal.fire({ 
                title: "Confirm Instant Walk-in Order", 
                text: "Are you sure you want to post this order?", 
                icon: "warning", 
                showCancelButton: true, 
                confirmButtonColor: "#3085d6", 
                cancelButtonColor: "#d33", 
                confirmButtonText: "Yes, post it!" 
            }).then(async (result) => { 
                if (result.isConfirmed) { 
                    try {
                        const res = await createPOSWalkIn(token,transformCartToOrderItems(cart))
                        Swal.fire({ 
                            position: "top-end", 
                            icon: "success", 
                            title: "Instant Walk-in Order Executed",
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
                        {isWalkInAndBooking ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {/* walk in */}
                                <div 
                                    className={`border-2  rounded-lg p-4
                                        ${(customerType === "walkIn" || customerType === "member") ? "bg-blue-50 border-blue-600":"border-gray-300"}
                                    `}
                                    // onClick={() => setCustomerType("walkIn")}
                                >
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className='flex items-center gap-2'> 
                                            <div className={`${customerType === "walkIn" || customerType === "member" ? "bg-blue-600 ":"bg-gray-300"} p-2 rounded-xl`}>
                                                <FaUserPlus size={20} className={`${customerType === "walkIn" || customerType === "member" ? "text-white ":""}`} />
                                            </div>
                                            <h1 className='font-semibold text-lg'>Walk-in Customer</h1>
                                        </div>
                                        {(customerType === "walkIn" || customerType === "member") && <IoCheckmarkCircle size={25} className='text-blue-600'/>}
                                    </div>     
                                    <div className="relative">
                                        <div className='flex items-center border border-gray-300 bg-white rounded-xl w-full px-3 py-1 gap-2 mb-1'>
                                            <select 
                                                className="grow focus:outline-0" 
                                                value={customerType} 
                                                onChange={(e) => setCustomerType(e.target.value)} 
                                            > 
                                                <option value="walkIn">Walk-in Customer</option> 
                                                <option value="member">Registered Customer</option> 
                                            </select>
                                        </div>
                                        {/* ------------------------------------------------- */}
                                        {customerType === "member" && (
                                        <div className="relative" ref={searchMemberRef}>
                                            <div className='flex items-center border border-gray-300 bg-white rounded-xl w-full px-3 py-1 gap-2 mb-1'>
                                                    <IoSearchSharp size={20} className={isMemberSearching ? 'animate-pulse' : ''} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search members"
                                                        className="grow focus:outline-0"
                                                        value={searchMemberQuery}
                                                        onChange={handleMemberSearch}
                                                        onFocus={() => setShowMemberDropdown(true)}
                                                    />
                                            </div>
                                            {/* Dropdown results */}
                                            {showMemberDropdown && (
                                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                                                    {isMemberSearching ? (
                                                        <div className="text-center py-8">
                                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                            <p className="text-gray-500 mt-2">Searching...</p>
                                                        </div>
                                                    ) : users.length > 0 ? (
                                                        <>
                                                            {users.map(user => (
                                                                <div 
                                                                    key={user._id} 
                                                                    className="border-b border-gray-200 last:border-b-0 p-3 cursor-pointer hover:bg-gray-50 transition"
                                                                    onClick={() => {
                                                                        // Handle user selection
                                                                        navigate(`/admin/pos-terminal-user/${user._id}`);
                                                                        setShowMemberDropdown(false);
                                                                    }}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-800">
                                                                                {user.name}
                                                                            </p>
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                Email: {user.email}
                                                                            </p>
                                                                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                                                <span>ID: {user._id}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <p className="text-gray-500">No users found</p>
                                                            {searchQuery && (
                                                                <p className="text-sm text-gray-400 mt-1">
                                                                    Try a different search term
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        )}
                                    </div>
                                    {/* -------------------------- */}
                                    <p className='text-sm text-gray-500'>Direct entry for non-staying guests. Payment required at checkout.</p>
                                </div>

                               

                                {/* Booking  */}
                                <div 
                                    className={`border-2  rounded-lg p-4
                                        ${customerType === "booking" ? "bg-blue-50 border-blue-600":"border-gray-300"}
                                    `}
                                    onClick={() => setCustomerType("booking")}
                                >
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className='flex items-center gap-2'> 
                                            <div className={`${customerType === "booking" ? "bg-blue-600 ":"bg-gray-300"} p-2 rounded-xl`}>
                                                <FaBed size={20} className={`${customerType === "booking" ? "text-white ":""}`} />
                                            </div>
                                            <h1 className='font-semibold text-lg'>Select From Booking</h1>
                                        </div>
                                        {customerType === "booking" && <IoCheckmarkCircle size={25} className='text-blue-600'/>}
                                    </div>
                                    <div className="relative" ref={searchRef}>
                                        <div className='flex items-center border border-gray-300 bg-white rounded-xl w-full px-3 py-1 gap-2 mb-1'>
                                                <IoSearchSharp size={20} className={isSearching ? 'animate-pulse' : ''} />
                                                <input
                                                    type="text"
                                                    placeholder="Search bookings by room number or guest name"
                                                    className="grow focus:outline-0"
                                                    value={searchQuery}
                                                    onChange={handleSearch}
                                                    onFocus={() => setShowDropdown(true)}
                                                />
                                        </div>
                                         {/* Dropdown results */}
                                        {showDropdown && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                                                {isSearching ? (
                                                    <div className="text-center py-8">
                                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                        <p className="text-gray-500 mt-2">Searching...</p>
                                                    </div>
                                                ) : activeBookings.length > 0 ? (
                                                    <>
                                                        {activeBookings.map(booking => (
                                                            <div 
                                                                key={booking._id} 
                                                                className="border-b border-gray-200 last:border-b-0 p-3 cursor-pointer hover:bg-gray-50 transition"
                                                                onClick={() => {
                                                                    // Handle booking selection
                                                                    navigate(`/admin/pos-terminal/${booking._id}`);
                                                                    setShowDropdown(false);
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-gray-800">
                                                                            {booking.customerType === 'Guest' 
                                                                                ? `${booking.guestFirstName} ${booking.guestLastName}`
                                                                                : booking.user?.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            Room(s): {booking.rooms?.map(r => r.roomNumber).join(', ')}
                                                                        </p>
                                                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                                            <span>ID: {booking.bookingId}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-medium text-gray-700">
                                                                            {booking.rooms?.[0]?.roomId?.type}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {booking.numberOfRooms} Room{booking.numberOfRooms > 1 ? 's' : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-gray-500">No bookings found</p>
                                                        {searchQuery && (
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                Try a different search term
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className='text-sm text-gray-500 mt-3'>Find active guests for room charging</p>  
                                </div>
                                
                            </div>
                        ):(
                            <>
                            {/* Booking Details */}
                                <div className='grid grid-cols-1 md:grid-cols-3 border-b border-gray-300 py-4'>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <FaUserAlt className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>{booking?.customerType?.toUpperCase()}</h1>
                                            <h1 className=' font-semibold'>
                                                {booking.customerType === "Guest" 
                                                    ? `${booking.guestFirstName} ${booking.guestLastName}` 
                                                    : booking.user?.name}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <MdOutlineDateRange className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>STAY</h1>
                                            <span className='font-semibold'>
                                                {(() => {
                                                    const checkInDate = new Date(booking.checkIn);
                                                    const checkOutDate = new Date(booking.checkOut);

                                                    const options = { month: "short", day: "numeric" };
                                                    const checkInStr = checkInDate.toLocaleDateString("en-US", options);
                                                    const checkOutStr = checkOutDate.toLocaleDateString("en-US", options);

                                                    const nights = Math.round(
                                                    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
                                                    );

                                                    return `${checkInStr} - ${checkOutStr} (${nights} Night${nights > 1 ? "s" : ""})`;
                                                })()}
                                            </span>

                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 my-2'>
                                        <div className='bg-blue-100 rounded-full p-2'>
                                            <FaStar className='text-blue-600'/>
                                        </div>
                                        <div>
                                            <h1 className='text-gray-500 text-xs font-semibold'>STATUS</h1>
                                            <span className='font-semibold text-green-600'>
                                                {booking.status === 'pending' && 'Pending'} 
                                                {booking.status === 'checked_out' && 'Checked Out'} 
                                                {booking.status === 'checked_in' && 'Checked In'}
                                                {booking.status === 'cancelled' && 'Cancelled'} 
                                                {booking.status === 'no_show' && 'No Show'} 
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
                                        {isWalkInAndBooking ? (
                                            <div>
                                                {walkInOrders.length === 0 ? (
                                                    <p>No Orders found</p>
                                                ):(
                                                <>
                                                    <div className='flex justify-between items-center mb-5'>
                                                        <div>
                                                            <h1 className='font-semibold text-lg'>Recent Transactions</h1>
                                                            <p className="text-gray-600 text-sm">View orders from bookings and walk-in customers.</p>
                                                            {/* <input
                                                                type="text"
                                                                placeholder="Search orders..."
                                                                value={orderHistorySearch}
                                                                onChange={(e) => {
                                                                    setOrderHistorySearch(e.target.value);
                                                                    setOrderHistoryPage(1); // reset to first page on new search
                                                                }}
                                                                className="border px-3 py-2 rounded w-64"
                                                                /> */}

                                                        </div>
                                                    </div>
                                                    <div className="overflow-x-auto space-y-8">
                                                {/* Walk-In Orders Table */}
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
                                                        {walkInOrders.orders
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
                                                    <div className="flex justify-end items-center gap-2 mt-6">
  <button
    disabled={orderHistoryPage === 1}
    onClick={() => setOrderHistoryPage(p => p - 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Prev
  </button>

  <span className="text-sm">
    Page {walkInOrders.pagination?.page} of{" "}
    {walkInOrders.pagination?.totalPages}
  </span>

  <button
    disabled={
      orderHistoryPage === walkInOrders.pagination?.totalPages
    }
    onClick={() => setOrderHistoryPage(p => p + 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Next
  </button>
</div>


                                                </div>

                                                </div>

                                                </>
                                                )}
                                            </div>
                                        ):(
                                            booking.charges.length === 0  && booking.payments.length === 0 ?
                                            (
                                                <p>No Orders found</p>
                                            ):(
                                                <>
                                                    <h1 className='font-semibold text-gray-600 text-sm flex gap-1 mb-2'><IoBedOutline size={20} /> POST TO ROOM (Billed To Guest)</h1>
                                                    {
                                                        booking.charges.length === 0 ? (
                                                            <p>No charges found</p>
                                                        ):(
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full border border-gray-300 table-auto border-collapse">
                                                                    <thead>
                                                                        <tr className="bg-gray-200 text-gray-700">
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Items</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Room No.</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Total Amount</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Receipt</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {booking.charges.map(charge =>(
                                                                            <tr key={charge._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">
                                                                                    {new Date(charge.createdAt).toLocaleString("en-US", { 
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
                                                                                    {charge.items.length > 0 && (
                                                                                        <p>
                                                                                        {charge.items
                                                                                            .map(i => i.name)
                                                                                            .slice(0, 3) // show first 3 names
                                                                                            .join(", ")}
                                                                                        {charge.items.length > 3 && " ..."}
                                                                                        </p>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">{charge.roomNumber}</td>
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">
                                                                                     {hotel.currency === "USD" ? (
                                                                                        `$ ${charge.converted.USD.toFixed(2)}`
                                                                                    ):(
                                                                                        `Rs. ${charge.amount}`
                                                                                    )}
                                                                                </td>
                                                                                <td 
                                                                                    className="px-4 py-3 text-blue-600 text-sm font-semibold flex gap-1 items-center cursor-pointer"
                                                                                    onClick={()=>{
                                                                                        setSelectedOrder(charge);
                                                                                        setIsModalOpen(true)
                                                                                    }}
                                                                                >
                                                                                    View <IoDocumentTextOutline size={20}/>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )
                                                    }
                                                    <h1 className='font-semibold text-gray-600 text-sm flex gap-1 mb-2 mt-4'><IoBedOutline size={20} /> INSTANT ORDERS (Paid Immediately)</h1>
                                                    {
                                                        booking.payments.length === 0 ? (
                                                            <p>No payments found</p>
                                                        ):(
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full border border-gray-300 table-auto border-collapse">
                                                                    <thead>
                                                                        <tr className="bg-gray-200 text-gray-700">
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Items</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Room No.</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Total Amount</th>
                                                                            <th className="px-4 py-3 text-left font-semibold text-sm">Receipt</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {booking.payments.map(payment =>(
                                                                               <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">
                                                                                    {new Date(payment.createdAt).toLocaleString("en-US", { 
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
                                                                                    {payment.items.length > 0 && (
                                                                                        <p>
                                                                                        {payment.items
                                                                                            .map(i => i.name)
                                                                                            .slice(0, 3) // show first 3 names
                                                                                            .join(", ")}
                                                                                        {payment.items.length > 3 && " ..."}
                                                                                        </p>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">{payment.roomNumber}</td>
                                                                                <td className="px-4 py-3 text-gray-600 text-sm">
                                                                                    {hotel.currency === "USD" ? (
                                                                                        `$ ${payment.converted.USD.toFixed(2)}`
                                                                                    ):(
                                                                                        `Rs. ${payment.amount}`
                                                                                    )}
                                                                                </td>
                                                                                <td 
                                                                                    className="px-4 py-3 text-blue-600 text-sm font-semibold flex gap-1 items-center cursor-pointer"
                                                                                    onClick={()=>{
                                                                                        setSelectedOrder(payment);
                                                                                        setIsModalOpen(true)
                                                                                    }}
                                                                                >
                                                                                    View <IoDocumentTextOutline size={20}/>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )
                                                    }
                                                </>
                                            )    
                                        )
                                        }
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
                                        <button onClick={handleDeleteDraftCart} className='bg-red-600 rounded-md text-white py-1 px-2 flex justify-center items-center gap-1'><FaTrashAlt /> Remove Draft</button>
                                    </div>
                                )}
                            </div>
                            { (!isWalkInAndBooking) && (
                                <div className='flex flex-col gap-2'>
                                    <p>Creating order for Room: </p>
                                    <select onChange={(e)=>handleRoomChange(e.target.value)} name="" id="" className='border border-gray-300 rounded-md p-2'>
                                        <option  value="">--Select Room Number--</option>
                                        {booking.rooms?.map(r=>(
                                            <option key={r._id} value={r._id}>{r.roomNumber}</option>
                                        ))}
                                    </select>
                                </div>                            
                            )}
                        </div>
                        <ul className='h-[50vh] overflow-y-scroll'>
                            {   draftLoading ? (
                                <div className='flex flex-col items-center justify-center gap-2 h-full'>
                                    <img src={preloader} className='w-15' alt="loading" />
                                </div>
                            ):(
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
                                {(!isWalkInAndBooking) && (
                                    <button 
                                        onClick={handleSaveDraft}
                                        className='border p-2 rounded-md border-gray-300 font-semibold flex justify-center items-center gap-2 cursor-pointer'
                                    >
                                        {/* Save Draft <RiDraftLine size={20}/> */}
                                        Save Draft
                                    </button>                                
                                )}
                                {(!isWalkInAndBooking) && (
                                    <Button 
                                        className="grow flex justify-center items-center gap-1 cursor-pointer"
                                        onClick={handlePostRoomService}
                                    >
                                        Post To Bill <BsArrowRight size={20}/>
                                    </Button>
                                )}
                               {isWalkInAndBooking && (
                                    <Button 
                                        className="grow flex justify-center items-center gap-1 cursor-pointer"
                                        onClick={handleWalkInPOSOrder}
                                        disabled={customerType === "member" || customerType === "booking"}
                                    >
                                        Instant Order <BsArrowRight size={20}/>
                                    </Button>
                                )}

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