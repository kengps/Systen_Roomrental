import dayjs from 'dayjs';
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
// สร้าง HTML template สำหรับใบเสร็จ (สำหรับ print)
export const generateReceiptHtml = (bill) => {


    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ใบเสร็จ - ${bill.billNumber}</title>
            <style>
                body { 
                    font-family: 'Sarabun', Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    color: #333;
                    background: white;
                }
                .receipt-container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    border: 2px solid #1890ff; 
                    padding: 20px;
                    background: white;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #1890ff; 
                    padding-bottom: 15px; 
                    margin-bottom: 20px; 
                }
                .header h1 { 
                    color: #1890ff; 
                    margin: 0; 
                    font-size: 24px; 
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 10px; 
                }
                .info-label { 
                    font-weight: bold; 
                    min-width: 120px; 
                }
                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                }
                .items-table th, .items-table td { 
                    border: 1px solid #ddd; 
                    padding: 10px; 
                    text-align: left; 
                }
                .items-table th { 
                    background-color: #f5f5f5; 
                    font-weight: bold; 
                }
                .items-table td.amount { 
                    text-align: right; 
                }
                .total-section { 
                    border-top: 2px solid #1890ff; 
                    padding-top: 15px; 
                    margin-top: 20px; 
                }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px; 
                    font-size: 16px; 
                }
                .total-row.final { 
                    font-weight: bold; 
                    font-size: 18px; 
                    color: #1890ff; 
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding-top: 15px; 
                    border-top: 1px solid #ddd; 
                    font-size: 14px; 
                    color: #666; 
                }
                @media print { 
                    .no-print { display: none; } 
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <h1>ใบเสร็จรับเงิน</h1>
                    <p>Receipt</p>
                </div>
                
                <div class="info-row">
                    <span class="info-label">เลขที่ใบเสร็จ:</span>
                    <span>${bill.billNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">วันที่ชำระ:</span>
                    <span>${formatDate(bill.paidDate || bill.billDate)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ผู้เช่า:</span>
                    <span>${bill.tenant?.firstName || ''} ${bill.tenant?.lastName || ''}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ห้อง:</span>
                    <span>${bill?.roomNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ระยะเวลา:</span>
                    <span>เดือน ${getThaiMonthName(bill.billingPeriod?.month)}/${bill.billingPeriod?.year}</span>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>รายการ</th>
                            <th>รายละเอียด</th>
                            <th>ราคา/หน่วย</th>
                            <th>จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bill.items.map(item => `
                            <tr>
                                <td>${item.categoryName}</td>
                                <td>${item.description}${item.previousUnit && item.currentUnit ?
            `<br><small>หน่วยก่อนหน้า: ${item.previousUnit} → ปัจจุบัน: ${item.currentUnit} = ${item.currentUnit - item.previousUnit} หน่วย</small>` :
            ''}</td>
                                <td class="amount">${formatCurrency(item.unitPrice || 0)}</td>
                                <td class="amount">${formatCurrency(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span>รวมค่าใช้จ่าย:</span>
                        <span>${formatCurrency(bill.totalAmount)}</span>
                    </div>
                    ${bill.penaltyAmount > 0 ? `
                        <div class="total-row">
                            <span>ค่าปรับ:</span>
                            <span>${formatCurrency(bill.penaltyAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row final">
                        <span>รวมทั้งหมด:</span>
                        <span>${formatCurrency(bill.paidAmount || bill.totalAmount)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>ขอบคุณสำหรับการชำระเงิน</p>
                    <p>วันที่พิมพ์: ${dayjs().format('DD/MM/YYYY HH:mm')}</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
};


