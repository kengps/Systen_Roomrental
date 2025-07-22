import { CheckCircleFilled, ClockCircleFilled, CloseOutlined, FileTextOutlined, RightOutlined, WarningFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Drawer, Flex, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploadPreviewModal from '../../../components/form/FileUploadContext/FileUploadPreviewModal';
import { listBillingTenant } from '../../../service/api/tenants/informations.api';
import { useFileUploadContext } from '../../../service/context/FileUploadContext';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';

const { Title, Text } = Typography;

// --- Helper Functions ---

const getThaiMonthName = (monthNumber) => {
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return months[monthNumber - 1] || '';
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'paid':
        case 'completed':
            return {
                text: 'ชำระเงินแล้ว',
                color: 'success',
                icon: <CheckCircleFilled />
            };
        case 'pending':
            return {
                text: 'รอการชำระ',
                color: 'warning',
                icon: <ClockCircleFilled />
            };
        default:
            return {
                text: status,
                color: 'default',
                icon: <WarningFilled />
            };
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const calculateFine2 = (
    today,
    billDateStr,
    lateFeePerDay,
    cutoffDate,
    paymentDueDateApartment
) => {
    // 👀 ตรวจสอบ cutoffDate ว่าเป็นตัวเลขและอยู่ในช่วงที่สมเหตุสมผล
    const parsedCutoffDate = Number(cutoffDate);
    if (isNaN(parsedCutoffDate) || parsedCutoffDate < 1 || parsedCutoffDate > 31) {
        console.error('❌ cutoffDate is invalid:', cutoffDate);
        return 0;
    }
    // ✅ สร้าง fullDate ปลอดภัย
    const fullDate = dayjs().date(parsedCutoffDate);

    // เช็กว่า fullDate valid หรือไม่
    if (!fullDate.isValid()) {

        return 0;
    }

    const isoString = fullDate.toISOString();


    // วันที่ออกบิล
    const billDate = dayjs(billDateStr);



    if (!billDate.isValid()) {
        console.error('❌ billDateStr is invalid:', billDateStr);
        return 0;
    }

    // วันที่ครบกำหนด (ถัดไปอีกเดือน แล้วใช้วันที่ที่ apartment กำหนด)
    const gracePeriodEnd = billDate.add(1, 'month').date(paymentDueDateApartment);



    // ถ้าเลย grace period → คิดค่าปรับ
    if (today.isAfter(gracePeriodEnd, 'day')) {
        const daysLate = today.diff(gracePeriodEnd, 'day');

        return lateFeePerDay * daysLate;
    }

    // ยังไม่เกินกำหนด → ไม่คิดค่าปรับ
    return 0;
};

const calculateFine = (today, billDate, lateFeePerDay, cutoffDayNumber, paymentDueDate) => {

    const morkDate = dayjs('2025-07-06T09:06:04.936Z')


    // หา cutoffDate ล่าสุด
    let lastCutoffDate = today.date(cutoffDayNumber);





    if (today.date() < cutoffDayNumber) {
        // ถ้าวันนี้ < cutoffDate → cutoffDate ล่าสุดเป็นของเดือนก่อน
        lastCutoffDate = lastCutoffDate.subtract(1, 'month');
    }


    const gracePeriodEnd = lastCutoffDate.add(1, 'month').date(paymentDueDate);

    // ตรวจสอบว่า gracePeriodEnd เป็นวันที่ที่ถูกต้อง เช่น 31/02 จะกลายเป็น invalid
    if (!gracePeriodEnd.isValid()) {
        return 0;
    }




    if (today.isAfter(gracePeriodEnd, 'day')) {
        console.log("⩇⩇:⩇⩇🚨 ~ calculateFine ~ today.isAfter(gracePeriodEnd, 'day') :", today.isAfter(gracePeriodEnd, 'day'));

        // วันปัจจุบันเลย grace period แล้ว → เริ่มคิดค่าปรับ
        const daysLate = today.diff(gracePeriodEnd, 'day');
        console.log(`⩇⩇:⩇⩇🚨 ~ calculateFine ~ daysLate :`, daysLate);

        // ✅ ไม่ให้ค่าปรับติดลบ
        const safeDaysLate = Math.max(0, daysLate);

        return lateFeePerDay * safeDaysLate;
    }

    // ยังอยู่ใน grace period → ไม่คิดค่าปรับ
    return 0;
};


// --- Main Component ---
export const PayMent = () => {
    const { user } = persistMiddleware();
    const accountId = user.userPayLoad.user.id;
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['listBilling', accountId],
        queryFn: () => listBillingTenant(accountId),
        select: (data) => data.data.result,
    });






    const { previewUrl, setPreviewUrl } = useFileUploadContext();




    const [open, setOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const today = dayjs(); // วันปัจจุบัน






    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', margin: '50px' }}><Spin size="large" /></div>;
    }

    if (isError) {
        return <Alert message="เกิดข้อผิดพลาดในการโหลดข้อมูล" description={error.message} type="error" showIcon />;
    }

    if (!data || data.length === 0) {






        return (
            <div style={{ maxWidth: '800px', margin: '24px auto', textAlign: 'center' }}>
                <Card>
                    <FileTextOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
                    <Title level={5} style={{ marginTop: '16px' }}>ไม่พบรายการบิล</Title>
                    <Text type="secondary">ยังไม่มีบิลค่าเช่าสำหรับคุณในขณะนี้</Text>
                </Card>
            </div>
        )
    }



    const paymentDueDateApartment = selectedBill?.apartment?.billingSettings?.paymentDueDate
    const settings = selectedBill?.apartment?.billingSettings;

    // let fineAmount = 0;
    // if (selectedBill && settings && settings.cutoffDate != null && paymentDueDateApartment != null) {
    //     fineAmount = calculateFine(
    //         today,
    //         selectedBill.billDate,
    //         settings.lateFeePerDay,
    //         settings.cutoffDate,
    //         paymentDueDateApartment
    //     );
    // }

const fineAmount = useMemo(() => {
  if (!selectedBill) return 0;
  const settings = selectedBill.apartment?.billingSettings;
  if (!settings || settings.cutoffDate == null || !settings.paymentDueDate) return 0;

  return Math.max(0, calculateFine(
    dayjs(), 
    selectedBill.billDate, 
    settings.lateFeePerDay, 
    settings.cutoffDate, 
    settings.paymentDueDate
  ));
}, [selectedBill]);


    const totalWithFine = selectedBill?.remainingAmount + Math.max(0, fineAmount);
    console.log(`⩇⩇:⩇⩇🚨 ~ PayMent ~ totalWithFine :`, totalWithFine);



    const onClose = () => {
        setOpen(false);
        setSelectedBill(null);
    };

    const showDrawer = (bill) => {
        setSelectedBill(bill);
        setOpen(true);
    };


    // Table columns for bill items
    const itemColumns = [
        {
            title: 'รายการ',
            dataIndex: 'categoryName',
            key: 'categoryName',
            width: '25%'
        },
        {
            title: 'รายละเอียด',
            dataIndex: 'description',
            key: 'description',
            width: '35%',
            render: (description, record) => {
                // แสดงรายละเอียดพิเศษสำหรับค่าน้ำและค่าไฟที่มีหน่วยก่อนหน้าและปัจจุบัน
                if (record.previousUnit && record.currentUnit) {
                    return (
                        <div>
                            <div>{description}</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                หน่วยก่อนหน้า: {record.previousUnit} → ปัจจุบัน: {record.currentUnit}
                            </Text>
                        </div>
                    );
                }

                return description;
            }
        },
        {
            title: 'จำนวน',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '10%',
            align: 'center',
            render: (quantity, record) => `${quantity} ${record.unit}`
        },
        {
            title: 'ราคา/หน่วย',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: '15%',
            align: 'right',
            render: (price) => (
                <Text style={{ color: price < 0 ? '#52c41a' : 'inherit' }}>
                    {formatCurrency(price)}
                </Text>
            )
        },
        {
            title: 'จำนวนเงิน',
            dataIndex: 'amount',
            key: 'amount',
            width: '15%',
            align: 'right',
            render: (amount, record) => (
                <Text style={{ color: amount < 0 ? '#52c41a' : 'inherit' }}>
                    {formatCurrency(amount)}
                </Text>
            )
        }
    ];
    const todays = dayjs().format('D')
    const paymentDueDate = selectedBill?.apartment.billingSettings.paymentDueDate




    const handleBillClick = (billId) => {

        const payload = {
            paymentId: `PAY-${Date.now()}`, // generate id
            receiptCode: `REC-${dayjs().format("YYYYMMDDHHmmss")}`,
            bill: selectedBill._id,
            tenant: selectedBill.tenant,
            paymentDate: new Date().toISOString(),
            amount: selectedBill?.totalAmount, // ยอดรวม + ค่าปรับถ้ามี
            fineAmount: fineAmount,
            totalAmount: totalWithFine,
            paymentMethod: "transfer", // สมมติใช้โอน
            paymentStatus: "completed",
            description: `ชำระบิลเดือน ${getThaiMonthName(selectedBill.billingPeriod.month)}/${selectedBill.billingPeriod.year}`,
            reference: "เลขสลิป/อ้างอิงที่กรอก",
            paidItems: selectedBill.items.map((item) => ({
                itemId: item.itemId,
                categoryName: item.categoryName,
                paidAmount: item.amount
            })),
            attachments: previewUrl, // 👈 ใช้ previewUrl หรือ key จาก S3
            createdBy: user.userPayLoad.user.id,
        };

        console.log("🚀 Payment Payload:", payload);


        // navigate(`/payment/bill/${billId}`);
    };
    return (
        <div style={{ background: '#f0f2f5', padding: '24px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: '#e9ecef', padding: '12px 24px', borderRadius: '8px', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                        <FileTextOutlined style={{ marginRight: '8px' }} />
                        บิลค่าเช่า
                    </Title>
                </div>

                <Space direction="vertical" style={{ width: '100%' }}>
                    {data.map((bill) => {
                        const statusInfo = getStatusInfo(bill.status);
                        const monthName = getThaiMonthName(bill.billingPeriod.month);

                        return (
                            <Card
                                key={bill._id}
                                hoverable
                                style={{ width: '100%' }}
                                styles={{ body: { padding: '16px 24px' } }}
                                //bodyStyle={{ padding: '16px 24px' }}
                                onClick={() => showDrawer(bill)}
                            >
                                <Flex justify="space-between" align="center">
                                    <div>
                                        <Text strong>
                                            บิลค่าเช่า เดือน {monthName}/{bill.billingPeriod.year}
                                        </Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <Tag icon={statusInfo.icon} color={statusInfo.color}>
                                                {statusInfo.text}
                                            </Tag>
                                            <Text type="secondary" style={{ marginLeft: '8px' }}>
                                                {formatCurrency(bill.totalAmount)}
                                            </Text>
                                        </div>
                                    </div>
                                    <RightOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />
                                </Flex>
                            </Card>
                        );
                    })}
                </Space>
            </div>

            <Drawer
                styles={{
                    header: { background: '#1890ff', color: 'white' },
                    body: { padding: '24px' }
                }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'white' }}>
                            {selectedBill && `บิลค่าเช่า เดือน ${getThaiMonthName(selectedBill?.billingPeriod?.month)}/${selectedBill?.billingPeriod?.year}`}
                        </span>
                        <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} onClick={onClose} />
                    </div>
                }
                placement="top"
                height="100vh"
                open={open}
                onClose={onClose}
                closable={false}
            >
                {selectedBill && (
                    <div>
                        {/* Bill Header Info */}
                        <Card style={{ marginBottom: '16px' }}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Text strong>เลขที่บิล:</Text>
                                    <br />
                                    <Text>{selectedBill.billNumber}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>สถานะ:</Text>
                                    <br />
                                    <Tag icon={getStatusInfo(selectedBill.status).icon} color={getStatusInfo(selectedBill.status).color}>
                                        {getStatusInfo(selectedBill.status).text}
                                    </Tag>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>วันที่ออกบิล:</Text>
                                    <br />
                                    <Text>{formatDate(selectedBill?.billDate)}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>วันครบกำหนดชำระ:</Text>
                                    <br />
                                    <Text type={selectedBill.status === 'pending' ? 'danger' : 'secondary'}>
                                        {formatDate(selectedBill.dueDate)}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>

                        {/* Bill Items Table */}
                        <Card title="รายการค่าใช้จ่าย" style={{ marginBottom: '16px' }}>
                            <Table
                                dataSource={selectedBill.items}
                                columns={itemColumns}
                                rowKey="_id"
                                pagination={false}
                                size="small"
                                scroll={{ x: 600 }}
                            />
                        </Card>

                        {/* Summary */}
                        {fineAmount > 0 && (
                            <Card style={{ marginBottom: '16px' }}>
                                <Flex justify="space-between">
                                    <Text strong>ค่าปรับล่าช้า
                                        <Text type="secondary">

                                            {` (จ่ายหลังจากวันที่ ${paymentDueDate}, ช้าไป ${Math.max(0, todays - paymentDueDate)} วัน × ${formatCurrency(selectedBill.apartment.billingSettings.lateFeePerDay)} ต่อวัน)`}
                                        </Text>
                                    </Text>
                                    <Text type="danger" strong>
                                        {formatCurrency(fineAmount)}
                                    </Text>
                                </Flex>
                            </Card>
                        )}

                        <Card>
                            <Row gutter={[16, 8]}>

                                <Col xs={24}>
                                    {/* <Divider style={{ margin: '12px 0' }} /> */}
                                    <Flex justify="space-between">
                                        <Text strong style={{ fontSize: '16px' }}>รวมทั้งหมด</Text>
                                        <Text strong style={{
                                            fontSize: '16px', color: totalWithFine > 0 ? '#ff4d4f' : '#52c41a' }}>
                                            {formatCurrency(totalWithFine)}
                                        </Text>
                                    </Flex>

                                </Col>
                                <Col xs={24}>
                                    <FileUploadPreviewModal
                                        // errors={errors.content?.photoUrl}
                                        // clearErrors={clearErrors}
                                        display={!!previewUrl}
                                        isPreview={false}
                                    // onUploaded={(key) => setValue("content.photoUrl", key)}
                                    // onCleared={() => setValue("content.photoUrl", undefined)}
                                    />

                                </Col>
                            </Row>

                            {selectedBill.status === 'pending' && selectedBill.remainingAmount > 0 && (
                                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => handleBillClick(selectedBill)}
                                        disabled={!previewUrl}
                                    >
                                        ยืนยัน
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </Drawer>
        </div>
    );
};