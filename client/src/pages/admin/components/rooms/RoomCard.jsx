import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { CheckCircleFilled, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RoomCard = ({ room, isSelected, onSelect }) => {
    const isAvailable = room.status === 'available';

    return (
        <Card
            hoverable
            onClick={onSelect}
            style={{
                width: 160,
                position: 'relative',
                border: isSelected ? '2px solid #1677ff' : '1px solid #d9d9d9',
                // --- ⬇️ ส่วนที่แก้ไข ⬇️ ---
                // ถ้าถูกเลือก: ใช้สีฟ้า
                // ถ้าไม่ถูกเลือก: เช็คสถานะ ถ้า 'ว่าง' ใช้สีเขียวอ่อน ถ้า 'ไม่ว่าง' ใช้สีแดงอ่อน
                // backgroundColor: isSelected
                //     ? '#e6f4ff'
                //     : (isAvailable ? '#f6ffed' : '#fff1f0')
            }}
            styles={{
                body: { // ✅ ใช้ styles.body แทน bodyStyle
                    padding: 12,
                    textAlign: 'center'
                }
            }}

        >
            {/* --- Selection Checkmark --- */}
            {isSelected && (
                <CheckCircleFilled
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: 20,
                        color: '#1677ff',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                    }}
                />
            )}
            <Text style={{ fontSize: 16, fontWeight: 600 }} strong>
                {room.roomNumber}
            </Text>
            {/* --- User Icon --- */}
            <div
                style={{
                    width: '100%',
                    height: 70,
                    borderRadius: 8,
                    backgroundColor: isAvailable ? '#f6ffed' : '#fff1f0',
                    border: isAvailable ? '1px solid #b7eb8f' : '1px solid #ffa39e',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                }}
            >
                <UserOutlined style={{ fontSize: 32, color: isAvailable ? '#52c41a' : '#f5222d' }} />
            </div>

            {/* --- Room Details --- */}

            <div style={{ marginTop: 4 }}>
                <Text type="secondary">฿{room.price.toLocaleString()}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
                <Tag color={isAvailable ? 'success' : 'error'}>
                    {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                </Tag>
            </div>
        </Card>
    );
};

export default RoomCard;