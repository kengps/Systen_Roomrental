import React from 'react'
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography, Upload, message } from 'antd'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const { Title, Text } = Typography
const { Option } = Select

const vehicleSchema = z.object({
  type: z.string().min(1, 'ระบุประเภทยานพาหนะ'),
  brand: z.string().optional().or(z.literal('')),
  detail: z.string().optional().or(z.literal('')),
  plate: z.string().optional().or(z.literal('')),
})

const schema = z.object({
  prefix: z.string().min(1, 'คำนำหน้า'),
  firstName: z.string().min(1, 'กรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรอกนามสกุล'),
  nickName: z.string().optional().or(z.literal('')),
  phone: z.string().min(9, 'เบอร์โทรไม่ถูกต้อง'),
  nationalId: z.string().optional().or(z.literal('')),
  birthDate: z.date({ required_error: 'เลือกวันเกิด' }).optional(),
  address: z.string().optional().or(z.literal('')),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  lineId: z.string().optional().or(z.literal('')),
  education: z.string().optional().or(z.literal('')),
  faculty: z.string().optional().or(z.literal('')),
  majorOrPosition: z.string().optional().or(z.literal('')),
  studentOrEmployeeId: z.string().optional().or(z.literal('')),
  emergencyName: z.string().optional().or(z.literal('')),
  emergencyRelation: z.string().optional().or(z.literal('')),
  emergencyPhone: z.string().optional().or(z.literal('')),
  vehicles: z.array(vehicleSchema).min(0).max(3).optional().default([]),
  wifiCode: z.string().optional().or(z.literal('')),
  internetCode: z.string().optional().or(z.literal('')),
  citizenIdImages: z.array(z.any()).optional().default([]),
  extraImages: z.array(z.any()).optional().default([]),
  remarks: z.string().optional().or(z.literal('')),
})

