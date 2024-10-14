import axios from "axios";


export const getRoom = async () => {
    return  await axios.get(`${import.meta.env.VITE_REACT_APP_API}/admin/room/listroom`)
}