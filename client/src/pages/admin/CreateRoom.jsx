import { Paper, TextField, Typography } from '@mui/material';
import { Button, Card, Form, Input, InputNumber, Collapse, Row, Col, Radio, Flex } from 'antd';
import React, { useState } from 'react';

const { Panel } = Collapse;

const CreateRoom = () => {
    const [floors, setFloors] = useState(1);
    const [roomsPerFloor, setRoomsPerFloor] = useState(1);
    const [disabled, setDisable] = useState(true)
    const [count, setCount] = useState(3);
    const [price, setPrice] = useState();

    const [rooms, setRooms] = useState([]);
    console.log(`⩇⩇:⩇⩇🚨  file: CreateRoom.jsx:14  rooms :`, rooms);


    const handleAddRooms = () => {
        const newRooms = [];
        for (let i = 1; i <= floors; i++) {
            for (let j = 1; j <= roomsPerFloor; j++) {
                // newRooms.push({ floor: i, roomNumber: `${i}${j.toString().padStart(2, '0')}` });
                newRooms.push({ floor: i, roomNumber: i * 10 ** (count - 1) + (j - 1), price });
            }
        }
        setRooms(newRooms);
        setDisable(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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



    return (
        <form onSubmit={handleSubmit}>
            <Form.Item name="floor" label="จำนวนชั้น">
                <InputNumber
                    defaultValue={floors}
                    onChange={(e) => setFloors(e)}
                    min="1"
                    style={{ width: 200 }}
                />
            </Form.Item>

            <Form.Item name="room" label="จำนวนห้องต่อชั้น">
                <InputNumber
                    defaultValue={roomsPerFloor}
                    onChange={(e) => setRoomsPerFloor(e)}
                    min="1"
                    style={{ width: 200 }}
                />
            </Form.Item>

            <Form.Item name="count" label="จำนวนหลักของเลขห้อง">
                <InputNumber
                    defaultValue={count}
                    onChange={(e) => setCount(e)}
                    min="1"
                    style={{ width: 200 }}
                />
            </Form.Item>


            <Form.Item name="price" label="ราคาห้อง">
                <InputNumber
                    defaultValue={price}
                    onChange={(e) => setPrice(e)}
                    min="0"
                    style={{ width: 200 }}
                />
            </Form.Item>
            {/* 
            <Radio.Group >
                <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    onClick={handleAddRooms}>สร้างห้อง</Radio.Group>
                <Radio.Button
                    disabled={disabled} >บันทึก</Radio.Button>
            </Radio.Group> */}
            <Flex gap="small" wrap>
                {/* <Button type="primary" onClick={handleAddRooms}>
                    สร้างห้อง
                </Button>
                <Button
                    type="primary"
                    disabled={disabled}
                >
                    บันทึก
                </Button> */}
                <Radio.Group defaultValue="a" buttonStyle="solid">
                    <Radio.Button onClick={handleAddRooms} value={'a'}>สร้างห้อง</Radio.Button>
                    <Radio.Button disabled={disabled} value={'b'}>บันทึก</Radio.Button>

                </Radio.Group>
            </Flex>

            {/* <Button type="primary" onClick={handleAddRooms}>
                สร้างห้อง
            </Button> */}

            {/* {!groupedRooms && ()} */}
            {/* <Button
                type="primary"
                disabled={disabled}
            >
                บันทึก
            </Button> */}

            <h3>ห้องที่สร้าง:</h3>
            <Collapse size="small">
                {Object.keys(groupedRooms).map((floor) => (
                    <Panel header={`ชั้นที่ ${floor}`} key={floor} >
                        <ul>
                            <Row gutter={[8, 8]}>
                                {groupedRooms[floor].map((room) => (
                                    <Col span={8} key={room.roomNumber}>
                                        <Card size="small" type="inner" key={room.roomNumber} title={`ชื่อห้อง: ${room.roomNumber}`}>
                                            <p>ชื่อห้องที่ต้องการแก้ไข: <Input defaultValue={room.roomNumber} /></p>
                                            <Button type="danger" onClick={() => console.log(`Delete room ${room.roomNumber}`)}>
                                                ลบ
                                            </Button>
                                        </Card>
                                    </Col>


                                ))}
                            </Row>

                        </ul>

                    </Panel>

                ))}

            </Collapse>
            {/* <Button type="primary" >
                บันทึก
            </Button> */}
        </form>
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
//                                             <Button type="danger" onClick={() => console.log(`Delete room ${room.roomNumber}`)}>
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
                                <Button type="danger" onClick={() => console.log(`Delete room ${room.roomNumber}`)}>
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