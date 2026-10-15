import React, { useState, useEffect } from 'react';
import { Avatar, ConfigProvider, Typography, Popover, notification as antdNotification } from 'antd';
import {
    UserOutlined,
    EllipsisOutlined,
    CheckOutlined,
    BellOutlined,
    LikeOutlined,
    MessageOutlined,
    ShareAltOutlined,
    TeamOutlined,
    GiftOutlined,
    CalendarOutlined,
    DollarOutlined,
    HomeOutlined,
    ToolOutlined,
    SettingOutlined,
} from '@ant-design/icons';


import notificationService from '../../../../service/webSocker/NotificationService';
import notificationAPI from '../../../../service/webSocker/NotificationAPI';
import persistMiddleware from '../../../../service/zustand/middleware/persistMiddleware';
import { useNavigate } from 'react-router-dom';

/* ───────── Design tokens ───────── */
const C = {
    ink: '#0F172A',
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
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.notification-popover { font-family: ${FONT}; }
.notification-popover .ant-popover-inner {
  padding: 0;
  border-radius: 16px;
  border: 1px solid ${C.line};
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10);
  overflow: hidden;
}
.notification-popover .ant-popover-inner-content { padding: 0; }
.notification-popover .ant-popover-arrow { display: none; }

.np-panel {
  width: 380px; max-width: calc(100vw - 32px);
  max-height: 80vh; display: flex; flex-direction: column;
  background: ${C.card}; font-family: ${FONT};
}
.np-head { padding: 16px 20px 14px; border-bottom: 1px solid ${C.line}; }
.np-head-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.np-head-top h4.ant-typography { margin: 0 !important; font-size: 20px !important; font-weight: 700 !important; color: ${C.ink} !important; }

.np-iconbtn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0; flex: none;
  border-radius: 10px; border: 1px solid transparent; background: transparent;
  color: ${C.muted}; font-size: 18px; cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.np-iconbtn:hover { background: ${C.primarySoft}; color: ${C.primarySoftText}; }

