import React, { useState, useEffect } from 'react';
import {
    Modal,
    Input,
    Button,
    Typography,
    Space,
    Radio,
    Alert,
    Divider
} from 'antd';
import {
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const { Text } = Typography;
const { TextArea } = Input;

// === Zod schema ===
const cancelSchema = z.object({
    reason: z.string().min(1, 'กรุณาเลือกเหตุผล'),
    customReason: z.string().optional(),
    customNote: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.reason === 'other' && (!data.customReason || !data.customReason.trim())) {
        ctx.addIssue({
            path: ['customReason'],
            code: z.ZodIssueCode.custom,
            message: 'กรุณาระบุเหตุผล'
        });
    }
});


const FlexiblePaymentCancelModal = ({
    visible = true,
    onCancel,
    onConfirm,
    handleCanceledSlip

}) => {
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // === React Hook Form ===
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(cancelSchema),
        defaultValues: {
            reason: '',
            customReason: '',
            customNote: ''
        }
    });

    const selectedReason = useWatch({ control, name: 'reason' });

    const predefinedReasons = [
        { value: 'payment_issue', label: 'ปัญหาการชำระเงิน', description: 'ไม่สามารถชำระผ่านช่องทางที่เลือกได้' },
        { value: 'technical_error', label: 'ปัญหาทางเทคนิค', description: 'พบข้อผิดพลาดในระบบ' },
        { value: 'wrong_amount', label: 'จำนวนเงินไม่ถูกต้อง', description: 'จำนวนเงินที่แสดงไม่ตรงกับที่คาดหวัง' },
        { value: 'wrong_slip', label: 'สลิปโอนไม่ถูกต้อง', description: 'สลิปโอนไม่ถูกต้อง' },
        { value: 'other', label: 'อื่นๆ', description: 'เหตุผลอื่นๆ (กรุณาระบุ)' }
    ];

    const handleCancel = () => {
        reset();
        onCancel?.();
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const cancelData = {
                reason: data.reason,
                description: data.reason === 'other'
                    ? data.customReason
                    : predefinedReasons.find(r => r.value === data.reason)?.label,
                customNote: data.customNote || '',
                timestamp: new Date().toISOString()
            };

            // simulate API
            await new Promise(res => setTimeout(res, 1000));

            onConfirm?.(cancelData);
            console.log('2')
            handleCancel();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        ยกเลิกการชำระเงิน
                    </span>
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            width={isMobile ? '95%' : isTablet ? 500 : 600}
            centered
            style={{ padding: isMobile ? '8px' : '24px' }}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    ย้อนกลับ
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    danger
                    loading={loading}
                    onClick={handleSubmit(onSubmit)}
                >
                    {isMobile ? 'ยืนยัน' : 'ยืนยันการยกเลิก'}
                </Button>
            ]}
        >
            <Alert
                message="กรุณาระบุเหตุผลในการยกเลิก"
                description="ข้อมูลนี้จะช่วยให้เราปรับปรุงบริการให้ดีขึ้น"
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{ marginBottom: isMobile ? 16 : 24 }}
            />

            {/* เหตุผล */}
            <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                <Text strong>เหตุผลในการยกเลิก</Text>
            </div>
            <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                    <Radio.Group {...field} style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {predefinedReasons.map((reason) => (
                                <Radio key={reason.value} value={reason.value}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {reason.label}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {reason.description}
                                        </div>
                                    </div>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                )}
            />
            {errors.reason && (
                <Text type="danger" style={{ fontSize: '12px' }}>
                    {errors.reason.message}
                </Text>
            )}

            {/* Other reason */}
            {selectedReason === 'other' && (
                <div style={{ marginTop: 12 }}>
                    <Text strong>กรุณาระบุเหตุผล</Text>
                    <Controller
                        name="customReason"
                        control={control}
                        render={({ field }) => (
                            <TextArea
                                {...field}
                                placeholder="กรุณาระบุเหตุผล..."
                                rows={isMobile ? 2 : 3}
                                maxLength={200}
                                showCount
                            />
                        )}
                    />
                    {errors.customReason && (
                        <Text type="danger" style={{ fontSize: '12px' }}>
                            {errors.customReason.message}
                        </Text>
                    )}
                </div>
            )}

            <Divider />

            {/* หมายเหตุเพิ่มเติม */}
            <div>
                <Text>หมายเหตุเพิ่มเติม (ไม่บังคับ)</Text>
                <Controller
                    name="customNote"
                    control={control}
                    render={({ field }) => (
                        <TextArea
                            {...field}
                            placeholder="หมายเหตุหรือข้อเสนอแนะเพิ่มเติม..."
                            rows={2}
                            maxLength={150}
                            showCount
                        />
                    )}
                />
            </div>

            <Alert
                message="การยกเลิกจะมีผลทันที"
                description="หากต้องการทำรายการใหม่ กรุณาเริ่มกระบวนการชำระเงินใหม่อีกครั้ง"
                type="warning"
                icon={<ExclamationCircleOutlined />}
                showIcon
                style={{ marginTop: 16 }}
            />
        </Modal>
    );
};

export default FlexiblePaymentCancelModal;
