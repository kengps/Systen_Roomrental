import React from 'react'
import { Form, Input, Select, Checkbox, Button, Card, Row, Col, Typography, Divider, Space } from "antd";
import {
    UserOutlined,
    LockOutlined,
    TeamOutlined,

    PlusCircleOutlined,
    EyeOutlined,
    EditOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import PageHeader from '../../../../components/common/PageHeader';
import {ShieldOutlined} from "@mui/icons-material";

const { Text } = Typography;
const { Option } = Select;

const RegisterForm = ({ form, handleSubmit, handleSelectAllChange, handlePermissionChange, permissions, loading }) => {

    // Mapping ไอคอนให้ตรงกับประเภทสิทธิ์
    const getIcon = (key) => {
        switch(key) {
            case 'create': return <PlusCircleOutlined />;
            case 'read': return <EyeOutlined />;
            case 'update': return <EditOutlined />;
            default: return <ShieldOutlined />;
        }
    }

    return (
        <div style={{
            padding: '40px 24px',
            maxWidth: '950px',
            margin: '0 auto',
            backgroundColor: '#f4f7fe', // สีโทน Soft Blue-Grey
            minHeight: '100vh',
        }}>
            <PageHeader
                title="เพิ่มผู้ใช้ใหม่"
                subtitle="สร้างบัญชีผู้ใช้ใหม่สำหรับระบบจัดการห้องเช่า"
                icon={<UserOutlined />}
            />

            <Card
                bordered={false}
                style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    borderRadius: '24px',
                    marginTop: '24px'
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Row gutter={[32, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="username"
                                label={<Text strong style={{ color: '#595959' }}>ชื่อผู้ใช้</Text>}
                                rules={[
                                    { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                                    { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Username"
                                    size="large"
                                    style={{ borderRadius: '12px', height: '45px' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="role"
                                label={<Text strong style={{ color: '#595959' }}>บทบาท</Text>}
                                rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
                            >
                                <Select
                                    placeholder="เลือกบทบาท"
                                    size="large"
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ borderRadius: '12px' }}
                                >
                                    <Option value="Master">Master</Option>
                                    <Option value="Admin">Admin</Option>
                                    <Option value="Member">Member</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[32, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="password"
                                label={<Text strong style={{ color: '#595959' }}>รหัสผ่าน</Text>}
                                rules={[
                                    { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                                    { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Password"
                                    size="large"
                                    style={{ borderRadius: '12px', height: '45px' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="confirmPassword"
                                label={<Text strong style={{ color: '#595959' }}>ยืนยันรหัสผ่าน</Text>}
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
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Confirm Password"
                                    size="large"
                                    style={{ borderRadius: '12px', height: '45px' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '40px 0 24px 0' }}>
                        <Space>
                            <ShieldOutlined style={{ color: '#4f46e5' }} />
                            <Text strong style={{ fontSize: '16px', letterSpacing: '0.5px' }}>สิทธิ์การใช้งาน</Text>
                        </Space>
                    </Divider>

                    {/* Permission Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Checkbox
                                    checked={permissions.selectAll}
                                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    style={{ fontWeight: 600, color: '#4f46e5' }}
                                >
                                    <CheckCircleOutlined style={{ marginRight: '4px' }} /> เลือกสิทธิ์ทั้งหมด
                                </Checkbox>
                            </Form.Item>
                        </div>

                        <Row gutter={[16, 16]}>
                            {[
                                { key: 'create', label: 'สร้าง (Create)' },
                                { key: 'read', label: 'อ่าน (Read)' },
                                { key: 'update', label: 'แก้ไข (Update)' }
                            ].map(item => (
                                <Col xs={24} sm={8} key={item.key}>
                                    <div
                                        onClick={() => handlePermissionChange(item.key, !permissions[item.key])}
                                        style={{
                                            padding: '20px',
                                            background: permissions[item.key] ? '#f0f7ff' : '#fff',
                                            border: permissions[item.key] ? '2px solid #1890ff' : '1px solid #f0f0f0',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px',
                                            boxShadow: permissions[item.key] ? '0 10px 15px -3px rgba(24, 144, 255, 0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '24px',
                                            color: permissions[item.key] ? '#1890ff' : '#bfbfbf',
                                            transition: 'all 0.3s'
                                        }}>
                                            {getIcon(item.key)}
                                        </div>
                                        <Checkbox
                                            checked={permissions[item.key]}
                                            onChange={(e) => handlePermissionChange(item.key, e.target.checked)}
                                            style={{ fontWeight: 500 }}
                                        >
                                            {item.label}
                                        </Checkbox>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <Form.Item style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            icon={<TeamOutlined />}
                            style={{
                                height: '52px',
                                padding: '0 48px',
                                borderRadius: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                background: '#1890ff',
                                border: 'none',
                                boxShadow: '0 10px 20px rgba(24, 144, 255, 0.3)'
                            }}
                        >
                            สร้างผู้ใช้
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default RegisterForm