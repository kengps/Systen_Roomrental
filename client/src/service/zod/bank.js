import { z } from 'zod';

// Schema สำหรับ Bank Account Form
export const bankAccountSchema = z.object({
    bank: z.string().min(1, 'กรุณาเลือกธนาคาร'),
    accountNumber: z
        .string()
        .min(1, 'กรุณากรอกเลขที่บัญชี')
        .regex(/^[0-9]+$/, 'เลขที่บัญชีต้องเป็นตัวเลขเท่านั้น')
        .min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก')
        .max(20, 'เลขที่บัญชีต้องไม่เกิน 20 หลัก'),
    accountName: z
        .string()
        .min(1, 'กรุณากรอกชื่อบัญชี')
        .min(2, 'ชื่อบัญชีต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อบัญชีต้องไม่เกิน 100 ตัวอักษร')
});