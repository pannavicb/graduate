// RfidConfirm.js
import React, { useState } from 'react'
import { Button, Input, message, Typography, Card } from 'antd'
import axios from 'axios'

const { Title } = Typography

const RfidConfirm = () => {
  const [rfid, setRfid] = useState('')
  const [loading, setLoading] = useState(false)

  const confirmGraduated = async () => {
    if (!rfid.trim()) {
      message.warning('กรุณากรอก RFID')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:3333/graduated/confirm', { rfid })
      if (res.data.status === 'success') {
        message.success(res.data.message)
        setRfid('') // เคลียร์ช่องกรอก
      } else {
        message.error(res.data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      message.error('ไม่สามารถเชื่อมต่อ API ได้')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 20,
      }}
    >
      <Card>
        <Title level={3} style={{ textAlign: 'center' }}>
          ยืนยันการเข้ารับปริญญาบัตรด้วย RFID
        </Title>
        <Input
          placeholder="กรอกหรือสแกน RFID"
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
          onPressEnter={confirmGraduated}
          disabled={loading}
          size="large"
          style={{ marginBottom: 16 }}
          autoFocus
        />
        <Button
          type="primary"
          block
          loading={loading}
          onClick={confirmGraduated}
          size="large"
        >
          ยืนยัน
        </Button>
      </Card>
    </div>
  )
}

export default RfidConfirm
