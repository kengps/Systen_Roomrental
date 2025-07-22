import { CopyOutlined, EnvironmentOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Image, List, message, Space, Typography } from 'antd';
import { listDataInformations } from '../../../service/api/tenants/informations.api';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';

const { Title, Text } = Typography;

// --- Mock Data & Functions ---
// รูปภาพ Banner (คุณสามารถเปลี่ยนเป็น URL รูปภาพของคุณ)

// ฟังก์ชันจำลองการดึงข้อมูลจาก API
// const fetchApartmentData = async () => {
//     // สมมติว่านี่คือข้อมูลที่ได้จาก API ของคุณ
//     const mockData = {
//         informations: [
//             {
//                 bank: {
//                     _id: "687a373f0987281e51aebd58",
//                     bankKey: "kbank",
//                     accountNumber: '123-456789-0', // เปลี่ยนเป็น string เพื่อการแสดงผล
//                     accountName: "นายประเสริฐ เรืองมณี",
//                 },
//                 apartment: {
//                     _id: "686799333b510ba15dd697c2",
//                     addressLine: "19/11, ซอยเสรีไทย 6 ถนนเสรีไทย, แขวงคลองกุ่ม เขตบึงกุ่ม กรุงเทพมหานคร, 10240",
//                     apartmentName: "โน้ตเพลส อพาร์ทเมนท์",
//                     phones: [{ number: "0814022234" }],
//                 },
//             },
//         ],
//     };
//     // เพิ่มข้อมูล Mock สำหรับบัญชีอื่นๆ เพื่อให้เหมือนในรูป
//     const extraAccounts = [
//         {
//             _id: 'promptpay_mock',
//             bankKey: 'promptpay',
//             accountNumber: '081-234-5678',
//             accountName: 'พร้อมเพย์: นายสมชาย ใจดี',
//             branch: 'N/A'
//         },
//         {
//             _id: 'bbl_mock',
//             bankKey: 'bbl',
//             accountNumber: '987-654321-0',
//             accountName: 'นายสมชาย ใจดี',
//             branch: 'สาขา บางกะปิ'
//         }
//     ];

//     const apiData = mockData.informations[0];
//     const allAccounts = [
//         ...extraAccounts,
//         { ...apiData.bank, branch: 'สาขา เสรีไทย' } // เพิ่มข้อมูลสาขาสำหรับ KBank
//     ];

//     return { apartment: apiData.apartment, banks: allAccounts };
// };


// --- Component ---
const ApartmentInformations = () => {

    const { user } = persistMiddleware()
    const accountId = user.userPayLoad.user.id

    // ไม่ได้ใช้ useQuery ในตัวอย่างนี้ แต่แสดงให้เห็นว่าสามารถนำไปปรับใช้ได้
    const { data, isLoading, isError } = useQuery({
        queryKey: ['listInformations'],
        queryFn: () => listDataInformations(accountId),
        enabled: !!accountId
    });



    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading data</p>;

    // // ใช้ข้อมูล Mock โดยตรงเพื่อการแสดงผล


    const { apartment, bank } = data?.data?.informations;;


    const banks = [
        { _id: 'promptpay_mock', bankKey: 'promptpay', accountNumber: '081-234-5678', accountName: 'พร้อมเพย์: นายสมชาย ใจดี', branch: 'N/A' },
        { _id: 'bbl_mock', bankKey: 'bbl', accountNumber: '987-654321-0', accountName: 'นายสมชาย ใจดี', branch: 'สาขา บางกะปิ' },
        { _id: 'kbank_mock', bankKey: 'kbank', accountNumber: '123-456789-0', accountName: 'นายประเสริฐ เรืองมณี', branch: 'สาขา เสรีไทย' },
    ]



    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        message.success(`คัดลอกเลขที่บัญชี: ${text} แล้ว`);
    };

    return (
        <div style={{ background: '#f0f2f5', padding: '24px' }}>
            <Card style={{ maxWidth: '800px', margin: '0 auto', padding: 0 }} bodyStyle={{ padding: 0 }}>
                <Image
                    width="100%"
                    src={`/icons/apartments/detail-header.jpg`}
                    preview={false}
                    alt="Apartment Banner"
                />
                <div style={{ padding: '24px' }}>
                    <Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
                        {apartment.apartmentName} (ห้อง 101)
                    </Title>
                    <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
                        <Text>
                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                            {apartment.addressLine}
                        </Text>


                        {apartment?.phones && apartment?.phones.length > 0 ? (
                            <Text style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {apartment.phones
                                    .filter((item) => item.number)
                                    .map((item, index, arr) => {
                                        let label = null;

                                        if (item.type === "mobile") {
                                            label = <PhoneOutlined style={{ marginRight: 4 }} />;
                                        } else if (item.type === "office") {
                                            label = <HomeOutlined style={{ marginRight: 4 }} />;
                                        } else if (item.type === "fax") {
                                            label = <span style={{ marginRight: 4 }}>โทร.แฟกซ์</span>;
                                        }

                                        return (
                                            <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                {label}
                                                {item.number}
                                                {index < arr.length - 1 && <span style={{ margin: '0 6px' }}>•</span>}
                                            </span>
                                        );
                                    })}
                            </Text>
                        ) : (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                ไม่มีเบอร์โทร
                            </Text>
                        )}

                        {/* <Text>

                            <PhoneOutlined style={{ marginRight: 8 }} />
                            {apartment.phones[0].number}
                        </Text> */}
                        {/* <Text>
                            <MailOutlined style={{ marginRight: 8 }} />
                            contact.noteplace@email.com
                        </Text> */}
                    </Space>
                </div>

                <div style={{ padding: '0 24px 24px 24px' }}>
                    <Card type="inner" title={<Title level={4} style={{ margin: 0 }}>บัญชีธนาคารหอพัก</Title>}>
                        <List
                            itemLayout="horizontal"
                            dataSource={bank}
                            renderItem={(item) => (

                                <List.Item
                                    actions={[
                                        <Button
                                            icon={<CopyOutlined />}
                                            onClick={() => handleCopy(item.accountNumber)}
                                        >
                                            Copy
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={`/icons/banks/${item.bankKey.toUpperCase()}.png`} shape="square" size={48} />}
                                        title={<Text strong style={{ fontSize: '16px' }}>{item.accountNumber}</Text>}
                                        description={`ชื่อบัญชี: ${item.accountName}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            </Card>
        </div>
    );
};

export default ApartmentInformations;