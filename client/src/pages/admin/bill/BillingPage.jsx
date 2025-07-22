import {
  DeleteOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Input,
  InputNumber,
  Select,
  Typography,
  message
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from 'react-toastify';
import { createBilling, getBilling, getDataBill } from "../../../service/api/bill";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";
import BillingForm from "../components/billing/BillingForm";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const { Title, Text } = Typography;
const { Option } = Select;

const thaiMonthMap = {
  "มกราคม": 1,
  "กุมภาพันธ์": 2,
  "มีนาคม": 3,
  "เมษายน": 4,
  "พฤษภาคม": 5,
  "มิถุนายน": 6,
  "กรกฎาคม": 7,
  "สิงหาคม": 8,
  "กันยายน": 9,
  "ตุลาคม": 10,
  "พฤศจิกายน": 11,
  "ธันวาคม": 12,
};

// --- MAIN APP COMPONENT ---
export default function BillingSystem() {
  const { apartmentData, user } = persistMiddleware();

  const { addressLine, apartmentName, phones } = apartmentData?.result;


  const accountId = user?.userPayLoad?.user?.id;

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["listDataBill", accountId], // เพิ่ม accountId ใน key เพื่อการ cache ที่ถูกต้อง
    queryFn: () => getDataBill(accountId),
    enabled: !!accountId,
  });
  console.log(`⩇⩇:⩇⩇🚨 ~ BillingSystem ~ data :`, data);




  const month = dayjs().format("MMMM")
  const monthNumber = thaiMonthMap[month]

  const year = dayjs().year() + 543




  const { data: dataBilling, isError: isErrorBilling, isLoading: isLoadingBilling, refetch: refetchBilling } = useQuery({
    queryKey: ["listBilling", accountId], // เพิ่ม accountId ใน key เพื่อการ cache ที่ถูกต้อง
    queryFn: () => getBilling(accountId, monthNumber, year),
    enabled: !!accountId && !!monthNumber && !!year,
  });





  // ... state เดิม
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  // 👇 เพิ่ม State สำหรับจัดการตัวเลือก "อื่นๆ"
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherDescription, setOtherDescription] = useState("");
  const [otherAmount, setOtherAmount] = useState(0);


  const detailApartment = data?.apartment;


  const detailTenant = data?.tenants;





  const apartmentInfoForUI = {
    name: apartmentName,
    address: addressLine,
    phone: phones,
  };

  // 2. ใช้ useMemo เพื่อป้องกันการสร้าง array ใหม่ทุกครั้ง
  // const tenantDataForUI = useMemo(() => {
  //   if (!detailTenant) return [];
  //   return detailTenant.map((item) => ({
  //     id: item._id,
  //     name: item.firstName + " " + item.lastName,
  //     floor: item.room.floor,
  //     roomNumber: item.room.roomNumber,
  //     price: item.room.price,
  //     prevWater: item.room.meter.water,
  //     prevElectric: item.room.meter.electric,
  //     serviceUsage: item.serviceUsage,
  //     phone: item.phone,
  //   }));
  // }, [detailTenant]);

  // const tenantDataForUI2 = useMemo(() => {
  //   if (!detailTenant || !dataBilling) return [];

  //   // ✅ กรองบิลตามเดือนและปีที่ต้องการ
  //   const billedTenantIds = Array.isArray(dataBilling?.data)
  //     ? dataBilling.data
  //       .filter(
  //         (bill) =>
  //           bill.billingPeriod.month === selectedMonth &&
  //           bill.billingPeriod.year === selectedYear
  //       )
  //       .map((bill) => bill.tenant)
  //     : [];


  //   // ✅ เอาเฉพาะผู้เช่าที่ยังไม่ออกบิลในเดือนนั้น
  //   const unbilledTenants = detailTenant.filter(
  //     (item) => !billedTenantIds.includes(item._id)
  //   );

  //   return unbilledTenants.map((item) => ({
  //     id: item._id,
  //     name: item.firstName + " " + item.lastName,
  //     floor: item.room.floor,
  //     roomNumber: item.room.roomNumber,
  //     price: item.room.price,
  //     prevWater: item.room.meter.water,
  //     prevElectric: item.room.meter.electric,
  //     serviceUsage: item.serviceUsage,
  //     phone: item.phone,
  //   }));
  // }, [detailTenant, dataBilling, selectedMonth, selectedYear]);



  // const tenantDataForUI = useMemo(() => {
  //   if (!detailTenant || !dataBilling) return [];

  //   // หารายชื่อ tenantId ที่ออกบิลแล้ว
  //   const billedTenantIds = dataBilling?.data?.map((bill) => bill.tenant);

  //   // กรองเฉพาะคนที่ยังไม่มีใน billedTenantIds
  //   const unbilledTenants = detailTenant?.filter(
  //     (item) => !billedTenantIds.includes(item._id)
  //   );

  //   return unbilledTenants.map((item) => ({
  //     id: item._id,
  //     name: item.firstName + " " + item.lastName,
  //     floor: item.room.floor,
  //     roomNumber: item.room.roomNumber,
  //     price: item.room.price,
  //     prevWater: item.room.meter.water,
  //     prevElectric: item.room.meter.electric,
  //     serviceUsage: item.serviceUsage,
  //     phone: item.phone,
  //   }));
  // }, [detailTenant, dataBilling]);

  const tenantDataForUI3 = useMemo(() => {
    if (!detailTenant || !dataBilling) return [];

    const billedTenantIds = Array.isArray(dataBilling?.data)
      ? dataBilling.data.map((bill) => bill.tenant)
      : [];

    return detailTenant.map((item) => ({
      id: item._id,
      name: `${item.firstName} ${item.lastName}`,
      floor: item.room.floor,
      roomNumber: item.room.roomNumber,
      price: item.room.price,
      prevWater: item.room.meter.water,
      prevElectric: item.room.meter.electric,
      serviceUsage: item.serviceUsage,
      phone: item.phone,
      isBilled: billedTenantIds.includes(item._id), // ✅ ใส่สถานะตรงนี้
    }));
  }, [detailTenant, dataBilling]);


  const tenantDataForUI = useMemo(() => {
    if (!detailTenant || !dataBilling) return [];

    const billedTenantIds = Array.isArray(dataBilling?.data)
      ? dataBilling.data
        .filter(
          (bill) =>
            bill.billingPeriod.month === monthNumber &&
            bill.billingPeriod.year === year
        )
        .map((bill) => bill.tenant)
      : [];

    return detailTenant.map((item) => ({
      id: item._id,
      name: `${item.firstName} ${item.lastName}`,
      floor: item.room.floor,
      roomNumber: item.room.roomNumber,
      price: item.room.price,
      prevWater: item.room.meter.water,
      prevElectric: item.room.meter.electric,
      serviceUsage: item.serviceUsage,
      phone: item.phone,
      isBilled: billedTenantIds.includes(item._id), // ✅ มี flag สถานะแล้ว
    }));
  }, [detailTenant, dataBilling, monthNumber, year]);


  // ใน BillingSystem.jsx

  // ...

  // 👇 แก้ไข useMemo ส่วนนี้ทั้งหมด
  // const tenantOptions = useMemo(() => {
  //   if (!detailTenant) return [];
  //   if (isLoadingBilling) {
  //     return [{ label: 'กำลังตรวจสอบข้อมูลบิล...', options: [] }];
  //   }

  //   // 👇 --- ส่วนที่แก้ไข --- 👇
  //   // 1. ดึง array ของบิลออกจาก object ที่ API ส่งมา
  //   const bills = dataBilling?.data || [];

  //   // 2. สร้าง Set จาก array ของบิลนั้นๆ
  //   const tenantIdsWithBills = new Set(bills.map(bill => bill.tenant));
  //   // -------------------------

  //   const availableTenants = detailTenant.filter(
  //     tenant => !tenantIdsWithBills.has(tenant._id)
  //   );

  //   const billedTenants = detailTenant.filter(
  //     tenant => tenantIdsWithBills.has(tenant._id)
  //   );

  //   return [
  //     {
  //       label: `ยังไม่ได้ออกบิล (${availableTenants.length})`,
  //       options: availableTenants.map(t => ({
  //         label: `ห้อง ${t.room?.roomNumber} - ${t.firstName} ${t.lastName}`,
  //         value: t._id,
  //       })),
  //     },
  //     {
  //       label: `ออกบิลแล้ว (${billedTenants.length})`,
  //       options: billedTenants.map(t => ({
  //         label: `ห้อง ${t.room?.roomNumber} - ${t.firstName} ${t.lastName}`,
  //         value: t._id,
  //         disabled: true,
  //       })),
  //     }
  //   ];

  // }, [detailTenant, dataBilling, isLoadingBilling]);





  // ดึงข้อมูล services จาก detailApartment
  const services = detailApartment?.services;

  // ใช้ useMemo เพื่อสร้าง options สำหรับ Select
  const serviceOptions = useMemo(() => {
    // กรองเอาเฉพาะ service ที่ enable และมีชื่อ
    if (!services) return [];
    return services
      .filter((s) => s.enabled && s.name)
      .map((s) => ({
        name: s.name,
        price: s.price,
      }));
  }, [services]);


  const { control, setValue, getValues, watch, handleSubmit, reset, formState: { isValid } } = useForm({
    mode: 'onChange', // <--- เพิ่มบรรทัดนี้
    defaultValues: {
      tenantId: "",
      tenantInfo: "",
      billingPeriod: {
        month: dayjs().format("MMMM"),
        year: dayjs().year() + 543,
      },
      roomCharges: {
        monthlyRent: "",
        deposit: 0,
        internetFee: "",
        previousBalance: "",
      },
      utilities: {
        electricPrevious: "",
        electricCurrent: "",
        electricRate: "",
        electricFlatRate: 0, // เพิ่มบรรทัดนี้
        waterPrevious: "",
        waterCurrent: "",
        waterRate: "",
        waterFlatRate: 0, // เพิ่มบรรทัดนี้
      },
      additionalCharges: [

      ],
      discounts: [], // 👈 เพิ่ม state สำหรับส่วนลด
    },
  });

  const printRef = useRef();
  const formData = useWatch({ control });
  const selectedTenantId = watch("tenantId");

  const isFormDisabled = !selectedTenantId;

  const prevElectricMeter = useWatch({
    control,
    name: "utilities.electricPrevious"
  })
  const prevWaterMeter = useWatch({
    control,
    name: "utilities.waterPrevious"
  })



  useEffect(() => {
    const selectedTenant = tenantDataForUI?.find(
      (t) => t.id === selectedTenantId
    );

    const electricMeter = detailApartment?.meters?.find(
      (m) => m.meterType === "electric"
    );
    const waterMeter = detailApartment?.meters?.find(
      (m) => m.meterType === "water"
    );

    if (selectedTenant) {
      setValue("tenantInfo", selectedTenant);
      setValue("roomCharges.monthlyRent", selectedTenant.price);
      setValue("utilities.electricPrevious", selectedTenant.prevElectric);
      setValue("utilities.waterPrevious", selectedTenant.prevWater);

      if (electricMeter) {
        const rate =
          electricMeter.billingType === "perUnit"
            ? electricMeter.rate
            : electricMeter.flatRate;
        setValue("utilities.electricRate", rate);
      }

      if (waterMeter) {
        const rate =
          waterMeter.billingType === "perUnit"
            ? waterMeter.rate
            : waterMeter.flatRate;
        setValue("utilities.waterRate", rate);
      }
      // ตั้งราคาต่อหน่วยของค่าไฟ
      if (electricMeter) {
        if (electricMeter.billingType === 'perUnit') {
          setValue("utilities.electricRate", electricMeter.rate);
        } else { // flatRate
          setValue("utilities.electricFlatRate", electricMeter.flatRate);
        }
      }

      // ตั้งราคาต่อหน่วยของค่าน้ำ
      if (waterMeter) {
        if (waterMeter.billingType === 'perUnit') {
          setValue("utilities.waterRate", waterMeter.rate);
        } else { // flatRate
          setValue("utilities.waterFlatRate", waterMeter.flatRate);
        }
      }
      if (selectedTenant.serviceUsage?.length > 0) {
        const additionalChargesFromTenant = selectedTenant.serviceUsage.map(
          (service) => ({
            id: service._id,
            description: service.name,
            amount: service.price,
            type: 'existing', // 👈 กำหนด type ใหม่สำหรับบริการที่มีอยู่แล้ว
          })
        );
        setValue("additionalCharges", additionalChargesFromTenant);
      } else {
        setValue("additionalCharges", []);
      }

    }
  }, [selectedTenantId, tenantDataForUI, detailApartment]); // 3. นำ setValue ออก



  const electricMeter = detailApartment?.meters?.find(
    (m) => m.meterType === "electric"
  );
  const waterMeter = detailApartment?.meters?.find(
    (m) => m.meterType === "water"
  );

  const calculateUtilities = () => {
    const { utilities } = formData;
    let electricCost = 0;
    let waterCost = 0;
    let electricUsage = 0;
    let waterUsage = 0;

    // Calculate Electric Cost
    if (electricMeter?.billingType === "flatRate") {
      electricCost = utilities.electricFlatRate || 0;
    } else {
      electricUsage = Math.max(
        0,
        utilities.electricCurrent - utilities.electricPrevious
      );
      electricCost = electricUsage * utilities.electricRate;
    }

    // Calculate Water Cost
    if (waterMeter?.billingType === "flatRate") {
      waterCost = utilities.waterFlatRate || 0;
    } else {
      waterUsage = Math.max(
        0,
        utilities.waterCurrent - utilities.waterPrevious
      );
      waterCost = waterUsage * utilities.waterRate;
    }

    return { electricUsage, electricCost, waterUsage, waterCost };
  };

  const { electricUsage, waterUsage, electricCost, waterCost } =
    calculateUtilities();

  const calculateTotal = () => {
    const { roomCharges, additionalCharges, discounts } = formData;


    const monthlyTotal =
      (roomCharges.monthlyRent || 0) + (roomCharges.internetFee || 0);
    const utilitiesTotal = (electricCost || 0) + (waterCost || 0);
    const additionalTotal = additionalCharges.reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    );

    const discountsTotal = discounts.reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    );

    const subtotal =
      monthlyTotal +
      utilitiesTotal +
      additionalTotal +
      (roomCharges.previousBalance || 0);
    return subtotal - (roomCharges.deposit || 0) - (discountsTotal || 0);
  };


  const total = calculateTotal();

  const handleNotifyPayment = () => {
    const { tenantInfo, billingPeriod, roomCharges, additionalCharges, discounts } =
      formData;

    let summaryLines = [];
    summaryLines.push(`แจ้งยอดค่าบริการห้อง ${tenantInfo.roomNumber} 🛎️`);
    summaryLines.push(
      `ประจำเดือน ${billingPeriod.month} ${billingPeriod.year}`
    );
    summaryLines.push(`-----------------------------------`);

    if (roomCharges.monthlyRent > 0)
      summaryLines.push(
        `- ค่าเช่า: ${roomCharges.monthlyRent.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} บาท`
      );

    // 👇 เพิ่มส่วนลดเข้าไปในข้อความสรุป
    if (discounts.length > 0) {
      summaryLines.push(`-----------------------------------`);
      summaryLines.push(`รายการส่วนลด 🎉:`);
      discounts.forEach((discount) => {
        if (discount.amount > 0)
          summaryLines.push(`- ${discount.description}: -${discount.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} บาท`);
      });
    }

    // if (roomCharges.internetFee > 0)
    //   summaryLines.push(
    //     `- ค่าอินเทอร์เน็ต: ${roomCharges.internetFee.toLocaleString("en-US", {
    //       minimumFractionDigits: 2,
    //     })} บาท`
    //   );
    if (electricCost > 0)
      summaryLines.push(
        `- ค่าไฟ (${electricUsage} หน่วย): ${electricCost.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2 }
        )} บาท`
      );
    if (waterCost > 0)
      summaryLines.push(
        `- ค่าน้ำ (${waterUsage} หน่วย): ${waterCost.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} บาท`
      );

    additionalCharges.forEach((charge) => {
      if (charge.amount > 0)
        summaryLines.push(
          `- ${charge.description}: ${charge.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })} บาท`
        );
    });

    if (roomCharges.previousBalance > 0) {
      summaryLines.push(
        `- ยอดค้างชำระ: ${roomCharges.previousBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} บาท`
      );
    }
    summaryLines.push(`-----------------------------------`);
    summaryLines.push(
      `✅ ยอดรวมทั้งสิ้น: ${total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })} บาท`
    );

    if (roomCharges.deposit > 0) {
      summaryLines.push(
        `(หักเงินมัดจำแล้ว: ${roomCharges.deposit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} บาท)`
      );
    }

    const summaryText = summaryLines.join("\n");

    const textArea = document.createElement("textarea");
    textArea.value = summaryText;
    textArea.style.position = "fixed";
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      message.success("คัดลอกข้อความสรุปแล้ว! สามารถนำไปวางใน LINE ได้เลย");
    } catch (err) {
      console.error("Could not copy text: ", err);
      message.error("ไม่สามารถคัดลอกข้อความได้");
    }

    document.body.removeChild(textArea);
  };

  // 1. ฟังก์ชันสำหรับเพิ่มแถวที่เป็น Dropdown เลือกบริการ
  const addServiceCharge = () => {
    const newCharge = {
      id: Date.now(),
      description: "", // ค่าเริ่มต้นเป็นว่าง
      amount: 0,
      type: "service", // << เพิ่ม type เพื่อระบุว่าเป็นรายการจาก service
    };
    setValue("additionalCharges", [...formData.additionalCharges, newCharge]);
  };

  // 2. ฟังก์ชันสำหรับเพิ่มแถวที่เป็น Input กรอกเอง
  const addCustomCharge = () => {
    const newCharge = {
      id: Date.now(),
      description: "",
      amount: 0,
      type: "custom", // << เพิ่ม type เพื่อระบุว่าเป็นรายการที่กรอกเอง
    };
    setValue("additionalCharges", [...formData.additionalCharges, newCharge]);
  };
  const addCharge = () => {
    const newCharge = { id: Date.now(), description: "", amount: 0 };
    setValue("additionalCharges", [...formData.additionalCharges, newCharge]);
  };

  const removeCharge = (id) => {
    setValue(
      "additionalCharges",
      formData.additionalCharges.filter((charge) => charge.id !== id)
    );
  };

  // ... ภายในคอมโพเนนท์ PaymentSystem

  const additionalChargeColumns = [
    {
      title: "รายการ",
      dataIndex: "description",
      key: "description",
      render: (text, record, index) => {
        // ถ้าเป็นรายการที่กรอกเอง (custom) ให้แสดงเป็น Input
        if (record.type === 'custom') {
          return (
            <Controller
              control={control}
              name={`additionalCharges.${index}.description`}
              render={({ field }) => <Input {...field} placeholder="ระบุรายการ..." />}
            />
          );
        }
        // ถ้าเป็นรายการจาก service หรือ existing ให้แสดงเป็น Text ธรรมดา
        return text;
      },
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      width: "150px",
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`additionalCharges.${index}.amount`}
          render={({ field }) => (
            <InputNumber
              {...field}
              prefix="฿"
              style={{ width: "100%" }}
              // 👈 ถ้าเป็น service หรือ existing ให้ lock
              readOnly={record.type === 'service' || record.type === 'existing'}
            />
          )}
        />
      ),
    },
    {
      title: "ดำเนินการ",
      key: "action",
      width: "100px",
      align: "center",
      render: (_, record) => {
        // 👈 ถ้าเป็นบริการที่มีอยู่แล้ว (existing) ไม่ต้องแสดงปุ่มลบ
        if (record.type === 'existing') {
          return null; // หรือ <></>
        }
        // รายการอื่นๆ ยังลบได้เหมือนเดิม
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeCharge(record.id)}
          />
        );
      },
    },
  ];

  // ... ภายในคอมโพเนนท์ PaymentSystem

  // ฟังก์ชันเพิ่มส่วนลด
  const addDiscount = () => {
    const newDiscount = { id: Date.now(), description: "ส่วนลดพิเศษ", amount: 100 };
    setValue("discounts", [...formData.discounts, newDiscount]);
  };

  // ฟังก์ชันลบส่วนลด
  const removeDiscount = (id) => {
    setValue(
      "discounts",
      formData.discounts.filter((discount) => discount.id !== id)
    );
  };






  const handleOkBilling = async () => {
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.tenantInfo?.id) {
      message.error("กรุณาเลือกผู้เช่าก่อนทำการบันทึก");
      return;
    }

    // 2. ดึงข้อมูลที่จำเป็นทั้งหมดจาก form state และค่าที่คำนวณไว้
    const {
      tenantInfo,
      billingPeriod,
      roomCharges,
      utilities,
      additionalCharges,
      discounts
    } = formData;


    // ดึงค่าที่คำนวณไว้นอกฟอร์ม
    const { electricUsage, waterUsage, electricCost, waterCost } = calculateUtilities();
    const grandTotal = calculateTotal();

    // 3. สร้าง Payload ที่สมบูรณ์สำหรับส่งไปบันทึก

    const mountName = billingPeriod.month
    const mountNumber = thaiMonthMap[mountName] || null
    const billPayload = {
      // ข้อมูลผู้รับบิลและอพาร์ตเมนต์
      accountId: accountId,
      tenantId: tenantInfo.id,
      apartmentId: detailApartment?._id,

      // ข้อมูลรอบบิล
      billingPeriod: {
        month: thaiMonthMap[billingPeriod.month] || null,
        year: billingPeriod.year,
      },

      // วันที่ออกบิลและวันครบกำหนด (ตัวอย่าง: ครบกำหนดใน 7 วัน)
      issueDate: dayjs().toISOString(),
      dueDate: dayjs().add(detailApartment?.billingSettings?.paymentDueDate || 7, 'day').toISOString(),

      // รายการค่าใช้จ่ายหลัก
      roomCharge: {
        monthlyRent: roomCharges.monthlyRent || 0,
        previousBalance: roomCharges.previousBalance || 0,
      },

      // รายการค่าน้ำ-ค่าไฟ
      utilityCharges: {
        electricity: {
          billingType: electricMeter?.billingType,
          previousReading: utilities.electricPrevious || 0,
          currentReading: utilities.electricCurrent || 0,
          usage: electricUsage,
          rate: utilities.electricRate || 0,
          flatRate: utilities.electricFlatRate || 0,
          cost: electricCost,
        },
        water: {
          billingType: waterMeter?.billingType,
          previousReading: utilities.waterPrevious || 0,
          currentReading: utilities.waterCurrent || 0,
          usage: waterUsage,
          rate: utilities.waterRate || 0,
          flatRate: utilities.waterFlatRate || 0,
          cost: waterCost,
        },
      },

      // รายการอื่นๆ
      otherCharges: additionalCharges.map(charge => ({
        description: charge.description,
        amount: charge.amount,
      })),

      // รายการส่วนลด
      discounts: discounts.map(discount => ({
        description: discount.description,
        amount: discount.amount,
      })),

      // ยอดรวม
      subTotal: (roomCharges.monthlyRent || 0) + electricCost + waterCost + additionalCharges.reduce((sum, charge) => sum + charge.amount, 0),
      totalDiscount: discounts.reduce((sum, d) => sum + d.amount, 0),
      totalAmount: grandTotal,

      // สถานะเริ่มต้นของบิล
      status: 'unpaid',
    };

    console.log("✅ Final Bill Payload:", billPayload);



    try {

      const res = await createBilling(billPayload)
      console.log(`⩇⩇:⩇⩇🚨 ~ handleOkBilling ~ res :`, res);
      reset()

      if (res.success === true) {
        toast.success(`สร้างบิลสำเร็จ`)
      }
      if (res.success === false) {
        throw res.error
      }

      message.success("สร้างข้อมูลสำหรับส่งไปบันทึกสำเร็จแล้ว (ดูใน Console)");

    } catch (error) {
      console.log(`⩇⩇:⩇⩇🚨 ~ handleOkBilling ~ error :`, error);

      toast.error(error)
    }
  };
  // ... ภายในคอมโพเนนท์ PaymentSystem

  // ...



  const handleAddSelectedServices = () => {
    // 1. จัดการกับ Service ที่มีอยู่แล้ว (เหมือนเดิม)
    const newChargesFromList = selectedServices.map(serviceName => {
      const service = serviceOptions.find(s => s.name === serviceName);
      return {
        id: `${Date.now()}-${service.name}`,
        description: service.name,
        amount: service.price,
        type: 'service',
      };
    });

    let allNewCharges = [...newChargesFromList];

    // 2. จัดการกับรายการ "อื่นๆ" ถ้าถูกเลือกและกรอกข้อมูล
    if (isOtherSelected && otherDescription && otherAmount > 0) {
      const otherCharge = {
        id: `${Date.now()}-other`,
        description: otherDescription,
        amount: otherAmount,
        type: 'custom', // "อื่นๆ" ถือเป็น type custom
      };
      allNewCharges.push(otherCharge);
    }

    // 3. เพิ่มรายการใหม่ทั้งหมดเข้าไปในตาราง
    const existingDescriptions = formData.additionalCharges.map(c => c.description);
    const chargesToAdd = allNewCharges.filter(c => !existingDescriptions.includes(c.description));

    setValue("additionalCharges", [...formData.additionalCharges, ...chargesToAdd]);

    // 4. ปิด Modal และรีเซ็ต State ทั้งหมด
    setIsServiceModalVisible(false);
    setSelectedServices([]);
    setIsOtherSelected(false);
    setOtherDescription("");
    setOtherAmount(0);
  };



  return (
    <>
      <BillingForm
        handleNotifyPayment={handleNotifyPayment}
        control={control}
        tenantDataForUI={tenantDataForUI}
        formData={formData}
        electricMeter={electricMeter}
        electricCost={electricCost}
        total={total}
        handleOkBilling={handleOkBilling}
        isValid={isValid}
        isFormDisabled={isFormDisabled}

        waterMeter={waterMeter}
        waterCost={waterCost}
        waterUsage={waterUsage}
        setIsServiceModalVisible={setIsServiceModalVisible}
        isServiceModalVisible={isServiceModalVisible}


        addDiscount={addDiscount}
        printRef={printRef}
        apartmentInfoForUI={apartmentInfoForUI}
        phones={phones}

        handleAddSelectedServices={handleAddSelectedServices}
        setSelectedServices={setSelectedServices}
        serviceOptions={serviceOptions}
        selectedServices={selectedServices}
        isOtherSelected={isOtherSelected}
        electricUsage={electricUsage}
        additionalChargeColumns={additionalChargeColumns}
        getValues={getValues}
        removeDiscount={removeDiscount}

      />
    </>
  );
}
