import axios from "axios";
import { API_URL } from "../config";

const API_URL_EXTENDED = `${API_URL}api/invoice`;

export const getInvoices = async (token, queryString = '') => {
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const getInvoiceById = async (token, id) => {
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const getInvoiceByBookingId = async (token, bookingId) => {
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/get-invoice-by-booking/${bookingId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const applyDiscount = async (token, invoiceId, type, value, currency, description, appliedTo) => {
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/apply-discount`, {
            invoiceId,
            type,
            value,
            currency,
            description,
            appliedTo
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};
export const applyVAT = async (token, invoiceId, vatRate) => {
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/apply-vat`, {
            invoiceId,
            vatRate
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};
export const resetInvoice = async (token, invoiceId) => {
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/reset-invoice`, {
            invoiceId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const finalizeInvoice = async (token, invoiceId) => {
    try {
        const res = await axios.post(`${API_URL_EXTENDED}/finalize-invoice/${invoiceId}`, {
            invoiceId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const deleteInvoice = async (token, invoiceId) => {
    try {
        const res = await axios.delete(`${API_URL_EXTENDED}/${invoiceId}`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const getInvoiceReport = async (token, params) => {
    try {
        const res = await axios.get(`${API_URL_EXTENDED}/invoices?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};