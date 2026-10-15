import Icon, {
    CalculatorOutlined,
    FileTextOutlined,
    SaveOutlined,
    SettingOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {useQuery} from '@tanstack/react-query';
import {
    Button,
    ConfigProvider,
    Form,
    message,
    Segmented,
    Spin,
} from 'antd';
import {useState, useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {addMeters, getMeters} from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage';

/* ---------- Design tokens ---------- */
const C = {
    ink: '#0F172A',
    raised: '#1E2A4A',
    page: '#F4F5F9',
    card: '#FFFFFF',
    line: '#E6E8F0',
    muted: '#5B6478',
    sunken: '#F7F8FC',
    primary: '#4F46E5',
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    okBg: '#DCFCE7',
    okFg: '#166534',
    okNum: '#15803D',
    badBg: '#FFE4E9',
    badFg: '#9F1239',
    badNum: '#BE123C',
    water: '#2563EB',
    waterSoft: '#E6EEFF',
    electric: '#B45309',
    electricSoft: '#FEF1DC',
    onInkMuted: '#A5B0C6',
    onInkIcon: '#A5B4FC',
    onInkBadge: '#C7D2FE',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: {colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44},
};

const css = `
.mp-root { background: ${C.page}; min-height: 100vh; padding: 24px 16px 48px; font-family: ${FONT}; color: ${C.ink}; }
.mp-wrap { max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.mp-banner { background: ${C.ink}; border-radius: 20px; padding: 24px 28px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.mp-banner-icon { width: 52px; height: 52px; border-radius: 10px; background: ${C.raised}; color: ${C.onInkIcon}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex: none; }
.mp-banner-text { flex: 1 1 240px; min-width: 0; }
.mp-banner-title { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.mp-banner-sub { margin: 4px 0 0; font-size: 14px; color: ${C.onInkMuted}; }
.mp-badge-ink { background: ${C.raised}; color: ${C.onInkBadge}; border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
.mp-tabs { max-width: 420px; width: 100%; margin: 0 auto; }
.mp-section { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px; }
.mp-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.mp-section-icon { width: 36px; height: 36px; border-radius: 10px; background: ${C.primarySoft}; color: ${C.primary}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex: none; }
.mp-section-title { margin: 0; font-size: 16px; font-weight: 700; }
.mp-label { font-size: 14px; font-weight: 600; color: ${C.ink}; }
.mp-center { text-align: center; padding: 48px 0; }
.mp-empty { background: ${C.badBg}; color: ${C.badFg}; border: 1px solid ${C.badFg}33; border-radius: 16px; padding: 14px 16px; font-size: 14px; font-weight: 600; }
.mp-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.mp-fact { background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px; padding: 14px 16px; }
.mp-fact-k { font-size: 13px; color: ${C.muted}; margin-bottom: 4px; }
.mp-fact-v { font-size: 16px; font-weight: 700; color: ${C.ink}; }
.mp-example-title { margin: 0 0 16px; font-size: 15px; font-weight: 700; text-align: center; }
.mp-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.mp-room { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 16px; padding: 16px; text-align: center; }
.mp-room-icon { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 8px; }
.mp-room-line { font-size: 14px; color: ${C.muted}; }
.mp-room-money { font-size: 14px; font-weight: 600; margin-top: 4px; }
.mp-room-money b { font-size: 18px; color: ${C.primary}; }
.mp-note { margin: 16px 0 0; text-align: center; font-size: 14px; font-weight: 600; color: ${C.primarySoftText}; background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; border-radius: 12px; padding: 10px 12px; }
.mp-calc { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 16px; padding: 16px; max-width: 460px; margin: 0 auto; font-size: 14px; line-height: 1.9; }
.mp-calc hr { border: 0; border-top: 1px solid ${C.line}; margin: 8px 0; }
.mp-calc-total { font-size: 17px; font-weight: 700; }
.mp-save { display: flex; justify-content: center; }
.mp-save .ant-btn-primary { max-width: 320px; width: 100%; font-weight: 600; color: #fff; background: ${C.primary}; }
.mp-save .ant-btn-primary:hover { background: ${C.primaryDeep} !important; }
.mp-root .ant-segmented .ant-segmented-item-label { display: flex; align-items: center; justify-content: center; min-height: 36px; }
.mp-root button:focus-visible, .mp-root input:focus-visible, .mp-root .ant-segmented-item-input:focus-visible + .ant-segmented-item-label { outline: 3px solid ${C.primarySoftLine}; outline-offset: 2px; }
@media (max-width: 600px) {
  .mp-banner { padding: 20px; }
  .mp-banner-title { font-size: 22px; }
  .mp-section { padding: 18px; }
}
`;

/* ---------- Icons ---------- */
const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em">
        <path
            d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z"/>
    </svg>
);
const WaterDropIcon = props => <Icon component={WaterDropSvg} {...props} />;

/* ---------- Reusable pieces ---------- */
const Section = ({icon, title, children}) => (
    <section className="mp-section">
        <div className="mp-section-head">
            <span className="mp-section-icon" aria-hidden="true">{icon}</span>
            <h2 className="mp-section-title">{title}</h2>
        </div>
        {children}
    </section>
);

const CalculationExample = ({utilityType, billingType, rate, flatRate}) => {
    const isElectric = utilityType === 'electric';
    const tone = isElectric
        ? {fg: C.electric, bg: C.electricSoft}
        : {fg: C.water, bg: C.waterSoft};
    const icon = isElectric ? <ThunderboltOutlined/> : <WaterDropIcon/>;
    const unitName = isElectric ? 'หน่วย' : 'ยูนิต';
    const utilityName = isElectric ? 'ค่าไฟ' : 'ค่าน้ำ';

    const RoomBox = ({room, used}) => (
        <div className="mp-room">
            <span className="mp-room-icon" style={{background: tone.bg, color: tone.fg}} aria-hidden="true">
                {icon}
            </span>
            <div className="mp-room-line">ห้อง {room} ใช้ไป {used} {unitName}</div>
            <div className="mp-room-money">
                คิดเป็น{utilityName}ที่ต้องจ่าย <b>฿{flatRate || 0}</b>
            </div>
        </div>
    );

    if (billingType === 'flatRate') {
        return (
            <div style={{background: C.sunken, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16}}>
                <h3 className="mp-example-title">ตัวอย่าง: การคิดค่าบริการแบบเหมาจ่าย</h3>
                <div className="mp-grid-2">
                    <RoomBox room="101" used={5}/>
                    <RoomBox room="202" used={20}/>
                </div>
                <p className="mp-note">** ไม่ว่าจะใช้น้อยหรือใช้มาก ก็จะคิดค่าบริการในราคาเดียว **</p>
            </div>
        );
    }

    return (
        <div style={{background: C.sunken, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, textAlign: 'center'}}>
            <h3 className="mp-example-title">ตัวอย่าง: การคิดค่าบริการตามการใช้งานจริง</h3>
            <span className="mp-room-icon" style={{background: tone.bg, color: tone.fg}} aria-hidden="true">
                {icon}
            </span>
            <p style={{margin: '0 0 12px', fontSize: 14, color: C.muted}}>
                สมมติว่าห้อง 101 มีมิเตอร์ก่อนหน้า <b style={{color: C.primary}}>1000</b> และมิเตอร์ล่าสุด{' '}
                <b style={{color: C.primary}}>1025</b>
            </p>
            <div className="mp-calc" style={{textAlign: 'left'}}>
                จำนวนที่ใช้: 1025 - 1000 = <b style={{color: C.okNum}}>25 {unitName}</b><br/>
                อัตราค่าบริการ: <b style={{color: C.primarySoftText}}>฿{rate || 0} / {unitName}</b>
                <hr/>
                <span className="mp-calc-total">
                    รวมค่าบริการ: 25 * {rate || 0} ={' '}
                    <span style={{color: C.badNum}}>฿{(25 * (rate || 0)).toLocaleString()}</span>
                </span>
            </div>
        </div>
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
            icon: <ThunderboltOutlined style={{color: C.electric}}/>,
        },
        water: {
            label: 'ค่าน้ำ',
            icon: <WaterDropIcon style={{color: C.water}}/>,
        },
    };

    const tabLabel = (key) => (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
            {utilityConfig[key].icon}
            <span>{utilityConfig[key].label}</span>
        </div>
    );

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="mp-root">
                <div className="mp-wrap">
                    {/* PageHeader */}
                    <header className="mp-banner">
                        <div className="mp-banner-icon" aria-hidden="true"><ThunderboltOutlined/></div>
                        <div className="mp-banner-text">
                            <h1 className="mp-banner-title">ตั้งค่าการคิดค่าน้ำ-ค่าไฟ</h1>
                            <p className="mp-banner-sub">กำหนดอัตราคำนวณค่าน้ำและค่าไฟสำหรับอพาร์ทเมนท์</p>
                        </div>
                        <span className="mp-badge-ink">
                            กำลังตั้งค่า: {utilityConfig[activeUtility].label}
                        </span>
                    </header>

                    <div className="mp-tabs">
                        <Segmented
                            block
                            options={[
                                {label: tabLabel('electric'), value: 'electric'},
                                {label: tabLabel('water'), value: 'water'},
                            ]}
                            value={activeUtility}
                            onChange={setActiveUtility}
                        />
                    </div>

                    {isLoading ? (
                        <div className="mp-center">
                            <Spin size="large"/>
                        </div>
                    ) : !metersData?.length ? (
                        <Section
                            icon={<FileTextOutlined/>}
                            title={`(${activeUtility === 'electric' ? 'ค่าไฟฟ้า' : 'ค่าน้ำ'}) ปัจจุบันที่กำหนดไว้`}
                        >
                            <div className="mp-empty" role="status">ยังไม่ได้กำหนดค่าใดๆ</div>
                        </Section>
                    ) : (
                        <Section
                            icon={<FileTextOutlined/>}
                            title={`ค่าบริการที่ตั้งไว้ปัจจุบัน (${utilityConfig[activeUtility].label})`}
                        >
                            {currentUtility ? (
                                <div className="mp-facts">
                                    <div className="mp-fact">
                                        <div className="mp-fact-k">วิธีคำนวณ</div>
                                        <div className="mp-fact-v">
                                            {currentUtility.billingType === 'perUnit' ? 'คิดตามหน่วยที่ใช้' : 'เหมาจ่ายรายเดือน'}
                                        </div>
                                    </div>
                                    <div className="mp-fact">
                                        <div className="mp-fact-k">อัตรา</div>
                                        <div className="mp-fact-v">
                                            {currentUtility.billingType === 'perUnit'
                                                ? `${currentUtility.rate} บาท / หน่วย`
                                                : `${currentUtility.flatRate} บาท / เดือน`}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mp-empty" role="status">ยังไม่ได้กำหนดค่านี้</div>
                            )}
                        </Section>
                    )}

                    <Form onFinish={handleSubmit(onFinish)} layout="vertical">
                        <Section
                            icon={<SettingOutlined/>}
                            title={`ตั้งค่า${utilityConfig[activeUtility].label}`}
                        >
                            <Form.Item
                                label={<span className="mp-label">เลือกวิธีการคำนวณ</span>}
                                style={{marginBottom: 20}}
                            >
                                <Controller
                                    name="billingType"
                                    control={control}
                                    render={({field}) => (
                                        <Segmented
                                            {...field}
                                            block
                                            options={[
                                                {label: 'คิดตามหน่วยที่ใช้', value: 'perUnit'},
                                                {label: 'เหมาจ่ายรายเดือน', value: 'flatRate'},
                                            ]}
                                        />
                                    )}
                                />
                            </Form.Item>

                            {selectedBillingType === 'perUnit' && (
                                <Form.Item
                                    label={<span className="mp-label">อัตราค่าบริการต่อหน่วย</span>}
                                    style={{marginBottom: 20}}
                                >
                                    <NumericInputControllerPage
                                        type="number"
                                        controllerName="rate"
                                        control={control}
                                        addonAfter="บาท / หน่วย"
                                        prefix="฿"
                                    />
                                </Form.Item>
                            )}

                            {selectedBillingType === 'flatRate' && (
                                <Form.Item
                                    label={<span className="mp-label">ค่าบริการเหมาจ่าย</span>}
                                    style={{marginBottom: 20}}
                                >
                                    <NumericInputControllerPage
                                        type="number"
                                        controllerName="flatRate"
                                        control={control}
                                        addonAfter="บาท / เดือน"
                                        prefix="฿"
                                    />
                                </Form.Item>
                            )}

                            <div className="mp-section-head" style={{margin: '8px 0 16px'}}>
                                <span className="mp-section-icon" aria-hidden="true"><CalculatorOutlined/></span>
                                <h3 className="mp-section-title">วิธีการคำนวณ</h3>
                            </div>

                            <CalculationExample
                                utilityType={activeUtility}
                                billingType={selectedBillingType}
                                rate={currentRate}
                                flatRate={currentFlatRate}
                            />
                        </Section>

                        <div className="mp-save" style={{marginTop: 24}}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined/>}
                            >
                                บันทึกการตั้งค่า{utilityConfig[activeUtility].label}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    );
}