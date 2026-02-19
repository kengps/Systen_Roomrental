// --- Zod Schema for Validation ---
import {z} from "zod";

export const addTenantSchema = z.object({
    prefix: z.string(),
    firstName: z.string().min(1, {message: "กรุณากรอกชื่อจริง"}),
    lastName: z.string().min(1, {message: "กรุณากรอกนามสกุล"}),
    nickName: z.string().optional().or(z.literal('')),
    username: z.string().min(1, {message: "กรุณากรอกไอดี"}),
    password: z.string().min(1, {message: "กรุณากรอกรหัสผ่าน"}),
    phoneNumber: z
        .string()
        .min(9, {message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"}),
    nationalId: z.string().optional().or(z.literal('')),
    floor: z.number({
        required_error: "กรุณาเลือกชั้น",
        invalid_type_error: "กรุณาเลือกชั้น",
    }),
    roomId: z.string({required_error: "กรุณาเลือกห้อง"}),
    roomNumber: z.number().optional(),
    price: z.number().optional(),
    deposit: z.coerce
        .number({invalid_type_error: "กรุณากรอกค่ามัดจำ"})
        .min(1, {message: "ค่ามัดจำต้องเป็นตัวเลขและมากกว่า 0"}),
    contractDuration: z.coerce
        .number()
        .min(1, {message: "กรุณาระบุระยะเวลาสัญญา"}),
    moveInDate: z.date({
        required_error: "กรุณาเลือกวันที่เข้าพัก",
        invalid_type_error: "รูปแบบวันที่ไม่ถูกต้อง",
    }),
    address: z.string().optional().or(z.literal('')),
    email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    facebook: z.string().optional().or(z.literal('')),
    lineId: z.string().optional().or(z.literal('')),
    education: z.string().optional().or(z.literal('')),
    faculty: z.string().optional().or(z.literal('')),
    majorOrPosition: z.string().optional().or(z.literal('')),
    studentOrEmployeeId: z.string().optional().or(z.literal('')),
    emergencyName: z.string().optional().or(z.literal('')),
    emergencyRelation: z.string().optional().or(z.literal('')),
    emergencyPhone: z.string().optional().or(z.literal('')),
    vehicleType: z.string().optional().or(z.literal('')),
    vehicleDetail: z.string().optional().or(z.literal('')),
    vehiclePlate: z.string().optional().or(z.literal('')),
    wifiCode: z.string().optional().or(z.literal('')),
    internetCode: z.string().optional().or(z.literal('')),
    remarks: z.string().optional().or(z.literal('')),
});

export const editTenantSchema = z
    .object({
        tenancyStatus: z.enum(["renting", "moved"]),
        moveOutDate: z.date().nullable().optional(),
        disableAccount: z.boolean().default(true).optional(),
    })
    .refine(
        (data) => {
            if (data.tenancyStatus === "moved" && !data.moveOutDate) return false;
            return true;
        },
        {message: "กรุณาระบุวันที่ย้ายออก", path: ["moveOutDate"]}
    );
