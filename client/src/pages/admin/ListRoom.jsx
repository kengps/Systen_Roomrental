import React, { useEffect, useState } from 'react'
import { getRoom } from '../../service/api/rooms'


const ListRoom = () => {

    const [rooms , setRooms] = useState();
    
    
    const getRooms = async () => {
        const res = await getRoom();
        
        setRooms(res.data.result)
    }
    
    console.log(`⩇⩇:⩇⩇🚨  file: ListRoom.jsx:8  rooms :`, rooms);

    useEffect(() => {
        getRooms()
    }, [])

    return (
        <div>ListRoom</div>
    )
}

export default ListRoom