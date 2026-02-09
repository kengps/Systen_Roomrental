import { CheckCircleFilled, ClockCircleFilled, CloseCircleOutlined, CloseOutlined, DollarCircleOutlined, DownloadOutlined, FileTextOutlined, PrinterOutlined, RightOutlined, StopOutlined, WarningFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Divider, Drawer, Flex, Image, message, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import FileUploadPreviewModal from '../../../components/form/FileUploadContext/FileUploadPreviewModal';
import { createPayments, listBillingTenant } from '../../../service/api/tenants/informations.api';
import { useFileUploadContext } from '../../../service/context/FileUploadContext';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import PaymentHistory from '../components/paments/PaymentHistory';
import { generateReceiptHtml } from '../components/Receipt/GenerateReceiptHtml';
import { downloadReceipt } from '../components/Receipt/DownloadReceipt';

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
        case 'waiting':
            return {
                text: 'รอการตรวจสอบ',
                color: 'warning',
                icon: <ClockCircleFilled />
            };
        case 'outstanding':
            return {
                text: 'ค้างชำระ',
                color: 'error',
                icon: <DollarCircleOutlined />
            };
        case 'rejected':
            return {
                text: 'การชำระถูกปฏิเสธ',
                color: 'error',
                icon: <CloseCircleOutlined />
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

const calculateFine = (today, billDate, lateFeePerDay, cutoffDayNumber, paymentDueDate) => {
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
        // วันปัจจุบันเลย grace period แล้ว → เริ่มคิดค่าปรับ
        const daysLate = today.diff(gracePeriodEnd, 'day');
        // ✅ ไม่ให้ค่าปรับติดลบ
        const safeDaysLate = Math.max(0, daysLate);
        return lateFeePerDay * safeDaysLate;
    }

    // ยังอยู่ใน grace period → ไม่คิดค่าปรับ
    return 0;
};

// ฟังก์ชันสำหรับพิมพ์ใบเสร็จ
const printReceipt = (bill) => {
    const printWindow = window.open('', '_blank');
    const receiptHtml = generateReceiptHtml(bill);
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
};



// --- Main Component ---
export const PayMent = () => {
    const [open, setOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    console.log(`⩇⩇:⩇⩇🚨 ~ selectedBill :`, selectedBill);




    const [fileList, setFileList] = useState([]);

    const { previewUrl, setPreviewUrl } = useFileUploadContext();
    const { user } = persistMiddleware();
    const previousPathRef = useRef(null);

    const accountId = user?.userPayLoad?.user?.id
    const navigate = useNavigate();
    const location = useLocation();

    const match = matchPath("/member/listbills/bills/:billId", location.pathname);
    const billId = match?.params?.billId;

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['listBilling', accountId],
        queryFn: () => listBillingTenant(accountId),
        select: (data) => data.data.result,
    });


    const findBillById = (billId, bills) => {
        return bills.find(bill =>
            bill.billId === billId ||
            bill._id === billId ||
            bill.billNumber === billId
        );
    };

    useEffect(() => {
        if (billId && data && data.length > 0) {
            const foundBill = findBillById(billId, data);

            if (foundBill) {
                setSelectedBill(foundBill);
                setOpen(true);
            } else {
                console.warn(`Bill with ID ${billId} not found`);
                navigate(location.pathname, { replace: true });
            }
        } else if (!billId) {
            setSelectedBill(null);
            setOpen(false);
        }
    }, [billId, data, navigate]);

    useEffect(() => {
        previousPathRef.prev = location.pathname;
    }, []);

    // 🔥 MOVE useMemo TO TOP LEVEL - ALWAYS CALLED
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

    // Loading และ Error states
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

    const totalWithFine = selectedBill?.totalAmount + selectedBill?.penaltyAmount + Math.max(0, fineAmount);

    const onClose = () => {
        setOpen(false);
        setSelectedBill(null);
        navigate('/member/listbills/bills')
    };

    const showDrawer = (bill) => {
        navigate(`${location.pathname}/${bill.billId || bill._id}`);
        setSelectedBill(bill);
        setOpen(true);
    };

    // ฟังก์ชันจัดการการชำระ
    const handleBillClick = async (billId) => {
        const payload = {
            paymentId: `PAY-${Date.now()}`,
            receiptCode: `REC-${dayjs().format("YYYYMMDDHHmmss")}`,
            bill: selectedBill._id,
            tenant: selectedBill.tenant,
            paymentDate: new Date().toISOString(),
            amount: selectedBill?.totalAmount,
            penaltyAmount: fineAmount,
            totalAmount: totalWithFine,
            paymentMethod: "transfer",
            paymentStatus: "waiting",
            description: `ชำระบิลเดือน ${getThaiMonthName(selectedBill.billingPeriod.month)}/${selectedBill.billingPeriod.year}`,
            paidItems: selectedBill.items.map((item) => ({
                itemId: item.itemId,
                categoryName: item.categoryName,
                paidAmount: item.amount
            })),
            attachments: previewUrl,
            createdBy: user?.userPayLoad?.user?.id
        };
       


        const res = await createPayments(payload)
       

        if (res.data.status === 201) {
            message.success('ส่งการชำระเงินเรียบร้อยแล้ว');
            setOpen(false);
            refetch()
        }
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
            width: '25%',
            render: (description, record) => {
                if (record.previousUnit && record.currentUnit) {
                    return (
                        <div>
                            <div>{description}</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                หน่วยก่อนหน้า: {record.previousUnit} → ปัจจุบัน: {record.currentUnit} = {record.currentUnit - record.previousUnit} หน่วย
                            </Text>
                        </div>
                    );
                }
                return description;
            }
        },
        {
            title: 'ราคา/หน่วย',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: '25%',
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
            width: '25%',
            align: 'right',
            render: (amount) => (
                <Text style={{ color: amount < 0 ? '#52c41a' : 'inherit' }}>
                    {formatCurrency(amount)}
                </Text>
            )
        }
    ];

    const todays = dayjs().format('D')
    const paymentDueDate = selectedBill?.apartment?.billingSettings?.paymentDueDate
    console.log(`⩇⩇:⩇⩇🚨 ~ selectedBill :`, selectedBill);


    return (
        <div style={{ background: '#f0f2f5', padding: '24px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: '#e9ecef', padding: '12px 24px', borderRadius: '8px', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                        <FileTextOutlined style={{ marginRight: '8px' }} />
                        บิลค่าเช่าของฉัน
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* ปุ่มสำหรับบิลที่จ่ายแล้ว - วางไว้ใน header */}
                            {['paid', 'completed'].includes(selectedBill?.status) && (
                                <>
                                    <Button
                                        type="text"
                                        icon={<PrinterOutlined style={{ color: 'white' }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            printReceipt(selectedBill);
                                        }}
                                        style={{
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            fontSize: '12px',
                                            height: '32px'
                                        }}
                                    >
                                        พิมพ์
                                    </Button>
                                    <Button
                                        type="text"
                                        icon={<DownloadOutlined style={{ color: 'white' }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadReceipt(selectedBill);
                                        }}
                                        style={{
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            fontSize: '12px',
                                            height: '32px'
                                        }}
                                    >
                                        ดาวน์โหลด
                                    </Button>
                                </>
                            )}
                            <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} onClick={onClose} />
                        </div>
                    </div>
                }
                placement="top"
                height="100vh"
                open={!!billId && !!selectedBill}
                onClose={onClose}
                closable={false}
            >
                {selectedBill ? (
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
                                    <Space>
                                        <Tag icon={getStatusInfo(selectedBill.status).icon} color={getStatusInfo(selectedBill.status).color}>
                                            {getStatusInfo(selectedBill.status).text}
                                        </Tag>
                                        {/* ปุ่มพิมพ์และดาวน์โหลด - ตำแหน่งที่ 2 (ข้างสถานะ) */}
                                        {['paid', 'completed'].includes(selectedBill?.status) && (
                                            <>
                                                <Button
                                                    type="link"
                                                    icon={<PrinterOutlined />}
                                                    onClick={() => printReceipt(selectedBill)}
                                                    size="small"
                                                >
                                                    พิมพ์
                                                </Button>
                                                <Button
                                                    type="link"
                                                    icon={<DownloadOutlined />}
                                                    onClick={() => downloadReceipt(selectedBill)}
                                                    size="small"
                                                >
                                                    ดาวน์โหลด
                                                </Button>
                                            </>
                                        )}
                                    </Space>
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

                        {/* Fine Amount Alert */}
                        {fineAmount > 0 && !['paid', 'outstanding', 'waiting'].includes(selectedBill.status) && (
                            <Card style={{ marginBottom: 16 }}>
                                <Flex justify="space-between">
                                    <Text strong>
                                        ค่าปรับล่าช้า{' '}
                                        <Text type="secondary">
                                            {`(จ่ายหลังจากวันที่ ${paymentDueDate}, ช้าไป ${Math.max(0, todays - paymentDueDate)} วัน × ${formatCurrency(selectedBill.apartment.billingSettings.lateFeePerDay)} ต่อวัน)`}
                                        </Text>
                                    </Text>
                                    <Text type="danger" strong>
                                        {formatCurrency(fineAmount)}
                                    </Text>
                                </Flex>
                            </Card>
                        )}

                        {/* Summary Card */}
                        <Card>
                            <Row gutter={[16, 8]}>
                                {/* สำหรับสถานะที่ยังไม่ได้จ่าย */}
                                {['pending', 'waiting', 'outstanding', 'rejected'].includes(selectedBill?.status ?? '') && (
                                    <>
                                        <Col xs={24}>
                                            <Flex justify="space-between">
                                                <Text strong style={{ fontSize: '16px' }}>รวมทั้งหมด</Text>
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {formatCurrency(totalWithFine)}
                                                </Text>
                                            </Flex>
                                        </Col>
                                        <Col xs={24}>
                                            <Flex justify="space-between">
                                                <Text strong style={{ fontSize: '16px' }}>ชำระมาแล้ว</Text>
                                                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                                    {formatCurrency(selectedBill.paidAmount)}
                                                </Text>
                                            </Flex>
                                        </Col>
                                        <Col xs={24}>
                                            <Flex justify="space-between">
                                                <Text strong style={{ fontSize: '16px' }}>ค้างชำระ</Text>
                                                <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                                                    {formatCurrency((selectedBill.totalAmount + fineAmount) - selectedBill.paidAmount)}
                                                </Text>
                                            </Flex>
                                        </Col>

                                        {/* File Upload */}
                                        <Col xs={24}>
                                            <Card size="small" style={{ marginTop: 16 }}>
                                                <FileUploadPreviewModal
                                                    display={!!previewUrl}
                                                    isPreview={false}
                                                    onCleared={() => setPreviewUrl(undefined)}
                                                    fileList={fileList}
                                                    setFileList={setFileList}
                                                />
                                            </Card>
                                        </Col>

                                        {/* Payment History */}
                                        <Col xs={24}>
                                            <PaymentHistory paymentHistory={selectedBill?.paymentHistory} />
                                        </Col>
                                    </>
                                )}

                                {/* สำหรับสถานะที่จ่ายแล้ว */}
                                {['paid', 'completed'].includes(selectedBill?.status ?? '') && (
                                    <>
                                        <Col xs={24}>
                                            <Flex justify="space-between">
                                                <Text strong style={{ fontSize: '16px' }}>รวมทั้งหมด</Text>
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {formatCurrency(totalWithFine)}
                                                </Text>
                                            </Flex>
                                        </Col>
                                        <Col xs={24}>
                                            <Flex justify="space-between">
                                                <Text strong style={{ fontSize: '16px' }}>ชำระมาแล้ว</Text>
                                                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                                    {formatCurrency(selectedBill.paidAmount)}
                                                </Text>
                                            </Flex>
                                        </Col>

                                        {/* แสดงยอดชำระเกิน (ถ้ามี) */}
                                        {selectedBill.paidAmount - totalWithFine > 0 && (
                                            <Col xs={24}>
                                                <Flex justify="space-between">
                                                    <Text strong style={{ fontSize: '16px' }}>ชำระเกิน</Text>
                                                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                                        {formatCurrency(selectedBill.paidAmount - totalWithFine)}
                                                    </Text>
                                                </Flex>
                                            </Col>
                                        )}

                                        {/* ปุ่มพิมพ์ใบเสร็จ - ตำแหน่งที่ 3 (ใน summary card สำหรับบิลที่จ่ายแล้ว) */}
                                        <Col xs={24} style={{ textAlign: 'center', marginTop: '16px' }}>
                                            <Button
                                                type="primary"
                                                icon={<PrinterOutlined />}
                                                size="large"
                                                onClick={() => printReceipt(selectedBill)}
                                                style={{
                                                    background: '#52c41a',
                                                    borderColor: '#52c41a',
                                                    minWidth: '200px'
                                                }}
                                            >
                                                พิมพ์ใบเสร็จ
                                            </Button>
                                        </Col>

                                        {/* Payment History */}
                                        <Col xs={24}>
                                            <Divider style={{ margin: '20px 0 16px 0' }} />
                                            <PaymentHistory paymentHistory={selectedBill?.paymentHistory} />
                                        </Col>
                                    </>
                                )}
                            </Row>

                            {/* ปุ่มยืนยันการชำระ (สำหรับสถานะที่ยังไม่ได้จ่าย) */}
                            {['pending', 'outstanding', 'rejected'].includes(selectedBill?.status ?? '') && selectedBill?.totalAmount > 0 && (
                                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => handleBillClick(selectedBill)}
                                        disabled={!previewUrl}
                                        style={{ minWidth: '200px' }}
                                    >
                                        ยืนยันการชำระ
                                    </Button>
                                    {!previewUrl && (
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                กรุณาแนบหลักฐานการโอนเงินก่อนยืนยัน
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '50px' }}>
                        <Spin size="large" />
                    </div>
                )}
            </Drawer>
        </div>
    );
};