import React, { useState, useMemo, useEffect } from 'react'
import { Spin, Alert, Segmented, Card, InputNumber, Button, Space, Typography, Row, Col, message, Input, Select, Divider } from 'antd'
import { ThunderboltOutlined, DropboxOutlined, SaveOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import PageHeader from '../../../../components/common/PageHeader'
import './ListRoomChangeUnitForm.css'
import persistMiddleware from '../../../../service/zustand/middleware/persistMiddleware'
import { updateUnitMeter } from '../../../../service/api/rooms'
import { addNotify } from '../../../../utilities/notify'
import { getNumericInputProps } from '../../../../utilities/inputValidation'

const { Title, Text } = Typography

const ListRoomChangeUnitForm = ({ data, isLoading, isError, refetch }) => {
    const [activeTab, setActiveTab] = useState('water')
    const [unitValues, setUnitValues] = useState({})
    const [searchText, setSearchText] = useState('')
    const [selectedFloor, setSelectedFloor] = useState(null)
    const [selectedRooms, setSelectedRooms] = useState(new Set())
    const [bulkUnitValue, setBulkUnitValue] = useState('')


    const { user, } = persistMiddleware()
    const accountId = user?.userPayLoad?.user?.id
    const rooms = data?.result || []

    // Reset selected rooms when activeTab changes
    useEffect(() => {
        setSelectedRooms(new Set())
        setBulkUnitValue('')
    }, [activeTab])

    // Move all useMemo hooks before any conditional returns
    const filteredRooms = useMemo(() => {
        const result = rooms.filter(room => {
            const matchesSearch = searchText === '' ||
                room.roomNumber.toString().includes(searchText) ||
                room.floor.toString().includes(searchText)
            const matchesFloor = selectedFloor === null || selectedFloor === undefined || room.floor === selectedFloor
            return matchesSearch && matchesFloor
        })

        // Sort by floor and room number
        result.sort((a, b) => {
            // First sort by floor (only relevant when showing all floors)
            if (selectedFloor === null || selectedFloor === undefined) {
                if (a.floor !== b.floor) {
                    return a.floor - b.floor
                }
            }
            // Then sort by room number within the same floor
            return a.roomNumber - b.roomNumber
        })

        return result
    }, [rooms, searchText, selectedFloor])

    // Get unique floors for filter
    const uniqueFloors = useMemo(() => {
        const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b)
        return [
            { value: null, label: 'ทั้งหมด' },
            ...floors.map(floor => ({ value: floor, label: `ชั้น ${floor}` }))
        ]
    }, [rooms])

    // Get floor statistics when showing all floors
    const floorStats = useMemo(() => {
        if (selectedFloor !== null && selectedFloor !== undefined) return null

        const stats = {}
        filteredRooms.forEach(room => {
            if (!stats[room.floor]) {
                stats[room.floor] = 0
            }
            stats[room.floor]++
        })

        return Object.entries(stats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([floor, count]) => ({ floor: parseInt(floor), count }))
    }, [filteredRooms, selectedFloor])

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    if (isError) {
        return (
            <Alert
                message="เกิดข้อผิดพลาด"
                description="ไม่สามารถโหลดข้อมูลห้องพักได้"
                type="error"
                showIcon
            />
        )
    }

    const handleUnitChange = (roomId, value) => {
        setUnitValues(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [activeTab]: value
            }
        }))
    }

    // ฟังก์ชันสำหรับเลือก/ยกเลิกการเลือกห้อง
    const toggleRoomSelection = (roomId) => {
        setSelectedRooms(prev => {
            const newSelected = new Set(prev)
            if (newSelected.has(roomId)) {
                newSelected.delete(roomId)
            } else {
                newSelected.add(roomId)
            }
            return newSelected
        })
    }

    // ฟังก์ชันสำหรับเลือกห้องทั้งหมด
    const selectAllRooms = () => {
        const allRoomIds = filteredRooms.map(room => room._id)
        setSelectedRooms(new Set(allRoomIds))
    }

    // ฟังก์ชันสำหรับยกเลิกการเลือกทั้งหมด
    const clearAllSelection = () => {
        setSelectedRooms(new Set())
    }

    // ฟังก์ชันสำหรับเลือกห้องในชั้นที่เลือก
    const selectFloorRooms = (floor) => {
        const floorRoomIds = filteredRooms
            .filter(room => room.floor === floor)
            .map(room => room._id)
        setSelectedRooms(prev => {
            const newSelected = new Set(prev)
            floorRoomIds.forEach(id => newSelected.add(id))
            return newSelected
        })
    }

    // ฟังก์ชันสำหรับยกเลิกการเลือกห้องในชั้น
    const clearFloorSelection = (floor) => {
        const floorRoomIds = filteredRooms
            .filter(room => room.floor === floor)
            .map(room => room._id)
        setSelectedRooms(prev => {
            const newSelected = new Set(prev)
            floorRoomIds.forEach(id => newSelected.delete(id))
            return newSelected
        })
    }

    // ฟังก์ชันสำหรับอัปเดตหน่วยให้ห้องที่เลือก
    const applyBulkUnit = () => {
        if (selectedRooms.size === 0) {
            message.warning('กรุณาเลือกห้องที่ต้องการอัปเดต')
            return
        }
        if (!bulkUnitValue || bulkUnitValue <= 0) {
            message.warning('กรุณาใส่หน่วยที่ถูกต้อง')
            return
        }

        const newUnitValues = { ...unitValues }
        selectedRooms.forEach(roomId => {
            newUnitValues[roomId] = {
                ...newUnitValues[roomId],
                [activeTab]: bulkUnitValue
            }
        })

        setUnitValues(newUnitValues)
        message.success(`อัปเดตหน่วย${activeTab === 'water' ? 'น้ำ' : 'ไฟ'}ให้ ${selectedRooms.size} ห้องเรียบร้อยแล้ว`)
        setBulkUnitValue('')
    }

    const handleSave = async () => {
        // Transform unitValues to the required format
        const roomNumber = {
            roomNumber: Object.keys(unitValues).filter(roomId => {
                const roomData = unitValues[roomId]
                return roomData && (roomData.water !== undefined || roomData.electric !== undefined)
            }),
            [activeTab]: Object.values(unitValues).reduce((acc, roomData) => {
                if (roomData && roomData[activeTab] !== undefined) {
                    return roomData[activeTab]
                }
                return acc
            }, "0"),



        }





        try {
            const res = await updateUnitMeter(roomNumber, accountId)



            if (res.status === 200) {
                addNotify('บันทึกข้อมูลเรียบร้อยแล้ว', 'success')
            } else {
                addNotify('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
            }

            refetch()

        } catch (error) {
            addNotify('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
        }
    }

    const segmentedOptions = [
        {
            value: 'water',
            label: (
                <span>
                    <DropboxOutlined style={{ color: '#1890ff' }} />
                    ค่าน้ำ
                </span>
            )
        },
        {
            value: 'electric',
            label: (
                <span>
                    <ThunderboltOutlined style={{ color: '#FFC107' }} />
                    ค่าไฟ
                </span>
            )
        }
    ]

    const renderRoomCards = () => {
        if (filteredRooms.length === 0) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 0',
                    background: '#fafafa',
                    borderRadius: '12px',
                    border: '2px dashed #d9d9d9'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        ไม่พบห้องที่ตรงกับเงื่อนไขการค้นหา
                    </Text>
                </div>
            )
        }

        // Group rooms by floor when showing all floors
        if (selectedFloor === null || selectedFloor === undefined) {
            const roomsByFloor = {}
            filteredRooms.forEach(room => {
                if (!roomsByFloor[room.floor]) {
                    roomsByFloor[room.floor] = []
                }
                roomsByFloor[room.floor].push(room)
            })

            const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => parseInt(a) - parseInt(b))

            return (
                <div style={{ padding: '24px 0' }}>
                    {sortedFloors.map(floor => (
                        <div key={floor} style={{ marginBottom: '32px' }}>
                            {/* Floor Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                display: 'flex',
                                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                                justifyContent: window.innerWidth < 768 ? 'flex-start' : 'space-between',
                                gap: window.innerWidth < 768 ? '12px' : '8px'
                            }}>
                                {/* Floor Info - Left */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    flex: window.innerWidth < 768 ? '0 0 auto' : '0 0 auto'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        boxShadow: '0 0 8px rgba(255,255,255,0.5)'
                                    }} />
                                    <Text style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: 'white',
                                        margin: 0
                                    }}>
                                        ชั้นที่ {floor} ({roomsByFloor[floor].length} ห้อง)
                                    </Text>
                                </div>

                                {/* Desktop: Controls on the right */}
                                {window.innerWidth >= 768 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        {/* Selected Count */}
                                        <Text style={{ 
                                            color: 'white', 
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textAlign: 'right'
                                        }}>
                                            {roomsByFloor[floor].filter(room => selectedRooms.has(room._id)).length} ห้องที่เลือก
                                        </Text>
                                        
                                        {/* Buttons */}
                                        <Button
                                            size="small"
                                            onClick={() => selectFloorRooms(parseInt(floor))}
                                            style={{
                                                background: 'rgba(255,255,255,0.2)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                height: '32px'
                                            }}
                                        >
                                            เลือกทั้งชั้น
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => clearFloorSelection(parseInt(floor))}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                height: '32px'
                                            }}
                                        >
                                            ล้างการเลือก
                                        </Button>
                                    </div>
                                )}

                                {/* Mobile: Controls below */}
                                {window.innerWidth < 768 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        width: '100%'
                                    }}>
                                        {/* Selected Count */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ 
                                                color: 'white', 
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                textAlign: 'center'
                                            }}>
                                                {roomsByFloor[floor].filter(room => selectedRooms.has(room._id)).length} ห้องที่เลือก
                                            </Text>
                                        </div>
                                        
                                        {/* Buttons */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            flexDirection: 'row',
                                            width: '100%',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Button
                                                size="small"
                                                onClick={() => selectFloorRooms(parseInt(floor))}
                                                style={{
                                                    background: 'rgba(255,255,255,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    flex: '1',
                                                    fontSize: '11px',
                                                    height: '32px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                เลือกทั้งชั้น
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => clearFloorSelection(parseInt(floor))}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    flex: '1',
                                                    fontSize: '11px',
                                                    height: '32px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                ล้าง
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rooms in this floor */}
                            <Row gutter={[20, 20]}>
                                {roomsByFloor[floor].map((room) => (
                                    <Col xs={12} sm={12} md={8} lg={6} key={room._id}>
                                        <Card
                                            size="small"
                                            className="room-card"
                                            title={
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '4px 0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            backgroundColor: activeTab === 'water' ? '#1890ff' : '#FFC107',
                                                            boxShadow: `0 0 8px ${activeTab === 'water' ? '#1890ff' : '#FFC107'}40`,
                                                            animation: 'pulse 2s infinite'
                                                        }} />
                                                        <span style={{
                                                            fontWeight: '600',
                                                            fontSize: '14px',
                                                            color: '#262626'
                                                        }}>
                                                            ห้อง {room.roomNumber}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        border: selectedRooms.has(room._id) ? '2px solid #1890ff' : '2px solid #d9d9d9',
                                                        backgroundColor: selectedRooms.has(room._id) ? '#1890ff' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {selectedRooms.has(room._id) && (
                                                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                            style={{
                                                marginBottom: 0,
                                                borderRadius: '16px',
                                                boxShadow: selectedRooms.has(room._id)
                                                    ? '0 8px 24px rgba(24, 144, 255, 0.3)'
                                                    : '0 4px 12px rgba(0,0,0,0.08)',
                                                border: selectedRooms.has(room._id)
                                                    ? '2px solid #1890ff'
                                                    : '1px solid #f0f0f0',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: selectedRooms.has(room._id)
                                                    ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                                                    : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                cursor: 'pointer'
                                            }}
                                            hoverable
                                            onClick={() => toggleRoomSelection(room._id)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)'
                                                e.currentTarget.style.boxShadow = selectedRooms.has(room._id)
                                                    ? '0 12px 32px rgba(24, 144, 255, 0.4)'
                                                    : '0 8px 24px rgba(0,0,0,0.12)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = selectedRooms.has(room._id)
                                                    ? '0 8px 24px rgba(24, 144, 255, 0.3)'
                                                    : '0 4px 12px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            {/* Decorative gradient overlay */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '3px',
                                                background: activeTab === 'water'
                                                    ? 'linear-gradient(90deg, #1890ff, #40a9ff)'
                                                    : 'linear-gradient(90deg, #FFC107, #ffd666)',
                                                borderRadius: '16px 16px 0 0'
                                            }} />

                                            <Space direction="vertical" style={{ width: '100%', marginTop: '8px' }}>
                                                <div style={{
                                                    background: activeTab === 'water'
                                                        ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                                                        : 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${activeTab === 'water' ? '#91d5ff' : '#ffd591'}`,
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Background pattern */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '-10px',
                                                        width: '40px',
                                                        height: '40px',
                                                        background: activeTab === 'water' ? '#1890ff' : '#FFC107',
                                                        borderRadius: '50%',
                                                        opacity: 0.1
                                                    }} />

                                                    <Text type="secondary" style={{
                                                        color: '#666',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        หน่วยปัจจุบัน
                                                    </Text>
                                                    <div style={{
                                                        fontSize: '24px',
                                                        fontWeight: 'bold',
                                                        color: '#000',
                                                        marginTop: '4px',
                                                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {room.unitMeter?.[activeTab] || 0}
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onMouseUp={(e) => e.stopPropagation()}
                                                >
                                                    <InputNumber
                                                        placeholder="หน่วยใหม่"
                                                        {...getNumericInputProps({ min: 0 })}
                                                        style={{
                                                            width: '100%',
                                                            borderRadius: '12px',
                                                            border: '2px solid #f0f0f0',
                                                            fontSize: '16px',
                                                            fontWeight: '500',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        value={unitValues[room._id]?.[activeTab]}
                                                        onChange={(value) => handleUnitChange(room._id, value)}
                                                        size="large"
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = activeTab === 'water' ? '#1890ff' : '#FFC107'
                                                            e.target.style.boxShadow = `0 0 0 2px ${activeTab === 'water' ? '#1890ff' : '#FFC107'}20`
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#f0f0f0'
                                                            e.target.style.boxShadow = 'none'
                                                        }}
                                                    />
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                </div>
            )
        }

        // Show rooms normally when filtering by specific floor
        return (
            <div style={{ padding: '24px 0' }}>
                <Row gutter={[20, 20]}>
                    {filteredRooms.map((room, index) => (
                        <Col xs={12} sm={12} md={8} lg={6} key={room._id}>
                            <Card
                                size="small"
                                className="room-card"
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '4px 0'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} >
                                            <div style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: activeTab === 'water' ? '#1890ff' : '#FFC107',
                                                boxShadow: `0 0 8px ${activeTab === 'water' ? '#1890ff' : '#FFC107'}40`,
                                                animation: 'pulse 2s infinite'
                                            }} />
                                            <span style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: '#262626'
                                            }}>
                                                {`ชั้น ${room.floor} ห้อง ${room.roomNumber}`}
                                            </span>
                                        </div>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            border: selectedRooms.has(room._id) ? '2px solid #1890ff' : '2px solid #d9d9d9',
                                            backgroundColor: selectedRooms.has(room._id) ? '#1890ff' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {selectedRooms.has(room._id) && (
                                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                                            )}
                                        </div>
                                    </div>
                                }
                                style={{
                                    marginBottom: 0,
                                    borderRadius: '16px',
                                    boxShadow: selectedRooms.has(room._id)
                                        ? '0 8px 24px rgba(24, 144, 255, 0.3)'
                                        : '0 4px 12px rgba(0,0,0,0.08)',
                                    border: selectedRooms.has(room._id)
                                        ? '2px solid #1890ff'
                                        : '1px solid #f0f0f0',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: selectedRooms.has(room._id)
                                        ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                                        : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                hoverable
                                onClick={() => toggleRoomSelection(room._id)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = selectedRooms.has(room._id)
                                        ? '0 12px 32px rgba(24, 144, 255, 0.4)'
                                        : '0 8px 24px rgba(0,0,0,0.12)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = selectedRooms.has(room._id)
                                        ? '0 8px 24px rgba(24, 144, 255, 0.3)'
                                        : '0 4px 12px rgba(0,0,0,0.08)'
                                }}
                            >
                                {/* Decorative gradient overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: activeTab === 'water'
                                        ? 'linear-gradient(90deg, #1890ff, #40a9ff)'
                                        : 'linear-gradient(90deg, #FFC107, #ffd666)',
                                    borderRadius: '16px 16px 0 0'
                                }} />

                                <Space direction="vertical" style={{ width: '100%', marginTop: '8px' }}>
                                    <div style={{
                                        background: activeTab === 'water'
                                            ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                                            : 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: `1px solid ${activeTab === 'water' ? '#91d5ff' : '#ffd591'}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Background pattern */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '-10px',
                                            width: '40px',
                                            height: '40px',
                                            background: activeTab === 'water' ? '#1890ff' : '#FFC107',
                                            borderRadius: '50%',
                                            opacity: 0.1
                                        }} />

                                        <Text type="secondary" style={{
                                            color: '#666',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            หน่วยปัจจุบัน
                                        </Text>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#000',
                                            marginTop: '4px',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}>
                                            {room.unitMeter?.[activeTab] || 0}
                                        </div>
                                    </div>

                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onMouseUp={(e) => e.stopPropagation()}
                                    >
                                        <InputNumber
                                            placeholder="หน่วยใหม่"
                                            type='number'
                                            style={{
                                                width: '100%',
                                                borderRadius: '12px',
                                                border: '2px solid #f0f0f0',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                            value={unitValues[room._id]?.[activeTab]}
                                            onChange={(value) => handleUnitChange(room._id, value)}
                                            min={0}
                                            size="large"
                                            onFocus={(e) => {
                                                e.target.style.borderColor = activeTab === 'water' ? '#1890ff' : '#FFC107'
                                                e.target.style.boxShadow = `0 0 0 2px ${activeTab === 'water' ? '#1890ff' : '#FFC107'}20`
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#f0f0f0'
                                                e.target.style.boxShadow = 'none'
                                            }}
                                        />
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="เปลี่ยนหน่วยมิเตอร์"
                subtitle={`ข้อมูลห้องพัก: ${rooms.length} ห้อง`}
                icon="⚡"
            />

            {/* Combined Filter and Bulk Update Section */}
         

            {/* Floor Statistics */}
            {/* {floorStats && floorStats.length > 0 && (
                <div style={{ 
                    marginTop: 24,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid #e1bee7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        marginBottom: '16px' 
                    }}>
                        <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: '#667eea' 
                        }} />
                        <Text style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#333',
                            margin: 0 
                        }}>
                            สถิติห้องพักตามชั้น
                        </Text>
                    </div>
                    <Row gutter={[16, 8]}>
                        {floorStats.map(({ floor, count }) => (
                            <Col key={floor} xs={12} sm={8} md={6} lg={4}>
                                <div style={{
                                    background: '#fff',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e0e0e0',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#666', 
                                        marginBottom: '4px' 
                                    }}>
                                        ชั้น {floor}
                                    </div>
                                    <div style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 'bold', 
                                        color: '#667eea' 
                                    }}>
                                        {count} ห้อง
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            )} */}

            {/* Segmented Control */}
            <div style={{
                marginTop: 24,
                display: 'flex',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    opacity: 0.05
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                    borderRadius: '50%',
                    opacity: 0.05
                }} />

                <Segmented
                    options={segmentedOptions}
                    value={activeTab}
                    onChange={setActiveTab}
                    size={window.innerWidth < 768 ? "default" : "large"}
                    style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '12px',
                        padding: window.innerWidth < 768 ? '4px' : '6px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #dee2e6',
                        width: window.innerWidth < 768 ? '100%' : 'auto',
                        fontSize: window.innerWidth < 768 ? '12px' : '14px'
                    }}
                />
                
            </div>
            <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '24px',
                borderRadius: '20px',
                margin: '24px 0',
                border: '1px solid #e9ecef',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    opacity: 0.05
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    right: '-30px',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                    borderRadius: '50%',
                    opacity: 0.05
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Search and Filter Row */}
                    <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        gap: '16px',
                        alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                        flexWrap: 'wrap',
                        marginBottom: '20px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#fff',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #e9ecef',
                            flex: window.innerWidth < 768 ? '1' : '0 0 auto'
                        }}>
                            <SearchOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                            <Input
                                placeholder="ค้นหาห้อง (เลขห้อง)"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    width: window.innerWidth < 768 ? '100%' : 220,
                                    border: 'none',
                                    boxShadow: 'none',
                                    background: 'transparent'
                                }}
                                allowClear
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#fff',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #e9ecef',
                            flex: window.innerWidth < 768 ? '1' : '0 0 auto'
                        }}>
                            <FilterOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                            <Select
                                placeholder="เลือกชั้น"
                                value={selectedFloor === null ? undefined : selectedFloor}
                                onChange={setSelectedFloor}
                                options={uniqueFloors}
                                style={{
                                    width: window.innerWidth < 768 ? '100%' : 160,
                                    border: 'none',
                                    boxShadow: 'none'
                                }}
                            />
                        </div>

                        <div style={{
                            marginLeft: window.innerWidth < 768 ? '0' : 'auto',
                            background: '#fff',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #e9ecef',
                            flex: '0 0 auto',
                            textAlign: window.innerWidth < 768 ? 'center' : 'left'
                        }}>
                            <Text type="secondary" style={{
                                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                                fontWeight: '500',
                                color: '#495057'
                            }}>
                                แสดง <span style={{ color: '#667eea', fontWeight: '600' }}>{filteredRooms.length}</span> จาก <span style={{ color: '#495057', fontWeight: '600' }}>{rooms.length}</span> ห้อง
                            </Text>
                        </div>
                    </div>

                    {/* Bulk Update Row */}
                    {filteredRooms.length > 0 && (
                        <div style={{
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid #f0c674',
                            boxShadow: '0 4px 12px rgba(240, 198, 116, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements for bulk section */}
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(45deg, #fdcb6e, #e17055)',
                                borderRadius: '50%',
                                opacity: 0.1
                            }} />

                            <div style={{
                                display: 'flex',
                                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                gap: '16px',
                                alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                                flexWrap: 'wrap',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {/* Select All and Count Row */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: window.innerWidth < 768 ? 'row' : 'row',
                                    gap: window.innerWidth < 768 ? '8px' : '12px',
                                    alignItems: 'center',
                                    flex: window.innerWidth < 768 ? '1' : '0 0 auto',
                                    width: '100%'
                                }}>
                                    {/* Select All Controls */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: window.innerWidth < 768 ? '8px' : '12px',
                                        background: '#fff',
                                        padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        border: '1px solid #e9ecef',
                                        flex: window.innerWidth < 768 ? '1' : '0 0 auto',
                                        minWidth: 0
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRooms.size === filteredRooms.length && filteredRooms.length > 0}
                                            onChange={selectedRooms.size === filteredRooms.length ? clearAllSelection : selectAllRooms}
                                            style={{ 
                                                transform: window.innerWidth < 768 ? 'scale(1.0)' : 'scale(1.2)',
                                                flexShrink: 0
                                            }}
                                        />
                                        <Text style={{ 
                                            fontWeight: '600', 
                                            color: '#495057',
                                            fontSize: window.innerWidth < 768 ? '12px' : '16px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            เลือกทั้งหมด
                                        </Text>
                                    </div>

                                    {/* Selected Count */}
                                    <div style={{
                                        background: '#fff',
                                        padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        border: '1px solid #e9ecef',
                                        flex: window.innerWidth < 768 ? '1' : '0 0 auto',
                                        textAlign: window.innerWidth < 768 ? 'center' : 'left',
                                        minWidth: 0
                                    }}>
                                        <Text style={{ 
                                            fontWeight: '600', 
                                            color: '#667eea',
                                            fontSize: window.innerWidth < 768 ? '12px' : '16px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {selectedRooms.size} ห้องที่เลือก
                                        </Text>
                                    </div>
                                </div>

                                {/* Bulk Unit Input */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                    alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                                    gap: '12px',
                                    background: '#fff',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    border: '1px solid #e9ecef',
                                    flex: '0 0 auto'
                                }}>
                                    <Text style={{ 
                                        fontWeight: '600', 
                                        color: '#495057',
                                        fontSize: window.innerWidth < 768 ? '14px' : '16px',
                                        textAlign: window.innerWidth < 768 ? 'center' : 'left'
                                    }}>
                                        หน่วยใหม่:
                                    </Text>
                                    <InputNumber
                                        placeholder="ใส่หน่วย"
                                        value={bulkUnitValue}
                                        onChange={setBulkUnitValue}
                                        {...getNumericInputProps({ min: 0 })}
                                        style={{
                                            width: window.innerWidth < 768 ? '100%' : 120,
                                            borderRadius: '8px'
                                        }}
                                    />
                                </div>

                                {/* Apply Button */}
                                <Button
                                    type="primary"
                                    onClick={applyBulkUnit}
                                    disabled={selectedRooms.size === 0 || !bulkUnitValue}
                                    style={{
                                        background: selectedRooms.size > 0 && bulkUnitValue
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : '#d9d9d9',
                                        border: 'none',
                                        borderRadius: '12px',
                                        height: window.innerWidth < 768 ? '44px' : '40px',
                                        padding: window.innerWidth < 768 ? '0 16px' : '0 20px',
                                        fontWeight: '600',
                                        fontSize: window.innerWidth < 768 ? '14px' : '16px',
                                        boxShadow: selectedRooms.size > 0 && bulkUnitValue
                                            ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                            : 'none',
                                        flex: '0 0 auto',
                                        width: window.innerWidth < 768 ? '100%' : 'auto',
                                        whiteSpace: window.innerWidth < 768 ? 'normal' : 'nowrap'
                                    }}
                                >
                                    {window.innerWidth < 768 ? 'อัปเดตหน่วย' : 'อัปเดตหน่วยให้ห้องที่เลือก'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {renderRoomCards()}


            <div style={{
                marginTop: 32,
                textAlign: 'center',
                background: '#fff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
            }}>
                <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        height: '52px',
                        padding: '0 40px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                >
                    บันทึกข้อมูล
                </Button>
            </div>
        </div>
    )
}

export default ListRoomChangeUnitForm