import {
    DeleteOutlined,
    DollarCircleOutlined,
    EditOutlined,
    FileDoneOutlined,
    KeyOutlined,
    LockOutlined,
    PhoneOutlined,
    PlusOutlined,
    RightOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import PageHeader from '../../../components/common/PageHeader';
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "react-toastify";
import { addServiceUsageTenant, deleteServiceUsage, getServices, getTenants } from "../../../service/api/apartment";
import { createTenant, getRoom, updateTenancyStatus } from "../../../service/api/rooms";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";

// ตั้งค่าภาษาไทยสำหรับ dayjs
dayjs.locale("th");
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

// --- Zod Schema for Validation ---
const addTenantSchema = z.object({
    prefix: z.string(),
    firstName: z.string().min(1, { message: "กรุณากรอกชื่อจริง" }),
    lastName: z.string().min(1, { message: "กรุณากรอกนามสกุล" }),
    nickName: z.string().optional().or(z.literal('')),
    username: z.string().min(1, { message: "กรุณากรอกไอดี" }),
    password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
    phoneNumber: z
        .string()
        .min(9, { message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" }),
    nationalId: z.string().optional().or(z.literal('')),
    floor: z.number({
        required_error: "กรุณาเลือกชั้น",
        invalid_type_error: "กรุณาเลือกชั้น",
    }),
    roomId: z.string({ required_error: "กรุณาเลือกห้อง" }),
    roomNumber: z.number().optional(),
    price: z.number().optional(),
    deposit: z.coerce
        .number({ invalid_type_error: "กรุณากรอกค่ามัดจำ" })
        .min(1, { message: "ค่ามัดจำต้องเป็นตัวเลขและมากกว่า 0" }),
    contractDuration: z.coerce
        .number()
        .min(1, { message: "กรุณาระบุระยะเวลาสัญญา" }),
    moveInDate: z.date({
        required_error: "กรุณาเลือกวันที่เข้าพัก",
        invalid_type_error: "รูปแบบวันที่ไม่ถูกต้อง",
    }),
    address: z.string().optional().or(z.literal('')),
    email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    facebook: z.string().optional().or(z.literal('')),
    lineId: z.string().optional().or(z.literal('')),
    education: z.string().optional().or(z.literal('')),
    faculty: z.string().optional().or(z.literal('')),
    majorOrPosition: z.string().optional().or(z.literal('')),
    studentOrEmployeeId: z.string().optional().or(z.literal('')),
    emergencyName: z.string().optional().or(z.literal('')),
    emergencyRelation: z.string().optional().or(z.literal('')),
    emergencyPhone: z.string().optional().or(z.literal('')),
    vehicleType: z.string().optional().or(z.literal('')),
    vehicleDetail: z.string().optional().or(z.literal('')),
    vehiclePlate: z.string().optional().or(z.literal('')),
    wifiCode: z.string().optional().or(z.literal('')),
    internetCode: z.string().optional().or(z.literal('')),
    remarks: z.string().optional().or(z.literal('')),
});

const editTenantSchema = z
    .object({
        tenancyStatus: z.enum(["renting", "moved"]),
        moveOutDate: z.date().nullable().optional(),
        disableAccount: z.boolean().default(true).optional(),
    })
    .refine(
        (data) => {
            if (data.tenancyStatus === "moved" && !data.moveOutDate) return false;
            return true;
        },
        { message: "กรุณาระบุวันที่ย้ายออก", path: ["moveOutDate"] }
    );

// --- ฟอร์มเพิ่มผู้เช่า (AddTenantForm) ---
const AddTenantForm = ({ onFinish, onCancel, rooms }) => {
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
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addTenantSchema),
        defaultValues: {
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
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [availableRoomsForFloor, setAvailableRoomsForFloor] = useState([]);

    const handleFloorChange = (floor) => {
        setSelectedFloor(floor);
        const roomsData = rooms
            .sort((a, b) => a.roomNumber - b.roomNumber)
            .filter((room) => room.floor === floor && room.status === "available");
        setAvailableRoomsForFloor(roomsData);
        setValue("floor", floor, { shouldValidate: true });
        setValue("roomId", undefined, { shouldValidate: true });
        setValue("roomNumber", undefined);
        setValue("price", undefined);
    };

    const handleRoomChange = (roomId) => {
        const room = availableRoomsForFloor.find((r) => r._id === roomId);
        if (room) {
            setValue("roomId", room._id, { shouldValidate: true });
            setValue("roomNumber", room.roomNumber);
            setValue("price", room.price);
        }
    };

    const availableFloors = [
        ...new Set(
            rooms
                ?.filter((item) => item.status === "available")
                .map((item) => item.floor) || []
        ),
    ];

    const optionsPrefix = [
        { label: "นาย", value: "นาย" },
        { label: "นาง", value: "นาง" },
        { label: "นางสาว", value: "นางสาว" },
        { label: "Mr.", value: "Mr." },
        { label: "Ms.", value: "Ms." },
    ];



    return (
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
            <Divider orientation="left">ข้อมูลผู้เช่า</Divider>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={4}>
                    <Form.Item label="คำนำหน้า" required>
                        <Controller
                            name="prefix"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} size={isMobile ? "small" : "middle"}>
                                    {optionsPrefix.map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            )}
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
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={8}>
                    <Form.Item label="ชื่อเล่น">
                        <Controller name="nickName" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="หมายเลขบัตรประชาชน">
                        <Controller name="nationalId" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="Line ID">
                        <Controller name="lineId" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
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
                    render={({ field }) => (
                        <Input
                            {...field}
                            prefix={<PhoneOutlined />}
                            size={isMobile ? "small" : "middle"}
                        />
                    )}
                />
            </Form.Item>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                        <Controller name="email" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Facebook">
                        <Controller name="facebook" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item label="ที่อยู่ตามทะเบียนบ้าน">
                <Controller name="address" control={control} render={({ field }) => (
                    <Input.TextArea {...field} rows={2} />
                )} />
            </Form.Item>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item label="สถาบันการศึกษา / สถานที่ทำงานปัจจุบัน">
                        <Controller name="education" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="คณะ / แผนก">
                        <Controller name="faculty" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item label="ภาควิชา">
                        <Controller name="majorOrPosition" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="รหัสนักศึกษา / รหัสพนักงาน">
                        <Controller name="studentOrEmployeeId" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={8}>
                    <Form.Item label="บุคคลที่ติดต่อในกรณีฉุกเฉิน">
                        <Controller name="emergencyName" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="ความสัมพันธ์">
                        <Controller name="emergencyRelation" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="เบอร์โทรผู้ติดต่อฉุกเฉิน">
                        <Controller name="emergencyPhone" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation="left">ยานพาหนะ</Divider>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={8}>
                    <Form.Item label="ชนิด">
                        <Controller name="vehicleType" control={control} render={({ field }) => (
                            <Select {...field} size={isMobile ? 'small' : 'middle'}>
                                <Option value="car">รถยนต์</Option>
                                <Option value="motorcycle">รถจักรยานยนต์</Option>
                            </Select>
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="รายละเอียดรถ">
                        <Controller name="vehicleDetail" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="ทะเบียน">
                        <Controller name="vehiclePlate" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
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
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="เลือกชั้น"
                                    onChange={handleFloorChange}
                                    size={isMobile ? "small" : "middle"}
                                >
                                    {availableFloors
                                        .slice()
                                        .sort((a, b) => a - b)
                                        .map((f) => (
                                            <Option key={f} value={f}>
                                                ชั้น {f}
                                            </Option>
                                        ))}
                                </Select>
                            )}
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
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="เลือกห้อง"
                                    disabled={!selectedFloor}
                                    onChange={handleRoomChange}
                                    size={isMobile ? "small" : "middle"}
                                >
                                    {availableRoomsForFloor.map((r) => (
                                        <Option key={r._id} value={r._id}>
                                            ห้อง {r.roomNumber}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item label="ราคาห้องพัก">
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    disabled
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <InputNumber
                                    min={0}
                                    {...field}
                                    style={{ width: "100%" }}
                                    prefix={<DollarCircleOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <InputNumber
                                    min={0}
                                    {...field}
                                    style={{ width: "100%" }}
                                    prefix={<FileDoneOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value ? dayjs(field.value) : null}
                                    style={{ width: "100%" }}
                                    format="DD MMMM YYYY"
                                    onChange={(date) =>
                                        field.onChange(date ? date.toDate() : null)
                                    }
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
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
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<LockOutlined />}
                                    size={isMobile ? "small" : "middle"}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation="left">ระบบ/รูปภาพ/หมายเหตุ</Divider>
            <Row gutter={isMobile ? [8, 0] : [24, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item label="รหัส WiFi">
                        <Controller name="wifiCode" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="รหัสอินเทอร์เน็ต">
                        <Controller name="internetCode" control={control} render={({ field }) => (
                            <Input {...field} size={isMobile ? 'small' : 'middle'} />
                        )} />
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
                <Controller name="remarks" control={control} render={({ field }) => (
                    <Input.TextArea {...field} rows={3} />
                )} />
            </Form.Item>
            
            <div style={{
                textAlign: isMobile ? "center" : "right",
                marginTop: 24
            }}>
                <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: isMobile ? "100%" : "auto" }}>
                    <Button
                        onClick={onCancel}
                        size={isMobile ? "small" : "middle"}
                        style={{ width: isMobile ? "100%" : "auto" }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size={isMobile ? "small" : "middle"}
                        style={{ width: isMobile ? "100%" : "auto" }}
                    >
                        บันทึก
                    </Button>
                </Space>
            </div>
        </Form>
    );
};

// --- ฟอร์มแก้ไขรายละเอียดผู้เช่า (EditTenantDrawer) ---
const EditTenantDrawer = ({
    tenant,
    open,
    onClose,
    onUpdate,
    onUpdateServices,
    servicesData
}) => {
    console.log(`⩇⩇:⩇⩇🚨 ~ tenant :`, tenant);

    const [isMobile, setIsMobile] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // Handle edit account
    const handleEditAccount = (account) => {
        console.log('Edit account:', account);
        // TODO: Implement edit account functionality
        Modal.info({
            title: 'แก้ไขบัญชีผู้ใช้งาน',
            content: `กำลังแก้ไขบัญชี: ${account.username}`,
        });
    };

    // Handle reset password
    const handleResetPassword = () => {
        if (!newPassword.trim()) {
            Modal.error({
                title: 'ข้อผิดพลาด',
                content: 'กรุณากรอกรหัสผ่านใหม่',
            });
            return;
        }
        
        console.log('Reset password for:', tenant.accountId.username, 'New password:', newPassword);
        // TODO: Implement reset password API call
        
        Modal.success({
            title: 'สำเร็จ',
            content: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
        });
        
        setShowPasswordReset(false);
        setNewPassword('');
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({ resolver: zodResolver(editTenantSchema) });
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);

    const tenancyStatus = watch("tenancyStatus");

    useEffect(() => {
        if (tenant) {
            setValue("tenancyStatus", tenant.tenancyStatus);
            setValue(
                "moveOutDate",
                tenant.moveOutDate ? new Date(tenant.moveOutDate) : null
            );
        }
    }, [tenant, setValue]);

    if (!tenant) return null;

    const handleFinish = (values) => {
        const finalValues = {
            ...values,
            moveOutDate:
                values.tenancyStatus === "renting" ? null : values.moveOutDate,
        };
        onUpdate(tenant._id, finalValues);
    };

    const handleAddServices = () => {
        let action = 'add'
        onUpdateServices(tenant._id, selectedServices, action);
        setIsAddServiceModalOpen(false);
        setSelectedServices([]);
    };

    const handleRemoveService = (serviceId) => {
        let action = 'delete'
        onUpdateServices(
            tenant._id,
            serviceId,
            action
        );
    };

    const tenantServices = tenant?.serviceUsage
        .map((id) => servicesData.find((s) => s._id === id))
        .filter(Boolean);

    const availableServicesToAdd = servicesData.filter(
        (s) => !tenant?.serviceUsage.includes(s._id)
    );

    const getRemainingContract = () => {
        if (!tenant || tenant.tenancyStatus !== "renting") return null;

        const endDate = dayjs(tenant.moveInDate).add(
            tenant.contractDuration,
            "month"
        );
        const now = dayjs();

        if (now.isAfter(endDate)) {
            return <Text type="danger">ครบสัญญาแล้ว</Text>;
        }

        const totalMonths = endDate.diff(now, "month");
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        const intermediateDate = now.add(years, "year").add(months, "month");
        const days = endDate.diff(intermediateDate, "day");

        let displayText = "";
        if (years > 0) {
            displayText += `${years} ปี `;
        }
        if (months > 0) {
            displayText += `${months} เดือน `;
        }
        if (days > 0) {
            displayText += `${days} วัน`;
        }

        return <Text type="success">{displayText.trim()}</Text>;
    };

    return (
        <>
            <Drawer
                title="รายละเอียดผู้เช่า"
                width={isMobile ? "100%" : 720}
                onClose={onClose}
                open={open}
                styles={{ body: { paddingBottom: 80 } }}
            >
                <Descriptions
                    bordered
                    column={isMobile ? 1 : 2}
                    size={isMobile ? "small" : "default"}
                    labelStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                    contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                >
                    <Descriptions.Item label="ชื่อ-นามสกุล">{`${tenant.prefix} ${tenant.firstName} ${tenant.lastName}`}</Descriptions.Item>
                    <Descriptions.Item label="เบอร์โทรศัพท์">
                        {tenant.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="ห้องพัก">{`ชั้น ${tenant?.room?.floor}, ห้อง ${tenant?.room?.roomNumber}`}</Descriptions.Item>
                    <Descriptions.Item label="ค่ามัดจำ">
                        {tenant.deposit.toLocaleString()} บาท
                    </Descriptions.Item>
                    <Descriptions.Item label="ระยะสัญญา">
                        {tenant.contractDuration} เดือน
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่เข้าพัก">
                        {dayjs(tenant.moveInDate).format("DD MMMM YYYY")}
                    </Descriptions.Item>
                    {tenant.tenancyStatus === "renting" && (
                        <Descriptions.Item label="สัญญาคงเหลือ">
                            {getRemainingContract()}
                        </Descriptions.Item>
                    )}
                    {tenant.moveOutDate && (
                        <Descriptions.Item label="วันที่ย้ายออก">
                            {dayjs(tenant.moveOutDate).format("DD MMMM YYYY")}
                        </Descriptions.Item>
                    )}
                </Descriptions>
                <Divider orientation="left">บัญชีผู้ใช้งาน</Divider>
                <Descriptions bordered column={isMobile ? 1 : 2} size={isMobile ? "small" : "default"} labelStyle={{ fontSize: isMobile ? '12px' : '14px' }} contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}>
                    <Descriptions.Item label="ชื่อผู้ใช้งาน">
                        {tenant.accountId.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="สถานะ">
                        <Tag color={tenant.accountId.enabled ? "green" : "red"}>
                            {tenant.accountId.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="เข้าสู่ระบบล่าสุด">
                        {dayjs(tenant.accountId.lastLogin).format("DD MMMM YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่สร้าง">
                        {dayjs(tenant.accountId.createdAt).format("DD MMMM YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="การจัดการ">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                               
                                <Button 
                                    type="default" 
                                    size="small" 
                                    icon={<KeyOutlined />}
                                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                                >
                                    รีเซ็ตรหัสผ่าน
                                </Button>
                            </Space>
                            
                            {showPasswordReset && (
                                <div style={{ 
                                    marginTop: 8, 
                                    padding: 12, 
                                    background: '#f5f5f5', 
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9'
                                }}>
                                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                        รหัสผ่านใหม่สำหรับ {tenant.accountId.username}:
                                    </div>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input.Password
                                            placeholder="กรอกรหัสผ่านใหม่"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <Button 
                                            type="primary" 
                                            onClick={handleResetPassword}
                                            disabled={!newPassword.trim()}
                                        >
                                            ตกลง
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                setShowPasswordReset(false);
                                                setNewPassword('');
                                            }}
                                        >
                                            ยกเลิก
                                        </Button>
                                    </Space.Compact>
                                </div>
                            )}
                        </Space>
                    </Descriptions.Item>
                </Descriptions>
                <Divider orientation="left">ค่าบริการเพิ่มเติม</Divider>
                <List
                    size={isMobile ? "small" : "default"}
                    dataSource={tenantServices}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                // <Button
                                //     type="text"
                                //     danger
                                //     icon={<DeleteOutlined />}
                                //     onClick={() => handleRemoveService(item._id)}
                                //     size={isMobile ? "small" : "middle"}
                                // />,
                            ]}
                        >
                            <List.Item.Meta
                                title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>{item.name}</span>}
                                description={<span style={{ fontSize: isMobile ? '11px' : '12px' }}>{`${item.price.toLocaleString()} บาท / ${item.type === "monthly" ? "เดือน" : "ครั้ง"}`}</span>}
                            />
                        </List.Item>
                    )}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="ไม่มีบริการเพิ่มเติม"
                            />
                        ),
                    }}
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: "16px" }}
                    onClick={() => setIsAddServiceModalOpen(true)}
                    size={isMobile ? "small" : "middle"}
                >
                    เพิ่มบริการ
                </Button>
                <Divider />
                <Form layout="vertical" onFinish={handleSubmit(handleFinish)}>
                    <Form.Item label="สถานะการเช่า" required>
                        <Controller
                            name="tenancyStatus"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} size={isMobile ? "small" : "middle"}>
                                    <Option value="renting">กำลังเช่า</Option>
                                    <Option value="moved">ย้ายออก</Option>
                                </Select>
                            )}
                        />
                    </Form.Item>

                    {tenancyStatus === "moved" && (
                        <>
                            <Form.Item
                                label="วันที่ย้ายออก"
                                required
                                validateStatus={errors.moveOutDate ? "error" : ""}
                                help={errors.moveOutDate?.message}
                            >
                                <Controller
                                    name="moveOutDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? dayjs(field.value) : null}
                                            style={{ width: "100%" }}
                                            format="DD MMMM YYYY"
                                            onChange={(date) =>
                                                field.onChange(date ? date.toDate() : null)
                                            }
                                            placeholder="เลือกวันที่ย้ายออก"
                                            size={isMobile ? "small" : "middle"}
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item label="ปิดการใช้งาน account" required>
                                <Controller
                                    name="disableAccount"
                                    control={control}
                                    render={({ field }) => (
                                        <Radio.Group
                                            {...field}
                                            value={field.value ? 'yes' : 'no'}
                                            onChange={(e) => field.onChange(e.target.value === 'yes')}
                                            size={isMobile ? "small" : "middle"}
                                        >
                                            <Radio value={'yes'}>ใช่</Radio>
                                            <Radio value={'no'}>ไม่ใช่</Radio>
                                        </Radio.Group>
                                    )}
                                />
                            </Form.Item>
                        </>
                    )}
                    <div style={{
                        textAlign: isMobile ? "center" : "right",
                        marginTop: 24
                    }}>
                        <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: isMobile ? "100%" : "auto" }}>
                            <Button
                                onClick={onClose}
                                size={isMobile ? "small" : "middle"}
                                style={{ width: isMobile ? "100%" : "auto" }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size={isMobile ? "small" : "middle"}
                                style={{ width: isMobile ? "100%" : "auto" }}
                            >
                                อัปเดตสถานะ
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Drawer>
            <Modal
                title="เพิ่มบริการให้ผู้เช่า"
                open={isAddServiceModalOpen}
                onOk={handleAddServices}
                onCancel={() => setIsAddServiceModalOpen(false)}
                okText="เพิ่มบริการที่เลือก"
                cancelText="ยกเลิก"
                okButtonProps={{
                    disabled: selectedServices.length === 0,
                    size: isMobile ? "small" : "middle"
                }}
                cancelButtonProps={{
                    size: isMobile ? "small" : "middle"
                }}
                width={isMobile ? "90%" : 520}
            >
                <Checkbox.Group
                    style={{ width: "100%" }}
                    onChange={setSelectedServices}
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {availableServicesToAdd.length > 0 ? (
                            availableServicesToAdd.map((service, index) => (
                                <Checkbox key={service._id} value={service._id}>
                                    <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        {service.name}{" "}
                                        <Text type="secondary">
                                            ({service.price.toLocaleString()} บาท)
                                        </Text>
                                    </span>
                                </Checkbox>
                            ))
                        ) : (
                            <Empty description="ไม่มีบริการอื่นให้เลือกแล้ว" />
                        )}
                    </Space>
                </Checkbox.Group>
            </Modal>
        </>
    );
};

