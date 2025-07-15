import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Collapse, Divider, Empty, Flex, Input, message, Spin, Typography } from 'antd';
import { useState } from 'react';
import { getRoom, updatePrice } from '../../service/api/rooms';
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware';
import RoomCard from './components/rooms/RoomCard';


const { Title, Text } = Typography;

const ListRoom = () => {
    const { user } = persistMiddleware();
    const profileId = user.userPayLoad.user.id;
    const queryClient = useQueryClient();

    // States for selections and inputs
    const [selectedRooms, setSelectedRooms] = useState({});
    const [amountInputs, setAmountInputs] = useState({});
    const [globalPriceInput, setGlobalPriceInput] = useState(''); // State สำหรับราคารวม

    // Fetching data with TanStack Query
    const { data, isLoading, isError } = useQuery({
        queryKey: ['listRoom', profileId],
        queryFn: () => getRoom(profileId),
    });

    // Mutation for updating the price
    const updatePriceMutation = useMutation({
        mutationFn: updatePrice,
        onSuccess: (data) => {
            message.success(data.message || 'อัปเดตราคาสำเร็จ!');
            setSelectedRooms({}); // ล้างห้องที่เลือกทั้งหมด
            setGlobalPriceInput(''); // ล้าง Input ราคารวม
            setAmountInputs({}); // ล้าง Input ราคาแต่ละชั้น
            queryClient.invalidateQueries(['listRoom', profileId]);
        },
        onError: (error) => {
            message.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตราคา');
        },
    });

    const allRooms = data?.result || [];

    // --- LOGIC: สำหรับ "เลือกทั้งหมด" ---
    const totalSelectedCount = Object.values(selectedRooms).filter(Boolean).length;
    const isAllSelected = totalSelectedCount === allRooms.length && allRooms.length > 0;
    const isIndeterminate = totalSelectedCount > 0 && totalSelectedCount < allRooms.length;

    const handleSelectAllRooms = (e) => {
        const { checked } = e.target;
        const newSelectedRooms = {};
        if (checked) {
            allRooms.forEach(room => {
                newSelectedRooms[room._id] = true;
            });
        }
        setSelectedRooms(newSelectedRooms);
    };

    // --- LOGIC: สำหรับการ Submit ราคารวม ---
    const handleSubmitAllSelected = () => {
        const selectedRoomIds = Object.keys(selectedRooms).filter(roomId => selectedRooms[roomId]);

        if (!globalPriceInput || globalPriceInput <= 0) {
            message.warning('กรุณาระบุราคาที่ถูกต้อง');
            return;
        }

        updatePriceMutation.mutate({
            roomNumber: selectedRoomIds,
            price: Number(globalPriceInput),
            accountId: profileId
        });
    };

    const handleToggleRoom = (roomId) => {
        setSelectedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
    };

    const handleSelectAllInFloor = (roomsInFloor, select = true) => {
        const updated = { ...selectedRooms };
        roomsInFloor.forEach(room => {
            updated[room._id] = select;
        });
        setSelectedRooms(updated);
    };

    const handleSubmitFloor = (floor, roomsInFloor) => {
        const selectedRoomIds = roomsInFloor
            .filter(room => selectedRooms[room._id])
            .map(r => r._id);

        const price = amountInputs[floor];

        if (!price || price <= 0) {
            message.warning('กรุณาระบุราคาที่ถูกต้อง');
            return;
        }

        updatePriceMutation.mutate({
            roomNumber: selectedRoomIds,
            price: Number(price),
            accountId: profileId
        });
    };

    // Group rooms by floor
    const groupedByFloor = allRooms.reduce((acc, cur) => {
        (acc[cur.floor] = acc[cur.floor] || []).push(cur);
        return acc;
    }, {});

    if (isLoading) {
        return <Flex justify="center" align="center" style={{ minHeight: '50vh' }}><Spin size="large" /></Flex>;
    }

    if (isError || !data?.result) {
        return <Empty description="ไม่สามารถโหลดข้อมูลห้องได้" style={{ marginTop: 50 }} />;
    }

    // ... (โค้ดส่วน Collapse และอื่นๆ ไม่เปลี่ยนแปลง)
    const collapseItems = Object.keys(groupedByFloor).map((floor) => {
        const rooms = groupedByFloor[floor];
        const selectedInThisFloor = rooms.filter(room => selectedRooms[room._id]);
        
        return {
            key: floor,
            label: `ชั้นที่ ${floor} (${rooms.length} ห้อง)`,
            children: (
                <div>
                    {/* --- Action Bar --- */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap="16px">
                        <Flex gap="small">
                            <Button onClick={() => handleSelectAllInFloor(rooms, true)}>เลือกทั้งชั้น</Button>
                            <Button danger onClick={() => handleSelectAllInFloor(rooms, false)}>ล้างการเลือก</Button>
                        </Flex>
                        {selectedInThisFloor.length > 0 && (
                            <Text type="secondary">{selectedInThisFloor.length} ห้องที่เลือก</Text>
                        )}
                    </Flex>
                    <Divider style={{ margin: '16px 0' }} />

                    {/* --- Room Grid --- */}
                    <Flex wrap="wrap" gap={16}>
                        {rooms.sort((a, b) => a.roomNumber - b.roomNumber).map((room) => (
                            <RoomCard
                                key={room._id}
                                room={room}
                                isSelected={!!selectedRooms[room._id]}
                                onSelect={() => handleToggleRoom(room._id)}
                            />
                        ))}
                    </Flex>

                    {/* --- Price Update Section (Per Floor) --- */}
                    {/* {selectedInThisFloor.length > 0 && (
                        <>
                            <Divider style={{ margin: '24px 0 16px' }} />
                            <Flex align="center" gap="middle" wrap="wrap">
                                <Title level={5} style={{ margin: 0 }}>อัปเดตราคาสำหรับห้องที่เลือกในชั้นนี้:</Title>
                                <Input
                                    type="number"
                                    addonBefore="฿"
                                    placeholder="ระบุราคา"
                                    value={amountInputs[floor] || ''}
                                    onChange={(e) => setAmountInputs(prev => ({ ...prev, [floor]: e.target.value }))}
                                    style={{ width: 200 }}
                                />
                                <Button
                                    type="primary"
                                    onClick={() => handleSubmitFloor(floor, rooms)}
                                    loading={updatePriceMutation.isPending}
                                >
                                    บันทึก
                                </Button>
                            </Flex>
                        </>
                    )} */}
                </div>
            ),
        };
    });


    return (
        <div>
            <Title level={3}>จัดการห้องพัก</Title>

            {/* === UI: ส่วนของ "เลือกทั้งหมด" ที่เพิ่มเข้ามา === */}
            <Flex
                align="center"
                gap="large"
                wrap="wrap"
                style={{
                    padding: '16px',
                    backgroundColor: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: '8px',
                    marginTop: '20px',
                }}
            >
                <Checkbox
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAllRooms}
                    checked={isAllSelected}
                >
                    <Text strong>เลือกทั้งหมด</Text>
                </Checkbox>

                {totalSelectedCount > 0 && (
                    <Flex align="center" gap="middle">
                        <Text type="secondary" strong>{totalSelectedCount} ห้องที่เลือก</Text>
                        <Input
                            type="number"
                            addonBefore="฿"
                            placeholder="กำหนดราคารวม"
                            value={globalPriceInput}
                            onChange={(e) => setGlobalPriceInput(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Button
                            type="primary"
                            onClick={handleSubmitAllSelected}
                            loading={updatePriceMutation.isPending}
                        >
                            อัปเดตราคาห้องที่เลือก
                        </Button>
                    </Flex>
                )}
            </Flex>
            {/* ======================================= */}

            <Collapse items={collapseItems} style={{ marginTop: '20px' }} defaultActiveKey={collapseItems.map(item => item.key)} />
        </div>
    );
};

export default ListRoom;