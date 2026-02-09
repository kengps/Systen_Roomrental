import axios from "axios";

/**
 * ดึง token จาก localStorage
 * ลองดึงจาก localStorage.getItem('token') ก่อน
 * ถ้าไม่มี ให้ลองดึงจาก auth-storage (zustand persist)
 */
const getToken = () => {
    // ลองดึงจาก localStorage.getItem('token') ก่อน
    let token = localStorage.getItem('token');

    // ถ้าไม่มี token ใน localStorage ให้ลองดึงจาก auth-storage (zustand persist)
    if (!token) {
        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                token = parsed?.state?.token;
            }
        } catch (error) {
            console.error('Error parsing auth-storage:', error);
        }
    }

    return token;
};

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
export const checkSlip = async (values) => {

    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/checkslip`, values)

    return re.data
}

export const getImageLogo = async (domainName) => {
    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/image-logo`, { domainName })
    return re.data
}

export const sendMessage = async (data) => {
    // ดึง token จาก function
    const token = getToken();

    const re = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/send-message`, data, {
        withCredentials: true, // ส่ง cookie (refreshToken) อัตโนมัติ
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }) // ส่ง Bearer token ใน header
        }
    })
    return re.data
}