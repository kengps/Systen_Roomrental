import { MinusCircleOutlined, PlusOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Col, Form, Input, Row, Select, Space, Typography, Divider, Radio } from 'antd'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import PageHeader from '../../../components/common/PageHeader'

import addressData from '../../../../address.json'
import { addressApartmant } from '../../../service/api/apartment'
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware'
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage'

const { Option } = Select
const { Title, Text } = Typography

// ✅ Schema สำหรับ validation
const phoneSchema = z.object({
    type: z.enum(['office', 'mobile']),
    number: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
})

const schema = z.object({
    addressLine: z.string().min(1, 'กรุณากรอกที่อยู่'),
    phones: z
        .array(phoneSchema)
        .min(1, 'กรุณาเพิ่มเบอร์โทรอย่างน้อย 1 เบอร์'),
    province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
    amphure: z.string().min(1, 'กรุณาเลือกอำเภอ'),
    tambon: z.string().min(1, 'กรุณาเลือกตำบล'),
    zipCode: z.string().min(1, 'กรุณาระบุรหัสไปรษณีย์'),
    isSlipCheckEnabled: z.boolean().default(true).optional()
})

function SettingApartment() {
    const { user, apartmentData } = persistMiddleware()

   

    if (apartmentData && apartmentData.result) {
        console.log("จำนวน field ใน result:", Object.keys(apartmentData.result).length);
    }

    const userId = user?.userPayLoad?.user?.id

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            phones: [{ type: 'office', number: '' }],
            isSlipCheckEnabled: true,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'phones',
    })

    const selectedProvince = watch('province')
    const selectedAmphure = watch('amphure')

    const [amphures, setAmphures] = useState([])
    const [tambons, setTambons] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(false)

    useEffect(() => {
        console.log('🔍 Province useEffect triggered:', {
            selectedProvince,
            isLoadingInitialData,
            isDataLoaded,
            amphuresLength: amphures.length
        });
        
        // Skip if loading initial data
        if (isLoadingInitialData) {
            console.log('⏭️ Skipping province useEffect - loading initial data');
            return;
        }
        
        if (!selectedProvince) {
            console.log('⏭️ Skipping province useEffect - no province selected');
            return;
        }
        
        const found = addressData.find((p) => p.name_th === selectedProvince)
        if (found) {
            console.log('✅ Found province, setting amphures:', found.amphure?.length || 0);
            setAmphures(found.amphure || [])
            
            // Only clear if user is actually changing the selection
            if (isDataLoaded) {
                console.log('🗑️ Clearing tambons and related fields');
                setTambons([])
                setValue('amphure', '')
                setValue('tambon', '')
                setValue('zipCode', '')
            }
        } else {
            console.log('❌ Province not found, clearing amphures');
            setAmphures([])
            if (isDataLoaded) {
                setTambons([])
                setValue('amphure', '')
                setValue('tambon', '')
                setValue('zipCode', '')
            }
        }
    }, [selectedProvince, isDataLoaded, isLoadingInitialData, setValue])

    useEffect(() => {
        // Skip if loading initial data
        if (isLoadingInitialData) return;
        
        if (!selectedAmphure || !selectedProvince) return;
        
        const foundProvince = addressData.find((p) => p.name_th === selectedProvince)
        const foundAmphure = foundProvince?.amphure.find((a) => a.name_th === selectedAmphure)
        if (foundAmphure) {
            setTambons(foundAmphure.tambon || [])
            
            // Only clear if user is actually changing the selection
            if (isDataLoaded) {
                setValue('tambon', '')
                setValue('zipCode', '')
            }
        } else {
            setTambons([])
            if (isDataLoaded) {
                setValue('tambon', '')
                setValue('zipCode', '')
            }
        }
    }, [selectedAmphure, selectedProvince, isDataLoaded, isLoadingInitialData, setValue])

    const onSubmit = async (data) => {
        const value = {
            profileId: userId,
            ...data
        }
        console.log(`⩇⩇:⩇⩇🚨 ~ value :`, value);

        // const res = await addressApartmant(data)
    }

    // ✅ Load existing apartment data
    useEffect(() => {
        console.log('📊 Apartment data useEffect triggered:', {
            hasApartmentData: !!apartmentData,
            hasResult: !!apartmentData?.result,
            resultKeys: apartmentData?.result ? Object.keys(apartmentData.result).length : 0
        });
        
        if (apartmentData && apartmentData.result && Object.keys(apartmentData.result).length > 0) {
            const data = apartmentData.result;
            
            console.log('🏢 Loading apartment data:', {
                province: data.province,
                amphure: data.amphure,
                tambon: data.tambon,
                zipCode: data.zipCode
            });
            
            // Set loading flag to prevent useEffect from clearing data
            setIsLoadingInitialData(true);
            setIsDataLoaded(false);
            
            console.log('🔒 Set loading flags - isLoadingInitialData: true, isDataLoaded: false');
            
            // Prepare dropdown data first
            let amphureOptions = [];
            let tambonOptions = [];
            
            if (data.province) {
                const foundProvince = addressData.find((p) => p.name_th === data.province)
                if (foundProvince) {
                    amphureOptions = foundProvince.amphure || [];
                    console.log('🏙️ Found province amphures:', amphureOptions.length);
                    
                    if (data.amphure) {
                        const foundAmphure = foundProvince.amphure.find((a) => a.name_th === data.amphure)
                        if (foundAmphure) {
                            tambonOptions = foundAmphure.tambon || [];
                            console.log('🏘️ Found amphure tambons:', tambonOptions.length);
                        }
                    }
                }
            }

            // Set dropdown options
            setAmphures(amphureOptions);
            setTambons(tambonOptions);
            
            console.log('📝 Set dropdown options - amphures:', amphureOptions.length, 'tambons:', tambonOptions.length);

            // Reset form with all data
            reset({
                addressLine: data.addressLine || "",
                province: data.province || "",
                amphure: data.amphure || "",
                tambon: data.tambon || "",
                zipCode: data.zipCode ? data.zipCode.toString() : "",
                isSlipCheckEnabled: data.isSlipCheckEnabled || false,
                phones: data.phones && data.phones.length > 0 ? 
                    data.phones.map(phone => ({
                        type: phone.type || 'office',
                        number: phone.number || ''
                    })) : [{ type: 'office', number: '' }]
            });
            
            console.log('📋 Form reset completed');

            // Allow normal dropdown behavior after loading
            setTimeout(() => {
                console.log('🔓 Unlocking loading flags after timeout');
                setIsLoadingInitialData(false);
                setIsDataLoaded(true);
            }, 200);
        } else {
            console.log('🆕 No apartment data - setting as new form');
            setIsDataLoaded(true);
            setIsLoadingInitialData(false);
        }
    }, [apartmentData, reset]);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: 'clamp(8px, 2vw, 24px)'
        }}>
            <PageHeader
                title="ตั้งค่าข้อมูลอพาร์ทเมนท์"
                subtitle="จัดการข้อมูลที่อยู่และติดต่อของอพาร์ทเมนท์"
                icon="🏢"
            />
            
            <Card
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
                    borderRadius: '8px'
                }}
                styles={{
                    body: {
                        padding: 'clamp(16px, 4vw, 32px)'
                    }
                }}
            >
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'clamp(24px, 5vw, 32px)'
                }}>
                    <HomeOutlined
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 3rem)',
                            color: '#1890ff',
                            marginBottom: '16px'
                        }}
                    />
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            fontSize: 'clamp(20px, 4vw, 28px)',
                            marginBottom: '8px'
                        }}
                    >
                        ตั้งค่าข้อมูลอพาร์ทเมนท์
                    </Title>
                    {apartmentData?.result?.apartmentName && (
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                fontSize: 'clamp(16px, 3.5vw, 20px)',
                                marginBottom: '8px',
                                color: '#1890ff'
                            }}
                        >
                            {apartmentData.result.apartmentName}
                        </Title>
                    )}
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 'clamp(12px, 2.5vw, 14px)',
                            display: 'block'
                        }}
                    >
                        {apartmentData?.result ? 'แก้ไขข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์' : 'กรอกข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์'}
                    </Text>
                </div>

                <Form
                    layout="vertical"
                    onFinish={handleSubmit(onSubmit)}
                    style={{ width: '100%' }}
                >
                    {/* ที่อยู่ */}
                    <Form.Item
                        label={
                            <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                ที่อยู่ (เช่น บ้านเลขที่ ซอย ถนน)
                            </span>
                        }
                        style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                    >
                        <Controller
                            name="addressLine"
                            control={control}
                            render={({ field }) => (
                                <Input.TextArea
                                    {...field}
                                    rows={3}
                                    placeholder="กรอกที่อยู่ เช่น บ้านเลขที่ ซอย ถนน"
                                    style={{
                                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                                        borderRadius: '6px'
                                    }}
                                />
                            )}
                        />
                        {errors.addressLine && (
                            <Text
                                type="danger"
                                style={{
                                    fontSize: 'clamp(11px, 2.2vw, 12px)',
                                    display: 'block',
                                    marginTop: '4px'
                                }}
                            >
                                {errors.addressLine.message}
                            </Text>
                        )}
                    </Form.Item>

                    {/* เบอร์โทร */}
                    <Form.Item
                        label={
                            <Space size="small">
                                <PhoneOutlined style={{ color: '#1890ff' }} />
                                <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                    เบอร์โทร
                                </span>
                            </Space>
                        }
                        style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                    >
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                style={{
                                    marginBottom: 'clamp(8px, 2vw, 12px)',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '6px',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                <Row gutter={[8, 8]} align="middle" wrap={false}>
                                    <Col flex="0 0 auto" style={{ minWidth: 'clamp(90px, 20vw, 120px)' }}>
                                        <NumericInputControllerPage
                                            type="select"
                                            controllerName={`phones.${index}.type`}
                                            control={control}
                                            selectOptions={[
                                                { value: 'office', name: 'สำนักงาน' },
                                                { value: 'mobile', name: 'มือถือ' },
                                            ]}
                                            style={{ fontSize: 'clamp(11px, 2.2vw, 13px)' }}
                                        />
                                    </Col>
                                    <Col flex="1 1 auto">
                                        <NumericInputControllerPage
                                            type='string'
                                            controllerName={`phones.${index}.number`}
                                            control={control}
                                            placeholder='กรอกเบอร์โทร'
                                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                        />
                                    </Col>
                                    <Col flex="0 0 auto">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                            size="small"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 'clamp(28px, 6vw, 32px)',
                                                height: 'clamp(28px, 6vw, 32px)',
                                                minWidth: 'unset'
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <Button
                            type="dashed"
                            onClick={() => append({ type: 'office', number: '' })}
                            block
                            icon={<PlusOutlined />}
                            style={{
                                fontSize: 'clamp(12px, 2.5vw, 14px)',
                                height: 'clamp(36px, 8vw, 40px)',
                                marginTop: 'clamp(8px, 2vw, 12px)'
                            }}
                        >
                            เพิ่มเบอร์โทร
                        </Button>

                        {errors.phones && (
                            <Text
                                type="danger"
                                style={{
                                    fontSize: 'clamp(11px, 2.2vw, 12px)',
                                    display: 'block',
                                    marginTop: '8px'
                                }}
                            >
                                {errors.phones.message}
                            </Text>
                        )}
                    </Form.Item>

                    <Divider style={{ margin: 'clamp(16px, 4vw, 24px) 0' }}>
                        <Text
                            type="secondary"
                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            ข้อมูลที่ตั้ง
                        </Text>
                    </Divider>

                    {/* จังหวัด และ อำเภอ */}
                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                        จังหวัด
                                    </span>
                                }
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <Controller
                                    name="province"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="เลือกจังหวัด"
                                            allowClear
                                            showSearch
                                            size="large"
                                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                            filterOption={(input, option) =>
                                                option?.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {addressData.map((prov) => (
                                                <Option key={prov.id} value={prov.name_th}>
                                                    {prov.name_th}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.province && (
                                    <Text
                                        type="danger"
                                        style={{
                                            fontSize: 'clamp(11px, 2.2vw, 12px)',
                                            display: 'block',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {errors.province.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                        อำเภอ
                                    </span>
                                }
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <Controller
                                    name="amphure"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="เลือกอำเภอ"
                                            disabled={!amphures.length}
                                            showSearch
                                            size="large"
                                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                            filterOption={(input, option) =>
                                                option?.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {amphures.map((a) => (
                                                <Option key={a.id} value={a.name_th}>
                                                    {a.name_th}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.amphure && (
                                    <Text
                                        type="danger"
                                        style={{
                                            fontSize: 'clamp(11px, 2.2vw, 12px)',
                                            display: 'block',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {errors.amphure.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ตำบล และ รหัสไปรษณีย์ */}
                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                        ตำบล
                                    </span>
                                }
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <Controller
                                    name="tambon"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="เลือกตำบล"
                                            disabled={!tambons.length}
                                            showSearch
                                            size="large"
                                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                            filterOption={(input, option) =>
                                                option?.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                            onChange={(val) => {
                                                const zip = tambons.find((t) => t.name_th === val)?.zip_code || ''
                                                field.onChange(val)
                                                setValue('zipCode', zip.toString())
                                            }}
                                        >
                                            {tambons.map((t) => (
                                                <Option key={t.id} value={t.name_th}>
                                                    {t.name_th}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.tambon && (
                                    <Text
                                        type="danger"
                                        style={{
                                            fontSize: 'clamp(11px, 2.2vw, 12px)',
                                            display: 'block',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {errors.tambon.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                        รหัสไปรษณีย์
                                    </span>
                                }
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <Controller
                                    name="zipCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            disabled
                                            size="large"
                                            style={{
                                                fontSize: 'clamp(12px, 2.5vw, 14px)',
                                                backgroundColor: '#f5f5f5'
                                            }}
                                        />
                                    )}
                                />
                                {errors.zipCode && (
                                    <Text
                                        type="danger"
                                        style={{
                                            fontSize: 'clamp(11px, 2.2vw, 12px)',
                                            display: 'block',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {errors.zipCode.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: 'clamp(24px, 5vw, 32px) 0' }} />

                    <Form.Item 
                        label={
                            <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>
                                เปิดการใช้งานตรวจสอบ slip
                            </span>
                        } 
                        required
                    >
                        <Controller
                            name="isSlipCheckEnabled"
                            control={control}
                            render={({ field }) => (
                                <Radio.Group
                                    {...field}
                                    value={field.value ? 'yes' : 'no'}
                                    onChange={(e) => field.onChange(e.target.value === 'yes')}
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                >
                                    <Radio value='yes'>ใช่</Radio>
                                    <Radio value='no'>ไม่ใช่</Radio>
                                </Radio.Group>
                            )}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{
                                fontSize: 'clamp(14px, 3vw, 16px)',
                                height: 'clamp(40px, 8vw, 48px)',
                                minWidth: 'clamp(120px, 30vw, 200px)',
                                borderRadius: '6px',
                                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
                            }}
                        >
                            {apartmentData?.result ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default SettingApartment