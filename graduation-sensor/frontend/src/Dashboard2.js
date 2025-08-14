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

  const tableRef = useRef(null);
  const intervalRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);

  // Sync activeIndexRef with activeIndex
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Fetch graduates
  const fetchGraduates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3333/graduates');
      setGraduates(res.data.data);
    } catch (err) {
      message.error('โหลดข้อมูลไม่สำเร็จ');
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
    });

    return () => {
      socket.off('updateGraduate');
      socket.off('bulkUpdateGraduates');
    };
  }, []);

  const filteredGraduates = hideCompleted
    ? graduates.filter(g => g.status !== 'เสร็จสิ้น')
    : graduates;

  // Scroll to specific row
  const scrollToRow = useCallback((index) => {
    if (tableRef.current && index >= 0 && index < filteredGraduates.length) {
      const container = tableRef.current.querySelector('.ant-table-body');
      if (container) {
        const rowHeight = container.scrollHeight / filteredGraduates.length;
        container.scrollTop = index * rowHeight;
      }
    }
  }, [filteredGraduates]);

  // Auto scroll effect
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (autoScroll && filteredGraduates.length > 0) {
      if (activeIndexRef.current === -1) {
        setActiveIndex(0);
        scrollToRow(0);
      }
      intervalRef.current = setInterval(() => {
        if (activeIndexRef.current + 1 < filteredGraduates.length) {
          const next = activeIndexRef.current + 1;
          setActiveIndex(next);
          scrollToRow(next);
        } else {
          clearInterval(intervalRef.current); // stop at last row
        }
      }, 2000);
    }

    return () => clearInterval(intervalRef.current);
  }, [autoScroll, filteredGraduates.length, scrollToRow]);

  // Manual controls
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

  const handleStop = () => {
    setAutoScroll(false);
  };

  const handleResume = () => {
    setAutoScroll(true);
  };

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
    } catch (err) {
      message.error('ไม่สามารถรีเซ็ตสถานะได้');
    }
  };

  const columns = [
    { title: 'รหัส', dataIndex: 'student_id', key: 'student_id' },
    { title: 'ชื่อ-นามสกุล', dataIndex: 'name', key: 'name' },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid', render: r => r || '-' },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: text => {
        let color = 'default';
        if (text === 'รอเข้ารับ') color = 'blue';
        else if (text === 'อยู่บนเวที') color = 'orange';
        else if (text === 'เสร็จสิ้น') color = 'green';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'เวลาเรียก',
      dataIndex: 'call_time',
      key: 'call_time',
      render: t => (t ? new Date(t).toLocaleString() : '-')
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
        Graduation Queue Dashboard
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <Input
          placeholder="Scan RFID here"
          value={rfidInput}
          onChange={e => setRfidInput(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleRfidRead}>Update Status</Button>
        <Button danger onClick={handleResetStatus}>Reload</Button>
        <span>ซ่อนผู้ที่เสร็จสิ้น:</span>
        <Switch checked={hideCompleted} onChange={setHideCompleted} />
        <Button onClick={handlePrev} disabled={activeIndex <= 0}>Prev</Button>
        <Button onClick={handleNext} disabled={activeIndex >= filteredGraduates.length - 1}>Next</Button>
        <Button onClick={handleStop}>Stop</Button>
        <Button type="primary" onClick={handleResume}>Resume</Button>
      </div>

      <div ref={tableRef}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredGraduates}
          loading={loading}
          pagination={false}
          rowClassName={(record, index) =>
            index === activeIndex ? 'highlight-row' : ''
          }
        />
      </div>

      <style>
        {`
          .highlight-row {
            background-color: #b7eb8f !important;
            transition: background-color 0.5s;
          }
        `}
      </style>
    </div>
  );
}
