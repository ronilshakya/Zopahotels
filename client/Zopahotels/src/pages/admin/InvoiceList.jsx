import React, { useState, useEffect } from 'react';
import { IoSearchSharp } from "react-icons/io5";
import { FaEye, FaDownload, FaFilter } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { deleteInvoice, getInvoices } from '../../api/invoiceApi';
import Swal from 'sweetalert2';
import { FaTrash } from "react-icons/fa";

const InvoiceList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    paidInvoices: 0,
    pendingInvoices: 0
  });
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    invoiceStatus: "",
    customerType: "",
    date: ""
  });

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.invoiceStatus && { invoiceStatus: filters.invoiceStatus }),
        ...(filters.customerType && { customerType: filters.customerType }),
        ...(filters.date && { date: filters.date }),
      });
      
      const data = await getInvoices(token, params.toString());
      setInvoices(data.invoices);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  const clearFilters = () => {
    setFilters({
      invoiceStatus: "",
      customerType: "",
      date: ""
    });
    setSearchQuery("");
  };

  const getStatusBadge = (status) => {
    const styles = {
      in_progress: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      posted: "bg-purple-100 text-purple-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (id) =>{
    Swal.fire({ 
        title: "Confirm Delete Invoice?", 
        text: "Are you sure you want to delete this invoice?", 
        icon: "warning", 
        showCancelButton: true, 
        confirmButtonColor: "#3085d6", 
        cancelButtonColor: "#d33", 
        confirmButtonText: "Yes, delete it!" 
    }).then(async (result) => { 
        if (result.isConfirmed) { 
            try {
                await deleteInvoice(token,id)
                Swal.fire({ 
                    position: "top-end", 
                    icon: "success", 
                    title: "Invoice Deleted",
                    showConfirmButton: false, 
                    timer: 1500 
                });
                fetchInvoices();
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
        <h1 className='px-2 py-1 text-2xl font-bold'>Invoice List</h1>
        <p className='px-2 py-1 text-sm text-gray-500'>Manage and view all invoices</p>
      </div>

      <div className="min-h-screen bg-gray-100 p-4">

        <div className="mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
          {/* Search and Filters */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div className='flex items-center border border-gray-300 bg-white rounded-xl w-full px-3 py-2 gap-2'>
              <IoSearchSharp size={20} className={loading ? 'animate-pulse' : ''} />
              <input
                type="text"
                placeholder="Search by invoice #, guest name, room, or booking ID"
                className="grow focus:outline-0"
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaFilter size={16} />
                Filters
              </button>
              {(filters.invoiceStatus || filters.invoiceType || filters.startDate || filters.endDate || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
                <select
                  value={filters.invoiceStatus}
                  onChange={(e) => handleFilterChange('invoiceStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paid">Paid</option>
                  <option value="posted">Posted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select
                  value={filters.customerType}
                  onChange={(e) => handleFilterChange('customerType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="walkIn">Walk-in</option>
                  <option value="booking">Booking</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filters.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing invoices from {formatDate(filters.date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No invoices found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <table className="w-full border border-gray-300 table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="px-4 py-3 text-left font-semibold text-sm">INVOICE ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">GUEST / SOURCE</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">ISSUE DATE</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">TOTAL AMOUNT</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">STATUS</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-blue-600">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">{invoice.invoiceType?.replace('_', ' ').toUpperCase()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className=" text-gray-500">
                              <p className="font-medium">{invoice.customer?.name}</p>
                              <p className='font-semibold'>{invoice.booking?.guestFirstName} {invoice.booking?.guestLastName}</p>
                              <p className='text-sm'>
                                {invoice.customerType === "walkIn" && `Walk-in`}
                                {invoice.customerType === "booking" && 'Standard Booking'}
                                {invoice.customerType === "member" && 'Member'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold">Rs. {invoice.netTotal?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">$ {invoice.netTotalUSD?.toFixed(2)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(invoice.invoiceStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/admin/invoice-detail/${invoice._id}`)}
                              className="p-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                              title="View Invoice"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice._id)}
                              className="p-2 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition"
                              title="View Invoice"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} invoices
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchInvoices(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 border rounded-lg bg-blue-500 text-white">
                        {pagination.page}
                      </span>
                      <button
                        onClick={() => fetchInvoices(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceList;