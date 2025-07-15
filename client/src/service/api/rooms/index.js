import axios from "axios";


export const getRoom = async (profileId) => {
    const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/listroom`, {
        params: { profileId }
    })
    return res.data
}
export const updatePrice = async (value) => {
    const res = await axios.put(`${import.meta.env.VITE_REACT_APP_API}/update-price`, {
        value
    })
    return res.data
}


export const updateTenancyStatus = async (value) => {

    const res = await axios.put(`${import.meta.env.VITE_REACT_APP_API}/update-tenancy/${value.tenantId}`,
        value
        // , {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${authtoken}`,
        //     },
        // }

    )
    return res.data
}
export const createTenant = async (value, authtoken) => {
    const res = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/add-tenant`,
        value
        , {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`,
            },
        })
    return res.data
}
