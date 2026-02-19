import { LogoutOutlined, MailOutlined, UploadOutlined, UserOutlined, BankOutlined, SettingOutlined } from '@ant-design/icons';
import { School } from 'lucide-react';

export const menuItems = [
    {
        key: '1',
        label: 'ห้องพัก',
        type: 'group',
        children: [
            {
                key: 'sub1',
                label: 'จัดการห้องพัก',
                icon: <SettingOutlined />,
                children: [
                    { key: 'r1', label: 'เพิ่มห้องพัก', path: '/admin/dashboard/addroom' },
                    { key: 'r2', label: 'ห้องพัก', path: '/admin/dashboard/listroom' },
                    { key: 'r3', label: 'เพิ่มผู้เช่า', path: '/admin/dashboard/tenantManagement' },
                    // { key: 'r4', label: 'stepper', path: '/admin/dashboard/stepper' },
                    // { key: '13', label: 'MainPage', path: '/admin/dashboard/create' },
                    // { key: '14', label: 'Option 4', path: '/admin/dashboard/option4' },
                ],
            },
        ],
    },
    {
        key: '2',
        label: 'ตั้งค่า',
        type: 'group',
        children: [
            {
                key: 'sub2',
                label: 'ตั้งค่า',
                icon: <UserOutlined />,
                children: [
                    { key: 'g1', label: 'เพิ่มผู้ใช้งาน', path: '/setting/addUser' },
                    { key: 'g2', label: 'จัดการผู้ใช้งาน', path: '/setting/manageUser' },
                    { key: 'g3', label: 'ค่าน้ำ-ค่าไฟปัจจุบัน', path: '/setting/unitMeter' },
                    { key: 'g4', label: 'สัญญาเช่า', path: '/setting/leaseAgreement/' },
                    { key: 'g5', label: 'ตั้งค่าการคิดค่าเช่า', path: '/setting/rent' },
                    { key: 'g6', label: 'ตั้งค่าการคิดค่าน้ำ-ค่าไฟ', path: '/setting/meters' },
                    { key: 'g7', label: 'ตั้งค่าการคิดค่าบริการ', path: '/setting/services' },
                    { key: 'g8', label: 'ตั้งค่าการคิดค่าเช่า', path: '/setting/rent' },
                    { key: 'g9', label: 'ตั้งค่าการคิดค่าน้ำ-ค่าไฟ', path: '/setting/meters' },
                    { key: 'g10', label: 'ตั้งค่าการคิดค่าบริการ', path: '/setting/services' },
                    { key: 'g11', label: 'ตั้งค่าการคิดค่าเช่า', path: '/setting/rent' },
                ],
            },
        ],
    }, {
        key: '3',
        label: 'ระบบ',
        type: 'group',
        children: [
            {
                key: 'sub3',
                label: 'system',
                icon: <MailOutlined />,
                children: [
                    { key: 's1', label: 'log', path: '/system/log' },
                    { key: 's2', label: 'HomePage', path: '/admin/dashboard/home' },
                    { key: 's3', label: 'MainPage', path: '/admin/dashboard/mainpage' },
                    { key: 's4', label: 'Option 4', path: '/admin/dashboard/option4' },
                ],
            },

        ],
    },
    {
        key: '4',
        label: 'หอพัก',
        type: 'group',
        children: [
            {
                key: 'sub4',
                label: 'rental',
                icon: <MailOutlined />,
                children: [
                    { key: 'b1', label: 'ตั้งค่าหอพัก', path: '/apartment/setting' },
                    { key: 'b2', label: 'บัญชี', path: '/apartment/bank' },
                    { key: 'b7', label: 'บอท', path: '/apartment/botTelegram' },
                    { key: 'b3', label: 'ค่าน้ำ-ค่าไฟ', path: '/apartment/meters' },
                    { key: 'b4', label: 'ค่าบริการ', path: '/apartment/sevices' },
                    { key: 'b5', label: 'แจ้งชำระ', path: '/apartment/billing' },
                    { key: 'b6', label: 'ออกบิล', path: '/apartment/payment' },

                ],
            },
        ],
    },
];



export const menuItemsUser = [
    { key: 'info', label: 'ข้อมูลหอพัก', path: '/member/payments/apartmentInformations' },
    {
        key: 'payments',
        // icon: 'DollarSign',
        label: 'การชำระเงิน',
        children: [
            { key: 'history', label: 'ประวัติการชำระเงิน', path: '/member/payments/history' },
            { key: 'bill', label: 'ชำระค่าเช่า', path: '/member/listbills/bills' },
            // { key: 'info', label: 'ข้อมูลหอพัก', path: '/member/payments/apartmentInformations' }
        ]
    },
    {
        key: '3',
        label: 'ระบบ',
        type: 'group',
        children: [
            {
                key: 'sub3',
                label: 'system',
                icon: <MailOutlined />,
                children: [
                    { key: '31', label: 'Table', path: '/system/table/v2' },
                    { key: '32', label: 'HomePage', path: '/admin/dashboard/home' },
                    { key: '33', label: 'MainPage', path: '/admin/dashboard/mainpage' },
                    { key: '34', label: 'Option 4', path: '/admin/dashboard/option4' },
                ],
            },
        ],
    },
    {
        key: 'announcements',
        icon: 'Bell',
        label: 'ข่าวสาร',
        path: '/member/announcements'
    },
    { key: 'profile', icon: 'User', label: 'โปรไฟล์', path: '/member/profile' },
    // { key: 'logout', icon: 'LogOut', label: 'ออกจากระบบ' }
];


