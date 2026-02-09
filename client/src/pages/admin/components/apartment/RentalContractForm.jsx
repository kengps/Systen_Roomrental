import React from 'react'
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Space, Typography, message } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const { Title, Text } = Typography

const rentalSchema = z.object({
  tenantName: z.string().min(1, 'กรุณากรอกชื่อผู้เช่า'),
  nationalId: z.string().min(13, 'เลขบัตรประชาชนไม่ถูกต้อง').max(20, 'ยาวเกินไป').optional().or(z.literal('')),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรให้ถูกต้อง'),
  roomNumber: z.string().min(1, 'กรุณากรอกเลขห้อง'),
  startDate: z.date({ required_error: 'กรุณาเลือกวันเริ่มสัญญา' }),
  endDate: z.date({ required_error: 'กรุณาเลือกวันสิ้นสุดสัญญา' }),
  monthlyRent: z.number().min(0, 'กรุณากรอกราคาเช่าต่อเดือน'),
  deposit: z.number().min(0, 'กรุณากรอกค่ามัดจำ'),
  remarks: z.string().max(500, 'ไม่เกิน 500 ตัวอักษร').optional().or(z.literal('')),
}).refine((val) => val.endDate >= val.startDate, {
  message: 'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มสัญญา',
  path: ['endDate']
})

export default function RentalContractForm({ onSubmit }) {
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      tenantName: '',
      nationalId: '',
      phone: '',
      roomNumber: '',
      startDate: undefined,
      endDate: undefined,
      monthlyRent: 0,
      deposit: 0,
      remarks: ''
    }
  })

  const internalSubmit = async (data) => {
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        message.success('บันทึกสัญญาผู้เช่าสำเร็จ (ตัวอย่าง)')
        // eslint-disable-next-line no-console
        console.log('Rental contract payload:', data)
      }
      reset()
    } catch (e) {
      message.error('บันทึกไม่สำเร็จ')
    }
  }

  return (
    <Card
      style={{ maxWidth: 960, margin: '0 auto' }}
      styles={{ body: { padding: 24 } }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>เพิ่มสัญญาผู้เช่า</Title>
          <Text type="secondary">กรอกข้อมูลสัญญาเช่าห้อง</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(internalSubmit)}>
          <Row gutter={[12, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="ชื่อ-นามสกุลผู้เช่า" validateStatus={errors.tenantName ? 'error' : ''} help={errors.tenantName?.message}>
                <Controller name="tenantName" control={control} render={({ field }) => (
                  <Input {...field} placeholder="เช่น นายสมชาย ใจดี" />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="เลขบัตรประชาชน" validateStatus={errors.nationalId ? 'error' : ''} help={errors.nationalId?.message}>
                <Controller name="nationalId" control={control} render={({ field }) => (
                  <Input {...field} placeholder="ไม่บังคับ" />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="เบอร์โทร" validateStatus={errors.phone ? 'error' : ''} help={errors.phone?.message}>
                <Controller name="phone" control={control} render={({ field }) => (
                  <Input {...field} placeholder="08x-xxx-xxxx" />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="เลขห้อง" validateStatus={errors.roomNumber ? 'error' : ''} help={errors.roomNumber?.message}>
                <Controller name="roomNumber" control={control} render={({ field }) => (
                  <Input {...field} placeholder="เช่น 101" />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="วันเริ่มสัญญา" validateStatus={errors.startDate ? 'error' : ''} help={errors.startDate?.message}>
                <Controller name="startDate" control={control} render={({ field }) => (
                  <DatePicker {...field} value={field.value} onChange={(d) => field.onChange(d?.toDate())} style={{ width: '100%' }} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="วันสิ้นสุดสัญญา" validateStatus={errors.endDate ? 'error' : ''} help={errors.endDate?.message}>
                <Controller name="endDate" control={control} render={({ field }) => (
                  <DatePicker {...field} value={field.value} onChange={(d) => field.onChange(d?.toDate())} style={{ width: '100%' }} />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ค่าเช่ารายเดือน (บาท)" validateStatus={errors.monthlyRent ? 'error' : ''} help={errors.monthlyRent?.message}>
                <Controller name="monthlyRent" control={control} render={({ field }) => (
                  <InputNumber {...field} onChange={(v) => field.onChange(Number(v || 0))} min={0} step={100} style={{ width: '100%' }} />
                )} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="ค่ามัดจำ (บาท)" validateStatus={errors.deposit ? 'error' : ''} help={errors.deposit?.message}>
                <Controller name="deposit" control={control} render={({ field }) => (
                  <InputNumber {...field} onChange={(v) => field.onChange(Number(v || 0))} min={0} step={100} style={{ width: '100%' }} />
                )} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="หมายเหตุ" validateStatus={errors.remarks ? 'error' : ''} help={errors.remarks?.message}>
                <Controller name="remarks" control={control} render={({ field }) => (
                  <Input.TextArea {...field} rows={4} placeholder="เงื่อนไขพิเศษ ฯลฯ (ไม่บังคับ)" />
                )} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              บันทึกสัญญาเช่า
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  )
}


