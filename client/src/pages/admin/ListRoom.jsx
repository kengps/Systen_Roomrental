import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Collapse, Divider, Empty, Flex, Input, message, Spin, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { updatePrice } from '../../service/api/rooms';
import { useListRoom } from '../../hooks/useListRoom';
import RoomCard from './components/rooms/RoomCard';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;

const ListRoom = () => {
    const queryClient = useQueryClient();
    
    // State for screen size detection
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // States for selections and inputs
    const [selectedRooms, setSelectedRooms] = useState({});
    const [amountInputs, setAmountInputs] = useState({});
    const [globalPriceInput, setGlobalPriceInput] = useState('');

    // ใช้ utility hook แทน useQuery
    const { data, isLoading, isError } = useListRoom();
 

    // Mutation for updating the price
    const updatePriceMutation = useMutation({
        mutationFn: updatePrice,
        onSuccess: (data) => {
            message.success(data.message || 'อัปเดตราคาสำเร็จ!');
            setSelectedRooms({});
            setGlobalPriceInput('');
            setAmountInputs({});
            queryClient.invalidateQueries(['listRoom', profileId]);
        },
        onError: (error) => {
            message.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตราคา');
        },
    });

    const allRooms = data?.result || [];

    // Logic for "Select All"
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

    // Dynamic styles based on screen size
    const containerStyle = {
        padding: isMobile ? '8px' : '16px',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
    };

    const globalSelectionStyle = {
        padding: isMobile ? '12px' : '16px',
        backgroundColor: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: '8px',
        marginTop: isMobile ? '12px' : '20px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
    };

    const roomGridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile 
            ? 'repeat(2, 1fr)'  // 2 columns on mobile
            : isTablet 
                ? 'repeat(auto-fill, minmax(160px, 1fr))' 
                : 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: isMobile ? '8px' : isTablet ? '10px' : '8px',
        width: '100%',
        maxWidth: '100%',
        justifyContent: 'start',
        boxSizing: 'border-box',
        overflow: 'hidden',
    };

    const collapseItems = Object.keys(groupedByFloor).map((floor) => {
        const rooms = groupedByFloor[floor];
        const selectedInThisFloor = rooms.filter(room => selectedRooms[room._id]);
        
        return {
            key: floor,
            label: (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#667eea',
                            boxShadow: '0 0 8px rgba(102, 126, 234, 0.5)'
                        }} />
                        <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            ชั้นที่ {floor} ({rooms.length} ห้อง)
                        </span>
                    </div>
                    {selectedInThisFloor.length > 0 && (
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}>
                            {selectedInThisFloor.length} ห้องที่เลือก
                        </div>
                    )}
                </div>
            ),
            children: (
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        opacity: 0.1
                    }} />
                    
                    {/* Action Bar */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Flex 
                            justify="space-between" 
                            align={isMobile ? "flex-start" : "center"}
                            wrap="wrap" 
                            gap={isMobile ? "12px" : "16px"}
                            vertical={isMobile}
                            style={{ marginBottom: isMobile ? '16px' : '20px' }}
                        >
                            <Flex gap={isMobile ? "8px" : "12px"} wrap="wrap">
                                <Button 
                                    size={isMobile ? "small" : "middle"}
                                    onClick={() => handleSelectAllInFloor(rooms, true)}
                                    style={{ 
                                        fontSize: isMobile ? '12px' : '14px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    เลือกทั้งชั้น
                                </Button>
                                <Button 
                                    danger 
                                    size={isMobile ? "small" : "middle"}
                                    onClick={() => handleSelectAllInFloor(rooms, false)}
                                    style={{ 
                                        fontSize: isMobile ? '12px' : '14px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
                                    }}
                                >
                                    ล้างการเลือก
                                </Button>
                            </Flex>
                        </Flex>
                        
                        <Divider style={{ 
                            margin: isMobile ? '12px 0' : '16px 0',
                            borderColor: '#e9ecef'
                        }} />

                        {/* Room Grid */}
                        <div style={roomGridStyle}>
                            {rooms.sort((a, b) => a.roomNumber - b.roomNumber).map((room) => (
                                <RoomCard
                                    key={room._id}
                                    room={room}
                                    isSelected={!!selectedRooms[room._id]}
                                    onSelect={() => handleToggleRoom(room._id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ),
        };
    });

    return (
        <div style={containerStyle}>
            <PageHeader
                title="จัดการห้องพัก"
                subtitle="จัดการราคาและข้อมูลห้องพักทั้งหมด"
                icon="🏠"
            />

            {/* Global Selection UI */}
            <div style={globalSelectionStyle}>
                <Flex
                    align={isMobile ? "flex-start" : "center"}
                    gap={isMobile ? "12px" : "16px"}
                    wrap="wrap"
                    vertical={isMobile}
                    style={{
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                    }}
                >
                    <Checkbox
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAllRooms}
                        checked={isAllSelected}
                    >
                        <Text strong style={{ fontSize: isMobile ? '14px' : '16px' }}>
                            เลือกทั้งหมด
                        </Text>
                    </Checkbox>

                    {totalSelectedCount > 0 && (
                        <Flex 
                            align={isMobile ? "flex-start" : "center"}
                            gap={isMobile ? "8px" : "12px"}
                            wrap="wrap"
                            vertical={isMobile}
                            style={{ width: isMobile ? '100%' : 'auto' }}
                        >
                            <Text 
                                type="secondary" 
                                strong
                                style={{ fontSize: isMobile ? '12px' : '14px' }}
                            >
                                {totalSelectedCount} ห้องที่เลือก
                            </Text>
                            
                            <Flex 
                                gap={isMobile ? "8px" : "12px"} 
                                wrap="wrap"
                                style={{ width: isMobile ? '100%' : 'auto' }}
                            >
                                <Input
                                    type="number"
                                    addonBefore="฿"
                                    placeholder="กำหนดราคารวม"
                                    value={globalPriceInput}
                                    onChange={(e) => setGlobalPriceInput(e.target.value)}
                                    style={{ 
                                        width: isMobile ? '100%' : '180px',
                                        minWidth: isMobile ? 'auto' : '150px'
                                    }}
                                    size={isMobile ? "small" : "middle"}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleSubmitAllSelected}
                                    loading={updatePriceMutation.isPending}
                                    size={isMobile ? "small" : "middle"}
                                    style={{ 
                                        width: isMobile ? '100%' : 'auto',
                                        fontSize: isMobile ? '12px' : '14px'
                                    }}
                                >
                                    {isMobile ? 'อัปเดต' : 'อัปเดตราคาห้องที่เลือก'}
                                </Button>
                            </Flex>
                        </Flex>
                    )}
                </Flex>
            </div>

            {/* Collapse */}
            <Collapse 
                items={collapseItems} 
                style={{ 
                    marginTop: isMobile ? '12px' : '20px',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    background: 'transparent',
                    border: 'none'
                }}
                defaultActiveKey={collapseItems.map(item => item.key)}
                size={isMobile ? "small" : "middle"}
                expandIcon={({ isActive }) => (
                    <div style={{
                        transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        fontSize: '16px',
                        color: '#667eea'
                    }}>
                        ▼
                    </div>
                )}
                expandIconPosition="end"
            />
        </div>
    );
};

export default ListRoom;