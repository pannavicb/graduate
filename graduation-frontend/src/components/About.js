import React from 'react'
import 'antd/dist/reset.css' // สำหรับ antd v5 ขึ้นไป

import { Typography, Card, Space } from 'antd'

const { Title, Paragraph } = Typography

const Home = () => {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <Card>
        <Typography>
          <Title level={2} style={{ color: '#1890ff' }}>
            ระบบจัดการผู้ใช้งาน
          </Title>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Paragraph>
              ยินดีต้อนรับสู่ระบบจัดการผู้ใช้งาน ที่ช่วยให้คุณสามารถบริหารจัดการข้อมูลผู้ใช้ได้อย่างง่ายดายและมีประสิทธิภาพ
            </Paragraph>
            <Paragraph>
              ระบบนี้รองรับการเพิ่ม แก้ไข และลบผู้ใช้งาน รวมถึงแสดงรายการผู้ใช้ทั้งหมดอย่างชัดเจน พร้อมฟีเจอร์การค้นหาและจัดการข้อมูลแบบครบวงจร
            </Paragraph>
            <Paragraph>
              คุณสามารถเริ่มต้นได้ทันทีจากเมนูด้านบน เพื่อเพิ่มผู้ใช้งานใหม่ หรือดูรายละเอียดผู้ใช้งานที่มีอยู่ในระบบ
            </Paragraph>
          </Space>
        </Typography>
      </Card>
    </div>
  )
}

export default Home
