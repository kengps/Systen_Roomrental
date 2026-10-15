import Icon, {
    CalendarOutlined,
    CopyOutlined,
    DeleteOutlined,
    HomeOutlined,
    PlusOutlined,
    ThunderboltOutlined,
    UserOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import {
    Button,
    Checkbox,
    ConfigProvider,
    Divider,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Table,
    Typography,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import {Controller} from 'react-hook-form';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const {Text} = Typography;
const {Option, OptGroup} = Select;

/* ------------------------------------------------------------------ */
/* Design tokens (ชุดเดียวกับหน้า ListRoom)                            */
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
    water: '#2563EB',
    waterSoft: '#E6EEFF',
    electric: '#B45309',
    electricSoft: '#FEF1DC',
    danger: '#BE123C',
    success: '#15803D',
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

const MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// responsive อยู่ใน CSS แทน window.innerWidth (ไม่ต้อง re-render ตอน resize)
const css = `
.bf-page { background: ${C.page}; padding: clamp(12px, 3vw, 32px); font-family: ${FONT}; color: ${C.ink}; }
.bf-wrap { max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
.bf-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.bf-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.bf-sticky { position: sticky; top: 24px; }
.bf-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.bf-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.bf-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 14px; }
.bf-receipt { padding: 28px; }
.bf-table .ant-table { background: transparent; }
.bf-table .ant-table-thead > tr > th { background: #F7F8FC; font-weight: 600; font-size: 13px; color: ${C.muted}; }
.bf-card-title { display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 700; }
button:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
@media (max-width: 991px) {
    .bf-layout { grid-template-columns: minmax(0, 1fr); }
    .bf-sticky { position: static; }
}
@media (max-width: 575px) {
    .bf-receipt { padding: 16px 12px; }
    .bf-row { font-size: 12px; }
}
@media print {
    .bf-no-print { display: none !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em">
        <path d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z"/>
    </svg>
);
const WaterDropIcon = (props) => <Icon component={WaterDropSvg} {...props} />;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
const PageHeader = ({icon, title, subtitle, action}) => (
    <header
        style={{
            background: C.ink,
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
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
        {action}
    </header>
);

const Section = ({icon, iconBg, iconColor, title, children}) => (
    <section
        style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 0,
        }}
    >
        <div className="bf-card-title">
            {icon && (
                <span
                    style={{
                        width: 36, height: 36, borderRadius: 10, background: iconBg || C.primarySoft,
                        color: iconColor || C.primaryDeep, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 18,
                    }}
                >
                    {icon}
                </span>
            )}
            {title}
        </div>
        {children}
    </section>
);

const Field = ({label, children}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
        <Text style={{fontSize: 13, color: C.muted}}>{label}</Text>
        {children}
    </div>
);

const BillRow = ({label, value, tone}) => {
    const color = tone === 'danger' ? C.danger : tone === 'success' ? C.success : C.ink;
    return (
        <div className="bf-row">
            <span style={{color, wordBreak: 'break-word'}}>{label}</span>
            <span style={{color, fontWeight: 600, whiteSpace: 'nowrap'}}>{value}</span>
        </div>
    );
};

const Rule = ({dashed}) => (
    <div style={{borderTop: `1px ${dashed ? 'dashed' : 'solid'} ${C.line}`, margin: '4px 0'}}/>
);

const baht = (n) => `฿${(Number(n) || 0).toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Utility card (ใช้ร่วมกันทั้งค่าน้ำและค่าไฟ — เดิมเขียนซ้ำ 2 ชุด)     */
/* ------------------------------------------------------------------ */
const UtilityCard = ({kind, title, icon, color, soft, meter, usage, cost, control, getValues, isFormDisabled}) => {
    const isFlat = meter?.billingType === 'flatRate';
    const n = (field) => `utilities.${kind}${field}`;

    return (
        <Section icon={icon} iconBg={soft} iconColor={color} title={title}>
            {isFlat ? (
                <div className="bf-three">
                    <Field label="ค่าบริการ">
                        <Controller
                            name={n('FlatRate')}
                            control={control}
                            render={({field}) => (
                                <InputNumber {...field} prefix="฿" readOnly disabled={isFormDisabled} style={{width: '100%'}}/>
                            )}
                        />
                    </Field>
                    <Field label="ประเภท">
                        <Input value="เหมาจ่าย" readOnly/>
                    </Field>
                    <Field label="จำนวน">
                        <Input value="1 เดือน" readOnly/>
                    </Field>
                </div>
            ) : (
                <div className="bf-three">
                    <Field label="หน่วยก่อนหน้า">
                        <Controller
                            name={n('Previous')}
                            control={control}
                            render={({field}) => (
                                <InputNumber {...field} placeholder="เลขเดิม" readOnly disabled={isFormDisabled} style={{width: '100%'}}/>
                            )}
                        />
                    </Field>
                    <Field label="หน่วยปัจจุบัน">
                        <Controller
                            name={n('Current')}
                            control={control}
                            rules={{
                                validate: (value) =>
                                    Number(value) >= Number(getValues(n('Previous'))) || 'ต้องมากกว่าเลขก่อนหน้า',
                            }}
                            render={({field, fieldState: {error}}) => (
                                <>
                                    <InputNumber
                                        {...field}
                                        placeholder="เลขใหม่"
                                        status={error ? 'error' : ''}
                                        disabled={isFormDisabled}
                                        min={Number(getValues(n('Previous'))) || 0}
                                        style={{width: '100%'}}
                                    />
                                    {error && <Text type="danger" style={{fontSize: 12}}>{error.message}</Text>}
                                </>
                            )}
                        />
                    </Field>
                    <Field label="ราคาต่อหน่วย">
                        <Controller
                            name={n('Rate')}
                            control={control}
                            render={({field}) => (
                                <InputNumber {...field} prefix="฿" readOnly disabled={isFormDisabled} style={{width: '100%'}}/>
                            )}
                        />
                    </Field>
                </div>
            )}

            <div
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: 12, background: soft,
                }}
            >
                <Text style={{fontSize: 14, color: C.ink}}>
                    {isFlat ? 'ค่าบริการ 1 เดือน' : `ใช้ไป ${usage.toLocaleString()} หน่วย`}
                </Text>
                <Text strong style={{fontSize: 18, color}}>{baht(cost)}</Text>
            </div>
        </Section>
    );
};

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
const BillingForm = ({
                         handleNotifyPayment,
                         control,
                         tenantDataForUI,
                         formData,
                         electricMeter,
                         electricCost,
                         total,
                         handleOkBilling,
                         isValid,
                         isFormDisabled,
                         waterMeter,
                         waterCost,
                         waterUsage,
                         setIsServiceModalVisible,
                         isServiceModalVisible,
                         addDiscount,
                         printRef,
                         apartmentInfoForUI,
                         handleAddSelectedServices,
                         setSelectedServices,
                         isOtherSelected,
                         selectedServices,
                         serviceOptions,
                         electricUsage,
                         additionalChargeColumns,
                         getValues,
                         removeDiscount,
                         phones,
                         // เดิมถูกใช้ใน modal แต่ไม่ได้รับเป็น props (จะ error ตอนกด "อื่นๆ") — รับเพิ่มให้แล้ว
                         setIsOtherSelected,
                         otherDescription,
                         setOtherDescription,
                         otherAmount,
                         setOtherAmount,
                     }) => {
    const isWaterPerUnit = waterMeter?.billingType === 'perUnit';
    const isElectricPerUnit = electricMeter?.billingType === 'perUnit';

    /* ---------------- Service modal ---------------- */
    const renderServiceSelectionModal = () => {
        const existingServiceNames = formData.additionalCharges
            .filter((c) => c.type === 'existing')
            .map((c) => c.description);

        const availableServices = serviceOptions.filter((s) => !existingServiceNames.includes(s.name));

        return (
            <Modal
                title="เพิ่มบริการให้ผู้เช่า"
                open={isServiceModalVisible}
                onOk={handleAddSelectedServices}
                onCancel={() => setIsServiceModalVisible(false)}
                okText="เพิ่มบริการที่เลือก"
                cancelText="ยกเลิก"
            >
                <Checkbox.Group
                    style={{width: '100%'}}
                    value={selectedServices}
                    onChange={(checkedValues) => setSelectedServices(checkedValues)}
                >
                    <Space direction="vertical" style={{width: '100%'}}>
                        {availableServices.map((service) => (
                            <Checkbox key={service.name} value={service.name}>
                                {`${service.name} (${service.price.toLocaleString()} บาท)`}
                            </Checkbox>
                        ))}
                    </Space>
                </Checkbox.Group>

                <Divider/>

                <Checkbox checked={isOtherSelected} onChange={(e) => setIsOtherSelected(e.target.checked)}>
                    อื่นๆ (โปรดระบุ)
                </Checkbox>

                {isOtherSelected && (
                    <Space direction="vertical" style={{width: '100%', marginTop: 12}}>
                        <Input
                            placeholder="ระบุชื่อรายการ"
                            value={otherDescription}
                            onChange={(e) => setOtherDescription(e.target.value)}
                        />
                        <InputNumber
                            placeholder="ระบุจำนวนเงิน"
                            prefix="฿"
                            style={{width: '100%'}}
                            value={otherAmount}
                            onChange={(value) => setOtherAmount(value)}
                        />
                    </Space>
                )}
            </Modal>
        );
    };

    /* ---------------- Discount table ---------------- */
    const discountColumns = [
        {
            title: 'รายการ',
            dataIndex: 'description',
            key: 'description',
            render: (_, __, index) => (
                <Controller
                    control={control}
                    name={`discounts.${index}.description`}
                    render={({field}) => <Input {...field} placeholder="ระบุรายการส่วนลด" variant="borderless"/>}
                />
            ),
        },
        {
            title: 'จำนวนเงิน',
            dataIndex: 'amount',
            key: 'amount',
            width: 170,
            render: (_, __, index) => (
                <Controller
                    control={control}
                    name={`discounts.${index}.amount`}
                    render={({field}) => <InputNumber {...field} prefix="฿" placeholder="0" style={{width: '100%'}}/>}
                />
            ),
        },
        {
            // ปุ่มลบ: เดิมรับ removeDiscount มาแต่ไม่ได้ใช้ — ตรวจ signature ให้ตรงกับของคุณด้วย
            title: '',
            key: 'action',
            width: 56,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    aria-label="ลบส่วนลด"
                    icon={<DeleteOutlined/>}
                    disabled={isFormDisabled}
                    onClick={() => removeDiscount(record.id)}
                />
            ),
        },
    ];

    const phoneText = (phones || [])
        .filter((item) => item.number)
        .map((item) => {
            const label = {mobile: 'มือถือ', office: 'สำนักงาน', fax: 'โทร.แฟกซ์'}[item.type] || 'โทร.';
            return `${label} ${item.number}`;
        })
        .join(' • ');

    const isDue = total >= 0;

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            {renderServiceSelectionModal()}

            <div className="bf-page">
                <div className="bf-wrap">

                    {/* Heading */}
                    <PageHeader
                        icon={<HomeOutlined/>}
                        title="ระบบแจ้งชำระเงิน"
                        subtitle="สร้างและแจ้งยอดบิลค่าเช่าสำหรับอพาร์ทเมนท์"
                        action={
                            <Button type="primary" icon={<CopyOutlined/>} onClick={handleNotifyPayment} style={{fontWeight: 600}}>
                                คัดลอก
                            </Button>
                        }
                    />

                    <div className="bf-layout">
                        {/* ============ LEFT: form ============ */}
                        <div className="bf-col">
                            <Section icon={<UserOutlined/>} title="ข้อมูลผู้เช่า">
                                <div className="bf-two">
                                    <Field label="ห้อง / ผู้เช่า">
                                        <Controller
                                            name="tenantId"
                                            control={control}
                                            render={({field}) => (
                                                <Select {...field} placeholder="เลือกห้อง" style={{width: '100%'}}>
                                                    {tenantDataForUI
                                                        ?.filter((t) => !t.isBilled)
                                                        .sort((a, b) => a.roomNumber - b.roomNumber)
                                                        .map((tenant) => (
                                                            <Option key={tenant.id} value={tenant.id}>
                                                                ห้อง {tenant.roomNumber} - {tenant.name}
                                                            </Option>
                                                        ))}

                                                    {tenantDataForUI?.some((t) => t.isBilled) && (
                                                        <OptGroup label={<span style={{color: C.success, fontWeight: 700}}>ออกบิลแล้ว</span>}>
                                                            {tenantDataForUI
                                                                .filter((t) => t.isBilled)
                                                                .sort((a, b) => a.roomNumber - b.roomNumber)
                                                                .map((tenant) => (
                                                                    <Option key={tenant.id} value={tenant.id} disabled>
                                                                        ห้อง {tenant.roomNumber} - {tenant.name}
                                                                    </Option>
                                                                ))}
                                                        </OptGroup>
                                                    )}
                                                </Select>
                                            )}
                                        />
                                    </Field>
                                    <Field label="ค่าเช่าต่อเดือน">
                                        <Controller
                                            name="roomCharges.monthlyRent"
                                            control={control}
                                            render={({field}) => (
                                                <InputNumber {...field} readOnly prefix="฿" style={{width: '100%'}}/>
                                            )}
                                        />
                                    </Field>
                                </div>
                            </Section>

                            <Section icon={<CalendarOutlined/>} title="ประจำเดือน">
                                <div className="bf-two">
                                    <Field label="เดือน">
                                        <Controller
                                            name="billingPeriod.month"
                                            control={control}
                                            render={({field}) => (
                                                <Select {...field} style={{width: '100%'}} placeholder="เลือกเดือน" disabled={isFormDisabled}>
                                                    {MONTHS.map((m) => <Option key={m} value={m}>{m}</Option>)}
                                                </Select>
                                            )}
                                        />
                                    </Field>
                                    <Field label="ปี (พ.ศ.)">
                                        <div
                                            style={{
                                                height: 44, display: 'flex', alignItems: 'center', padding: '0 14px',
                                                borderRadius: 12, background: '#F1F3F9', fontSize: 16, fontWeight: 600,
                                            }}
                                        >
                                            {formData.billingPeriod.year}
                                        </div>
                                    </Field>
                                </div>
                            </Section>

                            <div className="bf-two">
                                <UtilityCard
                                    kind="water"
                                    title="ค่าน้ำ"
                                    icon={<WaterDropIcon/>}
                                    color={C.water}
                                    soft={C.waterSoft}
                                    meter={waterMeter}
                                    usage={waterUsage}
                                    cost={waterCost}
                                    control={control}
                                    getValues={getValues}
                                    isFormDisabled={isFormDisabled}
                                />
                                <UtilityCard
                                    kind="electric"
                                    title="ค่าไฟฟ้า"
                                    icon={<ThunderboltOutlined/>}
                                    color={C.electric}
                                    soft={C.electricSoft}
                                    meter={electricMeter}
                                    usage={electricUsage}
                                    cost={electricCost}
                                    control={control}
                                    getValues={getValues}
                                    isFormDisabled={isFormDisabled}
                                />
                            </div>

                            <div className="bf-two">
                                <Section title="ค่าใช้จ่ายอื่นๆ">
                                    <Table
                                        className="bf-table"
                                        columns={additionalChargeColumns}
                                        dataSource={formData.additionalCharges}
                                        pagination={false}
                                        rowKey="id"
                                        size="small"
                                        scroll={{x: '100%'}}
                                    />
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined/>}
                                        onClick={() => setIsServiceModalVisible(true)}
                                        disabled={isFormDisabled}
                                        block
                                        style={{color: C.primaryDeep, borderColor: '#C7CCF5'}}
                                    >
                                        เพิ่มค่าใช้จ่าย
                                    </Button>
                                </Section>

                                <Section title="ส่วนลด">
                                    <Table
                                        className="bf-table"
                                        columns={discountColumns}
                                        dataSource={formData.discounts}
                                        pagination={false}
                                        rowKey="id"
                                        size="small"
                                        scroll={{x: '100%'}}
                                    />
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined/>}
                                        onClick={addDiscount}
                                        disabled={isFormDisabled}
                                        block
                                        style={{color: C.success, borderColor: '#BBE5C8'}}
                                    >
                                        เพิ่มส่วนลด
                                    </Button>
                                </Section>
                            </div>
                        </div>

                        {/* ============ RIGHT: bill preview ============ */}
                        <div className="bf-sticky">
                            <div ref={printRef}>
                                <div
                                    className="bf-receipt"
                                    style={{
                                        background: C.card, border: `1px solid ${C.line}`, borderRadius: 20,
                                        boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
                                        display: 'flex', flexDirection: 'column', gap: 12,
                                    }}
                                >
                                    {/* Apartment */}
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{fontSize: 18, fontWeight: 700, lineHeight: 1.4}}>
                                            {apartmentInfoForUI.name}
                                        </div>
                                        <div style={{fontSize: 12, color: C.muted, lineHeight: 1.5, wordBreak: 'break-word'}}>
                                            {apartmentInfoForUI.address}
                                        </div>
                                        <div style={{fontSize: 12, color: C.muted, lineHeight: 1.5, wordBreak: 'break-word'}}>
                                            {phoneText || 'ไม่มีเบอร์โทร'}
                                        </div>
                                    </div>

                                    <Rule/>

                                    {/* Title */}
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: C.primaryDeep}}>
                                            <FileTextOutlined aria-hidden="true"/>
                                            ใบแจ้งยอดค่าบริการ
                                        </div>
                                        <div style={{fontSize: 13, color: C.muted, marginTop: 4}}>
                                            วันที่ออก: {dayjs().format('D MMMM BBBB')}
                                        </div>
                                    </div>

                                    {/* Tenant */}
                                    <div
                                        style={{
                                            background: '#F7F8FC', borderRadius: 12, padding: '12px 16px',
                                            display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14,
                                        }}
                                    >
                                        <div className="bf-row" style={{justifyContent: 'flex-start'}}>
                                            <Text strong style={{minWidth: 84}}>ชื่อ</Text>
                                            <span style={{wordBreak: 'break-word'}}>{formData.tenantInfo.name || '-'}</span>
                                        </div>
                                        <div className="bf-row" style={{justifyContent: 'flex-start'}}>
                                            <Text strong style={{minWidth: 84}}>ห้อง</Text>
                                            <span>
                                                {formData.tenantInfo.roomNumber || '-'}
                                                {formData.tenantInfo.floor && ` ชั้น ${formData.tenantInfo.floor}`}
                                            </span>
                                        </div>
                                        <div className="bf-row" style={{justifyContent: 'flex-start'}}>
                                            <Text strong style={{minWidth: 84}}>ประจำเดือน</Text>
                                            <span>{formData.billingPeriod.month} {formData.billingPeriod.year}</span>
                                        </div>
                                    </div>

                                    {/* Lines */}
                                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                                        <BillRow label="ค่าห้อง" value={baht(formData.roomCharges.monthlyRent)}/>
                                        <Rule/>
                                        <BillRow
                                            label={isElectricPerUnit ? `ค่าไฟฟ้า (${electricUsage} หน่วย)` : 'ค่าไฟฟ้า (เหมาจ่าย)'}
                                            value={baht(electricCost)}
                                        />
                                        <BillRow
                                            label={isWaterPerUnit ? `ค่าน้ำ (${waterUsage} หน่วย)` : 'ค่าน้ำ (เหมาจ่าย)'}
                                            value={baht(waterCost)}
                                        />

                                        {formData.additionalCharges.length > 0 && <Rule/>}
                                        {formData.additionalCharges.map((charge) => (
                                            <BillRow key={charge.id} label={charge.description} value={baht(charge.amount)}/>
                                        ))}

                                        {(formData.roomCharges.previousBalance > 0 ||
                                            formData.roomCharges.deposit > 0 ||
                                            formData.discounts.length > 0) && <Rule/>}

                                        {formData.roomCharges.previousBalance > 0 && (
                                            <BillRow tone="danger" label="ค้างชำระ" value={baht(formData.roomCharges.previousBalance)}/>
                                        )}
                                        {formData.roomCharges.deposit > 0 && (
                                            <BillRow tone="success" label="หักมัดจำ" value={`-${baht(formData.roomCharges.deposit)}`}/>
                                        )}
                                        {formData.discounts.map((discount) => (
                                            <BillRow
                                                key={discount.id}
                                                tone="success"
                                                label={discount.description}
                                                value={`-${baht(discount.amount)}`}
                                            />
                                        ))}
                                    </div>

                                    <Rule dashed/>

                                    {/* Total */}
                                    <div
                                        className="billing-total-card"
                                        style={{
                                            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                                            alignItems: 'center', gap: 8, padding: '16px 20px', borderRadius: 16,
                                            background: isDue ? C.primarySoft : '#E7F7EC',
                                            border: `1px solid ${isDue ? '#C7CCF5' : '#B7E4C7'}`,
                                        }}
                                    >
                                        <div>
                                            <div style={{fontSize: 16, fontWeight: 700}}>ยอดชำระรวม</div>
                                            <div style={{fontSize: 12, color: C.muted}}>
                                                {isDue ? '(ยอดเงินที่ต้องได้รับ)' : '(ยอดเงินที่ต้องชำระเพิ่มเติม)'}
                                            </div>
                                        </div>
                                        <div style={{fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: isDue ? C.primaryDeep : C.success}}>
                                            ฿{Math.abs(total).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </div>
                                    </div>

                                    {/* Save (ไม่ติดไปตอนพิมพ์) */}
                                    <Button
                                        className="bf-no-print"
                                        type="primary"
                                        size="large"
                                        block
                                        onClick={handleOkBilling}
                                        disabled={!isValid || isFormDisabled}
                                        style={{fontWeight: 600, marginTop: 4}}
                                    >
                                        บันทึก
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default BillingForm;