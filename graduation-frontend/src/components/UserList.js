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
      const data = Array.isArray(res.data.data) ? res.data.data : []
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
      key: 'index',
      render: (_, __, index) => index + 1,
      width: '5%',
      align: 'center',
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      ellipsis: true,
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      ellipsis: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-6 md:p-10 ring-1 ring-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-800 mb-6">
          รายชื่อผู้ใช้งานระบบ
        </h1>

        {/* Responsive Table Scroll */}
        <div className="overflow-x-auto">
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            loading={loading}
            onRow={(record) => ({
              onClick: () => onSelectUser?.(record),
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: '100%' }} // for responsive scroll on small screens
            size="middle"
          />
        </div>
      </div>
    </div>
  )
}

export default UserList
