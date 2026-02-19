import {
    Button,
    Card,
    Checkbox,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Form,
    Input,
    List,
    Modal,
    Radio,
    Select,
    Space,
    Tag,
    Typography,
    InputNumber,
    Switch,
} from 'antd';
import {
    DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined, SafetyCertificateOutlined, SaveOutlined, CloseOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import {editTenantSchema} from "../../apartment/validations/tenants-valid.js";
import {useFloorRoomSelector} from "../../../../contexts/selectedFloorContext.jsx";

const {Text} = Typography;
const {Option} = Select;

// --- ฟอร์มแก้ไขรายละเอียดผู้เช่า (EditTenantDrawer) ---
const EditTenantForm = ({
                            tenant, open, onClose, onUpdate, onUpdateServices, onUpdateBasicInfo, servicesData, rooms

                        }) => {
    console.log("🚀 ~ EditTenantForm ~ tenant: ", rooms);


    const [isMobile, setIsMobile] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [isMoveOut, setIsMoveOut] = useState(false);
    console.log("🚀 ~ EditTenantForm ~ isMoveOut: ", isMoveOut);

    // Form for basic info editing
    const {
        control: basicInfoControl,
        handleSubmit: handleBasicInfoSubmit,
        reset: resetBasicInfo,
        formState: {errors: basicInfoErrors},
    } = useForm({
        defaultValues: {

            prefix: tenant?.prefix || '',
            firstName: tenant?.firstName || '',
            lastName: tenant?.lastName || '',
            phone: tenant?.phone || '',
            deposit: tenant?.deposit || 0,
            contractDuration: tenant?.contractDuration || 0,
        }
    });

    // Handle edit account
    const handleEditAccount = (account) => {
        console.log('Edit account:', account);
        Modal.info({
            title: 'แก้ไขบัญชีผู้ใช้งาน', content: `กำลังแก้ไขบัญชี: ${account.username}`,
        });
    };

    // Handle reset password
    const handleResetPassword = () => {
        if (!newPassword.trim()) {
            Modal.error({
                title: 'ข้อผิดพลาด', content: 'กรุณากรอกรหัสผ่านใหม่',
            });
            return;
        }

        console.log('Reset password for:', tenant.accountId.username, 'New password:', newPassword);
        // TODO: Implement reset password API call

        Modal.success({
            title: 'สำเร็จ', content: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
        });

        setShowPasswordReset(false);
        setNewPassword('');
    };

    // Handle save basic info
    const handleSaveBasicInfo = (data) => {
        console.log("🚀 ~ handleSaveBasicInfo ~ data: ", data);
        ;

        if (onUpdateBasicInfo) {
            onUpdateBasicInfo(tenant._id, data);
        }
        setIsEditingBasicInfo(false);
    };


    // Handle cancel edit basic info
    const handleCancelEditBasicInfo = () => {
        resetBasicInfo({
            id: tenant._id || "",
            prefix: tenant?.prefix || '',
            firstName: tenant?.firstName || '',
            lastName: tenant?.lastName || '',
            phone: tenant?.phone || '',
            deposit: tenant?.deposit || 0,
            floor: tenant?.room?.floor ?? undefined,
            roomId: tenant?.room?._id ?? undefined,
            roomNumber: tenant?.room?.roomNumber ?? undefined,
            contractDuration: tenant?.contractDuration || 0,
        });
        setIsEditingBasicInfo(false);
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
        control, handleSubmit, watch, setValue, formState: {errors},
    } = useForm({resolver: zodResolver(editTenantSchema)});
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);

    const tenancyStatus = watch("tenancyStatus");


    const {
        selectedFloor, availableRoomsForFloor, availableFloors, handleFloorChange, handleRoomChange,
    } = useFloorRoomSelector({
        rooms, setValue, // ถ้าใช้ react-hook-form
    });


    useEffect(() => {
        if (tenant) {
            setValue("tenancyStatus", tenant.tenancyStatus);
            setValue("moveOutDate", tenant.moveOutDate ? new Date(tenant.moveOutDate) : null);

            // Reset basic info form when tenant changes
            resetBasicInfo({
                id: tenant._id || "",
                prefix: tenant?.prefix || '',
                firstName: tenant?.firstName || '',
                lastName: tenant?.lastName || '',
                floor: tenant?.room?.floor ?? undefined,
                roomId: tenant?.room?.roomNumber ?? undefined,
                roomNumber: tenant?.room?.roomNumber ?? undefined,
                phone: tenant?.phone || '',
                deposit: tenant?.deposit || 0,
                contractDuration: tenant?.contractDuration || 0,
            });
        }
    }, [tenant, setValue, resetBasicInfo]);

    if (!tenant) return null;

    const handleFinish = (values) => {
        ;

        const finalValues = {
            ...values, moveOutDate: values.tenancyStatus === "renting" ? null : values.moveOutDate,
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
        onUpdateServices(tenant._id, serviceId, action);
    };

    const tenantServices = tenant?.serviceUsage
        .map((id) => servicesData.find((s) => s._id === id))
        .filter(Boolean);

    const availableServicesToAdd = servicesData.filter((s) => !tenant?.serviceUsage.includes(s._id));

    const getRemainingContract = () => {
        if (!tenant || tenant.tenancyStatus !== "renting") return null;

        const endDate = dayjs(tenant.moveInDate).add(tenant.contractDuration, "month");
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

    return (<>
        <Drawer
            title="รายละเอียดผู้เช่า"
            width={isMobile ? "100%" : 720}
            onClose={onClose}
            open={open}
            styles={{body: {paddingBottom: 80}}}
        >
            <Card size="small" style={{marginBottom: 20, backgroundColor: '#fafafa', borderStyle: 'dashed'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Space>
                        <SafetyCertificateOutlined style={{color: '#1890ff'}}/>
                        <Text strong>Tenant Signature / ID:</Text>
                    </Space>
                    <Text
                        code
                        copyable={{
                            tooltips: ['คลิกเพื่อคัดลอก', 'คัดลอกแล้ว!'],
                        }}
                        style={{fontSize: '1.3em', color: '#555'}}
                    >
                        {tenant.signature || tenant._id}
                    </Text>
                </div>
            </Card>

            {/* ส่วนข้อมูลพื้นฐานที่แก้ไขได้ */}
            <Card
                size="small"
                style={{marginBottom: 20}}
                title={<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>ข้อมูลพื้นฐาน</span>
                    {!isEditingBasicInfo ? (<Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined/>}
                        onClick={() => setIsEditingBasicInfo(true)}
                    >
                        แก้ไข
                    </Button>) : (<Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<SaveOutlined/>}
                            onClick={handleBasicInfoSubmit(handleSaveBasicInfo)}
                        >
                            บันทึก
                        </Button>
                        <Button
                            size="small"
                            icon={<CloseOutlined/>}
                            onClick={handleCancelEditBasicInfo}
                        >
                            ยกเลิก
                        </Button>
                    </Space>)}
                </div>}
            >
                {!isEditingBasicInfo ? (<Descriptions
                    bordered
                    column={isMobile ? 1 : 2}
                    size={isMobile ? "small" : "default"}
                    labelStyle={{fontSize: isMobile ? '12px' : '14px'}}
                    contentStyle={{fontSize: isMobile ? '12px' : '14px'}}
                >
                    <Descriptions.Item label="ชื่อ-นามสกุล">
                        {`${tenant.prefix} ${tenant.firstName} ${tenant.lastName}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="เบอร์โทรศัพท์">
                        {tenant.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="ห้องพัก">
                        {`ชั้น ${tenant?.room?.floor}, ห้อง ${tenant?.room?.roomNumber}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="ค่ามัดจำ">
                        {tenant.deposit.toLocaleString()} บาท
                    </Descriptions.Item>
                    <Descriptions.Item label="ระยะสัญญา">
                        {tenant.contractDuration} เดือน
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่เข้าพัก">
                        {dayjs(tenant.moveInDate).format("DD MMMM YYYY")}
                    </Descriptions.Item>
                    {tenant.tenancyStatus === "renting" && (<Descriptions.Item label="สัญญาคงเหลือ">
                        {getRemainingContract()}
                    </Descriptions.Item>)}
                    {tenant.moveOutDate && (<Descriptions.Item label="วันที่ย้ายออก">
                        {dayjs(tenant.moveOutDate).format("DD MMMM YYYY")}
                    </Descriptions.Item>)}
                </Descriptions>) : (
                    <Form layout="vertical">
                        <Form.Item label="คำนำหน้า" required>
                            <Controller
                                name="prefix"
                                control={basicInfoControl}
                                render={({field}) => (<Select {...field} size={isMobile ? "small" : "middle"}>
                                    <Option value="นาย">นาย</Option>
                                    <Option value="นาง">นาง</Option>
                                    <Option value="นางสาว">นางสาว</Option>
                                </Select>)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="ชื่อ"
                            required
                            validateStatus={basicInfoErrors.firstName ? "error" : ""}
                            help={basicInfoErrors.firstName?.message}
                        >
                            <Controller
                                name="firstName"
                                control={basicInfoControl}
                                render={({field}) => (<Input
                                    {...field}
                                    placeholder="กรอกชื่อ"
                                    size={isMobile ? "small" : "middle"}
                                />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="นามสกุล"
                            required
                            validateStatus={basicInfoErrors.lastName ? "error" : ""}
                            help={basicInfoErrors.lastName?.message}
                        >
                            <Controller
                                name="lastName"
                                control={basicInfoControl}
                                render={({field}) => (<Input
                                    {...field}
                                    placeholder="กรอกนามสกุล"
                                    size={isMobile ? "small" : "middle"}
                                />)}
                            />
                        </Form.Item>

                        <Space vertical style={{width: '100%', display: 'flex', justifyContent: "flex-end"}}>

                            <Checkbox

                                onChange={() => setIsMoveOut(!isMoveOut)}>ย้ายห้อง</Checkbox>


                        </Space>
                        {isMoveOut && (
                            <>
                                <Form.Item
                                    label="เลือกชั้น"

                                    validateStatus={errors.floor ? "error" : ""}
                                    help={errors.floor?.message}
                                >
                                    <Controller
                                        name="floor"
                                        control={control}
                                        render={({field}) => (
                                            <Select
                                                {...field}
                                                placeholder="เลือกชั้น"
                                                onChange={handleFloorChange}
                                                size={isMobile ? "small" : "middle"}
                                                // defaultValue={}
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
                                <Form.Item
                                    label="เลือกห้อง"

                                    validateStatus={errors.roomId ? "error" : ""}
                                    help={errors.roomId?.message}
                                >
                                    <Controller
                                        name="roomId"
                                        control={basicInfoControl}  // ⚠️ ใช้ basicInfoControl แทน control
                                        render={({field}) => (
                                            <Select
                                                {...field}
                                                placeholder="เลือกห้อง"
                                                disabled={!selectedFloor}
                                                onChange={(roomId) => {
                                                    const selectedRoom = handleRoomChange(roomId); // ✅ รับ room object
                                                    field.onChange(roomId); // อัพเดต form
                                                    console.log('Selected room ID:', selectedRoom?._id); // ดู ID
                                                }}
                                                size={isMobile ? "small" : "middle"}
                                            >
                                                {availableRoomsForFloor.map((r) => (<Option key={r._id} value={r._id}>
                                                    ห้อง {r.roomNumber}
                                                </Option>))}
                                            </Select>)}
                                    />
                                </Form.Item>
                            </>
                        )}

                        <Form.Item
                            label="เบอร์โทรศัพท์"
                            required
                            validateStatus={basicInfoErrors.phone ? "error" : ""}
                            help={basicInfoErrors.phone?.message}
                        >
                            <Controller
                                name="phone"
                                control={basicInfoControl}
                                render={({field}) => (<Input
                                    {...field}
                                    placeholder="กรอกเบอร์โทรศัพท์"
                                    size={isMobile ? "small" : "middle"}
                                />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="ค่ามัดจำ"
                            required
                            validateStatus={basicInfoErrors.deposit ? "error" : ""}
                            help={basicInfoErrors.deposit?.message}
                        >
                            <Controller
                                name="deposit"
                                control={basicInfoControl}
                                render={({field}) => (<InputNumber
                                    {...field}
                                    placeholder="กรอกค่ามัดจำ"
                                    style={{width: '100%'}}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter="บาท"
                                    size={isMobile ? "small" : "middle"}
                                />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="ระยะสัญญา"
                            required
                            validateStatus={basicInfoErrors.contractDuration ? "error" : ""}
                            help={basicInfoErrors.contractDuration?.message}
                        >
                            <Controller
                                name="contractDuration"
                                control={basicInfoControl}
                                render={({field}) => (<InputNumber
                                    {...field}
                                    placeholder="กรอกระยะสัญญา"
                                    style={{width: '100%'}}
                                    min={1}
                                    addonAfter="เดือน"
                                    size={isMobile ? "small" : "middle"}
                                />)}
                            />
                        </Form.Item>
                    </Form>)}
            </Card>

            <Divider orientation="left">บัญชีผู้ใช้งาน</Divider>
            <Descriptions bordered column={isMobile ? 1 : 2} size={isMobile ? "small" : "default"}
                          labelStyle={{fontSize: isMobile ? '12px' : '14px'}}
                          contentStyle={{fontSize: isMobile ? '12px' : '14px'}}>
                <Descriptions.Item label="ชื่อผู้ใช้งาน">
                    <Text
                        code
                        copyable={{
                            tooltips: ['คลิกเพื่อคัดลอก', 'คัดลอกแล้ว!'],
                        }}
                        style={{fontSize: '1.3em', color: '#555'}}
                    >
                        {tenant.accountId.username}
                    </Text>

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
                    <Space direction="vertical" style={{width: '100%'}}>
                        <Space>
                            <Button
                                type="default"
                                size="small"
                                icon={<KeyOutlined/>}
                                onClick={() => setShowPasswordReset(!showPasswordReset)}
                            >
                                รีเซ็ตรหัสผ่าน
                            </Button>
                        </Space>

                        {showPasswordReset && (<div style={{
                            marginTop: 8,
                            padding: 12,
                            background: '#f5f5f5',
                            borderRadius: 6,
                            border: '1px solid #d9d9d9'
                        }}>
                            <div style={{marginBottom: 8, fontWeight: 500}}>
                                รหัสผ่านใหม่สำหรับ {tenant.accountId.username}:
                            </div>
                            <Space.Compact style={{width: '100%'}}>
                                <Input.Password
                                    placeholder="กรอกรหัสผ่านใหม่"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{flex: 1}}
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
                        </div>)}
                    </Space>
                </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">ค่าบริการเพิ่มเติม</Divider>
            <List
                dataSource={tenantServices}
                renderItem={(item) => (<List.Item
                    actions={[<Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => handleRemoveService(item._id)}
                        size={isMobile ? "small" : "middle"}
                    />,]}
                >
                    <List.Item.Meta
                        title={<span style={{fontSize: isMobile ? '12px' : '14px'}}>{item.name}</span>}
                        description={<span
                            style={{fontSize: isMobile ? '11px' : '12px'}}>{`${item.price.toLocaleString()} บาท / ${item.type === "monthly" ? "เดือน" : "ครั้ง"}`}</span>}
                    />
                </List.Item>)}
                locale={{
                    emptyText: (<Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="ไม่มีบริการเพิ่มเติม"
                    />),
                }}
            />
            <Button
                type="dashed"
                icon={<PlusOutlined/>}
                style={{width: "100%", marginTop: "16px"}}
                onClick={() => setIsAddServiceModalOpen(true)}
                size={isMobile ? "small" : "middle"}
            >
                เพิ่มบริการ
            </Button>
            <Divider/>
            <Form layout="vertical" onFinish={handleSubmit(handleFinish)}>
                <Form.Item label="สถานะการเช่า" required>
                    <Controller
                        name="tenancyStatus"
                        control={control}
                        render={({field}) => (<Select {...field} size={isMobile ? "small" : "middle"}>
                            <Option value="renting">กำลังเช่า</Option>
                            <Option value="moved">ย้ายออก</Option>
                        </Select>)}
                    />
                </Form.Item>

                {tenancyStatus === "moved" && (<>
                    <Form.Item
                        label="วันที่ย้ายออก"
                        required
                        validateStatus={errors.moveOutDate ? "error" : ""}
                        help={errors.moveOutDate?.message}
                    >
                        <Controller
                            name="moveOutDate"
                            control={control}
                            render={({field}) => (<DatePicker
                                value={field.value ? dayjs(field.value) : null}
                                style={{width: "100%"}}
                                format="DD MMMM YYYY"
                                onChange={(date) => field.onChange(date ? date.toDate() : null)}
                                placeholder="เลือกวันที่ย้ายออก"
                                size={isMobile ? "small" : "middle"}
                            />)}
                        />
                    </Form.Item>

                    <Form.Item label="ปิดการใช้งาน account" required>
                        <Controller
                            name="disableAccount"
                            control={control}
                            render={({field}) => (<Radio.Group
                                {...field}
                                value={field.value ? 'yes' : 'no'}
                                onChange={(e) => field.onChange(e.target.value === 'yes')}
                                size={isMobile ? "small" : "middle"}
                            >
                                <Radio value={'yes'}>ใช่</Radio>
                                <Radio value={'no'}>ไม่ใช่</Radio>
                            </Radio.Group>)}
                        />
                    </Form.Item>
                </>)}
                <div style={{
                    textAlign: isMobile ? "center" : "right", marginTop: 24
                }}>
                    <Space direction={isMobile ? "vertical" : "horizontal"}
                           style={{width: isMobile ? "100%" : "auto"}}>
                        <Button
                            onClick={onClose}
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
                disabled: selectedServices.length === 0, size: isMobile ? "small" : "middle"
            }}
            cancelButtonProps={{
                size: isMobile ? "small" : "middle"
            }}
            width={isMobile ? "90%" : 520}
        >
            <Checkbox.Group
                style={{width: "100%"}}
                onChange={setSelectedServices}
            >
                <Space direction="vertical" style={{width: "100%"}}>
                    {availableServicesToAdd.length > 0 ? (availableServicesToAdd.map((service, index) => (
                        <Checkbox key={service._id} value={service._id}>
                                    <span style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        {service.name}{" "}
                                        <Text type="secondary">
                                            ({service.price.toLocaleString()} บาท)
                                        </Text>
                                    </span>
                        </Checkbox>))) : (<Empty description="ไม่มีบริการอื่นให้เลือกแล้ว"/>)}
                </Space>
            </Checkbox.Group>
        </Modal>
    </>);
};

export default EditTenantForm;