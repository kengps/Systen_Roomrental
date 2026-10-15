import React, { useState, useMemo, useEffect } from 'react'
import { Spin, Alert, Segmented, InputNumber, Button, Typography, message, Input, Select, ConfigProvider } from 'antd'
import Icon, { ThunderboltOutlined, SaveOutlined, SearchOutlined, FilterOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons'
import persistMiddleware from '../../../../service/zustand/middleware/persistMiddleware'
import { updateUnitMeter } from '../../../../service/api/rooms'
import { addNotify } from '../../../../utilities/notify'
import { getNumericInputProps } from '../../../../utilities/inputValidation'

const { Text } = Typography

/* ───────── Design tokens ───────── */
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
    primaryTint: '#F3F4FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    water: '#2563EB',
    waterSoft: '#E6EEFF',
    electric: '#B45309',
    electricSoft: '#FEF1DC',
    mutedOnInk: '#A5B0C6',
    iconOnInk: '#A5B4FC',
}

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif"

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
}

// ไอคอนหยดน้ำ (antd ไม่มีไอคอนน้ำในชุดมาตรฐาน) ใช้ตัวเดียวกับหน้า BillingForm
const WaterDropSvg = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" width="1em" height="1em" aria-hidden="true">
        <path d="M512 960C335.3 960 192 816.7 192 640c0-170.7 176.7-347.3 320-515.7C655.3 292.7 832 469.3 832 640c0 176.7-143.3 320-320 320zM512 213.3c-106.7 124.3-234.7 262.2-234.7 426.7 0 129.4 105.3 234.7 234.7 234.7s234.7-105.3 234.7-234.7C746.7 475.5 618.7 337.6 512 213.3z" />
    </svg>
)
const WaterDropIcon = (props) => <Icon component={WaterDropSvg} {...props} />

const KIND = {
    water: { fg: C.water, soft: C.waterSoft, label: 'ค่าน้ำ', Icon: WaterDropIcon },
    electric: { fg: C.electric, soft: C.electricSoft, label: 'ค่าไฟ', Icon: ThunderboltOutlined },
}

