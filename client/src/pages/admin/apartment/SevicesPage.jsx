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
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { addServices, getServices } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Mock Data ---
const initialServicesData = [
    { id: 'S1', name: 'ค่าที่จอดรถ', unit: 'monthly', price: 300, status: true, description: 'สำหรับรถยนต์ 1 คัน' },
    { id: 'S2', name: 'ค่าอินเทอร์เน็ต', unit: 'monthly', price: 599, status: true, description: 'ความเร็ว 300/300 Mbps' },
    { id: 'S3', name: 'ค่าทำความสะอาดใหญ่', unit: 'onetime', price: 800, status: false, description: 'ทำความสะอาดเมื่อแจ้งย้ายออก' },
    { id: 'S4', name: 'ค่าบริการฟิตเนส', unit: 'monthly', price: 200, status: true, description: 'สำหรับผู้พักอาศัย 1 ท่าน' },
];
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
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'ประเภท',
            dataIndex: 'unit',
            key: 'unit',
            render: (unit) => (
                <Tag color={unit === 'monthly' ? 'blue' : 'green'}>
                    {unit === 'monthly' ? 'รายเดือน' : 'ครั้งเดียว'}
                </Tag>
            ),
        },
        {
            title: 'ราคา (บาท)',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => price.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Switch checked={status} onChange={(checked) => handleStatusChange(checked, record)} />
            ),
        },
        {
            title: 'การดำเนินการ',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>แก้ไข</Button>
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description={`คุณแน่ใจหรือไม่ที่จะลบบริการ "${record.name}"?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="ยืนยัน"
                        cancelText="ยกเลิก"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '32px' }}>
            <Card style={{ maxWidth: '1200px', margin: '0 auto', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space align="center" size="middle">
                                <AppstoreAddOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>จัดการค่าบริการเพิ่มเติม</Title>
                                    <Text type="secondary">เพิ่ม ลบ หรือแก้ไขค่าบริการอื่นๆ สำหรับอพาร์ทเมนท์</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={showAddModal}>
                                เพิ่มบริการใหม่
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={services}
                        rowKey="id"
                        loading={isLoadingServices}
                        pagination={false}
                    />
                </Space>
            </Card>

            <Modal
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        {editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
                    </Title>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnHidden
            >
                <Form layout="vertical" onFinish={handleSubmit(handleSave)} style={{ paddingTop: '16px' }}>
                    <Form.Item label="ชื่อบริการ" required validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
                        <NumericInputControllerPage
                            type='string'
                            controllerName='name'
                            control={control}
                            rulesName='กรุณากรอกชื่อบริการ'
                            placeholder='เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต'

                        />
                        {/* <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'กรุณากรอกชื่อบริการ' }}
                            render={({ field }) => <Input {...field} placeholder="เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต" />}
                        /> */}
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
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

                                {/* <Controller
                                    name="unit"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} >
                                            <Option value="monthly">รายเดือน</Option>
                                            <Option value="onetime">รายเดือน</Option>
                                        </Select>
                                    )}
                                /> */}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="ราคา" required validateStatus={errors.price ? 'error' : ''} help={errors.price?.message}>

                                <NumericInputControllerPage
                                    type='number'
                                    controllerName='price'
                                    control={control}
                                    rulesName='ราคาต้องมากกว่า 0'
                                    placeholder='เช่น ค่าที่จอดรถ, ค่าอินเทอร์เน็ต'
                                    prefix="฿"

                                />
                                {/* <Controller
                                    name="price"
                                    control={control}
                                    rules={{ min: { value: 1, message: 'ราคาต้องมากกว่า 0' } }}
                                    render={({ field }) => <InputNumber
                                        min={0}{...field}
                                        prefix="฿"
                                        style={{ width: '100%' }}

                                        onKeyDown={(event) => {
                                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                            const isCtrlCmd = event.ctrlKey || event.metaKey; // Ctrl หรือ Cmd

                                            // อนุญาต Ctrl/Cmd + (C, V, X, A)
                                            if (isCtrlCmd && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                                                return; // อนุญาตให้ทำงานตามปกติ
                                            }

                                            // ถ้าไม่ใช่เลข และไม่ใช่ปุ่มที่อนุญาตอื่น ๆ บล็อคการพิมพ์
                                            if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                                                event.preventDefault();
                                            }
                                        }}

                                        onPaste={(event) => {
                                            const pasteData = event.clipboardData.getData('text');
                                            if (!/^\d+$/.test(pasteData)) {
                                                event.preventDefault();
                                            }
                                        }}

                                    />}
                                /> */}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="คำอธิบาย (ถ้ามี)">
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Input.TextArea {...field} rows={3} placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับบริการนี้" />}
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleCancel}>ยกเลิก</Button>
                            <Button type="primary" htmlType="submit">บันทึก</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}