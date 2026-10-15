import {MinusCircleOutlined, PlusOutlined, HomeOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, SafetyCertificateOutlined, ProfileOutlined} from '@ant-design/icons';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button, ConfigProvider, Form, Input, Select, Typography, Segmented} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {z} from 'zod';

import addressData from '../../../../address.json';
import {addressApartmant} from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

const {Option} = Select;
const {Text} = Typography;

/* ------------------------------------------------------------------ */
/* Design tokens (ชุดเดียวกับ ListRoom / BillingForm / AppSidebar)      */
/* ------------------------------------------------------------------ */
const C = {
    ink: '#0F172A',
    muted: '#5B6478',
    line: '#E6E8F0',
    page: '#F4F5F9',
    card: '#FFFFFF',
    primary: '#4F46E5',
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    sunken: '#F7F8FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: {
        colorPrimary: C.primary,
        borderRadius: 12,
        fontFamily: FONT,
        controlHeight: 44,
    },
};

const css = `
.sa-page { background: ${C.page}; min-height: 100vh; padding: clamp(12px, 3vw, 32px); font-family: ${FONT}; color: ${C.ink}; box-sizing: border-box; }
.sa-wrap { max-width: 880px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
.sa-grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); column-gap: 16px; }
.sa-grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); column-gap: 16px; }
.sa-form .ant-form-item { margin-bottom: 20px; }
.sa-form .ant-form-item-label > label { font-weight: 600; font-size: 14px; }
button:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
`;

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */
const PageHeader = ({icon, title, subtitle, badge}) => (
    <header
        style={{
            background: C.ink, borderRadius: 20, padding: '24px 28px', display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}
    >
        <div style={{display: 'flex', alignItems: 'center', gap: 16, minWidth: 0}}>
            <span
                aria-hidden="true"
                style={{
                    flex: '0 0 auto', width: 52, height: 52, borderRadius: 16, background: '#1E2A4A',
                    color: '#A5B4FC', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                {icon}
            </span>
            <div style={{minWidth: 0}}>
                <h1 style={{margin: 0, fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: '#FFFFFF'}}>{title}</h1>
                <p style={{margin: '4px 0 0', fontSize: 14, color: '#A5B0C6'}}>{subtitle}</p>
            </div>
        </div>
        {badge && (
            <span
                style={{
                    padding: '6px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.2)',
                    color: '#C7D2FE', fontSize: 14, fontWeight: 600, maxWidth: '100%',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
            >
                {badge}
            </span>
        )}
    </header>
);

const Section = ({icon, title, children}) => (
    <section
        style={{
            background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 24,
            display: 'flex', flexDirection: 'column', gap: 20,
        }}
    >
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 700}}>
            <span
                aria-hidden="true"
                style={{
                    width: 36, height: 36, borderRadius: 10, background: C.primarySoft, color: C.primaryDeep,
                    fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                {icon}
            </span>
            {title}
        </div>
        <div>{children}</div>
    </section>
);

// Form.Item + แสดง error จาก react-hook-form แบบเดียวกันทุกช่อง
const Item = ({label, error, children, ...rest}) => (
    <Form.Item label={label} validateStatus={error ? 'error' : ''} help={error?.message} {...rest}>
        {children}
    </Form.Item>
);

/* ------------------------------------------------------------------ */
/* Validation schema (เหมือนเดิม)                                       */
/* ------------------------------------------------------------------ */
const phoneSchema = z.object({
    type: z.enum(['office', 'mobile']),
    number: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
});

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

const filterThai = (input, option) => (option?.children)?.toLowerCase().includes(input.toLowerCase());

function SettingApartment() {
    const {user, apartmentData} = persistMiddleware();
    console.log("🚀 ~ SettingApartment ~ apartmentData: ", apartmentData);
    const userId = user?.userPayLoad?.user?.id;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
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
            phones: [{type: 'office', number: ''}],
            isSlipCheckEnabled: true,
            billingSettings: {
                cutoffDate: 26,
                lateFeePerDay: 100,
                paymentDueDate: 5,
            },
        },
    });

    const {fields, append, remove} = useFieldArray({
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
                    : [{type: 'office', number: ''}],

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

    const isEdit = !!apartmentData?.result;

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>

            <div className="sa-page">
                <div className="sa-wrap">
                    <PageHeader
                        icon={<HomeOutlined/>}
                        title="ตั้งค่าข้อมูลอพาร์ทเมนท์"
                        subtitle={
                            isEdit
                                ? 'แก้ไขข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์'
                                : 'กรอกข้อมูลที่อยู่และข้อมูลติดต่อของอพาร์ทเมนท์'
                        }
                        badge={apartmentData?.result?.apartmentName}
                    />

                    <Form layout="vertical" className="sa-form" onFinish={handleSubmit(onSubmit)} style={{width: '100%'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>

                            {/* ข้อมูลทั่วไป */}
                            <Section icon={<ProfileOutlined/>} title="ข้อมูลทั่วไป">
                                <Item label="ชื่ออพาร์ทเมนท์" error={errors.apartmentName}>
                                    <Controller
                                        name="apartmentName"
                                        control={control}
                                        render={({field}) => <Input {...field} placeholder="กรอกชื่อ"/>}
                                    />
                                </Item>

                                <Item label="ที่อยู่ (เช่น บ้านเลขที่ ซอย ถนน)" error={errors.addressLine} style={{marginBottom: 0}}>
                                    <Controller
                                        name="addressLine"
                                        control={control}
                                        render={({field}) => (
                                            <Input.TextArea {...field} rows={3} placeholder="กรอกที่อยู่ เช่น บ้านเลขที่ ซอย ถนน"/>
                                        )}
                                    />
                                </Item>
                            </Section>

                            {/* เบอร์โทร */}
                            <Section icon={<PhoneOutlined/>} title="เบอร์โทร">
                                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                                                border: `1px solid ${C.line}`, borderRadius: 14, background: C.sunken,
                                            }}
                                        >
                                            <div style={{flex: '0 0 auto', minWidth: 'clamp(100px, 22vw, 140px)'}}>
                                                <NumericInputControllerPage
                                                    type="select"
                                                    controllerName={`phones.${index}.type`}
                                                    control={control}
                                                    selectOptions={[
                                                        {value: 'office', name: 'สำนักงาน'},
                                                        {value: 'mobile', name: 'มือถือ'},
                                                    ]}
                                                />
                                            </div>

                                            <div style={{flex: '1 1 auto', minWidth: 0}}>
                                                <NumericInputControllerPage
                                                    type="string"
                                                    controllerName={`phones.${index}.number`}
                                                    control={control}
                                                    placeholder="กรอกเบอร์โทร"
                                                />
                                            </div>

                                            <Button
                                                type="text"
                                                danger
                                                aria-label="ลบเบอร์โทร"
                                                icon={<MinusCircleOutlined/>}
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                                style={{flex: '0 0 auto', width: 44}}
                                            />
                                        </div>
                                    ))}

                                    <Button
                                        type="dashed"
                                        onClick={() => append({type: 'office', number: ''})}
                                        block
                                        icon={<PlusOutlined/>}
                                        style={{color: C.primaryDeep, borderColor: '#C7CCF5'}}
                                    >
                                        เพิ่มเบอร์โทร
                                    </Button>

                                    {errors.phones && (
                                        <Text type="danger" style={{fontSize: 13}}>{errors.phones.message}</Text>
                                    )}
                                </div>
                            </Section>

                            {/* ข้อมูลที่ตั้ง */}
                            <Section icon={<EnvironmentOutlined/>} title="ข้อมูลที่ตั้ง">
                                <div className="sa-grid2">
                                    <Item label="จังหวัด" error={errors.province}>
                                        <Controller
                                            name="province"
                                            control={control}
                                            render={({field}) => (
                                                <Select {...field} placeholder="เลือกจังหวัด" allowClear showSearch filterOption={filterThai}>
                                                    {addressData.map((prov) => (
                                                        <Option key={prov.id} value={prov.name_th}>{prov.name_th}</Option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </Item>

                                    <Item label="อำเภอ" error={errors.amphure}>
                                        <Controller
                                            name="amphure"
                                            control={control}
                                            render={({field}) => (
                                                <Select {...field} placeholder="เลือกอำเภอ" disabled={!amphures.length} showSearch filterOption={filterThai}>
                                                    {amphures.map((a) => (
                                                        <Option key={a.id} value={a.name_th}>{a.name_th}</Option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </Item>

                                    <Item label="ตำบล" error={errors.tambon} style={{marginBottom: 0}}>
                                        <Controller
                                            name="tambon"
                                            control={control}
                                            render={({field}) => (
                                                <Select
                                                    {...field}
                                                    placeholder="เลือกตำบล"
                                                    disabled={!tambons.length}
                                                    showSearch
                                                    filterOption={filterThai}
                                                    onChange={(val) => {
                                                        const zip = tambons.find((t) => t.name_th === val)?.zip_code || '';
                                                        field.onChange(val);
                                                        setValue('zipCode', zip ? String(zip) : '');
                                                    }}
                                                >
                                                    {tambons.map((t) => (
                                                        <Option key={t.id} value={t.name_th}>{t.name_th}</Option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </Item>

                                    <Item label="รหัสไปรษณีย์" error={errors.zipCode} style={{marginBottom: 0}}>
                                        <Controller
                                            name="zipCode"
                                            control={control}
                                            render={({field}) => <Input {...field} disabled/>}
                                        />
                                    </Item>
                                </div>
                            </Section>

                            {/* ตั้งค่าการวางบิล */}
                            <Section icon={<FileTextOutlined/>} title="ตั้งค่าการวางบิล">
                                <div className="sa-grid3">
                                    <Item label="ตัดรอบวันที่" error={errors.billingSettings?.cutoffDate} style={{marginBottom: 0}}>
                                        <NumericInputControllerPage
                                            type="number"
                                            controllerName="billingSettings.cutoffDate"
                                            control={control}
                                            placeholder="เช่น 25"
                                        />
                                    </Item>

                                    <Item label="กำหนดชำระภายใน" error={errors.billingSettings?.paymentDueDate} style={{marginBottom: 0}}>
                                        <NumericInputControllerPage
                                            type="number"
                                            controllerName="billingSettings.paymentDueDate"
                                            control={control}
                                            placeholder="เช่น 5"
                                        />
                                    </Item>

                                    <Item label="ค่าปรับวันละ" error={errors.billingSettings?.lateFeePerDay} style={{marginBottom: 0}}>
                                        <NumericInputControllerPage
                                            type="number"
                                            controllerName="billingSettings.lateFeePerDay"
                                            control={control}
                                            placeholder="เช่น 100"
                                        />
                                    </Item>
                                </div>
                            </Section>

                            {/* Slip */}
                            <Section icon={<SafetyCertificateOutlined/>} title="การตรวจสอบ Slip">
                                <Controller
                                    name="isSlipCheckEnabled"
                                    control={control}
                                    render={({field: {onChange, value}}) => (
                                        <Segmented
                                            block
                                            value={value ? 'yes' : 'no'}
                                            onChange={(val) => onChange(val === 'yes')}
                                            options={[
                                                {label: 'เปิดใช้งาน', value: 'yes'},
                                                {label: 'ปิดใช้งาน', value: 'no'},
                                            ]}
                                            style={{padding: 4}}
                                        />
                                    )}
                                />
                            </Section>

                            {/* Submit */}
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    style={{fontWeight: 600, minWidth: 'clamp(140px, 30vw, 200px)'}}
                                >
                                    {isEdit ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    );
}

export default SettingApartment;