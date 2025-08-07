import React, { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Table,
  message,
  Spin,
  Tag,
  Space,
  Select,
} from 'antd'
import axios from 'axios'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

const formatDateTimeThai = (date) => {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  const day = date.getDate()
  const month = thaiMonths[date.getMonth()]
  const year = date.getFullYear() + 543
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${day} ${month} ${year} เวลา ${hours}:${minutes}:${seconds}`
}

const CurrentDateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Text type="secondary" style={{ fontSize: 16 }}>
      {formatDateTimeThai(currentDateTime)}
    </Text>
  )
}

const Dashboard = () => {
  const [graduates, setGraduates] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    waiting: 0,
    called_stage: 0,
    called_done: 0,
    absent: 0,
    total: 0,
  })

  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(3000)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const fetchGraduates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3333/graduates')
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data
      if (Array.isArray(data)) {
        setGraduates(data)
        calculateSummary(data)
        setCurrentIndex(-1)
        setCurrentPage(0)
      } else {
        message.error('โหลดข้อมูลไม่สำเร็จ')
      }
    } catch (err) {
      console.error(err)
      message.error('ไม่สามารถเชื่อมต่อ API ได้')
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateSummary = (data) => {
    let waiting = 0, called_stage = 0, called_done = 0, absent = 0
    data.forEach(({ status }) => {
      switch (status) {
        case 'รอเข้ารับ': waiting++; break
        case 'อยู่บนเวที': called_stage++; break
        case 'รับเรียบร้อย': called_done++; break
        case 'ขาด': absent++; break
        default: break
      }
    })
    setSummary({ waiting, called_stage, called_done, absent, total: data.length })
  }

  useEffect(() => {
    fetchGraduates()
    const interval = setInterval(fetchGraduates, 10000)
    return () => clearInterval(interval)
  }, [fetchGraduates])

  const totalPages = Math.ceil(graduates.length / pageSize)
  const currentPageData = graduates.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  useEffect(() => {
    if (!autoScroll) return undefined
    if (graduates.length === 0) return undefined

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = currentPageData.length - 1
        let nextIndex = prevIndex + 1

        let nextPage = currentPage

        if (nextIndex > maxIndex) {
          nextPage = currentPage + 1
          if (nextPage >= totalPages) nextPage = 0
          setCurrentPage(nextPage)
          nextIndex = 0
        }

        setGraduates((prevGrads) => {
          const globalIndex = nextPage * pageSize + nextIndex
          if (globalIndex >= prevGrads.length) return prevGrads

          const newGrads = [...prevGrads]
          const nowStr = formatDateTimeThai(new Date())
          newGrads[globalIndex] = {
            ...newGrads[globalIndex],
            call_time: nowStr,
            status: 'อยู่บนเวที',
          }
          return newGrads
        })

        return nextIndex
      })
    }, scrollSpeed)

    return () => clearInterval(timer)
  }, [autoScroll, scrollSpeed, graduates.length, currentPage, currentPageData.length, pageSize, totalPages])

  const handleExport = () => {
    if (!graduates.length) return message.warning('ไม่มีข้อมูลให้ Export')
    const csv = Papa.unparse(graduates)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `graduates_export_${Date.now()}.csv`)
  }

  const getStatusTag = (status) => {
    switch (status) {
      case 'รอเข้ารับ': return <Tag color="green">รอเรียก</Tag>
      case 'อยู่บนเวที': return <Tag color="blue">อยู่บนเวที</Tag>
      case 'รับเรียบร้อย': return <Tag color="cyan">เข้ารับเรียบร้อย</Tag>
      case 'ขาด': return <Tag color="red">ขาด</Tag>
      default: return <Tag>{status || 'ไม่ระบุ'}</Tag>
    }
  }

  const rowClassName = (record, index) => (index === currentIndex ? 'highlight-row' : '')

  const columns = [
    {
      title: '#',
      render: (_, __, index) => currentPage * pageSize + index + 1,
      key: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: 'รหัสนักศึกษา',
      dataIndex: 'student_id',
      key: 'student_id',
      align: 'center',
      width: 120,
    },
    {
      title: 'ชื่อ - นามสกุล',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      align: 'center',
      width: 140,
    },
    {
      title: 'เวลาที่ถูกเรียก',
      dataIndex: 'call_time',
      key: 'call_time',
      align: 'center',
      render: (text) => text || '-',
      width: 180,
    },
  ]

  const academicYear = new Date().getFullYear() + 543

  const onPageSizeChange = (value) => {
    setPageSize(value)
    setCurrentPage(0)
    setCurrentIndex(-1)
  }

  return (
    <>
      <style>{`
        .highlight-row {
          background-color: #d6f5d6 !important;
          transition: background-color 0.5s ease;
        }
        @media (max-width: 576px) {
          .ant-table {
            font-size: 12px;
          }
          .ant-table-cell {
            padding: 8px 4px;
            white-space: nowrap;
          }
          .ant-btn {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
      `}</style>

      <div
        style={{
          padding: 24,
          maxWidth: 1200,
          margin: 'auto',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          fontFamily: "'Sarabun', 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={1}>🎓 Graduation Dashboard</Title>
          <Title level={3}>ปีการศึกษา {academicYear - 1}</Title>
          <CurrentDateTime />
          <Paragraph style={{ marginTop: 16 }}>
            ระบบแสดงสถานะการเรียกชื่อเข้ารับปริญญาแบบเรียลไทม์ (รีเฟรชอัตโนมัติทุก 10 วินาที)
          </Paragraph>
        </div>

        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 32 }}>
          {[
            { label: '⏳ รอเรียก', dataKey: 'waiting', color: '#52c41a' },
            { label: '📋 อยู่บนเวที', dataKey: 'called_stage', color: '#1890ff' },
            { label: '✅ เข้ารับเรียบร้อย', dataKey: 'called_done', color: '#13c2c2' },
            { label: '❌ ขาดการเข้ารับ', dataKey: 'absent', color: '#f5222d' },
            { label: '🧾 รวมทั้งหมด', dataKey: 'total', color: '#333' },
          ].map(({ label, dataKey, color }) => (
            <Col xs={24} sm={12} md={8} lg={6} key={dataKey}>
              <Card title={label} bordered={false}>
                <Title level={3} style={{ color, textAlign: 'center' }}>
                  {summary[dataKey]}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space size="middle" wrap>
            <Button type="primary" onClick={() => message.info('เรียกชื่อถัดไป')}>
              📢 เรียกชื่อถัดไป
            </Button>
            <Button onClick={fetchGraduates}>🔄 โหลดข้อมูลใหม่</Button>

            <Button
              type={autoScroll ? 'danger' : 'primary'}
              onClick={() => setAutoScroll((prev) => !prev)}
            >
              {autoScroll ? '⏸️ หยุดเลื่อนอัตโนมัติ' : '▶️ เริ่มเลื่อนอัตโนมัติ'}
            </Button>

            <Select
              value={scrollSpeed}
              onChange={(value) => setScrollSpeed(value)}
              style={{ width: 180 }}
            >
              <Option value={1000}>1 วินาที</Option>
              <Option value={2000}>2 วินาที</Option>
              <Option value={3000}>3 วินาที</Option>
              <Option value={5000}>5 วินาที</Option>
            </Select>

            <Select
              value={pageSize}
              onChange={onPageSizeChange}
              style={{ width: 120 }}
            >
              {[5, 10, 20, 50].map((size) => (
                <Option key={size} value={size}>
                  {size} แถว
                </Option>
              ))}
            </Select>

            <Button onClick={handleExport} type="default">
              📤 Export CSV
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={currentPageData}
            pagination={false}
            rowClassName={rowClassName}
            rowKey={(record, index) =>
              record.id || record.student_id || `row-${currentPage * pageSize + index}`
            }
            bordered
            scroll={{ x: 700 }}
          />
        </Spin>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            disabled={currentPage === 0}
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 0))
              setCurrentIndex(-1)
            }}
            style={{ marginRight: 8 }}
          >
            ◀️ ก่อนหน้า
          </Button>
          <Text>
            หน้า {currentPage + 1} / {totalPages || 1}
          </Text>
          <Button
            disabled={currentPage + 1 >= totalPages}
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              setCurrentIndex(-1)
            }}
            style={{ marginLeft: 8 }}
          >
            ถัดไป ▶️
          </Button>
        </div>
      </div>
    </>
  )
}

export default Dashboard
