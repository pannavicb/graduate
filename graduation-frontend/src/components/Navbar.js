import React, { useState, useEffect } from 'react'
import { Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname)

  useEffect(() => {
    setCurrent(location.pathname)
  }, [location.pathname])

  const handleClick = e => {
    setCurrent(e.key)
  }

  return (
    <Menu
      onClick={handleClick}
      selectedKeys={[current]}
      mode="horizontal"
      theme="dark"
      style={{ backgroundColor: '#4f46e5' }}
    >
      <Menu.Item key="/">
        <Link to="/">หน้าแรก</Link>
      </Menu.Item>
      <Menu.Item key="/users">
        <Link to="/users">ผู้ใช้งาน</Link>
      </Menu.Item>
      <Menu.Item key="/dashboard">
        <Link to="/dashboard">แสดงรายชื่อผู้เข้ารับแบบเรียงไทม์</Link>
      </Menu.Item>
      <Menu.Item key="/graduated">
        <Link to="/graduated">แสดงรายชื่อเพื่อเข้ารับปริญญา</Link>
      </Menu.Item>
      <Menu.Item key="/manage">
        <Link to="/manage">การจัดการข้อมูล</Link>
      </Menu.Item>
      <Menu.Item key="/about">
        <Link to="/about">เกี่ยวกับ</Link>
      </Menu.Item>
    </Menu>
  )
}

export default Navbar
