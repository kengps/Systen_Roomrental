export class ColorStatus {

    // กำหนดสีตาม paymentMethod
    static getStatusColor = (paymentMethod) => {
        switch (paymentMethod) {
            case 'transfer': return '#52c41a'; // เขียว - โอนเงิน
            case 'rejected': return '#ff4d4f'; // เขียว - โอนเงิน
            case 'cash': return '#1890ff'; // น้ำเงิน - เงินสด
            case 'cancelled': return '#ff4d4f'; // แดง - ยกเลิก
            case 'pending': return '#faad14'; // เหลือง - รอดำเนินการ
            case 'โอนผ่านธนาคาร': return 'green'; // เหลือง - รอดำเนินการ
            default: return '#8c8c8c'; // เทา
        }
    };

    // กำหนดข้อความตาม paymentMethod
    static getStatusText = (paymentMethod) => {
        switch (paymentMethod) {
            case 'transfer': return 'โอนเงิน';
            case 'cash': return 'เงินสด';
            case 'cancelled': return 'ยกเลิก';
            case 'rejected': return 'ปฏิเสธ';
            case 'pending': return 'รอดำเนินการ';
            case 'โอนผ่านธนาคาร': return 'โอนเงิน';
            default: return 'ไม่ระบุ';
        }
    };

    // แปลงวันที่
    static formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

}