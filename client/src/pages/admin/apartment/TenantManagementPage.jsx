import {
    DeleteOutlined,
    DollarCircleOutlined,
    FileDoneOutlined,
    LockOutlined,
    PhoneOutlined,
    PlusOutlined,
    RightOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
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
// import { getTenants } from "../../../service/api/apartment";
import { toast } from "react-toastify";
import { addServiceUsageTenant, deleteServiceUsage, getServices, getTenants } from "../../../service/api/apartment";
import { createTenant, getRoom, updateTenancyStatus } from "../../../service/api/rooms";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";

// // NOTE: Mocking API functions for demonstration purposes
// const getRoom = async (profileId) => {
//   console.log("Fetching rooms for", profileId);
//   return { result: mockRooms };
// };
// const getTenants = async (profileId) => {
//   console.log("Fetching tenants for", profileId);
//   return { result: { result: mockTenants } };
// };




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
    username: z.string().min(1, { message: "กรุณากรอกไอดี" }),
    password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
    phoneNumber: z
        .string()
        .min(9, { message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" }),
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

    return (
        <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
            <Divider orientation="left">ข้อมูลผู้เช่า</Divider>
            <Row gutter={24}>
                <Col xs={24} sm={4}>
                    <Form.Item label="คำนำหน้า" required>
                        <Controller
                            name="prefix"
                            control={control}
                            render={({ field }) => (
                                <Select {...field}>
                                    <Option value="นาย">นาย</Option>
                                    <Option value="นาง">นาง</Option>
                                    <Option value="นางสาว">นางสาว</Option>
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
                                <Input {...field} prefix={<UserOutlined />} />
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
                                <Input {...field} prefix={<UserOutlined />} />
                            )}
                        />
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
                        <Input {...field} prefix={<PhoneOutlined />} />
                    )}
                />
            </Form.Item>
            <Divider orientation="left">ข้อมูลการเข้าพัก</Divider>
            <Row gutter={24}>
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
                                >
                                    {availableFloors.map((f) => (
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
                            render={({ field }) => <Input {...field} disabled />}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={24}>
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
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation="left">แอคเคาท์เข้าระบบ</Divider>
            <Form.Item
                label="ไอดี"
                required
                validateStatus={errors.username ? "error" : ""}
                help={errors.username?.message}
            >
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => <Input {...field} prefix={<UserOutlined />} />}
                />
            </Form.Item>
            <Form.Item
                label="รหัสผ่าน"
                required
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
            >
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => <Input {...field} prefix={<LockOutlined />} />}
                />
            </Form.Item>
            <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                    <Button onClick={onCancel}>ยกเลิก</Button>
                    <Button type="primary" htmlType="submit">
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

        // หาวันที่เหลือหลังจากหักปีและเดือนออกแล้ว
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

        // ถ้าเหลือ 0 เดือน 0 วัน (เช่น เหลือแต่ปี หรือวันเดียว) ก็ยังโชว์ให้ครบ
        return <Text type="success">{displayText.trim()}</Text>;
    };

    return (
        <>
            <Drawer
                title="รายละเอียดผู้เช่า"
                width={720}
                onClose={onClose}
                open={open}
                styles={{ body: { paddingBottom: 80 } }}
            >
                <Descriptions bordered column={1} size="small">
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
                <Divider orientation="left">ค่าบริการเพิ่มเติม</Divider>
                <List
                    size="small"
                    dataSource={tenantServices}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveService(item._id)}
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                title={item.name}
                                description={`${item.price.toLocaleString()} บาท / ${item.type === "monthly" ? "เดือน" : "ครั้ง"}`}
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
                                <Select {...field}>
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
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Form.Item label="ปิดการใช้งาน account" required>
                                <Controller
                                    name="disableAccount" // แก้ไข typo จาก disableAccuont
                                    control={control}
                                    render={({ field }) => (
                                        <Radio.Group
                                            {...field} // ส่ง props ทั้งหมดจาก field
                                            // แปลงค่า boolean เป็น string 'yes'/'no' สำหรับ Radio.Group
                                            value={field.value ? 'yes' : 'no'}
                                            // เมื่อมีการเปลี่ยนแปลง ให้แปลงค่า string กลับเป็น boolean
                                            onChange={(e) => field.onChange(e.target.value === 'yes')}
                                        >
                                            <Radio value={'yes'}>ใช่</Radio>
                                            <Radio value={'no'}>ไม่ใช่</Radio>
                                        </Radio.Group>
                                    )}
                                />
                            </Form.Item>
                        </>
                    )}
                    <div style={{ textAlign: "right", marginTop: 24 }}>
                        <Space>
                            <Button onClick={onClose}>ยกเลิก</Button>
                            <Button type="primary" htmlType="submit">
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
                okButtonProps={{ disabled: selectedServices.length === 0 }}
            >
                <Checkbox.Group
                    style={{ width: "100%" }}
                    onChange={setSelectedServices}
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {availableServicesToAdd.length > 0 ? (
                            availableServicesToAdd.map((service, index) => (
                                <Checkbox key={service._id} value={service._id}>
                                    {service.name}{" "}
                                    <Text type="secondary">
                                        ({service.price.toLocaleString()} บาท)
                                    </Text>
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
            // This logic should be adapted for your actual API
            const value = {
                tenantId,
                ...updatedValues
            }
            console.log("Updating tenant", value);

            const res = await updateTenancyStatus(value)
            console.log(`⩇⩇:⩇⩇🚨 ~ handleUpdateTenant ~ res :`, res);

            message.success("อัปเดตสถานะสำเร็จ (จำลอง)");

            refetchTenants(); // Refetch data after update
            setEditDrawerVisible(false);
        } catch (error) {
            console.error("Failed to update tenant status", error);
            message.error("เกิดข้อผิดพลาดในการอัปเดต");
        }
    };

    const handleUpdateTenantServices = async (tenantId, serviceUsageId, action) => {


        // This should be an API call in a real application

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
        refetchTenants(); // Refetch to get the latest tenant data

    };

    const filteredTenants = tenants.filter(
        (t) => t.tenancyStatus === filterStatus
    ).sort((a, b) => {
        // เรียงตามชั้นก่อน (floor)
        if (a.room?.floor !== b.room?.floor) {
            return (a.room?.floor || 0) - (b.room?.floor || 0);
        }
        // ถ้าชั้นเท่ากัน ให้เรียงตามเลขห้อง (roomNumber)
        // สมมติ roomNumber เป็นเลข (ถ้าเป็น string อาจต้องแปลง)
        const roomA = Number(a.room?.roomNumber) || 0;
        const roomB = Number(b.room?.roomNumber) || 0;
        return roomA - roomB;
    })

    useEffect(() => {
        // ถ้ามี tenant ที่ถูกเลือกอยู่ และมีข้อมูล tenantData ใหม่เข้ามา
        if (selectedTenant && tenantData) {
            // ค้นหาข้อมูลล่าสุดของ tenant คนนั้นจาก list ใหม่
            const updatedTenant = tenants.find(t => t._id === selectedTenant._id);
            if (updatedTenant) {
                // อัปเดต state ด้วยข้อมูลใหม่
                setSelectedTenant(updatedTenant);
            }
        }
    }, [tenantData]); // ให้ useEffect นี้ทำงานทุกครั้งที่ tenantData เปลี่ยนแปลง

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "auto",
                padding: "32px 16px",
                background: "#f0f2f5",
            }}
        >
            <Title level={2} style={{ marginBottom: 32 }}>
                จัดการข้อมูลผู้เช่า
            </Title>
            <Card
                loading={isLoadingTenants || isLoadingRooms}
                variant="borderless"
                style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                title="รายชื่อผู้เช่า"
                extra={
                    <Space>
                        <Select
                            value={filterStatus}
                            style={{ width: 150 }}
                            onChange={(value) => setFilterStatus(value)}
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
                        >
                            เพิ่มผู้เช่าใหม่
                        </Button>
                    </Space>
                }
            >
                <List
                    itemLayout="horizontal"
                    dataSource={filteredTenants}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    icon={<RightOutlined />}
                                    onClick={() => handleViewDetails(item)}
                                >
                                    ดูรายละเอียด
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar size="large" icon={<UserOutlined />} />}
                                title={
                                    <a href="#">{`${item.prefix} ${item.firstName} ${item.lastName}`}</a>
                                }
                                description={`ชั้น ${item.room?.floor}, ห้อง ${item.room?.roomNumber}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <Drawer
                title="เพิ่มข้อมูลผู้เช่าใหม่"
                width={720}
                onClose={() => setAddDrawerVisible(false)}
                open={addDrawerVisible}
                styles={{ body: { paddingBottom: 80 } }}
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
            </Drawer>
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
