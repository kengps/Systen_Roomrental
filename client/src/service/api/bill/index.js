import axios from "axios";



export const getDataBill = async (accountId) => {

    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/data-billing/${accountId}`)


    return re.data

}
export const getBilling = async (accountId, month, year) => {

    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/billing/${accountId}`, {
        params: { month: month, year: year }
    })


    return re.data

}


export const createBilling = async (value) => {

    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/billing`, value)

    return re.data

}
// --- Updated API function ---
export const getListPayments = async (accountId, page = 1, limit = 10, from = null, to = null) => {
    const params = new URLSearchParams({
        page: page,
        limit: limit,
    });

    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/payments/${accountId}?${params}`);
    return response.data;


};
export const confirmPayment = async (value) => {

    const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/payments/confirm`, value)

    return response.data;


};

export const canclePayment = async (value) => {

    const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_API}/payments/cancel/${value.paymentId}`, value)

    return response.data;


};