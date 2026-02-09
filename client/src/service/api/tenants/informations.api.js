import axios from "axios"


export const listDataInformations = async (accountId) => {
    return await axios.get(`${import.meta.env.VITE_REACT_APP_API}/tenant/information-apartment/${accountId}`)
}

export const listBillingTenant = async (accountId) => {
    return await axios.get(`${import.meta.env.VITE_REACT_APP_API}/tenant/billing/${accountId}`)
}


export const createPayments = async (values) => {
    return await axios.post(`${import.meta.env.VITE_REACT_APP_API}/tenant/payments`, values)
}