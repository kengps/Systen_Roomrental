import { Paper, TextField, Typography } from '@mui/material';
import { Button, Card, Form, Input, InputNumber, Collapse, Row, Col, Radio, Flex } from 'antd';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import CreateRoomPage from '../../components/form/dashboard/rooms/CreateRoomPage';

const { Panel } = Collapse;

const CreateRoom = () => {
    const [floors, setFloors] = useState(1);
    const [roomsPerFloor, setRoomsPerFloor] = useState(1);
    const [disabled, setDisable] = useState(true)
    const [count, setCount] = useState(3);
    const [price, setPrice] = useState(3500);
    const [rooms, setRooms] = useState([]);


    const { register, handleSubmit, formState: { errors }, } = useForm();

    const handleAddRooms = (value) => {
        try {

            const { floor, price, roomPerFloor, count } = value

            const newRooms = [];

            for (let i = 1; i <= floor; i++) {
                for (let j = 1; j <= roomPerFloor; j++) {
                    // newRooms.push({ floor: i, roomNumber: `${i}${j.toString().padStart(2, '0')}` });
                    newRooms.push({ floor: i, roomNumber: i * 10 ** (count - 1) + (j - 1), price });
                }
            }

            setRooms(newRooms);
            setDisable(false);
        } catch (error) {

        }
    };

    // const onSubmit = async (event) => {

    //     // event.preventDefault();
    //     await saveRoomsToDatabase(rooms);

    // };


    const onSubmit = async (vaue) => {

        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API}/admin/room/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rooms }),
            });
            const data = await response.json();
        } catch (error) {
            console.error('Error saving rooms:', error);
        }
    };

    // Group rooms by floor
    const groupedRooms = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);
        return acc;
    }, {});


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
        />
    );
};

export default CreateRoom;



// จะขยาย ไม่ให้มีพื่นที่ว่าง
// <Collapse size="small">
//                 {Object.keys(groupedRooms).map((floor) => (
//                     <Panel header={`ชั้นที่ ${floor}`} key={floor}>
//                         <Row gutter={[16, 16]}>
//                             {groupedRooms[floor].map((room, index) => {
//                                 // Check if it's the last row and fewer than 3 items remain
//                                 const isLastRow = index >= Math.floor(groupedRooms[floor].length / 3) * 3;
//                                 const remainingItems = groupedRooms[floor].length % 3;

//                                 return (
//                                     <Col
//                                         key={room.roomNumber}
//                                         span={isLastRow && remainingItems === 2 ? 12 : isLastRow && remainingItems === 1 ? 24 : 8}
//                                     >
//                                         <Card size="small" type="inner" title={`ชื่อห้อง: ${room.roomNumber}`}>
//                                             <p>ชื่อห้องที่ต้องการแก้ไข: <Input defaultValue={room.roomNumber} /></p>
//                                                 ลบ
//                                             </Button>
//                                         </Card>
//                                     </Col>
//                                 );
//                             })}
//                         </Row>
//                     </Panel>
//                 ))}
//             </Collapse>



//พื่้นที่ว่างทึบ
{/* <Collapse size="small">
    {Object.keys(groupedRooms).map((floor) => (
        <Panel header={`ชั้นที่ ${floor}`} key={floor}>
            <Row gutter={[16, 16]}>
                {groupedRooms[floor].map((room, index) => {
                    return (
                        <Col key={room.roomNumber} span={8}>
                            <Card size="small" type="inner" title={`ชื่อห้อง: ${room.roomNumber}`}>
                                <p>ชื่อห้องที่ต้องการแก้ไข: <Input defaultValue={room.roomNumber} /></p>
                                    ลบ
                                </Button>
                            </Card>
                        </Col>
                    );
                })}

             
                {groupedRooms[floor].length % 3 === 1 && (
                    <>
                        <Col span={8} style={{ backgroundColor: '#D3D3D3' }}></Col>
                        <Col span={8} style={{ backgroundColor: '#D3D3D3' }}></Col>
                    </>
                )}
                {groupedRooms[floor].length % 3 === 2 && (
                    <Col span={8} style={{ backgroundColor: '#D3D3D3' }}></Col>
                )}
            </Row>
        </Panel>
    ))}
</Collapse> */}