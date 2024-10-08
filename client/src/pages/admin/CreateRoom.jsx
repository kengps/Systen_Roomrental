import React, { useState } from 'react';

const CreateRoom = () => {
    const [floors, setFloors] = useState(1);
    const [roomsPerFloor, setRoomsPerFloor] = useState(1);
    const [count, setCount] = useState(3);
    const [rooms, setRooms] = useState([]);

    //TODO สูตร N * 10^(D-1) || 1 * 10^(3-1)
    const handleAddRooms = () => {
        const newRooms = [];
        for (let i = 1; i <= floors; i++) {
            for (let j = 1; j <= roomsPerFloor; j++) {
                newRooms.push({ floor: i, roomNumber: i * 10 ** (count - 1) + j });
            }
        }
        setRooms(newRooms);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // ส่งข้อมูลไปที่ Backend ที่นี่
        console.log('room', rooms);

        await saveRoomsToDatabase(rooms);
    };

    const saveRoomsToDatabase = async (rooms) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API}/admin/room/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rooms }),
            });

            const data = await response.json();
            console.log('Rooms saved:', data);
        } catch (error) {
            console.error('Error saving rooms:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                จำนวนชั้น:
                <input
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(Number(e.target.value))}
                    min="1"
                />
            </label>
            <br />
            <label>
                จำนวนห้องต่อชั้น:
                <input
                    type="number"
                    value={roomsPerFloor}
                    onChange={(e) => setRoomsPerFloor(Number(e.target.value))}
                    min="1"
                />
            </label>
            <br />
            <label>
                หลักเลขห้อง:
                <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    min="1"
                />
            </label>
            <br />
            <button type="button" onClick={handleAddRooms}>
                สร้างห้อง
            </button>
            <button type="submit">บันทึกข้อมูล</button>
            <h3>ห้องที่สร้าง:</h3>
            <ul>
                {rooms.map((room, index) => (
                    <li key={index}>ชั้น {room.floor} ห้อง {room.roomNumber}</li>
                ))}
            </ul>
        </form>
    );
};

export default CreateRoom;
