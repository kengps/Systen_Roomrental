import { CheckOutlined, CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Empty, List, message, Modal, Popconfirm, Space, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
const { Title, Text } = Typography;

import allThaiBanks from '../../../../bank.json';
import { createBankAccount, deleteBankAccount, listBankAccount } from '../../../service/api/apartment';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import ManageBanksPage from './ManageBanksPage';

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
    return (
        <div style={{ background: '#f5f5f5', padding: '40px 24px' }}>
            <PageHeader
                title="บัญชีธนาคารของฉัน"
                subtitle="จัดการบัญชีธนาคารสำหรับรับชำระเงิน"
                icon="🏦"
            />
            
            <Card
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleShowAddModal}>เพิ่มบัญชีใหม่</Button>}
                style={{ maxWidth: 800, margin: '0 auto', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={userBanks}
                    locale={{ emptyText: <Empty description="ยังไม่มีบัญชีธนาคาร" /> }}
                    renderItem={(item) => {
                        const bankInfo = banksMap.get(item.bankKey);
                        return (
                            <List.Item
                                actions={[
                                    // ✨ CHANGE: เพิ่มปุ่มแก้ไข
                                    <Tooltip title="แก้ไข" key="edit">
                                        <Button type="text" icon={<EditOutlined />} onClick={() => handleShowEditModal(item)} />
                                    </Tooltip>,
                                    <Tooltip title="ลบ" key="delete">
                                        <Popconfirm
                                            title="ยืนยันการลบบัญชี?"
                                            onConfirm={() => handleDeleteBank(item._id)}
                                            okText="ยืนยัน"
                                            cancelText="ยกเลิก"
                                        >
                                            <Button type="text" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </Tooltip>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={`/icons/banks/${bankInfo.key.toUpperCase()}.png`} size="large" />}
                                    title={<Text strong>{bankInfo.thai_name}</Text>}
                                    description={`${item.accountName} - ${item.accountNumber}`}
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>

            <Modal
                // ✨ CHANGE: เปลี่ยน Title ของ Modal ตามโหมด
                title={<Title level={5}>{isEditing ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคารใหม่'}</Title>}
                open={isModalVisible}
                onCancel={handleCancelModal}
                footer={null}
                destroyOnHidden
                centered
            >
                {/* ✨ CHANGE: ส่งข้อมูลเริ่มต้นและฟังก์ชัน onFinish ไปยังฟอร์ม */}
                <ManageBanksPage
                    onFinish={handleSaveBank}
                    initialValues={editingBank?.formValues}


                />
            </Modal>

        </div>
    );
};

export default BankAccountForm;