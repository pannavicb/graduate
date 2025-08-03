import React, { useEffect, useState } from 'react'
import axios from 'axios'

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3333/users')
      .then(response => {
        setUsers(response.data)
      })
      .catch(error => {
        console.error('Error fetching users:', error)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 ring-1 ring-gray-200">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">รายชื่อผู้ใช้งานระบบ</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">ชื่อผู้ใช้</th>
                <th className="px-4 py-3 text-left font-semibold">อีเมล</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-indigo-50 transition duration-200 cursor-pointer"
                    onClick={() => onSelectUser(user)}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-6 text-center text-gray-500 italic">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UserList
