import { Input, InputNumber, Select } from 'antd';
import { Controller } from 'react-hook-form';
const { Option } = Select;

const NumericInputControllerPage = ({ type, controllerName, control, rulesName, placeholder, prefix, addonAfter, size, selectOptions }) => {


    return (
        <div>
            {type === 'string' && (
                <Controller
                    name={controllerName}
                    control={control}
                    rules={{ required: { rulesName } }}
                    render={({ field }) => <Input {...field} placeholder={placeholder} />}
                />
            )}

            {type === 'number' && (
                <Controller
                    name={controllerName}
                    control={control}
                    rules={{ min: { value: 1, message: rulesName } }}
                    render={({ field }) => <InputNumber
                        min={0}{...field}
                        addonAfter={addonAfter}
                        size={size}
                        prefix={prefix}
                        style={{ width: '100%' }}

                        onKeyDown={(event) => {
                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                            const isCtrlCmd = event.ctrlKey || event.metaKey; // Ctrl หรือ Cmd

                            // อนุญาต Ctrl/Cmd + (C, V, X, A)
                            if (isCtrlCmd && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                                return; // อนุญาตให้ทำงานตามปกติ
                            }

                            // ถ้าไม่ใช่เลข และไม่ใช่ปุ่มที่อนุญาตอื่น ๆ บล็อคการพิมพ์
                            if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
                                event.preventDefault();
                            }
                        }}

                        onPaste={(event) => {
                            const pasteData = event.clipboardData.getData('text');
                            if (!/^\d+$/.test(pasteData)) {
                                event.preventDefault();
                            }
                        }}

                    />}
                />
            )}
            {type === 'select' && (
                <Controller
                    name={controllerName}
                    control={control}
                    rules={{ required: { value: true, message: rulesName } }}
                    render={({ field }) => (
                        <Select {...field} placeholder={placeholder}>
                            {selectOptions?.map((item, index) => (
                                <Option key={index} value={item.value}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    )}
                />
            )}


        </div>
    )
}

export default NumericInputControllerPage