/**
 * หน้าสำหรับจัดการข้อมูลผู้เช่าทั้งหมด
 */
const TenantManagementPage = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [filterStatus, setFilterStatus] = useState("renting");
    const [addDrawerVisible, setAddDrawerVisible] = useState(false);
    const [editDrawerVisible, setEditDrawerVisible] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);

    const { user } = persistMiddleware();
    const authtoken = user?.token;
    const profileId = user?.userPayLoad?.user?.id;

    const { data: roomData, isLoading: isLoadingRooms } = useQuery({
        queryKey: ["listRoom", profileId],
        queryFn: () => getRoom(profileId),
        enabled: !!profileId,
    });

    const {
        data: tenantData,
        isLoading: isLoadingTenants,
        refetch: refetchTenants,
    } = useQuery({
        queryKey: ["listTenant", profileId],
        queryFn: () => getTenants(profileId),
        enabled: !!profileId,
    });

    const {
        data: servicesData,
        isLoading: isLoadingServices,
        refetch: refetchServices,
    } = useQuery({
        queryKey: ["listServices", profileId],
        queryFn: () => getServices(profileId),
        enabled: !!profileId,
    });

    const rooms = roomData?.result || [];
    const tenants = tenantData?.result?.result || [];

    const handleAddNewTenant = async (values) => {
        const newTenantPayload = {
            profileId: profileId,
            ...values,
            moveInDate: dayjs(values.moveInDate).format("YYYY-MM-DD"),
            tenancyStatus: "renting",
            moveOutDate: null,
        };
        await createTenant(newTenantPayload, authtoken);
        toast.success("เพิ่มข้อมูลผู้เช่าใหม่สำเร็จ");
        refetchTenants();
        setAddDrawerVisible(false);
    };

    const handleViewDetails = (tenant) => {
        setSelectedTenant(tenant);
        setEditDrawerVisible(true);
    };

    const handleUpdateTenant = async (tenantId, updatedValues) => {
        try {
            const value = {
                tenantId,
                ...updatedValues
            }
            console.log("Updating tenant", value);

            const res = await updateTenancyStatus(value)
            console.log(`⩇⩇:⩇⩇🚨 ~ handleUpdateTenant ~ res :`, res);

            message.success("อัปเดตสถานะสำเร็จ (จำลอง)");

            refetchTenants();
            setEditDrawerVisible(false);
        } catch (error) {
            console.error("Failed to update tenant status", error);
            message.error("เกิดข้อผิดพลาดในการอัปเดต");
        }
    };

    const handleUpdateTenantServices = async (tenantId, serviceUsageId, action) => {
        if (action === 'add') {
            const value = {
                newServiceIds: serviceUsageId
            }
            const res = await addServiceUsageTenant(tenantId, value)
            console.log(`⩇⩇:⩇⩇🚨 ~ handleUpdateTenantServices ~ res :`, res);
        } else if (action === 'delete') {
            const value = {
                tenantId,
                serviceUsageId
            }
            console.log(`⩇⩇:⩇⩇🚨 ~ handleUpdateTenantServices ~ value :`, value);
            const res = await deleteServiceUsage(value)
            console.log(`⩇⩇:⩇⩇🚨 ~ handleUpdateTenantServices ~ res :`, res);
        } else {
            message.info("ไม่พบ actions");
        }

        message.success("อัปเดตบริการเพิ่มเติมสำเร็จ (จำลอง)");
        refetchTenants();
    };

    const filteredTenants = tenants.filter(
        (t) => t.tenancyStatus === filterStatus
    ).sort((a, b) => {
        if (a.room?.floor !== b.room?.floor) {
            return (a.room?.floor || 0) - (b.room?.floor || 0);
        }
        const roomA = Number(a.room?.roomNumber) || 0;
        const roomB = Number(b.room?.roomNumber) || 0;
        return roomA - roomB;
    })

    useEffect(() => {
        if (selectedTenant && tenantData) {
            const updatedTenant = tenants.find(t => t._id === selectedTenant._id);
            if (updatedTenant) {
                setSelectedTenant(updatedTenant);
            }
        }
    }, [tenantData]);

    const containerStyle = {
        maxWidth: 1200,
        margin: "auto",
        padding: isMobile ? "16px 8px" : "32px 16px",
        background: "#f0f2f5",
    };

    const cardTitleStyle = {
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: 'bold'
    };

    return (
        <div style={containerStyle}>
            <PageHeader
                title="จัดการข้อมูลผู้เช่า"
                subtitle="จัดการข้อมูลผู้เช่าและบริการเพิ่มเติม"
                icon="👥"
            />
            <Card
                loading={isLoadingTenants || isLoadingRooms}
                variant="borderless"
                style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    margin: isMobile ? '0 -8px' : '0'
                }}
                title={<span style={cardTitleStyle}>รายชื่อผู้เช่า</span>}
                extra={
                    <Space
                        direction={isMobile ? "vertical" : "horizontal"}
                        size={isMobile ? "small" : "middle"}
                        style={{
                            width: isMobile ? '100%' : 'auto',
                            alignItems: isMobile ? 'stretch' : 'center'
                        }}
                    >
                        <Select
                            value={filterStatus}
                            style={{ width: isMobile ? '100%' : 150 }}
                            onChange={(value) => setFilterStatus(value)}
                            size={isMobile ? "small" : "middle"}
                        >
                            <Option value="renting">
                                <Tag color="success" style={{ margin: 0 }}>
                                    กำลังเช่า
                                </Tag>
                            </Option>
                            <Option value="moved">
                                <Tag color="warning" style={{ margin: 0 }}>
                                    ย้ายออก
                                </Tag>
                            </Option>
                        </Select>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => setAddDrawerVisible(true)}
                            size={isMobile ? "small" : "middle"}
                            style={{
                                width: isMobile ? '100%' : 'auto',
                                fontSize: isMobile ? '12px' : '14px'
                            }}
                        >
                            {isMobile ? 'เพิ่มผู้เช่า' : 'เพิ่มผู้เช่าใหม่'}
                        </Button>
                    </Space>
                }
            >
                <List
                    itemLayout="horizontal"
                    dataSource={filteredTenants}
                    size={isMobile ? "small" : "default"}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                // <Button
                                //     type="link"
                                //     icon={<RightOutlined />}
                                //     onClick={() => handleViewDetails(item)}
                                //     size={isMobile ? "small" : "middle"}
                                //     style={{
                                //         fontSize: isMobile ? '12px' : '14px',
                                //         padding: isMobile ? '4px 8px' : undefined
                                //     }}
                                // >
                                //     {isMobile ? 'ดู' : 'ดูรายละเอียด'}
                                // </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        size={isMobile ? "default" : "large"}
                                        icon={<UserOutlined />}
                                    />
                                }
                                title={
                                    <a
                                        href="#"
                                        style={{
                                            fontSize: isMobile ? '14px' : '16px',
                                            fontWeight: isMobile ? 'normal' : 'bold'
                                        }}
                                    >
                                        {`${item.prefix} ${item.firstName} ${item.lastName}`}
                                    </a>
                                }
                                description={
                                    <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        {`ชั้น ${item.room?.floor}, ห้อง ${item.room?.roomNumber}`}
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <Modal
                title="เพิ่มข้อมูลผู้เช่าใหม่"
                open={addDrawerVisible}
                onCancel={() => setAddDrawerVisible(false)}
                footer={null}
                width={isMobile ? '100%' : 980}
                style={{ top: 24 }}
                bodyStyle={{ paddingBottom: 0, maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}
                destroyOnClose
            >
                {rooms.length > 0 ? (
                    <AddTenantForm
                        onFinish={handleAddNewTenant}
                        onCancel={() => setAddDrawerVisible(false)}
                        rooms={rooms}
                    />
                ) : (
                    <Empty description="ไม่สามารถเพิ่มผู้เช่าได้ เนื่องจากไม่มีห้องว่าง" />
                )}
            </Modal>
            <EditTenantDrawer
                tenant={selectedTenant}
                open={editDrawerVisible}
                onClose={() => setEditDrawerVisible(false)}
                onUpdate={handleUpdateTenant}
                onUpdateServices={handleUpdateTenantServices}
                servicesData={servicesData?.result || []}
            />
        </div>
    );
};

export default TenantManagementPage;