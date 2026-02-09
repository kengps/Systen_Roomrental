import React, { useState } from 'react';
import ReceiptComponent from './ReceiptComponent';
import { message } from 'antd';

// ตัวอย่างการใช้งาน ReceiptComponent
const ReceiptExample = () => {
    const [billData] = useState({
        billNumber: 'RCP-2024-001',
        paidDate: '2024-01-15',
        billDate: '2024-01-01',
        tenant: {
            firstName: 'สมคิด',
            lastName: 'ได้แต่นึก'
        },
        roomNumber: 'A-101',
        billingPeriod: {
            month: 1,
            year: 2024
        },
        items: [
            {
                categoryName: 'ค่าเช่าห้อง',
                description: 'ค่าเช่าห้องเดือนมกราคม',
                unitPrice: 5000,
                amount: 5000
            },
            {
                categoryName: 'ค่าไฟ',
                description: 'ค่าไฟฟ้า',
                previousUnit: 100,
                currentUnit: 150,
                unitPrice: 8.5,
                amount: 425
            },
            {
                categoryName: 'ค่าน้ำ',
                description: 'ค่าน้ำประปา',
                previousUnit: 50,
                currentUnit: 80,
                unitPrice: 15,
                amount: 450
            }
        ],
        totalAmount: 5875,
        penaltyAmount: 0,
        paidAmount: 5875
    });

    const handlePrint = () => {
        window.print();
        message.success('กำลังพิมพ์ใบเสร็จ...');
    };

    const handleDownload = () => {
        // สร้าง HTML สำหรับดาวน์โหลด
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบเสร็จ - ${billData.billNumber}</title>
                <style>
                    body { font-family: 'Sarabun', Arial, sans-serif; margin: 0; padding: 20px; }
                    .receipt-container { max-width: 600px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f5f5f5; font-weight: bold; }
                    .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px; }
                    .total-row.final { font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <h1>ใบเสร็จรับเงิน</h1>
                        <p>เลขที่: ${billData.billNumber}</p>
                    </div>
                    <div class="info-row">
                        <span>วันที่ชำระ:</span>
                        <span>${new Date(billData.paidDate).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div class="info-row">
                        <span>ผู้เช่า:</span>
                        <span>${billData.tenant.firstName} ${billData.tenant.lastName}</span>
                    </div>
                    <div class="info-row">
                        <span>ห้อง:</span>
                        <span>${billData.roomNumber}</span>
                    </div>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th>รายละเอียด</th>
                                <th>จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${billData.items.map(item => `
                                <tr>
                                    <td>${item.categoryName}</td>
                                    <td>${item.description}</td>
                                    <td>${new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(item.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total-section">
                        <div class="total-row">
                            <span>รวมค่าใช้จ่าย:</span>
                            <span>${new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(billData.totalAmount)}</span>
                        </div>
                        <div class="total-row final">
                            <span>รวมทั้งหมด:</span>
                            <span>${new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(billData.paidAmount)}</span>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                        <p>ขอบคุณสำหรับการชำระเงิน</p>
                        <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ใบเสร็จ-${billData.billNumber}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        message.success('ดาวน์โหลดใบเสร็จเรียบร้อยแล้ว');
    };

    return (
        <div>
            <h2>ตัวอย่างการใช้งาน ReceiptComponent</h2>
            <ReceiptComponent 
                bill={billData}
                onPrint={handlePrint}
                onDownload={handleDownload}
            />
        </div>
    );
};

export default ReceiptExample;
