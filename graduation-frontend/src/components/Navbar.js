import React, { useState } from 'react'
import { Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname)

  const handleClick = e => {
    setCurrent(e.key)
  }

  return (
    <Menu
      onClick={handleClick}
      selectedKeys={[current]}
      mode="horizontal"
      theme="dark"
      style={{ backgroundColor: '#4f46e5' }} // ใช้สี Indigo จาก Tailwind ตัวอย่าง
    >
      <Menu.Item key="/">
        <Link to="/">หน้าแรก</Link>
      </Menu.Item>
      <Menu.Item key="/users">
        <Link to="/users">ผู้ใช้งาน</Link>
      </Menu.Item>
      <Menu.Item key="/about">
        <Link to="/about">เกี่ยวกับ</Link>
      </Menu.Item>
    </Menu>
  )
}

export default Navbar