const css = `
.lu-root { font-family: ${FONT}; color: ${C.ink}; }

/* PageHeader */
.lu-banner {
  background: ${C.ink}; border-radius: 20px; padding: 24px 28px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.lu-banner-icon {
  width: 52px; height: 52px; border-radius: 14px; flex: none;
  background: ${C.raised}; color: ${C.iconOnInk}; font-size: 24px;
  display: flex; align-items: center; justify-content: center;
}
.lu-banner h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.25; }
.lu-banner p { margin: 4px 0 0; font-size: 14px; color: ${C.mutedOnInk}; }

/* Section */
.lu-section {
  background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px;
  padding: 24px; margin-top: 24px;
}
.lu-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.lu-row + .lu-row { margin-top: 16px; padding-top: 16px; border-top: 1px solid ${C.line}; }
.lu-grow { flex: 1 1 220px; min-width: 0; }
.lu-count { margin-left: auto; font-size: 14px; color: ${C.muted}; }
.lu-count b { color: ${C.primarySoftText}; font-weight: 700; }

.lu-seg .ant-segmented { padding: 4px; background: ${C.sunken}; border: 1px solid ${C.line}; }
.lu-seg .ant-segmented-item-label { display: flex; align-items: center; gap: 8px; min-height: 36px; line-height: 36px; font-weight: 600; }

/* Bulk bar */
.lu-bulk {
  background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px;
  padding: 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
}
.lu-pill {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px;
  padding: 0 14px; border-radius: 12px; background: ${C.card}; border: 1px solid ${C.line};
  font-size: 15px; font-weight: 600; color: ${C.ink};
}
.lu-pill--soft { background: ${C.primarySoft}; border-color: ${C.primarySoftLine}; color: ${C.primarySoftText}; }
.lu-pill input[type="checkbox"] { width: 18px; height: 18px; accent-color: ${C.primary}; cursor: pointer; margin: 0; }
.lu-pill label { cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
.lu-pill:focus-within { outline: 3px solid ${C.primarySoftLine}; outline-offset: 2px; }

/* Buttons */
.lu-btn2 {
  height: 36px; padding: 0 14px; border-radius: 12px; cursor: pointer; white-space: nowrap;
  font-family: ${FONT}; font-size: 13px; font-weight: 600;
  background: ${C.primarySoft}; border: 1px solid ${C.primarySoftLine}; color: ${C.primarySoftText};
  transition: background-color .15s ease;
}
.lu-btn2:hover { background: #E2E6FF; }
.lu-btn2:focus-visible, .lu-room-head:focus-visible { outline: 3px solid ${C.primarySoftLine}; outline-offset: 2px; }
.lu-primary.ant-btn { font-weight: 600; color: #fff; }

/* Floor accordion (เหมือน ListRoom) */
.lu-floors { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.lu-expandbar { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
.lu-expandbar + .lu-floors { margin-top: 12px; }
.lu-flat { margin-top: 24px; }
.lu-floor { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; overflow: hidden; }
.lu-floor-toggle {
  width: 100%; box-sizing: border-box; min-height: 72px; padding: 16px 24px; border: none;
  background: ${C.card}; display: flex; align-items: center; gap: 16px; text-align: left;
  cursor: pointer; font-family: ${FONT}; color: ${C.ink}; transition: background-color .15s ease;
}
.lu-floor-toggle:hover { background: ${C.sunken}; }
.lu-floor-toggle:focus-visible { outline: 3px solid ${C.primarySoftLine}; outline-offset: -3px; }
.lu-floor-badge {
  width: 40px; height: 40px; border-radius: 12px; flex: none; font-size: 18px; font-weight: 700;
  background: ${C.primarySoft}; color: ${C.primaryDeep};
  display: flex; align-items: center; justify-content: center;
}
.lu-floor-info { flex: 1; min-width: 0; }
.lu-floor-title { display: block; font-size: 17px; font-weight: 700; color: ${C.ink}; }
.lu-floor-meta { display: block; font-size: 14px; color: ${C.muted}; }
.lu-tag { padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; }
.lu-tag--sel { background: ${C.primary}; color: #fff; }
.lu-tag--fill { background: ${C.primarySoft}; color: ${C.primarySoftText}; }
.lu-chev { flex: none; color: #64748B; transition: transform .2s ease; }
.lu-chev--open { transform: rotate(180deg); }
.lu-floor-body { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 16px; }
.lu-floor-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Room cards (เหมือน RoomCard ใน ListRoom) */
.lu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; }
.lu-room {
  box-sizing: border-box; background: ${C.card}; border: 1.5px solid ${C.line}; border-radius: 16px; padding: 16px;
  cursor: pointer; display: flex; flex-direction: column; gap: 14px;
  transition: border-color .15s ease, background-color .15s ease;
}
.lu-room:hover { border-color: ${C.primary}; }
.lu-room--sel { border-color: ${C.primary}; background: ${C.primaryTint}; }
.lu-room-head {
  display: flex; flex-direction: column; gap: 14px; width: 100%;
  background: transparent; border: none; padding: 0; cursor: pointer; text-align: left;
  font-family: ${FONT}; color: ${C.ink};
}
.lu-room-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lu-icon {
  width: 36px; height: 36px; border-radius: 10px; flex: none; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.lu-check {
  width: 22px; height: 22px; border-radius: 7px; flex: none; box-sizing: border-box; font-size: 12px;
  border: 1.5px solid #C3C9D8; background: ${C.card}; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.lu-room--sel .lu-check { background: ${C.primary}; border-color: ${C.primary}; }
.lu-room-floor { display: block; margin-bottom: 2px; font-size: 12px; font-weight: 500; color: #64748B; }
.lu-room-no { display: block; font-size: 17px; font-weight: 700; line-height: 1.2; }
.lu-reading { display: block; border-radius: 12px; padding: 10px 12px; }
.lu-reading small { display: block; font-size: 12px; font-weight: 500; color: #475569; }
.lu-reading strong { display: block; margin-top: 2px; font-size: 24px; font-weight: 700; line-height: 1.2; }

.lu-empty {
  text-align: center; padding: 56px 16px; margin-top: 24px; border-radius: 20px;
  background: ${C.sunken}; border: 1px dashed ${C.primarySoftLine}; color: ${C.muted};
}
.lu-empty .anticon { font-size: 32px; color: ${C.primarySoftText}; margin-bottom: 12px; display: block; }

.lu-save { margin-top: 24px; display: flex; justify-content: center; }

@media (max-width: 767px) {
  .lu-banner { padding: 18px; }
  .lu-banner h1 { font-size: 22px; }
  .lu-section { padding: 16px; }
  .lu-seg .ant-segmented { width: 100%; }
  .lu-count { margin-left: 0; width: 100%; text-align: center; }
  .lu-bulk > * { flex: 1 1 100%; }
  .lu-bulk .ant-input-number { width: 100% !important; }
  .lu-floor-toggle { padding: 14px 16px; gap: 12px; flex-wrap: wrap; }
  .lu-floor-info { flex: 1 1 120px; }
  .lu-floor-body { padding: 0 16px 16px; }
  .lu-floor-tools .lu-btn2 { flex: 1; }
  .lu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .lu-save .ant-btn { width: 100%; }
}
`

