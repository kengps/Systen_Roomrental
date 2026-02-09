import Icon, {
    CalendarOutlined,
    CopyOutlined,
    DeleteOutlined,
    HomeOutlined,
    PlusOutlined,
    ThunderboltOutlined,
    UserOutlined
} from "@ant-design/icons";
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
    Typography
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { Controller } from "react-hook-form";



dayjs.extend(buddhistEra);
dayjs.locale("th");

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;



const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em">
        <path d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z" />
    </svg>
);
const WaterDropIcon = props => <Icon component={WaterDropSvg} {...props} />;


const BillingForm = ({ handleNotifyPayment,
    control,
    tenantDataForUI,
    formData,
    electricMeter,
    electricCost,
    total,
    handleOkBilling,
    isValid,
    isFormDisabled,
    waterMeter,
    waterCost,
    waterUsage,
    setIsServiceModalVisible,
    isServiceModalVisible,

    addDiscount,
    printRef,
    apartmentInfoForUI,
    handleAddSelectedServices,
    setSelectedServices,
    isOtherSelected,
    selectedServices,
    serviceOptions,
    electricUsage,
    additionalChargeColumns,
    getValues,
    removeDiscount,
    phones }) => {


    const primaryColor = "#abb2b9";
    const electricColor = "#F59E0B";
    const waterColor = "#1890ff";


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
    const discountColumns = [
        {
            title: "รายการ",
            dataIndex: "description",
            key: "description",
            render: (text, record, index) => (
                <Controller
                    control={control}
                    name={`discounts.${index}.description`}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="ระบุรายการส่วนลด"
                            variant="borderless"
                        />
                    )}
                />
            ),
        },
        {
            title: "จำนวนเงิน",
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
                            placeholder="0"
                        // ลบ variant="borderless" ออก
                        />
                    )}
                />
            ),
        },
        // ส่วน action เหมือนเดิม
    ];

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
                    <Row
                        align="middle"
                        justify="space-between"
                        gutter={[16, 16]}
                        style={{ flexWrap: "wrap" }}
                    >
                        <Col xs={24} md={18}>
                            <Space align="center">
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
                        </Col>
                        <Col
                            xs={24}
                            md="auto"
                            style={{ textAlign: "right", display: "flex", justifyContent: "flex-end" }}
                        >
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
                                    width: "100%",
                                    maxWidth: "220px",
                                }}
                                block
                            >
                                คัดลอก
                            </Button>
                        </Col>
                    </Row>
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
                                                    <Select {...field} placeholder="เลือกห้อง" style={{ width: "100%" }}>
                                                        {tenantDataForUI
                                                            ?.filter((t) => !t.isBilled)
                                                            .sort((a, b) => a.roomNumber - b.roomNumber)
                                                            .map((tenant) => (
                                                                <Option key={tenant.id} value={tenant.id}>
                                                                    ห้อง {tenant.roomNumber} - {tenant.name}
                                                                </Option>
                                                            ))}

                                                        {tenantDataForUI?.some((t) => t.isBilled) && (
                                                            <OptGroup label={
                                                                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                                                    ออกบิลแล้ว
                                                                </span>
                                                            }>
                                                                {tenantDataForUI
                                                                    ?.filter((t) => t.isBilled)
                                                                    .sort((a, b) => a.roomNumber - b.roomNumber)
                                                                    .map((tenant) => (
                                                                        <Option key={tenant.id} value={tenant.id} disabled>
                                                                            ห้อง {tenant.roomNumber} - {tenant.name}
                                                                            {/* <Tag color="green" style={{ marginLeft: 8 }}>ออกบิลแล้ว</Tag> */}
                                                                        </Option>
                                                                    ))}
                                                            </OptGroup>
                                                        )}
                                                    </Select>

                                                )}
                                            />
                                        </Col>

                                        <Col xs={12}>
                                            <Controller
                                                name="roomCharges.monthlyRent"
                                                control={control}
                                                render={({ field }) => (
                                                    <InputNumber

                                                        readOnly
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
                                            <Space direction="vertical" style={{ width: '100%' }}>

                                                <Controller
                                                    name="billingPeriod.month"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            style={{ width: '100%' }}
                                                            placeholder="เลือกเดือน"
                                                            disabled={isFormDisabled}
                                                        >
                                                            <Option value="มกราคม">มกราคม</Option>
                                                            <Option value="กุมภาพันธ์">กุมภาพันธ์</Option>
                                                            <Option value="มีนาคม">มีนาคม</Option>
                                                            <Option value="เมษายน">เมษายน</Option>
                                                            <Option value="พฤษภาคม">พฤษภาคม</Option>
                                                            <Option value="มิถุนายน">มิถุนายน</Option>
                                                            <Option value="กรกฎาคม">กรกฎาคม</Option>
                                                            <Option value="สิงหาคม">สิงหาคม</Option>
                                                            <Option value="กันยายน">กันยายน</Option>
                                                            <Option value="ตุลาคม">ตุลาคม</Option>
                                                            <Option value="พฤศจิกายน">พฤศจิกายน</Option>
                                                            <Option value="ธันวาคม">ธันวาคม</Option>
                                                        </Select>
                                                    )}
                                                />
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Title level={4} style={{ margin: 0, color: "#343a40" }}>
                                                {formData.billingPeriod.year}
                                            </Title>
                                        </Col>
                                    </Row>
                                </Card>




                                <Row gutter={[16, 16]}>

                                    <Col xs={24} md={12}>
                                        <Card
                                            title={
                                                <>
                                                    <WaterDropIcon style={{ color: waterColor }} /> ค่าน้ำ
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
                                                                                    disabled={isFormDisabled} // <--- เพิ่มตรงนี้
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
                                                                                    disabled={isFormDisabled} // <--- เพิ่มตรงนี้
                                                                                    readOnly
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
                                                                            rules={{
                                                                                validate: (value) =>
                                                                                    Number(value) >= Number(getValues('utilities.waterPrevious')) ||
                                                                                    'ต้องมากกว่าเลขก่อนหน้า'
                                                                            }}
                                                                            //                                  👇 ตรวจสอบตรงนี้
                                                                            render={({ field, fieldState: { error } }) => (
                                                                                <>
                                                                                    <InputNumber
                                                                                        {...field}
                                                                                        style={{ width: '100%' }}
                                                                                        placeholder="เลขใหม่"
                                                                                        // เพิ่ม status='error' เพื่อให้ InputNumber เป็นสีแดง
                                                                                        status={error ? 'error' : ''}
                                                                                        disabled={isFormDisabled} // <--- เพิ่มตรงนี้
                                                                                        min={Number(getValues('utilities.waterPrevious')) || 0}
                                                                                    />
                                                                                    {/* 👇 และตรวจสอบว่ามีส่วนนี้สำหรับแสดงข้อความ */}
                                                                                    {error && <Text type="danger" style={{ fontSize: 12 }}>{error.message}</Text>}
                                                                                </>
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
                                                                                    disabled={isFormDisabled} // <--- เพิ่มตรงนี้
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
                                                                                    disabled={isFormDisabled} // <--- เพิ่มตรงนี้
                                                                                    style={{ width: '100%' }}
                                                                                    placeholder="เลขเดิม"
                                                                                    readOnly
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
                                                                            rules={{
                                                                                validate: (value) =>
                                                                                    Number(value) >= Number(getValues('utilities.electricPrevious')) ||
                                                                                    'ต้องมากกว่าเลขก่อนหน้า'
                                                                            }}
                                                                            //                                  👇 ตรวจสอบตรงนี้
                                                                            render={({ field, fieldState: { error } }) => (
                                                                                <>
                                                                                    <InputNumber
                                                                                        {...field}
                                                                                        style={{ width: '100%' }}
                                                                                        placeholder="เลขใหม่"
                                                                                        // เพิ่ม status='error' เพื่อให้ InputNumber เป็นสีแดง
                                                                                        status={error ? 'error' : ''}
                                                                                        disabled={isFormDisabled} // <--- เพิ่มตรงนี้
                                                                                        min={Number(getValues('utilities.electricPrevious')) || 0}
                                                                                    />
                                                                                    {/* 👇 และตรวจสอบว่ามีส่วนนี้สำหรับแสดงข้อความ */}
                                                                                    {error && <Text type="danger" style={{ fontSize: 12 }}>{error.message}</Text>}
                                                                                </>
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
                                                                                    disabled={isFormDisabled} // <--- เพิ่มตรงนี้
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

                                </Row>

                                {/* <Card
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

                                    <Button
                                        type="dashed"
                                        // icon={<PlusOutlined />}
                                        onClick={() => setIsServiceModalVisible(true)}
                                        style={{ marginTop: "16px", width: "100%" }}
                                        disabled={isFormDisabled} // <--- เพิ่มตรงนี้
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
                                        disabled={isFormDisabled} // <--- เพิ่มตรงนี้
                                    >
                                        เพิ่มรายการส่วนลด
                                    </Button>
                                </Card> */}


                                <Row gutter={[16, 16]} wrap>
                                    <Col xs={24} md={12}>
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
                                                scroll={{ x: '100%' }} // 👈 สำคัญ!
                                            />
                                            <Button
                                                type="dashed"
                                                onClick={() => setIsServiceModalVisible(true)}
                                                style={{ marginTop: "16px", width: "100%" }}
                                                disabled={isFormDisabled}
                                            >
                                                เพิ่มค่าใช้จ่าย
                                            </Button>
                                        </Card>
                                    </Col>

                                    <Col xs={24} md={12}>
                                        <Card
                                            title="ส่วนลด"
                                            styles={{
                                                header: {
                                                    borderLeft: "5px solid #28a745",
                                                    backgroundColor: "#eafaf1",
                                                },
                                            }}
                                        >
                                            <Table
                                                columns={discountColumns}
                                                dataSource={formData.discounts}
                                                pagination={false}
                                                rowKey="id"
                                                // size="small"
                                                scroll={{ x: '100%' }} // 👈 สำคัญ!
                                            />
                                            <Button
                                                type="dashed"

                                                onClick={addDiscount}
                                                style={{
                                                    marginTop: "16px",
                                                    width: "100%",
                                                    color: "#28a745",
                                                    borderColor: "#28a745",
                                                }}
                                                disabled={isFormDisabled}
                                            >
                                                เพิ่มส่วนลด
                                            </Button>
                                        </Card>
                                    </Col>
                                </Row>
                            </Space>
                        </Col>

                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={14}
                            xl={12}
                            xxl={10}
                            style={{
                                padding: '0 8px',
                                '@media (maxWidth: 576px)': {
                                    padding: '0 4px'
                                }
                            }}
                        >
                            <div style={{
                                position: "sticky",
                                top: "24px",
                                '@media (maxWidth: 768px)': {
                                    position: 'static'
                                }
                            }}>
                                <div ref={printRef}>
                                    <Card
                                        style={{
                                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                                            border: "2px solid #e5e7eb",
                                            margin: '0 auto',
                                            maxWidth: '100%',
                                            '@media (maxWidth: 576px)': {
                                                margin: '0',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                            }
                                        }}
                                        styles={{ body: { padding: window.innerWidth < 576 ? '16px 12px' : '24px' } }}
                                    // bodyStyle={{
                                    //     padding: window.innerWidth < 576 ? '16px 12px' : '24px'
                                    // }}
                                    >
                                        {/* Header Section */}
                                        <div style={{
                                            textAlign: "center",
                                            marginBottom: "16px",
                                            '@media (maxWidth: 576px)': {
                                                marginBottom: '12px'
                                            }
                                        }}>
                                            <Title
                                                level={window.innerWidth < 576 ? 5 : 4}
                                                style={{
                                                    marginBottom: "4px",
                                                    fontSize: window.innerWidth < 576 ? '16px' : 'inherit',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                {apartmentInfoForUI.name}
                                            </Title>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontSize: window.innerWidth < 576 ? "10px" : "12px",
                                                    display: 'block',
                                                    lineHeight: '1.4',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {apartmentInfoForUI.address}
                                            </Text>
                                            <br />
                                            {phones && phones.length > 0 ? (
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: window.innerWidth < 576 ? "10px" : "12px",
                                                        display: 'block',
                                                        lineHeight: '1.4',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
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
                                                        .join(window.innerWidth < 576 ? " | " : " • ")}
                                                </Text>
                                            ) : (
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: window.innerWidth < 576 ? "10px" : "12px"
                                                    }}
                                                >
                                                    ไม่มีเบอร์โทร
                                                </Text>
                                            )}
                                        </div>

                                        <Divider style={{ margin: window.innerWidth < 576 ? '12px 0' : '16px 0' }} />

                                        {/* Bill Title */}
                                        <div style={{
                                            textAlign: "center",
                                            marginBottom: window.innerWidth < 576 ? "16px" : "24px"
                                        }}>
                                            <Title
                                                level={window.innerWidth < 576 ? 4 : 3}
                                                style={{
                                                    color: primaryColor,
                                                    fontSize: window.innerWidth < 576 ? '18px' : 'inherit',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                ใบแจ้งยอดค่าบริการ
                                            </Title>
                                            <Text style={{
                                                fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                            }}>
                                                วันที่ออก: {dayjs().format("D MMMM BBBB")}
                                            </Text>
                                        </div>

                                        {/* Tenant Info Card */}
                                        <Card
                                            size="small"
                                            style={{
                                                marginBottom: "16px",
                                                backgroundColor: "#f8f9fa",
                                            }}
                                            // bodyStyle={{
                                            //     padding: window.innerWidth < 576 ? '8px 12px' : '12px 16px'
                                            // }}
                                            styles={{ body: { padding: window.innerWidth < 576 ? '8px 12px' : '12px 16px' } }}
                                        >
                                            <div style={{
                                                fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                lineHeight: '1.6'
                                            }}>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <Text strong style={{ minWidth: window.innerWidth < 576 ? '40px' : '50px', display: 'inline-block' }}>
                                                        ชื่อ:
                                                    </Text>{" "}
                                                    <span style={{ wordBreak: 'break-word' }}>
                                                        {formData.tenantInfo.name || "-"}
                                                    </span>
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <Text strong style={{ minWidth: window.innerWidth < 576 ? '40px' : '50px', display: 'inline-block' }}>
                                                        ห้อง:
                                                    </Text>{" "}
                                                    {formData.tenantInfo.roomNumber || "-"}{" "}
                                                    {formData.tenantInfo.floor && `ชั้น ${formData.tenantInfo.floor}`}
                                                </div>
                                                <div>
                                                    <Text strong style={{ minWidth: window.innerWidth < 576 ? '40px' : '50px', display: 'inline-block' }}>
                                                        ประจำเดือน:
                                                    </Text>{" "}
                                                    {formData.billingPeriod.month} {formData.billingPeriod.year}
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Billing Details */}
                                        <Space
                                            direction="vertical"
                                            style={{ width: "100%" }}
                                            size={window.innerWidth < 576 ? "small" : "small"}
                                        >
                                            {/* Room charges */}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: 'center',
                                                flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                gap: window.innerWidth < 400 ? '4px' : '8px'
                                            }}>
                                                <Text style={{
                                                    fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                    flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                }}>
                                                    ค่าห้อง
                                                </Text>
                                                <Text style={{
                                                    fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                    fontWeight: '500',
                                                    textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                    flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                }}>
                                                    ฿{formData.roomCharges.monthlyRent.toLocaleString()}
                                                </Text>
                                            </div>

                                            <Divider style={{ margin: "4px 0" }} />

                                            {/* Electric charges */}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: 'center',
                                                flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                gap: window.innerWidth < 400 ? '4px' : '8px'
                                            }}>
                                                {electricMeter?.billingType === "perUnit" ? (
                                                    <>
                                                        <Text style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}>
                                                            ค่าไฟฟ้า ({electricUsage} หน่วย)
                                                        </Text>
                                                        <Text style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            fontWeight: '500',
                                                            textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}>
                                                            ฿{electricCost.toLocaleString()}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}>
                                                            ค่าไฟฟ้า (เหมาจ่าย)
                                                        </Text>
                                                        <Text style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            fontWeight: '500',
                                                            textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}>
                                                            ฿{electricCost.toLocaleString()}
                                                        </Text>
                                                    </>
                                                )}
                                            </div>

                                            {/* Water charges */}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: 'center',
                                                flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                gap: window.innerWidth < 400 ? '4px' : '8px'
                                            }}>
                                                {renderWaterBill()}
                                            </div>

                                            <Divider style={{ margin: "4px 0" }} />

                                            {/* Additional charges */}
                                            {formData.additionalCharges.map((charge) => (
                                                <div
                                                    key={charge.id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: 'center',
                                                        flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                        gap: window.innerWidth < 400 ? '4px' : '8px'
                                                    }}
                                                >
                                                    <Text style={{
                                                        fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                        flex: window.innerWidth < 400 ? '1 1 100%' : 'none',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {charge.description}
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                        fontWeight: '500',
                                                        textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                        flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                    }}>
                                                        ฿{(charge.amount || 0).toLocaleString()}
                                                    </Text>
                                                </div>
                                            ))}

                                            {formData.additionalCharges.length > 0 && (
                                                <Divider style={{ margin: "4px 0" }} />
                                            )}

                                            {/* Previous balance */}
                                            {formData.roomCharges.previousBalance > 0 && (
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: 'center',
                                                    flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                    gap: window.innerWidth < 400 ? '4px' : '8px'
                                                }}>
                                                    <Text
                                                        type="danger"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}
                                                    >
                                                        ค้างชำระ
                                                    </Text>
                                                    <Text
                                                        type="danger"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            fontWeight: '500',
                                                            textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}
                                                    >
                                                        ฿{formData.roomCharges.previousBalance.toLocaleString()}
                                                    </Text>
                                                </div>
                                            )}

                                            {/* Deposit deduction */}
                                            {formData.roomCharges.deposit > 0 && (
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: 'center',
                                                    flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                    gap: window.innerWidth < 400 ? '4px' : '8px'
                                                }}>
                                                    <Text
                                                        type="success"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}
                                                    >
                                                        หักมัดจำ
                                                    </Text>
                                                    <Text
                                                        type="success"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            fontWeight: '500',
                                                            textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}
                                                    >
                                                        -฿{formData.roomCharges.deposit.toLocaleString()}
                                                    </Text>
                                                </div>
                                            )}

                                            {/* Discounts */}
                                            {formData.discounts.map((discount) => (
                                                <div
                                                    key={discount.id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: 'center',
                                                        flexWrap: window.innerWidth < 400 ? 'wrap' : 'nowrap',
                                                        gap: window.innerWidth < 400 ? '4px' : '8px'
                                                    }}
                                                >
                                                    <Text
                                                        type="success"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none',
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        {discount.description}
                                                    </Text>
                                                    <Text
                                                        type="success"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
                                                            fontWeight: '500',
                                                            textAlign: window.innerWidth < 400 ? 'right' : 'inherit',
                                                            flex: window.innerWidth < 400 ? '1 1 100%' : 'none'
                                                        }}
                                                    >
                                                        -฿{(discount.amount || 0).toLocaleString()}
                                                    </Text>
                                                </div>
                                            ))}

                                            {/* Total Section */}
                                            <Divider style={{ margin: "8px 0" }} dashed />
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: window.innerWidth < 576 ? "8px" : "12px",
                                                    borderRadius: "8px",
                                                    background: total >= 0 ? "#FFFBE6" : "#F6FFED",
                                                    border: `1px solid ${total >= 0 ? "#FFE58F" : "#B7EB8F"}`,
                                                    flexDirection: window.innerWidth < 400 ? 'column' : 'row',
                                                    gap: window.innerWidth < 400 ? '8px' : '16px'
                                                }}
                                            >
                                                <div style={{
                                                    textAlign: window.innerWidth < 400 ? 'center' : 'left',
                                                    flex: 1
                                                }}>
                                                    <Title
                                                        level={window.innerWidth < 576 ? 5 : 4}
                                                        style={{
                                                            marginBottom: 0,
                                                            fontSize: window.innerWidth < 576 ? '14px' : 'inherit'
                                                        }}
                                                    >
                                                        ยอดชำระรวม
                                                    </Title>
                                                    <Text
                                                        type="secondary"
                                                        style={{
                                                            fontSize: window.innerWidth < 576 ? '10px' : '12px',
                                                            display: 'block',
                                                            textAlign: window.innerWidth < 400 ? 'center' : 'left'
                                                        }}
                                                    >
                                                        {total >= 0 ? "(ยอดเงินที่ต้องได้รับ)" : "(ยอดเงินที่ต้องชำระเพิ่มเติม)"}
                                                    </Text>
                                                </div>

                                                <Title
                                                    level={window.innerWidth < 576 ? 4 : 3}
                                                    style={{
                                                        marginBottom: 0,
                                                        color: total >= 0 ? "#D46B08" : "#389E0D",
                                                        fontSize: window.innerWidth < 576 ? '18px' : 'inherit',
                                                        textAlign: 'right',
                                                        flex: window.innerWidth < 400 ? 'none' : 'none'
                                                    }}
                                                >
                                                    ฿{Math.abs(total).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </Title>
                                            </div>

                                            {/* Save Button */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    padding: "0.2rem",
                                                    borderRadius: "0.5rem",
                                                    marginTop: "0.5rem",
                                                }}
                                            >
                                                <Button
                                                    size={window.innerWidth < 576 ? "middle" : "large"}
                                                    onClick={handleOkBilling}
                                                    color="primary"
                                                    variant="solid"
                                                    style={{
                                                        border: "none",
                                                        fontWeight: "bold",
                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                                        borderRadius: "0.375rem",
                                                        padding: window.innerWidth < 576 ? "0 1.5rem" : "0 2rem",
                                                        width: window.innerWidth < 576 ? "100%" : "auto",
                                                        minHeight: window.innerWidth < 576 ? "40px" : "auto"
                                                    }}
                                                    disabled={!isValid || isFormDisabled}
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


    )
}

export default BillingForm