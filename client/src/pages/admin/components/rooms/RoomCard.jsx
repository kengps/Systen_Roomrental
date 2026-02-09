import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography } from 'antd';
import { CheckCircleFilled, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RoomCard = ({ room, isSelected, onSelect }) => {
    const isAvailable = room.status === 'available';
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamic styles based on screen size
    const cardStyle = {
        width: isMobile ? '100%' : isTablet ? '140px' : '120px',
        minWidth: isMobile ? 'auto' : isTablet ? '140px' : '120px',
        maxWidth: isMobile ? '100%' : isTablet ? '160px' : '140px',
        position: 'relative',
        border: isSelected 
            ? '2px solid #1677ff' 
            : isAvailable 
                ? '1px solid #b7eb8f' 
                : '1px solid #ffa39e',
        borderRadius: isMobile ? '16px' : '12px',
        background: isSelected 
            ? 'linear-gradient(135deg, #e6f4ff 0%, #bae7ff 100%)'
            : isAvailable 
                ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
                : 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
        boxShadow: isSelected 
            ? '0 8px 24px rgba(22, 119, 255, 0.4)' 
            : isAvailable
                ? '0 4px 12px rgba(82, 196, 26, 0.2)'
                : '0 4px 12px rgba(245, 34, 45, 0.2)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        // Ensure border is always visible
        borderStyle: 'solid',
        borderWidth: isSelected ? '2px' : '1px',
        borderColor: isSelected 
            ? '#1677ff' 
            : isAvailable 
                ? '#b7eb8f' 
                : '#ffa39e',
        // Add hover animation properties
        '&:hover': {
            transform: 'translateY(-6px) scale(1.05)',
            boxShadow: isSelected 
                ? '0 16px 40px rgba(22, 119, 255, 0.6)' 
                : isAvailable
                    ? '0 12px 28px rgba(82, 196, 26, 0.4)'
                    : '0 12px 28px rgba(245, 34, 45, 0.4)'
        }
    };

    const bodyStyle = {
        padding: isMobile ? '16px' : '12px',
        textAlign: 'center'
    };

    const iconContainerStyle = {
        width: '100%',
        height: isMobile ? '60px' : '50px',
        borderRadius: isMobile ? '12px' : '10px',
        background: isAvailable 
            ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
            : 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
        border: isAvailable ? '1px solid #b7eb8f' : '1px solid #ffa39e',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isAvailable 
            ? '0 2px 8px rgba(82, 196, 26, 0.2)'
            : '0 2px 8px rgba(245, 34, 45, 0.2)',
        transform: 'scale(1)'
    };

    const iconSize = isMobile ? 28 : 24;
    const fontSize = isMobile ? '18px' : '16px';
    const tagSize = isMobile ? '14px' : '12px';

    return (
        <Card
            hoverable
            onClick={onSelect}
            style={cardStyle}
            styles={{
                body: bodyStyle
            }}
            onMouseEnter={(e) => {
                // Card animation
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)';
                e.currentTarget.style.boxShadow = isSelected 
                    ? '0 16px 40px rgba(22, 119, 255, 0.6)' 
                    : isAvailable
                        ? '0 12px 28px rgba(82, 196, 26, 0.4)'
                        : '0 12px 28px rgba(245, 34, 45, 0.4)';
                e.currentTarget.style.borderColor = isSelected 
                    ? '#1890ff' 
                    : isAvailable 
                        ? '#52c41a' 
                        : '#ff4d4f';
                
                // Icon container animation
                const iconContainer = e.currentTarget.querySelector('[data-icon-container]');
                if (iconContainer) {
                    iconContainer.style.transform = 'scale(1.05)';
                    iconContainer.style.boxShadow = isAvailable 
                        ? '0 4px 16px rgba(82, 196, 26, 0.3)'
                        : '0 4px 16px rgba(245, 34, 45, 0.3)';
                }
                
                // Tag animation
                const tag = e.currentTarget.querySelector('.ant-tag');
                if (tag) {
                    tag.style.transform = 'scale(1.1)';
                    tag.style.boxShadow = isAvailable 
                        ? '0 4px 12px rgba(82, 196, 26, 0.4)'
                        : '0 4px 12px rgba(245, 34, 45, 0.4)';
                }
            }}
            onMouseLeave={(e) => {
                // Card animation
                e.currentTarget.style.transform = isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = isSelected 
                    ? '0 8px 24px rgba(22, 119, 255, 0.4)' 
                    : isAvailable
                        ? '0 4px 12px rgba(82, 196, 26, 0.2)'
                        : '0 4px 12px rgba(245, 34, 45, 0.2)';
                e.currentTarget.style.borderColor = isSelected 
                    ? '#1677ff' 
                    : isAvailable 
                        ? '#b7eb8f' 
                        : '#ffa39e';
                
                // Icon container animation
                const iconContainer = e.currentTarget.querySelector('[data-icon-container]');
                if (iconContainer) {
                    iconContainer.style.transform = 'scale(1)';
                    iconContainer.style.boxShadow = isAvailable 
                        ? '0 2px 8px rgba(82, 196, 26, 0.2)'
                        : '0 2px 8px rgba(245, 34, 45, 0.2)';
                }
                
                // Tag animation
                const tag = e.currentTarget.querySelector('.ant-tag');
                if (tag) {
                    tag.style.transform = 'scale(1)';
                    tag.style.boxShadow = isAvailable 
                        ? '0 2px 4px rgba(82, 196, 26, 0.2)'
                        : '0 2px 4px rgba(245, 34, 45, 0.2)';
                }
            }}
        >
            {/* --- Selection Checkmark --- */}
            {isSelected && (
                <CheckCircleFilled
                    style={{
                        position: 'absolute',
                        top: isMobile ? '12px' : '8px',
                        right: isMobile ? '12px' : '8px',
                        fontSize: isMobile ? '24px' : '20px',
                        color: '#1677ff',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        transform: 'scale(1)'
                    }}
                />
            )}
            
            {/* --- Room Number --- */}
            <div style={{ 
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
            }}>
                <Text style={{ 
                fontSize: fontSize, 
                fontWeight: 600,
                color: '#262626',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
            }} strong>
                {room.roomNumber}
            </Text>
            </div>
            
            {/* --- User Icon --- */}
            <div style={{
                ...iconContainerStyle,
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }} data-icon-container>
                {/* Decorative background pattern */}
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '30px',
                    height: '30px',
                    background: isAvailable ? '#52c41a' : '#f5222d',
                    borderRadius: '50%',
                    opacity: 0.1,
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '-5px',
                    width: '20px',
                    height: '20px',
                    background: isAvailable ? '#52c41a' : '#f5222d',
                    borderRadius: '50%',
                    opacity: 0.1,
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)'
                }} />
                
                <UserOutlined style={{ 
                    fontSize: iconSize, 
                    color: isAvailable ? '#52c41a' : '#f5222d',
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)'
                }} />
            </div>

            {/* --- Room Details --- */}
            <div style={{ 
                marginTop: isMobile ? '8px' : '4px',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
            }}>
                <Text type="secondary" style={{ 
                    fontSize: isMobile ? '16px' : '14px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)'
                }}>
                    ฿{room.price.toLocaleString()}
                </Text>
            </div>
            
            <div style={{ 
                marginTop: isMobile ? '12px' : '8px',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
            }}>
                <Tag 
                    color={isAvailable ? 'success' : 'error'}
                    style={{ 
                        fontSize: tagSize,
                        padding: isMobile ? '6px 12px' : '4px 10px',
                        borderRadius: isMobile ? '8px' : '6px',
                        fontWeight: '600',
                        boxShadow: isAvailable 
                            ? '0 2px 4px rgba(82, 196, 26, 0.2)'
                            : '0 2px 4px rgba(245, 34, 45, 0.2)',
                        border: 'none',
                        background: isAvailable 
                            ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                            : 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        transform: 'scale(1)'
                    }}
                >
                    {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                </Tag>
            </div>
        </Card>
    );
};

export default RoomCard;