import {
  CalculatorOutlined,
  CalendarOutlined,
  CopyOutlined,
  DeleteOutlined,
  DropboxOutlined,
  HomeOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { getDataBill } from "../../../service/api/bill";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const { Title, Text } = Typography;
const { Option } = Select;


// --- MAIN APP COMPONENT ---
export default function PaymentSystem() {
  const { apartmentData, user } = persistMiddleware();
  const { addressLine, apartmentName, phones } = apartmentData?.result;

  const accountId = user?.userPayLoad?.user?.id;

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["listDataBill", accountId], // เพิ่ม accountId ใน key เพื่อการ cache ที่ถูกต้อง
    queryFn: () => getDataBill(accountId),
    enabled: !!accountId,
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
  const tenantDataForUI = useMemo(() => {
    if (!detailTenant) return [];
    return detailTenant.map((item) => ({
      id: item._id,
      name: item.firstName + " " + item.lastName,
      floor: item.room.floor,
      roomNumber: item.room.roomNumber,
      price: item.room.price,
      prevWater: item.room.meter.water,
      prevElectric: item.room.meter.electric,
      serviceUsage: item.serviceUsage,
      phone: item.phone,
    }));
  }, [detailTenant]);

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


  const { control, setValue, watch, handleSubmit } = useForm({
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
    console.log(`⩇⩇:⩇⩇🚨 ~ calculateTotal ~ discounts :`, discounts);



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




  const renderWaterBill = () => {
    const isPerUnit = waterMeter?.billingType === "perUnit"
    const label = isPerUnit ? `ค่าน้ำ (${waterUsage} หน่วย)` : "ค่าน้ำ (เหมาจ่าย)"

    return (
      <>
        <Text>{label}</Text>
        <Text>฿{waterCost.toLocaleString()}</Text>
      </>
    )
  }

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
    console.log(`⩇⩇:⩇⩇🚨 ~ handleOkBilling ~ utilities :`, utilities);


    // ดึงค่าที่คำนวณไว้นอกฟอร์ม
    const { electricUsage, waterUsage, electricCost, waterCost } = calculateUtilities();
    const grandTotal = calculateTotal();

    // 3. สร้าง Payload ที่สมบูรณ์สำหรับส่งไปบันทึก
    const billPayload = {
      // ข้อมูลผู้รับบิลและอพาร์ตเมนต์
      tenantId: tenantInfo.id,
      apartmentId: detailApartment?._id,

      // ข้อมูลรอบบิล
      billingPeriod: {
        month: billingPeriod.month,
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
      // --- ส่วนนี้สำหรับเรียก API เพื่อบันทึกข้อมูล ---
      // message.loading({ content: 'กำลังบันทึกข้อมูล...', key: 'saving' });
      // const response = await yourApiToCreateBill(billPayload);
      // message.success({ content: 'บันทึกบิลสำเร็จ!', key: 'saving', duration: 2 });

      // ตัวอย่างเมื่อไม่มี API
      message.success("สร้างข้อมูลสำหรับส่งไปบันทึกสำเร็จแล้ว (ดูใน Console)");

    } catch (error) {
      console.error("Error saving bill:", error);
      // message.error({ content: 'เกิดข้อผิดพลาดในการบันทึก!', key: 'saving', duration: 2 });
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


  // ... ภายในคอมโพเนนท์ PaymentSystem

  const renderServiceSelectionModal = () => {
    // 👈 กรองรายการ service ที่จะแสดงใน Modal
    const existingServiceNames = formData.additionalCharges
      .filter(c => c.type === 'existing')
      .map(c => c.description);

    const availableServices = serviceOptions.filter(
      s => !existingServiceNames.includes(s.name)
    );

    return (
      <Modal
        title="เพิ่มบริการให้ผู้เช่า"
        open={isServiceModalVisible}
        onOk={handleAddSelectedServices}
        onCancel={() => setIsServiceModalVisible(false)}
        okText="เพิ่มบริการที่เลือก"
        cancelText="ยกเลิก"
      >
        {/* ส่วนของการเลือก Service ที่มีอยู่แล้ว */}
        <Checkbox.Group
          style={{ width: '100%' }}
          value={selectedServices}
          onChange={(checkedValues) => setSelectedServices(checkedValues)}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 👈 ใช้ availableServices แทน serviceOptions */}
            {availableServices.map((service) => (
              <Checkbox key={service.name} value={service.name}>
                {`${service.name} (${service.price.toLocaleString()} บาท)`}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>

        <Divider />

        {/* 👇 ส่วนของ "อื่นๆ" ที่เพิ่มเข้ามา */}
        <Checkbox
          checked={isOtherSelected}
          onChange={(e) => setIsOtherSelected(e.target.checked)}
        >
          อื่นๆ (โปรดระบุ)
        </Checkbox>

        {/* แสดงช่องกรอกข้อมูลเมื่อติ๊กเลือก "อื่นๆ" */}
        {isOtherSelected && (
          <Space direction="vertical" style={{ width: '100%', marginTop: '12px' }}>
            <Input
              placeholder="ระบุชื่อรายการ"
              value={otherDescription}
              onChange={(e) => setOtherDescription(e.target.value)}
            />
            <InputNumber
              placeholder="ระบุจำนวนเงิน"
              prefix="฿"
              style={{ width: '100%' }}
              value={otherAmount}
              onChange={(value) => setOtherAmount(value)}
            />
          </Space>
        )}
      </Modal>
    )
  }
  // ... ภายในคอมโพเนนท์ PaymentSystem

  const discountColumns = [
    {
      title: "รายการส่วนลด",
      dataIndex: "description",
      key: "description",
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`discounts.${index}.description`}
          render={({ field }) => <Input {...field} variant="borderless" />}
        />
      ),
    },
    {
      title: "จำนวนเงิน (ส่วนลด)",
      dataIndex: "amount",
      key: "amount",
      width: "180px",
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`discounts.${index}.amount`}
          render={({ field }) => (
            <InputNumber
              {...field}
              prefix="฿"
              style={{ width: "100%" }}
              variant="borderless"
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
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeDiscount(record.id)}
        />
      ),
    },
  ];

  const primaryColor = "#abb2b9";
  const electricColor = "#F59E0B";
  const waterColor = "#3B82F6";
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {renderServiceSelectionModal()}
        <Card
          style={{
            marginBottom: "24px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            background: `linear-gradient(135deg, ${primaryColor} 0%, #eaecee 100%)`,
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space align="center" size="middle">
              <HomeOutlined style={{ fontSize: "2rem", color: "white" }} />
              <div>
                <Title level={3} style={{ marginBottom: 0, color: "white" }}>
                  ระบบแจ้งชำระเงิน
                </Title>
                <Text style={{ color: "#e9ecef" }}>
                  สร้างและแจ้งยอดบิลค่าเช่าสำหรับอพาร์ทเมนท์
                </Text>
              </div>
            </Space>
            <Button
              icon={<CopyOutlined />}
              size="large"
              onClick={handleNotifyPayment}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                color: primaryColor,
                border: "none",
                fontWeight: "bold",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
            >
              คัดลอก & แจ้งชำระเงิน
            </Button>
          </div>
        </Card>

        <div style={{ paddingTop: "32px" }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Card
                  styles={{
                    header: {
                      borderLeft: "5px solid #f1948a",
                      backgroundColor: "#fdedec",
                    },
                  }}
                  title={
                    <>
                      <UserOutlined /> ข้อมูลผู้เช่า
                    </>
                  }
                  style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Controller
                        name="tenantId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="เลือกห้อง"
                            style={{ width: "100%" }}
                          >
                            {tenantDataForUI?.map((tenant) => (
                              <Option key={tenant.id} value={tenant.id}>
                                ห้อง {tenant.roomNumber} - {tenant.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Controller
                        name="tenantInfo.phone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="เบอร์โทรศัพท์"
                            readOnly
                          />
                        )}
                      />
                    </Col>
                  </Row>
                </Card>

                <Card
                  styles={{
                    header: {
                      borderLeft: "5px solid #82e0aa",
                      backgroundColor: "#eafaf1",
                    },
                  }}
                  title={
                    <>
                      <CalendarOutlined /> ประจำเดือน
                    </>
                  }
                  style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Title level={4} style={{ margin: 0, color: "#343a40" }}>
                        {formData.billingPeriod.month}
                      </Title>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Title level={4} style={{ margin: 0, color: "#343a40" }}>
                        {formData.billingPeriod.year}
                      </Title>
                    </Col>
                  </Row>
                </Card>

                <Card
                  styles={{
                    header: {
                      borderLeft: "5px solid #82e0aa",
                      backgroundColor: "#eafaf1",
                    },
                  }}
                  title={
                    <>
                      <CalculatorOutlined /> ค่าเช่า
                    </>
                  }
                  style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={12}>
                      <Controller
                        name="roomCharges.monthlyRent"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            disabled
                            addonBefore="ค่าเช่า"
                            {...field}
                            style={{ width: "100%" }}
                            prefix="฿"
                          />
                        )}
                      />
                    </Col>

                  </Row>
                </Card>

                <Row gutter={[16, 16]}>

                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <>
                          <ThunderboltOutlined style={{ color: electricColor }} /> ค่าไฟฟ้า
                        </>
                      }
                      size="small"
                      style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                      styles={{
                        header: {
                          borderLeft: "5px solid #d97706",
                          backgroundColor: "#fef5e7",
                        },
                      }}
                    >
                      <Row justify="space-between" align="middle" style={{ minHeight: '60px' }}>
                        <Col flex="1">
                          {electricMeter?.billingType === "flatRate" ? (
                            // กรณีเหมาจ่าย - ให้ layout เหมือนกัน
                            <>
                              <Row gutter={8}>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ค่าบริการ</Text>
                                    <Controller
                                      name="utilities.electricFlatRate"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          prefix="฿"
                                          readOnly
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ประเภท</Text>
                                    <Input value="เหมาจ่าย" readOnly style={{ width: '100%' }} />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">จำนวน</Text>
                                    <Input value="1 เดือน" readOnly style={{ width: '100%' }} />
                                  </Space>
                                </Col>
                              </Row>
                              <Divider style={{ margin: "12px 0" }} />
                              <div style={{ textAlign: "right" }}>
                                <Text strong>
                                  ค่าบริการ: 1 เดือน = {" "}
                                  <span style={{ color: electricColor, fontSize: "1.1em" }}>
                                    ฿{electricCost.toLocaleString()}
                                  </span>
                                </Text>
                              </div>
                            </>
                          ) : (
                            // กรณีต่อหน่วย - layout เดิม
                            <>
                              <Row gutter={8}>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">หน่วยก่อนหน้า</Text>
                                    <Controller
                                      name="utilities.electricPrevious"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          placeholder="เลขเดิม"
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">หน่วยปัจจุบัน</Text>
                                    <Controller
                                      name="utilities.electricCurrent"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          placeholder="เลขใหม่"
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ราคาต่อหน่วย</Text>
                                    <Controller
                                      name="utilities.electricRate"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          prefix="฿"
                                          readOnly
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                              </Row>
                              <Divider style={{ margin: "12px 0" }} />
                              <div style={{ textAlign: "right" }}>
                                <Text strong>
                                  ใช้ไป: {electricUsage.toLocaleString()} หน่วย = {" "}
                                  <span style={{ color: electricColor, fontSize: "1.1em" }}>
                                    ฿{electricCost.toLocaleString()}
                                  </span>
                                </Text>
                              </div>
                            </>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </Col>


                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <>
                          <DropboxOutlined style={{ color: waterColor }} /> ค่าน้ำ
                        </>
                      }
                      size="small"
                      style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                      styles={{
                        header: {
                          borderLeft: "5px solid #2563eb",
                          backgroundColor: "#eff6ff",
                        },
                      }}
                    >
                      <Row justify="space-between" align="middle" style={{ minHeight: '60px' }}>
                        <Col flex="1">
                          {waterMeter?.billingType === "flatRate" ? (
                            // กรณีเหมาจ่าย - ให้ layout เหมือนกัน
                            <>
                              <Row gutter={8}>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ค่าบริการ</Text>
                                    <Controller
                                      name="utilities.waterFlatRate"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          prefix="฿"
                                          readOnly
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ประเภท</Text>
                                    <Input value="เหมาจ่าย" readOnly style={{ width: '100%' }} />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">จำนวน</Text>
                                    <Input value="1 เดือน" readOnly style={{ width: '100%' }} />
                                  </Space>
                                </Col>
                              </Row>
                              <Divider style={{ margin: "12px 0" }} />
                              <div style={{ textAlign: "right" }}>
                                <Text strong>
                                  ค่าบริการ: 1 เดือน = {" "}
                                  <span style={{ color: waterColor, fontSize: "1.1em" }}>
                                    ฿{waterCost.toLocaleString()}
                                  </span>
                                </Text>
                              </div>
                            </>
                          ) : (
                            // กรณีต่อหน่วย - layout เดิม
                            <>
                              <Row gutter={8}>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">หน่วยก่อนหน้า</Text>
                                    <Controller
                                      name="utilities.waterPrevious"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          placeholder="เลขเดิม"
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">หน่วยปัจจุบัน</Text>
                                    <Controller
                                      name="utilities.waterCurrent"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          placeholder="เลขใหม่"
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                                <Col span={8}>
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text type="secondary">ราคาต่อหน่วย</Text>
                                    <Controller
                                      name="utilities.waterRate"
                                      control={control}
                                      render={({ field }) => (
                                        <InputNumber
                                          {...field}
                                          style={{ width: '100%' }}
                                          prefix="฿"
                                          readOnly
                                        />
                                      )}
                                    />
                                  </Space>
                                </Col>
                              </Row>
                              <Divider style={{ margin: "12px 0" }} />
                              <div style={{ textAlign: "right" }}>
                                <Text strong>
                                  ใช้ไป: {waterUsage.toLocaleString()} หน่วย = {" "}
                                  <span style={{ color: waterColor, fontSize: "1.1em" }}>
                                    ฿{waterCost.toLocaleString()}
                                  </span>
                                </Text>
                              </div>
                            </>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                </Row>

                <Card
                  title="ค่าใช้จ่ายอื่นๆ"
                  style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}
                  styles={{
                    header: {
                      borderLeft: "5px solid #bb8fce",
                      backgroundColor: "#f4ecf7",
                    },
                  }}
                >
                  <Table
                    columns={additionalChargeColumns}
                    dataSource={formData.additionalCharges}
                    pagination={false}
                    rowKey="id"
                    size="small"
                  />
                  {/* <Space style={{ marginTop: "16px", width: "100%" }}>
                    <Button

                      type="primary" icon={<PlusOutlined />} onClick={() => setIsServiceModalVisible(true)}>เพิ่มบริการ</Button>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addCustomCharge}>เพิ่มรายการเอง</Button>
                  </Space> */}
                  <Button
                    type="dashed"
                    // icon={<PlusOutlined />}
                    onClick={() => setIsServiceModalVisible(true)}
                    style={{ marginTop: "16px", width: "100%" }}
                  >
                    เพิ่มรายการ
                  </Button>




                </Card>

                <Card
                  title="ส่วนลด"
                  styles={{
                    header: {
                      borderLeft: "5px solid #28a745", // สีเขียวสำหรับส่วนลด
                      backgroundColor: "#eafaf1",
                    },
                  }}
                >
                  <Table
                    columns={discountColumns}
                    dataSource={formData.discounts}
                    pagination={false}
                    rowKey="id"
                    size="small"
                  />
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addDiscount}
                    style={{ marginTop: "16px", width: "100%", color: "#28a745", borderColor: "#28a745" }}
                  >
                    เพิ่มรายการส่วนลด
                  </Button>
                </Card>
              </Space>
            </Col>

            <Col xs={24} lg={10}>
              <div style={{ position: "sticky", top: "24px" }}>
                <div ref={printRef}>
                  <Card
                    style={{
                      boxShadow:
                        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <Title level={4} style={{ marginBottom: "4px" }}>
                        {apartmentInfoForUI.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {apartmentInfoForUI.address}
                      </Text>
                      <br />
                      {phones && phones.length > 0 ? (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {phones
                            .filter((item) => item.number)
                            .map((item) => {
                              let label = "โทร.";
                              if (item.type === "mobile") {
                                label = "มือถือ";
                              } else if (item.type === "office") {
                                label = "สำนักงาน";
                              } else if (item.type === "fax") {
                                label = "โทร.แฟกซ์";
                              }
                              return `${label} ${item.number}`;
                            })
                            .join(" • ")}
                        </Text>
                      ) : (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          ไม่มีเบอร์โทร
                        </Text>
                      )}

                    </div>
                    <Divider />
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                      <Title level={3} style={{ color: primaryColor }}>
                        ใบแจ้งยอดค่าบริการ
                      </Title>
                      <Text>วันที่ออก: {dayjs().format("D MMMM BBBB")}</Text>
                    </div>
                    <Card
                      size="small"
                      style={{
                        marginBottom: "16px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <Text strong>ชื่อ:</Text>{" "}
                      {formData.tenantInfo.name || "-"}
                      <br />
                      <Text strong>ห้อง:</Text>{" "}
                      {formData.tenantInfo.roomNumber || "-"}{" "}
                      {formData.tenantInfo.floor &&
                        `ชั้น ${formData.tenantInfo.floor}`}
                      <br />
                      <Text strong>ประจำเดือน:</Text>{" "}
                      {formData.billingPeriod.month}{" "}
                      {formData.billingPeriod.year}
                    </Card>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>ค่าเช่าห้อง</Text>
                        <Text>
                          ฿{formData.roomCharges.monthlyRent.toLocaleString()}
                        </Text>
                      </div>
                      {/* <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>ค่าอินเทอร์เน็ต</Text>
                        <Text>
                          ฿{formData.roomCharges.internetFee.toLocaleString()}
                        </Text>
                      </div> */}
                      <Divider style={{ margin: "4px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {electricMeter?.billingType === "perUnit" ? (
                          <>
                            <Text>ค่าไฟฟ้า ({electricUsage} หน่วย)</Text>
                            <Text>฿{electricCost.toLocaleString()}</Text>
                          </>) : (<>
                            <Text>ค่าไฟฟ้า (เหมาจ่าย)</Text>
                            <Text>฿{electricCost.toLocaleString()}</Text>
                          </>)}

                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {renderWaterBill()}

                      </div>
                      <Divider style={{ margin: "4px 0" }} />
                      {formData.additionalCharges.map((charge) => (
                        <div
                          key={charge.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text>{charge.description}</Text>
                          <Text>฿{(charge.amount || 0).toLocaleString()}</Text>
                        </div>
                      ))}
                      {formData.additionalCharges.length > 0 && (
                        <Divider style={{ margin: "4px 0" }} />
                      )}
                      {formData.roomCharges.previousBalance > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="danger">ค้างชำระ</Text>
                          <Text type="danger">
                            ฿
                            {formData.roomCharges.previousBalance.toLocaleString()}
                          </Text>
                        </div>
                      )}
                      {formData.roomCharges.deposit > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="success">หักมัดจำ</Text>
                          <Text type="success">
                            -฿{formData.roomCharges.deposit.toLocaleString()}
                          </Text>
                        </div>
                      )}
                      {/* <Divider style={{ margin: "4px 0" }} /> */}
                      {formData.discounts.map((discount) => (
                        <div
                          key={discount.id}
                          style={{ display: "flex", justifyContent: "space-between" }}
                        >
                          <Text type="success">{discount.description}</Text>
                          <Text type="success">
                            -฿{(discount.amount || 0).toLocaleString()}
                          </Text>
                        </div>
                      ))}
                      {formData.roomCharges.deposit > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="success">หักเงินมัดจำ</Text>
                          <Text type="success">
                            -฿{(formData.roomCharges.deposit || 0).toLocaleString()}
                          </Text>
                        </div>
                      )}


                      {/* === ยอดรวม === */}
                      <Divider style={{ margin: "8px 0" }} dashed />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px",
                          borderRadius: "8px",
                          background: total >= 0 ? "#FFFBE6" : "#F6FFED",
                          border: `1px solid ${total >= 0 ? "#FFE58F" : "#B7EB8F"}`,
                        }}
                      >
                        {/* 👇 จัดกลุ่มข้อความฝั่งซ้ายเข้าด้วยกัน */}
                        <div>
                          <Title level={4} style={{ marginBottom: 0 }}>
                            ยอดชำระรวม
                          </Title>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {total >= 0 ? "(ยอดเงินที่ต้องได้รับ)" : "(ยอดเงินที่ต้องชำระเพิ่มเติม)"}
                          </Text>
                        </div>

                        {/* ยอดเงินฝั่งขวา */}
                        <Title
                          level={3}
                          style={{
                            marginBottom: 0,
                            color: total >= 0 ? "#D46B08" : "#389E0D",
                          }}
                        >
                          ฿
                          {Math.abs(total).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </Title>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end", // ให้ไปขวา
                          alignItems: "center",
                          // background: "#f8f9fa",
                          padding: "0.2rem",           // เพิ่ม padding ให้ดูโปร่ง
                          borderRadius: "0.5rem",    // มุมโค้ง
                          marginTop: "0.5rem", // ✅ ระยะห่างด้านบน
                        }}
                      >
                        <Button
                          size="large"
                          onClick={handleOkBilling}
                          //className="bg-red-500"
                          color="primary" variant="solid"
                          style={{
                            // background: "#237804",
                            // color: "#fff",
                            border: "none",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // เพิ่มเงา
                            borderRadius: "0.375rem",                  // มุมโค้ง
                            padding: "0 2rem",                         // ขยายด้านข้าง
                          }}
                        >
                          บันทึก
                        </Button>
                      </div>
                    </Space>
                  </Card>




                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div >


  );
}
