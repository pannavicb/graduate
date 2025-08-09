import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Typography,
} from 'antd'
import { QRCodeCanvas } from 'qrcode.react' // ✅ ใช้ QRCodeCanvas แทน QRCode

const { Title } = Typography

const UserForm = ({ onUserAdded, selectedUser, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue({
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        password: '',
      })
    } else {
      form.resetFields()
    }
  }, [selectedUser, form])

  const onFinish = async (values) => {
    setLoading(true)

    try {
      if (selectedUser) {
        const payload = {
          username: values.username,
          email: values.email,
        }
        if (values.password?.trim()) {
          payload.password = values.password
        }
        await axios.put(`http://localhost:3333/users/${selectedUser.id}`, payload)
        message.success('✅ แก้ไขผู้ใช้เรียบร้อยแล้ว')
      } else {
        await axios.post('http://localhost:3333/users', values)
        message.success('✅ เพิ่มผู้ใช้เรียบร้อยแล้ว')
        form.resetFields()
      }
      onUserAdded?.()
    } catch (err) {
      const msg = err.response?.data?.message || '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
  }

  const handleCancel = () => {
    handleReset()
    onCancel?.()
  }

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          {selectedUser ? '🛠 แก้ไขผู้ใช้งาน' : '➕ เพิ่มผู้ใช้งานใหม่'}
        </Title>
      }
      style={{ maxWidth: 600, margin: '24px auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          username: '',
          email: '',
          password: '',
        }}
      >
        <Form.Item
          label="ชื่อผู้ใช้"
          name="username"
          rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'กรุณากรอกอีเมลให้ถูกต้อง' },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>

        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[
            {
              required: !selectedUser,
              message: 'กรุณากรอกรหัสผ่าน',
            },
          ]}
          tooltip={selectedUser ? 'หากต้องการเปลี่ยนรหัสผ่าน กรุณากรอกใหม่' : ''}
        >
          <Input.Password
            placeholder={selectedUser ? 'หากต้องการเปลี่ยนรหัสผ่าน' : ''}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {selectedUser ? 'อัปเดต' : 'บันทึก'}
            </Button>
            <Button htmlType="button" onClick={handleReset} disabled={loading}>
              รีเซ็ต
            </Button>
            {selectedUser && (
              <Button htmlType="button" onClick={handleCancel} disabled={loading}>
                ยกเลิก
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      {/* QR Code สำหรับ selectedUser */}
      {selectedUser && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Title level={5}>🔲 QR Code ของผู้ใช้งาน</Title>
          <QRCodeCanvas
            value={JSON.stringify({
              id: selectedUser.id,
              username: selectedUser.username,
              email: selectedUser.email,
            })}
            size={128}
          />
          <div style={{ marginTop: 8 }}>
            <small>🆔: {selectedUser.id}</small>
          </div>
        </div>
      )}
    </Card>
  )
}

export default UserForm
