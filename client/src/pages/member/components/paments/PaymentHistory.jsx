import React from 'react'
import { Collapse, Card } from 'antd';
import { ColorStatus } from '../../../../service/class/ClassColor';


const PaymentHistory = ({ paymentHistory }) => {
  

    // กำหนดสีตาม paymentMethod
    // const getStatusColor = (paymentMethod) => {
    //     switch (paymentMethod) {
    //         case 'transfer': return '#52c41a'; // เขียว - โอนเงิน
    //         case 'rejected': return '#ff4d4f'; // เขียว - โอนเงิน
    //         case 'cash': return '#1890ff'; // น้ำเงิน - เงินสด
    //         case 'cancelled': return '#ff4d4f'; // แดง - ยกเลิก
    //         case 'pending': return '#faad14'; // เหลือง - รอดำเนินการ
    //         default: return '#8c8c8c'; // เทา
    //     }
    // };

    // กำหนดข้อความตาม paymentMethod
    const getStatusText = (paymentMethod) => {
        switch (paymentMethod) {
            case 'transfer': return 'โอนเงิน';
            case 'cash': return 'เงินสด';
            case 'cancelled': return 'ยกเลิก';
            case 'rejected': return 'ปฏิเสธ';
            case 'pending': return 'รอดำเนินการ';
            default: return 'ไม่ระบุ';
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

    // สร้าง children ที่แสดงประวัติทั้งหมด
    const paymentHistoryContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paymentHistory?.map((item, index) => {
                console.log(`⩇⩇:⩇⩇🚨 ~ item :`, item);

                return (
                    <Card
                        key={item._id}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    รหัสการชำระ: {item.paymentId}
                                </span>
                                <span
                                    style={{
                                        color: ColorStatus.getStatusColor(item.paymentMethod),
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: ColorStatus.getStatusColor(item.paymentMethod) + '20'
                                    }}
                                >
                                    {ColorStatus.getStatusText(item.paymentMethod)}
                                </span>
                            </div>
                        }
                        variant="borderless"
                        style={{
                            width: '100%',
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
                                    {formatDate(item.updatedAt)}
                                </div>
                            </div>

                            {/* วิธีการชำระ */}
                            <div>
                                <strong>วิธีการชำระ:</strong> {ColorStatus.getStatusText(item.paymentMethod)}
                            </div>

                            {/* Reference */}
                            {item.reference && (
                                <div>
                                    <strong>หมายเลขอ้างอิง:</strong> {item.reference}
                                </div>
                            )}

                            {/* หมายเหตุ */}
                            {item.note && (
                                <div>
                                    <strong>หมายเหตุ:</strong> {item.note}
                                </div>
                            )}

                            {/* จำนวนเงินคงเหลือ */}

                        </div>
                    </Card>
                );
            })}
        </div>
    );

    // สร้าง item เดียวสำหรับ Collapse
    const collapseItems = [
        {
            key: '1',
            label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        ประวัติการชำระ
                    </span>
                    <span style={{
                        fontSize: '14px',
                        color: '#8c8c8c',
                        backgroundColor: '#f5f5f5',
                        padding: '2px 8px',
                        borderRadius: '12px'
                    }}>
                        {paymentHistory.length} รายการ
                    </span>
                </div>
            ),
            children: paymentHistoryContent,
        }
    ];

    return (
        <Collapse
            items={collapseItems}
            bordered={false}
            style={{
                backgroundColor: 'transparent'
            }}
            expandIcon={({ isActive }) => (
                <span style={{ fontSize: '14px' }}>
                    {isActive ? '▼' : '▶'}
                </span>
            )}
        />
    );
};

export default PaymentHistory;