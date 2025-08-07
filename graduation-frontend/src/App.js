// src/App.js
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import UserForm from './components/UserForm'
import UserList from './components/UserList'
import DashboardPage from './components/Dashboard' // ✅ เพิ่มการ import
import GraduatedPage from './components/GraduationPage' // ✅ เพิ่มการ import
import ImportExportPage from './components/ImportExportPage' // ✅ เพิ่มการ import


function UsersPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)

  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedUser(null)
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10 px-4 space-y-12">
      <section className="bg-white rounded-2xl shadow-lg p-8 ring-1 ring-gray-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">เพิ่มผู้ใช้งานใหม่</h2>
        <UserForm onUserAdded={handleUserAdded} selectedUser={selectedUser} />
      </section>

      <section className="bg-white rounded-2xl shadow-lg p-8 ring-1 ring-gray-200">
        <UserList refreshKey={refreshKey} onSelectUser={handleSelectUser} />
      </section>
    </div>
  )
}

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center text-3xl font-bold">
      หน้าแรกของระบบ
    </div>
  )
}

function About() {
  return (
    <div className="min-h-screen flex items-center justify-center text-3xl font-bold">
      เกี่ยวกับระบบนี้
    </div>
  )
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* ✅ เพิ่ม Route นี้ */}
        <Route path="/graduated" element={<GraduatedPage />} /> {/* ✅ เพิ่ม Route นี้ */}
         <Route path="/manage" element={<ImportExportPage />} /> {/* ✅ เพิ่ม Route นี้ */}
      </Routes>
    </Router>
  )
}

export default App
