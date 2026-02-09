import { Paper, TextField, Typography } from '@mui/material';
import { Button, Card, Form, Input, InputNumber, Collapse, Row, Col, Radio, Flex } from 'antd';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import CreateRoomPage from '../../components/form/dashboard/rooms/CreateRoomPage';
import { toast } from 'react-toastify';
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const { Panel } = Collapse;

let getRooms = async (profileId) => {
    return await axios.get(`${import.meta.env.VITE_REACT_APP_API}/listroom`, {
        params: { profileId }

    })
}
const CreateRoom = () => {
    const [floors, setFloors] = useState(1);
    const [roomsPerFloor, setRoomsPerFloor] = useState(1);
    const [disabled, setDisable] = useState(true)
    const [count, setCount] = useState(3);
    const [price, setPrice] = useState(3500);
    const [rooms, setRooms] = useState([]);
    const { user } = persistMiddleware()

    const profileId = user?.userPayLoad?.user?.id

    const { data: existingRooms } = useQuery({
        queryKey: ['existingRooms'],
        queryFn: () => getRooms(profileId)
    })




    const { register, handleSubmit, control, reset, formState: { errors }, } = useForm();

    const handleAddRooms = async (value) => {

        try {

            const { floor, price, roomPerFloor, count } = value

            const newRooms = [];



            // สร้างอาเรย์ที่เก็บหมายเลขห้องที่มีอยู่
            const existingRoomNumbers = existingRooms?.data?.result.map(room => room.roomNumber);

            for (let i = 1; i <= floor; i++) {
                console.log(`⩇⩇:⩇⩇🚨 ~ i :`, i);


                for (let j = 1; j <= roomPerFloor; j++) {
                    
                    //const roomNumber = i * 10 ** (count - 1) + (j - 1); //! เริ่มจาก xx0
                    const roomNumber = i * 10 ** (count - 1) + j


                    // newRooms.push({ floor: i, roomNumber: i * 10 ** (count - 1) + (j - 1), price });

                    // ตรวจสอบว่าห้องที่ต้องการสร้างมีอยู่แล้วหรือไม่
                    if (!existingRoomNumbers.includes(roomNumber)) {
                        newRooms.push({ floor: i, roomNumber, });
                    }
                }
            }

            setRooms(newRooms);
            setDisable(false);

        } catch (error) {

        }
    };


    const onSubmit = async () => {
        const userId = user?.userPayLoad?.user?.id

        const value = {
            profileId: userId,
            rooms

        }



        try {
            console.log(`⩇⩇:⩇⩇🚨 ~ value :`, value);

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API}/admin/room/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value }),
            });
            console.log(`⩇⩇:⩇⩇🚨 ~ response :`, response);

            const data = await response.json();
            toast.success(data.message)

            setTimeout(() => {
                reset();
                setRooms([])
                setDisable(true)
            }, 2000)


        } catch (error) {
            console.error('Error saving rooms:', error);
        } finally {
        }
    };

    // Group rooms by floor
    const groupedRooms = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);

        return acc;
    }, {});


    const deleteRoom = (e, room) => {
        e.preventDefault();
        // ลบห้องออกจากรายการ rooms โดยใช้ filter
        try {
            const updatedRooms = rooms.filter((value) => value.roomNumber !== room);
            setRooms(updatedRooms); // อัปเดตรายการห้อง

        } catch (error) {

        }
    }

    const onFinish = async (values) => {
        // try {
        //     handleAddRooms(values)

        // } catch (error) {


    }

    // const onSubmit = (value) => {

    // }

    return (
        <CreateRoomPage
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onFinish={onFinish}
            handleAddRooms={handleAddRooms}
            disabled={disabled}
            groupedRooms={groupedRooms}
            floors={floors}
            roomsPerFloor={roomsPerFloor}
            count={count}
            price={price}
            onSubmit={onSubmit}
            rooms={rooms}
            control={control}
            deleteRoom={deleteRoom}
        />
    );
};

export default CreateRoom;

