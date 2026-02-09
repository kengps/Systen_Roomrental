import {
    CloseOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Divider, Drawer, Image, Row, Select, Space, Table, Tag, Typography } from "antd";
import FlexiblePaymentModal from './FlexiblePaymentModal';
import { useState } from 'react';
import FlexiblePaymentCancelModal from './DescriptionCancelModel';
import { confirmPayment } from '../../../../service/api/bill';
import Swal from 'sweetalert2';
import PaymentHistory from '../../../member/components/paments/PaymentHistory';
const { Title, Text } = Typography;
const PaymentDrawerAdmin = ({
    open,
    onClose,
    paymentData,
    handleCheckSlip,
    bankData,
    setSelectedBank,
    selectedBank,
    slipResult,
    handleConfirmSlip,
    isSameAmount,
    accountId,
    // handleConfirm,
    isSlipCheckEnabled = false,
    handleCanceledSlip,


}) => {
    console.log(`⩇⩇:⩇⩇🚨 ~ paymentData :`, paymentData);







    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleCancel, setModalVisibleCancel] = useState(false);

    const colorMap = {
        'ค่าบริการตามบิล': 'gray',
        'ค่าปรับ': '#faad14',
        'ยอดรวมทั้งหมด': 'green',
        'ยอดชำระแล้ว': '#52c41a',
        'ค้างชำระ': '#f5222d',
        'ชำระเกิน': '#f5222d',
        'completed': 'green',
        'outstanding': 'volcano'
    };
    const paymentStatus = {
        'completed': 'ชำระครบแล้ว',
        'outstanding': 'ค้างชำระ',
        'ค่าปรับ': '#faad14',
        'ยอดรวมทั้งหมด': '#2f54eb',
        'ยอดชำระแล้ว': '#52c41a',
        'ค้างชำระ': '#f5222d',
        'ชำระเกิน': '#f5222d',
    };

    const underlineMap = {
        'ยอดรวมทั้งหมด': 'underline',
        'ค้างชำระ': 'underline double',
        'ชำระเกิน': 'underline double',
    };

    const columns = [
        {
            title: "รายการ",
            dataIndex: "description",
            key: "description",
            render: (text) => {
                const color = colorMap[text] || 'black';
                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {text}
                    </span>
                );
            },
        },
        {
            title: "จำนวนเงิน (บาท)",
            dataIndex: "amount",
            key: "amount",
            render: (_, value) => {
                const color = colorMap[value?.description] || 'black';
                const textDecoration = underlineMap[value?.description] || 'none';
                return (
                    <span style={{ color, fontWeight: "bold", textDecoration }}>
                        {value?.amount?.toLocaleString()}
                    </span>
                );
            },
        },
    ];



    const options = bankData?.result?.banks.map((item, index) => ({
        key: index + 1,
        value: item.accountNumber,
        label: `${item.accountName} (${item.bankKey.toUpperCase()})`,
        data: item // เก็บข้อมูลทั้ง object
    }));

    const formatDate = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return '-';
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const time = timeStr.substring(0, 5);
        return `${day}/${month}/${year} ${time}`;
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };





    const handleConfirm = async (data) => {

        const values2 = {
            accountId: accountId,
            billId: paymentData.billId._id,
            billNumber: paymentData.billId.billNumber,
            paymentId: paymentData.paymentId,
            tenant: paymentData.tenantInfo.id,
            reason: data.reason,
            description: data.description,
            customNote: data.customNote || "",
            timestamp: data.timestamp,


        }
        console.log(`⩇⩇:⩇⩇🚨 ~ values2 :`, values2);


        const values = {
            ...data,
            accountId

        }



        if (data.reason) {
            console.log(`อันนี้ยกเลิก`);
        } else {
            const res = await confirmPayment(values)


            if (res.success) {
                Swal.fire('ทำการยืนยันการชำระสำเร็จ')
            }
            console.log(`อันนี้ตกลง`);
        }


        // API call here
        setModalVisible(false);
    };




    const isCompletedOrRejected = ['completed', 'rejected', 'outstanding'].includes(paymentData?.paymentStatus);

    return (
        <Drawer
            //title={`รายละเอียดการชำระเงิน - ห้อง ${paymentData?.tenantInfo?.roomNumber}`}
            styles={{
                header: { background: '#1890ff', color: 'white' },
                body: { padding: '24px' }
            }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white' }}>
                        {`รายละเอียดการชำระเงิน - ห้อง ${paymentData?.tenantInfo?.roomNumber}`}
                    </span>
                    <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} onClick={onClose} />
                </div>
            }
            width={600}
            onClose={onClose}
            open={open}
            placement="top"
            height="100vh"
            closable={false}
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="ชื่อผู้เช่า">
                    {paymentData?.tenantInfo?.name}
                </Descriptions.Item>
                {/* <Descriptions.Item label="ที่อยู่">
                    {paymentData?.tenantInfo?.address}
                </Descriptions.Item> */}
                <Descriptions.Item label="วันที่ชำระ">
                    {new Date(paymentData?.paymentDate).toLocaleDateString("th-TH")}
                </Descriptions.Item>
                <Descriptions.Item label="วิธีการชำระ">
                    {paymentData?.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                    <Tag color={colorMap[paymentData?.paymentStatus]}>{paymentStatus[paymentData?.paymentStatus]}</Tag>
                </Descriptions.Item>
            </Descriptions>

            <h4 className="mt-4">รายละเอียดค่าบริการ</h4>
            <Table
                columns={columns}
                dataSource={paymentData?.lineItems}
                rowKey="description"
                pagination={false}
                size="small"
            />


            {paymentData?.billId?.paymentHistory && paymentData?.billId?.paymentHistory.length > 0 && (
                <>
                    <PaymentHistory
                        paymentHistory={paymentData?.billId?.paymentHistory}
                    />
                </>
            )}

            {isCompletedOrRejected ? (<>
                {paymentData?.partialPayments?.map((item, index) => {

                    // กำหนดสีตาม status
                    const getStatusColor = (status) => {
                        switch (status) {
                            case 'approved': return '#52c41a'; // เขียว
                            case 'rejected': return '#ff4d4f'; // แดง
                            case 'pending': return '#faad14'; // เหลือง
                            default: return '#8c8c8c'; // เทา
                        }
                    };

                    // กำหนดข้อความตาม status
                    const getStatusText = (status) => {
                        switch (status) {
                            case 'approved': return 'อนุมัติแล้ว';
                            case 'rejected': return 'ปฏิเสธ';
                            case 'pending': return 'รอการอนุมัติ';
                            default: return 'ไม่ทราบสถานะ';
                        }
                    };

                    // แปลงวันที่
                    const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        return date.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    };

                    // แปลงจำนวนเงิน
                    const formatAmount = (amount) => {
                        return new Intl.NumberFormat('th-TH').format(amount);
                    };

                    return (
                        <Card
                            key={item._id}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                        {/* ห้อง {item.tenant?.room?.roomNumber} - {item.tenant?.firstName} {item.tenant?.lastName} */}
                                    </span>
                                    <span
                                        style={{
                                            color: getStatusColor(item.paymentStatus),
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: getStatusColor(item.paymentStatus) + '20'
                                        }}
                                    >
                                        {getStatusText(item.paymentStatus)}
                                    </span>
                                </div>
                            }
                            variant="borderless"
                            style={{
                                width: '100%',
                                marginBottom: '16px',
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* รหัสการชำระและวันที่ */}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>รหัสการชำระ:</strong> {item.paymentId}
                                    </div>
                                    <div style={{ color: '#8c8c8c' }}>
                                        {formatDate(item.paymentDate)}
                                    </div>
                                </div>

                                {/* รายละเอียดการชำระ */}
                                <div>
                                    <strong>รายละเอียด:</strong> {item.description}
                                </div>

                                {/* จำนวนเงิน */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <strong>จำนวนเงินรวม:</strong> ฿{formatAmount(item.totalAmount)}
                                    </div>
                                    {/* <div>
                                        <strong>จำนวนที่ชำระ:</strong> ฿{formatAmount(item.paidAmount)}
                                    </div>
                                    {item.penaltyAmount > 0 && (
                                        <div style={{ color: '#ff4d4f' }}>
                                            <strong>ค่าปรับ:</strong> ฿{formatAmount(item.penaltyAmount)}
                                        </div>
                                    )} */}
                                </div>

                                {/* หลักฐานการชำระ */}
                                {item.attachments && (
                                    <div>
                                        <strong>หลักฐานการชำระ:</strong>{' '}
                                        <a
                                            href={item.attachments}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#1890ff' }}
                                        >
                                            ดูหลักฐาน
                                        </a>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </>
            )
                :

                (<>

                    {/* ถ้าเปิดใช้ การเช็คสลิป */}
                    {isSlipCheckEnabled ? (
                        <>
                            {paymentData?.length > 0 ? (
                                <>
                                    {paymentData?.map((item, index) => {

                                        return (
                                            <Row gutter={24} key={index + 1}>
                                                {/* ส่วนซ้าย - Slip Checker */}
                                                <Col span={12}>
                                                    <Card
                                                        style={{
                                                            borderRadius: 10,
                                                            overflow: "hidden",
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                        }}
                                                        title="สลิปการโอน"
                                                        cover={
                                                            <>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        background: "#fafafa",
                                                                        padding: 16,
                                                                    }}
                                                                >

                                                                    <Image
                                                                        width="50%"
                                                                        src={item?.attachments}
                                                                        alt="Slip"
                                                                        style={{
                                                                            borderRadius: 8,
                                                                            boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                                                                        }}
                                                                    />
                                                                </div>

                                                            </>
                                                        }
                                                    >
                                                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                                            <Select
                                                                style={{ width: "100%" }}
                                                                options={options}
                                                                placeholder="เลือกบัญชีที่ได้รับโอน"
                                                                onChange={(value, option) => setSelectedBank(option.data)}
                                                            />
                                                            <Button
                                                                disabled={!selectedBank}
                                                                type="primary"
                                                                block
                                                                onClick={() => handleCheckSlip(paymentData)}
                                                                style={{
                                                                    backgroundColor: "#52c41a",
                                                                    borderColor: "#52c41a"
                                                                }}
                                                            >
                                                                ตรวจสอบสลิปการโอน
                                                            </Button>

                                                        </Space>
                                                    </Card>
                                                </Col>

                                                {/* ส่วนขวา - ผลการตรวจสอบ */}
                                                <Col span={12}>
                                                    <Card
                                                        title="ผลการตรวจสอบ"
                                                        style={{
                                                            borderRadius: 10,
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                            height: 'fit-content'
                                                        }}
                                                    >
                                                        {slipResult ? (
                                                            <Space direction="vertical" style={{ width: "100%" }} size={16}>
                                                                {/* สถานะ */}
                                                                <div>
                                                                    <Text strong>สถานะ: </Text>
                                                                    <Text style={{ color: slipResult.success ? '#52c41a' : '#ff4d4f' }}>
                                                                        {slipResult.message} {slipResult.success ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                                                                    </Text>
                                                                </div>

                                                                <Divider style={{ margin: '8px 0' }} />

                                                                {/* จำนวนเงิน */}
                                                                <div>
                                                                    <Text strong>จำนวนเงิน: </Text>
                                                                    <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                                                                        {formatAmount(slipResult.amount)} บาท
                                                                    </Text>
                                                                </div>

                                                                {/* วันที่เวลา */}
                                                                <div>
                                                                    <Text strong>วันที่/เวลา: </Text>
                                                                    <Text>{formatDate(slipResult.transDate, slipResult.transTime)}</Text>
                                                                </div>

                                                                <Divider style={{ margin: '8px 0' }} />

                                                                {/* ผู้โอน */}
                                                                <div>
                                                                    <Text strong>ผู้โอน: </Text>
                                                                    <div style={{ marginLeft: '8px' }}>
                                                                        <div><Text>{slipResult.sender?.displayName}</Text></div>
                                                                        <div><Text type="secondary">({slipResult.sender?.account?.value})</Text></div>
                                                                    </div>
                                                                </div>

                                                                {/* ผู้รับ */}
                                                                <div>
                                                                    <Text strong>ผู้รับ: </Text>
                                                                    <div style={{ marginLeft: '8px' }}>
                                                                        <div><Text>{slipResult.receiver?.displayName}</Text></div>
                                                                        <div><Text type="secondary">({slipResult.receiver?.account?.value})</Text></div>
                                                                    </div>
                                                                </div>

                                                                <Divider style={{ margin: '8px 0' }} />

                                                                {/* หมายเลขอ้างอิง */}
                                                                <div>
                                                                    <Text strong>หมายเลขอ้างอิง: </Text>
                                                                    <div style={{ marginTop: '4px' }}>
                                                                        <Text
                                                                            copyable
                                                                            style={{
                                                                                fontSize: '12px',
                                                                                fontFamily: 'monospace',
                                                                                background: '#f5f5f5',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px'
                                                                            }}
                                                                        >
                                                                            {slipResult.transRef}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                {/* ธนาคาร */}
                                                                <div>
                                                                    <Text strong>ธนาคารต้นทาง: </Text>
                                                                    <Text>{slipResult.sendingBank}</Text>
                                                                    <br />
                                                                    <Text strong>ธนาคารปลายทาง: </Text>
                                                                    <Text>{slipResult.receivingBank}</Text>
                                                                </div>

                                                                {/* ปุ่มดำเนินการ */}
                                                                <Divider style={{ margin: '16px 0' }} />
                                                                <Space style={{ width: '100%', justifyContent: 'center' }}>

                                                                    {isSameAmount ? (<Button
                                                                        onClick={() => handleConfirmSlip(paymentData, slipResult)}
                                                                        type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                                                        อนุมัติการชำระ
                                                                    </Button>) : (<Button
                                                                        onClick={() => setModalVisible(true)}
                                                                        type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                                                        แบ่งจ่ายบางส่วน
                                                                    </Button>)}

                                                                    <Button danger
                                                                        onClick={() => handleCanceledSlip(paymentData, slipResult)}
                                                                    >
                                                                        ปฏิเสธ
                                                                    </Button>
                                                                </Space>
                                                            </Space>
                                                        ) : (
                                                            <div style={{
                                                                textAlign: 'center',
                                                                color: '#999',
                                                                padding: '40px 20px',
                                                                minHeight: '300px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Text type="secondary">กรุณาตรวจสอบสลิปเพื่อดูผลลัพธ์</Text>
                                                            </div>
                                                        )}
                                                    </Card>
                                                </Col>
                                            </Row>)
                                    })

                                    }
                                </>
                            ) : (
                                <Row gutter={24}>
                                    {/* ส่วนซ้าย - Slip Checker */}
                                    <Col span={12}>
                                        <Card
                                            style={{
                                                borderRadius: 10,
                                                overflow: "hidden",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            }}
                                            title="สลิปการโอน"
                                            cover={
                                                <>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            background: "#fafafa",
                                                            padding: 16,
                                                        }}
                                                    >

                                                        <Image
                                                            width="50%"
                                                            src={paymentData?.attachments}
                                                            alt="Slip"
                                                            style={{
                                                                borderRadius: 8,
                                                                boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                                                            }}
                                                        />
                                                    </div>

                                                </>
                                            }
                                        >
                                            <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                                <Select
                                                    style={{ width: "100%" }}
                                                    options={options}
                                                    placeholder="เลือกบัญชีที่ได้รับโอน"
                                                    onChange={(value, option) => setSelectedBank(option.data)}
                                                />
                                                <Button
                                                    disabled={!selectedBank}
                                                    type="primary"
                                                    block
                                                    onClick={() => handleCheckSlip(paymentData)}
                                                    style={{
                                                        backgroundColor: "#52c41a",
                                                        borderColor: "#52c41a"
                                                    }}
                                                >
                                                    ตรวจสอบสลิปการโอน
                                                </Button>

                                            </Space>
                                        </Card>
                                    </Col>

                                    {/* ส่วนขวา - ผลการตรวจสอบ */}
                                    <Col span={12}>
                                        <Card
                                            title="ผลการตรวจสอบ"
                                            style={{
                                                borderRadius: 10,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                                height: 'fit-content'
                                            }}
                                        >
                                            {slipResult ? (
                                                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                                                    {/* สถานะ */}
                                                    <div>
                                                        <Text strong>สถานะ: </Text>
                                                        <Text style={{ color: slipResult.success ? '#52c41a' : '#ff4d4f' }}>
                                                            {slipResult.message} {slipResult.success ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                                                        </Text>
                                                    </div>

                                                    <Divider style={{ margin: '8px 0' }} />

                                                    {/* จำนวนเงิน */}
                                                    <div>
                                                        <Text strong>จำนวนเงิน: </Text>
                                                        <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                                                            {formatAmount(slipResult.amount)} บาท
                                                        </Text>
                                                    </div>

                                                    {/* วันที่เวลา */}
                                                    <div>
                                                        <Text strong>วันที่/เวลา: </Text>
                                                        <Text>{formatDate(slipResult.transDate, slipResult.transTime)}</Text>
                                                    </div>

                                                    <Divider style={{ margin: '8px 0' }} />

                                                    {/* ผู้โอน */}
                                                    <div>
                                                        <Text strong>ผู้โอน: </Text>
                                                        <div style={{ marginLeft: '8px' }}>
                                                            <div><Text>{slipResult.sender?.displayName}</Text></div>
                                                            <div><Text type="secondary">({slipResult.sender?.account?.value})</Text></div>
                                                        </div>
                                                    </div>

                                                    {/* ผู้รับ */}
                                                    <div>
                                                        <Text strong>ผู้รับ: </Text>
                                                        <div style={{ marginLeft: '8px' }}>
                                                            <div><Text>{slipResult.receiver?.displayName}</Text></div>
                                                            <div><Text type="secondary">({slipResult.receiver?.account?.value})</Text></div>
                                                        </div>
                                                    </div>

                                                    <Divider style={{ margin: '8px 0' }} />

                                                    {/* หมายเลขอ้างอิง */}
                                                    <div>
                                                        <Text strong>หมายเลขอ้างอิง: </Text>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Text
                                                                copyable
                                                                style={{
                                                                    fontSize: '12px',
                                                                    fontFamily: 'monospace',
                                                                    background: '#f5f5f5',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px'
                                                                }}
                                                            >
                                                                {slipResult.transRef}
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    {/* ธนาคาร */}
                                                    <div>
                                                        <Text strong>ธนาคารต้นทาง: </Text>
                                                        <Text>{slipResult.sendingBank}</Text>
                                                        <br />
                                                        <Text strong>ธนาคารปลายทาง: </Text>
                                                        <Text>{slipResult.receivingBank}</Text>
                                                    </div>

                                                    {/* ปุ่มดำเนินการ */}
                                                    <Divider style={{ margin: '16px 0' }} />
                                                    <Space style={{ width: '100%', justifyContent: 'center' }}>

                                                        {isSameAmount ? (<Button
                                                            onClick={() => handleConfirmSlip(paymentData, slipResult)}
                                                            type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                                            อนุมัติการชำระ
                                                        </Button>) : (<Button
                                                            onClick={() => setModalVisible(true)}
                                                            type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                                            แบ่งจ่ายบางส่วน
                                                        </Button>)}

                                                        <Button danger
                                                            onClick={() => setModalVisibleCancel(true)}
                                                        >
                                                            ปฏิเสธ
                                                        </Button>
                                                    </Space>
                                                </Space>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    color: '#999',
                                                    padding: '40px 20px',
                                                    minHeight: '300px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text type="secondary">กรุณาตรวจสอบสลิปเพื่อดูผลลัพธ์</Text>
                                                </div>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>)}
                        </>

                    ) : (

                        <>

                            {/* ถ้าไม่ได้เปิดใช้ การเช็คสลิป */}
                            <Card
                                style={{
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                                cover={
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                background: "#fafafa",
                                                padding: 16,
                                            }}
                                        >
                                            <Image
                                                width="25%"
                                                src={paymentData?.attachments}
                                                alt="Slip"
                                                style={{
                                                    borderRadius: 8,
                                                    boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                                                }}
                                            />
                                        </div>

                                    </>
                                }
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={12}>

                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => setModalVisible(true)}
                                        style={{
                                            backgroundColor: "#52c41a",
                                            borderColor: "#52c41a"
                                        }}
                                    >
                                        ยืนยันการชำระ
                                    </Button>

                                    <Button
                                        type="primary"
                                        block
                                        // onClick={() => handleCanceledNotCheckSlip(paymentData)}
                                        onClick={() => setModalVisibleCancel(true)}
                                        style={{
                                            backgroundColor: "red",
                                            borderColor: "red"
                                        }}
                                    >
                                        ปฏิเสธ
                                    </Button>

                                </Space>
                            </Card>

                        </>

                    )
                    }

                </>)}



            <FlexiblePaymentModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onConfirm={handleConfirm}
                billData={{
                    id: 'bill-123',
                    billNumber: 'B-2024-001',
                    totalAmount: 5000,
                    paidAmount: 3000,
                    remainingAmount: 2000,
                    dueDate: '2024-02-15',
                    slipAmount: 1200,
                    paymentHistory: [
                        { id: 1, amount: 2000, method: 'transfer', date: '2024-01-15', reference: 'TXN001' },
                        { id: 2, amount: 1000, method: 'cash', date: '2024-01-20', reference: '' }
                    ]
                }}
                slipResult={slipResult}
                paymentData={paymentData}
            />

            <FlexiblePaymentCancelModal
                visible={modalVisibleCancel}
                onCancel={() => setModalVisibleCancel(false)}
                onConfirm={handleConfirm}
                handleCanceledSlip={handleCanceledSlip}

            />
        </Drawer >
    );
};

export default PaymentDrawerAdmin