/* ───────── ชิ้นส่วนที่ใช้ซ้ำ ───────── */
const PageHeader = ({ title, subtitle }) => (
    <div className="lu-banner">
        <div className="lu-banner-icon" aria-hidden="true"><ThunderboltOutlined /></div>
        <div style={{ minWidth: 0 }}>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    </div>
)

const RoomCard = ({ room, showFloor, kind, selected, value, onToggle, onChange }) => {
    const k = KIND[kind]
    const KindIcon = k.Icon
    return (
        <div
            className={`lu-room${selected ? ' lu-room--sel' : ''}`}
            onClick={onToggle}
        >
            {/* ปุ่มนี้ไม่มี onClick ของตัวเอง: คลิก/Enter/Space จะลอยขึ้นไปที่การ์ดแล้ว toggle ครั้งเดียว */}
            <button
                type="button"
                className="lu-room-head"
                aria-pressed={selected}
                aria-label={`${showFloor ? `ชั้น ${room.floor} ` : ''}ห้อง ${room.roomNumber} หน่วยปัจจุบัน ${room.unitMeter?.[kind] || 0}`}
            >
                <span className="lu-room-top">
                    <span
                        className="lu-icon"
                        style={{
                            background: selected ? '#E0E4FF' : k.soft,
                            color: selected ? C.primaryDeep : k.fg,
                        }}
                        aria-hidden="true"
                    >
                        <KindIcon />
                    </span>
                    <span className="lu-check" aria-hidden="true">{selected && <CheckOutlined />}</span>
                </span>

                <span>
                    {showFloor && <span className="lu-room-floor">ชั้น {room.floor}</span>}
                    <span className="lu-room-no">ห้อง {room.roomNumber}</span>
                </span>

                {/* หน่วยมิเตอร์: แยกเป็นกล่องสีตามประเภท ไม่ให้สับสนกับเลขห้อง */}
                <span className="lu-reading" style={{ background: k.soft }}>
                    <small>หน่วยปัจจุบัน</small>
                    <strong style={{ color: k.fg }}>{room.unitMeter?.[kind] || 0}</strong>
                </span>
            </button>

            <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
            >
                <InputNumber
                    placeholder="หน่วยใหม่"
                    {...getNumericInputProps({ min: 0 })}
                    style={{ width: '100%' }}
                    value={value}
                    onChange={onChange}
                    aria-label={`หน่วยใหม่ ห้อง ${room.roomNumber}`}
                />
            </div>
        </div>
    )
}

