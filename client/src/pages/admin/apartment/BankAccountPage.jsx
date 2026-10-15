import {
    BankOutlined,
    CheckOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, ConfigProvider, message, Modal, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';

import allThaiBanks from '../../../../bank.json';
import { createBankAccount, deleteBankAccount, listBankAccount } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import ManageBanksPage from './ManageBanksPage';

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
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    okFg: '#15803D',
    dangerBg: '#FFE4E9',
    dangerFg: '#9F1239',
    dangerNum: '#BE123C',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.bk-page {
    max-width: 800px; margin: 0 auto; padding: 24px; width: 100%;
    box-sizing: border-box; font-family: ${FONT}; color: ${C.ink}; background: ${C.page};
}
.bk-stack { display: flex; flex-direction: column; gap: 20px; }

.bk-banner {
    background: ${C.ink}; border-radius: 20px; padding: 24px 28px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.bk-banner-icon {
    width: 52px; height: 52px; border-radius: 14px; background: ${C.raised}; color: ${C.onDarkIcon};
    display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
}
.bk-banner-text { flex: 1 1 240px; min-width: 0; }
.bk-banner h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.bk-banner p { margin: 4px 0 0; font-size: 14px; color: ${C.onDarkMuted}; }

.bk-btn.ant-btn {
    background: ${C.primary}; color: #fff; font-weight: 600; border: none;
    border-radius: 12px; height: 44px; padding: 0 22px;
}
.bk-btn.ant-btn:hover { background: ${C.primaryDeep} !important; color: #fff !important; }

.bk-section {
    background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; padding: 24px;
}
.bk-list { display: flex; flex-direction: column; gap: 10px; }
.bk-row {
    display: flex; align-items: center; gap: 14px;
    background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px; padding: 12px 16px;
}
.bk-logo.ant-avatar { border-radius: 10px; background: ${C.card}; border: 1px solid ${C.line}; flex-shrink: 0; }
.bk-info { flex: 1; min-width: 0; }
.bk-bank { font-size: 16px; font-weight: 700; color: ${C.ink}; }
.bk-meta { margin-top: 2px; font-size: 14px; color: ${C.muted}; word-break: break-word; }
.bk-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

.bk-icon-btn {
    width: 40px; height: 40px; border-radius: 10px; border: 0; background: transparent;
    color: ${C.muted}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
    font-size: 16px; font-family: inherit;
}
.bk-icon-btn:hover { background: ${C.primarySoft}; color: ${C.primarySoftText}; }
.bk-icon-btn.ok { color: ${C.okFg}; }
.bk-icon-btn.danger { color: ${C.dangerNum}; }
.bk-icon-btn.danger:hover { background: ${C.dangerBg}; color: ${C.dangerFg}; }

.bk-empty { text-align: center; padding: 40px 16px; }
.bk-empty-icon {
    width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px;
    background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.bk-empty p { margin: 0; font-size: 14px; color: ${C.muted}; }

.bk-modal-title { font-size: 16px; font-weight: 700; color: ${C.ink}; font-family: ${FONT}; }

.bk-page button:focus-visible, .bk-page .ant-btn:focus-visible {
    outline: 3px solid ${C.primary}; outline-offset: 2px;
}

@media (max-width: 768px) {
    .bk-page { padding: 12px; }
    .bk-banner { padding: 20px; border-radius: 16px; }
    .bk-banner h1 { font-size: 22px; }
    .bk-banner .bk-btn { width: 100%; }
    .bk-section { padding: 16px; border-radius: 16px; }
    .bk-row { padding: 10px 12px; gap: 10px; }
}
`;

// ฟังก์ชันแปลงข้อมูลธนาคารให้หาได้ง่าย
const banksMap = new Map(allThaiBanks.map(bank => [bank.key, bank]));

// Mock data เริ่มต้น (เพื่อให้เห็นภาพ)
const initialUserBanks = [
    { id: 1, bankKey: 'kbank', accountNumber: '1234567890', accountName: 'นายสมชาย ใจดี' },
    { id: 2, bankKey: 'scb', accountNumber: '0987654321', accountName: 'นางสาวสมศรี มีสุข' },
];


// ฟังก์ชันซ่อนเลขบัญชี
// const maskAccountNumber = (number) => `•••• •••• ••${number?.slice(-4)}`;

const BankAccountForm = () => {

    const [userBanks, setUserBanks] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    // ✨ CHANGE: เพิ่ม state สำหรับเก็บข้อมูลบัญชีที่กำลังจะแก้ไข
    const [editingBank, setEditingBank] = useState(null);


    const { user } = persistMiddleware()
    const accId = user?.userPayLoad?.user?.id



    const { data } = useQuery({
        queryKey: ['listBankAccount'],
        queryFn: () => listBankAccount(accId),
        enabled: !!accId
    })



    useEffect(() => {
        if (data?.result?.banks) {
            setUserBanks(data.result.banks)
        }
    }, [data])

    const handleShowAddModal = () => {
        setEditingBank(null); // เคลียร์ค่าเก่า (ถ้ามี)
        setIsModalVisible(true);
    };

    // ✨ CHANGE: ฟังก์ชันสำหรับแสดง Modal เพื่อแก้ไข
    const handleShowEditModal = (bank) => {
        // แปลง bankKey เป็น bank เพื่อให้ตรงกับชื่อฟิลด์ในฟอร์ม
        const formValues = {
            bank: bank.bankKey,
            accountNumber: bank.accountNumber,
            accountName: bank.accountName
        };
        setEditingBank({ ...bank, formValues });
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingBank(null); // เคลียร์ข้อมูลที่กำลังแก้ไขเมื่อปิด Modal
    };

    // ✨ CHANGE: ฟังก์ชันสำหรับบันทึกข้อมูล (รองรับทั้งเพิ่มและแก้ไข)
    const handleSaveBank = async (values) => {

        if (editingBank) {
            // โหมดแก้ไข
            setUserBanks(userBanks.map(bank =>
                bank._id === editingBank._id
                    ? { ...bank, bankKey: values.bank, accountNumber: values.accountNumber, accountName: values.accountName }
                    : bank
            ));



        } else {
            // โหมดเพิ่มใหม่
            const newBank = {
                accountId: accId,
                bankKey: values.bank,
                accountNumber: values.accountNumber,
                accountName: values.accountName,
                API_KEY: values.API_KEY,
                BRANCH_ID: values.BRANCH_ID,
            };
            console.log(`⩇⩇:⩇⩇🚨 ~ handleSaveBank ~ newBank :`, newBank);
            // const data = await createBankAccount(newBank)
            // console.log(`⩇⩇:⩇⩇🚨 ~ handleSaveBank ~ data :`, data);





            setUserBanks([...userBanks, newBank]);
        }
        handleCancelModal(); // ปิด Modal และเคลียร์ state
    };

    const handleDeleteBank = async (id) => {

        const ss = await deleteBankAccount(id)
        console.log(`⩇⩇:⩇⩇🚨 ~ handleDeleteBank ~ ss :`, ss);


    };

    // ✨ CHANGE: เช็คว่าเป็นโหมดแก้ไขหรือไม่
    const isEditing = !!editingBank;
    // ✨ 1. เพิ่ม State สำหรับจัดการสถานะการคัดลอก
    const [copiedId, setCopiedId] = useState(null);
    // ✨ 2. สร้างฟังก์ชันสำหรับจัดการการคัดลอก
    const handleCopy = (accountNumber, id) => {
        navigator.clipboard.writeText(accountNumber).then(() => {
            // เมื่อคัดลอกสำเร็จ
            message.success('คัดลอกเลขบัญชีแล้ว');
            setCopiedId(id);
            // เปลี่ยนไอคอนกลับเป็นปกติหลังจาก 2 วินาที
            setTimeout(() => {
                setCopiedId(null);
            }, 2000);
        }).catch(err => {
            // กรณีเกิดข้อผิดพลาด
            message.error('ไม่สามารถคัดลอกได้');
        });
    };

    const bankList = userBanks || [];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="bk-page">
                <div className="bk-stack">
                    <header className="bk-banner">
                        <div className="bk-banner-icon" aria-hidden="true"><BankOutlined /></div>
                        <div className="bk-banner-text">
                            <h1>บัญชีธนาคารของฉัน</h1>
                            <p>จัดการบัญชีธนาคารสำหรับรับชำระเงิน</p>
                        </div>
                        <Button type="primary" className="bk-btn" icon={<PlusOutlined />} onClick={handleShowAddModal}>
                            เพิ่มบัญชีใหม่
                        </Button>
                    </header>

                    <section className="bk-section">
                        {bankList.length === 0 ? (
                            <div className="bk-empty">
                                <div className="bk-empty-icon" aria-hidden="true"><BankOutlined /></div>
                                <p>ยังไม่มีบัญชีธนาคาร</p>
                            </div>
                        ) : (
                            <div className="bk-list">
                                {bankList.map((item, index) => {
                                    const bankInfo = banksMap.get(item.bankKey);
                                    const rowId = item._id ?? item.id ?? index;
                                    const isCopied = copiedId === rowId;
                                    const bankName = bankInfo?.thai_name ?? item.bankKey;
                                    return (
                                        <div className="bk-row" key={rowId}>
                                            <Avatar
                                                className="bk-logo"
                                                size="large"
                                                src={bankInfo ? `/icons/banks/${bankInfo.key.toUpperCase()}.png` : undefined}
                                                icon={<BankOutlined />}
                                            />
                                            <div className="bk-info">
                                                <div className="bk-bank">{bankName}</div>
                                                <div className="bk-meta">{`${item.accountName} - ${item.accountNumber}`}</div>
                                            </div>
                                            <div className="bk-actions">
                                                <button
                                                    type="button"
                                                    className={`bk-icon-btn${isCopied ? ' ok' : ''}`}
                                                    aria-label={`คัดลอกเลขบัญชี ${bankName}`}
                                                    onClick={() => handleCopy(item.accountNumber, rowId)}
                                                >
                                                    {isCopied ? <CheckOutlined /> : <CopyOutlined />}
                                                </button>
                                                {/* ✨ CHANGE: เพิ่มปุ่มแก้ไข */}
                                                <button
                                                    type="button"
                                                    className="bk-icon-btn"
                                                    aria-label={`แก้ไขบัญชี ${bankName}`}
                                                    onClick={() => handleShowEditModal(item)}
                                                >
                                                    <EditOutlined />
                                                </button>
                                                <Popconfirm
                                                    title="ยืนยันการลบบัญชี?"
                                                    onConfirm={() => handleDeleteBank(item._id)}
                                                    okText="ยืนยัน"
                                                    cancelText="ยกเลิก"
                                                >
                                                    <button
                                                        type="button"
                                                        className="bk-icon-btn danger"
                                                        aria-label={`ลบบัญชี ${bankName}`}
                                                    >
                                                        <DeleteOutlined />
                                                    </button>
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <Modal
                    // ✨ CHANGE: เปลี่ยน Title ของ Modal ตามโหมด
                    title={<div className="bk-modal-title">{isEditing ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคารใหม่'}</div>}
                    open={isModalVisible}
                    onCancel={handleCancelModal}
                    footer={null}
                    destroyOnHidden
                    centered
                    styles={{ content: { borderRadius: 20 } }}
                >
                    {/* ✨ CHANGE: ส่งข้อมูลเริ่มต้นและฟังก์ชัน onFinish ไปยังฟอร์ม */}
                    <ManageBanksPage
                        onFinish={handleSaveBank}
                        initialValues={editingBank?.formValues}


                    />
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default BankAccountForm;