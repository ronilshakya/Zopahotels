import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';
import { FaChartLine, FaFilter, FaCalendar } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { MdAttachMoney } from 'react-icons/md';

const InvoiceReportsPage = () => {
    const token = localStorage.getItem("adminToken");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    
    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
        endDate: new Date().toISOString().split('T')[0], // Today
        customerType: "",
        invoiceStatus: ""
    });

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.customerType && { customerType: filters.customerType }),
                ...(filters.invoiceStatus && { invoiceStatus: filters.invoiceStatus })
            });

            const response = await fetch(`${API_URL}api/invoice/invoices?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Request failed (${response.status}): ${text}`);
            }

            const data = await response.json();
            if (data.success) {
                setReportData(data);
            } else {
                throw new Error(data.message || 'Report fetch failed');
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, token]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const formatCurrency = (amount) => {
        return `Rs. ${amount?.toLocaleString() || 0}`;
    };

    if (loading && !reportData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className='bg-white p-4 border-b border-gray-300'>
                <h1 className='px-2 py-1 text-2xl font-bold'>Invoice Reports</h1>
                <p className='px-2 py-1 text-sm text-gray-500'>Comprehensive sales and invoice analytics</p>
            </div>

            <div className="min-h-screen bg-gray-100 p-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaFilter className="text-blue-600" />
                        <h2 className="text-lg font-semibold">Report Filters</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                            <select
                                value={filters.customerType}
                                onChange={(e) => handleFilterChange('customerType', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">All Types</option>
                                <option value="walkIn">Walk-in</option>
                                <option value="booking">Booking</option>
                                <option value="member">Member</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.invoiceStatus}
                                onChange={(e) => handleFilterChange('invoiceStatus', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">All Statuses</option>
                                <option value="in_progress">In Progress</option>
                                <option value="paid">Paid</option>
                                <option value="posted">Posted</option>
                            </select>
                        </div>
                    </div>

                </div>

                {reportData && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <MdAttachMoney className="text-green-600" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800">
                                    {formatCurrency(reportData.summary.totalRevenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    $ {reportData.summary.totalRevenueUSD?.toFixed(2)}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Invoices</p>
                                    <IoStatsChart className="text-blue-600" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800">
                                    {reportData.summary.totalInvoices}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Avg: {formatCurrency(reportData.summary.avgInvoiceValue)}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Discounts</p>
                                    <FaChartLine className="text-orange-600" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800">
                                    {formatCurrency(reportData.summary.totalDiscount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {((reportData.summary.totalDiscount / reportData.summary.totalRevenue) * 100).toFixed(1)}% of revenue
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total VAT</p>
                                    <FaCalendar className="text-purple-600" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800">
                                    {formatCurrency(reportData.summary.totalVAT)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tax collected
                                </p>
                            </div>
                        </div>

                        {/* Revenue by Customer Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Revenue by Customer Type</h3>
                                <div className="space-y-3">
                                    {reportData.revenueByCustomerType.map((item) => (
                                        <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium capitalize">{item._id}</p>
                                                <p className="text-sm text-gray-600">{item.count} invoices</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                                                <p className="text-xs text-gray-500">$ {item.revenueUSD.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Revenue by Status</h3>
                                <div className="space-y-3">
                                    {reportData.revenueByStatus.map((item) => (
                                        <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium capitalize">{item._id.replace('_', ' ')}</p>
                                                <p className="text-sm text-gray-600">{item.count} invoices</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                                                <p className="text-xs text-gray-500">$ {item.revenueUSD.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Items */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Top 10 Items Sold</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Item Name</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Quantity Sold</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.topItems.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    } font-semibold`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{item._id}</td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Daily Revenue Trend */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Invoices</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.dailyRevenue.map((day) => (
                                            <tr key={day._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="px-4 py-3 text-right">{day.count}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(day.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default InvoiceReportsPage;