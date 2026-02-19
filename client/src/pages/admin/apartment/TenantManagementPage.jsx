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
import PageHeader from '../../../components/common/PageHeader';
import {zodResolver} from "@hookform/resolvers/zod";
import {useQuery} from "@tanstack/react-query";
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
import {z} from "zod";
import {toast} from "react-toastify";
import {addServiceUsageTenant, deleteServiceUsage, getServices, getTenants} from "../../../service/api/apartment";
import {createTenant, getRoom, updateTenancyStatus} from "../../../service/api/rooms";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";
import {addTenantSchema} from "./validations/tenants-valid.js";
import {optionsPrefix} from "./utility/selectOptions.js";
import EditTenantDrawer from "../components/apartment/EditTenantDrawer.jsx";
import EditTenantForm from "./components/EditTanantForm.jsx";
import AddTenantForm from "./components/AddTenantForm.jsx";

// ตั้งค่าภาษาไทยสำหรับ dayjs
dayjs.locale("th");
dayjs.extend(relativeTime);

const {Title, Text} = Typography;
const {Option} = Select;


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

    const {user} = persistMiddleware();
    const authtoken = user?.token;
    const profileId = user?.userPayLoad?.user?.id;

    const {data: roomData, isLoading: isLoadingRooms} = useQuery({
        queryKey: ["listRoom", profileId], queryFn: () => getRoom(profileId), enabled: !!profileId,
    });

    const {
        data: tenantData, isLoading: isLoadingTenants, refetch: refetchTenants,
    } = useQuery({
        queryKey: ["listTenant", profileId], queryFn: () => getTenants(profileId), enabled: !!profileId,
    });

    const {
        data: servicesData, isLoading: isLoadingServices, refetch: refetchServices,
    } = useQuery({
        queryKey: ["listServices", profileId], queryFn: () => getServices(profileId), enabled: !!profileId,
    });

    const rooms = roomData?.result || [];
    const tenants = tenantData?.result?.result || [];

    const handleAddNewTenant = async (values) => {
        const newTenantPayload = {
            profileId: profileId, ...values,
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
                tenantId, ...updatedValues
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
                tenantId, serviceUsageId
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
// สร้างฟังก์ชัน handler
    const handleUpdateBasicInfo = async (tenantId, updatedData) => {
        console.log("🚀 ~ handleUpdateBasicInfo ~ tenantId: ", tenantId);
        console.log("🚀 ~ handleUpdateBasicInfo ~ updatedData: ", updatedData);
        try {
            // await updateTenantBasicInfoAPI(tenantId, updatedData);
            await refetchTenants();
            message.success('อัปเดตข้อมูลผู้เช่าสำเร็จ!');
        } catch (error) {
            message.error('เกิดข้อผิดพลาด');
        }
    };
    const filteredTenants = tenants.filter((t) => t.tenancyStatus === filterStatus).sort((a, b) => {
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
        maxWidth: 1200, margin: "auto", padding: isMobile ? "16px 8px" : "32px 16px", background: "#f0f2f5",
    };

    const cardTitleStyle = {
        fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold'
    };

    return (<div style={containerStyle}>
        <PageHeader
            title="จัดการข้อมูลผู้เช่า"
            subtitle="จัดการข้อมูลผู้เช่าและบริการเพิ่มเติม"
            icon="👥"
        />
        <Card
            loading={isLoadingTenants || isLoadingRooms}
            variant="borderless"
            style={{
                borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", margin: isMobile ? '0 -8px' : '0'
            }}
            title={<span style={cardTitleStyle}>รายชื่อผู้เช่า</span>}
            extra={<Space
                direction={isMobile ? "vertical" : "horizontal"}
                size={isMobile ? "small" : "middle"}
                style={{
                    width: isMobile ? '100%' : 'auto', alignItems: isMobile ? 'stretch' : 'center'
                }}
            >
                <Select
                    value={filterStatus}
                    style={{width: isMobile ? '100%' : 150}}
                    onChange={(value) => setFilterStatus(value)}
                    size={isMobile ? "small" : "middle"}
                >
                    <Option value="renting">
                        <Tag color="success" style={{margin: 0}}>
                            กำลังเช่า
                        </Tag>
                    </Option>
                    <Option value="moved">
                        <Tag color="warning" style={{margin: 0}}>
                            ย้ายออก
                        </Tag>
                    </Option>
                </Select>
                <Button
                    type="primary"
                    icon={<UserAddOutlined/>}
                    onClick={() => setAddDrawerVisible(true)}
                    size={isMobile ? "small" : "middle"}
                    style={{
                        width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '12px' : '14px'
                    }}
                >
                    {isMobile ? 'เพิ่มผู้เช่า' : 'เพิ่มผู้เช่าใหม่'}
                </Button>
            </Space>}
        >
            <List
                itemLayout="horizontal"
                dataSource={filteredTenants}
                size={isMobile ? "small" : "default"}
                renderItem={(item) => (<List.Item
                    actions={[<Button
                        type="link"
                        icon={<RightOutlined/>}
                        onClick={() => handleViewDetails(item)}
                        size={isMobile ? "small" : "middle"}
                        style={{
                            fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '4px 8px' : undefined
                        }}
                    >
                        {isMobile ? 'ดู' : 'ดูรายละเอียด'}
                    </Button>,]}
                >
                    <List.Item.Meta
                        avatar={<Avatar
                            size={isMobile ? "default" : "large"}
                            icon={<UserOutlined/>}
                        />}
                        title={<a
                            href="#"
                            style={{
                                fontSize: isMobile ? '14px' : '16px', fontWeight: isMobile ? 'normal' : 'bold'
                            }}
                        >
                            {`${item.prefix} ${item.firstName} ${item.lastName}`}
                        </a>}
                        description={<span style={{fontSize: isMobile ? '12px' : '14px'}}>
                                        {`ชั้น ${item.room?.floor}, ห้อง ${item.room?.roomNumber}`}
                                    </span>}
                    />
                </List.Item>)}
            />
        </Card>
        <Modal
            title="เพิ่มข้อมูลผู้เช่าใหม่"
            open={addDrawerVisible}
            onCancel={() => setAddDrawerVisible(false)}
            footer={null}
            width={isMobile ? '100%' : 980}
            style={{top: 24}}
            bodyStyle={{paddingBottom: 0, maxHeight: 'calc(100vh - 160px)', overflowY: 'auto'}}
            destroyOnClose
        >
            {rooms.length > 0 ? (<AddTenantForm
                onFinish={handleAddNewTenant}
                onCancel={() => setAddDrawerVisible(false)}
                rooms={rooms}
            />) : (<Empty description="ไม่สามารถเพิ่มผู้เช่าได้ เนื่องจากไม่มีห้องว่าง"/>)}
        </Modal>
        <EditTenantForm
            tenant={selectedTenant}
            open={editDrawerVisible}
            onClose={() => setEditDrawerVisible(false)}
            onUpdate={handleUpdateTenant}
            onUpdateServices={handleUpdateTenantServices}
            servicesData={servicesData?.result || []}
            onUpdateBasicInfo={handleUpdateBasicInfo}
            rooms={rooms}
        />
    </div>);
};

export default TenantManagementPage;