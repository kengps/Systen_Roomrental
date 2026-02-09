import axios from 'axios'
import api from '..'


export const logged = async (value) => {
    return await axios.post(`${import.meta.env.VITE_REACT_APP_API}/login`, value,
        { withCredentials: true }
    )
}

export const logouted = async (id) => {

    return await api.post(`${import.meta.env.VITE_REACT_APP_API}/logout`, { id })
}



export const currentUser = async (authtoken) => {
    return await api.post(`${import.meta.env.VITE_REACT_APP_API}/current-user`, {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`,
            },
        }
    )
}


export const currentAdmin = async (authtoken) => {
    return await api.post(`${import.meta.env.VITE_REACT_APP_API}/current-admin `, {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`,
            },
        }
    )
}

export const createUser = async (value) => {
    return await axios.post(`${import.meta.env.VITE_REACT_APP_API}/register`, value)
}
