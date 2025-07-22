import { Drawer } from "antd";

// --- ฟอร์มแก้ไขรายละเอียดผู้เช่า (EditTenantDrawer) ---
const EditTenantDrawer = ({
    tenant,
    open,
    onClose,
    onUpdate,
    onUpdateServices,
    servicesData
}) => {





    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({ resolver: zodResolver(editTenantSchema) });
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const tenancyStatus = watch("tenancyStatus");

    useEffect(() => {
        if (tenant) {
            setValue("tenancyStatus", tenant.tenancyStatus);
            setValue(
                "moveOutDate",
                tenant.moveOutDate ? new Date(tenant.moveOutDate) : null
            );
        }
    }, [tenant, setValue]);

    if (!tenant) return null;

    const handleFinish = (values) => {
        const finalValues = {
            ...values,
            moveOutDate:
                values.tenancyStatus === "renting" ? null : values.moveOutDate,
        };
        onUpdate(tenant._id, finalValues);
    };

    const handleAddServices = () => {
        onUpdateServices(tenant._id, [...tenant?.serviceUsage, ...selectedServices]);
        setIsAddServiceModalOpen(false);
        setSelectedServices([]);
    };

    const handleRemoveService = (serviceId) => {
        onUpdateServices(
            tenant._id,
            tenant?.serviceUsage.filter((id) => id !== serviceId)
        );
    };



    const tenantServices = tenant?.serviceUsage
        .map((id) => servicesData.find((s) => s._id === id))
        .filter(Boolean);

    const availableServicesToAdd = servicesData.filter(
        (s) => !tenant?.serviceUsage.includes(s._id)
    );

    const getRemainingContract = () => {
        if (!tenant || tenant.tenancyStatus !== "renting") return null;

        const endDate = dayjs(tenant.moveInDate).add(
            tenant.contractDuration,
            "month"
        );
        const now = dayjs();

        if (now.isAfter(endDate)) {
            return <Text type="danger">ครบสัญญาแล้ว</Text>;
        }

        const totalMonths = endDate.diff(now, "month");
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        // หาวันที่เหลือหลังจากหักปีและเดือนออกแล้ว
        const intermediateDate = now.add(years, "year").add(months, "month");
        const days = endDate.diff(intermediateDate, "day");


        let displayText = "";
        if (years > 0) {
            displayText += `${years} ปี `;
        }
        if (months > 0) {
            displayText += `${months} เดือน `;
        }
        if (days > 0) {
            displayText += `${days} วัน`;
        }

        // ถ้าเหลือ 0 เดือน 0 วัน (เช่น เหลือแต่ปี หรือวันเดียว) ก็ยังโชว์ให้ครบ
        return <Text type="success">{displayText.trim()}</Text>;
    };

    return (
        <>
            <Drawer
                title="รายละเอียดผู้เช่า"
                width={720}
                onClose={onClose}
                open={open}
                styles={{ body: { paddingBottom: 80 } }}
            >
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ชื่อ-นามสกุล">{`${tenant.prefix} ${tenant.firstName} ${tenant.lastName}`}</Descriptions.Item>
                    <Descriptions.Item label="เบอร์โทรศัพท์">
                        {tenant.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="ห้องพัก">{`ชั้น ${tenant?.room?.floor}, ห้อง ${tenant?.room?.roomNumber}`}</Descriptions.Item>
                    <Descriptions.Item label="ค่ามัดจำ">
                        {tenant.deposit.toLocaleString()} บาท
                    </Descriptions.Item>
                    <Descriptions.Item label="ระยะสัญญา">
                        {tenant.contractDuration} เดือน
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่เข้าพัก">
                        {dayjs(tenant.moveInDate).format("DD MMMM YYYY")}
                    </Descriptions.Item>
                    {tenant.tenancyStatus === "renting" && (
                        <Descriptions.Item label="สัญญาคงเหลือ">
                            {getRemainingContract()}
                        </Descriptions.Item>
                    )}
                    {tenant.moveOutDate && (
                        <Descriptions.Item label="วันที่ย้ายออก">
                            {dayjs(tenant.moveOutDate).format("DD MMMM YYYY")}
                        </Descriptions.Item>
                    )}
                </Descriptions>
                <Divider orientation="left">ค่าบริการเพิ่มเติม</Divider>
                <List
                    size="small"
                    dataSource={tenantServices}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveService(item.id)}
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                title={item.name}
                                description={`${item.price.toLocaleString()} บาท / ${item.type === "monthly" ? "เดือน" : "ครั้ง"}`}
                            />
                        </List.Item>
                    )}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="ไม่มีบริการเพิ่มเติม"
                            />
                        ),
                    }}
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: "16px" }}
                    onClick={() => setIsAddServiceModalOpen(true)}
                >
                    เพิ่มบริการ
                </Button>
                <Divider />
                <Form layout="vertical" onFinish={handleSubmit(handleFinish)}>
                    <Form.Item label="สถานะการเช่า" required>
                        <Controller
                            name="tenancyStatus"
                            control={control}
                            render={({ field }) => (
                                <Select {...field}>
                                    <Option value="renting">กำลังเช่า</Option>
                                    <Option value="moved_out">ย้ายออก</Option>
                                </Select>
                            )}
                        />
                    </Form.Item>
                    {tenancyStatus === "moved_out" && (
                        <Form.Item
                            label="วันที่ย้ายออก"
                            required
                            validateStatus={errors.moveOutDate ? "error" : ""}
                            help={errors.moveOutDate?.message}
                        >
                            <Controller
                                name="moveOutDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value ? dayjs(field.value) : null}
                                        style={{ width: "100%" }}
                                        format="DD MMMM YYYY"
                                        onChange={(date) =>
                                            field.onChange(date ? date.toDate() : null)
                                        }
                                        placeholder="เลือกวันที่ย้ายออก"
                                    />
                                )}
                            />
                        </Form.Item>
                    )}
                    <div style={{ textAlign: "right", marginTop: 24 }}>
                        <Space>
                            <Button onClick={onClose}>ยกเลิก</Button>
                            <Button type="primary" htmlType="submit">
                                อัปเดตสถานะ
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Drawer>
            <Modal
                title="เพิ่มบริการให้ผู้เช่า"
                open={isAddServiceModalOpen}
                onOk={handleAddServices}
                onCancel={() => setIsAddServiceModalOpen(false)}
                okText="เพิ่มบริการที่เลือก"
                cancelText="ยกเลิก"
                okButtonProps={{ disabled: selectedServices.length === 0 }}
            >
                <Checkbox.Group
                    style={{ width: "100%" }}
                    onChange={setSelectedServices}
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {availableServicesToAdd.length > 0 ? (
                            availableServicesToAdd.map((service, index) => (
                                <Checkbox key={service._id} value={service._id}>
                                    {service.name}{" "}
                                    <Text type="secondary">
                                        ({service.price.toLocaleString()} บาท)
                                    </Text>
                                </Checkbox>
                            ))
                        ) : (
                            <Empty description="ไม่มีบริการอื่นให้เลือกแล้ว" />
                        )}
                    </Space>
                </Checkbox.Group>
            </Modal>
        </>
    );
};
export default EditTenantDrawer;
