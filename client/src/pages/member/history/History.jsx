import { Button } from 'antd';
import React from 'react'
import { useNavigate } from 'react-router-dom'

const History = () => {
    const navigate = useNavigate();
    return (
        <div>

            <Button onClick={() => navigate('/member/payments/history/2')}>fsdfaszdf</Button>
        </div>
    )
}

export default History