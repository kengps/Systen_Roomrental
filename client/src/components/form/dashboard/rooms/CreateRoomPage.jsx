// import React from 'react';
// import { Controller } from 'react-hook-form';
// import {
//     Box,
//     Grid,
//     Card,
//     Typography,
//     TextField,
//     Button,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     IconButton,
//     Paper,
//     Divider,
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import DeleteIcon from '@mui/icons-material/Delete';
// import ApartmentIcon from '@mui/icons-material/Apartment';
// import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
// import LooksOneIcon from '@mui/icons-material/LooksOne';
// import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
// import SaveIcon from '@mui/icons-material/Save';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


// const CreateRoomPage = ({
//     control,
//     errors,
//     handleSubmit,
//     handleAddRooms,
//     onSubmit,
//     deleteRoom,
//     groupedRooms = {},
//     disabled,
// }) => {
//     // State สำหรับจัดการการเปิด/ปิด Accordion ของแต่ละชั้น
//     const [expandedFloor, setExpandedFloor] = React.useState(false);

//     const handleAccordionChange = (panel) => (event, isExpanded) => {
//         setExpandedFloor(isExpanded ? panel : false);
//     };

//     const hasRooms = Object.keys(groupedRooms).length > 0;

//     return (
//         <Box
//             component="form"
//             sx={{
//                 maxWidth: 900,
//                 margin: 'auto',
//                 padding: { xs: 2, md: 3 },
//                 background: 'linear-gradient(to bottom right, #f7f8fa, #e9eef5)',
//                 minHeight: '100vh',
//             }}
//         >
//             <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//                 สร้างห้องพักใหม่
//             </Typography>
//             <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
//                 กำหนดโครงสร้างของอาคาร ดูตัวอย่างห้องพัก แล้วจึงบันทึกข้อมูล
//             </Typography>

//             {/* ส่วนที่ 1: ตั้งค่าโครงสร้าง */}
//             <Paper
//                 elevation={3}
//                 sx={{
//                     p: { xs: 2, md: 3 },
//                     mb: 4,
//                     borderRadius: 4,
//                     background: 'rgba(255, 255, 255, 0.7)',
//                     backdropFilter: 'blur(10px)',
//                     border: '1px solid rgba(255, 255, 255, 0.2)'
//                 }}
//             >
//                 <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
//                     ตั้งค่าอาคาร
//                 </Typography>
//                 <Grid container spacing={3}>
//                     {/* Controller สำหรับ จำนวนชั้น */}
//                     <Grid item xs={12} sm={4}>
//                         <Controller
//                             name="floor"
//                             control={control}
//                             rules={{ required: 'กรุณาระบุจำนวนชั้น', min: { value: 1, message: 'ต้องมีอย่างน้อย 1 ชั้น' } }}
//                             render={({ field }) => (
//                                 <TextField
//                                     {...field}
//                                     fullWidth
//                                     type="number"
//                                     label="จำนวนชั้น"
//                                     error={!!errors.floor}
//                                     helperText={errors.floor?.message}
//                                     InputProps={{ startAdornment: <ApartmentIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
//                                 />
//                             )}
//                         />
//                     </Grid>

//                     {/* Controller สำหรับ จำนวนห้องต่อชั้น */}
//                     <Grid item xs={12} sm={4}>
//                         <Controller
//                             name="roomPerFloor"
//                             control={control}
//                             rules={{ required: 'กรุณาระบุจำนวนห้องต่อชั้น', min: { value: 1, message: 'ต้องมีอย่างน้อย 1 ห้อง' } }}
//                             render={({ field }) => (
//                                 <TextField
//                                     {...field}
//                                     fullWidth
//                                     type="number"
//                                     label="จำนวนห้องต่อชั้น"
//                                     error={!!errors.roomPerFloor}
//                                     helperText={errors.roomPerFloor?.message}
//                                     InputProps={{ startAdornment: <MeetingRoomIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
//                                 />
//                             )}
//                         />
//                     </Grid>

