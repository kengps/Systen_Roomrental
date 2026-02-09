import { List, Typography } from 'antd';

import dayjs from 'dayjs';


export default function PartialPaymentList({ data }) {
    return (
        <List
            itemLayout="vertical"
            dataSource={data}
            bordered
            renderItem={(item, index) => (
                <List.Item key={item._id || index}>
                    <Typography.Text strong>
                        💸 จำนวนเงิน: {item.amount.toLocaleString()} บาท
                    </Typography.Text>
                    <div>📅 วันที่จ่าย: {dayjs(item.paymentDate)}</div>
                    {item.method && <div>💳 วิธีชำระเงิน: {item.method}</div>}
                    {item.note && <div>📝 หมายเหตุ: {item.note}</div>}
                </List.Item>
            )}
        />
    );
}
