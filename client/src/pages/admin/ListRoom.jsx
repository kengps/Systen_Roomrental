import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Button, Checkbox, ConfigProvider, Empty, Flex, Input, message, Segmented, Spin} from 'antd';
import {CheckOutlined, DownOutlined, HomeOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {useMemo, useState} from 'react';
import {updatePrice} from '../../service/api/rooms';
import {useListRoom} from '../../hooks/useListRoom';
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware.js';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
    ink: '#0F172A',
    text: '#0F172A',
    muted: '#5B6478',
    line: '#E6E8F0',
    page: '#F4F5F9',
    card: '#FFFFFF',
    primary: '#4F46E5',
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    primaryTint: '#F3F4FF',
    freeBg: '#DCFCE7',
    freeFg: '#166534',
    busyBg: '#FFE4E9',
    busyFg: '#9F1239',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: {
        colorPrimary: C.primary,
        borderRadius: 12,
        fontFamily: FONT,
        controlHeight: 44,
    },
};

// CSS ที่ inline style ทำไม่ได้ (hover / focus / responsive)
const css = `
.lr-room { transition: border-color .15s ease, background .15s ease; }
.lr-room:hover { border-color: ${C.primary} !important; }
.lr-room:focus-visible, .lr-floor-head:focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
.lr-chevron { transition: transform .2s ease; }
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
// NOTE: ปรับ field ให้ตรงกับ API จริงของคุณได้ที่นี่ที่เดียว
const isRoomAvailable = (room) =>
    room.isAvailable ??
    room.available ??
    (room.status
        ? ['available', 'vacant', 'ว่าง'].includes(String(room.status).toLowerCase())
        : true);

const formatPrice = (price) =>
    price === undefined || price === null || price === ''
        ? '-'
        : `฿${Number(price).toLocaleString('th-TH')}`;

/* ------------------------------------------------------------------ */
/* RoomCard (แทนที่ ./components/rooms/RoomCard เดิมได้เลย)            */
/* ------------------------------------------------------------------ */
const RoomCard = ({room, isSelected, onSelect}) => {
    const free = isRoomAvailable(room);

    return (
        <button
            type="button"
            className="lr-room"
            aria-pressed={isSelected}
            aria-label={`ห้อง ${room.roomNumber} ${free ? 'ว่าง' : 'ไม่ว่าง'}`}
            onClick={onSelect}
            style={{
                boxSizing: 'border-box',
                padding: 16,
                borderRadius: 16,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                cursor: 'pointer',
                fontFamily: FONT,
                color: C.text,
                border: `1.5px solid ${isSelected ? C.primary : C.line}`,
                background: isSelected ? C.primaryTint : C.card,
            }}
        >
            <Flex justify="space-between" align="center">
                <span
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? '#E0E4FF' : '#F1F3F9',
                        color: isSelected ? C.primaryDeep : '#475569',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/>
                        <path d="M3 21h18"/>
                        <path d="M14.5 12h.01"/>
                    </svg>
                </span>
                <span
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: 7,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${isSelected ? C.primary : '#C3C9D8'}`,
                        background: isSelected ? C.primary : '#fff',
                        color: '#fff',
                        fontSize: 12,
                    }}
                >
                    {isSelected && <CheckOutlined/>}
                </span>
            </Flex>

            <div>
                {/*<div style={{fontSize: 22, fontWeight: 700, lineHeight: 1.1}}>{room.roomNumber}</div>*/}
                <div style={{fontSize: 17, fontWeight: 700, lineHeight: 1.2}}>ห้อง {room.roomNumber}</div>
                <div style={{fontSize: 15, fontWeight: 500, color: '#475569', marginTop: 2}}>
                    {formatPrice(room.price)}
                    <span style={{fontSize: 12, color: '#64748B'}}> / เดือน</span>
                </div>
            </div>

            <span
                style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: free ? C.freeBg : C.busyBg,
                    color: free ? C.freeFg : C.busyFg,
                }}
            >
                <span style={{width: 6, height: 6, borderRadius: 3, background: 'currentColor'}}/>
                {free ? 'ว่าง' : 'ไม่ว่าง'}
            </span>
        </button>
    );
};

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */
const PageHeader = ({icon, title, subtitle, action}) => (
    <header
        style={{
            background: C.ink,
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
        }}
    >
        <div style={{display: 'flex', alignItems: 'center', gap: 16, minWidth: 0}}>
            <span
                aria-hidden="true"
                style={{
                    flex: '0 0 auto', width: 52, height: 52, borderRadius: 16, background: '#1E2A4A',
                    color: '#A5B4FC', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                {icon}
            </span>
            <div style={{minWidth: 0}}>
                <h1 style={{margin: 0, fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: '#FFFFFF'}}>{title}</h1>
                <p style={{margin: '4px 0 0', fontSize: 14, color: '#A5B0C6'}}>{subtitle}</p>
            </div>
        </div>
        {action}
    </header>
);

const StatCard = ({label, value, color = C.text}) => (
    <div style={{background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20}}>
        <div style={{fontSize: 14, color: C.muted}}>{label}</div>
        <div style={{fontSize: 32, fontWeight: 700, lineHeight: 1, marginTop: 8, color}}>{value}</div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const ListRoom = () => {
    const queryClient = useQueryClient();
    const {user} = persistMiddleware();
    const profileId = user?.userPayLoad?.user?.id;

    const [selectedRooms, setSelectedRooms] = useState({});
    const [globalPriceInput, setGlobalPriceInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all | free | busy
    const [query, setQuery] = useState('');
    const [closedFloors, setClosedFloors] = useState({}); // ค่าเริ่มต้น: เปิดทุกชั้น

    const {data, isLoading, isError} = useListRoom();

    const updatePriceMutation = useMutation({
        mutationFn: updatePrice,
        onSuccess: (res) => {
            message.success(res.message || 'อัปเดตราคาสำเร็จ!');
            setSelectedRooms({});
            setGlobalPriceInput('');
            queryClient.invalidateQueries(['listRoom', profileId]);
        },
        onError: (error) => {
            message.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตราคา');
        },
    });

    const allRooms = data?.result || [];

    /* ---- stats ---- */
    const stats = useMemo(() => {
        const total = allRooms.length;
        const free = allRooms.filter(isRoomAvailable).length;
        const busy = total - free;
        return {total, free, busy, occupancy: total ? Math.round((busy / total) * 100) : 0};
    }, [allRooms]);

    /* ---- filter + group by floor ---- */
    const visibleRooms = useMemo(() => {
        const q = query.trim();
        return allRooms.filter((room) => {
            const free = isRoomAvailable(room);
            const byStatus = statusFilter === 'all' || (statusFilter === 'free' ? free : !free);
            const byQuery = !q || String(room.roomNumber).includes(q);
            return byStatus && byQuery;
        });
    }, [allRooms, statusFilter, query]);

    const floors = useMemo(() => {
        const grouped = visibleRooms.reduce((acc, cur) => {
            (acc[cur.floor] = acc[cur.floor] || []).push(cur);
            return acc;
        }, {});
        return Object.keys(grouped)
            .sort((a, b) => Number(a) - Number(b))
            .map((floor) => ({
                floor,
                rooms: [...grouped[floor]].sort((a, b) =>
                    String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, {numeric: true})),
            }));
    }, [visibleRooms]);

    /* ---- selection ---- */
    const totalSelectedCount = Object.values(selectedRooms).filter(Boolean).length;
    const visibleSelectedCount = visibleRooms.filter((r) => selectedRooms[r._id]).length;
    const isAllSelected = visibleRooms.length > 0 && visibleSelectedCount === visibleRooms.length;
    const isIndeterminate = visibleSelectedCount > 0 && !isAllSelected;

    const handleSelectAllRooms = (e) => {
        const next = {...selectedRooms};
        visibleRooms.forEach((room) => {
            next[room._id] = e.target.checked;
        });
        setSelectedRooms(next);
    };

    const handleToggleRoom = (roomId) =>
        setSelectedRooms((prev) => ({...prev, [roomId]: !prev[roomId]}));

    const handleSelectAllInFloor = (rooms, select = true) => {
        const next = {...selectedRooms};
        rooms.forEach((room) => {
            next[room._id] = select;
        });
        setSelectedRooms(next);
    };

    const handleSubmitAllSelected = () => {
        const selectedRoomIds = Object.keys(selectedRooms).filter((id) => selectedRooms[id]);

        if (!globalPriceInput || Number(globalPriceInput) <= 0) {
            message.warning('กรุณาระบุราคาที่ถูกต้อง');
            return;
        }

        updatePriceMutation.mutate({
            roomNumber: selectedRoomIds,
            price: Number(globalPriceInput),
            accountId: profileId,
        });
    };

    const toggleFloor = (floor) =>
        setClosedFloors((prev) => ({...prev, [floor]: !prev[floor]}));

    /* ---- states ---- */
    if (isLoading) {
        return <Flex justify="center" align="center" style={{minHeight: '50vh'}}><Spin size="large"/></Flex>;
    }

    if (isError || !data?.result) {
        return <Empty description="ไม่สามารถโหลดข้อมูลห้องได้" style={{marginTop: 50}}/>;
    }

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>

            <div style={{fontFamily: FONT, color: C.text, display: 'flex', flexDirection: 'column', gap: 24, padding: 'clamp(12px, 3vw, 32px)'}}>

                {/* Heading */}
                <PageHeader
                    icon={<HomeOutlined/>}
                    title="จัดการห้องพัก"
                    subtitle="จัดการราคาและข้อมูลห้องพักทั้งหมด"
                    action={
                        <Button type="primary" icon={<PlusOutlined/>} style={{fontWeight: 600}}>
                            เพิ่มห้อง
                        </Button>
                    }
                />

                {/* Stats */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16}}>
                    <StatCard label="ห้องทั้งหมด" value={stats.total}/>
                    <StatCard label="ห้องว่าง" value={stats.free} color="#15803D"/>
                    <StatCard label="ไม่ว่าง" value={stats.busy} color="#BE123C"/>
                    <StatCard label="อัตราเข้าพัก" value={`${stats.occupancy}%`} color={C.primary}/>
                </div>

                {/* Toolbar */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                    <Flex align="center" wrap="wrap" gap={12}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined style={{color: '#64748B'}}/>}
                            placeholder="ค้นหาเลขห้อง"
                            aria-label="ค้นหาเลขห้อง"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{width: 260}}
                        />
                        <Segmented
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                {label: 'ทั้งหมด', value: 'all'},
                                {label: 'ว่าง', value: 'free'},
                                {label: 'ไม่ว่าง', value: 'busy'},
                            ]}
                            style={{padding: 4}}
                        />
                    </Flex>

                    <label
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px',
                            background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer',
                        }}
                    >
                        <Checkbox
                            indeterminate={isIndeterminate}
                            checked={isAllSelected}
                            onChange={handleSelectAllRooms}
                        />
                        <span style={{fontSize: 15, fontWeight: 600}}>เลือกทั้งหมด</span>
                    </label>
                </Flex>

                {/* Floors */}
                <div style={{background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, overflow: 'hidden'}}>
                    {floors.length === 0 && (
                        <Empty description="ไม่พบห้องที่ตรงกับเงื่อนไข" style={{padding: '48px 0'}}/>
                    )}

                    {floors.map(({floor, rooms}, index) => {
                        const isOpen = !closedFloors[floor];
                        const selectedInFloor = rooms.filter((r) => selectedRooms[r._id]).length;
                        const freeInFloor = rooms.filter(isRoomAvailable).length;

                        return (
                            <section key={floor} style={{borderTop: index === 0 ? 'none' : `1px solid ${C.line}`}}>
                                <button
                                    type="button"
                                    className="lr-floor-head"
                                    aria-expanded={isOpen}
                                    onClick={() => toggleFloor(floor)}
                                    style={{
                                        width: '100%', minHeight: 72, padding: '16px 24px', border: 'none',
                                        background: C.card, display: 'flex', alignItems: 'center', gap: 16,
                                        textAlign: 'left', cursor: 'pointer', fontFamily: FONT, color: C.text,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 40, height: 40, borderRadius: 12, background: C.primarySoft,
                                            color: C.primaryDeep, fontSize: 18, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {floor}
                                    </span>
                                    <span style={{flex: 1}}>
                                        <span style={{display: 'block', fontSize: 17, fontWeight: 700}}>ชั้นที่ {floor}</span>
                                        <span style={{display: 'block', fontSize: 14, color: C.muted}}>
                                            {rooms.length} ห้อง · ว่าง {freeInFloor} ห้อง
                                        </span>
                                    </span>
                                    {selectedInFloor > 0 && (
                                        <span
                                            style={{
                                                padding: '4px 12px', borderRadius: 999, background: C.primary,
                                                color: '#fff', fontSize: 13, fontWeight: 600,
                                            }}
                                        >
                                            เลือก {selectedInFloor}
                                        </span>
                                    )}
                                    <DownOutlined
                                        className="lr-chevron"
                                        style={{color: '#64748B', transform: isOpen ? 'rotate(180deg)' : 'none'}}
                                    />
                                </button>

                                {isOpen && (
                                    <div style={{padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16}}>
                                        <Flex gap={8} wrap="wrap">
                                            <Button
                                                onClick={() => handleSelectAllInFloor(rooms, true)}
                                                style={{
                                                    height: 36, fontWeight: 600, borderRadius: 10,
                                                    background: C.primarySoft, borderColor: '#C7CCF5', color: '#3730A3',
                                                }}
                                            >
                                                เลือกทั้งชั้น
                                            </Button>
                                            <Button
                                                onClick={() => handleSelectAllInFloor(rooms, false)}
                                                style={{height: 36, fontWeight: 600, borderRadius: 10, color: '#475569'}}
                                            >
                                                ล้างการเลือก
                                            </Button>
                                        </Flex>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                                                gap: 12,
                                            }}
                                        >
                                            {rooms.map((room) => (
                                                <RoomCard
                                                    key={room._id}
                                                    room={room}
                                                    isSelected={!!selectedRooms[room._id]}
                                                    onSelect={() => handleToggleRoom(room._id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>

                {/* Bulk action bar */}
                {totalSelectedCount > 0 && (
                    <div
                        style={{
                            position: 'sticky', bottom: 24, alignSelf: 'center', maxWidth: '100%',
                            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
                            padding: '12px 12px 12px 24px', borderRadius: 18, background: C.ink,
                            boxShadow: '0 12px 32px rgba(15,23,42,0.28)',
                        }}
                    >
                        <span style={{fontSize: 15, fontWeight: 600, color: '#fff'}}>
                            เลือกแล้ว {totalSelectedCount} ห้อง
                        </span>
                        <Input
                            type="number"
                            min={0}
                            prefix="฿"
                            placeholder="กำหนดราคารวม"
                            aria-label="กำหนดราคารวม"
                            value={globalPriceInput}
                            onChange={(e) => setGlobalPriceInput(e.target.value)}
                            style={{width: 180}}
                        />
                        <Button
                            onClick={() => setSelectedRooms({})}
                            ghost
                            style={{color: '#E2E8F0', borderColor: '#33415E', fontWeight: 600}}
                        >
                            ล้างการเลือก
                        </Button>
                        <Button
                            type="primary"
                            loading={updatePriceMutation.isPending}
                            onClick={handleSubmitAllSelected}
                            style={{fontWeight: 600}}
                        >
                            อัปเดตราคาห้องที่เลือก
                        </Button>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default ListRoom;