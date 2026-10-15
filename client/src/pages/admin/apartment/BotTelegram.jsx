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
    ConfigProvider,
    Table,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Skeleton,
    Tooltip,
} from 'antd';
import { useState } from 'react';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import {
    listBots,
    createBot,
    updateBot,
    deleteBot,
    syncBot
} from '../../../service/api/botTelegram';

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
    dangerBg: '#FFE4E9',
    dangerFg: '#9F1239',
    dangerNum: '#BE123C',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
    components: {
        Table: { headerBg: C.sunken, headerColor: C.muted, borderColor: C.line },
    },
};

const css = `
.bt-page {
    max-width: 1200px; margin: 0 auto; padding: 24px; width: 100%; min-height: 100vh;
    box-sizing: border-box; font-family: ${FONT}; color: ${C.ink}; background: ${C.page};
}
.bt-stack { display: flex; flex-direction: column; gap: 20px; }

.bt-banner {
    background: ${C.ink}; border-radius: 20px; padding: 24px 28px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.bt-banner-icon {
    width: 52px; height: 52px; border-radius: 14px; background: ${C.raised}; color: ${C.onDarkIcon};
    display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
}
.bt-banner-text { flex: 1 1 240px; min-width: 0; }
.bt-banner h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.bt-banner p { margin: 4px 0 0; font-size: 14px; color: ${C.onDarkMuted}; }

.bt-btn.ant-btn {
    background: ${C.primary}; color: #fff; font-weight: 600; border: none;
    border-radius: 12px; height: 44px; padding: 0 22px;
}
.bt-btn.ant-btn:hover:not(:disabled) { background: ${C.primaryDeep} !important; color: #fff !important; }
.bt-btn-second.ant-btn {
    background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; color: ${C.primarySoftText};
    font-weight: 600; border-radius: 12px; height: 44px; padding: 0 22px;
}
.bt-btn-second.ant-btn:hover { background: #E2E6FF !important; color: ${C.primarySoftText} !important; border-color: ${C.primarySoftLine} !important; }

.bt-section {
    background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px;
}
.bt-table-wrap { overflow-x: auto; }
.bt-cards { display: none; }

.bt-name { font-weight: 700; color: ${C.ink}; }
.bt-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 8px; padding: 2px 8px;
    color: ${C.primarySoftText}; word-break: break-all;
}

.bt-card {
    background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
}
.bt-card-head { display: flex; align-items: center; gap: 12px; }
.bt-card-icon {
    width: 40px; height: 40px; border-radius: 10px; background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
.bt-card-name { font-size: 16px; font-weight: 700; color: ${C.ink}; min-width: 0; word-break: break-word; }
.bt-field-label { font-size: 12px; color: ${C.muted}; margin-bottom: 2px; }
.bt-field-value { font-size: 13px; color: ${C.ink}; }
.bt-card-actions { display: flex; justify-content: flex-end; gap: 4px; }

.bt-actions { display: inline-flex; align-items: center; gap: 4px; }
.bt-icon-btn {
    width: 40px; height: 40px; border-radius: 10px; border: 0; background: transparent;
    color: ${C.muted}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
    font-size: 16px; font-family: inherit;
}
.bt-icon-btn:hover:not(:disabled) { background: ${C.primarySoft}; color: ${C.primarySoftText}; }
.bt-icon-btn:disabled { opacity: .5; cursor: not-allowed; }
.bt-icon-btn.danger { color: ${C.dangerNum}; }
.bt-icon-btn.danger:hover { background: ${C.dangerBg}; color: ${C.dangerFg}; }

.bt-empty { text-align: center; padding: 40px 16px; }
.bt-empty-icon {
    width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px;
    background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.bt-empty p { margin: 0; font-size: 14px; color: ${C.muted}; }

.bt-modal { max-width: calc(100vw - 24px); }
.bt-modal-title { font-size: 16px; font-weight: 700; color: ${C.ink}; font-family: ${FONT}; margin: 0; }
.bt-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; flex-wrap: wrap; }

.bt-page button:focus-visible, .bt-page .ant-btn:focus-visible,
.bt-modal button:focus-visible, .bt-modal .ant-btn:focus-visible {
    outline: 3px solid ${C.primary}; outline-offset: 2px;
}

@media (max-width: 768px) {
    .bt-page { padding: 12px; }
    .bt-banner { padding: 20px; border-radius: 16px; }
    .bt-banner h1 { font-size: 22px; }
    .bt-banner .bt-btn { width: 100%; }
    .bt-section { padding: 16px; border-radius: 16px; }
    .bt-table-wrap { display: none; }
    .bt-cards { display: flex; flex-direction: column; gap: 12px; }
    .bt-form-actions .ant-btn { flex: 1; }
}
`;

