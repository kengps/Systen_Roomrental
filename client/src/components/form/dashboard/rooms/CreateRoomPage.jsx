import React, { useState } from 'react';

import { UserOutlined } from '@ant-design/icons';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

// import { Box, Paper, TextField, Typography, InputAdornment, Button, } from '@mui/material';
// import { Card, Col, Collapse, Input, Row } from 'antd';
// const { Panel } = Collapse
import { Grid, Card, CardContent, Typography, TextField, Button, Box, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import { InputNumber, Collapse, Row, Col, Input } from 'antd';
import CustomInputController from '../utilities/CustomInputController';
const { Panel } = Collapse
const CreateRoomPage = ({ register, errors, handleSubmit, onFinish, onSubmit, rooms, handleAddRooms, disabled, groupedRooms, floors, roomsPerFloor, price, count, control, deleteRoom }) => {

    // const onFinish = (values) => {
    //     console.log('Success:', values);
    // };

    const ExpandMore = styled((props) => {
        const { expand, ...other } = props;
        return <ExpandMoreIcon {...other} />;
    })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    }));


    const [expanded, setExpanded] = React.useState({});

    const handleExpandClick = (floor) => {
        setExpanded((prev) => ({
            ...prev,
            [floor]: !prev[floor],
        }));

    }
    return (
        // <>
        //     <Box component="form" >
        //         <TextField
        //             fullWidth
        //             label="จำนวนชั้น"
        //             margin="normal"
        //             {...register('floor', {
        //                 required: 'floor is required',
        //                 minLength: {
        //                     value: 1,
        //                     message: 'floor must be at least 3 characters',
        //                 },
        //             })}
        //             error={!!errors.floor}
        //             helperText={errors.floor?.message}
        //             slotProps={{
        //                 input: {
        //                     startAdornment: (
        //                         <InputAdornment position="start">
        //                             <AccountCircleOutlinedIcon />
        //                         </InputAdornment>
        //                     ),
        //                 },
        //             }}

        //         />


        //         <TextField
        //             fullWidth
        //             label="จำนวนห้องต่อชั้น"
        //             margin="normal"
        //             {...register('roomPerFloor', {
        //                 required: 'roomPerFloor is required',
        //                 minLength: {
        //                     value: 1,
        //                     message: 'roomPerFloor must be at least 3 characters',
        //                 },
        //             })}
        //             error={!!errors.roomPerFloor}
        //             helperText={errors.roomPerFloor?.message}
        //             slotProps={{
        //                 input: {
        //                     startAdornment: (
        //                         <InputAdornment position="start">
        //                             <AccountCircleOutlinedIcon />
        //                         </InputAdornment>
        //                     ),
        //                 },
        //             }}

        //         />
        //         <TextField
        //             fullWidth
        //             label="หลักเลขห้อง"
        //             margin="normal"
        //             {...register('count', {
        //                 required: 'count is required',
        //                 minLength: {
        //                     value: 1,
        //                     message: 'price must be at least 3 characters',
        //                 },
        //             })}
        //             error={!!errors.count}
        //             helperText={errors.count?.message}
        //             slotProps={{
        //                 input: {
        //                     startAdornment: (
        //                         <InputAdornment position="start">
        //                             <AccountCircleOutlinedIcon />
        //                         </InputAdornment>
        //                     ),
        //                 },
        //             }}


        //         />

        //         <TextField
        //             fullWidth
        //             label="ราคา"
        //             margin="normal"
        //             {...register('price', {
        //                 required: 'roomPerFlpriceoor is required',
        //                 minLength: {
        //                     value: 1,
        //                     message: 'price must be at least 3 characters',
        //                 },
        //             })}
        //             error={!!errors.price}
        //             helperText={errors.price?.message}
        //             slotProps={{
        //                 input: {
        //                     startAdornment: (
        //                         <InputAdornment position="start">
        //                             <AccountCircleOutlinedIcon />
        //                         </InputAdornment>
        //                     ),
        //                 },
        //             }}


        //         />

        //         <Button
        //             type="submit"
        //             fullWidth
        //             variant="contained"
        //             color="primary"
        //             sx={{ mt: 2 }}
        //             onClick={handleSubmit(handleAddRooms)}
        //         >
        //             แสดง
        //         </Button>

        //         <Button
        //             type="submit"
        //             fullWidth
        //             variant="contained"
        //             color="primary"
        //             sx={{ mt: 2 }}
        //             disabled={disabled}
        //             onClick={handleSubmit(onSubmit)}
        //         >
        //             ตกลง
        //         </Button>
        //         <Typography>ห้องที่สร้าง</Typography>


        //         <div>
        //             {Object.keys(groupedRooms).map((floor) => (
        //                 <div key={floor}>
        //                     <Card>
        //                         <CardContent onClick={() => handleExpandClick(floor)}>
        //                             <Typography variant="h6">ชั้นที่ {floor}</Typography>
        //                             <ExpandMore expand={expanded[floor]} />
        //                         </CardContent>

        //                         <Collapse in={expanded[floor]} timeout="auto" unmountOnExit>
        //                             <Grid container spacing={2} sx={{ padding: 2 }}>
        //                                 {groupedRooms[floor].map((room) => (
        //                                     <Grid item xs={12} sm={6} md={4} key={room.roomNumber}>
        //                                         <Card>
        //                                             <CardContent>
        //                                                 <Typography variant="subtitle1">ชื่อห้อง: {room.roomNumber}</Typography>
        //                                                 <TextField
        //                                                     fullWidth
        //                                                     defaultValue={room.roomNumber}
        //                                                     label="ชื่อห้องที่ต้องการแก้ไข"
        //                                                     variant="outlined"
        //                                                 />
        //                                                 <Button
        //                                                     variant="contained"
        //                                                     color="error"
        //                                                     onClick={() => console.log(`Delete room ${room.roomNumber}`)}
        //                                                     sx={{ mt: 2 }}
        //                                                 >
        //                                                     ลบ
        //                                                 </Button>
        //                                             </CardContent>
        //                                         </Card>
        //                                     </Grid>
        //                                 ))}
        //                             </Grid>
        //                         </Collapse>
        //                     </Card>
        //                 </div>
        //             ))}
        //         </div>

        //     </Box>

        // </>
        <Box component="form" >
            <CustomInputController
                name="floor"
                control={control}
                label="ชั้น"
                rules={{
                    required: 'floor is required',
                    min: { value: 1, message: 'floor must be at least 1' },
                }}
                min={1}
                prefix={<AccountCircleOutlinedIcon />}
                errors={errors}
            />

            <CustomInputController
                name="roomPerFloor"
                control={control}
                label="จำนวนห้อง"
                rules={{
                    required: 'floor is required',
                    min: { value: 1, message: 'floor must be at least 1' },
                }}
                min={1}
                prefix={<AccountCircleOutlinedIcon />}
                errors={errors}
            />

            <CustomInputController
                name="count"
                control={control}
                label="หลักเลขห้อง"
                rules={{
                    required: 'floor is required',
                    min: { value: 1, message: 'floor must be at least 1' },
                }}
                min={1}
                prefix={<AccountCircleOutlinedIcon />}
                errors={errors}
            />

            {/* <div>
                <label>จำนวนชั้น</label>
                <Controller
                    name="floor"
                    control={control}
                    rules={{
                        required: 'floor is required',
                        min: { value: 1, message: 'floor must be at least 1' },
                    }}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            style={{ width: '100%' }}
                            min={1}
                            prefix={<AccountCircleOutlinedIcon />}
                            onChange={(value) => field.onChange(value)} // update value in react-hook-form
                        />
                    )}
                />
                {errors.floor && <p>{errors.floor.message}</p>}
            </div>

            <div>
                <label>จำนวนห้องต่อชั้น</label>
                <Controller
                    name="roomPerFloor"
                    control={control}
                    rules={{
                        required: 'roomPerFloor is required',
                        min: { value: 1, message: 'roomPerFloor must be at least 1' },
                    }}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            style={{ width: '100%' }}
                            min={1}
                            prefix={<AccountCircleOutlinedIcon />}
                            onChange={(value) => field.onChange(value)}
                        />
                    )}
                />
                {errors.roomPerFloor && <p>{errors.roomPerFloor.message}</p>}
            </div>

            <div>
                <label>หลักเลขห้อง</label>
                <Controller
                    name="count"
                    control={control}
                    rules={{
                        required: 'count is required',
                        min: { value: 1, message: 'count must be at least 1' },
                    }}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            style={{ width: '100%' }}
                            min={1}
                            prefix={<AccountCircleOutlinedIcon />}
                            onChange={(value) => field.onChange(value)}
                        />
                    )}
                />
                {errors.count && <p>{errors.count.message}</p>}
            </div> */}

            {/* <div>
                <label>ราคา</label>
                <Controller
                    name="price"
                    control={control}
                    rules={{
                        required: 'price is required',
                        min: { value: 1, message: 'price must be at least 1' },
                    }}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            style={{ width: '100%' }}
                            min={1}
                            prefix={<AccountCircleOutlinedIcon />}
                            onChange={(value) => field.onChange(value)}
                        />
                    )}
                />
                {errors.price && <p>{errors.price.message}</p>}
            </div> */}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit(handleAddRooms)}
            >
                แสดง
            </Button>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={disabled}
                onClick={handleSubmit(onSubmit)}
            >
                ตกลง
            </Button>
            <Collapse style={{ marginTop: '5px' }}>
                {Object.keys(groupedRooms).map((floor) => {
                    return (
                        <Panel header={`ชั้นที่ ${floor}`} key={floor}>
                            <Row gutter={[16, 16]}>
                                {groupedRooms[floor].map((room) => {
                                    return (
                                        <Col span={8} key={room.roomNumber}>
                                            <Card size="small" type="inner" title={`ชื่อห้อง: ${room.roomNumber}`}>
                                                <Input size="large" addonBefore="ห้อง" defaultValue={room.roomNumber} />
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        type="danger"
                                                        onClick={(e) => deleteRoom(e, room.roomNumber)}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </div>
                                            </Card>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </Panel>
                    )
                })}
            </Collapse>

        </Box>
    )
}

export default CreateRoomPage

























//! ถ้าใช้ antd
// <Collapse size="small">
// {Object.keys(groupedRooms).map((floor) => (
//     <Panel header={`ชั้นที่ ${floor}`} key={floor}>
//         <Row gutter={[16, 16]}>
//             {groupedRooms[floor].map((room) => (
//                 <Col span={8} key={room.roomNumber}>  {/* กำหนดขนาดและ key */}
//                     <Card size="small" type="inner" title={`ชื่อห้อง: ${room.roomNumber}`}>
//                         <p>ชื่อห้องที่ต้องการแก้ไข: <Input defaultValue={room.roomNumber} /></p>
//                         <Button type="danger" onClick={() => console.log(`Delete room ${room.roomNumber}`)}>
//                             ลบ
//                         </Button>
//                     </Card>
//                 </Col>
//             ))}
//         </Row>
//     </Panel>
// ))}
// </Collapse>