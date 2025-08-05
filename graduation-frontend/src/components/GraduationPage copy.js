import React, { useEffect, useState } from 'react'
import { Table, Card, Row, Col, Typography, message, Spin } from 'antd'
import axios from 'axios'

const { Title } = Typography

const GraduationPage = () => {
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState({
    called: 0,
    waiting: 0,
    absent: 0,     // ✅ เพิ่มค่าเริ่มต้น
    total: 0,
    users: [],
  })

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3333/dashboard')
      if (res.data?.status === 'success') {
        setDashboard(res.data.data)
      } else {
        message.error('โหลดข้อมูลไม่สำเร็จ')
      }
    } catch (err) {
      console.error(err)
      message.error('เชื่อมต่อ API ไม่ได้')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '#',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🎓 สถานะการเรียกชื่อ</Title>

      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col span={6}>
          <Card title="📋 เรียกแล้ว">
            <Title level={3} style={{ color: '#1890ff' }}>{dashboard.called}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="⏳ รอเรียก">
            <Title level={3} style={{ color: '#faad14' }}>{dashboard.waiting}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="❌ ขาดการเข้ารับ">
            <Title level={3} style={{ color: '#f5222d' }}>{dashboard.absent}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="🧾 รวมทั้งหมด">
            <Title level={3}>{dashboard.total}</Title>
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          dataSource={dashboard.users}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  )
}

export default GraduationPage
