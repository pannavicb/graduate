import React from 'react'
import { Card, Row, Col, Button, Typography } from 'antd'

const { Title, Paragraph } = Typography

const Dashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🎓 Graduation Dashboard</Title>
      <Paragraph>ระบบแสดงสถานะการเรียกชื่อเข้ารับปริญญาแบบเรียลไทม์</Paragraph>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card title="📋 ผู้ที่ถูกเรียกแล้ว" bordered={false}>
            <Title level={3} style={{ color: '#1890ff' }}>124</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="⏳ รอเรียก" bordered={false}>
            <Title level={3} style={{ color: '#52c41a' }}>36</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="🧾 ทั้งหมด" bordered={false}>
            <Title level={3}>160</Title>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 32 }}>
        <Button type="primary" size="large">
          เรียกชื่อถัดไป
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
