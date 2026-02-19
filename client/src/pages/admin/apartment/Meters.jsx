import Icon, {
    CalculatorOutlined,
    SaveOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {useQuery} from '@tanstack/react-query';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    message,
    Row,
    Segmented,
    Space,
    Spin,
    Typography,
} from 'antd';
import {useState, useEffect} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {addMeters, getMeters} from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';
import PageHeader from '../../../components/common/PageHeader';

const {Title, Text, Paragraph} = Typography;

const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em">
        <path
            d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z"/>
    </svg>
);
const WaterDropIcon = props => <Icon component={WaterDropSvg} {...props} />;

const CalculationExample = ({utilityType, billingType, rate, flatRate}) => {
    const isElectric = utilityType === 'electric';
    const icon = isElectric ? <ThunderboltOutlined style={{color: '#fadb14'}}/> :
        <WaterDropIcon style={{color: '#1890ff'}}/>;
    const unitName = isElectric ? 'หน่วย' : 'ยูนิต';
    const utilityName = isElectric ? 'ค่าไฟ' : 'ค่าน้ำ';

    if (billingType === 'flatRate') {
        return (
            <Card style={{
                backgroundColor: '#f5f5f5',
                marginTop: '16px',
                borderRadius: '8px',
                border: '1px solid #e8e8e8'
            }}>
                <Title
                    level={5}
                    style={{
                        textAlign: 'center',
                        marginBottom: '16px',
                        fontSize: 'clamp(14px, 2.5vw, 18px)'
                    }}
                >
                    ตัวอย่าง: การคิดค่าบริการแบบเหมาจ่าย
                </Title>
                <Row gutter={[8, 16]} justify="center">
                    <Col xs={24} sm={12} md={12}>
                        <div style={{
                            textAlign: 'center',
                            padding: 'clamp(8px, 2vw, 16px)',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #f0f0f0'
                        }}>
                            <div style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                marginBottom: '0.5rem'
                            }}>
                                {icon}
                            </div>
                            <Text style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                ห้อง 101 ใช้ไป 5 {unitName}
                            </Text><br/>
                            <Text strong style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                คิดเป็น{utilityName}ที่ต้องจ่าย{' '}
                                <span style={{
                                    fontSize: 'clamp(14px, 3vw, 18px)',
                                    color: '#1890ff'
                                }}>
                                    ฿{flatRate || 0}
                                </span>
                            </Text>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <div style={{
                            textAlign: 'center',
                            padding: 'clamp(8px, 2vw, 16px)',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #f0f0f0'
                        }}>
                            <div style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                marginBottom: '0.5rem'
                            }}>
                                {icon}
                            </div>
                            <Text style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                ห้อง 202 ใช้ไป 20 {unitName}
                            </Text><br/>
                            <Text strong style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                คิดเป็น{utilityName}ที่ต้องจ่าย{' '}
                                <span style={{
                                    fontSize: 'clamp(14px, 3vw, 18px)',
                                    color: '#1890ff'
                                }}>
                                    ฿{flatRate || 0}
                                </span>
                            </Text>
                        </div>
                    </Col>
                </Row>
                <Divider style={{margin: '12px 0'}}/>
                <Paragraph
                    strong
                    style={{
                        textAlign: 'center',
                        color: '#fa8c16',
                        marginBottom: 0,
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        padding: '0 8px'
                    }}
                >
                    ** ไม่ว่าจะใช้น้อยหรือใช้มาก ก็จะคิดค่าบริการในราคาเดียว **
                </Paragraph>
            </Card>
        );
    }

    return (
        <Card style={{
            backgroundColor: '#f5f5f5',
            marginTop: '16px',
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
        }}>
            <Title
                level={5}
                style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                    fontSize: 'clamp(14px, 2.5vw, 18px)'
                }}
            >
                ตัวอย่าง: การคิดค่าบริการตามการใช้งานจริง
            </Title>
            <div style={{textAlign: 'center', padding: '0 8px'}}>
                <div style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    marginBottom: '0.5rem'
                }}>
                    {icon}
                </div>
                <Paragraph style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                    สมมติว่าห้อง 101 มีมิเตอร์ก่อนหน้า <b style={{color: '#1890ff'}}>1000</b> และมิเตอร์ล่าสุด <b
                    style={{color: '#1890ff'}}>1025</b>
                </Paragraph>
                <Paragraph style={{
                    fontSize: 'clamp(12px, 2.2vw, 16px)',
                    backgroundColor: 'white',
                    padding: 'clamp(8px, 2vw, 12px)',
                    borderRadius: '6px',
                    width: '100%',
                    maxWidth: '450px',
                    margin: '0 auto',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'left',
                    border: '1px solid #f0f0f0'
                }}>
                    จำนวนที่ใช้: 1025 - 1000 = <b style={{color: '#52c41a'}}>25 {unitName}</b><br/>
                    อัตราค่าบริการ: <b style={{color: '#722ed1'}}>฿{rate || 0} / {unitName}</b><br/>
                    <Divider style={{margin: '8px 0'}}/>
                    <span style={{
                        fontWeight: 'bold',
                        fontSize: 'clamp(14px, 2.8vw, 20px)'
                    }}>
                        รวมค่าบริการ: 25 * {rate || 0} = <span
                        style={{color: '#f5222d'}}>฿{(25 * (rate || 0)).toLocaleString()}</span>
                    </span>
                </Paragraph>
            </div>
        </Card>
    );
};

