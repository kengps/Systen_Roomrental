import {
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    FileSearchOutlined,
    FilterOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    ConfigProvider,
    Table,
    Typography,
    Space,
    Tooltip,
    Button,
    Modal,
    Descriptions,
    Empty,
    Select,
    DatePicker
} from 'antd';
import { useState } from 'react';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import { getTelegramUpdates } from '../../../service/api/telegramUpdate';

const { Text } = Typography;
const { RangePicker } = DatePicker;

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
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
    okBg: '#DCFCE7', okFg: '#166534',
    warnBg: '#FEF1DC', warnFg: '#B45309',
    waterBg: '#E6EEFF', waterFg: '#2563EB',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.gul-page { background:${C.page}; min-height:100vh; padding:32px 24px; font-family:${FONT}; }
.gul-wrap { max-width:1400px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }

.gul-banner { background:${C.ink}; border-radius:20px; padding:24px 28px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.gul-banner-icon { width:52px; height:52px; border-radius:14px; background:${C.raised}; color:${C.onDarkIcon}; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
.gul-banner h1 { margin:0; font-size:26px; font-weight:700; color:#fff; line-height:1.3; }
.gul-banner p { margin:2px 0 0; font-size:14px; color:${C.onDarkMuted}; }

.gul-section { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; padding:24px; }
.gul-section-head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.gul-section-icon { width:36px; height:36px; border-radius:10px; background:${C.primarySoft}; color:${C.primary}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.gul-section-title { margin:0; font-size:16px; font-weight:700; color:${C.ink}; }

.gul-filters { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:20px; }

.gul-pill { display:inline-flex; align-items:center; gap:6px; padding:2px 12px; border-radius:999px; font-size:13px; font-weight:600; white-space:nowrap; }
.gul-pill-primary { background:${C.primarySoft}; color:${C.primarySoftText}; border:1px solid ${C.primarySoftLine}; }
.gul-pill-ok { background:${C.okBg}; color:${C.okFg}; }
.gul-pill-warn { background:${C.warnBg}; color:${C.warnFg}; }
.gul-pill-info { background:${C.waterBg}; color:${C.waterFg}; }
.gul-pill-neutral { background:${C.sunken}; color:${C.muted}; border:1px solid ${C.line}; }

.gul-icon-btn { width:44px; height:44px; border-radius:12px; border:1px solid ${C.primarySoftLine}; background:${C.primarySoft}; color:${C.primarySoftText}; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; font-size:16px; }
.gul-icon-btn:hover { background:#E0E4FF; }
.gul-icon-btn:focus-visible { outline:3px solid ${C.primarySoftLine}; outline-offset:2px; }

.gul-page .ant-table-thead > tr > th,
.gul-modal .ant-descriptions-item-label { background:${C.sunken}; color:${C.muted}; font-weight:600; }
.gul-modal .ant-descriptions-item-label { width:180px; }
.gul-modal .ant-modal-content { border-radius:20px; padding:24px; }
.gul-modal-title { display:flex; align-items:center; gap:12px; font-size:16px; font-weight:700; color:${C.ink}; }

@media (max-width: 600px) {
  .gul-page { padding:16px 12px; }
  .gul-banner { padding:20px; }
  .gul-banner h1 { font-size:22px; }
  .gul-section { padding:16px; }
  .gul-modal .ant-descriptions-item-label { width:110px; }
}
`;

/* ---------- ชิ้นส่วนที่ใช้ซ้ำ ---------- */
const PageHeader = ({ icon, title, subtitle }) => (
    <header className="gul-banner">
        <div className="gul-banner-icon" aria-hidden="true">{icon}</div>
        <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    </header>
);

const Section = ({ icon, title, children }) => (
    <section className="gul-section">
        {title && (
            <div className="gul-section-head">
                <div className="gul-section-icon" aria-hidden="true">{icon}</div>
                <h2 className="gul-section-title">{title}</h2>
            </div>
        )}
        {children}
    </section>
);

const Pill = ({ tone, icon, children }) => (
    <span className={`gul-pill gul-pill-${tone}`}>{icon}{children}</span>
);

const ProcessedPill = ({ processed }) => (
    processed ? (
        <Pill tone="ok" icon={<CheckCircleOutlined />}>ประมวลผลแล้ว</Pill>
    ) : (
        <Pill tone="neutral" icon={<CloseCircleOutlined />}>ยังไม่ประมวลผล</Pill>
    )
);

const GetUpdateLog = () => {
    const { apartmentData } = persistMiddleware();
    const apartmentId = apartmentData?.result?._id;

    const [selectedUpdate, setSelectedUpdate] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [processedFilter, setProcessedFilter] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    // Fetch telegram updates
    const { data: updatesData, isLoading } = useQuery({
        queryKey: ['telegramUpdates', apartmentId, processedFilter, dateRange],
        queryFn: () => getTelegramUpdates(apartmentId, {
            processed: processedFilter,
            startDate: dateRange?.[0]?.toISOString(),
            endDate: dateRange?.[1]?.toISOString()
        }),
        enabled: !!apartmentId
    });
    console.log(`⩇⩇:⩇⩇🚨 ~ updatesData :`, updatesData);


    const updates = updatesData?.data || [];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatTelegramDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUpdateType = (update) => {
        if (update.message) return { type: 'message', label: 'ข้อความ', tone: 'primary' };
        if (update.my_chat_member) return { type: 'my_chat_member', label: 'สมาชิก', tone: 'ok' };
        if (update.callback_query) return { type: 'callback_query', label: 'Callback', tone: 'warn' };
        if (update.edited_message) return { type: 'edited_message', label: 'แก้ไขข้อความ', tone: 'info' };
        if (update.channel_post) return { type: 'channel_post', label: 'โพสต์ช่อง', tone: 'info' };
        return { type: 'unknown', label: 'ไม่ทราบ', tone: 'neutral' };
    };

    const handleViewDetail = (update) => {
        setSelectedUpdate(update);
        setIsDetailModalVisible(true);
    };

    const handleCloseDetail = () => {
        setIsDetailModalVisible(false);
        setSelectedUpdate(null);
    };

    const columns = [
        {
            title: 'Update ID',
            dataIndex: 'update_id',
            key: 'update_id',
            width: 100,
            render: (id) => <Text code style={{ fontSize: '12px' }}>{id}</Text>
        },
        {
            title: 'ประเภท',
            key: 'type',
            width: 100,
            render: (_, record) => {
                const typeInfo = getUpdateType(record);
                return <Pill tone={typeInfo.tone}>{typeInfo.label}</Pill>;
            }
        },
        {
            title: 'ผู้ส่ง',
            key: 'from',
            width: 180,
            render: (_, record) => {
                const from = record.message?.from || record.my_chat_member?.from || record.callback_query?.from;
                if (!from) return '-';
                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{from.first_name} {from.last_name || ''}</Text>
                        {from.username && <Text type="secondary" style={{ fontSize: '11px' }}>@{from.username}</Text>}
                    </Space>
                );
            }
        },
        {
            title: 'ข้อความ/ข้อมูล',
            key: 'content',
            width: 150,
            ellipsis: true,
            render: (_, record) => {
                const text = record.message?.text ||
                    record.callback_query?.data ||
                    record.my_chat_member?.new_chat_member?.status ||
                    record.edited_message?.text ||
                    '-';
                return <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '150px' }}>{text}</Text>;
            }
        },
        {
            title: 'สถานะ',
            dataIndex: 'processed',
            key: 'processed',
            width: 150,
            render: (processed) => <ProcessedPill processed={processed} />
        },
        {
            title: 'วันที่',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => formatDate(date)
        },
        {
            title: 'การจัดการ',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="ดูรายละเอียด">
                    <button
                        type="button"
                        className="gul-icon-btn"
                        aria-label="ดูรายละเอียด"
                        onClick={() => handleViewDetail(record)}
                    >
                        <EyeOutlined />
                    </button>
                </Tooltip>
            )
        }
    ];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="gul-page">
                <div className="gul-wrap">
                    <PageHeader
                        title="บันทึก Telegram Updates"
                        subtitle="ดูประวัติการอัปเดตจาก Telegram Bot"
                        icon={<FileSearchOutlined />}
                    />

                    <Section icon={<UnorderedListOutlined />}>
                        {/* Filters */}
                        <div className="gul-filters">
                            <Select
                                placeholder="กรองตามสถานะ"
                                aria-label="กรองตามสถานะ"
                                suffixIcon={<FilterOutlined />}
                                allowClear
                                style={{ width: '100%' }}
                                value={processedFilter}
                                onChange={setProcessedFilter}
                            >
                                <Select.Option value={true}>ประมวลผลแล้ว</Select.Option>
                                <Select.Option value={false}>ยังไม่ประมวลผล</Select.Option>
                            </Select>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
                                value={dateRange}
                                onChange={setDateRange}
                            />
                        </div>

                        <Table
                            columns={columns}
                            dataSource={updates}
                            rowKey="_id"
                            loading={isLoading}
                            locale={{ emptyText: <Empty description="ยังไม่มีข้อมูล" /> }}
                            scroll={{ x: 1000 }}
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `ทั้งหมด ${total} รายการ`,
                                pageSizeOptions: ['10', '20', '50', '100']
                            }}
                        />
                    </Section>
                </div>

                {/* Detail Modal */}
                <Modal
                    rootClassName="gul-modal"
                    title={
                        <div className="gul-modal-title">
                            <div className="gul-section-icon" aria-hidden="true"><MessageOutlined /></div>
                            <span>รายละเอียด Update</span>
                        </div>
                    }
                    open={isDetailModalVisible}
                    onCancel={handleCloseDetail}
                    footer={null}
                    width={800}
                    centered
                >
                    {selectedUpdate && (
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Update ID">
                                <Text code>{selectedUpdate.update_id}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="ประเภท">
                                {(() => {
                                    const typeInfo = getUpdateType(selectedUpdate);
                                    return <Pill tone={typeInfo.tone}>{typeInfo.label}</Pill>;
                                })()}
                            </Descriptions.Item>

                            {selectedUpdate.message && (
                                <>
                                    <Descriptions.Item label="Message ID">
                                        {selectedUpdate.message.message_id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="ผู้ส่ง">
                                        {selectedUpdate.message.from && (
                                            <Space direction="vertical" size={0}>
                                                <Text strong>
                                                    {selectedUpdate.message.from.first_name} {selectedUpdate.message.from.last_name || ''}
                                                </Text>
                                                {selectedUpdate.message.from.username && (
                                                    <Text type="secondary">@{selectedUpdate.message.from.username}</Text>
                                                )}
                                                <Text type="secondary">ID: {selectedUpdate.message.from.id}</Text>
                                            </Space>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chat">
                                        {selectedUpdate.message.chat && (
                                            <Space direction="vertical" size={0}>
                                                <Text>{selectedUpdate.message.chat.title || selectedUpdate.message.chat.first_name}</Text>
                                                <Text type="secondary">Type: {selectedUpdate.message.chat.type}</Text>
                                                <Text type="secondary">Chat ID: {selectedUpdate.message.chat.id}</Text>
                                            </Space>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="ข้อความ">
                                        {selectedUpdate.message.text || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="วันที่ส่ง">
                                        {formatTelegramDate(selectedUpdate.message.date)}
                                    </Descriptions.Item>
                                </>
                            )}

                            {selectedUpdate.my_chat_member && (
                                <>
                                    <Descriptions.Item label="ผู้เปลี่ยนแปลง">
                                        {selectedUpdate.my_chat_member.from && (
                                            <Text>
                                                {selectedUpdate.my_chat_member.from.first_name} {selectedUpdate.my_chat_member.from.last_name || ''}
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="สถานะเก่า">
                                        {selectedUpdate.my_chat_member.old_chat_member?.status || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="สถานะใหม่">
                                        {selectedUpdate.my_chat_member.new_chat_member?.status || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Bot">
                                        {selectedUpdate.my_chat_member.new_chat_member?.user && (
                                            <Text>
                                                {selectedUpdate.my_chat_member.new_chat_member.user.first_name}
                                                {selectedUpdate.my_chat_member.new_chat_member.user.username &&
                                                    ` (@${selectedUpdate.my_chat_member.new_chat_member.user.username})`
                                                }
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                </>
                            )}

                            {selectedUpdate.callback_query && (
                                <>
                                    <Descriptions.Item label="Callback Data">
                                        {selectedUpdate.callback_query.data || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="ผู้ส่ง">
                                        {selectedUpdate.callback_query.from && (
                                            <Text>
                                                {selectedUpdate.callback_query.from.first_name} {selectedUpdate.callback_query.from.last_name || ''}
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                </>
                            )}

                            <Descriptions.Item label="สถานะการประมวลผล">
                                <ProcessedPill processed={selectedUpdate.processed} />
                            </Descriptions.Item>

                            {selectedUpdate.processedAt && (
                                <Descriptions.Item label="วันที่ประมวลผล">
                                    {formatDate(selectedUpdate.processedAt)}
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="สร้างเมื่อ">
                                {formatDate(selectedUpdate.createdAt)}
                            </Descriptions.Item>

                            <Descriptions.Item label="อัปเดตล่าสุด">
                                {formatDate(selectedUpdate.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default GetUpdateLog;