const ListRoomChangeUnitForm = ({ data, isLoading, isError, refetch }) => {
    const [activeTab, setActiveTab] = useState('water')
    const [unitValues, setUnitValues] = useState({})
    const [searchText, setSearchText] = useState('')
    const [selectedFloor, setSelectedFloor] = useState(null)
    const [selectedRooms, setSelectedRooms] = useState(new Set())
    const [bulkUnitValue, setBulkUnitValue] = useState('')
    // เก็บเฉพาะชั้นที่ผู้ใช้กดเปิด/ปิดเอง (ชั้นที่ไม่มีใน object ใช้ค่าเริ่มต้นตามจำนวนชั้น)
    const [floorOpen, setFloorOpen] = useState({})


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
                    <WaterDropIcon style={{ color: C.water }} /> ค่าน้ำ
                </span>
            )
        },
        {
            value: 'electric',
            label: (
                <span>
                    <ThunderboltOutlined style={{ color: C.electric }} /> ค่าไฟ
                </span>
            )
        }
    ]

    const renderCard = (room, showFloor) => (
        <RoomCard
            key={room._id}
            room={room}
            showFloor={showFloor}
            kind={activeTab}
            selected={selectedRooms.has(room._id)}
            value={unitValues[room._id]?.[activeTab]}
            onToggle={() => toggleRoomSelection(room._id)}
            onChange={(value) => handleUnitChange(room._id, value)}
        />
    )

    const renderRoomCards = () => {
        if (filteredRooms.length === 0) {
            return (
                <div className="lu-empty">
                    <SearchOutlined aria-hidden="true" />
                    <Text type="secondary" style={{ fontSize: 16 }}>
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

            // ชั้นเยอะ (> 3) → เริ่มต้นเปิดเฉพาะชั้นแรก, ชั้นน้อย → เปิดทั้งหมด
            // ระหว่างค้นหา เปิดทุกชั้นที่เจอผลลัพธ์เสมอ
            const manyFloors = sortedFloors.length > 3
            const searching = searchText.trim() !== ''
            const isFloorOpen = (floor) => {
                if (searching) return true
                if (floorOpen[floor] !== undefined) return floorOpen[floor]
                return !manyFloors || floor === sortedFloors[0]
            }
            const toggleFloor = (floor) => {
                if (searching) return
                const next = !isFloorOpen(floor)
                setFloorOpen(prev => ({ ...prev, [floor]: next }))
            }
            const setAllFloors = (open) => {
                const next = {}
                sortedFloors.forEach(f => { next[f] = open })
                setFloorOpen(next)
            }
            const hasValue = (v) => v !== undefined && v !== null && v !== ''

            return (
                <>
                    {manyFloors && !searching && (
                        <div className="lu-expandbar">
                            <button type="button" className="lu-btn2" onClick={() => setAllFloors(true)}>
                                ขยายทั้งหมด
                            </button>
                            <button type="button" className="lu-btn2" onClick={() => setAllFloors(false)}>
                                ยุบทั้งหมด
                            </button>
                        </div>
                    )}

                    <div className="lu-floors">
                        {sortedFloors.map(floor => {
                            const list = roomsByFloor[floor]
                            const selCount = list.filter(room => selectedRooms.has(room._id)).length
                            const fillCount = list.filter(room => hasValue(unitValues[room._id]?.[activeTab])).length
                            const open = isFloorOpen(floor)

                            return (
                                <section key={floor} className="lu-floor">
                                    {/* Floor Header */}
                                    <button
                                        type="button"
                                        className="lu-floor-toggle"
                                        aria-expanded={open}
                                        onClick={() => toggleFloor(floor)}
                                    >
                                        <span className="lu-floor-badge" aria-hidden="true">{floor}</span>
                                        <span className="lu-floor-info">
                                            <span className="lu-floor-title">ชั้นที่ {floor}</span>
                                            <span className="lu-floor-meta">{list.length} ห้อง</span>
                                        </span>
                                        {fillCount > 0 && <span className="lu-tag lu-tag--fill">กรอกแล้ว {fillCount}</span>}
                                        {selCount > 0 && <span className="lu-tag lu-tag--sel">เลือก {selCount}</span>}
                                        <DownOutlined className={`lu-chev${open ? ' lu-chev--open' : ''}`} aria-hidden="true" />
                                    </button>

                                    {open && (
                                        <div className="lu-floor-body">
                                            <div className="lu-floor-tools">
                                                <button
                                                    type="button"
                                                    className="lu-btn2"
                                                    onClick={() => selectFloorRooms(parseInt(floor))}
                                                >
                                                    เลือกทั้งชั้น
                                                </button>
                                                <button
                                                    type="button"
                                                    className="lu-btn2"
                                                    onClick={() => clearFloorSelection(parseInt(floor))}
                                                >
                                                    ล้างการเลือก
                                                </button>
                                            </div>

                                            {/* Rooms in this floor */}
                                            <div className="lu-grid">
                                                {list.map((room) => renderCard(room, false))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                    </div>
                </>
            )
        }

        // Show rooms normally when filtering by specific floor
        return (
            <div className="lu-flat">
                <div className="lu-grid">
                    {filteredRooms.map((room) => renderCard(room, true))}
                </div>
            </div>
        )
    }

    const allSelected = selectedRooms.size === filteredRooms.length && filteredRooms.length > 0

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="lu-root">
                <PageHeader
                    title="เปลี่ยนหน่วยมิเตอร์"
                    subtitle={`ข้อมูลห้องพัก: ${rooms.length} ห้อง`}
                />

                {/* Toolbar */}
                <div className="lu-section">
                    <div className="lu-row lu-seg">
                        <Segmented
                            options={segmentedOptions}
                            value={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>

                    {/* Search and Filter Row */}
                    <div className="lu-row">
                        <div className="lu-grow">
                            <Input
                                prefix={<SearchOutlined style={{ color: C.muted }} />}
                                placeholder="ค้นหาห้อง (เลขห้อง)"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                aria-label="ค้นหาห้อง"
                            />
                        </div>

                        <div className="lu-grow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FilterOutlined style={{ color: C.muted }} aria-hidden="true" />
                            <Select
                                placeholder="เลือกชั้น"
                                value={selectedFloor === null ? undefined : selectedFloor}
                                onChange={setSelectedFloor}
                                options={uniqueFloors}
                                style={{ width: '100%' }}
                                aria-label="เลือกชั้น"
                            />
                        </div>

                        <div className="lu-count">
                            แสดง <b>{filteredRooms.length}</b> จาก <b>{rooms.length}</b> ห้อง
                        </div>
                    </div>

                    {/* Bulk Update Row */}
                    {filteredRooms.length > 0 && (
                        <div className="lu-row">
                            <div className="lu-bulk" style={{ width: '100%' }}>
                                <div className="lu-pill">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={selectedRooms.size === filteredRooms.length ? clearAllSelection : selectAllRooms}
                                        />
                                        เลือกทั้งหมด
                                    </label>
                                </div>

                                <div className="lu-pill lu-pill--soft">
                                    {selectedRooms.size} ห้องที่เลือก
                                </div>

                                <div className="lu-pill">
                                    <span>หน่วยใหม่:</span>
                                    <InputNumber
                                        placeholder="ใส่หน่วย"
                                        value={bulkUnitValue}
                                        onChange={setBulkUnitValue}
                                        {...getNumericInputProps({ min: 0 })}
                                        style={{ width: 130 }}
                                        aria-label="หน่วยใหม่สำหรับห้องที่เลือก"
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    className="lu-primary"
                                    onClick={applyBulkUnit}
                                    disabled={selectedRooms.size === 0 || !bulkUnitValue}
                                >
                                    อัปเดตหน่วยให้ห้องที่เลือก
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {renderRoomCards()}

                <div className="lu-save">
                    <Button
                        type="primary"
                        className="lu-primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        style={{ height: 48, padding: '0 40px', fontSize: 16 }}
                    >
                        บันทึกข้อมูล
                    </Button>
                </div>
            </div>
        </ConfigProvider>
    )
}

export default ListRoomChangeUnitForm