const BotTelegram = () => {
    const { apartmentData } = persistMiddleware();
    const apartmentId = apartmentData?.result?._id;
    const queryClient = useQueryClient();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBot, setEditingBot] = useState(null);
    const [form] = Form.useForm();

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

    /* ---------- ส่วนแสดงผล ---------- */
    const renderToken = (token) => (
        <Tooltip title={token}>
            <span className="bt-code">{maskToken(token)}</span>
        </Tooltip>
    );

    const renderActions = (record) => {
        const name = record.botName || 'บอท';
        return (
            <div className="bt-actions">
                <button
                    type="button"
                    className="bt-icon-btn"
                    aria-label={`ซิงค์ข้อมูล ${name}`}
                    onClick={() => handleSync(record._id)}
                    disabled={syncMutation.isLoading}
                >
                    <SyncOutlined spin={syncMutation.isLoading} />
                </button>
                <button
                    type="button"
                    className="bt-icon-btn"
                    aria-label={`แก้ไข ${name}`}
                    onClick={() => handleShowEditModal(record)}
                >
                    <EditOutlined />
                </button>
                <Popconfirm
                    title="ยืนยันการลบบอท?"
                    description="การลบจะไม่สามารถกู้คืนได้"
                    onConfirm={() => handleDelete(record._id)}
                    okText="ยืนยัน"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                >
                    <button
                        type="button"
                        className="bt-icon-btn danger"
                        aria-label={`ลบ ${name}`}
                    >
                        <DeleteOutlined />
                    </button>
                </Popconfirm>
            </div>
        );
    };

    const emptyNode = (
        <div className="bt-empty">
            <div className="bt-empty-icon" aria-hidden="true"><RobotOutlined /></div>
            <p>ยังไม่มีบอท</p>
        </div>
    );

    // Table columns for desktop
    const columns = [
        {
            title: 'ชื่อบอท',
            dataIndex: 'botName',
            key: 'botName',
            render: (text) => <span className="bt-name">{text || '-'}</span>
        },
        {
            title: 'Token',
            dataIndex: 'token',
            key: 'token',
            render: renderToken
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
            render: (_, record) => renderActions(record)
        }
    ];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="bt-page">
                <div className="bt-stack">
                    <header className="bt-banner">
                        <div className="bt-banner-icon" aria-hidden="true"><RobotOutlined /></div>
                        <div className="bt-banner-text">
                            <h1>จัดการ Telegram Bot</h1>
                            <p>เพิ่ม แก้ไข และจัดการ Telegram Bot สำหรับส่งการแจ้งเตือน</p>
                        </div>
                        <Button
                            type="primary"
                            className="bt-btn"
                            icon={<PlusOutlined />}
                            onClick={handleShowAddModal}
                        >
                            เพิ่มบอท
                        </Button>
                    </header>

                    <section className="bt-section">
                        {/* Desktop: Table view */}
                        <div className="bt-table-wrap">
                            <Table
                                columns={columns}
                                dataSource={bots}
                                rowKey="_id"
                                loading={isLoading}
                                locale={{ emptyText: emptyNode }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `ทั้งหมด ${total} รายการ`
                                }}
                            />
                        </div>

                        {/* Mobile: Card view */}
                        <div className="bt-cards">
                            {isLoading ? (
                                <Skeleton active paragraph={{ rows: 3 }} />
                            ) : bots.length === 0 ? (
                                emptyNode
                            ) : (
                                bots.map((bot) => (
                                    <div className="bt-card" key={bot._id}>
                                        <div className="bt-card-head">
                                            <div className="bt-card-icon" aria-hidden="true"><RobotOutlined /></div>
                                            <div className="bt-card-name">{bot.botName || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="bt-field-label">Token:</div>
                                            {renderToken(bot.token)}
                                        </div>
                                        <div>
                                            <div className="bt-field-label">สร้างเมื่อ:</div>
                                            <div className="bt-field-value">{formatDate(bot.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div className="bt-field-label">อัปเดตล่าสุด:</div>
                                            <div className="bt-field-value">{formatDate(bot.updatedAt)}</div>
                                        </div>
                                        <div className="bt-card-actions">{renderActions(bot)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Add/Edit Modal */}
                <Modal
                    title={
                        <div className="bt-modal-title">
                            {editingBot ? 'แก้ไขบอท' : 'เพิ่มบอทใหม่'}
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={handleCancelModal}
                    footer={null}
                    destroyOnClose
                    centered
                    width={600}
                    className="bt-modal"
                    styles={{ content: { borderRadius: 20 } }}
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

                        <Form.Item style={{ marginBottom: 0 }}>
                            <div className="bt-form-actions">
                                <Button className="bt-btn-second" onClick={handleCancelModal}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="primary"
                                    className="bt-btn"
                                    htmlType="submit"
                                    loading={createMutation.isLoading || updateMutation.isLoading}
                                >
                                    {editingBot ? 'บันทึกการแก้ไข' : 'เพิ่มบอท'}
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default BotTelegram;