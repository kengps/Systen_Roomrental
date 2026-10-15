import React from 'react';
import { Controller } from 'react-hook-form';
import { ConfigProvider, Input, Button, Form } from 'antd';
import {
    ApartmentOutlined,
    NumberOutlined,
    AppstoreAddOutlined,
    DeleteOutlined,
    SaveOutlined,
    InfoCircleOutlined,
    BuildOutlined,
    DownOutlined,
    EyeOutlined,
} from '@ant-design/icons';

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
    dangerFg: '#9F1239',
    dangerNum: '#BE123C',
    dangerBg: '#FFE4E9',
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
    onDarkBadge: '#C7D2FE',
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

const css = `
.cr-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px;
    width: 100%;
    box-sizing: border-box;
    font-family: ${FONT};
    color: ${C.ink};
    background: ${C.page};
}
.cr-stack { display: flex; flex-direction: column; gap: 20px; }

.cr-banner {
    background: ${C.ink};
    border-radius: 20px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}
.cr-banner-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: ${C.raised}; color: ${C.onDarkIcon};
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
}
.cr-banner-text { flex: 1 1 220px; min-width: 0; }
.cr-banner h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; }
.cr-banner p { margin: 4px 0 0; font-size: 14px; color: ${C.onDarkMuted}; }
.cr-pill-dark {
    background: ${C.raised}; color: ${C.onDarkBadge};
    border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600;
    white-space: nowrap;
}

.cr-section {
    background: ${C.card};
    border: 1px solid ${C.line};
    border-radius: 20px;
    padding: 24px;
}
.cr-section-title {
    display: flex; align-items: center; gap: 12px;
    margin: 0 0 20px; font-size: 16px; font-weight: 700; color: ${C.ink};
}
.cr-section-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 16px;
}

.cr-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0 16px;
}
.cr-fields .ant-form-item { margin-bottom: 16px; }
.cr-fields .ant-form-item-label > label { color: ${C.muted}; font-size: 14px; }
.cr-actions { display: flex; justify-content: flex-end; margin-top: 8px; }

.cr-btn-primary.ant-btn {
    background: ${C.primary}; color: #fff; font-weight: 600; border: none;
    border-radius: 12px; height: 44px; padding: 0 24px;
}
.cr-btn-primary.ant-btn:hover:not(:disabled) { background: ${C.primaryDeep} !important; color: #fff !important; }
.cr-btn-primary.ant-btn:disabled { opacity: .5; color: #fff; background: ${C.primary}; }

.cr-list-head {
    display: flex; align-items: center; gap: 12px;
    margin: 4px 4px 0; font-size: 16px; font-weight: 700; color: ${C.ink};
}
.cr-list-head::after { content: ''; flex: 1; height: 1px; background: ${C.line}; }

.cr-acc { display: flex; flex-direction: column; gap: 12px; }
.cr-floor {
    background: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; overflow: hidden;
}
.cr-floor-btn {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 16px 20px; background: transparent; border: 0; cursor: pointer;
    font-family: inherit; font-size: 16px; font-weight: 700; color: ${C.ink}; text-align: left;
}
.cr-floor-btn:hover { background: ${C.sunken}; }
.cr-floor-count {
    background: ${C.primarySoft}; color: ${C.primarySoftText}; border: 1px solid ${C.primarySoftLine};
    border-radius: 999px; padding: 2px 12px; font-size: 13px; font-weight: 600;
}
.cr-floor-chevron { margin-left: auto; color: ${C.muted}; transition: transform .2s; }
.cr-floor-chevron.open { transform: rotate(180deg); }
.cr-floor-body {
    padding: 4px 20px 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
}

.cr-room {
    background: ${C.sunken}; border: 1px solid ${C.line}; border-radius: 16px;
    padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    min-height: 48px;
}
.cr-room-name { font-size: 14px; font-weight: 600; color: ${C.ink}; }
.cr-room-del {
    width: 32px; height: 32px; border-radius: 10px; border: 0; background: transparent;
    color: ${C.dangerNum}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
    font-size: 15px;
}
.cr-room-del:hover { background: ${C.dangerBg}; color: ${C.dangerFg}; }

.cr-empty { text-align: center; padding: 48px 24px; }
.cr-empty-icon {
    width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px;
    background: ${C.primarySoft}; color: ${C.primary};
    display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.cr-empty p { margin: 6px 0; font-size: 14px; line-height: 1.6; color: ${C.muted}; }

.cr-page button:focus-visible,
.cr-page .ant-btn:focus-visible {
    outline: 3px solid ${C.primary}; outline-offset: 2px;
}

@media (max-width: 768px) {
    .cr-page { padding: 12px; }
    .cr-banner { padding: 20px; border-radius: 16px; }
    .cr-banner h1 { font-size: 22px; }
    .cr-section { padding: 16px; border-radius: 16px; }
    .cr-floor { border-radius: 16px; }
    .cr-floor-body { grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 4px 12px 16px; }
    .cr-actions .ant-btn { width: 100%; }
}
`;

