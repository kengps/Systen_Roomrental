import React, { useState, useEffect } from 'react';
import { Avatar, Button, Typography, Popover, notification as antdNotification } from 'antd';
import {
    UserOutlined,
    EllipsisOutlined,
    CheckOutlined
} from '@ant-design/icons';


import notificationService from '../../../../service/webSocker/NotificationService';
import notificationAPI from '../../../../service/webSocker/NotificationAPI';
import persistMiddleware from '../../../../service/zustand/middleware/persistMiddleware';
import { useNavigate } from 'react-router-dom';


const NotificationPopover = ({
    children,
    onNotificationClick,
    placement = "bottomRight"
}) => {
    const [notifications, setNotifications] = useState([]);
    console.log(`⩇⩇:⩇⩇🚨 ~ notifications :`, notifications);

    const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง

    const [unreadCount, setUnreadCount] = useState(0);

    const [popoverVisible, setPopoverVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
    const [loading, setLoading] = useState(false);

    const { user } = persistMiddleware()


    const userId = user?.userPayLoad?.user?.id


    // Initialize WebSocket and load notifications
    // useEffect(() => {
    //     initializeNotifications();
    //     notificationService.connect(userId);

    //     return () => {
    //         // Cleanup listeners when component unmounts
    //         notificationService.off('notifications', handleNewNotification);
    //     };
    // }, [userId]);


    useEffect(() => {
        if (userId) {
            initializeNotifications();
            notificationService.connect(userId); // ← ส่ง userId เข้าไป

            // Listen for authentication events
            const unsubAuth = notificationService.on('authenticated', (userData) => {
                console.log('User authenticated:', userData.userId);
            });

            const unsubAuthFail = notificationService.on('authentication_failed', (error) => {
                console.error('Auth failed:', error);
                // อาจจะ redirect ไป login
            });

            // ตั้งค่าเสียง
            notificationService.setVolume(0.7); // ระดับเสียง 70%
            notificationService.setSoundEnabled(true); // เปิดเสียง

            return () => {
                unsubAuth();
                unsubAuthFail();
                notificationService.off('notifications', handleNewNotification);
            };
        }
    }, [userId]);

    const initializeNotifications = async () => {
        // Initialize WebSocket service
        notificationService.initialize();
        notificationService.connect();

        // Listen for new notifications
        notificationService.on('notifications', handleNewNotification);

        // Load initial notifications
        await loadNotifications();
    };

    const handleNewNotification = (newNotification) => {

        // Add to notifications list
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        antdNotification.info({
            message: newNotification?.message?.title,
            description: newNotification?.message?.body,
            placement: 'topRight',
            duration: 4.5,
        });
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationAPI.loadNotifications();

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            antdNotification.error({
                message: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดการแจ้งเตือนได้',
            });
        } finally {
            setLoading(false);
        }
    };


    // แก้ไข markAsRead ใน NotificationPopover
    const markAsRead = async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    (notif.id === notificationId || notif._id === notificationId)
                        ? { ...notif, isRead: true }
                        : notif
                )
            );

            setUnreadCount(prev => {
                const newCount = Math.max(0, prev - 1);

                // 🔥 ใช้ setTimeout เพื่อ defer event dispatch
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('notificationRead', {
                        detail: { newCount }
                    }));
                }, 0);

                return newCount;
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );

            setUnreadCount(0);

            // 🔥 ใช้ setTimeout เพื่อ defer event dispatch
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('notificationRead', {
                    detail: { newCount: 0 }
                }));
            }, 0);

            antdNotification.success({
                message: 'อ่านทั้งหมดแล้ว',
                description: 'ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว',
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            antdNotification.error({
                message: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้',
            });
        }
    };
    const handleNotificationClick = (notification) => {
        console.log(`⩇⩇:⩇⩇🚨 ~ notification :`, notification);



        // Mark as read
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Call parent callback
        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        // Navigate to action URL if exists
        if (notification.message.actionUrl) {
            navigate(`${notification.message.actionUrl}`)

        }

        // Close popover
        setPopoverVisible(false);
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            'like': '👍',
            'comment': '💬',
            'share': '🔄',
            'friend_request': '👥',
            'birthday': '🎂',
            'event': '📅',
            'payment': '💰',
            'rent': '🏠',
            'maintenance': '🔧',
            'system': '⚙️',
            'default': '🔔'
        };
        return iconMap[type] || iconMap.default;
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} วินาทีที่แล้ว`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} นาทีที่แล้ว`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ชั่วโมงที่แล้ว`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} วันที่แล้ว`;
        }
    };

    // Filter notifications based on active tab
    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;
    console.log(`⩇⩇:⩇⩇🚨 ~ filteredNotifications :`, filteredNotifications);







    // Notification Popover Content
    const notificationContent = (
        <div style={{ width: 360, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px 12px 20px',
                borderBottom: '1px solid #e4e6ea'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <Typography.Title level={4} style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                        การแจ้งเตือน
                    </Typography.Title>
                    <Button
                        type="text"
                        icon={<EllipsisOutlined style={{ fontSize: '20px' }} />}
                        style={{ padding: '4px 8px' }}
                    />
                </div>

                {/* Tab-like buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type={activeTab === 'all' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setActiveTab('all')}
                        style={{
                            borderRadius: '16px',
                            backgroundColor: activeTab === 'all' ? '#1877f2' : '#f0f2f5',
                            border: 'none',
                            color: activeTab === 'all' ? '#fff' : '#65676b',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        ทั้งหมด
                    </Button>
                    <Button
                        type={activeTab === 'unread' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setActiveTab('unread')}
                        style={{
                            borderRadius: '16px',
                            backgroundColor: activeTab === 'unread' ? '#1877f2' : '#f0f2f5',
                            border: 'none',
                            color: activeTab === 'unread' ? '#fff' : '#65676b',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        ยังไม่ได้อ่าน ({unreadCount})
                    </Button>
                </div>
            </div>

            {/* New notifications indicator */}
            {unreadCount > 0 && activeTab === 'all' && (
                <div style={{
                    padding: '8px 20px',
                    backgroundColor: '#e3f2fd',
                    borderBottom: '1px solid #e4e6ea',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1565c0'
                }}>
                    ใหม่
                </div>
            )}

            {/* Notifications List */}
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                flex: 1
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#65676b'
                    }}>
                        กำลังโหลด...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#65676b'
                    }}>
                        {activeTab === 'unread' ? 'ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน' : 'ไม่มีการแจ้งเตือน'}
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <div
                            key={notification._id || index}
                            style={{
                                display: 'flex',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: notification.isRead ? '#ffffff' : '#e7f3ff',
                                borderBottom: index < filteredNotifications.length - 1 ? '1px solid #f0f2f5' : 'none',
                                position: 'relative',
                                transition: 'background-color 0.2s ease'
                            }}
                            onClick={() => handleNotificationClick(notification)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = notification.isRead ? '#f0f2f5' : '#d4edda';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = notification.isRead ? '#ffffff' : '#e7f3ff';
                            }}
                        >
                            {/* Avatar with icon overlay */}
                            <div style={{ position: 'relative', marginRight: '12px' }}>
                                <Avatar
                                    size={56}
                                    src={notification.senderAvatar}
                                    style={{
                                        backgroundColor: notification.senderAvatar ? 'transparent' : '#1877f2'
                                    }}
                                >
                                    {!notification.senderAvatar && <UserOutlined />}
                                </Avatar>

                                {/* Notification type icon */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#1877f2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    border: '2px solid white'
                                }}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px',
                                    lineHeight: '18px',
                                    color: '#050505',
                                    marginBottom: '2px',
                                    fontWeight: notification.read ? 'normal' : '600'
                                }}>
                                    <span style={{ fontWeight: '600' }}>
                                        {/* {notification.senderName || 'ระบบ'} */}
                                        {notification.message.title}
                                    </span>{' '}
                                </div>

                                {notification.message.body && (
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#65676b',
                                        marginBottom: '4px',
                                        lineHeight: '16px'
                                    }}>
                                        {notification.message.body}
                                    </div>
                                )}

                                <div style={{
                                    fontSize: '12px',
                                    color: '#1877f2',
                                    fontWeight: '600'
                                }}>
                                    {getTimeAgo(notification.createdAt)}
                                </div>

                                {/* Action buttons for some notifications */}
                                {/* {notification.type === "bill_generated" && !notification.isRead && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                        <Button
                                            size="small"
                                            type="primary"
                                            style={{
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                height: '32px',
                                                width: '100px',
                                                backgroundColor: '#1877f2'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            ยืนยัน
                                        </Button>
                                        <Button
                                            size="small"
                                            style={{
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                height: '32px',
                                                backgroundColor: '#e4e6ea',
                                                border: 'none',
                                                color: '#050505',
                                                width: '100px'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            ลบ
                                        </Button>
                                    </div>
                                )} */}
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#1877f2',
                                    borderRadius: '50%',
                                    marginLeft: '8px',
                                    alignSelf: 'center'
                                }} />
                            )}

                            {/* Menu button */}
                            <Button
                                type="text"
                                icon={<EllipsisOutlined />}
                                size="small"
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    opacity: 0.7
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle menu action
                                }}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #e4e6ea',
                    backgroundColor: '#ffffff'
                }}>
                    <Button
                        type="text"
                        onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                        }}
                        style={{
                            width: '100%',
                            color: '#1877f2',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                        disabled={unreadCount === 0}
                    >
                        <CheckOutlined style={{ marginRight: '8px' }} />
                        ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>
                {`
          .notification-popover .ant-popover-inner {
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            border: 1px solid #e4e6ea;
          }
          .notification-popover .ant-popover-inner-content {
            padding: 0;
          }
          .notification-popover .ant-popover-arrow {
            display: none;
          }
        `}
            </style>
            <Popover
                content={notificationContent}
                title={null}
                trigger="click"
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
                placement={placement}
                overlayStyle={{
                    paddingTop: '8px'
                }}
                overlayClassName="notification-popover"
            >
                {children}
            </Popover>
        </>
    );
};

// Export unread count for external use
// แก้ไข useNotificationCount hook
export const useNotificationCount = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const loadCount = async () => {
            try {
                const data = await notificationAPI.loadNotifications();
                setUnreadCount(data.unreadCount);
            } catch (error) {
                console.error('Failed to load notification count:', error);
            }
        };

        loadCount();

        // Listen for new notifications
        const unsubscribe = notificationService.on('notifications', () => {
            setUnreadCount(prev => prev + 1);
        });

        // 🔥 Listen for read events with proper cleanup
        const handleNotificationRead = (event) => {
            // ใช้ functional update เพื่อป้องกัน race condition
            setUnreadCount(event.detail.newCount);
        };

        window.addEventListener('notificationRead', handleNotificationRead);

        return () => {
            if (unsubscribe) unsubscribe();
            window.removeEventListener('notificationRead', handleNotificationRead);
        };
    }, []);

    return unreadCount;
};


export default NotificationPopover;