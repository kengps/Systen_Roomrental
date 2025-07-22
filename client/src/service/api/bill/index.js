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