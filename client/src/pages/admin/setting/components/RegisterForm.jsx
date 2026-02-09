import React from 'react'


import { Form, Input, Select, Checkbox, Button, Card, Row, Col, Typography, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, TeamOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import PageHeader from '../../../../components/common/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterForm = ({ form, handleSubmit, handleSelectAllChange, handlePermissionChange, permissions, loading }) => {
    return (
        <div style={{
            padding: '24px',
            maxWidth: '900px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1
        }}>
            <PageHeader
                title="เพิ่มผู้ใช้ใหม่"
                subtitle="สร้างบัญชีผู้ใช้ใหม่สำหรับระบบจัดการห้องเช่า"
                icon="👤"
            />

            <Card
                style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: '16px',
                    border: 'none',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="username"
                                label={<span style={{ fontWeight: '500', color: '#333' }}>ชื่อผู้ใช้</span>}
                                rules={[
                                    { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                                    { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                    placeholder="กรอกชื่อผู้ใช้"
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #f0f0f0',
                                        padding: '8px 12px'
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="role"
                                label={<span style={{ fontWeight: '500', color: '#333' }}>บทบาท</span>}
                                rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
                            >
                                <Select
                                    placeholder="เลือกบทบาท"
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #f0f0f0',
                                        zIndex: 9999
                                    }}
                                    dropdownStyle={{
                                        zIndex: 9999
                                    }}
                                >
                                    <Option value="Master">👑 Master</Option>
                                    <Option value="Admin">⚙️ Admin</Option>
                                    <Option value="Member">👤 Member</Option>
                                </Select>
                            </Form.Item>

                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: '500', color: '#333' }}>รหัสผ่าน</span>}
                                rules={[
                                    { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                                    { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                                    placeholder="กรอกรหัสผ่าน"
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #f0f0f0',
                                        padding: '8px 12px'
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="confirmPassword"
                                label={<span style={{ fontWeight: '500', color: '#333' }}>ยืนยันรหัสผ่าน</span>}
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                                    placeholder="ยืนยันรหัสผ่าน"
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #f0f0f0',
                                        padding: '8px 12px'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1890ff',
                        margin: '24px 0'
                    }}>
                        🔐 สิทธิ์การใช้งาน
                    </Divider>

                    <Card
                        style={{
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}
                    >
                        <Form.Item>
                            <Checkbox
                                checked={permissions.selectAll}
                                onChange={(e) => handleSelectAllChange(e.target.checked)}
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#1890ff'
                                }}
                            >
                                ✅ เลือกสิทธิ์ทั้งหมด
                            </Checkbox>
                        </Form.Item>

                        <Space direction="vertical" style={{ width: '100%', padding: '0 16px' }}>
                            <Checkbox
                                checked={permissions.create}
                                onChange={(e) => handlePermissionChange('create', e.target.checked)}
                                style={{ fontSize: '15px' }}
                            >
                                📝 สร้าง (Create)
                            </Checkbox>

                            <Checkbox
                                checked={permissions.read}
                                onChange={(e) => handlePermissionChange('read', e.target.checked)}
                                style={{ fontSize: '15px' }}
                            >
                                👁️ อ่าน (Read)
                            </Checkbox>

                            <Checkbox
                                checked={permissions.update}
                                onChange={(e) => handlePermissionChange('update', e.target.checked)}
                                style={{ fontSize: '15px' }}
                            >
                                ✏️ แก้ไข (Update)
                            </Checkbox>
                        </Space>
                    </Card>

                    <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            icon={<TeamOutlined />}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                height: '48px',
                                fontSize: '16px',
                                fontWeight: '600',
                                padding: '0 32px',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            🚀 สร้างผู้ใช้
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default RegisterForm