import Icon, {
    CalculatorOutlined,
    SaveOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
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
    Typography
} from 'antd';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { addMeters, getMeters } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

const { Title, Text, Paragraph } = Typography;
// --- Custom Water Drop Icon ---
const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em">
        <path d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z" />
    </svg>
);
const WaterDropIcon = props => <Icon component={WaterDropSvg} {...props} />;


// --- Helper Component for Calculation Examples ---
const CalculationExample = ({ utilityType, billingType, rate, flatRate }) => {
    const isElectric = utilityType === 'electric';
    const icon = isElectric ? <ThunderboltOutlined style={{ color: '#fadb14' }} /> : <WaterDropIcon style={{ color: '#1890ff' }} />;
    const unitName = isElectric ? 'หน่วย' : 'ยูนิต';
    const utilityName = isElectric ? 'ค่าไฟ' : 'ค่าน้ำ';

    if (billingType === 'flatRate') {
        return (
            <Card variant="borderless" style={{ backgroundColor: '#f5f5f5', marginTop: '16px', borderRadius: '8px' }}>
                <Title level={5} style={{ textAlign: 'center', marginBottom: '16px' }}>ตัวอย่าง: การคิดค่าบริการแบบเหมาจ่าย</Title>
                <Row gutter={16} align="middle" justify="center">
                    <Col span={12} style={{ textAlign: 'center', padding: '16px', borderRight: '1px solid #e8e8e8' }}>
                        <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{icon}</div>
                        <Text>ห้อง 101 ใช้ไป 5 {unitName}</Text><br />
                        <Text strong>คิดเป็น{utilityName}ที่ต้องจ่าย <span style={{ fontSize: '1.125rem', color: '#1890ff' }}>฿{flatRate || 0}</span></Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{icon}</div>
                        <Text>ห้อง 202 ใช้ไป 20 {unitName}</Text><br />
                        <Text strong>คิดเป็น{utilityName}ที่ต้องจ่าย <span style={{ fontSize: '1.125rem', color: '#1890ff' }}>฿{flatRate || 0}</span></Text>
                    </Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Paragraph strong style={{ textAlign: 'center', color: '#fa8c16', marginBottom: 0 }}>
                    ** ไม่ว่าจะใช้น้อยหรือใช้มาก ก็จะคิดค่าบริการในราคาเดียว **
                </Paragraph>
            </Card>
        );
    }

    // Default to perUnit
    return (
        <Card variant="borderless" style={{ backgroundColor: '#f5f5f5', marginTop: '16px', borderRadius: '8px' }}>
            <Title level={5} style={{ textAlign: 'center', marginBottom: '16px' }}>ตัวอย่าง: การคิดค่าบริการตามการใช้งานจริง</Title>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{icon}</div>
                <Paragraph>
                    สมมติว่าห้อง 101 มีมิเตอร์ก่อนหน้า <b style={{ color: '#1890ff' }}>1000</b> และมิเตอร์ล่าสุด <b style={{ color: '#1890ff' }}>1025</b>
                </Paragraph>
                <Paragraph style={{ fontSize: '1.125rem', backgroundColor: 'white', padding: '12px', borderRadius: '6px', display: 'inline-block', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
                    จำนวนที่ใช้: 1025 - 1000 = <b style={{ color: '#52c41a' }}>25 {unitName}</b><br />
                    อัตราค่าบริการ: <b style={{ color: '#722ed1' }}>฿{rate || 0} / {unitName}</b><br />
                    <Divider style={{ margin: '8px 0' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>รวมค่าบริการ: 25 * {rate || 0} = <span style={{ color: '#f5222d' }}>฿{(25 * (rate || 0)).toLocaleString()}</span></span>
                </Paragraph>
            </div>
        </Card>
    );
};


// --- Main Component ---
export default function MetersPages() {
    const [activeUtility, setActiveUtility] = useState('electric'); // 'electric' or 'water'
    const { user } = persistMiddleware()

    const accountId = user.userPayLoad.user.id
    console.log(`⩇⩇:⩇⩇🚨 accountId :`, accountId);

    const { control, handleSubmit, watch } = useForm({
        defaultValues: {
            electric: {
                billingType: 'perUnit', // 'perUnit' or 'flatRate'
                rate: 0,
                flatRate: 0,
            },
            water: {
                billingType: 'flatRate',
                rate: 0,
                flatRate: 0,
            },
        },
    });


    // --- Query data
    const { data, isLoading } = useQuery({
        queryKey: ['listMeter'],
        queryFn: () => getMeters(accountId),
        enabled: !!accountId
    })



    // Watch for changes in the form to update the example dynamically
    const formValues = useWatch({ control });

    const onFinish = async (data) => {
        const processedData = {};

        // Process each utility (electric, water)
        for (const key in data) {
            const utility = data[key];
            const { billingType, rate, flatRate } = utility;

            if (billingType === 'perUnit') {
                processedData[key] = {
                    billingType: 'perUnit',
                    rate: rate,
                };
            } else if (billingType === 'flatRate') {
                processedData[key] = {
                    billingType: 'flatRate',
                    flatRate: flatRate,
                };
            }
        }
        const value = {
            accountId,
            ...processedData
        }

        const result = await addMeters(value)
        console.log(`⩇⩇:⩇⩇🚨 result :`, result);


        // console.log('Processed Data:', value);
        message.success('บันทึกการตั้งค่าสำเร็จ!');
    };

    const selectedBillingType = formValues[activeUtility]?.billingType;
    const currentRate = formValues[activeUtility]?.rate;
    const currentFlatRate = formValues[activeUtility]?.flatRate;

    const utilityConfig = {
        electric: {
            label: 'ค่าไฟฟ้า',
            icon: <ThunderboltOutlined style={{ color: '#FFC107' }} />,
            titleStyle: {
                color: '#d48806', fontWeight: 'bold'
            },
            headerStyle: { borderLeft: '5px solid #FFC107', backgroundColor: '#fdebd0' }
        },
        water: {
            label: 'ค่าน้ำ',
            icon: <WaterDropIcon style={{ color: '#2196F3' }} />,
            titleStyle: { color: '#1890ff', fontWeight: 'bold' },
            headerStyle: { borderLeft: '5px solid #3498db', backgroundColor: '#ebf5fb' }
        },
    };   // หาค่าของ utility ที่เลือก (ไฟฟ้า/น้ำ)
    const currentUtility = data?.meters?.find(m => m.meterType === activeUtility);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '32px' }}>

            <div style={{ maxWidth: '896px', margin: '0 auto' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>ตั้งค่าการคิดค่าน้ำ-ค่าไฟ</Title>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Segmented
                        // className='bg-gray-500'

                        size="large"
                        options={[
                            {
                                label: 'ค่าไฟฟ้า',
                                value: 'electric',
                                icon: <ThunderboltOutlined style={{ color: '#FFC107' }} />, // สีเหลือง

                            },
                            { label: 'ค่าน้ำ', value: 'water', icon: <WaterDropIcon style={{ color: '#2196F3' }} /> },
                        ]}
                        value={activeUtility}
                        onChange={(value) => setActiveUtility(value)}

                    />
                </div>

                {/* ✅ แสดงค่าปัจจุบัน */}
                {isLoading ? (
                    <Spin size="large" style={{ display: 'block', margin: '24px auto' }} />
                ) : !data?.meters || data.meters.length === 0 ? (
                    // ✅ ถ้า data.meters ไม่มี หรือเป็น array ว่าง
                    <Card
                        title={`(${activeUtility === 'electric' ? 'ค่าไฟฟ้า' : 'ค่าน้ำ'}) ปัจจุบันที่กำหนดไว้`}
                        style={{
                            marginBottom: '24px',
                            backgroundColor: '#fff1f0', // พื้นหลังชมพูอ่อน
                            border: '1px solid #ffa39e',
                        }}
                    >
                        <Text strong type="danger">
                            ❌ ยังไม่ได้กำหนดค่าใดๆ
                        </Text>
                    </Card>
                ) : (
                    <Card
                        title={`📄 ค่าบริการที่ตั้งไว้ปัจจุบัน (${activeUtility === 'electric' ? 'ค่าไฟฟ้า' : 'ค่าน้ำ'})`}
                        style={{
                            marginBottom: '24px',
                            backgroundColor: '#fafafa',
                            border: '1px solid #f0f0f0',
                        }}
                        styles={{ header: { backgroundColor: '#eaecee' } }}
                    >
                        {currentUtility ? (
                            <>
                                <Text>
                                    วิธีคำนวณ:{' '}
                                    <Text strong>
                                        {currentUtility.billingType === 'perUnit'
                                            ? 'คิดตามหน่วยที่ใช้'
                                            : 'เหมาจ่ายรายเดือน'}
                                    </Text>
                                </Text>
                                <br />
                                {currentUtility.billingType === 'perUnit' ? (
                                    <Text>
                                        อัตรา:{' '}
                                        <Text strong>
                                            {currentUtility.rate} บาท / หน่วย
                                        </Text>
                                    </Text>
                                ) : (
                                    <Text>
                                        อัตรา:{' '}
                                        <Text strong>
                                            {currentUtility.flatRate} บาท / เดือน
                                        </Text>
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text strong type="danger">
                                ❌ ยังไม่ได้กำหนดค่านี้
                            </Text>
                        )}
                    </Card>
                )}

                <Form onFinish={handleSubmit(onFinish)} layout="vertical">
                    <Card
                        style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)' }}
                        styles={{ header: utilityConfig[activeUtility].headerStyle }}
                        title={
                            <Space>
                                {utilityConfig[activeUtility].icon}
                                <span style={utilityConfig[activeUtility].titleStyle} >
                                    ตั้งค่า{utilityConfig[activeUtility].label}
                                </span>
                            </Space>
                        }
                    >
                        <Form.Item
                            label={<Title level={5}>เลือกวิธีการคำนวณ</Title>}
                            style={{ marginBottom: '24px' }}
                        >
                            <Controller

                                name={`${activeUtility}.billingType`}
                                control={control}
                                render={({ field }) => (
                                    <Segmented
                                        {...field}
                                        block
                                        options={[
                                            { label: 'คิดตามหน่วยที่ใช้', value: 'perUnit' },
                                            { label: 'เหมาจ่ายรายเดือน', value: 'flatRate' },
                                        ]}
                                    />
                                )}
                            />
                        </Form.Item>

                        {/* Conditional Fields */}
                        {selectedBillingType === 'perUnit' && (
                            <Form.Item
                                label="อัตราค่าบริการต่อหน่วย"
                                tooltip="กำหนดราคาต่อหน่วยสำหรับคำนวณค่าบริการ"
                            >
                                <NumericInputControllerPage
                                    type='number'
                                    controllerName={`${activeUtility}.rate`}
                                    control={control}
                                    size="large"
                                    addonAfter="บาท / หน่วย"
                                    prefix='฿'
                                />

                                {/* <Controller
                                    name={`${activeUtility}.rate`}
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            style={{ width: '100%' }}
                                            size="large"
                                            addonAfter="บาท / หน่วย"
                                            min={0}
                                            formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/฿\s?|(,*)/g, '')}

                                        />
                                    )}
                                /> */}
                            </Form.Item>
                        )}

                        {selectedBillingType === 'flatRate' && (
                            <Form.Item
                                label="ค่าบริการเหมาจ่าย"
                                tooltip="กำหนดราคาคงที่ที่จะเรียกเก็บทุกเดือน"
                            >
                                <NumericInputControllerPage
                                    type='number'
                                    controllerName={`${activeUtility}.flatRate`}
                                    control={control}
                                    size="large"
                                    addonAfter="บาท / เดือน"
                                    prefix='฿'
                                />

                                {/* <Controller
                                    name={`${activeUtility}.flatRate`}
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            style={{ width: '100%' }}
                                            size="large"
                                            addonAfter="บาท / เดือน"
                                            min={0}
                                            formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/฿\s?|(,*)/g, '')}
                                        />
                                    )}
                                /> */}
                            </Form.Item>
                        )}

                        <Divider>
                            <CalculatorOutlined /> วิธีการคำนวณ
                        </Divider>

                        <CalculationExample
                            utilityType={activeUtility}
                            billingType={selectedBillingType}
                            rate={currentRate}
                            flatRate={currentFlatRate}
                        />
                    </Card>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<SaveOutlined />}
                            style={{ boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)' }}
                        >
                            บันทึกการตั้งค่า
                        </Button>
                    </div>
                </Form>
            </div>
        </div >
    );
}