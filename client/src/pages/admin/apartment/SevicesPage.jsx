import {
    AppstoreAddOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    ConfigProvider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
    Tag,
    Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { addServices, getServices } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

const { Text } = Typography;

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
    onInkMuted: '#A5B0C6',
    onInkIcon: '#A5B4FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.ms-root { background: ${C.page}; min-height: 100vh; padding: 24px 16px 48px; font-family: ${FONT}; color: ${C.ink}; }
.ms-wrap { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.ms-banner { background: ${C.ink}; border-radius: 20px; padding: 24px 28px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ms-banner-icon { width: 52px; height: 52px; border-radius: 10px; background: ${C.raised}; color: ${C.onInkIcon}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex: none; }
.ms-banner-text { flex: 1 1 240px; min-width: 0; }
.ms-banner-title { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.ms-banner-sub { margin: 4px 0 0; font-size: 14px; color: ${C.onInkMuted}; }
.ms-section { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px; }
.ms-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ms-section-icon { width: 36px; height: 36px; border-radius: 10px; background: ${C.primarySoft}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex: none; }
.ms-section-title { margin: 0; font-size: 16px; font-weight: 700; }
.ms-table-scroll { overflow-x: auto; }
.ms-table .ant-table { background: transparent; }
.ms-table .ant-table-thead > tr > th { background: ${C.sunken}; color: ${C.muted}; font-weight: 600; border-bottom: 1px solid ${C.line}; }
.ms-table .ant-table-tbody > tr > td { border-bottom: 1px solid ${C.line}; }
.ms-name { font-size: 14px; font-weight: 600; }
.ms-desc { display: block; margin-top: 2px; font-size: 12px; color: ${C.muted}; }
.ms-price { font-size: 14px; font-weight: 700; }
.ms-mobile-only { display: inline-block; margin-top: 2px; }
.ms-primary-btn.ant-btn-primary { background: ${C.primary}; color: #fff; font-weight: 600; }
.ms-primary-btn.ant-btn-primary:hover { background: ${C.primaryDeep} !important; }
.ms-secondary-btn.ant-btn { background: ${C.primarySoft}; border-color: ${C.primarySoftLine}; color: ${C.primarySoftText}; font-weight: 600; }
.ms-secondary-btn.ant-btn:hover { background: #E3E6FF !important; color: ${C.primarySoftText} !important; border-color: ${C.primarySoftLine} !important; }
.ms-modal-actions { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; border-top: 1px solid ${C.line}; padding-top: 16px; margin-top: 8px; }
.ms-modal-actions .ant-btn { min-width: 96px; }
.ms-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0 12px; }
.ms-root button:focus-visible, .ms-modal button:focus-visible { outline: 3px solid ${C.primarySoftLine}; outline-offset: 2px; }
@media (min-width: 769px) { .ms-mobile-only { display: none; } }
@media (max-width: 640px) { .ms-hide-sm { display: none; } }
@media (max-width: 600px) {
  .ms-banner { padding: 20px; }
  .ms-banner-title { font-size: 22px; }
  .ms-section { padding: 16px; }
}
`;

const unitTagStyle = (unit) =>
    unit === 'monthly'
        ? { background: C.primarySoft, color: C.primarySoftText, border: `1px solid ${C.primarySoftLine}`, margin: 0 }
        : { background: C.okBg, color: C.okFg, border: `1px solid ${C.okFg}33`, margin: 0 };

export default function ManageServicesPage() {
    const [services, setServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            unit: 'monthly',
            price: 0,
            status: true,
            description: '',
        }
    });

    const { user } = persistMiddleware();
    const accountId = user?.userPayLoad?.user?.id;

    const {
        data: servicesData,
        isLoading: isLoadingServices,
        refetch: refetchServices,
    } = useQuery({
        queryKey: ["listServices", accountId],
        queryFn: () => getServices(accountId),
        enabled: !!accountId,
    });

    // Map API data to local state
    useEffect(() => {
        if (servicesData?.result) {
            const mappedData = servicesData.result.map((item) => ({
                id: item._id, // Use _id as id
                name: item.name,
                unit: item.unit,
                price: item.price,
                status: item.enabled, // API uses "enabled"
                description: item.description,
            }));
            setServices(mappedData);
        }
    }, [servicesData]);

    const showAddModal = () => {
        setEditingService(null);
        reset({
            name: '',
            unit: 'monthly',
            price: 0,
            status: true,
            description: '',
        });
        setIsModalOpen(true);
    };

    const showEditModal = (service) => {
        setEditingService(service);
        reset({
            name: service.name,
            unit: service.unit,
            price: service.price,
            status: service.status,
            description: service.description,
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSave = async (data) => {
        try {
            if (editingService) {
                // Update existing service
                const updatedService = {
                    ...editingService,
                    ...data,
                    enabled: data.status,
                };
                await updateService(editingService.id, updatedService);
                message.success(`แก้ไขบริการ "${data.name}" เรียบร้อยแล้ว`);
            } else {
                // Add new service
                const newService = {
                    accountId: accountId,
                    ...data,
                    enabled: data.status,
                };
                console.log(`⩇⩇:⩇⩇🚨 newService :`, newService);

                const res = await addServices(newService);
                console.log(`⩇⩇:⩇⩇🚨 res :`, res);

                message.success(`เพิ่มบริการใหม่ "${data.name}" สำเร็จ`);
            }
            await refetchServices();
            handleCancel();
        } catch (error) {
            console.error(error);
            message.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteService(id);
            await refetchServices();
            message.warning('ลบบริการเรียบร้อยแล้ว');
        } catch (error) {
            console.error(error);
            message.error('ลบไม่สำเร็จ');
        }
    };

    const handleStatusChange = async (checked, record) => {
        try {
            const updatedService = {
                ...record,
                enabled: checked,
            };
            await updateService(record.id, updatedService);
            await refetchServices();
            message.info(`เปลี่ยนสถานะของ "${record.name}" เป็น ${checked ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`);
        } catch (error) {
            console.error(error);
            message.error('ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const columns = [
        {
            title: 'ชื่อบริการ',
            dataIndex: 'name',
            key: 'name',
            width: 'auto',
            ellipsis: true,
            render: (text, record) => (
                <div>
                    <span className="ms-name">{text}</span>
                    {record.description && (
                        <span className="ms-desc">{record.description}</span>
                    )}
                </div>
            ),
        },
        {
            title: 'ประเภท',
            dataIndex: 'unit',
            key: 'unit',
            width: 110,
            responsive: ['md'],
            render: (unit) => (
                <Tag style={unitTagStyle(unit)}>
                    {unit === 'monthly' ? 'รายเดือน' : 'ครั้งเดียว'}
                </Tag>
            ),
        },
        {
            title: 'ราคา',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            render: (price, record) => (
                <div style={{ textAlign: 'right' }}>
                    <span className="ms-price">฿{price.toLocaleString('en-US')}</span>
                    <div>
                        <Tag className="ms-mobile-only" style={unitTagStyle(record.unit)}>
                            {record.unit === 'monthly' ? 'รายเดือน' : 'ครั้งเดียว'}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            align: 'center',
            render: (status, record) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    aria-label={`เปิดหรือปิดใช้งาน ${record.name}`}
                />
            ),
        },
        {
            title: 'จัดการ',
            key: 'action',
            width: 130,
            align: 'center',
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        className="ms-secondary-btn"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        aria-label={`แก้ไข ${record.name}`}
                    >
                        <span className="ms-hide-sm">แก้ไข</span>
                    </Button>
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description={`คุณแน่ใจหรือไม่ที่จะลบบริการ "${record.name}"?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="ยืนยัน"
                        cancelText="ยกเลิก"
                        placement="topRight"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            
                            danger
                            aria-label={`ลบ ${record.name}`}
                        >
                            <span className="ms-hide-sm">ลบ</span>
                    </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="ms-root">
                <div className="ms-wrap">
                    {/* PageHeader */}
                    <header className="ms-banner">
                        <div className="ms-banner-icon" aria-hidden="true"><SettingOutlined /></div>
                        <div className="ms-banner-text">
                            <h1 className="ms-banner-title">จัดการค่าบริการเพิ่มเติม</h1>
                            <p className="ms-banner-sub">เพิ่ม ลบ หรือแก้ไขค่าบริการอื่นๆ สำหรับอพาร์ทเมนท์</p>
                        </div>
                        <Button
                            className="ms-primary-btn"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={showAddModal}
                        >
                            เพิ่มบริการใหม่
                        </Button>
                    </header>

                    {/* Table Section */}
                    <section className="ms-section">
                        <div className="ms-section-head">
                            <span className="ms-section-icon" aria-hidden="true"><AppstoreAddOutlined /></span>
                            <h2 className="ms-section-title">รายการค่าบริการ</h2>
                        </div>
                        <div className="ms-table-scroll">
                            <Table
                                className="ms-table"
                                columns={columns}
                                dataSource={services}
                                rowKey="id"
                                loading={isLoadingServices}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    showQuickJumper: false,
                                    showTotal: (total, range) => (
                                        <span style={{ fontSize: 12, color: C.muted }}>
                                            {`${range[0]}-${range[1]} จาก ${total} รายการ`}
                                        </span>
                                    ),
                                }}
                                scroll={{ x: 650 }}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal */}
            <Modal
                title={
                    <span style={{ fontSize: 18, fontWeight: 700 }}>
                        {editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
                    </span>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                width="100%"
                rootClassName="ms-modal"
                style={{ maxWidth: 600, top: 40 }}
                styles={{
                    content: { borderRadius: 20, padding: 24 },
                    body: { maxHeight: '80vh', overflowY: 'auto' },
                }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit(handleSave)}
                    style={{ paddingTop: 16 }}
                >
                    <Form.Item
                        label="ชื่อบริการ"
                        required
                        validateStatus={errors.name ? 'error' : ''}
                        help={errors.name?.message}
                    >
                        <NumericInputControllerPage
                            type='string'
                            controllerName='name'
                            control={control}
                            rulesName='กรุณากรอกชื่อบริการ'
                            placeholder='เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต'
                        />
                    </Form.Item>

                    <div className="ms-grid-2">
                        <Form.Item label="ประเภทการเรียกเก็บ" required>
                            <NumericInputControllerPage
                                type="select"
                                controllerName="unit"
                                control={control}
                                selectOptions={[
                                    { value: 'monthly', name: 'รายเดือน' },
                                    { value: 'onetime', name: 'ครั้งเดียว' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            label="ราคา"
                            required
                            validateStatus={errors.price ? 'error' : ''}
                            help={errors.price?.message}
                        >
                            <NumericInputControllerPage
                                type='number'
                                controllerName='price'
                                control={control}
                                rulesName='ราคาต้องมากกว่า 0'
                                placeholder='0'
                                prefix="฿"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item label="คำอธิบาย (ถ้ามี)">
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input.TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับบริการนี้"
                                />
                            )}
                        />
                    </Form.Item>

                    <div className="ms-modal-actions">
                        <Button className="ms-secondary-btn" onClick={handleCancel}>
                            ยกเลิก
                        </Button>
                        <Button className="ms-primary-btn" type="primary" htmlType="submit">
                            บันทึก
                        </Button>
                    </div>
                </Form>
            </Modal>
        </ConfigProvider>
    );
}