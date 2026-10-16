import {
    CloseOutlined,
    FileTextOutlined,
    UnorderedListOutlined,
    PictureOutlined,
    ScanOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Descriptions, Drawer, Image, Select, Space, Table, Typography } from "antd";
import FlexiblePaymentModal from './FlexiblePaymentModal';
import { useState } from 'react';
import FlexiblePaymentCancelModal from './DescriptionCancelModel';
import { confirmPayment } from '../../../../service/api/bill';
import Swal from 'sweetalert2';
import PaymentHistory from '../../../member/components/paments/PaymentHistory';

const { Text } = Typography;

/* ---------- Design tokens ---------- */
const C = {
    ink: '#0F172A',
    raised: '#1E2A4A',
    page: '#F4F5F9',
    card: '#FFFFFF',
    line: '#E6E8F0',
    muted: '#5B6478',
    sunken: '#F7F8FC',
    primary: '#4F46E5',
    primarySoft: '#EEF0FF',
    primarySoftText: '#3730A3',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
    okBg: '#DCFCE7', okFg: '#166534', okNum: '#15803D',
    badBg: '#FFE4E9', badFg: '#9F1239', badNum: '#BE123C',
    warnBg: '#FEF1DC', warnFg: '#B45309',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.pda { font-family:${FONT}; }
.pda .ant-drawer-header { background:${C.ink}; border-bottom:none; }
.pda .ant-drawer-body { background:${C.page}; }
.pda-head { display:flex; justify-content:space-between; align-items:center; gap:12px; width:100%; }
.pda-head-title { color:#fff; font-size:18px; font-weight:700; }
.pda-close { background:transparent; border:none; width:44px; height:44px; border-radius:12px; color:${C.onDarkMuted}; font-size:16px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; }
.pda-close:hover { background:${C.raised}; color:#fff; }
.pda-close:focus-visible { outline:3px solid ${C.onDarkIcon}; outline-offset:2px; }

.pda-wrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }
.pda-section { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; padding:24px; }
.pda-section-head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.pda-section-icon { width:36px; height:36px; border-radius:10px; background:${C.primarySoft}; color:${C.primary}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.pda-section-title { margin:0; font-size:16px; font-weight:700; color:${C.ink}; }

.pda .ant-descriptions-item-label { background:${C.sunken}; color:${C.muted}; font-weight:600; width:180px; }
.pda .ant-descriptions-item-content { color:${C.ink}; }
.pda .ant-table-thead > tr > th { background:${C.sunken}; color:${C.muted}; font-weight:600; }

.pda-pill { display:inline-block; padding:2px 12px; border-radius:999px; font-size:13px; font-weight:600; }
.pda-pill-ok { background:${C.okBg}; color:${C.okFg}; }
.pda-pill-bad { background:${C.badBg}; color:${C.badFg}; }
.pda-pill-warn { background:${C.warnBg}; color:${C.warnFg}; }
.pda-pill-neutral { background:${C.sunken}; color:${C.muted}; border:1px solid ${C.line}; }

.pda-pay-card { border:1px solid ${C.line}; border-radius:16px; padding:20px; background:${C.card}; display:flex; flex-direction:column; gap:12px; }
.pda-pay-row { display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; }
.pda-muted { color:${C.muted}; }
.pda-link { color:${C.primary}; font-weight:600; }
.pda-link:focus-visible { outline:3px solid #C7CCF5; outline-offset:2px; border-radius:4px; }

.pda-slip-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:20px; align-items:start; }
.pda-slip-img { display:flex; justify-content:center; background:${C.sunken}; border:1px solid ${C.line}; border-radius:16px; padding:16px; margin-bottom:16px; }
.pda-slip-img .ant-image { max-width:100%; }
.pda-slip-img .ant-image-img { max-width:100%; height:auto; border-radius:12px; }

.pda-field { display:flex; flex-direction:column; gap:2px; }
.pda-field-label { font-size:13px; font-weight:600; color:${C.muted}; }
.pda-rule { height:1px; background:${C.line}; margin:4px 0; }
.pda-ref { font-family:ui-monospace,Menlo,monospace; font-size:12px; background:${C.sunken}; border:1px solid ${C.line}; padding:4px 8px; border-radius:8px; }
.pda-amount { font-size:20px; font-weight:700; color:${C.primary}; }
.pda-empty { min-height:240px; display:flex; align-items:center; justify-content:center; text-align:center; color:${C.muted}; background:${C.sunken}; border-radius:16px; padding:24px; }
.pda-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }

.pda .ant-btn-primary { font-weight:600; }

@media (max-width: 600px) {
  .pda .ant-drawer-body { padding:16px; }
  .pda-section { padding:16px; }
  .pda .ant-descriptions-item-label { width:120px; }
  .pda-actions .ant-btn { width:100%; }
}
`;

/* ---------- ค่าคงที่/ตัวช่วยแสดงผล ---------- */
const colorMap = {
    'ค่าบริการตามบิล': C.muted,
    'ค่าปรับ': C.warnFg,
    'ยอดรวมทั้งหมด': C.okNum,
    'ยอดชำระแล้ว': C.okNum,
    'ค้างชำระ': C.badNum,
    'ชำระเกิน': C.badNum,
};

const underlineMap = {
    'ยอดรวมทั้งหมด': 'underline',
    'ค้างชำระ': 'underline double',
    'ชำระเกิน': 'underline double',
};

const paymentStatusLabel = {
    'completed': 'ชำระครบแล้ว',
    'outstanding': 'ค้างชำระ',
};
const paymentStatusTone = {
    'completed': 'ok',
    'outstanding': 'bad',
};

const partialStatus = (status) => {
    switch (status) {
        case 'approved': return { tone: 'ok', text: 'อนุมัติแล้ว' };
        case 'rejected': return { tone: 'bad', text: 'ปฏิเสธ' };
        case 'pending': return { tone: 'warn', text: 'รอการอนุมัติ' };
        default: return { tone: 'neutral', text: 'ไม่ทราบสถานะ' };
    }
};

const formatDate = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '-';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const time = timeStr.substring(0, 5);
    return `${day}/${month}/${year} ${time}`;
};

const formatAmount = (amount) => {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatPartialDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatPartialAmount = (amount) => new Intl.NumberFormat('th-TH').format(amount);

/* ---------- ชิ้นส่วนที่ใช้ซ้ำ ---------- */
const Section = ({ icon, title, children }) => (
    <section className="pda-section">
        {title && (
            <div className="pda-section-head">
                <div className="pda-section-icon" aria-hidden="true">{icon}</div>
                <h3 className="pda-section-title">{title}</h3>
            </div>
        )}
        {children}
    </section>
);

const Pill = ({ tone, children }) => (
    <span className={`pda-pill pda-pill-${tone}`}>{children}</span>
);

const Field = ({ label, children }) => (
    <div className="pda-field">
        <span className="pda-field-label">{label}</span>
        <div>{children}</div>
    </div>
);

const SlipImage = ({ src }) => (
    <div className="pda-slip-img">
        <Image width={280} src={src} alt="Slip" />
    </div>
);

const SlipResultPanel = ({ slipResult, isSameAmount, onApprove, onPartial, onReject }) => (
    <Section icon={<ScanOutlined />} title="ผลการตรวจสอบ">
        {slipResult ? (
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <Field label="สถานะ">
                    <Pill tone={slipResult.success ? 'ok' : 'bad'}>
                        {slipResult.message} {slipResult.success ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                    </Pill>
                </Field>

                <div className="pda-rule" />

                <Field label="จำนวนเงิน">
                    <span className="pda-amount">{formatAmount(slipResult.amount)} บาท</span>
                </Field>

                <Field label="วันที่/เวลา">
                    <Text>{formatDate(slipResult.transDate, slipResult.transTime)}</Text>
                </Field>

                <div className="pda-rule" />

                <Field label="ผู้โอน">
                    <div><Text>{slipResult.sender?.displayName}</Text></div>
                    <div><Text type="secondary">({slipResult.sender?.account?.value})</Text></div>
                </Field>

                <Field label="ผู้รับ">
                    <div><Text>{slipResult.receiver?.displayName}</Text></div>
                    <div><Text type="secondary">({slipResult.receiver?.account?.value})</Text></div>
                </Field>

                <div className="pda-rule" />

                <Field label="หมายเลขอ้างอิง">
                    <Text copyable className="pda-ref">{slipResult.transRef}</Text>
                </Field>

                <Field label="ธนาคารต้นทาง">
                    <Text>{slipResult.sendingBank}</Text>
                </Field>
                <Field label="ธนาคารปลายทาง">
                    <Text>{slipResult.receivingBank}</Text>
                </Field>

                <div className="pda-rule" />

                <div className="pda-actions">
                    {isSameAmount ? (
                        <Button type="primary" onClick={onApprove}>
                            อนุมัติการชำระ
                        </Button>
                    ) : (
                        <Button type="primary" onClick={onPartial}>
                            แบ่งจ่ายบางส่วน
                        </Button>
                    )}
                    <Button danger onClick={onReject}>
                        ปฏิเสธ
                    </Button>
                </div>
            </Space>
        ) : (
            <div className="pda-empty">
                <Text type="secondary">กรุณาตรวจสอบสลิปเพื่อดูผลลัพธ์</Text>
            </div>
        )}
    </Section>
);

const PaymentDrawerAdmin = ({
                                open,
                                onClose,
                                paymentData,
                                handleCheckSlip,
                                bankData,
                                setSelectedBank,
                                selectedBank,
                                slipResult,
                                handleConfirmSlip,
                                isSameAmount,
                                accountId,
                                // handleConfirm,
                                isSlipCheckEnabled = false,
                                handleCanceledSlip,
                            }) => {


    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleCancel, setModalVisibleCancel] = useState(false);

    const columns = [
        {
            title: "รายการ",
            dataIndex: "description",
            key: "description",
            render: (text) => {
                const color = colorMap[text] || C.ink;
                return (
                    <span style={{ color, fontWeight: 600 }}>
                        {text}
                    </span>
                );
            },
        },
        {
            title: "จำนวนเงิน (บาท)",
            dataIndex: "amount",
            key: "amount",
            render: (_, value) => {
                const color = colorMap[value?.description] || C.ink;
                const textDecoration = underlineMap[value?.description] || 'none';
                return (
                    <span style={{ color, fontWeight: 600, textDecoration }}>
                        {value?.amount?.toLocaleString()}
                    </span>
                );
            },
        },
    ];

    const options = bankData?.result?.banks.map((item, index) => ({
        key: index + 1,
        value: item.accountNumber,
        label: `${item.accountName} (${item.bankKey.toUpperCase()})`,
        data: item // เก็บข้อมูลทั้ง object
    }));

    const handleConfirm = async (data) => {

        const values2 = {
            accountId: accountId,
            billId: paymentData.billId._id,
            billNumber: paymentData.billId.billNumber,
            paymentId: paymentData.paymentId,
            tenant: paymentData.tenantInfo.id,
            reason: data.reason,
            description: data.description,
            customNote: data.customNote || "",
            timestamp: data.timestamp,
        }
        console.log(`⩇⩇:⩇⩇🚨 ~ values2 :`, values2);

        const values = {
            ...data,
            accountId
        }

        if (data.reason) {
            console.log(`อันนี้ยกเลิก`);
        } else {
            const res = await confirmPayment(values)

            if (res.success) {
                Swal.fire('ทำการยืนยันการชำระสำเร็จ')
            }
            console.log(`อันนี้ตกลง`);
        }

        // API call here
        setModalVisible(false);
    };

    const isCompletedOrRejected = ['completed', 'rejected', 'outstanding'].includes(paymentData?.paymentStatus);

    const bankSelect = (
        <Select
            style={{ width: "100%" }}
            options={options}
            placeholder="เลือกบัญชีที่ได้รับโอน"
            aria-label="เลือกบัญชีที่ได้รับโอน"
            onChange={(value, option) => setSelectedBank(option.data)}
        />
    );

    const checkSlipButton = (
        <Button
            disabled={!selectedBank}
            type="primary"
            block
            onClick={() => handleCheckSlip(paymentData)}
        >
            ตรวจสอบสลิปการโอน
        </Button>
    );

    return (
        <ConfigProvider theme={theme}>
            <Drawer
                rootClassName="pda"
                styles={{
                    header: { background: C.ink },
                    body: { padding: '24px', background: C.page }
                }}
                title={
                    <div className="pda-head">
                        <span className="pda-head-title">
                            {`รายละเอียดการชำระเงิน - ห้อง ${paymentData?.tenantInfo?.roomNumber}`}
                        </span>
                        <button type="button" className="pda-close" aria-label="ปิด" onClick={onClose}>
                            <CloseOutlined />
                        </button>
                    </div>
                }
                width={600}
                onClose={onClose}
                open={open}
                placement="top"
                height="100vh"
                closable={false}
            >
                <style>{css}</style>
                <div className="pda-wrap">
                    <Section>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="ชื่อผู้เช่า">
                                {paymentData?.tenantInfo?.name}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="ที่อยู่">
                                {paymentData?.tenantInfo?.address}
                            </Descriptions.Item> */}
                            <Descriptions.Item label="วันที่ชำระ">
                                {new Date(paymentData?.paymentDate).toLocaleDateString("th-TH")}
                            </Descriptions.Item>
                            <Descriptions.Item label="วิธีการชำระ">
                                {paymentData?.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="สถานะ">
                                <Pill tone={paymentStatusTone[paymentData?.paymentStatus] || 'neutral'}>
                                    {paymentStatusLabel[paymentData?.paymentStatus] || paymentData?.paymentStatus}
                                </Pill>
                            </Descriptions.Item>
                        </Descriptions>
                    </Section>

                    <Section icon={<UnorderedListOutlined />} title="รายละเอียดค่าบริการ">
                        <Table
                            columns={columns}
                            dataSource={paymentData?.lineItems}
                            rowKey="description"
                            pagination={false}
                            size="small"
                        />
                    </Section>

                    {paymentData?.billId?.paymentHistory && paymentData?.billId?.paymentHistory.length > 0 && (
                        <div>
                            <PaymentHistory
                                paymentHistory={paymentData?.billId?.paymentHistory}
                            />
                        </div>
                    )}

                    {isCompletedOrRejected ? (
                        <>
                            {paymentData?.partialPayments?.map((item) => {
                                const st = partialStatus(item.paymentStatus);
                                return (
                                    <div className="pda-pay-card" key={item._id}>
                                        <div className="pda-pay-row">
                                            <span>
                                                {/* ห้อง {item.tenant?.room?.roomNumber} - {item.tenant?.firstName} {item.tenant?.lastName} */}
                                            </span>
                                            <Pill tone={st.tone}>{st.text}</Pill>
                                        </div>

                                        {/* รหัสการชำระและวันที่ */}
                                        <div className="pda-pay-row">
                                            <div>
                                                <strong>รหัสการชำระ:</strong> {item.paymentId}
                                            </div>
                                            <div className="pda-muted">
                                                {formatPartialDate(item.paymentDate)}
                                            </div>
                                        </div>

                                        {/* รายละเอียดการชำระ */}
                                        <div>
                                            <strong>รายละเอียด:</strong> {item.description}
                                        </div>

                                        {/* จำนวนเงิน */}
                                        <div className="pda-pay-row">
                                            <div>
                                                <strong>จำนวนเงินรวม:</strong> ฿{formatPartialAmount(item.totalAmount)}
                                            </div>
                                        </div>

                                        {/* หลักฐานการชำระ */}
                                        {item.attachments && (
                                            <div>
                                                <strong>หลักฐานการชำระ:</strong>{' '}
                                                <a
                                                    className="pda-link"
                                                    href={item.attachments}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    ดูหลักฐาน
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            {/* ถ้าเปิดใช้ การเช็คสลิป */}
                            {isSlipCheckEnabled ? (
                                <>
                                    {paymentData?.length > 0 ? (
                                        <>
                                            {paymentData?.map((item, index) => (
                                                <div className="pda-slip-grid" key={index + 1}>
                                                    {/* ส่วนซ้าย - Slip Checker */}
                                                    <Section icon={<PictureOutlined />} title="สลิปการโอน">
                                                        <SlipImage src={item?.attachments} />
                                                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                                            {bankSelect}
                                                            {checkSlipButton}
                                                        </Space>
                                                    </Section>

                                                    {/* ส่วนขวา - ผลการตรวจสอบ */}
                                                    <SlipResultPanel
                                                        slipResult={slipResult}
                                                        isSameAmount={isSameAmount}
                                                        onApprove={() => handleConfirmSlip(paymentData, slipResult)}
                                                        onPartial={() => setModalVisible(true)}
                                                        onReject={() => handleCanceledSlip(paymentData, slipResult)}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="pda-slip-grid">
                                            {/* ส่วนซ้าย - Slip Checker */}
                                            <Section icon={<PictureOutlined />} title="สลิปการโอน">
                                                <SlipImage src={paymentData?.attachments} />
                                                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                                    {bankSelect}
                                                    {checkSlipButton}
                                                </Space>
                                            </Section>

                                            {/* ส่วนขวา - ผลการตรวจสอบ */}
                                            <SlipResultPanel
                                                slipResult={slipResult}
                                                isSameAmount={isSameAmount}
                                                onApprove={() => handleConfirmSlip(paymentData, slipResult)}
                                                onPartial={() => setModalVisible(true)}
                                                onReject={() => setModalVisibleCancel(true)}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* ถ้าไม่ได้เปิดใช้ การเช็คสลิป */}
                                    <Section>
                                        <SlipImage src={paymentData?.attachments} />
                                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                            <Button
                                                type="primary"
                                                block
                                                onClick={() => setModalVisible(true)}
                                            >
                                                ยืนยันการชำระ
                                            </Button>

                                            <Button
                                                danger
                                                block
                                                // onClick={() => handleCanceledNotCheckSlip(paymentData)}
                                                onClick={() => setModalVisibleCancel(true)}
                                            >
                                                ปฏิเสธ
                                            </Button>
                                        </Space>
                                    </Section>
                                </>
                            )}
                        </>
                    )}
                </div>

                <FlexiblePaymentModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onConfirm={handleConfirm}
                    billData={{
                        id: 'bill-123',
                        billNumber: 'B-2024-001',
                        totalAmount: 5000,
                        paidAmount: 3000,
                        remainingAmount: 2000,
                        dueDate: '2024-02-15',
                        slipAmount: 1200,
                        paymentHistory: [
                            { id: 1, amount: 2000, method: 'transfer', date: '2024-01-15', reference: 'TXN001' },
                            { id: 2, amount: 1000, method: 'cash', date: '2024-01-20', reference: '' }
                        ]
                    }}
                    slipResult={slipResult}
                    paymentData={paymentData}
                />

                <FlexiblePaymentCancelModal
                    visible={modalVisibleCancel}
                    onCancel={() => setModalVisibleCancel(false)}
                    onConfirm={handleConfirm}
                    handleCanceledSlip={handleCanceledSlip}
                />
            </Drawer>
        </ConfigProvider>
    );
};

export default PaymentDrawerAdmin