//                     {/* Controller สำหรับ หลักของเลขห้อง */}
//                     <Grid item xs={12} sm={4}>
//                         <Controller
//                             name="count"
//                             control={control}
//                             rules={{ required: 'กรุณาระบุหลักของเลขห้อง', min: { value: 1, message: 'ต้องมีอย่างน้อย 1 หลัก' } }}
//                             render={({ field }) => (
//                                 <TextField
//                                     {...field}
//                                     fullWidth
//                                     type="number"
//                                     label="หลักของเลขห้อง"
//                                     error={!!errors.count}
//                                     helperText={errors.count?.message}
//                                     InputProps={{ startAdornment: <LooksOneIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
//                                 />
//                             )}
//                         />
//                     </Grid>

//                     <Grid item xs={12}>
//                         <Button
//                             variant="contained"
//                             size="large"
//                             onClick={handleSubmit(handleAddRooms)}
//                             startIcon={<PlaylistAddCheckIcon />}
//                             sx={{ width: { xs: '100%', sm: 'auto' } }}
//                         >
//                             สร้างตัวอย่าง
//                         </Button>
//                     </Grid>
//                 </Grid>
//             </Paper>

//             {/* ส่วนที่ 2: แสดงตัวอย่างห้องพัก */}
//             {hasRooms ? (
//                 <Box>
//                     <Divider sx={{ my: 4 }}>
//                         <Typography variant="h6" color="text.secondary">ตัวอย่างห้องพัก</Typography>
//                     </Divider>

//                     {Object.keys(groupedRooms).map((floor) => (
//                         <Accordion
//                             key={floor}
//                             expanded={expandedFloor === floor}
//                             onChange={handleAccordionChange(floor)}
//                             sx={{
//                                 boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//                                 '&:before': { display: 'none' },
//                                 mb: 1,
//                                 borderRadius: 2,
//                                 '&.Mui-expanded': {
//                                     margin: '8px 0',
//                                 },
//                             }}
//                         >
//                             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                                 <Typography variant="h6" component="div">
//                                     ชั้นที่ {floor}
//                                 </Typography>
//                                 <Typography sx={{ color: 'text.secondary', ml: 2 }}>
//                                     ({groupedRooms[floor].length} ห้อง)
//                                 </Typography>
//                             </AccordionSummary>
//                             <AccordionDetails sx={{ backgroundColor: '#fdfdfd', borderTop: '1px solid #eee' }}>
//                                 <Grid container spacing={2}>
//                                     {groupedRooms[floor].map((room) => (
//                                         <Grid item xs={12} sm={6} md={4} key={room.roomNumber}>
//                                             <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderRadius: 2 }}>
//                                                 <Box sx={{ flexGrow: 1 }}>
//                                                     <Typography variant="body1" fontWeight="medium">
//                                                         ชื่อห้อง: {room.roomNumber}
//                                                     </Typography>
//                                                 </Box>
//                                                 <IconButton
//                                                     aria-label="delete room"
//                                                     color="error"
//                                                     onClick={(e) => deleteRoom(e, room.roomNumber)}
//                                                 >
//                                                     <DeleteIcon />
//                                                 </IconButton>
//                                             </Card>
//                                         </Grid>
//                                     ))}
//                                 </Grid>
//                             </AccordionDetails>
//                         </Accordion>
//                     ))}

//                     <Button
//                         type="submit"
//                         fullWidth
//                         variant="contained"
//                         color="success"
//                         size="large"
//                         disabled={disabled}
//                         onClick={handleSubmit(onSubmit)}
//                         startIcon={<SaveIcon />}
//                         sx={{ mt: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
//                     >
//                         บันทึกห้องทั้งหมด
//                     </Button>
//                 </Box>
//             ) : (
//                 <Box textAlign="center" p={5} sx={{
//                     background: 'rgba(255, 255, 255, 0.7)',
//                     borderRadius: 4,
//                     mt: 4
//                 }}>
//                     <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//                     <Typography variant="h6" color="text.secondary">
//                         ยังไม่มีข้อมูลห้องพัก
//                     </Typography>
//                     <Typography color="text.secondary">
//                         กรุณากรอกข้อมูลด้านบนและกด "สร้างตัวอย่าง" เพื่อดูรายการห้องพัก
//                     </Typography>
//                 </Box>
//             )}
//         </Box>
//     );
// };

// export default CreateRoomPage;







