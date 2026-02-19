import { MinusCircleOutlined, PlusOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Col, Form, Input, Row, Select, Space, Typography, Divider, Segmented } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import PageHeader from '../../../components/common/PageHeader';

import addressData from '../../../../address.json';
import { addressApartmant } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

const { Option } = Select;
const { Title, Text } = Typography;

// ✅ Schema สำหรับ validation
const phoneSchema = z.object({
    type: z.enum(['office', 'mobile']),
    number: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
});

// ✅ billingSettings
const billingSettingsSchema = z.object({
    cutoffDate: z.coerce
        .number()
        .int('ต้องเป็นจำนวนเต็ม')
        .min(1, 'cutoffDate ต้องอยู่ระหว่าง 1-31')
        .max(31, 'cutoffDate ต้องอยู่ระหว่าง 1-31'),
    lateFeePerDay: z.coerce
        .number()
        .int('ต้องเป็นจำนวนเต็ม')
        .min(0, 'lateFeePerDay ต้องมากกว่าหรือเท่ากับ 0'),
    paymentDueDate: z.coerce
        .number()
        .int('ต้องเป็นจำนวนเต็ม')
        .min(1, 'paymentDueDate ต้องอยู่ระหว่าง 1-31')
        .max(31, 'paymentDueDate ต้องอยู่ระหว่าง 1-31'),
});

const schema = z.object({
    apartmentName: z.string().min(1, 'กรุณากรอกชื่อ'),
    addressLine: z.string().min(1, 'กรุณากรอกที่อยู่'),
    phones: z.array(phoneSchema).min(1, 'กรุณาเพิ่มเบอร์โทรอย่างน้อย 1 เบอร์'),
    province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
    amphure: z.string().min(1, 'กรุณาเลือกอำเภอ'),
    tambon: z.string().min(1, 'กรุณาเลือกตำบล'),
    zipCode: z.string().min(1, 'กรุณาระบุรหัสไปรษณีย์'),
    isSlipCheckEnabled: z.boolean().default(true).optional(),
    billingSettings: billingSettingsSchema,
});

