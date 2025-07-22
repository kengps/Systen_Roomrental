import { LogoutOutlined, MailOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';


export const menuItems = [
    {
        key: '1',
        label: 'ห้องพัก',
        type: 'group',
        children: [
            {
                key: 'sub1',
                label: 'จัดการห้องพัก',
                icon: <UploadOutlined />,
                children: [
                    { key: '11', label: 'เพิ่มห้องพัก', path: '/admin/dashboard/addroom' },
                    { key: '12', label: 'ห้องพัก', path: '/admin/dashboard/listroom' },
                    { key: '13', label: 'เพิ่มผู้เช่า', path: '/admin/dashboard/tenantManagement' },
                    { key: '14', label: 'stepper', path: '/admin/dashboard/stepper' },
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
                label: 'Setting',
                icon: <UserOutlined />,
                children: [
                    { key: '21', label: 'Table', path: '/setting/table/v3' },
                    { key: '22', label: 'HomePage', path: '/setting/home' },
                    { key: '23', label: 'MainPage', path: '/setting/mainpage' },
                    { key: '24', label: 'Option 4', path: '/setting/option4' },
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
                    { key: '31', label: 'Table', path: '/system/table/v2' },
                    { key: '32', label: 'HomePage', path: '/admin/dashboard/home' },
                    { key: '33', label: 'MainPage', path: '/admin/dashboard/mainpage' },
                    { key: '34', label: 'Option 4', path: '/admin/dashboard/option4' },
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
                    { key: '41', label: 'ตั้งค่าหอพัก', path: '/apartment/setting' },
                    { key: '42', label: 'บัญชี', path: '/apartment/bank' },
                    { key: '43', label: 'ค่าน้ำ-ค่าไฟ', path: '/apartment/meters' },
                    { key: '44', label: 'ค่าบริการ', path: '/apartment/sevices' },
                    { key: '45', label: 'แจ้งชำระ', path: '/apartment/billing' },
                    { key: '46', label: 'ออกบิล', path: '/apartment/payment' },

                ],
            },
            {
                key: 'logout',
                label: 'ออกจากระบบ',
                icon: <LogoutOutlined />,

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
            { key: 'bill', label: 'ชำระค่าเช่า', path: '/member/payments/bill' },
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
            {
                key: 'logout',
                label: 'ออกจากระบบ',
                icon: <LogoutOutlined />,

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


