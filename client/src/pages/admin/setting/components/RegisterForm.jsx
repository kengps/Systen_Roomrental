import React from 'react'
import { ConfigProvider, Form, Input, Select, Checkbox, Button } from "antd";
import {
    UserOutlined,
    LockOutlined,
    TeamOutlined,
    PlusCircleOutlined,
    EyeOutlined,
    EditOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    IdcardOutlined,
} from "@ant-design/icons";

const { Option } = Select;

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
    onDarkMuted: '#A5B0C6',
    onDarkIcon: '#A5B4FC',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};

const css = `
.rf-page { background:${C.page}; min-height:100vh; padding:32px 24px; font-family:${FONT}; }
.rf-wrap { max-width:950px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }

.rf-banner { background:${C.ink}; border-radius:20px; padding:24px 28px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.rf-banner-icon { width:52px; height:52px; border-radius:14px; background:${C.raised}; color:${C.onDarkIcon}; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
.rf-banner h1 { margin:0; font-size:26px; font-weight:700; color:#fff; line-height:1.3; }
.rf-banner p { margin:2px 0 0; font-size:14px; color:${C.onDarkMuted}; }

.rf-section { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; padding:24px; }
.rf-section-head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.rf-section-icon { width:36px; height:36px; border-radius:10px; background:${C.primarySoft}; color:${C.primary}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.rf-section-title { margin:0; font-size:16px; font-weight:700; color:${C.ink}; }

.rf-grid2 { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); column-gap:24px; }
.rf-label { font-weight:600; color:${C.ink}; }

.rf-perm-bar { display:flex; justify-content:flex-end; margin-bottom:16px; }
.rf-perm-bar .ant-checkbox-wrapper { font-weight:600; color:${C.primarySoftText}; }
.rf-perms { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; }

.rf-tile { display:flex; flex-direction:column; align-items:center; gap:10px; padding:20px 16px; border-radius:16px; border:1px solid ${C.line}; background:${C.sunken}; color:${C.muted}; font-family:inherit; font-size:15px; font-weight:500; cursor:pointer; transition:background .15s, border-color .15s, color .15s; }
.rf-tile:hover { border-color:${C.primarySoftLine}; background:${C.primarySoft}; }
.rf-tile.is-on { background:${C.primarySoft}; border-color:${C.primary}; color:${C.primarySoftText}; }
.rf-tile:focus-visible { outline:3px solid ${C.primarySoftLine}; outline-offset:2px; }
.rf-tile-icon { font-size:24px; color:#9AA3B8; }
.rf-tile.is-on .rf-tile-icon { color:${C.primary}; }
.rf-tile-state { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; padding:2px 10px; border-radius:999px; background:#fff; border:1px solid ${C.line}; color:${C.muted}; }
.rf-tile.is-on .rf-tile-state { background:${C.primary}; border-color:${C.primary}; color:#fff; }

.rf-submit { display:flex; justify-content:center; }
.rf-submit .ant-btn { height:48px; padding:0 40px; font-weight:600; font-size:16px; }

@media (max-width: 600px) {
  .rf-page { padding:16px 12px; }
  .rf-banner { padding:20px; }
  .rf-banner h1 { font-size:22px; }
  .rf-submit .ant-btn { width:100%; }
}
`;

const PERMISSION_ITEMS = [
    { key: 'create', label: 'สร้าง (Create)', icon: <PlusCircleOutlined /> },
    { key: 'read', label: 'อ่าน (Read)', icon: <EyeOutlined /> },
    { key: 'update', label: 'แก้ไข (Update)', icon: <EditOutlined /> },
];

const PageHeader = ({ icon, title, subtitle }) => (
    <header className="rf-banner">
        <div className="rf-banner-icon" aria-hidden="true">{icon}</div>
        <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    </header>
);

const Section = ({ icon, title, children }) => (
    <section className="rf-section">
        <div className="rf-section-head">
            <div className="rf-section-icon" aria-hidden="true">{icon}</div>
            <h2 className="rf-section-title">{title}</h2>
        </div>
        {children}
    </section>
);

const label = (text) => <span className="rf-label">{text}</span>;
const prefixStyle = { color: '#9AA3B8' };

const RegisterForm = ({ form, handleSubmit, handleSelectAllChange, handlePermissionChange, permissions, loading }) => {
    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>
            <div className="rf-page">
                <div className="rf-wrap">
                    <PageHeader
                        title="เพิ่มผู้ใช้ใหม่"
                        subtitle="สร้างบัญชีผู้ใช้ใหม่สำหรับระบบจัดการห้องเช่า"
                        icon={<UserOutlined />}
                    />

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                        requiredMark={false}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Section icon={<IdcardOutlined />} title="ข้อมูลบัญชี">
                                <div className="rf-grid2">
                                    <Form.Item
                                        name="username"
                                        label={label('ชื่อผู้ใช้')}
                                        rules={[
                                            { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                                            { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined style={prefixStyle} />} placeholder="Username" />
                                    </Form.Item>

                                    <Form.Item
                                        name="role"
                                        label={label('บทบาท')}
                                        rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
                                    >
                                        <Select placeholder="เลือกบทบาท" style={{ width: '100%' }}>
                                            <Option value="Master">Master</Option>
                                            <Option value="Admin">Admin</Option>
                                            <Option value="Member">Member</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        label={label('รหัสผ่าน')}
                                        rules={[
                                            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                                            { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined style={prefixStyle} />} placeholder="Password" />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirmPassword"
                                        label={label('ยืนยันรหัสผ่าน')}
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                                    return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined style={prefixStyle} />} placeholder="Confirm Password" />
                                    </Form.Item>
                                </div>
                            </Section>

                            <Section icon={<SafetyCertificateOutlined />} title="สิทธิ์การใช้งาน">
                                <div className="rf-perm-bar">
                                    <Checkbox
                                        checked={permissions.selectAll}
                                        onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    >
                                        <CheckCircleOutlined style={{ marginRight: 4 }} /> เลือกสิทธิ์ทั้งหมด
                                    </Checkbox>
                                </div>

                                <div className="rf-perms">
                                    {PERMISSION_ITEMS.map((item) => {
                                        const on = !!permissions[item.key];
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                className={`rf-tile${on ? ' is-on' : ''}`}
                                                aria-pressed={on}
                                                onClick={() => handlePermissionChange(item.key, !permissions[item.key])}
                                            >
                                                <span className="rf-tile-icon" aria-hidden="true">{item.icon}</span>
                                                <span>{item.label}</span>
                                                <span className="rf-tile-state">{on ? 'เลือกแล้ว' : 'ยังไม่เลือก'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Section>

                            <div className="rf-submit">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<TeamOutlined />}
                                >
                                    สร้างผู้ใช้
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    )
}

export default RegisterForm