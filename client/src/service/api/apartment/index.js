import axios from "axios";


export const addressApartmant = async (value) => {

    return await axios.post(`${import.meta.env.VITE_REACT_APP_API}/apartment-address`, value)


}
export const getDataApartment = async (profileId) => {


    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/apartment`, {
        params: { profileId }

    })


    return re
}
export const getTenants = async (accountId) => {


    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/get-tenant`, {
        params: { accountId }

    })


    return re.data
}

export const addMeters = async (value) => {


    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/add-meter`,
        value

    )


    return re.data
}
export const getMeters = async (accountId) => {


    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/get-meter`,
        {
            params: { accountId }
        }

    )


    return re.data.data
}

export const addServices = async (value) => {


    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/add-services`,
        value

    )


    return re.data
}
export const getServices = async (accountId) => {

    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/get-services`,
        {
            params: { accountId }
        }

    )

    return re.data
}

export const addServiceUsageTenant = async (tenantId, value) => {

    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/tenants/${tenantId}/services`,
        value

    )

    return re
}
export const deleteServiceUsage = async (value) => {

    const re = await axios.patch(`${import.meta.env.VITE_REACT_APP_API}/tenants/${value.tenantId}/serviceUsage/${value.serviceUsageId}`,

    )

    return re
}




export const createBankAccount = async (value) => {

    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/bank-account`, value)

    return re
}
export const listBankAccount = async (accountId) => {

    const re = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/bank-account/${accountId}`)

    return re.data
}


export const deleteBankAccount = async (bankId) => {

    const re = await axios.delete(`${import.meta.env.VITE_REACT_APP_API}/bank-account/${bankId}`,)

    return re.data
}