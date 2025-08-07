import React, { useState, useEffect } from 'react'
import { Menu, Drawer, Button } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { MenuOutlined } from '@ant-design/icons'

const Navbar = () => {
  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname)
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setCurrent(location.pathname)
  }, [location.pathname])

  // ตรวจสอบหน้าจอเล็กหรือไม่
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleClick = e => {
    setCurrent(e.key)
    if (isMobile) {
      setVisible(false) // ปิด Drawer เมื่อเลือกเมนูบนมือถือ
    }
  }

  const menuItems = (
    <Menu
      onClick={handleClick}
      selectedKeys={[current]}
      mode={isMobile ? 'vertical' : 'horizontal'}
      theme="dark"
      style={{ backgroundColor: '#4f46e5', borderBottom: 'none' }}
    >
      <Menu.Item key="/home">
        <Link to="/home">หน้าแรก</Link>
      </Menu.Item>
      <Menu.Item key="/users">
        <Link to="/users">ผู้ใช้งาน</Link>
      </Menu.Item>
      <Menu.Item key="/dashboard">
        <Link to="/dashboard">รายชื่อผู้เขารับปริญญาเรียลไทม์</Link>
      </Menu.Item>
      <Menu.Item key="/graduated">
        <Link to="/graduated">ขานชื่อผู้เข้ารับปริญญา</Link>
      </Menu.Item>
      <Menu.Item key="/manage">
        <Link to="/manage">การจัดการข้อมูล</Link>
      </Menu.Item>
      <Menu.Item key="/about">
        <Link to="/about">เกี่ยวกับ</Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <nav style={{ position: 'relative' }}>
      {isMobile ? (
        <>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => setVisible(true)}
            style={{
              backgroundColor: '#4f46e5',
              borderColor: '#4f46e5',
              margin: 8,
            }}
          />
          <Drawer
            title="เมนู"
            placement="left"
            onClose={() => setVisible(false)}
            visible={visible}
            bodyStyle={{ padding: 0 }}
            headerStyle={{ backgroundColor: '#4f46e5', color: 'white' }}
            closable={true}
          >
            {menuItems}
          </Drawer>
        </>
      ) : (
        menuItems
      )}
    </nav>
  )
}

export default Navbar
