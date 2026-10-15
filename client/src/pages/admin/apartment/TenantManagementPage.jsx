import {
    RightOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import PageHeader from '../../../components/common/PageHeader';
import {useQuery} from "@tanstack/react-query";
import {
    Button,
    ConfigProvider,
    Empty,
    message,
    Modal,
    Pagination,
    Segmented,
    Skeleton,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {addServiceUsageTenant, deleteServiceUsage, getServices, getTenants} from "../../../service/api/apartment";
import {createTenant, getRoom, updateTenancyStatus} from "../../../service/api/rooms";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";
import EditTenantForm from "./components/EditTanantForm.jsx";
import AddTenantForm from "./components/AddTenantForm.jsx";

// ตั้งค่าภาษาไทยสำหรับ dayjs
dayjs.locale("th");
dayjs.extend(relativeTime);

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/* ---------- Design tokens ---------- */
const C = {
    ink: '#0F172A',
    raised: '#1E2A4A',
    page: '#F4F5F9',
    card: '#FFFFFF',
    line: '#E6E8F0',
    muted: '#5B6478',
    sunken: '#F7F8FC',
    primary: '#4F46E5',
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    okBg: '#DCFCE7',
    okFg: '#166534',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: {colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44},
};

const css = `
.tm-page {
    max-width: 1200px; margin: 0 auto; padding: 24px; width: 100%;
    box-sizing: border-box; font-family: ${FONT}; color: ${C.ink}; background: ${C.page};
}
.tm-stack { display: flex; flex-direction: column; gap: 20px; }

.tm-banner {
    background: ${C.ink}; border-radius: 20px; padding: 24px 28px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.tm-banner-icon {
    width: 52px; height: 52px; border-radius: 14px; background: ${C.raised}; color: ${C.onDarkIcon};
    display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
}
.tm-banner-text { flex: 1 1 240px; min-width: 0; }
.tm-banner h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.tm-banner p { margin: 4px 0 0; font-size: 14px; color: ${C.onDarkMuted}; }

.tm-btn.ant-btn {
    background: ${C.primary}; color: #fff; font-weight: 600; border: none;
    border-radius: 12px; height: 44px; padding: 0 22px;
}
.tm-btn.ant-btn:hover { background: ${C.primaryDeep} !important; color: #fff !important; }
.tm-btn-short { display: none; }

.tm-section {
    background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px;
}
.tm-section-head {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
}
.tm-section-title {
    display: flex; align-items: center; gap: 12px; margin: 0; flex: 1 1 200px;
    font-size: 16px; font-weight: 700; color: ${C.ink};
}
.tm-section-icon {
    width: 36px; height: 36px; border-radius: 10px; background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.tm-count { font-weight: 700; margin-left: 6px; color: ${C.primarySoftText}; }

.tm-list { display: flex; flex-direction: column; gap: 10px; }
.tm-row {
    display: flex; align-items: center; gap: 14px;
    background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px; padding: 12px 16px;
}
.tm-avatar {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.tm-info { flex: 1; min-width: 0; }
.tm-name {
    font-size: 16px; font-weight: 700; color: ${C.ink};
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tm-room { margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.tm-room-text { font-size: 14px; color: ${C.muted}; }
.tm-pill {
    border-radius: 999px; padding: 1px 10px; font-size: 12px; font-weight: 600;
    background: ${C.okBg}; color: ${C.okFg};
}
.tm-pill.moved { background: ${C.card}; color: ${C.muted}; border: 1px solid ${C.line}; }

.tm-detail.ant-btn {
    background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; color: ${C.primarySoftText};
    font-weight: 600; border-radius: 12px; flex-shrink: 0;
}
.tm-detail.ant-btn:hover { background: #E2E6FF !important; color: ${C.primarySoftText} !important; border-color: ${C.primarySoftLine} !important; }
.tm-detail-short { display: none; }

.tm-seg { font-family: ${FONT}; }
.tm-seg .ant-segmented-item-label { min-height: 36px; line-height: 36px; font-weight: 600; }

.tm-pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
.tm-pagination .ant-pagination-total-text { color: ${C.muted}; font-size: 14px; }

.tm-empty { text-align: center; padding: 40px 16px; color: ${C.muted}; font-size: 14px; }

.tm-page button:focus-visible, .tm-page .ant-btn:focus-visible,
.tm-page .ant-segmented-item-input:focus-visible + .ant-segmented-item-label {
    outline: 3px solid ${C.primary}; outline-offset: 2px;
}

.tm-modal { max-width: calc(100vw - 16px); }

@media (max-width: 768px) {
    .tm-page { padding: 12px; }
    .tm-banner { padding: 20px; border-radius: 16px; }
    .tm-banner h1 { font-size: 22px; }
    .tm-banner .tm-btn { width: 100%; }
    .tm-btn-full { display: none; }
    .tm-btn-short { display: inline; }
    .tm-section { padding: 16px; border-radius: 16px; }
    .tm-section-head .ant-segmented { width: 100%; }
    .tm-section-head .ant-segmented-group { display: flex; }
    .tm-section-head .ant-segmented-item { flex: 1; text-align: center; }
    .tm-row { padding: 10px 12px; gap: 10px; }
    .tm-detail-full { display: none; }
    .tm-detail-short { display: inline; }
    .tm-pagination { justify-content: center; }
}
`;

const TenantManagementPage = () => {
    const [filterStatus, setFilterStatus] = useState("renting");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
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

    // รายการของหน้าปัจจุบัน
    const paginatedTenants = filteredTenants.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        if (selectedTenant && tenantData) {
            const updatedTenant = tenants.find(t => t._id === selectedTenant._id);
            if (updatedTenant) {
                setSelectedTenant(updatedTenant);
            }
        }
    }, [tenantData]);

    // ถ้าข้อมูลลดลง (เช่น ย้ายออก) แล้วหน้าปัจจุบันเกินจำนวนหน้า ให้ถอยกลับ
    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
        if (currentPage > maxPage) setCurrentPage(maxPage);
    }, [filteredTenants.length, pageSize, currentPage]);

    /* ---------- ส่วนแสดงผลที่คำนวณจากข้อมูลเดิม ---------- */
    const rentingCount = tenants.filter((t) => t.tenancyStatus === "renting").length;
    const movedCount = tenants.filter((t) => t.tenancyStatus === "moved").length;
    const isLoading = isLoadingTenants || isLoadingRooms;

    const statusOptions = [
        {value: "renting", label: <span>กำลังเช่า<span className="tm-count">{rentingCount}</span></span>},
        {value: "moved", label: <span>ย้ายออก<span className="tm-count">{movedCount}</span></span>},
    ];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="tm-page">
                <div className="tm-stack">
                    <header className="tm-banner">
                        <div className="tm-banner-icon" aria-hidden="true"><TeamOutlined/></div>
                        <div className="tm-banner-text">
                            <h1>จัดการข้อมูลผู้เช่า</h1>
                            <p>จัดการข้อมูลผู้เช่าและบริการเพิ่มเติม</p>
                        </div>
                        <Button
                            type="primary"
                            className="tm-btn"
                            icon={<UserAddOutlined/>}
                            onClick={() => setAddDrawerVisible(true)}
                        >
                            <span className="tm-btn-full">เพิ่มผู้เช่าใหม่</span>
                            <span className="tm-btn-short">เพิ่มผู้เช่า</span>
                        </Button>
                    </header>

                    <section className="tm-section">
                        <div className="tm-section-head">
                            <h2 className="tm-section-title">
                                <span className="tm-section-icon" aria-hidden="true"><UserOutlined/></span>
                                รายชื่อผู้เช่า
                            </h2>
                            <Segmented
                                className="tm-seg"
                                value={filterStatus}
                                onChange={(value) => {
                                    setFilterStatus(value);
                                    setCurrentPage(1);
                                }}
                                options={statusOptions}
                                aria-label="กรองสถานะผู้เช่า"
                            />
                        </div>

                        {isLoading ? (
                            <Skeleton active paragraph={{rows: 4}}/>
                        ) : filteredTenants.length === 0 ? (
                            <div className="tm-empty">ไม่มีรายชื่อผู้เช่าในสถานะนี้</div>
                        ) : (
                            <>
                                <div className="tm-list">
                                    {paginatedTenants.map((item, index) => {
                                        const fullName = `${item.prefix} ${item.firstName} ${item.lastName}`;
                                        const isRenting = item.tenancyStatus === "renting";
                                        return (
                                            <div className="tm-row" key={item._id ?? index}>
                                                <div className="tm-avatar" aria-hidden="true"><UserOutlined/></div>
                                                <div className="tm-info">
                                                    <div className="tm-name">{fullName}</div>
                                                    <div className="tm-room">
                                                        <span className="tm-room-text">
                                                            {`ชั้น ${item.room?.floor}, ห้อง ${item.room?.roomNumber}`}
                                                        </span>
                                                        <span className={`tm-pill${isRenting ? '' : ' moved'}`}>
                                                            {isRenting ? 'กำลังเช่า' : 'ย้ายออก'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="tm-detail"
                                                    icon={<RightOutlined/>}
                                                    iconPosition="end"
                                                    onClick={() => handleViewDetails(item)}
                                                    aria-label={`ดูรายละเอียด ${fullName}`}
                                                >
                                                    <span className="tm-detail-full">ดูรายละเอียด</span>
                                                    <span className="tm-detail-short">ดู</span>
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="tm-pagination">
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={filteredTenants.length}
                                        onChange={(page, size) => {
                                            setCurrentPage(page);
                                            setPageSize(size);
                                        }}
                                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                                        showSizeChanger
                                        // hideOnSinglePage={filteredTenants.length <= PAGE_SIZE_OPTIONS[0]}
                                        showTotal={(total, range) => `${range[0]}-${range[1]} จาก ${total} คน`}
                                        responsive
                                    />
                                </div>
                            </>
                        )}
                    </section>
                </div>

                <Modal
                    title="เพิ่มข้อมูลผู้เช่าใหม่"
                    open={addDrawerVisible}
                    onCancel={() => setAddDrawerVisible(false)}
                    footer={null}
                    width={980}
                    className="tm-modal"
                    style={{top: 24}}
                    styles={{
                        body: {paddingBottom: 0, maxHeight: 'calc(100vh - 160px)', overflowY: 'auto'},
                    }}
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
            </div>
        </ConfigProvider>
    );
};

export default TenantManagementPage;