.np-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.np-tab {
  height: 32px; padding: 0 14px; border-radius: 999px; cursor: pointer;
  font-family: ${FONT}; font-size: 13px; font-weight: 600;
  background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; color: ${C.primarySoftText};
  transition: background-color .15s ease;
}
.np-tab:hover { background: #E2E6FF; }
.np-tab[aria-pressed="true"] { background: ${C.primary}; border-color: ${C.primary}; color: #fff; }
.np-tab[aria-pressed="true"]:hover { background: ${C.primaryDeep}; }

.np-band {
  padding: 8px 20px; background: ${C.primarySoft};
  border-bottom: 1px solid ${C.primarySoftLine};
  font-size: 13px; font-weight: 600; color: ${C.primarySoftText};
}

.np-list { max-height: 400px; overflow-y: auto; flex: 1; }
.np-state { text-align: center; padding: 40px 20px; color: ${C.muted}; font-size: 14px; }

.np-item { position: relative; border-bottom: 1px solid ${C.line}; background: ${C.card}; }
.np-item:last-child { border-bottom: none; }
.np-item--unread { background: ${C.primarySoft}; }
.np-item:hover { background: ${C.sunken}; }
.np-item--unread:hover { background: #E2E6FF; }

.np-main {
  display: flex; align-items: flex-start; gap: 12px; width: 100%;
  padding: 12px 52px 12px 16px; text-align: left; cursor: pointer;
  background: transparent; border: none; font-family: ${FONT}; color: inherit;
}
.np-main:focus-visible, .np-tab:focus-visible, .np-iconbtn:focus-visible, .np-markall:focus-visible {
  outline: 3px solid ${C.primarySoftLine}; outline-offset: -3px;
}
.np-typebadge {
  position: absolute; bottom: -2px; right: -2px;
  width: 22px; height: 22px; border-radius: 999px;
  background: ${C.primary}; color: #fff; font-size: 11px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}
.np-body { flex: 1; min-width: 0; }
.np-title { font-size: 14px; line-height: 20px; color: ${C.ink}; font-weight: 600; margin-bottom: 2px; }
.np-desc { font-size: 13px; line-height: 18px; color: ${C.muted}; margin-bottom: 4px; }
.np-time { font-size: 12px; color: ${C.primarySoftText}; font-weight: 600; }
.np-dot { width: 10px; height: 10px; border-radius: 999px; background: ${C.primary}; align-self: center; flex: none; }
.np-item .np-menu { position: absolute; top: 8px; right: 8px; }

.np-foot { padding: 12px 20px; border-top: 1px solid ${C.line}; background: ${C.card}; }
.np-markall {
  width: 100%; height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 12px; cursor: pointer; font-family: ${FONT}; font-size: 14px; font-weight: 600;
  background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; color: ${C.primarySoftText};
  transition: background-color .15s ease;
}
.np-markall:hover:not(:disabled) { background: #E2E6FF; }
.np-markall:disabled { opacity: .5; cursor: not-allowed; }
`;


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

    // เดิมเป็น emoji → เปลี่ยนเป็นไอคอน antd (คีย์ type เดิมทั้งหมด)
    const getNotificationIcon = (type) => {
        const iconMap = {
            'like': <LikeOutlined />,
            'comment': <MessageOutlined />,
            'share': <ShareAltOutlined />,
            'friend_request': <TeamOutlined />,
            'birthday': <GiftOutlined />,
            'event': <CalendarOutlined />,
            'payment': <DollarOutlined />,
            'rent': <HomeOutlined />,
            'maintenance': <ToolOutlined />,
            'system': <SettingOutlined />,
            'default': <BellOutlined />
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
        <div className="np-panel">
            {/* Header */}
            <div className="np-head">
                <div className="np-head-top">
                    <Typography.Title level={4}>
                        การแจ้งเตือน
                    </Typography.Title>
                    <button
                        type="button"
                        className="np-iconbtn"
                        aria-label="ตัวเลือกการแจ้งเตือน"
                    >
                        <EllipsisOutlined />
                    </button>
                </div>

                {/* Tab-like buttons */}
                <div className="np-tabs">
                    <button
                        type="button"
                        className="np-tab"
                        aria-pressed={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        type="button"
                        className="np-tab"
                        aria-pressed={activeTab === 'unread'}
                        onClick={() => setActiveTab('unread')}
                    >
                        ยังไม่ได้อ่าน ({unreadCount})
                    </button>
                </div>
            </div>

            {/* New notifications indicator */}
            {unreadCount > 0 && activeTab === 'all' && (
                <div className="np-band">
                    ใหม่
                </div>
            )}

            {/* Notifications List */}
            <div className="np-list">
                {loading ? (
                    <div className="np-state">
                        กำลังโหลด...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="np-state">
                        {activeTab === 'unread' ? 'ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน' : 'ไม่มีการแจ้งเตือน'}
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <div
                            key={notification._id || index}
                            className={`np-item${notification.isRead ? '' : ' np-item--unread'}`}
                        >
                            <button
                                type="button"
                                className="np-main"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {/* Avatar with icon overlay */}
                                <div style={{ position: 'relative', flex: 'none' }}>
                                    <Avatar
                                        size={52}
                                        src={notification.senderAvatar}
                                        style={{
                                            backgroundColor: notification.senderAvatar ? 'transparent' : C.primary
                                        }}
                                    >
                                        {!notification.senderAvatar && <UserOutlined />}
                                    </Avatar>

                                    {/* Notification type icon */}
                                    <div className="np-typebadge" aria-hidden="true">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="np-body">
                                    <div
                                        className="np-title"
                                        style={{ fontWeight: notification.read ? 'normal' : '600' }}
                                    >
                                        <span style={{ fontWeight: '600' }}>
                                            {/* {notification.senderName || 'ระบบ'} */}
                                            {notification.message.title}
                                        </span>{' '}
                                    </div>

                                    {notification.message.body && (
                                        <div className="np-desc">
                                            {notification.message.body}
                                        </div>
                                    )}

                                    <div className="np-time">
                                        {getTimeAgo(notification.createdAt)}
                                    </div>
                                </div>

                                {/* Unread indicator */}
                                {!notification.isRead && (
                                    <span className="np-dot" role="img" aria-label="ยังไม่ได้อ่าน" />
                                )}
                            </button>

                            {/* Menu button (อยู่นอกปุ่มหลัก เพื่อไม่ให้ปุ่มซ้อนปุ่ม) */}
                            <button
                                type="button"
                                className="np-iconbtn np-menu"
                                aria-label="ตัวเลือกเพิ่มเติม"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle menu action
                                }}
                            >
                                <EllipsisOutlined />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
                <div className="np-foot">
                    <button
                        type="button"
                        className="np-markall"
                        onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                        }}
                        disabled={unreadCount === 0}
                    >
                        <CheckOutlined />
                        ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
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
        </ConfigProvider>
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