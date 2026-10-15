import { zodResolver } from '@hookform/resolvers/zod';
import { BankOutlined, ScanOutlined } from '@ant-design/icons';
import { Avatar, Button, ConfigProvider, Form, Input, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import allThaiBanks from '../../../../bank.json';
// --- Mock Data & Helpers (ใส่ไว้เพื่อให้โค้ดตัวอย่างทำงานได้) ---
const { Text } = Typography;
const { Option } = Select;

const banksMap = new Map(allThaiBanks.map(bank => [bank.key, bank]));
const bankAccountSchema = z.object({
    bank: z.string({ required_error: 'กรุณาเลือกธนาคาร' }).nonempty('กรุณาเลือกธนาคาร'),
    accountNumber: z.string().nonempty('กรุณากรอกเลขที่บัญชี').min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก'),
    accountName: z.string().nonempty('กรุณากรอกชื่อบัญชี'),
    API_KEY: z.string().optional(),
    BRANCH_ID: z.number().optional()
});
// --- จบส่วน Mock Data ---

/* ---------- Design tokens ---------- */
const C = {
    ink: '#0F172A',
    line: '#E6E8F0',
    muted: '#5B6478',
    sunken: '#F7F8FC',
    primary: '#4F46E5',
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.mbf { font-family:${FONT}; padding-top:12px; display:flex; flex-direction:column; gap:16px; }
.mbf-section { background:#fff; border:1px solid ${C.line}; border-radius:20px; padding:24px; }
.mbf-section-head { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.mbf-section-icon { width:36px; height:36px; border-radius:10px; background:${C.primarySoft}; color:${C.primary}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.mbf-section-title { margin:0; font-size:16px; font-weight:700; color:${C.ink}; }
.mbf-hint { display:block; font-size:13px; color:${C.muted}; margin-bottom:16px; }
.mbf-label { font-weight:600; color:${C.ink}; }
.mbf-mono { font-family:ui-monospace,Menlo,monospace; }
.mbf-submit.ant-btn { font-weight:600; }

.mbf-bank-grid { max-height:280px; overflow-y:auto; padding:8px 12px; display:grid; grid-template-columns:repeat(auto-fill, minmax(92px, 1fr)); gap:8px; }
.mbf-bank { background:transparent; border:1px solid transparent; border-radius:12px; padding:8px 4px; cursor:pointer; text-align:center; font-family:${FONT}; }
.mbf-bank:hover { background:${C.sunken}; border-color:${C.line}; }
.mbf-bank.is-on { background:${C.primarySoft}; border-color:${C.primarySoftLine}; }
.mbf-bank:focus-visible { outline:3px solid ${C.primarySoftLine}; outline-offset:2px; }
.mbf-bank-name { display:block; margin-top:8px; font-size:12px; color:${C.ink}; }

@media (max-width: 600px) {
  .mbf-section { padding:16px; }
}
`;

const Section = ({ icon, title, children }) => (
    <section className="mbf-section">
        <div className="mbf-section-head">
            <div className="mbf-section-icon" aria-hidden="true">{icon}</div>
            <h3 className="mbf-section-title">{title}</h3>
        </div>
        {children}
    </section>
);

const label = (main, hint) => (
    <span className="mbf-label">{main}{hint && <> <Text type="secondary">{hint}</Text></>}</span>
);

// ✨ ผมขออนุญาตเปลี่ยนชื่อเป็น ManageBanksForm เพื่อให้สื่อว่าเป็นฟอร์มโดยเฉพาะ
const ManageBanksForm = ({ onFinish, initialValues }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const {
        control,
        handleSubmit,
        reset,
        watch, // เพิ่ม watch เพื่อติดตามค่าในฟอร์ม
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(bankAccountSchema),
        defaultValues: initialValues || { bank: '', accountNumber: '', accountName: '' },
    });

    // ติดตามค่าของ field 'bank' เพื่อนำไปแสดงผล
    const selectedBankKey = watch('bank');
    const selectedBankInfo = banksMap.get(selectedBankKey);

    // อัปเดตฟอร์มเมื่อ initialValues เปลี่ยน
    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
        } else {
            reset({ bank: '', accountNumber: '', accountName: '' });
        }
    }, [initialValues, reset]);

    const isEditing = !!initialValues;

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <Form layout="vertical" onFinish={handleSubmit(onFinish)} className="mbf">
                {/* ข้อมูลพื้นฐานของบัญชี */}
                <Section icon={<BankOutlined />} title="ข้อมูลบัญชีธนาคาร">
                    <Form.Item label={label('เลือกธนาคาร')} required validateStatus={errors.bank ? 'error' : ''} help={errors.bank?.message}>
                        <Controller
                            name="bank"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="คลิกเพื่อเลือกธนาคาร"
                                    open={isDropdownOpen}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    value={selectedBankKey || undefined}
                                    // ✨ ปรับปรุงการแสดงผลของรายการที่ถูกเลือกในช่อง Input
                                    {...(selectedBankInfo && {
                                        labelRender: () => (
                                            <Space>
                                                <Avatar size="small" src={`/icons/banks/${selectedBankInfo.key.toUpperCase()}.png`} />
                                                {selectedBankInfo.thai_name}
                                            </Space>
                                        )
                                    })}
                                    popupRender={(menu) => (
                                        <>
                                            <div className="mbf-bank-grid">
                                                {allThaiBanks.map((bank) => (
                                                    <button
                                                        type="button"
                                                        key={bank.key}
                                                        className={`mbf-bank${selectedBankKey === bank.key ? ' is-on' : ''}`}
                                                        aria-label={bank.thai_name}
                                                        aria-pressed={selectedBankKey === bank.key}
                                                        onClick={() => {
                                                            setValue('bank', bank.key, { shouldValidate: true });
                                                            setIsDropdownOpen(false); // ปิด dropdown เมื่อเลือก
                                                        }}
                                                    >
                                                        <Avatar size={40} src={`/icons/banks/${bank.key.toUpperCase()}.png`} />
                                                        <span className="mbf-bank-name">{bank.thai_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ display: 'none' }}>{menu}</div>
                                        </>
                                    )}
                                >
                                    {allThaiBanks.map((bank) => (<Option key={bank.key} value={bank.key}>{bank.thai_name}</Option>))}
                                </Select>
                            )}
                        />
                    </Form.Item>

                    <Form.Item label={label('เลขที่บัญชีธนาคาร')} required validateStatus={errors.accountNumber ? 'error' : ''} help={errors.accountNumber?.message}>
                        <Controller name="accountNumber" control={control} render={({ field }) => <Input {...field} placeholder="กรอกเฉพาะตัวเลข" />} />
                    </Form.Item>

                    <Form.Item label={label('ชื่อบัญชี', '(ตรงกับหน้าสมุดบัญชี)')} required validateStatus={errors.accountName ? 'error' : ''} help={errors.accountName?.message} style={{ marginBottom: 0 }}>
                        <Controller name="accountName" control={control} render={({ field }) => <Input {...field} placeholder="ชื่อ-นามสกุล เจ้าของบัญชี" />} />
                    </Form.Item>
                </Section>

                {/* ข้อมูลสำหรับการเช็ค Slip */}
                <Section icon={<ScanOutlined />} title="ข้อมูลสำหรับตรวจสอบสลิป">
                    <Text className="mbf-hint">
                        ข้อมูลเหล่านี้จะใช้สำหรับตรวจสอบสลิปการโอนเงินอัตโนมัติ (ไม่บังคับกรอก)
                    </Text>

                    <Form.Item
                        label={label('API Key', '(สำหรับการตรวจสอบสลิป)')}
                        validateStatus={errors.API_KEY ? 'error' : ''}
                        help={errors.API_KEY?.message}
                    >
                        <Controller
                            name="API_KEY"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    className="mbf-mono"
                                    placeholder="กรอก API Key จากธนาคาร (ถ้ามี)"
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={label('Branch ID', '(รหัสสาขา)')}
                        validateStatus={errors.BRANCH_ID ? 'error' : ''}
                        help={errors.BRANCH_ID?.message}
                        style={{ marginBottom: 0 }}
                    >
                        <Controller
                            name="BRANCH_ID"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    className="mbf-mono"
                                    placeholder="กรอกรหัสสาขาธนาคาร (ถ้ามี)"
                                />
                            )}
                        />
                    </Form.Item>
                </Section>

                <Button className="mbf-submit" type="primary" htmlType="submit" block loading={isSubmitting}>
                    {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มบัญชี'}
                </Button>
            </Form>
        </ConfigProvider>
    );
};

export default ManageBanksForm;