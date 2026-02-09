export const calculateFine = (today, billDate, lateFeePerDay, cutoffDayNumber, paymentDueDate) => {

    // const morkDate = dayjs('2025-07-06T09:06:04.936Z')
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
