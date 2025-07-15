exports.calculateTotal = (bill) => {
    // 1️⃣ รวม room charge
    const roomTotal = (bill.roomCharge?.monthlyRent || 0) + (bill.roomCharge?.previousBalance || 0);

    // 2️⃣ รวม utility charges
    let utilityTotal = 0;
    if (bill.utilityCharges) {
        const { electricity, water } = bill.utilityCharges;
        utilityTotal += electricity?.cost || 0;
        utilityTotal += water?.cost || 0;
        // ถ้ามีค่าน้ำ ค่าไฟอื่น ๆ เพิ่มเติม ก็รวมตรงนี้ได้
    }

    // 3️⃣ รวม other charges
    const otherTotal = (bill.otherCharges || []).reduce((sum, c) => {
        return sum + (c.amount || 0);
    }, 0);

    // 4️⃣ รวม discounts
    const discountTotal = (bill.discounts || []).reduce((sum, d) => {
        return sum + (d.amount || 0);
    }, 0);

    // 5️⃣ รวมทั้งหมด
    const subTotal = roomTotal + utilityTotal + otherTotal;
    const totalAmount = subTotal - discountTotal;

    return {
        roomTotal,
        utilityTotal,
        otherTotal,
        discountTotal,
        subTotal,
        totalAmount
    };
}

