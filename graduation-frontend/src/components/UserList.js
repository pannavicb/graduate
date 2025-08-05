// src/components/UserList.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, message } from 'antd'

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3333/users')
      const rawData = res.data
      const data = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData.users)
        ? rawData.users
        : []
      setUsers(data)
    } catch (error) {
      console.error('โหลดข้อมูลผิดพลาด:', error)
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: '5%',
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
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 ring-1 ring-gray-200">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">รายชื่อผู้ใช้งานระบบ</h1>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => onSelectUser && onSelectUser(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  )
}

export default UserList
