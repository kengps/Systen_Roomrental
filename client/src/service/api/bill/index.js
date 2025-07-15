import axios from "axios";



export const getDataBill = async (accountId) => {

    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/data-billing/${accountId}`)

    console.log(`⩇⩇:⩇⩇🚨 ~ getDataBill ~ re :`, re);

    return re.data

}