export default function TenantCreateForm({ onSubmit }) {
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      prefix: 'นาย',
      firstName: '',
      lastName: '',
      nickName: '',
      phone: '',
      nationalId: '',
      birthDate: undefined,
      address: '',
      email: '',
      facebook: '',
      lineId: '',
      education: '',
      faculty: '',
      majorOrPosition: '',
      studentOrEmployeeId: '',
      emergencyName: '',
      emergencyRelation: '',
      emergencyPhone: '',
      vehicles: [{ type: '' }],
      wifiCode: '',
      internetCode: '',
      citizenIdImages: [],
      extraImages: [],
      remarks: ''
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'vehicles' })

  const internalSubmit = async (data) => {
    try {
      const payload = { ...data }
      if (onSubmit) await onSubmit(payload)
      else {
        // eslint-disable-next-line no-console
        console.log('tenant payload', payload)
        message.success('เพิ่มข้อมูลผู้เช่าสำเร็จ (ตัวอย่าง)')
      }
      reset()
    } catch (e) {
      message.error('บันทึกไม่สำเร็จ')
    }
  }

  return (
    <Card style={{ maxWidth: 1100, margin: '0 auto' }} styles={{ body: { padding: 24 } }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>เพิ่มข้อมูลผู้เช่า</Title>
        <Form layout="vertical" onFinish={handleSubmit(internalSubmit)}>
          <Row gutter={[12, 0]}>
            <Col xs={24} md={6}>
              <Form.Item label="คำนำหน้า" validateStatus={errors.prefix ? 'error' : ''} help={errors.prefix?.message}>
                <Controller name="prefix" control={control} render={({ field }) => (
                  <Select {...field}>
                    <Option value="นาย">นาย</Option>
                    <Option value="นาง">นาง</Option>
                    <Option value="นางสาว">นางสาว</Option>
                  </Select>
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={9}>
              <Form.Item label="ชื่อจริง" validateStatus={errors.firstName ? 'error' : ''} help={errors.firstName?.message}>
                <Controller name="firstName" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={9}>
              <Form.Item label="นามสกุล" validateStatus={errors.lastName ? 'error' : ''} help={errors.lastName?.message}>
                <Controller name="lastName" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="ชื่อเล่น">
                <Controller name="nickName" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="เบอร์โทร" validateStatus={errors.phone ? 'error' : ''} help={errors.phone?.message}>
                <Controller name="phone" control={control} render={({ field }) => (
                  <Input {...field} placeholder="เช่น 0812345678" />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="หมายเลขบัตรประชาชน">
                <Controller name="nationalId" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="วันเกิด">
                <Controller name="birthDate" control={control} render={({ field }) => (
                  <DatePicker {...field} value={field.value} onChange={(d) => field.onChange(d?.toDate())} style={{ width: '100%' }} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item label="ที่อยู่ตามทะเบียนบ้าน">
                <Controller name="address" control={control} render={({ field }) => (
                  <Input.TextArea {...field} rows={2} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                <Controller name="email" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Facebook">
                <Controller name="facebook" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Line ID">
                <Controller name="lineId" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="สถาบัน/สถานที่ทำงาน">
                <Controller name="education" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="คณะ/แผนก">
                <Controller name="faculty" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="สาขา/ตำแหน่ง">
                <Controller name="majorOrPosition" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="รหัสนักศึกษา/รหัสพนักงาน">
                <Controller name="studentOrEmployeeId" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="บุคคลติดต่อฉุกเฉิน">
                <Controller name="emergencyName" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="ความสัมพันธ์">
                <Controller name="emergencyRelation" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="เบอร์ติดต่อฉุกเฉิน">
                <Controller name="emergencyPhone" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            {fields.map((item, index) => (
              <React.Fragment key={item.id}>
                <Col span={24}><Text strong>ยานพาหนะคันที่ {index + 1}</Text></Col>
                <Col xs={24} md={6}>
                  <Form.Item label="ประเภท" validateStatus={errors.vehicles?.[index]?.type ? 'error' : ''} help={errors.vehicles?.[index]?.type?.message}>
                    <Controller name={`vehicles.${index}.type`} control={control} render={({ field }) => (
                      <Select {...field} placeholder="รถยนต์/รถจักรยานยนต์">
                        <Option value="car">รถยนต์</Option>
                        <Option value="motorcycle">รถจักรยานยนต์</Option>
                        <Option value="other">อื่นๆ</Option>
                      </Select>
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="ยี่ห้อ">
                    <Controller name={`vehicles.${index}.brand`} control={control} render={({ field }) => (
                      <Input {...field} />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="รายละเอียด">
                    <Controller name={`vehicles.${index}.detail`} control={control} render={({ field }) => (
                      <Input {...field} />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="ทะเบียน">
                    <Controller name={`vehicles.${index}.plate`} control={control} render={({ field }) => (
                      <Input {...field} />
                    )} />
                  </Form.Item>
                </Col>
              </React.Fragment>
            ))}

            <Col span={24}>
              <Space>
                <Button onClick={() => append({ type: '' })}>เพิ่มยานพาหนะ</Button>
                {fields.length > 0 && <Button danger onClick={() => remove(fields.length - 1)}>ลบแถวล่าสุด</Button>}
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="รหัส WiFi">
                <Controller name="wifiCode" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="รหัสอินเทอร์เน็ต">
                <Controller name="internetCode" control={control} render={({ field }) => (
                  <Input {...field} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="แนบบัตรประชาชน/หลักฐาน">
                <Upload listType="picture-card" multiple beforeUpload={() => false}>
                  <div>อัปโหลด</div>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="แนบรูปภาพเพิ่มเติม">
                <Upload listType="picture-card" multiple beforeUpload={() => false}>
                  <div>อัปโหลด</div>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="หมายเหตุ">
                <Controller name="remarks" control={control} render={({ field }) => (
                  <Input.TextArea {...field} rows={4} />
                )} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button htmlType="button" onClick={() => reset()}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>เพิ่มข้อมูลผู้เช่า</Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  )
}


