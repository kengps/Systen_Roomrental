import { InputNumber } from 'antd'
import { Controller } from 'react-hook-form'
import React from 'react'


const CustomInputController = ({ min, prefix, control, name, label, rules, errors }) => {
  return (
    <div>
      <label>{label}</label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <InputNumber
            {...field}
            style={{ width: '100%' }}
            min={min}
            prefix={prefix}
            onChange={(value) => field.onChange(value)} // update value in react-hook-form
          />
        )}
      />
      {errors[name] && <p>{errors[name].message}</p>}
    </div>



  )
}

export default CustomInputController