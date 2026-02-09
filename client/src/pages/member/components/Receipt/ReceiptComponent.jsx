import React from 'react';
import dayjs from 'dayjs';
import './ReceiptComponent.css';

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

const getThaiMonthName = (monthNumber) => {
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return months[monthNumber - 1] || '';
};

const ReceiptComponent = ({ bill, onPrint, onDownload }) => {
    if (!bill) {
        return <div className="receipt-error">ไม่พบข้อมูลใบเสร็จ</div>;
    }

    return (
        <div className="receipt-wrapper">
            <div className="receipt-container">
                {/* Header */}
                <div className="receipt-header">
                    <h1>ใบเสร็จรับเงิน</h1>
                    <p className="receipt-subtitle">Payment Receipt</p>
                    <div className="receipt-number">
                        เลขที่: {bill.billNumber}
                    </div>
                </div>

                {/* Info Section */}
                <div className="receipt-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">วันที่ชำระ</span>
                            <span className="info-value">{formatDate(bill.paidDate || bill.billDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ผู้เช่า</span>
                            <span className="info-value">{bill.tenant?.firstName || ''} {bill.tenant?.lastName || ''}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ห้อง</span>
                            <span className="info-value">{bill?.roomNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ระยะเวลา</span>
                            <span className="info-value">เดือน {getThaiMonthName(bill.billingPeriod?.month)}/{bill.billingPeriod?.year}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">สถานะ</span>
                            <span className="info-value">
                                <span className="status-badge">ชำระแล้ว</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="receipt-items">
                    <h3 className="section-title">รายละเอียดค่าใช้จ่าย</h3>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th>รายละเอียด</th>
                                <th>ราคา/หน่วย</th>
                                <th>จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td><strong>{item.categoryName}</strong></td>
                                    <td>
                                        {item.description}
                                        {item.previousUnit && item.currentUnit && (
                                            <div className="unit-details">
                                                หน่วยก่อนหน้า: {item.previousUnit} → ปัจจุบัน: {item.currentUnit} = {item.currentUnit - item.previousUnit} หน่วย
                                            </div>
                                        )}
                                    </td>
                                    <td className="amount">{formatCurrency(item.unitPrice || 0)}</td>
                                    <td className="amount">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Section */}
                <div className="receipt-total">
                    <div className="total-row">
                        <span>รวมค่าใช้จ่าย:</span>
                        <span>{formatCurrency(bill.totalAmount)}</span>
                    </div>
                    {bill.penaltyAmount > 0 && (
                        <div className="total-row">
                            <span>ค่าปรับ:</span>
                            <span>{formatCurrency(bill.penaltyAmount)}</span>
                        </div>
                    )}
                    <div className="total-row final">
                        <span>รวมทั้งหมด:</span>
                        <span>{formatCurrency(bill.paidAmount || bill.totalAmount)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="receipt-footer">
                    <p><strong>ขอบคุณสำหรับการชำระเงิน</strong></p>
                    <p>Thank you for your payment</p>
                    <p className="print-date">วันที่พิมพ์: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
                </div>

                {/* Action Buttons */}
                <div className="receipt-actions">
                    {onPrint && (
                        <button className="btn-print" onClick={onPrint}>
                            🖨️ พิมพ์
                        </button>
                    )}
                    {onDownload && (
                        <button className="btn-download" onClick={onDownload}>
                            💾 ดาวน์โหลด
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptComponent;
