
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Input,
    InputNumber,
    Button,
    Typography,
    Space,
    Divider,
    Card,
    Row,
    Col,
    Alert,
    Table,
    Tag,
    Statistic
} from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Zod Schema
const partialPaymentSchema = z.object({
    paymentAmount: z.number()
        .min(1, 'จำนวนเงินต้องมากกว่า 0')
        .max(999999, 'จำนวนเงินไม่เกิน 999,999 บาท'),
    paymentMethod: z.string().min(1, 'กรุณาเลือกวิธีการชำระ'),
    reference: z.string().optional(),
    description: z.string().optional()
});

const FlexiblePaymentModal = ({
    visible,
    onCancel,
    onConfirm,
    billData = {
        billNumber: 'B-2024-001',
        totalAmount: 5000,
        paidAmount: 3000,
        remainingAmount: 2000,
        dueDate: '2024-02-15',
        slipAmount: 1200, // ยอดจากสลิป
        paymentHistory: [
            { id: 1, amount: 2000, method: 'transfer', date: '2024-01-15', reference: 'TXN123' },
            { id: 2, amount: 1000, method: 'cash', date: '2024-01-20', reference: '' }
        ]
    },
    paymentData,
    slipResult
}) => {
   

    







    const [loading, setLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(billData.slipAmount || 0);

    const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
        resolver: zodResolver(partialPaymentSchema),
        defaultValues: {
            paymentAmount: 0,
            paymentMethod: 'transfer',
            reference: '',
            description: ''
        }
    });

    useEffect(() => {
        if (slipResult?.amount) {
            setValue('paymentAmount', slipResult?.amount);
        }
    }, [slipResult?.amount, setValue]);




    const watchedPaymentAmount = watch('paymentAmount');


    const newPaidAmount = paymentData?.billId?.paidAmount + watchedPaymentAmount;

    const newRemainingAmount = (paymentData?.billId?.totalAmount + paymentData?.billId?.penaltyAmount) - newPaidAmount;


    const isFullPayment = newRemainingAmount <= 0;



    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await onConfirm({
                ...data,
                billId: paymentData?.billId._id,
                billNumber: paymentData?.billId.billNumber,
                paymentId: paymentData.paymentId,
                tenant: paymentData.tenantInfo.id,
                isFullPayment: newRemainingAmount <= 0,
                newPaidAmount,
                newRemainingAmount: Math.max(0, newRemainingAmount)
            });
            reset();
        } catch (error) {
            console.error('Error processing payment:', error);
        } finally {
            setLoading(false);
        }
    };




    const handleCancel = () => {
        reset();
        onCancel();
    };

    // Payment history columns
    const historyColumns = [
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount?.toLocaleString()} บาท`,
            align: 'right'
        },
        {
            title: 'วิธีชำระ',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                const methodMap = {
                    'cash': { text: 'เงินสด', color: 'green' },
                    'transfer': { text: 'โอนเงิน', color: 'blue' },
                    'card': { text: 'บัตร', color: 'purple' },
                    'cheque': { text: 'เช็ค', color: 'orange' }
                };
                const methodData = methodMap[method] || { text: method, color: 'default' };
                return <Tag color={methodData.color}>{methodData.text}</Tag>;
            }
        },
        {
            title: 'อ้างอิง',
            dataIndex: 'reference',
            key: 'reference',
            render: (ref) => ref || '-'
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <DollarOutlined />
                    ยืนยันการชำระ
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            width={700}
            footer={null}
        >
            <div>
                {/* Bill Summary */}
                <Card size="small" className="mb-4">
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic
                                title="เลขที่บิล"
                                value={paymentData?.billId?.billNumber}
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="ยอดรวม"
                                value={paymentData?.billId?.totalAmount + paymentData?.billId?.penaltyAmount}
                                suffix="บาท"
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="จ่ายแล้ว"
                                value={paymentData?.billId?.paidAmount}
                                suffix="บาท"
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="คงเหลือ"
                                value={paymentData?.billId?.remainingAmount}
                                suffix="บาท"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Current Payment Info */}
                <Card
                    title={
                        <Space>

                            ข้อมูลการชำระครั้งนี้
                        </Space>
                    }
                    size="small"
                    className="mb-4"
                >
                    <Row gutter={16} align="middle">
                        {slipResult && (
                            <Col span={8}>
                                <Text strong>ยอดจากสลิป: </Text>
                                <Text type="success">{slipResult?.amount?.toLocaleString()} บาท</Text>
                            </Col>
                        )}
                        <Col span={8}>
                            <Text strong>จะชำระ: </Text>
                            <Text className={watchedPaymentAmount > billData?.remainingAmount ? 'text-red-600' : 'text-blue-600'}>
                                {watchedPaymentAmount?.toLocaleString() || 0} บาท
                            </Text>
                        </Col>
                        <Col span={8}>
                            <Text strong>คงเหลือหลังจ่าย: </Text>
                            <Text className={newRemainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}>
                                {Math.max(0, newRemainingAmount).toLocaleString()} บาท
                            </Text>
                        </Col>
                    </Row>

                    {isFullPayment && (
                        <Alert
                            type="success"
                            message="การชำระครั้งนี้จะทำให้ชำระครบทั้งหมด"
                            showIcon
                            className="mt-3"
                        />
                    )}

                    {watchedPaymentAmount > paymentData?.billId?.remainingAmount && (
                        <Alert
                            type="warning"
                            message={`จำนวนชำระเกินมา ${(watchedPaymentAmount - paymentData?.billId?.remainingAmount).toLocaleString()} บาท`}
                            showIcon
                            className="mt-3"
                        />
                    )}
                </Card>

                <Divider>รายละเอียดการชำระ</Divider>

                {/* Payment Amount */}
                <Row gutter={16}>
                    <Col span={12}>
                        <div className="mb-4">
                            <Text strong>จำนวนเงินที่ชำระ (บาท) *</Text>
                            {errors.paymentAmount && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.paymentAmount.message}
                                </div>
                            )}
                            <Controller
                                name="paymentAmount"
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        {...field}
                                        disabled={!!slipResult} // ✅ ปิด input ถ้ามี slipResult
                                        style={{ width: '100%' }}
                                        min={1}
                                        max={999999}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="กรอกจำนวนเงิน"
                                        className="mt-2"
                                        status={errors.paymentAmount ? 'error' : ''}
                                        size="large"
                                    />

                                )}
                            />

                        </div>
                    </Col>

                    <Col span={12}>
                        <div className="mb-4">
                            <Text strong>วิธีการชำระ *</Text>
                            <Controller
                                name="paymentMethod"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="transfer">โอนเงิน</option>
                                        <option value="cash">เงินสด</option>
                                        {/* <option value="card">บัตรเครดิต/เดบิต</option>
                                        <option value="cheque">เช็ค</option> */}
                                    </select>
                                )}
                            />
                        </div>
                    </Col>
                </Row>

                {/* Reference & Description */}
                <Row gutter={16}>
                    <Col span={12}>
                        <div className="mb-4">
                            <Text strong>เลขที่อ้างอิง</Text>
                            <Controller
                                name="reference"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="เลขที่อ้างอิง (ถ้ามี)"
                                        className="mt-2"
                                    />
                                )}
                            />
                        </div>
                    </Col>

                    <Col span={12}>
                        <div className="mb-4">
                            <Text strong>หมายเหตุ</Text>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="หมายเหตุ (ถ้ามี)"
                                        className="mt-2"
                                    />
                                )}
                            />
                        </div>
                    </Col>
                </Row>

                {/* Payment History */}
                {paymentData?.billId?.paymentHistory && paymentData?.billId?.paymentHistory.length > 0 && (
                    <>
                        <Divider>ประวัติการชำระ</Divider>
                        <Table
                            columns={historyColumns}
                            dataSource={paymentData?.billId?.paymentHistory}
                            pagination={false}
                            size="small"
                            scroll={{ y: 200 }}
                            rowKey="id" // Change this from "flexiblePayment" to "id"
                        />
                    </>
                )}

                {/* Footer Buttons */}
                <Divider />
                <Row justify="end">
                    <Space>
                        <Button onClick={handleCancel}>
                            ยกเลิก
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit(onSubmit)}
                            loading={loading}
                            icon={isFullPayment ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                            size="large"
                        >
                            {isFullPayment ? 'ยืนยัน' : 'ยืนยัน'}
                        </Button>
                    </Space>
                </Row>
            </div>
        </Modal>
    );
};

export default FlexiblePaymentModal 