export default function MetersPages() {
    const [activeUtility, setActiveUtility] = useState('electric');
    const {user, apartMentData, GetDataApartment} = persistMiddleware();
    const accountId = user?.userPayLoad?.user?.id

    // แยก form สำหรับแต่ละ utility - ไม่มี electric.billingType หรือ water.billingType
    const {control, handleSubmit, reset, watch} = useForm({
        defaultValues: {
            billingType: 'perUnit',
            rate: 0,
            flatRate: 0,
        },
    });

    const {data, isLoading, refetch} = useQuery({
        queryKey: ['listMeter'],
        queryFn: () => getMeters(accountId),
        enabled: !!accountId,
    });

    // โหลดข้อมูลอพาร์ทเมนท์เมื่อ component mount
    useEffect(() => {
        if (accountId && !apartMentData) {
            GetDataApartment(accountId);
        }
    }, [accountId, apartMentData, GetDataApartment]);

    // เลือกใช้ข้อมูลจาก apartMentData.meters ก่อน ถ้าไม่มีค่อยใช้จาก data.meters
    const metersData = apartMentData?.meters || data?.meters;

    // โหลดค่าจาก API เมื่อสลับ tab
    useEffect(() => {
        if (metersData) {
            const currentMeter = metersData.find(m => m.meterType === activeUtility);
            if (currentMeter) {
                reset({
                    billingType: currentMeter.billingType,
                    rate: currentMeter.rate || 0,
                    flatRate: currentMeter.flatRate || 0,
                });
            } else {
                // ถ้าไม่มีข้อมูล ให้ reset เป็นค่า default
                reset({
                    billingType: activeUtility === 'electric' ? 'perUnit' : 'flatRate',
                    rate: 0,
                    flatRate: 0,
                });
            }
        }
    }, [activeUtility, metersData, reset]);

    const formValues = watch();

    // บันทึกเฉพาะ utility ที่กำลังแก้ไข
    const onFinish = async (formData) => {
        console.log("🚀 ~ onFinish ~ formData: ", formData);

        const {billingType, rate, flatRate} = formData;
        const payload = {
            accountId,
            [activeUtility]: billingType === 'perUnit'
                ? {billingType, rate}
                : {billingType, flatRate}
        };

        console.log("🚀 ~ onFinish ~ payload: ", payload);

        try {
            await addMeters(payload);
            await refetch(); // รีเฟรชข้อมูลจาก API
            await GetDataApartment(accountId); // รีเฟรชข้อมูลอพาร์ทเมนท์
            message.success(`บันทึกการตั้งค่า${activeUtility === 'electric' ? 'ค่าไฟฟ้า' : 'ค่าน้ำ'}สำเร็จ!`);
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const selectedBillingType = formValues.billingType;
    const currentRate = formValues.rate;
    const currentFlatRate = formValues.flatRate;
    const currentUtility = metersData?.find(m => m.meterType === activeUtility);

    const utilityConfig = {
        electric: {
            label: 'ค่าไฟฟ้า',
            icon: <ThunderboltOutlined style={{color: '#FFC107'}}/>,
            titleStyle: {color: '#d48806', fontWeight: 'bold'},
            headerStyle: {borderLeft: '5px solid #FFC107', backgroundColor: '#fdebd0'},
        },
        water: {
            label: 'ค่าน้ำ',
            icon: <WaterDropIcon style={{color: '#2196F3'}}/>,
            titleStyle: {color: '#1890ff', fontWeight: 'bold'},
            headerStyle: {borderLeft: '5px solid #3498db', backgroundColor: '#ebf5fb'},
        },
    };

    return (
        <div style={{
            padding: 'clamp(16px, 3vw, 24px) clamp(8px, 2vw, 16px)',
            backgroundColor: '#f0f2f5',
            minHeight: '100vh'
        }}>
            <div style={{
                maxWidth: '960px',
                margin: '0 auto',
                width: '100%'
            }}>
                <PageHeader
                    title="ตั้งค่าการคิดค่าน้ำ-ค่าไฟ"
                    subtitle="กำหนดอัตราคำนวณค่าน้ำและค่าไฟสำหรับอพาร์ทเมนท์"
                    icon="⚡"
                />

                <div style={{
                    textAlign: 'center',
                    marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                    padding: '0 16px'
                }}>
                    <Segmented
                        size="large"
                        block
                        style={{
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}
                        options={[
                            {
                                label: (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: 'clamp(12px, 2.5vw, 14px)'
                                    }}>
                                        {utilityConfig.electric.icon}
                                        <span>ค่าไฟฟ้า</span>
                                    </div>
                                ),
                                value: 'electric'
                            },
                            {
                                label: (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: 'clamp(12px, 2.5vw, 14px)'
                                    }}>
                                        {utilityConfig.water.icon}
                                        <span>ค่าน้ำ</span>
                                    </div>
                                ),
                                value: 'water'
                            },
                        ]}
                        value={activeUtility}
                        onChange={setActiveUtility}
                    />
                </div>

                {isLoading ? (
                    <div style={{textAlign: 'center', padding: '48px 0'}}>
                        <Spin size="large"/>
                    </div>
                ) : !metersData?.length ? (
                    <Card
                        title={
                            <span style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}>
                                ({activeUtility === 'electric' ? 'ค่าไฟฟ้า' : 'ค่าน้ำ'}) ปัจจุบันที่กำหนดไว้
                            </span>
                        }
                        style={{
                            marginBottom: 'clamp(16px, 3vw, 24px)',
                            backgroundColor: '#fff1f0',
                            border: '1px solid #ffa39e'
                        }}
                    >
                        <Text strong type="danger" style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                            ❌ ยังไม่ได้กำหนดค่าใดๆ
                        </Text>
                    </Card>
                ) : (
                    <Card
                        title={
                            <span style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}>
                                📄 ค่าบริการที่ตั้งไว้ปัจจุบัน ({utilityConfig[activeUtility].label})
                            </span>
                        }
                        style={{
                            marginBottom: 'clamp(16px, 3vw, 24px)',
                            backgroundColor: '#fafafa',
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        {currentUtility ? (
                            <div style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                <Text>วิธีคำนวณ: <Text
                                    strong>{currentUtility.billingType === 'perUnit' ? 'คิดตามหน่วยที่ใช้' : 'เหมาจ่ายรายเดือน'}</Text></Text><br/>
                                <Text>
                                    อัตรา: <Text strong>
                                    {currentUtility.billingType === 'perUnit'
                                        ? `${currentUtility.rate} บาท / หน่วย`
                                        : `${currentUtility.flatRate} บาท / เดือน`}
                                </Text>
                                </Text>
                            </div>
                        ) : (
                            <Text strong type="danger" style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                ❌ ยังไม่ได้กำหนดค่านี้
                            </Text>
                        )}
                    </Card>
                )}

                <Form onFinish={handleSubmit(onFinish)} layout="vertical">
                    <Card
                        title={
                            <Space size="small">
                                {utilityConfig[activeUtility].icon}
                                <span style={{
                                    ...utilityConfig[activeUtility].titleStyle,
                                    fontSize: 'clamp(14px, 2.8vw, 18px)'
                                }}>
                                    ตั้งค่า{utilityConfig[activeUtility].label}
                                </span>
                            </Space>
                        }
                        style={{
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            marginBottom: 'clamp(16px, 3vw, 24px)'
                        }}
                        headStyle={{
                            ...utilityConfig[activeUtility].headerStyle,
                            padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)'
                        }}
                        bodyStyle={{
                            padding: 'clamp(16px, 3vw, 24px)'
                        }}
                    >
                        <Form.Item
                            label={
                                <Title
                                    level={5}
                                    style={{
                                        marginBottom: 0,
                                        fontSize: 'clamp(14px, 2.8vw, 16px)'
                                    }}
                                >
                                    เลือกวิธีการคำนวณ
                                </Title>
                            }
                            style={{marginBottom: 'clamp(16px, 3vw, 24px)'}}
                        >
                            <Controller
                                name="billingType"
                                control={control}
                                render={({field}) => (
                                    <Segmented
                                        {...field}
                                        block
                                        size="large"
                                        options={[
                                            {
                                                label: (
                                                    <span style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                                        คิดตามหน่วยที่ใช้
                                                    </span>
                                                ),
                                                value: 'perUnit'
                                            },
                                            {
                                                label: (
                                                    <span style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                                        เหมาจ่ายรายเดือน
                                                    </span>
                                                ),
                                                value: 'flatRate'
                                            },
                                        ]}
                                    />
                                )}
                            />
                        </Form.Item>

                        {selectedBillingType === 'perUnit' && (
                            <Form.Item
                                label={
                                    <span style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}>
                                        อัตราค่าบริการต่อหน่วย
                                    </span>
                                }
                                style={{marginBottom: 'clamp(16px, 3vw, 24px)'}}
                            >
                                <NumericInputControllerPage
                                    type="number"
                                    controllerName="rate"
                                    control={control}
                                    size="large"
                                    addonAfter="บาท / หน่วย"
                                    prefix="฿"
                                    style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}
                                />
                            </Form.Item>
                        )}

                        {selectedBillingType === 'flatRate' && (
                            <Form.Item
                                label={
                                    <span style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}>
                                        ค่าบริการเหมาจ่าย
                                    </span>
                                }
                                style={{marginBottom: 'clamp(16px, 3vw, 24px)'}}
                            >
                                <NumericInputControllerPage
                                    type="number"
                                    controllerName="flatRate"
                                    control={control}
                                    size="large"
                                    addonAfter="บาท / เดือน"
                                    prefix="฿"
                                    style={{fontSize: 'clamp(14px, 2.5vw, 16px)'}}
                                />
                            </Form.Item>
                        )}

                        <Divider style={{margin: 'clamp(16px, 3vw, 24px) 0'}}>
                            <Space>
                                <CalculatorOutlined/>
                                <span style={{fontSize: 'clamp(12px, 2.5vw, 14px)'}}>
                                    วิธีการคำนวณ
                                </span>
                            </Space>
                        </Divider>

                        <CalculationExample
                            utilityType={activeUtility}
                            billingType={selectedBillingType}
                            rate={currentRate}
                            flatRate={currentFlatRate}
                        />
                    </Card>

                    <div style={{
                        textAlign: 'center',
                        marginTop: 'clamp(24px, 4vw, 32px)',
                        padding: '0 16px'
                    }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<SaveOutlined/>}
                            style={{
                                maxWidth: '320px',
                                width: '100%',
                                height: 'clamp(40px, 6vw, 48px)',
                                fontSize: 'clamp(14px, 2.5vw, 16px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            บันทึกการตั้งค่า{utilityConfig[activeUtility].label}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}