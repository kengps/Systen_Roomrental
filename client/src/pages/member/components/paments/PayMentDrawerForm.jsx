
const PayMentDrawerForm = () => {
    return (
        <>
            <Drawer
                styles={{
                    header: { background: '#1890ff', color: 'white' },
                    body: { padding: '24px' }
                }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'white' }}>
                            {selectedBill && `บิลค่าเช่า เดือน ${getThaiMonthName(selectedBill?.billingPeriod?.month)}/${selectedBill?.billingPeriod?.year}`}
                        </span>
                        <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} onClick={onClose} />
                    </div>
                }
                placement="top"
                height="100vh"
                open={open}
                onClose={onClose}
                closable={false}
            >
                {selectedBill && (
                    <div>
                        {/* Bill Header Info */}
                        <Card style={{ marginBottom: '16px' }}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Text strong>เลขที่บิล:</Text>
                                    <br />
                                    <Text>{selectedBill.billNumber}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>สถานะ:</Text>
                                    <br />
                                    <Tag icon={getStatusInfo(selectedBill.status).icon} color={getStatusInfo(selectedBill.status).color}>
                                        {getStatusInfo(selectedBill.status).text}
                                    </Tag>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>วันที่ออกบิล:</Text>
                                    <br />
                                    <Text>{formatDate(selectedBill?.billDate)}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text strong>วันครบกำหนดชำระ:</Text>
                                    <br />
                                    <Text type={selectedBill.status === 'pending' ? 'danger' : 'secondary'}>
                                        {formatDate(selectedBill.dueDate)}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>

                        {/* Bill Items Table */}
                        <Card title="รายการค่าใช้จ่าย" style={{ marginBottom: '16px' }}>
                            <Table
                                dataSource={selectedBill.items}
                                columns={itemColumns}
                                rowKey="_id"
                                pagination={false}
                                size="small"
                                scroll={{ x: 600 }}
                            />
                        </Card>

                        {/* Summary */}
                        {fineAmount > 0 && (
                            <Card style={{ marginBottom: '16px' }}>
                                <Flex justify="space-between">
                                    <Text strong>ค่าปรับล่าช้า
                                        <Text type="secondary">

                                            {` (จ่ายหลังจากวันที่ ${paymentDueDate}, ช้าไป ${Math.max(0, todays - paymentDueDate)} วัน × ${formatCurrency(selectedBill.apartment.billingSettings.lateFeePerDay)} ต่อวัน)`}
                                        </Text>
                                    </Text>
                                    <Text type="danger" strong>
                                        {formatCurrency(fineAmount)}
                                    </Text>
                                </Flex>
                            </Card>
                        )}

                        <Card>
                            <Row gutter={[16, 8]}>

                                <Col xs={24}>
                                    {/* <Divider style={{ margin: '12px 0' }} /> */}
                                    <Flex justify="space-between">
                                        <Text strong style={{ fontSize: '16px' }}>รวมทั้งหมด</Text>
                                        <Text strong style={{
                                            fontSize: '16px', color: totalWithFine > 0 ? '#ff4d4f' : '#52c41a'
                                        }}>
                                            {formatCurrency(totalWithFine)}
                                        </Text>
                                    </Flex>

                                </Col>
                                <Col xs={24}>
                                    <FileUploadPreviewModal
                                        // errors={errors.content?.photoUrl}
                                        // clearErrors={clearErrors}
                                        display={!!previewUrl}
                                        isPreview={false}
                                        // onUploaded={(key) => setValue("content.photoUrl", key)}
                                        onCleared={() => setPreviewUrl(undefined)}
                                        fileList={fileList} // 👈 ควบคุมเอง
                                        setFileList={setFileList}
                                    />

                                </Col>
                            </Row>

                            {selectedBill.status === 'pending' && selectedBill.remainingAmount > 0 && (
                                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => handleBillClick(selectedBill)}
                                        disabled={!previewUrl}
                                    >
                                        ยืนยัน
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </Drawer>
        </>
    )
}

export default PayMentDrawerForm