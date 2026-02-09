import axios from "axios";



export const readNotifications = async (id) => {

    const re = await axios.patch(`${import.meta.env.VITE_REACT_APP_API}/notifications/${id}/read`)

    return re.data

}