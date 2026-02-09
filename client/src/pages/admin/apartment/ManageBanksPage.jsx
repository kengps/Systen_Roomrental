import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, Button, Col, Divider, Form, Input, Row, Select, Space, Typography, Card } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import allThaiBanks from '../../../../bank.json';
// --- Mock Data & Helpers (ใส่ไว้เพื่อให้โค้ดตัวอย่างทำงานได้) ---
const { Text, Title } = Typography;
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
        <Form layout="vertical" onFinish={handleSubmit(onFinish)} style={{ paddingTop: '12px' }}>
            {/* ข้อมูลพื้นฐานของบัญชี */}
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    border: '1px solid #e8f4fd',
                    backgroundColor: '#fafcff'
                }}
            >
                <Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>
                    📋 ข้อมูลบัญชีธนาคาร
                </Title>

                <Form.Item label={<b>เลือกธนาคาร</b>} required validateStatus={errors.bank ? 'error' : ''} help={errors.bank?.message}>
                    <Controller
                        name="bank"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                placeholder="คลิกเพื่อเลือกธนาคาร"
                                size="large"
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
                                        <div style={{ maxHeight: 280, overflowY: 'auto', padding: '8px 16px' }}>
                                            <Row gutter={[16, 16]}>
                                                {allThaiBanks.map((bank) => (
                                                    <Col span={6} key={bank.key}>
                                                        {/* ✨ ปรับปรุงสไตล์ของแต่ละรายการใน Grid */}
                                                        <div
                                                            onClick={() => {
                                                                setValue('bank', bank.key, { shouldValidate: true });
                                                                setIsDropdownOpen(false); // ปิด dropdown เมื่อเลือก
                                                            }}
                                                            style={{
                                                                textAlign: 'center',
                                                                cursor: 'pointer',
                                                                padding: '8px 0',
                                                                borderRadius: '8px',
                                                                transition: 'background-color 0.2s',
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <Avatar size={40} src={`/icons/banks/${bank.key.toUpperCase()}.png`} />
                                                            <Text style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                                                                {bank.thai_name}
                                                            </Text>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
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

                <Form.Item label={<b>เลขที่บัญชีธนาคาร</b>} required validateStatus={errors.accountNumber ? 'error' : ''} help={errors.accountNumber?.message}>
                    <Controller name="accountNumber" control={control} render={({ field }) => <Input {...field} size="large" placeholder="กรอกเฉพาะตัวเลข" />} />
                </Form.Item>

                <Form.Item label={<b>ชื่อบัญชี <Text type="secondary">(ตรงกับหน้าสมุดบัญชี)</Text></b>} required validateStatus={errors.accountName ? 'error' : ''} help={errors.accountName?.message}>
                    <Controller name="accountName" control={control} render={({ field }) => <Input {...field} size="large" placeholder="ชื่อ-นามสกุล เจ้าของบัญชี" />} />
                </Form.Item>
            </Card>

            {/* ข้อมูลสำหรับการเช็ค Slip */}
            <Card
                size="small"
                style={{
                    marginBottom: 20,
                    border: '1px solid #fff2e8',
                    backgroundColor: '#fffbf5'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={5} style={{ margin: 0, color: '#fa8c16' }}>
                        🔍 ข้อมูลสำหรับตรวจสอบสลิป
                    </Title>
                </div>

                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: 16 }}>
                    ข้อมูลเหล่านี้จะใช้สำหรับตรวจสอบสลิปการโอนเงินอัตโนมัติ (ไม่บังคับกรอก)
                </Text>

                <Form.Item
                    label={
                        <b>API Key <Text type="secondary">(สำหรับการตรวจสอบสลิป)</Text></b>
                    }
                    validateStatus={errors.API_KEY ? 'error' : ''}
                    help={errors.API_KEY?.message}
                >
                    <Controller
                        name="API_KEY"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                size="large"
                                placeholder="กรอก API Key จากธนาคาร (ถ้ามี)"
                                style={{ fontFamily: 'monospace' }}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <b>Branch ID <Text type="secondary">(รหัสสาขา)</Text></b>
                    }
                    validateStatus={errors.BRANCH_ID ? 'error' : ''}
                    help={errors.BRANCH_ID?.message}
                >
                    <Controller
                        name="BRANCH_ID"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                size="large"
                                placeholder="กรอกรหัสสาขาธนาคาร (ถ้ามี)"
                                style={{ fontFamily: 'monospace' }}
                            />
                        )}
                    />
                </Form.Item>
            </Card>

            <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
                    {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มบัญชี'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ManageBanksForm;