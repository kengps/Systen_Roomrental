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
                                        {/* <Col xs={24} sm={12}>
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
                                        </Col> */}
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
                                        {/* <Card
                                            styles={{
                                                header: {
                                                    borderLeft: "5px solid #82e0aa",
                                                    backgroundColor: "#eafaf1",
                                                },
                                            }}
                                            title={
                                                <>
                                                    <CalculatorOutlined /> ค่าห้อง
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

                                                                readOnly
                                                                // addonBefore="ค่าเช่า"
                                                                {...field}
                                                                style={{ width: "100%" }}
                                                                prefix="฿"
                                                            />
                                                        )}
                                                    />
                                                </Col>

                                            </Row>
                                        </Card> */}

                                        {/* <Col xs={24} sm={12}>
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
                                        </Col> */}
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

                                {/* <Card
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
                                </Card> */}

                                {/* <Card
                                        styles={{
                                            header: {
                                                borderLeft: "5px solid #82e0aa",
                                                backgroundColor: "#eafaf1",
                                            },
                                        }}
                                        title={
                                            <>
                                                <CalculatorOutlined /> ค่าห้อง
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

                                                            readOnly
                                                            // addonBefore="ค่าเช่า"
                                                            {...field}
                                                            style={{ width: "100%" }}
                                                            prefix="฿"
                                                        />
                                                    )}
                                                />
                                            </Col>

                                        </Row>
                                    </Card> */}

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
                                                <Text>ค่าห้อง</Text>
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
                                                    disabled={!isValid || isFormDisabled} // <--- เพิ่มตรงนี้
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