import React from 'react';
import { Controller } from 'react-hook-form';
import { Collapse, Input, Button, Card, Typography, Row, Col, Divider, Empty } from 'antd';
import {
    ApartmentOutlined,
    NumberOutlined,
    AppstoreAddOutlined,
    DeleteOutlined,
    SaveOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const CreateRoomPage = ({
    control,
    errors,
    handleSubmit,
    handleAddRooms,
    onSubmit,
    deleteRoom,
    groupedRooms = {},
    disabled,
}) => {
    const [expandedFloor, setExpandedFloor] = React.useState([]);

    const handleAccordionChange = (keys) => {
        setExpandedFloor(keys);
    };

    const hasRooms = Object.keys(groupedRooms).length > 0;

    const collapseItems = Object.keys(groupedRooms).map((floor) => ({
        key: floor,
        label: (
            <Typography.Text strong>
                ชั้นที่ {floor} ({groupedRooms[floor].length} ห้อง)
            </Typography.Text>
        ),
        children: (
            <Row gutter={[16, 16]}>
                {groupedRooms[floor].map((room) => (
                    <Col xs={24} sm={12} md={8} key={room.roomNumber}>
                        <Card
                            hoverable
                            style={{ borderRadius: 10 }}
                            styles={{ body: { padding: 12 } }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography.Text strong>ห้อง {room.roomNumber}</Typography.Text>
                                <DeleteOutlined
                                    style={{ color: '#ff4d4f' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRoom(e, room.roomNumber);
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        )
    }));

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>สร้างห้องพักใหม่</Typography.Title>

            <Card variant="borderless" style={{ marginBottom: 32, padding: 24 }}>
                <Typography.Title level={4}>ตั้งค่าอาคาร</Typography.Title>
                <Row gutter={16}>
                    <Col span={8}>
                        <Controller
                            name="floor"
                            control={control}
                            rules={{ required: 'กรุณาระบุจำนวนชั้น', min: 1 }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    placeholder="จำนวนชั้น"
                                    prefix={<ApartmentOutlined />}
                                    status={errors.floor ? 'error' : ''}
                                    size="large"
                                />
                            )}
                        />
                        {errors.floor && <Typography.Text type="danger">{errors.floor.message}</Typography.Text>}
                    </Col>

                    <Col span={8}>
                        <Controller
                            name="roomPerFloor"
                            control={control}
                            rules={{ required: 'กรุณาระบุจำนวนห้องต่อชั้น', min: 1 }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    placeholder="จำนวนห้องต่อชั้น"
                                    prefix={<AppstoreAddOutlined />}
                                    status={errors.roomPerFloor ? 'error' : ''}
                                    size="large"
                                />
                            )}
                        />
                        {errors.roomPerFloor && <Typography.Text type="danger">{errors.roomPerFloor.message}</Typography.Text>}
                    </Col>

                    <Col span={8}>
                        <Controller
                            name="count"
                            control={control}
                            rules={{ required: 'กรุณาระบุหลักของเลขห้อง', min: 1 }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    placeholder="หลักของเลขห้อง"
                                    prefix={<NumberOutlined />}
                                    status={errors.count ? 'error' : ''}
                                    size="large"
                                />
                            )}
                        />
                        {errors.count && <Typography.Text type="danger">{errors.count.message}</Typography.Text>}
                    </Col>
                </Row>
                <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Button
                        type="primary"
                        icon={<AppstoreAddOutlined />}
                        size="large"
                        onClick={handleSubmit(handleAddRooms)}
                    >
                        สร้างตัวอย่าง
                    </Button>
                </div>
            </Card>

            {hasRooms ? (
                <>
                    <Divider orientation="left">ตัวอย่างห้องพัก</Divider>
                    <Collapse
                        activeKey={expandedFloor}
                        onChange={handleAccordionChange}
                        bordered={false}
                        items={collapseItems}
                        accordion
                        style={{ background: 'white' }}
                    />

                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        size="large"
                        block
                        disabled={disabled}
                        onClick={handleSubmit(onSubmit)}
                        style={{ marginTop: 32 }}
                    >
                        บันทึกห้องทั้งหมด
                    </Button>
                </>
            ) : (
                <div style={{ textAlign: 'center', marginTop: 64 }}>
                    <Empty
                        image={<InfoCircleOutlined style={{ fontSize: 48, color: '#999' }} />}
                        description={
                            <>
                                <p>ยังไม่มีข้อมูลห้องพัก</p>
                                <p>กรุณากรอกข้อมูลด้านบนและกด "สร้างตัวอย่าง" เพื่อดูรายการห้องพัก</p>
                            </>
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default CreateRoomPage;
