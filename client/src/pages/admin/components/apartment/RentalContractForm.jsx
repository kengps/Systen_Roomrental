import React from 'react'
import { Button, ConfigProvider, DatePicker, Form, Input, InputNumber, message } from 'antd'
import { FileTextOutlined, UserOutlined, HomeOutlined, DollarOutlined, EditOutlined } from '@ant-design/icons'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'

/* ───────── Design tokens (ชุดเดียวกับหน้าอื่น) ───────── */
const C = {
  ink: '#0F172A',
  raised: '#1E2A4A',
  page: '#F4F5F9',
  card: '#FFFFFF',
  line: '#E6E8F0',
  primary: '#4F46E5',
  primaryDeep: '#4338CA',
  primarySoft: '#EEF0FF',
}

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif"

const theme = {
  token: { colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
}

const css = `
.rc-page { font-family: ${FONT}; color: ${C.ink}; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
.rc-grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); column-gap: 16px; }
.rc-form .ant-form-item { margin-bottom: 20px; }
.rc-form .ant-form-item-label > label { font-weight: 600; font-size: 14px; }
.rc-submit.ant-btn { font-weight: 600; min-width: 200px; }
@media (max-width: 575px) { .rc-submit.ant-btn { width: 100%; } }
`

/* ───────── ชิ้นส่วนที่ใช้ซ้ำ ───────── */
const PageHeader = ({ icon, title, subtitle }) => (
    <header style={{ background: C.ink, borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <span aria-hidden="true" style={{
      flex: '0 0 auto', width: 52, height: 52, borderRadius: 16, background: C.raised, color: '#A5B4FC',
      fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: '#FFFFFF' }}>{title}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#A5B0C6' }}>{subtitle}</p>
      </div>
    </header>
)

const Section = ({ icon, title, children }) => (
    <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 700 }}>
      <span aria-hidden="true" style={{
        width: 36, height: 36, borderRadius: 10, background: C.primarySoft, color: C.primaryDeep,
        fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</span>
        {title}
      </div>
      <div>{children}</div>
    </section>
)

const Item = ({ label, error, children, ...rest }) => (
    <Form.Item label={label} validateStatus={error ? 'error' : ''} help={error?.message} {...rest}>
      {children}
    </Form.Item>
)

/* ───────── Schema (เหมือนเดิม) ───────── */
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

  // DatePicker ของ antd v5 ต้องการ dayjs แต่ฟอร์มเก็บเป็น Date → แปลงตอนแสดงผล
  const dateField = (field) => ({
    ...field,
    value: field.value ? dayjs(field.value) : null,
    onChange: (d) => field.onChange(d ? d.toDate() : undefined),
    style: { width: '100%' },
  })

  const moneyField = (field) => ({
    ...field,
    onChange: (v) => field.onChange(Number(v || 0)),
    min: 0,
    step: 100,
    prefix: '฿',
    style: { width: '100%' },
  })

  return (
      <ConfigProvider theme={theme}>
        <style>{css}</style>
        <div className="rc-page">
          <PageHeader icon={<FileTextOutlined />} title="เพิ่มสัญญาผู้เช่า" subtitle="กรอกข้อมูลสัญญาเช่าห้อง" />

          <Form layout="vertical" className="rc-form" onFinish={handleSubmit(internalSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <Section icon={<UserOutlined />} title="ข้อมูลผู้เช่า">
                <div className="rc-grid2">
                  <Item label="ชื่อ-นามสกุลผู้เช่า" error={errors.tenantName}>
                    <Controller name="tenantName" control={control} render={({ field }) => (
                        <Input {...field} placeholder="เช่น นายสมชาย ใจดี" />
                    )} />
                  </Item>
                  <Item label="เลขบัตรประชาชน" error={errors.nationalId}>
                    <Controller name="nationalId" control={control} render={({ field }) => (
                        <Input {...field} placeholder="ไม่บังคับ" />
                    )} />
                  </Item>
                  <Item label="เบอร์โทร" error={errors.phone} style={{ marginBottom: 0 }}>
                    <Controller name="phone" control={control} render={({ field }) => (
                        <Input {...field} placeholder="08x-xxx-xxxx" />
                    )} />
                  </Item>
                </div>
              </Section>

              <Section icon={<HomeOutlined />} title="ห้องและระยะเวลาสัญญา">
                <div className="rc-grid2">
                  <Item label="เลขห้อง" error={errors.roomNumber}>
                    <Controller name="roomNumber" control={control} render={({ field }) => (
                        <Input {...field} placeholder="เช่น 101" />
                    )} />
                  </Item>
                  <span aria-hidden="true" />
                  <Item label="วันเริ่มสัญญา" error={errors.startDate} style={{ marginBottom: 0 }}>
                    <Controller name="startDate" control={control} render={({ field }) => (
                        <DatePicker {...dateField(field)} format="DD/MM/YYYY" />
                    )} />
                  </Item>
                  <Item label="วันสิ้นสุดสัญญา" error={errors.endDate} style={{ marginBottom: 0 }}>
                    <Controller name="endDate" control={control} render={({ field }) => (
                        <DatePicker {...dateField(field)} format="DD/MM/YYYY" />
                    )} />
                  </Item>
                </div>
              </Section>

              <Section icon={<DollarOutlined />} title="ค่าใช้จ่าย">
                <div className="rc-grid2">
                  <Item label="ค่าเช่ารายเดือน (บาท)" error={errors.monthlyRent} style={{ marginBottom: 0 }}>
                    <Controller name="monthlyRent" control={control} render={({ field }) => (
                        <InputNumber {...moneyField(field)} />
                    )} />
                  </Item>
                  <Item label="ค่ามัดจำ (บาท)" error={errors.deposit} style={{ marginBottom: 0 }}>
                    <Controller name="deposit" control={control} render={({ field }) => (
                        <InputNumber {...moneyField(field)} />
                    )} />
                  </Item>
                </div>
              </Section>

              <Section icon={<EditOutlined />} title="หมายเหตุ">
                <Item label="หมายเหตุ" error={errors.remarks} style={{ marginBottom: 0 }}>
                  <Controller name="remarks" control={control} render={({ field }) => (
                      <Input.TextArea {...field} rows={4} placeholder="เงื่อนไขพิเศษ ฯลฯ (ไม่บังคับ)" />
                  )} />
                </Item>
              </Section>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" size="large" className="rc-submit" loading={isSubmitting}>
                  บันทึกสัญญาเช่า
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </ConfigProvider>
  )
}