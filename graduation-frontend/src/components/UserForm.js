import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Form, Input, Button, Alert, Space } from 'antd'

const UserForm = ({ onUserAdded, selectedUser, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue({
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        password: '',
      })
      setSuccess('')
      setError('')
    } else {
      form.resetFields()
      setSuccess('')
      setError('')
    }
  }, [selectedUser, form])

  const onFinish = async (values) => {
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      if (selectedUser) {
        const payload = {
          username: values.username,
          email: values.email,
        }
        if (values.password && values.password.trim() !== '') {
          payload.password = values.password
        }
        await axios.put(`http://localhost:3333/users/${selectedUser.id}`, payload)
        setSuccess('แก้ไขผู้ใช้เรียบร้อยแล้ว')
      } else {
        await axios.post('http://localhost:3333/users', values)
        setSuccess('เพิ่มผู้ใช้เรียบร้อยแล้ว')
        form.resetFields()
      }
      if (onUserAdded) onUserAdded()
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setSuccess('')
    setError('')
  }

  const handleCancel = () => {
    handleReset()
    if (onCancel) onCancel()
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-indigo-700 mb-4">
        {selectedUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
      </h2>

      {success && <Alert message={success} type="success" showIcon closable onClose={() => setSuccess('')} />}
      {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />}

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
          tooltip={selectedUser ? 'กรอกใหม่ถ้าต้องการเปลี่ยนรหัสผ่าน' : ''}
        >
          <Input.Password placeholder={selectedUser ? 'กรอกใหม่ถ้าต้องการเปลี่ยน' : ''} disabled={loading} />
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
    </div>
  )
}

export default UserForm
