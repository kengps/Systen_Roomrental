import {
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Card,
    Table,
    Tag,
    Typography,
    Space,
    Tooltip,
    Button,
    Modal,
    Descriptions,
    Empty,
    Select,
    DatePicker,
    Row,
    Col
} from 'antd';
import { useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import { getTelegramUpdates } from '../../../service/api/telegramUpdate';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
        if (update.message) return { type: 'message', label: 'ข้อความ', color: 'blue' };
        if (update.my_chat_member) return { type: 'my_chat_member', label: 'สมาชิก', color: 'green' };
        if (update.callback_query) return { type: 'callback_query', label: 'Callback', color: 'orange' };
        if (update.edited_message) return { type: 'edited_message', label: 'แก้ไขข้อความ', color: 'purple' };
        if (update.channel_post) return { type: 'channel_post', label: 'โพสต์ช่อง', color: 'cyan' };
        return { type: 'unknown', label: 'ไม่ทราบ', color: 'default' };
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
                return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
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
            width: 130,
            render: (processed) => (
                processed ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">ประมวลผลแล้ว</Tag>
                ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">ยังไม่ประมวลผล</Tag>
                )
            )
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
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <div style={{ background: '#f5f5f5', padding: '24px', minHeight: '100vh' }}>
            <PageHeader
                title="บันทึก Telegram Updates"
                subtitle="ดูประวัติการอัปเดตจาก Telegram Bot"
                icon="📋"
            />

            <Card
                style={{
                    maxWidth: 1400,
                    margin: '24px auto',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
            >
                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="กรองตามสถานะ"
                            allowClear
                            style={{ width: '100%' }}
                            value={processedFilter}
                            onChange={setProcessedFilter}
                        >
                            <Select.Option value={true}>ประมวลผลแล้ว</Select.Option>
                            <Select.Option value={false}>ยังไม่ประมวลผล</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                        <RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </Col>
                </Row>

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
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <MessageOutlined />
                        <Title level={5} style={{ margin: 0 }}>รายละเอียด Update</Title>
                    </Space>
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
                                return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
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
                            {selectedUpdate.processed ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">ประมวลผลแล้ว</Tag>
                            ) : (
                                <Tag icon={<CloseCircleOutlined />} color="default">ยังไม่ประมวลผล</Tag>
                            )}
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
    );
};

export default GetUpdateLog;

