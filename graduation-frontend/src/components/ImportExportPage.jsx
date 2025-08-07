// src/pages/ImportExportPage.jsx
import React, { useState } from 'react'
import {
  Typography,
  Upload,
  Button,
  message,
  Space,
  Card,
} from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'

const { Title, Paragraph } = Typography

const ImportExportPage = () => {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)

    try {
      const res = await axios.post('http://localhost:3333/graduates/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      message.success(res.data.message || 'นำเข้าข้อมูลสำเร็จ')
    } catch (err) {
      console.error(err)
      message.error('ไม่สามารถนำเข้าข้อมูลได้')
    } finally {
      setUploading(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await axios.get('http://localhost:3333/graduates')
      const data = res.data?.data || res.data

      if (!Array.isArray(data) || data.length === 0) {
        return message.warning('ไม่มีข้อมูลให้ Export')
      }

      const csv = Papa.unparse(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `graduates_export_${Date.now()}.csv`)
    } catch (error) {
      console.error(error)
      message.error('ไม่สามารถนำออกข้อมูลได้')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <Card>
        <Title level={2}>🗂️ จัดการข้อมูลผู้เข้ารับปริญญา</Title>
        <Paragraph>คุณสามารถนำเข้า (Import) และส่งออก (Export) ข้อมูลไฟล์ .CSV ได้จากหน้านี้</Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Upload
            customRequest={({ file }) => handleUpload(file)}
            accept=".csv"
            showUploadList={false}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={uploading}
            >
              📤 นำเข้าไฟล์ CSV
            </Button>
          </Upload>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            type="default"
          >
            📥 ส่งออกไฟล์ CSV
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default ImportExportPage
