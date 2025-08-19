import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Table, Tag, Typography, message, Input, Button, Switch } from 'antd';
import axios from 'axios';
import { io } from 'socket.io-client';

const { Title } = Typography;
const socket = io('http://localhost:3333');

export default function Dashboard() {
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rfidInput, setRfidInput] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalBatches, setTotalBatches] = useState(0);

  const tableRef = useRef(null);
  const intervalRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);

  // อัปเดตเวลาอัตโนมัติทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ดึงข้อมูล graduates และ batchCount จาก backend
  const fetchGraduates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3333/graduates');
      setGraduates(res.data.data);
      if (res.data.batchCount !== undefined) {
        setTotalBatches(res.data.batchCount);
      }
    } catch (err) {
      message.error('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadNextBatch = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3333/graduates/process-next-batch');
      message.success('โหลด batch ถัดไปเรียบร้อย');
      setActiveIndex(-1);
      if (res.data.batchCount !== undefined) {
        setTotalBatches(res.data.batchCount);
      }
      await fetchGraduates();
    } catch (err) {
      message.error('ไม่สามารถโหลด batch ต่อไปได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduates();

    socket.on('updateGraduate', (data) => {
      setGraduates(prev =>
        prev.map(g => (g.id === data.id ? { ...g, ...data } : g))
      );
    });

    socket.on('bulkUpdateGraduates', (data) => {
      setGraduates(data);
      setActiveIndex(-1);
    });

    socket.on('batchUpdate', (batchCount) => {
      setTotalBatches(batchCount);
    });

    return () => {
      socket.off('updateGraduate');
      socket.off('bulkUpdateGraduates');
      socket.off('batchUpdate');
    };
  }, []);

  const filteredGraduates = hideCompleted
    ? graduates.filter(g => g.status !== 'เสร็จสิ้น')
    : graduates;

  const scrollToRow = useCallback((index) => {
    if (tableRef.current && index >= 0 && index < filteredGraduates.length) {
      const container = tableRef.current.querySelector('.ant-table-body');
      if (container) {
        const rowHeight = container.scrollHeight / filteredGraduates.length;
        container.scrollTop = index * rowHeight;
      }
    }
  }, [filteredGraduates]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (autoScroll && filteredGraduates.length > 0) {
      if (activeIndexRef.current === -1) {
        setActiveIndex(0);
        scrollToRow(0);
      }
      intervalRef.current = setInterval(async () => {
        let nextIndex = activeIndexRef.current + 1;

        if (nextIndex >= filteredGraduates.length) {
          try {
            const res = await axios.post('http://localhost:3333/graduates/process-next-batch');
            if (res.data.batchCount !== undefined) setTotalBatches(res.data.batchCount);
            await fetchGraduates();
          } catch (err) {
            message.error('ไม่สามารถนำ batch ต่อไปได้');
          }
          nextIndex = 0;
        }

        setActiveIndex(nextIndex);
        scrollToRow(nextIndex);
      }, 2000);
    }

    return () => clearInterval(intervalRef.current);
  }, [autoScroll, filteredGraduates.length, scrollToRow]);

  const handleNext = () => {
    if (activeIndex + 1 < filteredGraduates.length) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      scrollToRow(next);
    }
  };

  const handlePrev = () => {
    if (activeIndex - 1 >= 0) {
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      scrollToRow(prev);
    }
  };

  const handleStop = () => setAutoScroll(false);
  const handleResume = () => setAutoScroll(true);

  const handleRfidRead = async () => {
    if (!rfidInput) return;
    try {
      await axios.post('http://localhost:3333/rfid/read', { rfid: rfidInput });
      setRfidInput('');
    } catch (err) {
      message.error(err.response?.data?.error || 'ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleResetStatus = async () => {
    try {
      await axios.post('http://localhost:3333/graduates/reset');
      message.success('รีเซ็ตสถานะสำเร็จ');
      setActiveIndex(-1);
      setTotalBatches(0);
    } catch (err) {
      message.error('ไม่สามารถรีเซ็ตสถานะได้');
    }
  };

  // คำนวณสถิติ
  const totalRead = graduates.filter(g => g.status === 'เสร็จสิ้น').length;
  const totalInProgress = graduates.filter(g => g.status !== 'เสร็จสิ้น').length;

  const columns = [
    { title: 'รหัส', dataIndex: 'student_id', key: 'student_id', width: 120 },
    { title: 'ชื่อ-นามสกุล', dataIndex: 'name', key: 'name', width: 300 },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid', render: r => r || '-', width: 200 },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: text => {
        let color = 'default';
        if (text === 'รอเข้ารับ') color = 'blue';
        else if (text === 'อยู่บนเวที') color = 'orange';
        else if (text === 'เสร็จสิ้น') color = 'green';
        return <Tag color={color} style={{ fontSize: 20, padding: '0 12px' }}>{text}</Tag>;
      },
      width: 180
    },
    {
      title: 'เวลาเรียก',
      dataIndex: 'call_time',
      key: 'call_time',
      render: t => (t ? new Date(t).toLocaleString('th-TH', { hour12: false }) : '-'),
      width: 250
    }
  ];

  return (
    <div style={{ padding: 40 }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: 16 }}>
        Graduation Queue Dashboard
      </Title>

      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
        {currentTime.toLocaleString('th-TH', { hour12: false })}
      </Title>

      {/* แสดงสถิติ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20, fontSize: 24 }}>
        <span>อ่านแล้ว: <strong>{totalRead}</strong></span>
        <span>กำลังทำงาน: <strong>{totalInProgress}</strong></span>
        <span>Batch ที่โหลด: <strong>{totalBatches}</strong></span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 30, fontSize: 20 }}>
        <Input
          placeholder="Scan RFID here"
          value={rfidInput}
          onChange={e => setRfidInput(e.target.value)}
          style={{ width: 250, height: 50, fontSize: 24 }}
        />
        <Button type="primary" onClick={handleRfidRead} style={{ height: 50, fontSize: 20 }}>Update Status</Button>
        <Button danger onClick={handleResetStatus} style={{ height: 50, fontSize: 20 }}>Reload</Button>
        <span style={{ fontSize: 20 }}>ซ่อนผู้ที่เสร็จสิ้น:</span>
        <Switch checked={hideCompleted} onChange={setHideCompleted} style={{ transform: 'scale(1.5)' }} />
        <Button onClick={handlePrev} disabled={activeIndex <= 0} style={{ height: 50, fontSize: 20 }}>Prev</Button>
        <Button onClick={handleNext} disabled={activeIndex >= filteredGraduates.length - 1} style={{ height: 50, fontSize: 20 }}>Next</Button>
        <Button onClick={handleStop} style={{ height: 50, fontSize: 20 }}>Stop</Button>
        <Button type="primary" onClick={handleResume} style={{ height: 50, fontSize: 20 }}>Resume</Button>
        <Button type="default" onClick={handleLoadNextBatch} style={{ height: 50, fontSize: 20 }}>Load Next Batch</Button>
      </div>

      {/* Table */}
      <div ref={tableRef}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredGraduates}
          loading={loading}
          pagination={false}
          scroll={{ y: 600 }}
          rowClassName={(record, index) =>
            index === activeIndex ? 'highlight-row' : ''
          }
          style={{ fontSize: 24 }}
        />
      </div>

      <style>
        {`
          .highlight-row {
            background-color: #b7eb8f !important;
            transition: background-color 0.5s;
          }
          .ant-table-cell {
            font-size: 24px !important;
            padding: 12px 16px !important;
          }
        `}
      </style>
    </div>
  );
}
