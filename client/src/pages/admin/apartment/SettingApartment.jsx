import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import addressData from '../../../../address.json'
import { addressApartmant } from '../../../service/api/apartment'
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware'
import NumericInputControllerPage from '../components/ui/NumericInputControllerPage'

const { Option } = Select

// ✅ Schema สำหรับ validation
const phoneSchema = z.object({
    type: z.enum(['office', 'mobile']),
    number: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
})

const schema = z.object({
    addressLine: z.string().min(1, 'กรุณากรอกที่อยู่'),
    phones: z
        .array(phoneSchema)
        .min(1, 'กรุณาเพิ่มเบอร์โทรอย่างน้อย 1 เบอร์'),
    province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
    amphure: z.string().min(1, 'กรุณาเลือกอำเภอ'),
    tambon: z.string().min(1, 'กรุณาเลือกตำบล'),
    zipCode: z.string().min(1, 'กรุณาระบุรหัสไปรษณีย์'),
})

function SettingApartment() {
    const { user } = persistMiddleware()

    const userId = user?.userPayLoad?.user?.id


    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            phones: [{ type: 'office', number: '' }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'phones',
    })

    const selectedProvince = watch('province')
    const selectedAmphure = watch('amphure')

    const [amphures, setAmphures] = useState([])
    const [tambons, setTambons] = useState([])

    useEffect(() => {
        const found = addressData.find((p) => p.name_th === selectedProvince)
        if (found) {
            setAmphures(found.amphure || [])
        } else {
            setAmphures([])
        }
        setTambons([])
        setValue('amphure', '')
        setValue('tambon', '')
        setValue('zipCode', '')
    }, [selectedProvince])

    useEffect(() => {
        const foundProvince = addressData.find((p) => p.name_th === selectedProvince)
        const foundAmphure = foundProvince?.amphure.find((a) => a.name_th === selectedAmphure)
        if (foundAmphure) {
            setTambons(foundAmphure.tambon || [])
        } else {
            setTambons([])
        }
        setValue('tambon', '')
        setValue('zipCode', '')
    }, [selectedAmphure])

    const onSubmit = async (data) => {

        const value = {
            profileId: userId,
            ...data
        }


        const res = await addressApartmant(data)
    }

    return (
        <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            style={{ maxWidth: 600, margin: 'auto' }}
        >
            {/* ที่อยู่ */}
            <Form.Item label="ที่อยู่ (เช่น บ้านเลขที่ ซอย ถนน)">
                <Controller
                    name="addressLine"
                    control={control}
                    render={({ field }) => (
                        <Input.TextArea
                            {...field}
                            rows={3}
                            placeholder="กรอกที่อยู่ เช่น บ้านเลขที่ ซอย ถนน"
                        />
                    )}
                />
                {errors.addressLine && (
                    <p style={{ color: 'red' }}>{errors.addressLine.message}</p>
                )}
            </Form.Item>

            {/* เบอร์โทร */}
            <Form.Item label="เบอร์โทร">
                {fields.map((field, index) => (
                    <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="start">
                        {/* Select ประเภทเบอร์ */}

                        <NumericInputControllerPage
                            type="select"
                            controllerName={`phones.${index}.type`}
                            control={control}
                            selectOptions={[
                                { value: 'office', name: 'สำนักงาน' },
                                { value: 'mobile', name: 'มือถือ' },

                            ]}
                        />

                        {/* <Controller
                            name={`phones.${index}.type`}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: 120 }}>
                                    <Option value="office">สำนักงาน</Option>
                                    <Option value="mobile">มือถือ</Option>
                                   
                                </Select>
                            )}
                        />

                        
                         */}
                        {/* Input เบอร์โทร */}
                        {/* <Controller
                            name={`phones.${index}.number`}
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder="กรอกเบอร์โทร" style={{ width: 250 }} />
                            )}
                        /> */}
                        <NumericInputControllerPage
                            type='string'
                            controllerName={`phones.${index}.number`}
                            control={control}
                            //rulesName='ราคาต้องมากกว่า 0'
                            placeholder='กรอกเบอร์โทร'
                        // prefix="฿"

                        />



                        <MinusCircleOutlined
                            onClick={() => remove(index)}
                            style={{ color: 'red', marginTop: 8 }}
                        />
                    </Space>
                ))}

                <Button
                    type="dashed"
                    onClick={() => append({ type: 'office', number: '' })}
                    block
                    icon={<PlusOutlined />}
                >
                    เพิ่มเบอร์โทร
                </Button>

                {errors.phones && (
                    <p style={{ color: 'red', marginTop: 8 }}>
                        {errors.phones.message}
                    </p>
                )}
            </Form.Item>

            {/* จังหวัด */}
            <Form.Item label="จังหวัด">
                <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            placeholder="เลือกจังหวัด"
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                option?.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {addressData.map((prov) => (
                                <Option key={prov.id} value={prov.name_th}>
                                    {prov.name_th}
                                </Option>
                            ))}
                        </Select>
                    )}
                />
                {errors.province && (
                    <p style={{ color: 'red' }}>{errors.province.message}</p>
                )}
            </Form.Item>

            {/* อำเภอ */}
            <Form.Item label="อำเภอ">
                <Controller
                    name="amphure"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            placeholder="เลือกอำเภอ"
                            disabled={!amphures.length}
                            showSearch
                            filterOption={(input, option) =>
                                option?.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {amphures.map((a) => (
                                <Option key={a.id} value={a.name_th}>
                                    {a.name_th}
                                </Option>
                            ))}
                        </Select>
                    )}
                />
                {errors.amphure && (
                    <p style={{ color: 'red' }}>{errors.amphure.message}</p>
                )}
            </Form.Item>

            {/* ตำบล */}
            <Form.Item label="ตำบล">
                <Controller
                    name="tambon"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            placeholder="เลือกตำบล"
                            disabled={!tambons.length}
                            showSearch
                            filterOption={(input, option) =>
                                option?.children.toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(val) => {
                                const zip = tambons.find((t) => t.name_th === val)?.zip_code || ''
                                field.onChange(val)
                                setValue('zipCode', zip.toString())
                            }}
                        >
                            {tambons.map((t) => (
                                <Option key={t.id} value={t.name_th}>
                                    {t.name_th}
                                </Option>
                            ))}
                        </Select>
                    )}
                />
                {errors.tambon && (
                    <p style={{ color: 'red' }}>{errors.tambon.message}</p>
                )}
            </Form.Item>

            {/* รหัสไปรษณีย์ */}
            <Form.Item label="รหัสไปรษณีย์">
                <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => <Input {...field} disabled />}
                />
                {errors.zipCode && (
                    <p style={{ color: 'red' }}>{errors.zipCode.message}</p>
                )}
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" block>
                    บันทึกข้อมูล
                </Button>
            </Form.Item>
        </Form>
    )
}

export default SettingApartment