/* ---------- Reusable pieces ---------- */
const PageHeader = ({ icon, title, subtitle, right }) => (
    <header className="cr-banner">
        <div className="cr-banner-icon" aria-hidden="true">{icon}</div>
        <div className="cr-banner-text">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
        {right}
    </header>
);

const Section = ({ icon, title, children }) => (
    <section className="cr-section">
        <h2 className="cr-section-title">
            <span className="cr-section-icon" aria-hidden="true">{icon}</span>
            {title}
        </h2>
        {children}
    </section>
);

const CreateRoomPage = ({
                            control,
                            errors,
                            handleSubmit,
                            handleAddRooms,
                            onSubmit,
                            deleteRoom,
                            groupedRooms = {},
                            disabled,
                        }) => {
    const [expandedFloor, setExpandedFloor] = React.useState([]);

    const handleAccordionChange = (keys) => {
        setExpandedFloor(keys);
    };

    const floors = Object.keys(groupedRooms);
    const hasRooms = floors.length > 0;
    const totalRooms = floors.reduce((sum, f) => sum + groupedRooms[f].length, 0);

    const fields = [
        { name: 'floor', label: 'จำนวนชั้น', required: 'กรุณาระบุจำนวนชั้น', icon: <ApartmentOutlined /> },
        { name: 'roomPerFloor', label: 'จำนวนห้องต่อชั้น', required: 'กรุณาระบุจำนวนห้องต่อชั้น', icon: <AppstoreAddOutlined /> },
        { name: 'count', label: 'หลักของเลขห้อง', required: 'กรุณาระบุหลักของเลขห้อง', icon: <NumberOutlined /> },
    ];

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="cr-page">
                <div className="cr-stack">
                    <PageHeader
                        icon={<BuildOutlined />}
                        title="สร้างห้องพักใหม่"
                        subtitle="สร้างและจัดการห้องพักในอาคารของคุณ"
                        right={hasRooms ? <span className="cr-pill-dark">ตัวอย่าง {totalRooms} ห้อง</span> : null}
                    />

                    <Section icon={<ApartmentOutlined />} title="ตั้งค่าอาคาร">
                        <Form layout="vertical" component="div">
                            <div className="cr-fields">
                                {fields.map((f) => (
                                    <Form.Item
                                        key={f.name}
                                        label={f.label}
                                        validateStatus={errors[f.name] ? 'error' : ''}
                                        help={errors[f.name]?.message}
                                    >
                                        <Controller
                                            name={f.name}
                                            control={control}
                                            rules={{ required: f.required, min: 1 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder={f.label}
                                                    prefix={f.icon}
                                                    status={errors[f.name] ? 'error' : ''}
                                                />
                                            )}
                                        />
                                    </Form.Item>
                                ))}
                            </div>
                        </Form>

                        <div className="cr-actions">
                            <Button
                                type="primary"
                                className="cr-btn-primary"
                                icon={<AppstoreAddOutlined />}
                                onClick={handleSubmit(handleAddRooms)}
                            >
                                สร้างตัวอย่าง
                            </Button>
                        </div>
                    </Section>

                    {hasRooms ? (
                        <>
                            <div className="cr-list-head">ตัวอย่างห้องพัก</div>

                            <div className="cr-acc">
                                {floors.map((floor) => {
                                    const isOpen = expandedFloor.includes(floor);
                                    const panelId = `cr-floor-panel-${floor}`;
                                    return (
                                        <div className="cr-floor" key={floor}>
                                            <button
                                                type="button"
                                                className="cr-floor-btn"
                                                aria-expanded={isOpen}
                                                aria-controls={panelId}
                                                onClick={() => handleAccordionChange(isOpen ? [] : [floor])}
                                            >
                                                <span>ชั้นที่ {floor}</span>
                                                <span className="cr-floor-count">{groupedRooms[floor].length} ห้อง</span>
                                                <DownOutlined
                                                    className={`cr-floor-chevron${isOpen ? ' open' : ''}`}
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="cr-floor-body" id={panelId}>
                                                    {groupedRooms[floor].map((room) => (
                                                        <div className="cr-room" key={room.roomNumber}>
                                                            <span className="cr-room-name">ห้อง {room.roomNumber}</span>
                                                            <button
                                                                type="button"
                                                                className="cr-room-del"
                                                                aria-label={`ลบห้อง ${room.roomNumber}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteRoom(e, room.roomNumber);
                                                                }}
                                                            >
                                                                <DeleteOutlined />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                type="primary"
                                className="cr-btn-primary"
                                icon={<SaveOutlined />}
                                block
                                disabled={disabled}
                                onClick={handleSubmit(onSubmit)}
                            >
                                บันทึกห้องทั้งหมด
                            </Button>
                        </>
                    ) : (
                        <div className="cr-section cr-empty">
                            <div className="cr-empty-icon" aria-hidden="true">
                                <InfoCircleOutlined />
                            </div>
                            <p>ยังไม่มีข้อมูลห้องพัก</p>
                            <p>กรุณากรอกข้อมูลด้านบนและกด "สร้างตัวอย่าง" เพื่อดูรายการห้องพัก</p>
                        </div>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default CreateRoomPage;