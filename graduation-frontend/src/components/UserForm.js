import React, { useState, useEffect } from 'react'
import axios from 'axios'

const UserForm = ({ onUserAdded, selectedUser }) => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ถ้ามี selectedUser มาให้เติมข้อมูล
  useEffect(() => {
    if (selectedUser) {
      setUsername(selectedUser.username || '')
      setEmail(selectedUser.email || '')
      setPassword('') // ไม่แสดง password เก่า, ให้กรอกใหม่ถ้าต้องการเปลี่ยน
      setError('')
      setSuccess('')
    }
  }, [selectedUser])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedUser) {
        // อัปเดต user
        await axios.put(`http://localhost:3333/users/${selectedUser.id}`, {
          username,
          email,
          password,
        })
        setSuccess('แก้ไขผู้ใช้เรียบร้อยแล้ว')
      } else {
        // สร้าง user ใหม่
        await axios.post('http://localhost:3333/users', {
          username,
          email,
          password,
        })
        setSuccess('เพิ่มผู้ใช้เรียบร้อยแล้ว')
      }
      setError('')
      if (onUserAdded) onUserAdded()
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      setSuccess('')
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-indigo-700 mb-4">{selectedUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">อีเมล</label>
          <input
            type="email"
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">รหัสผ่าน</label>
          <input
            type="password"
            className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={selectedUser ? "กรอกใหม่ถ้าต้องการเปลี่ยน" : ""}
            required={!selectedUser} // ต้องกรอกถ้าเป็นการเพิ่ม user ใหม่
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {selectedUser ? 'อัปเดต' : 'บันทึก'}
        </button>
        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  )
}

export default UserForm