function SettingApartment() {
    const { user, apartmentData } = persistMiddleware();
    console.log("🚀 ~ SettingApartment ~ apartmentData: ", apartmentData);
    const userId = user?.userPayLoad?.user?.id;

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
            apartmentName: '',
            addressLine: '',
            province: '',
            amphure: '',
            tambon: '',
            zipCode: '',
            phones: [{ type: 'office', number: '' }],
            isSlipCheckEnabled: true,
            billingSettings: {
                cutoffDate: 26,
                lateFeePerDay: 100,
                paymentDueDate: 5,
            },
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'phones',
    });

    const selectedProvince = watch('province');
    const selectedAmphure = watch('amphure');

    const [amphures, setAmphures] = useState([]);
    const [tambons, setTambons] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

    // ✅ ใช้ ref เพื่อรู้ว่า user "เปลี่ยนจริง" หรือเป็นค่าที่ถูก reset มา
    const prevProvinceRef = useRef('');
    const prevAmphureRef = useRef('');

    const onSubmit = async (data) => {
        const payload = {
            profileId: userId,
            ...data,
        };

        console.log('✅ submit payload:', payload);
        const res = await addressApartmant(payload);
        console.log('✅ res:', res);
    };

    // ✅ Province effect (ไม่ล้างตอน initial load)
    useEffect(() => {
        if (isLoadingInitialData) return;
        if (!selectedProvince) return;

        const found = addressData.find((p) => p.name_th === selectedProvince);
        setAmphures(found?.amphure || []);

        // ✅ ล้างเฉพาะตอน "user เปลี่ยนจังหวัดจริงๆ"
        const provinceChanged =
            prevProvinceRef.current && prevProvinceRef.current !== selectedProvince;

        if (provinceChanged) {
            setTambons([]);
            setValue('amphure', '');
            setValue('tambon', '');
            setValue('zipCode', '');
        }

        prevProvinceRef.current = selectedProvince;
    }, [selectedProvince, isLoadingInitialData, setValue]);

    // ✅ Amphure effect (ไม่ล้างตอน initial load)
    useEffect(() => {
        if (isLoadingInitialData) return;
        if (!selectedAmphure || !selectedProvince) return;

        const foundProvince = addressData.find((p) => p.name_th === selectedProvince);
        const foundAmphure = foundProvince?.amphure?.find((a) => a.name_th === selectedAmphure);

        setTambons(foundAmphure?.tambon || []);

        // ✅ ล้างเฉพาะตอน "user เปลี่ยนอำเภอจริงๆ"
        const amphureChanged =
            prevAmphureRef.current && prevAmphureRef.current !== selectedAmphure;

        if (amphureChanged) {
            setValue('tambon', '');
            setValue('zipCode', '');
        }

        prevAmphureRef.current = selectedAmphure;
    }, [selectedAmphure, selectedProvince, isLoadingInitialData, setValue]);

    // ✅ Load existing apartment data
    useEffect(() => {
        const data = apartmentData?.result;

        console.log('📊 Apartment data useEffect triggered:', {
            hasApartmentData: !!apartmentData,
            hasResult: !!data,
            resultKeys: data ? Object.keys(data).length : 0,
        });

        // ✅ ไม่มีข้อมูล → โหมดสร้างใหม่
        if (!data || Object.keys(data).length === 0) {
            setIsDataLoaded(true);
            setIsLoadingInitialData(false);

            // reset refs ให้ตรงกับค่าฟอร์ม (ว่าง)
            prevProvinceRef.current = '';
            prevAmphureRef.current = '';
            return;
        }

        setIsLoadingInitialData(true);
        setIsDataLoaded(false);

        // ✅ เตรียม options ให้ dropdown ก่อน
        let amphureOptions = [];
        let tambonOptions = [];

        if (data.province) {
            const foundProvince = addressData.find((p) => p.name_th === data.province);
            if (foundProvince) {
                amphureOptions = foundProvince.amphure || [];

                if (data.amphure) {
                    const foundAmphure = foundProvince.amphure?.find((a) => a.name_th === data.amphure);
                    if (foundAmphure) {
                        tambonOptions = foundAmphure.tambon || [];
                    }
                }
            }
        }

        setAmphures(amphureOptions);
        setTambons(tambonOptions);

        // ✅ billingSettings fallback + กัน NaN
        const bs = data.billingSettings ?? {};
        const safeNum = (v, fallback) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : fallback;
        };

        const cutoffDate = safeNum(bs.cutoffDate, 26);
        const lateFeePerDay = safeNum(bs.lateFeePerDay, 100);
        const paymentDueDate = safeNum(bs.paymentDueDate, 5);

        // ✅ สำคัญ: ตั้ง prevRef ให้เท่ากับข้อมูลจริง
        // เพื่อกัน useEffect province/amphure ไป "ล้างค่า" หลังโหลดเสร็จ
        prevProvinceRef.current = data.province ?? '';
        prevAmphureRef.current = data.amphure ?? '';

        // ✅ สำคัญ: อย่าลืม apartmentName
        reset({
            apartmentName: data.apartmentName ?? '',
            addressLine: data.addressLine ?? '',
            province: data.province ?? '',
            amphure: data.amphure ?? '',
            tambon: data.tambon ?? '',
            zipCode: data.zipCode != null ? String(data.zipCode) : '',
            isSlipCheckEnabled: !!data.isSlipCheckEnabled,

            phones:
                Array.isArray(data.phones) && data.phones.length > 0
                    ? data.phones.map((phone) => ({
                        type: phone?.type ?? 'office',
                        number: phone?.number ?? '',
                    }))
                    : [{ type: 'office', number: '' }],

            billingSettings: {
                cutoffDate,
                lateFeePerDay,
                paymentDueDate,
            },
        });

        const t = setTimeout(() => {
            setIsLoadingInitialData(false);
            setIsDataLoaded(true);
        }, 200);

        return () => clearTimeout(t);
    }, [apartmentData, reset]);

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                padding: 'clamp(8px, 2vw, 24px)',
            }}
        >
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
                    borderRadius: '8px',
                }}
                styles={{
                    body: {
                        padding: 'clamp(16px, 4vw, 32px)',
                    },
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 32px)' }}>
                    <HomeOutlined
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 3rem)',
                            color: '#1890ff',
                            marginBottom: '16px',
                        }}
                    />
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            fontSize: 'clamp(20px, 4vw, 28px)',
                            marginBottom: '8px',
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
                                color: '#1890ff',
                            }}
                        >
                            {apartmentData.result.apartmentName}
                        </Title>
                    )}

                    <Text type="secondary" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', display: 'block' }}>
                        {apartmentData?.result
                            ? 'แก้ไขข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์'
                            : 'กรอกข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์'}
                    </Text>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                    {/* ชื่อ */}
                    <Form.Item>
                        <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>ชื่อ</span>

                        <Controller
                            name="apartmentName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="กรอกชื่อ"
                                    size="large"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', borderRadius: '6px' }}
                                />
                            )}
                        />
                        {errors.apartmentName && (
                            <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                {errors.apartmentName.message}
                            </Text>
                        )}
                    </Form.Item>

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
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', borderRadius: '6px' }}
                                />
                            )}
                        />
                        {errors.addressLine && (
                            <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                {errors.addressLine.message}
                            </Text>
                        )}
                    </Form.Item>

                    {/* เบอร์โทร */}
                    <Form.Item
                        label={
                            <Space size="small">
                                <PhoneOutlined style={{ color: '#1890ff' }} />
                                <span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>เบอร์โทร</span>
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
                                    backgroundColor: '#fafafa',
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
                                            type="string"
                                            controllerName={`phones.${index}.number`}
                                            control={control}
                                            placeholder="กรอกเบอร์โทร"
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
                                                minWidth: 'unset',
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
                                marginTop: 'clamp(8px, 2vw, 12px)',
                            }}
                        >
                            เพิ่มเบอร์โทร
                        </Button>

                        {errors.phones && (
                            <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 8 }}>
                                {errors.phones.message}
                            </Text>
                        )}
                    </Form.Item>

                    <Divider style={{ margin: 'clamp(16px, 4vw, 24px) 0' }}>
                        <Text type="secondary" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                            ข้อมูลที่ตั้ง
                        </Text>
                    </Divider>

                    {/* จังหวัด + อำเภอ */}
                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>จังหวัด</span>}
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
                                                (option?.children)?.toLowerCase().includes(input.toLowerCase())
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
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.province.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>อำเภอ</span>}
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
                                                (option?.children)?.toLowerCase().includes(input.toLowerCase())
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
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.amphure.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ตำบล + รหัสไปรษณีย์ */}
                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>ตำบล</span>}
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
                                                (option?.children)?.toLowerCase().includes(input.toLowerCase())
                                            }
                                            onChange={(val) => {
                                                const zip = tambons.find((t) => t.name_th === val)?.zip_code || '';
                                                field.onChange(val);
                                                setValue('zipCode', zip ? String(zip) : '');
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
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.tambon.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>รหัสไปรษณีย์</span>}
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
                                            style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', backgroundColor: '#f5f5f5' }}
                                        />
                                    )}
                                />
                                {errors.zipCode && (
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.zipCode.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* billingSettings */}
                    <Divider style={{ margin: 'clamp(16px, 4vw, 24px) 0' }}>
                        <Text type="secondary" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                            ตั้งค่าการวางบิล
                        </Text>
                    </Divider>

                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>ตัดรอบวันที่</span>}
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <NumericInputControllerPage
                                    type="number"
                                    controllerName="billingSettings.cutoffDate"
                                    control={control}
                                    placeholder="เช่น 25"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                                {errors.billingSettings?.cutoffDate && (
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.billingSettings.cutoffDate.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>กำหนดชำระภายใน</span>}
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <NumericInputControllerPage
                                    type="number"
                                    controllerName="billingSettings.paymentDueDate"
                                    control={control}
                                    placeholder="เช่น 5"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                                {errors.billingSettings?.paymentDueDate && (
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.billingSettings.paymentDueDate.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                            <Form.Item
                                label={<span style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 500 }}>ค่าปรับวันละ</span>}
                                style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}
                            >
                                <NumericInputControllerPage
                                    type="number"
                                    controllerName="billingSettings.lateFeePerDay"
                                    control={control}
                                    placeholder="เช่น 100"
                                    style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                                />
                                {errors.billingSettings?.lateFeePerDay && (
                                    <Text type="danger" style={{ fontSize: 'clamp(11px, 2.2vw, 12px)', display: 'block', marginTop: 4 }}>
                                        {errors.billingSettings.lateFeePerDay.message}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: 'clamp(24px, 5vw, 32px) 0' }} />

                    {/* Slip */}
                    <Form.Item label={<span style={{ fontWeight: 600, color: '#333' }}>การตรวจสอบ Slip</span>} layout="vertical">
                        <Controller
                            name="isSlipCheckEnabled"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Segmented
                                    block
                                    value={value ? 'yes' : 'no'}
                                    onChange={(val) => onChange(val === 'yes')}
                                    options={[
                                        { label: 'เปิดใช้งาน', value: 'yes' },
                                        { label: 'ปิดใช้งาน', value: 'no' },
                                    ]}
                                    style={{ borderRadius: '8px', padding: '4px', backgroundColor: '#f5f5f5' }}
                                />
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
                                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
                            }}
                        >
                            {apartmentData?.result ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default SettingApartment;
