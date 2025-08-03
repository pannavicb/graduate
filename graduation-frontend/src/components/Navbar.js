import React from 'react'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Menu className="w-6 h-6 sm:hidden" />
            <span className="text-lg sm:text-xl font-bold">ระบบจัดการผู้ใช้งาน</span>
          </div>

          <div className="hidden sm:flex space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition">หน้าแรก</Link>
            <Link to="/users" className="hover:text-yellow-300 transition">ผู้ใช้งาน</Link>
            <Link to="/about" className="hover:text-yellow-300 transition">เกี่ยวกับ</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
