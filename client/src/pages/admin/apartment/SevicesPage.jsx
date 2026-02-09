import {
    AppstoreAddOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
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
import PageHeader from '../../../components/common/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;



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
                    <Text strong style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                        {text}
                    </Text>
                    {record.description && (
                        <div>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 'clamp(10px, 2vw, 12px)',
                                    display: 'block',
                                    marginTop: '2px'
                                }}
                            >
                                {record.description}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'ประเภท',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
            responsive: ['md'],
            render: (unit) => (
                <Tag
                    color={unit === 'monthly' ? 'blue' : 'green'}
                    style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}
                >
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
                    <Text strong style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                        ฿{price.toLocaleString('en-US')}
                    </Text>
                    <div style={{ display: 'block', fontSize: 'clamp(10px, 2vw, 11px)' }}>
                        <Tag
                            color={record.unit === 'monthly' ? 'blue' : 'green'}
                            size="small"
                            className="md:hidden"
                            style={{
                                fontSize: 'clamp(9px, 1.8vw, 10px)',
                                marginTop: '2px'
                            }}
                        >
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
            width: 80,
            align: 'center',
            render: (status, record) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    size="small"
                />
            ),
        },
        {
            title: 'จัดการ',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        size="small"
                        style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}
                    >
                        <span className="hidden sm:inline">แก้ไข</span>
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
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: 'clamp(8px, 2vw, 32px)'
        }}>
            <Card style={{
                maxWidth: '1200px',
                margin: '0 auto',
                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
                borderRadius: '8px'
            }}>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <PageHeader
                        title="จัดการค่าบริการเพิ่มเติม"
                        subtitle="เพิ่ม ลบ หรือแก้ไขค่าบริการอื่นๆ สำหรับอพาร์ทเมนท์"
                        icon="⚙️"
                    />
                    
                    <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={showAddModal}
                            style={{
                                fontSize: 'clamp(12px, 2.5vw, 14px)',
                                height: 'clamp(36px, 6vw, 40px)'
                            }}
                        >
                            เพิ่มบริการใหม่
                        </Button>
                    </div>

                    {/* Table Section */}
                    <div style={{
                        overflowX: 'auto',
                        margin: '0 -16px',
                        padding: '0 16px'
                    }}>
                        <Table
                            columns={columns}
                            dataSource={services}
                            rowKey="id"
                            loading={isLoadingServices}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showQuickJumper: false,
                                showTotal: (total, range) => (
                                    <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>
                                        {`${range[0]}-${range[1]} จาก ${total} รายการ`}
                                    </span>
                                ),
                                itemRender: (page, type, originalElement) => {
                                    if (type === 'prev' || type === 'next') {
                                        return React.cloneElement(originalElement, {
                                            style: { fontSize: 'clamp(10px, 2vw, 12px)' }
                                        });
                                    }
                                    return originalElement;
                                }
                            }}
                            scroll={{ x: 650 }}
                            size="small"
                            style={{
                                fontSize: 'clamp(11px, 2.2vw, 13px)'
                            }}
                        />
                    </div>
                </Space>
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <Title
                        level={4}
                        style={{
                            margin: 0,
                            fontSize: 'clamp(16px, 3vw, 18px)'
                        }}
                    >
                        {editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
                    </Title>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                width="100%"
                style={{
                    maxWidth: '600px',
                    top: 'clamp(20px, 5vh, 50px)'
                }}
                bodyStyle={{
                    padding: 'clamp(12px, 3vw, 24px)',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit(handleSave)}
                    style={{ paddingTop: '16px' }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                ชื่อบริการ
                            </span>
                        }
                        required
                        validateStatus={errors.name ? 'error' : ''}
                        help={errors.name?.message}
                        style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}
                    >
                        <NumericInputControllerPage
                            type='string'
                            controllerName='name'
                            control={control}
                            rulesName='กรุณากรอกชื่อบริการ'
                            placeholder='เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต'
                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        />
                    </Form.Item>

                    <Row gutter={[12, 12]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                        ประเภทการเรียกเก็บ
                                    </span>
                                }
                                required
                                style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}
                            >
                                <NumericInputControllerPage
                                    type="select"
                                    controllerName="unit"
                                    control={control}
                                    selectOptions={[
                                        { value: 'monthly', name: 'รายเดือน' },
                                        { value: 'onetime', name: 'ครั้งเดียว' },
                                    ]}
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                        ราคา
                                    </span>
                                }
                                required
                                validateStatus={errors.price ? 'error' : ''}
                                help={errors.price?.message}
                                style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}
                            >
                                <NumericInputControllerPage
                                    type='number'
                                    controllerName='price'
                                    control={control}
                                    rulesName='ราคาต้องมากกว่า 0'
                                    placeholder='0'
                                    prefix="฿"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={
                            <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                คำอธิบาย (ถ้ามี)
                            </span>
                        }
                        style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                    >
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input.TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับบริการนี้"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                            )}
                        />
                    </Form.Item>

                    <Divider style={{ margin: 'clamp(12px, 3vw, 16px) 0' }} />

                    <Form.Item
                        style={{
                            textAlign: 'right',
                            marginBottom: 0
                        }}
                    >
                        <Space
                            size="middle"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-end',
                                flexWrap: 'wrap'
                            }}
                        >
                            <Button
                                onClick={handleCancel}
                                style={{
                                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                                    minWidth: '80px'
                                }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                                    minWidth: '80px'
                                }}
                            >
                                บันทึก
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}