import { 
    SyncOutlined, 
    DeleteOutlined, 
    EditOutlined, 
    PlusOutlined,
    RobotOutlined 
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Button, 
    Card, 
    Table, 
    Modal, 
    Form, 
    Input, 
    message, 
    Popconfirm, 
    Space, 
    Typography,
    Tooltip,
    Empty
} from 'antd';
import { useState, useEffect } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import { 
    listBots, 
    createBot, 
    updateBot, 
    deleteBot, 
    syncBot 
} from '../../../service/api/botTelegram';

const { Title, Text } = Typography;

const BotTelegram = () => {
    const { apartmentData } = persistMiddleware();
    const apartmentId = apartmentData?.result?._id;
    const queryClient = useQueryClient();
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBot, setEditingBot] = useState(null);
    const [form] = Form.useForm();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch bots list
    const { data: botsData, isLoading } = useQuery({
        queryKey: ['listBots', apartmentId],
        queryFn: () => listBots(apartmentId),
        enabled: !!apartmentId
    });

    const bots = botsData?.data?.bots || [];

    // Create bot mutation
    const createMutation = useMutation({
        mutationFn: createBot,
        onSuccess: () => {
            message.success('เพิ่มบอทสำเร็จ');
            queryClient.invalidateQueries(['listBots']);
            handleCancelModal();
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'เพิ่มบอทไม่สำเร็จ');
        }
    });

    // Update bot mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateBot(id, data),
        onSuccess: () => {
            message.success('แก้ไขบอทสำเร็จ');
            queryClient.invalidateQueries(['listBots']);
            handleCancelModal();
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'แก้ไขบอทไม่สำเร็จ');
        }
    });

    // Delete bot mutation
    const deleteMutation = useMutation({
        mutationFn: deleteBot,
        onSuccess: () => {
            message.success('ลบบอทสำเร็จ');
            queryClient.invalidateQueries(['listBots']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'ลบบอทไม่สำเร็จ');
        }
    });

    // Sync bot mutation
    const syncMutation = useMutation({
        mutationFn: syncBot,
        onSuccess: () => {
            message.success('ซิงค์ข้อมูลบอทสำเร็จ');
            queryClient.invalidateQueries(['listBots']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'ซิงค์ข้อมูลบอทไม่สำเร็จ');
        }
    });

    const handleShowAddModal = () => {
        setEditingBot(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleShowEditModal = (bot) => {
        setEditingBot(bot);
        form.setFieldsValue({
            token: bot.token,
            botName: bot.botName
        });
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingBot(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        if (editingBot) {
            await updateMutation.mutateAsync({
                id: editingBot._id,
                data: {
                    token: values.token,
                    botName: values.botName,
                    apartmantId: apartmentId
                }
            });
        } else {
            await createMutation.mutateAsync({
                token: values.token,
                botName: values.botName,
                apartmantId: apartmentId
            });
        }
    };

    const handleDelete = async (botId) => {
        await deleteMutation.mutateAsync(botId);
    };

    const handleSync = async (botId) => {
        await syncMutation.mutateAsync(botId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maskToken = (token) => {
        if (!token) return '-';
        const parts = token.split(':');
        if (parts.length === 2) {
            return `${parts[0]}:${'*'.repeat(Math.min(parts[1].length, 20))}`;
        }
        return token.substring(0, 10) + '...';
    };

    // Table columns for desktop
    const columns = [
        {
            title: 'ชื่อบอท',
            dataIndex: 'botName',
            key: 'botName',
            render: (text) => <Text strong>{text || '-'}</Text>
        },
        {
            title: 'Token',
            dataIndex: 'token',
            key: 'token',
            render: (token) => (
                <Tooltip title={token}>
                    <Text code style={{ fontSize: '12px' }}>
                        {maskToken(token)}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: 'สร้างเมื่อ',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date)
        },
        {
            title: 'อัปเดตล่าสุด',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => formatDate(date)
        },
        {
            title: 'การจัดการ',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="ซิงค์ข้อมูล">
                        <Button
                            type="text"
                            icon={<SyncOutlined />}
                            onClick={() => handleSync(record._id)}
                            loading={syncMutation.isLoading}
                        />
                    </Tooltip>
                    <Tooltip title="แก้ไข">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleShowEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="ยืนยันการลบบอท?"
                        description="การลบจะไม่สามารถกู้คืนได้"
                        onConfirm={() => handleDelete(record._id)}
                        okText="ยืนยัน"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="ลบ">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ background: '#f5f5f5', padding: '24px', minHeight: '100vh' }}>
            <PageHeader
                title="จัดการ Telegram Bot"
                subtitle="เพิ่ม แก้ไข และจัดการ Telegram Bot สำหรับส่งการแจ้งเตือน"
                icon="🤖"
            />

            <Card
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleShowAddModal}
                        size={isMobile ? 'middle' : 'large'}
                    >
                        เพิ่มบอท
                    </Button>
                }
                style={{
                    maxWidth: 1200,
                    margin: '24px auto',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
            >
                {isMobile ? (
                    // Mobile: Card view
                    <div>
                        {bots.length === 0 ? (
                            <Empty description="ยังไม่มีบอท" />
                        ) : (
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {bots.map((bot) => (
                                    <Card
                                        key={bot._id}
                                        size="small"
                                        style={{ borderRadius: 8 }}
                                    >
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                                                <Title level={5} style={{ margin: 0 }}>
                                                    {bot.botName || '-'}
                                                </Title>
                                            </div>
                                            
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Token:</Text>
                                                <br />
                                                <Tooltip title={bot.token}>
                                                    <Text code style={{ fontSize: 11 }}>
                                                        {maskToken(bot.token)}
                                                    </Text>
                                                </Tooltip>
                                            </div>

                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>สร้างเมื่อ:</Text>
                                                <br />
                                                <Text style={{ fontSize: 12 }}>
                                                    {formatDate(bot.createdAt)}
                                                </Text>
                                            </div>

                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>อัปเดตล่าสุด:</Text>
                                                <br />
                                                <Text style={{ fontSize: 12 }}>
                                                    {formatDate(bot.updatedAt)}
                                                </Text>
                                            </div>

                                            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 8 }}>
                                                <Tooltip title="ซิงค์ข้อมูล">
                                                    <Button
                                                        type="text"
                                                        icon={<SyncOutlined />}
                                                        onClick={() => handleSync(bot._id)}
                                                        loading={syncMutation.isLoading}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="แก้ไข">
                                                    <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleShowEditModal(bot)}
                                                    />
                                                </Tooltip>
                                                <Popconfirm
                                                    title="ยืนยันการลบบอท?"
                                                    description="การลบจะไม่สามารถกู้คืนได้"
                                                    onConfirm={() => handleDelete(bot._id)}
                                                    okText="ยืนยัน"
                                                    cancelText="ยกเลิก"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Tooltip title="ลบ">
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        />
                                                    </Tooltip>
                                                </Popconfirm>
                                            </Space>
                                        </Space>
                                    </Card>
                                ))}
                            </Space>
                        )}
                    </div>
                ) : (
                    // Desktop: Table view
                    <Table
                        columns={columns}
                        dataSource={bots}
                        rowKey="_id"
                        loading={isLoading}
                        locale={{ emptyText: <Empty description="ยังไม่มีบอท" /> }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `ทั้งหมด ${total} รายการ`
                        }}
                    />
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={
                    <Title level={5} style={{ margin: 0 }}>
                        {editingBot ? 'แก้ไขบอท' : 'เพิ่มบอทใหม่'}
                    </Title>
                }
                open={isModalVisible}
                onCancel={handleCancelModal}
                footer={null}
                destroyOnClose
                centered
                width={isMobile ? '90%' : 600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="ชื่อบอท"
                        name="botName"
                        rules={[
                            { required: true, message: 'กรุณากรอกชื่อบอท' },
                            { min: 3, message: 'ชื่อบอทต้องมีอย่างน้อย 3 ตัวอักษร' }
                        ]}
                    >
                        <Input
                            placeholder="เช่น apartment013_bot"
                            prefix={<RobotOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Token"
                        name="token"
                        rules={[
                            { required: true, message: 'กรุณากรอก Token' },
                            { 
                                pattern: /^\d+:[A-Za-z0-9_-]+$/, 
                                message: 'รูปแบบ Token ไม่ถูกต้อง (ต้องเป็น format: number:token)' 
                            }
                        ]}
                        extra="Token จาก BotFather ในรูปแบบ: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    >
                        <Input.Password
                            placeholder="เช่น 8040493817:AAGB65zxaWs4bB_ye5_Kge1T42haUM-Nh1s"
                            visibilityToggle
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancelModal}>
                                ยกเลิก
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createMutation.isLoading || updateMutation.isLoading}
                            >
                                {editingBot ? 'บันทึกการแก้ไข' : 'เพิ่มบอท'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BotTelegram;

