import React from 'react';
import { Controller } from 'react-hook-form';
import { Collapse, Input, Button, Card, Typography, Row, Col, Divider, Empty } from 'antd';
import {
    ApartmentOutlined,
    NumberOutlined,
    AppstoreAddOutlined,
    DeleteOutlined,
    SaveOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import PageHeader from '../../../common/PageHeader';

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

    const hasRooms = Object.keys(groupedRooms).length > 0;
    const isMobile = window.innerWidth <= 768;

    const collapseItems = Object.keys(groupedRooms).map((floor) => ({
        key: floor,
        label: (
            <Typography.Text strong style={{
                fontSize: isMobile ? '14px' : '16px'
            }}>
                ชั้นที่ {floor} ({groupedRooms[floor].length} ห้อง)
            </Typography.Text>
        ),
        children: (
            <Row gutter={isMobile ? [8, 8] : [16, 16]}>
                {groupedRooms[floor].map((room) => (
                    <Col
                        xs={12} // 2 columns on mobile
                        sm={12}
                        md={8}
                        lg={6}  // 4 columns on large screens
                        key={room.roomNumber}
                    >
                        <Card
                            hoverable
                            style={{
                                borderRadius: isMobile ? 6 : 10,
                                height: '100%'
                            }}
                            styles={{
                                body: {
                                    padding: isMobile ? 8 : 12
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                minHeight: isMobile ? '20px' : '24px'
                            }}>
                                <Typography.Text
                                    strong
                                    style={{
                                        fontSize: isMobile ? '12px' : '14px',
                                        lineHeight: 1.2
                                    }}
                                >
                                    ห้อง {room.roomNumber}
                                </Typography.Text>
                                <DeleteOutlined
                                    style={{
                                        color: '#ff4d4f',
                                        fontSize: isMobile ? '12px' : '14px',
                                        cursor: 'pointer',
                                        padding: '2px'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRoom(e, room.roomNumber);
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        )
    }));

    return (
        <div style={{
            maxWidth: isMobile ? '100%' : 960,
            margin: '0 auto',
            padding: isMobile ? 12 : 24,
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <PageHeader
                title="สร้างห้องพักใหม่"
                subtitle="สร้างและจัดการห้องพักในอาคารของคุณ"
                icon="🏗️"
            />

            <Card
                variant="borderless"
                style={{
                    marginBottom: isMobile ? 20 : 32,
                    padding: isMobile ? 12 : 24,
                    boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.1)' : undefined
                }}
            >
                <Typography.Title
                    level={4}
                    style={{
                        fontSize: isMobile ? '16px' : undefined,
                        marginBottom: isMobile ? 12 : 16
                    }}
                >
                    ตั้งค่าอาคาร
                </Typography.Title>

                <Row gutter={isMobile ? [8, 12] : [16, 16]}>
                    <Col xs={24} sm={24} md={8}>
                        <div style={{ marginBottom: isMobile ? 4 : 8 }}>
                            <Typography.Text
                                style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#666',
                                    display: 'block',
                                    marginBottom: 4
                                }}
                            >
                                จำนวนชั้น
                            </Typography.Text>
                            <Controller
                                name="floor"
                                control={control}
                                rules={{ required: 'กรุณาระบุจำนวนชั้น', min: 1 }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="จำนวนชั้น"
                                        prefix={<ApartmentOutlined style={{
                                            fontSize: isMobile ? '14px' : '16px'
                                        }} />}
                                        status={errors.floor ? 'error' : ''}
                                        size={isMobile ? 'middle' : 'large'}
                                        style={{
                                            fontSize: isMobile ? '14px' : undefined
                                        }}
                                    />
                                )}
                            />
                            {errors.floor && (
                                <Typography.Text
                                    type="danger"
                                    style={{
                                        fontSize: isMobile ? '11px' : '12px'
                                    }}
                                >
                                    {errors.floor.message}
                                </Typography.Text>
                            )}
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <div style={{ marginBottom: isMobile ? 4 : 8 }}>
                            <Typography.Text
                                style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#666',
                                    display: 'block',
                                    marginBottom: 4
                                }}
                            >
                                จำนวนห้องต่อชั้น
                            </Typography.Text>
                            <Controller
                                name="roomPerFloor"
                                control={control}
                                rules={{ required: 'กรุณาระบุจำนวนห้องต่อชั้น', min: 1 }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="จำนวนห้องต่อชั้น"
                                        prefix={<AppstoreAddOutlined style={{
                                            fontSize: isMobile ? '14px' : '16px'
                                        }} />}
                                        status={errors.roomPerFloor ? 'error' : ''}
                                        size={isMobile ? 'middle' : 'large'}
                                        style={{
                                            fontSize: isMobile ? '14px' : undefined
                                        }}
                                    />
                                )}
                            />
                            {errors.roomPerFloor && (
                                <Typography.Text
                                    type="danger"
                                    style={{
                                        fontSize: isMobile ? '11px' : '12px'
                                    }}
                                >
                                    {errors.roomPerFloor.message}
                                </Typography.Text>
                            )}
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <div style={{ marginBottom: isMobile ? 4 : 8 }}>
                            <Typography.Text
                                style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#666',
                                    display: 'block',
                                    marginBottom: 4
                                }}
                            >
                                หลักของเลขห้อง
                            </Typography.Text>
                            <Controller
                                name="count"
                                control={control}
                                rules={{ required: 'กรุณาระบุหลักของเลขห้อง', min: 1 }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="หลักของเลขห้อง"
                                        prefix={<NumberOutlined style={{
                                            fontSize: isMobile ? '14px' : '16px'
                                        }} />}
                                        status={errors.count ? 'error' : ''}
                                        size={isMobile ? 'middle' : 'large'}
                                        style={{
                                            fontSize: isMobile ? '14px' : undefined
                                        }}
                                    />
                                )}
                            />
                            {errors.count && (
                                <Typography.Text
                                    type="danger"
                                    style={{
                                        fontSize: isMobile ? '11px' : '12px'
                                    }}
                                >
                                    {errors.count.message}
                                </Typography.Text>
                            )}
                        </div>
                    </Col>
                </Row>

                <div style={{
                    textAlign: 'right',
                    marginTop: isMobile ? 16 : 24
                }}>
                    <Button
                        type="primary"
                        icon={<AppstoreAddOutlined style={{
                            fontSize: isMobile ? '14px' : '16px'
                        }} />}
                        size={isMobile ? 'middle' : 'large'}
                        onClick={handleSubmit(handleAddRooms)}
                        style={{
                            fontSize: isMobile ? '14px' : undefined,
                            height: isMobile ? '36px' : undefined,
                            width: isMobile ? '100%' : 'auto'
                        }}
                    >
                        สร้างตัวอย่าง
                    </Button>
                </div>
            </Card>

            {hasRooms ? (
                <>
                    <Divider
                        orientation="left"
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            margin: isMobile ? '16px 0' : '24px 0'
                        }}
                    >
                        ตัวอย่างห้องพัก
                    </Divider>
                    <Collapse
                        activeKey={expandedFloor}
                        onChange={handleAccordionChange}
                        bordered={false}
                        items={collapseItems}
                        accordion
                        style={{
                            background: 'white',
                            borderRadius: isMobile ? 6 : 8
                        }}
                        size={isMobile ? 'small' : 'middle'}
                    />

                    <Button
                        type="primary"
                        icon={<SaveOutlined style={{
                            fontSize: isMobile ? '14px' : '16px'
                        }} />}
                        size={isMobile ? 'middle' : 'large'}
                        block
                        disabled={disabled}
                        onClick={handleSubmit(onSubmit)}
                        style={{
                            marginTop: isMobile ? 20 : 32,
                            fontSize: isMobile ? '14px' : undefined,
                            height: isMobile ? '40px' : undefined
                        }}
                    >
                        บันทึกห้องทั้งหมด
                    </Button>
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    marginTop: isMobile ? 32 : 64,
                    padding: isMobile ? '20px 12px' : '32px 24px'
                }}>
                    <Empty
                        image={
                            <InfoCircleOutlined
                                style={{
                                    fontSize: isMobile ? 36 : 48,
                                    color: '#999'
                                }}
                            />
                        }
                        description={
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                lineHeight: 1.5,
                                color: '#666'
                            }}>
                                <p style={{ margin: '8px 0' }}>ยังไม่มีข้อมูลห้องพัก</p>
                                <p style={{ margin: '8px 0' }}>
                                    กรุณากรอกข้อมูลด้านบนและกด "สร้างตัวอย่าง" เพื่อดูรายการห้องพัก
                                </p>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default CreateRoomPage;