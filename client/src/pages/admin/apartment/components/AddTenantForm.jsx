import {
    CloseOutlined,
    DeleteOutlined,
    DollarCircleOutlined,
    EditOutlined,
    FileDoneOutlined,
    KeyOutlined,
    LockOutlined,
    PhoneOutlined,
    PlusOutlined,
    RightOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Form,
    Input,
    InputNumber,
    Upload,
    List,
    message,
    Modal,
    Radio,
    Row,
    Select,
    Space,
    Tag,
    Typography
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";

import {optionsPrefix} from "../utility/selectOptions.js";
import EditTenantForm from "./EditTanantForm.jsx";
import {addTenantSchema} from "../validations/tenants-valid.js";
import {useFloorRoomSelector} from "../../../../contexts/selectedFloorContext.jsx";
// ตั้งค่าภาษาไทยสำหรับ dayjs
dayjs.locale("th");
dayjs.extend(relativeTime);

const {Title, Text} = Typography;
const {Option} = Select;


// --- ฟอร์มเพิ่มผู้เช่า (AddTenantForm) ---
const AddTenantForm = ({onFinish, onCancel, rooms}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const {
        control, handleSubmit, setValue, formState: {errors},
    } = useForm({
        resolver: zodResolver(addTenantSchema), defaultValues: {
            prefix: "นาย",
            moveInDate: new Date(),
            contractDuration: 3,
            username: "",
            password: "",
            nickName: "",
            nationalId: "",
            address: "",
            email: "",
            facebook: "",
            lineId: "",
            education: "",
            faculty: "",
            majorOrPosition: "",
            studentOrEmployeeId: "",
            emergencyName: "",
            emergencyRelation: "",
            emergencyPhone: "",
            vehicleType: "",
            vehicleDetail: "",
            vehiclePlate: "",
            wifiCode: "",
            internetCode: "",
            remarks: "",
        },
    });
    // const [selectedFloor, setSelectedFloor] = useState(null);
    // const [availableRoomsForFloor, setAvailableRoomsForFloor] = useState([]);
    //
    // const handleFloorChange = (floor) => {
    //     setSelectedFloor(floor);
    //     const roomsData = rooms
    //         .sort((a, b) => a.roomNumber - b.roomNumber)
    //         .filter((room) => room.floor === floor && room.status === "available");
    //     setAvailableRoomsForFloor(roomsData);
    //     setValue("floor", floor, {shouldValidate: true});
    //     setValue("roomId", undefined, {shouldValidate: true});
    //     setValue("roomNumber", undefined);
    //     setValue("price", undefined);
    // };
    //
    // const handleRoomChange = (roomId) => {
    //     const room = availableRoomsForFloor.find((r) => r._id === roomId);
    //     if (room) {
    //         setValue("roomId", room._id, {shouldValidate: true});
    //         setValue("roomNumber", room.roomNumber);
    //         setValue("price", room.price);
    //     }
    // };
    //
    // const availableFloors = [...new Set(rooms
    //     ?.filter((item) => item.status === "available")
    //     .map((item) => item.floor) || []),];

    const {
        selectedFloor,
        availableRoomsForFloor,
        availableFloors,
        handleFloorChange,
        handleRoomChange,
    } = useFloorRoomSelector({
        rooms,
        setValue, // ถ้าใช้ react-hook-form
    });


    return (<Form layout="vertical" onFinish={handleSubmit(onFinish)}>
        <Divider orientation="left">ข้อมูลผู้เช่า</Divider>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={4}>
                <Form.Item label="คำนำหน้า" required>
                    <Controller
                        name="prefix"
                        control={control}
                        render={({field}) => (<Select {...field} size={isMobile ? "small" : "middle"}>
                            {optionsPrefix.map((option) => (<Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>))}
                        </Select>)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
                <Form.Item
                    label="ชื่อจริง"
                    required
                    validateStatus={errors.firstName ? "error" : ""}
                    help={errors.firstName?.message}
                >
                    <Controller
                        name="firstName"
                        control={control}
                        render={({field}) => (<Input
                            {...field}
                            prefix={<UserOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
                <Form.Item
                    label="นามสกุล"
                    required
                    validateStatus={errors.lastName ? "error" : ""}
                    help={errors.lastName?.message}
                >
                    <Controller
                        name="lastName"
                        control={control}
                        render={({field}) => (<Input
                            {...field}
                            prefix={<UserOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={8}>
                <Form.Item label="ชื่อเล่น">
                    <Controller name="nickName" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="หมายเลขบัตรประชาชน">
                    <Controller name="nationalId" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="Line ID">
                    <Controller name="lineId" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item
            label="เบอร์โทรศัพท์"
            required
            validateStatus={errors.phoneNumber ? "error" : ""}
            help={errors.phoneNumber?.message}
        >
            <Controller
                name="phoneNumber"
                control={control}
                render={({field}) => (<Input
                    {...field}
                    prefix={<PhoneOutlined/>}
                    size={isMobile ? "small" : "middle"}
                />)}
            />
        </Form.Item>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                    <Controller name="email" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="Facebook">
                    <Controller name="facebook" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item label="ที่อยู่ตามทะเบียนบ้าน">
            <Controller name="address" control={control}
                        render={({field}) => (<Input.TextArea {...field} rows={2}/>)}/>
        </Form.Item>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item label="สถาบันการศึกษา / สถานที่ทำงานปัจจุบัน">
                    <Controller name="education" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="คณะ / แผนก">
                    <Controller name="faculty" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item label="ภาควิชา">
                    <Controller name="majorOrPosition" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="รหัสนักศึกษา / รหัสพนักงาน">
                    <Controller name="studentOrEmployeeId" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={8}>
                <Form.Item label="บุคคลที่ติดต่อในกรณีฉุกเฉิน">
                    <Controller name="emergencyName" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="ความสัมพันธ์">
                    <Controller name="emergencyRelation" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="เบอร์โทรผู้ติดต่อฉุกเฉิน">
                    <Controller name="emergencyPhone" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Divider orientation="left">ยานพาหนะ</Divider>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={8}>
                <Form.Item label="ชนิด">
                    <Controller name="vehicleType" control={control}
                                render={({field}) => (<Select {...field} size={isMobile ? 'small' : 'middle'}>
                                    <Option value="car">รถยนต์</Option>
                                    <Option value="motorcycle">รถจักรยานยนต์</Option>
                                </Select>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="รายละเอียดรถ">
                    <Controller name="vehicleDetail" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="ทะเบียน">
                    <Controller name="vehiclePlate" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Divider orientation="left">ข้อมูลการเข้าพัก</Divider>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={8}>
                <Form.Item
                    label="เลือกชั้น"
                    required
                    validateStatus={errors.floor ? "error" : ""}
                    help={errors.floor?.message}
                >
                    <Controller
                        name="floor"
                        control={control}
                        render={({field}) => (<Select
                            {...field}
                            placeholder="เลือกชั้น"
                            onChange={handleFloorChange}
                            size={isMobile ? "small" : "middle"}
                        >
                            {availableFloors
                                .slice()
                                .sort((a, b) => a - b)
                                .map((f) => (<Option key={f} value={f}>
                                    ชั้น {f}
                                </Option>))}
                        </Select>)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item
                    label="เลือกห้อง"
                    required
                    validateStatus={errors.roomId ? "error" : ""}
                    help={errors.roomId?.message}
                >
                    <Controller
                        name="roomId"
                        control={control}
                        render={({field}) => (<Select
                            {...field}
                            placeholder="เลือกห้อง"
                            disabled={!selectedFloor}
                            onChange={handleRoomChange}
                            size={isMobile ? "small" : "middle"}
                        >
                            {availableRoomsForFloor.map((r) => (<Option key={r._id} value={r._id}>
                                ห้อง {r.roomNumber}
                            </Option>))}
                        </Select>)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item label="ราคาห้องพัก">
                    <Controller
                        name="price"
                        control={control}
                        render={({field}) => (<Input
                            {...field}
                            disabled
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={8}>
                <Form.Item
                    label="ค่ามัดจำ (บาท)"
                    required
                    validateStatus={errors.deposit ? "error" : ""}
                    help={errors.deposit?.message}
                >
                    <Controller
                        name="deposit"
                        control={control}
                        render={({field}) => (<InputNumber
                            min={0}
                            {...field}
                            style={{width: "100%"}}
                            prefix={<DollarCircleOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item
                    label="ระยะเวลาสัญญา (เดือน)"
                    required
                    validateStatus={errors.contractDuration ? "error" : ""}
                    help={errors.contractDuration?.message}
                >
                    <Controller
                        name="contractDuration"
                        control={control}
                        render={({field}) => (<InputNumber
                            min={0}
                            {...field}
                            style={{width: "100%"}}
                            prefix={<FileDoneOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item
                    label="วันที่เข้าพัก"
                    required
                    validateStatus={errors.moveInDate ? "error" : ""}
                    help={errors.moveInDate?.message}
                >
                    <Controller
                        name="moveInDate"
                        control={control}
                        render={({field}) => (<DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            style={{width: "100%"}}
                            format="DD MMMM YYYY"
                            onChange={(date) => field.onChange(date ? date.toDate() : null)}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Divider orientation="left">แอคเคาท์เข้าระบบ</Divider>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item
                    label="ไอดี"
                    required
                    validateStatus={errors.username ? "error" : ""}
                    help={errors.username?.message}
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({field}) => (<Input
                            {...field}
                            prefix={<UserOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item
                    label="รหัสผ่าน"
                    required
                    validateStatus={errors.password ? "error" : ""}
                    help={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({field}) => (<Input
                            {...field}
                            prefix={<LockOutlined/>}
                            size={isMobile ? "small" : "middle"}
                        />)}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Divider orientation="left">ระบบ/รูปภาพ/หมายเหตุ</Divider>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item label="รหัส WiFi">
                    <Controller name="wifiCode" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="รหัสอินเทอร์เน็ต">
                    <Controller name="internetCode" control={control}
                                render={({field}) => (<Input {...field} size={isMobile ? 'small' : 'middle'}/>)}/>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={isMobile ? [8, 0] : [24, 0]}>
            <Col xs={24} sm={12}>
                <Form.Item label="แนบบัตรประชาชน/หลักฐาน">
                    <Upload listType="picture-card" beforeUpload={() => false} multiple>
                        <div>อัปโหลด</div>
                    </Upload>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="แนบรูปภาพเพิ่มเติม">
                    <Upload listType="picture-card" beforeUpload={() => false} multiple>
                        <div>อัปโหลด</div>
                    </Upload>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item label="หมายเหตุ">
            <Controller name="remarks" control={control}
                        render={({field}) => (<Input.TextArea {...field} rows={3}/>)}/>
        </Form.Item>

        <div style={{
            textAlign: isMobile ? "center" : "right", marginTop: 24
        }}>
            <Space direction={isMobile ? "vertical" : "horizontal"} style={{width: isMobile ? "100%" : "auto"}}>
                <Button
                    onClick={onCancel}
                    size={isMobile ? "small" : "middle"}
                    style={{width: isMobile ? "100%" : "auto"}}
                >
                    ยกเลิก
                </Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    size={isMobile ? "small" : "middle"}
                    style={{width: isMobile ? "100%" : "auto"}}
                >
                    บันทึก
                </Button>
            </Space>
        </div>
    </Form>);
};
export default AddTenantForm;