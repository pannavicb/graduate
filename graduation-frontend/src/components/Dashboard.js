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
  Modal,
} from 'antd'
import axios from 'axios'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
// import Barcode from 'react-barcode'
// import { QRCode } from 'qrcode.react'
import QRCode from 'qrcode.react'

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
  const [selectedRowKey, setSelectedRowKey] = useState(null)
  const [isEndReached, setIsEndReached] = useState(false)

  // Modal for showing graduate details
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState(null)

  // Modal for editing status manually
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [statusModalData, setStatusModalData] = useState(null)
  const [statusModalValue, setStatusModalValue] = useState(null)

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
        setIsEndReached(false)
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

  const totalPages = Math.ceil(graduates.length / pageSize)
  const currentPageData = graduates.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  const callNextGraduate = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = currentPageData.length - 1
      let nextIndex = prevIndex + 1
      let nextPage = currentPage

      if (nextIndex > maxIndex) {
        nextPage = currentPage + 1 >= totalPages ? 0 : currentPage + 1
        nextIndex = 0
      }

      const globalIndex = nextPage * pageSize + nextIndex
      const isLastRow = globalIndex === graduates.length - 1
      const isLastPage = nextPage === totalPages - 1

      if (isLastPage && isLastRow) {
        setIsEndReached(true)
        setAutoScroll(false)
        message.info('🎉 สิ้นสุดข้อมูลแล้ว')
        return prevIndex
      }

      const newGrads = [...graduates]
      const nowStr = formatDateTimeThai(new Date())
      newGrads[globalIndex] = {
        ...newGrads[globalIndex],
        call_time: nowStr,
        status: 'กำลังเข้ารับ',
      }
      setGraduates(newGrads)
      setCurrentPage(nextPage)
      return nextIndex
    })
  }, [graduates, currentPage, currentPageData.length, pageSize, totalPages])

  useEffect(() => {
    fetchGraduates()
  }, [fetchGraduates])

  useEffect(() => {
    if (!autoScroll || graduates.length === 0) return undefined

    const timer = setInterval(() => {
      callNextGraduate()
    }, scrollSpeed)

    return () => clearInterval(timer)
  }, [autoScroll, scrollSpeed, callNextGraduate, graduates.length])

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
      case 'ขาด': return <Tag color="red">ขาดการเข้ารับ</Tag>
      default: return <Tag>{status || 'ไม่ระบุ'}</Tag>
    }
  }

  const rowClassName = (record, index) => (index === currentIndex ? 'highlight-row' : '')

  const updateStatus = (newStatus) => {
    if (selectedRowKey === null) return

    const globalIndex = currentPage * pageSize + (selectedRowKey % pageSize)
    if (globalIndex >= graduates.length) return

    const nowStr = formatDateTimeThai(new Date())
    const newGrads = [...graduates]

    newGrads[globalIndex] = {
      ...newGrads[globalIndex],
      call_time: nowStr,
      status: newStatus,
    }

    setGraduates(newGrads)
    calculateSummary(newGrads)
    setSelectedRowKey(null)
  }

  // Update status manually via modal
  const saveStatusModal = () => {
    if (!statusModalValue) {
      message.error('กรุณาเลือกสถานะ')
      return
    }
    setGraduates((prev) => {
      const newGrads = [...prev]
      const index = newGrads.findIndex(g => g.student_id === statusModalData.student_id)
      if (index !== -1) {
        newGrads[index] = {
          ...newGrads[index],
          status: statusModalValue,
          call_time: statusModalValue === 'รอเข้ารับ' ? null : formatDateTimeThai(new Date()),
        }
      }
      calculateSummary(newGrads)
      return newGrads
    })
    setStatusModalVisible(false)
  }

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
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setModalData(record)
            setModalVisible(true)
          }}
        >
          {text}
        </Button>
      ),
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
      align: 'center',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setStatusModalData(record)
            setStatusModalValue(record.status)
            setStatusModalVisible(true)
          }}
        >
          {getStatusTag(text)}
        </Button>
      ),
    },
    {
      title: 'เวลาที่ถูกเรียก',
      dataIndex: 'call_time',
      key: 'call_time',
      align: 'center',
      render: (text) => text || '-',
    },
  ]

  const academicYear = new Date().getFullYear() + 543

  const onPageSizeChange = (value) => {
    setPageSize(value)
    setCurrentPage(0)
    setCurrentIndex(-1)
    setIsEndReached(false)
  }

  return (
    <>
      <style>{`
        .highlight-row {
          background-color: #d6f5d6 !important;
          transition: background-color 0.5s ease;
        }
        @media screen and (max-width: 768px) {
          .ant-table {
            font-size: 13px;
          }
        }
      `}</style>

      <div
        style={{
          padding: '2rem 1rem',
          maxWidth: '100%',
          margin: '0 auto',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          fontFamily: "'Sarabun', 'Segoe UI', sans-serif",
          fontSize: '110%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={1}>🎓 Graduation Dashboard</Title>
          <Title level={3}>ปีการศึกษา {academicYear - 1}</Title>
          <CurrentDateTime />
          <Paragraph style={{ marginTop: 16 }}>
            แสดงรายชื่อสถานะการเรียกชื่อเข้ารับปริญญา
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
              <Card title={label} bordered={false} style={{ width: '100%' }}>
                <Title level={3} style={{ color, textAlign: 'center' }}>
                  {summary[dataKey]}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space size="middle" wrap style={{ justifyContent: 'center', width: '100%' }}>
            <Button
              type="primary"
              onClick={callNextGraduate}
              disabled={graduates.length === 0 || isEndReached}
            >
              📢 เรียกชื่อถัดไป
            </Button>
            <Button onClick={fetchGraduates}>🔄 โหลดข้อมูลใหม่</Button>

            <Button
              type={autoScroll ? 'danger' : 'primary'}
              onClick={() => {
                if (isEndReached) {
                  message.info('🎉 สิ้นสุดข้อมูลแล้ว ไม่สามารถเลื่อนต่อได้')
                  return
                }
                setAutoScroll((prev) => !prev)
              }}
            >
              {autoScroll ? '⏸️ หยุดเลื่อนอัตโนมัติ' : '▶️ เริ่มเลื่อนอัตโนมัติ'}
            </Button>

            <Select
              value={scrollSpeed}
              onChange={(value) => setScrollSpeed(value)}
              style={{ width: 180 }}
            >
              <Option value={700}>0.7 วินาที</Option>
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
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedRowKey !== null ? [selectedRowKey] : [],
              onChange: (selectedKeys) => {
                setSelectedRowKey(selectedKeys[0])
              },
            }}
            rowKey={(record, index) =>
              record.id || record.student_id || `row-${currentPage * pageSize + index}`
            }
            bordered
            scroll={{ x: 'max-content' }}
          />
        </Spin>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            disabled={currentPage === 0}
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 0))
              setCurrentIndex(-1)
              setIsEndReached(false)
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
              setIsEndReached(false)
            }}
            style={{ marginLeft: 8 }}
          >
            ถัดไป ▶️
          </Button>
        </div>

        {isEndReached && (
          <div style={{ textAlign: 'center', marginTop: 16, color: '#f5222d', fontWeight: 'bold' }}>
            🎉 สิ้นสุดข้อมูลแล้ว
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space size="middle" wrap>
            <Button onClick={() => updateStatus('รอเข้ารับ')} disabled={selectedRowKey === null}>
              ⏳ รอเรียก
            </Button>
            <Button onClick={() => updateStatus('อยู่บนเวที')} disabled={selectedRowKey === null}>
              📋 อยู่บนเวที
            </Button>
            <Button onClick={() => updateStatus('รับเรียบร้อย')} disabled={selectedRowKey === null}>
              ✅ เข้ารับเรียบร้อย
            </Button>
            <Button danger onClick={() => updateStatus('ขาด')} disabled={selectedRowKey === null}>
              ❌ ขาดการเข้ารับ
            </Button>
          </Space>
        </div>
      </div>

      {/* Modal แสดงรายละเอียด */}
      <Modal
        title="รายละเอียดนักศึกษา"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            ปิด
          </Button>,
        ]}
        centered
      >
        {modalData ? (
          <div style={{ textAlign: 'center' }}>
            {/* <Barcode value={modalData.student_id || ''} /> */}
            <QRCode value={modalData.student_id || ''} size={150} style={{ marginTop: 16 }} />
            <Title level={4} style={{ marginTop: 16, marginBottom: 12 }}>
              {modalData.name}
            </Title>
            <Text strong>รหัสนักศึกษา:</Text> <Text>{modalData.student_id}</Text>
            <br />
            <Text strong>สถานะ:</Text> <Text>{modalData.status}</Text>
            <br />
            <Text strong>เวลาที่ถูกเรียก:</Text> <Text>{modalData.call_time || '-'}</Text>
          </div>
        ) : (
          <Text>ไม่มีข้อมูล</Text>
        )}
      </Modal>

      {/* Modal แก้ไขสถานะแบบ manual */}
      <Modal
        title="แก้ไขสถานะนักศึกษา"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={saveStatusModal}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
      >
        <Select
          style={{ width: '100%' }}
          value={statusModalValue}
          onChange={setStatusModalValue}
          placeholder="เลือกสถานะ"
        >
          <Option value="รอเข้ารับ">รอเข้ารับ</Option>
          <Option value="อยู่บนเวที">อยู่บนเวที</Option>
          <Option value="รับเรียบร้อย">รับเรียบร้อย</Option>
          <Option value="ขาด">ขาด</Option>
        </Select>
      </Modal>
    </>
  )
}

export default Dashboard
