import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography } from 'antd';
import { CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import './RoomCard.css';

const { Text } = Typography;

const RoomCard = ({ room, isSelected, onSelect }) => {
    const isAvailable = room.status === 'available';
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Card
            hoverable
            onClick={onSelect}
            className={`room-card ${isSelected ? 'room-card--selected' : ''}`}
            styles={{ body: { padding: isMobile ? '16px 12px' : '12px', textAlign: 'center' } }}
        >
            {isSelected && (
                <CheckCircleFilled className="room-card-checkmark" />
            )}

            <Text className="room-card-number" strong>
                {room.roomNumber}
            </Text>

            <div className="room-card-icon-wrap">
                <UserOutlined className="room-card-icon" />
            </div>

            <div className="room-card-details">
                <Text className="room-card-price">
                    <span className="room-card-price-text">฿</span>{room.price.toLocaleString()}
                </Text>

                <Tag className={`room-card-status ${
                    isAvailable ? 'room-card-status-available' : 'room-card-status-occupied'
                }`}>
                    <span className="room-card-status-text">
                        {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                    </span>
                </Tag>
            </div>
        </Card>
    );
};

export default RoomCard;
