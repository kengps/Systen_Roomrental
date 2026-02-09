import { CopyOutlined, EnvironmentOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Image, List, message, Space, Typography } from 'antd';
import { listDataInformations } from '../../../service/api/tenants/informations.api';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';

const { Title, Text } = Typography;

// --- Component ---
const ApartmentInformations = () => {

    const { user } = persistMiddleware()
    const accountId = user?.userPayLoad?.user?.id

    // ไม่ได้ใช้ useQuery ในตัวอย่างนี้ แต่แสดงให้เห็นว่าสามารถนำไปปรับใช้ได้
    const { data, isLoading, isError } = useQuery({
        queryKey: ['listInformations'],
        queryFn: () => listDataInformations(accountId),
        enabled: !!accountId
    });

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading data</p>;

    // // ใช้ข้อมูล Mock โดยตรงเพื่อการแสดงผล
    const { apartment, bank } = data?.data?.informations;

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
        <div style={{
            background: '#f0f2f5',
            padding: window.innerWidth <= 768 ? '8px' : '24px', // responsive padding
            minHeight: '100vh',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <Card
                style={{
                    maxWidth: window.innerWidth <= 768 ? '100%' : '800px', // responsive max width
                    width: '100%',
                    margin: '0 auto',
                    padding: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    boxSizing: 'border-box'
                }}
                styles={{ body: { padding: 0 } }}
            >
                <Image
                    width="100%"
                    src={`/icons/apartments/detail-header.jpg`}
                    preview={false}
                    alt="Apartment Banner"
                    style={{
                        height: 'auto',
                        maxHeight: '200px', // จำกัดความสูงสำหรับมือถือ
                        objectFit: 'cover'
                    }}
                />

                <div style={{
                    padding: window.innerWidth <= 768 ? '12px' : '24px', // responsive padding
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <Title
                        level={3}
                        style={{
                            textAlign: 'center',
                            marginTop: 0,
                            fontSize: window.innerWidth <= 768 ? '18px' : '24px', // responsive font size
                            lineHeight: 1.4,
                            marginBottom: window.innerWidth <= 768 ? '12px' : '16px',
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                        }}
                    >
                        {apartment.apartmentName} (ห้อง 101)
                    </Title>

                    <Space
                        direction="vertical"
                        style={{
                            width: '100%',
                            marginBottom: window.innerWidth <= 768 ? '16px' : '24px'
                        }}
                        size="small"
                    >
                        <div style={{
                            fontSize: window.innerWidth <= 768 ? '13px' : '14px', // responsive font size
                            lineHeight: 1.5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            width: '100%'
                        }}>
                            <EnvironmentOutlined style={{
                                marginRight: window.innerWidth <= 768 ? 6 : 8,
                                marginTop: 2,
                                flexShrink: 0,
                                fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                            }} />
                            <span style={{
                                flex: 1,
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                hyphens: 'auto',
                                overflowWrap: 'break-word'
                            }}>
                                {apartment.addressLine}
                            </span>
                        </div>

                        {apartment?.phones && apartment?.phones.length > 0 ? (
                            <div style={{
                                fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                                lineHeight: 1.5,
                                width: '100%'
                            }}>
                                {apartment.phones
                                    .filter((item) => item.number)
                                    .map((item, index, arr) => {
                                        let label = null;

                                        if (item.type === "mobile") {
                                            label = <PhoneOutlined style={{
                                                marginRight: 4,
                                                fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                                            }} />;
                                        } else if (item.type === "office") {
                                            label = <HomeOutlined style={{
                                                marginRight: 4,
                                                fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                                            }} />;
                                        } else if (item.type === "fax") {
                                            label = <span style={{
                                                marginRight: 4,
                                                fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                                            }}>โทร.แฟกซ์</span>;
                                        }

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: index < arr.length - 1 ? '4px' : 0,
                                                    width: '100%'
                                                }}
                                            >
                                                {label}
                                                <span style={{
                                                    wordBreak: 'break-all',
                                                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                                                }}>
                                                    {item.number}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <Text type="secondary" style={{
                                fontSize: window.innerWidth <= 768 ? "11px" : "12px"
                            }}>
                                ไม่มีเบอร์โทร
                            </Text>
                        )}
                    </Space>
                </div>

                <div style={{
                    padding: window.innerWidth <= 768 ? '0 12px 12px 12px' : '0 24px 24px 24px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <Card
                        type="inner"
                        title={
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    fontSize: window.innerWidth <= 768 ? '15px' : '18px'
                                }}
                            >
                                บัญชีธนาคารหอพัก
                            </Title>
                        }
                        styles={{
                            body: {
                                padding: window.innerWidth <= 768 ? '8px' : '16px',
                                width: '100%',
                                boxSizing: 'border-box'
                            }
                        }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={bank}
                            split={false}
                            style={{ width: '100%' }}
                            renderItem={(item) => {
                                const isMobile = window.innerWidth <= 768;

                                if (isMobile) {
                                    // Mobile Layout
                                    return (
                                        <List.Item
                                            style={{
                                                padding: '8px 0',
                                                display: 'block',
                                                width: '100%'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                marginBottom: '8px',
                                                width: '100%'
                                            }}>
                                                <Avatar
                                                    src={`/icons/banks/${item.bankKey.toUpperCase()}.png`}
                                                    shape="square"
                                                    size={36}
                                                    style={{ flexShrink: 0 }}
                                                />
                                                <div style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: 'bold',
                                                        wordBreak: 'break-all',
                                                        lineHeight: 1.3,
                                                        marginBottom: '2px'
                                                    }}>
                                                        {item.accountNumber}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#666',
                                                        lineHeight: 1.3,
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        ชื่อบัญชี: {item.accountName}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                icon={<CopyOutlined />}
                                                onClick={() => handleCopy(item.accountNumber)}
                                                size="small"
                                                style={{
                                                    fontSize: '11px',
                                                    height: '28px',
                                                    width: '100%'
                                                }}
                                            >
                                                คัดลอกเลขที่บัญชี
                                            </Button>
                                        </List.Item>
                                    );
                                } else {
                                    // Desktop Layout
                                    return (
                                        <List.Item
                                            style={{
                                                padding: '12px 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                            actions={[
                                                <Button
                                                    key="copy"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => handleCopy(item.accountNumber)}
                                                    size="small"
                                                    style={{
                                                        fontSize: '12px',
                                                        minWidth: '80px'
                                                    }}
                                                >
                                                    Copy
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        src={`/icons/banks/${item.bankKey.toUpperCase()}.png`}
                                                        shape="square"
                                                        size={48}
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                }
                                                title={
                                                    <Text
                                                        strong
                                                        style={{
                                                            fontSize: '16px',
                                                            wordBreak: 'break-all',
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        {item.accountNumber}
                                                    </Text>
                                                }
                                                description={
                                                    <Text style={{
                                                        fontSize: '14px',
                                                        color: '#666',
                                                        lineHeight: 1.3,
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        ชื่อบัญชี: {item.accountName}
                                                    </Text>
                                                }
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0
                                                }}
                                            />
                                        </List.Item>
                                    );
                                }
                            }}
                        />
                    </Card>
                </div>
            </Card>
        </div>
    );
};

export default ApartmentInformations;