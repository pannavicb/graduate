import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Button, Typography, Table, message, Tag, Space
} from 'antd';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Dashboard.css';

const { Title } = Typography;
const socket = io('http://localhost:3333');

const Dashboard = () => {
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const intervalRef = useRef(null);

  // โหลดข้อมูลบัณฑิต
  const fetchGraduates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3333/graduates');
      setGraduates(res.data.data);
      setCurrentIndex(-1);
    } catch (error) {
      console.error(error);
      message.error('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraduates();

    const handleUpdateGraduate = (data) => {
      setGraduates((prev) =>
        prev.map((g) => (g.id === data.id ? { ...g, ...data } : g))
      );
    };

    socket.on('updateGraduate', handleUpdateGraduate);

    return () => {
      socket.off('updateGraduate', handleUpdateGraduate);
    };
  }, [fetchGraduates]);

  // อัปเดตสถานะบัณฑิต
  const updateStatus = async (id, status) => {
    const call_time = new Date().toISOString();
    try {
      await axios.put(`http://localhost:3333/graduates/${id}`, { status, call_time });
      message.success('อัปเดตสถานะเรียบร้อย');
    } catch (error) {
      console.error(error);
      message.error('อัปเดตไม่สำเร็จ');
    }
  };

  // ฟังก์ชัน reset สถานะทั้งหมด
  const resetAllStatus = async () => {
    setResetting(true);
    try {
      await axios.post('http://localhost:3333/graduates/reset');
      message.success('รีเซ็ตสถานะเรียบร้อยแล้ว');
      fetchGraduates();
      setCurrentIndex(-1);
      setAutoScroll(false);
    } catch (error) {
      console.error(error);
      message.error('รีเซ็ตสถานะไม่สำเร็จ');
    } finally {
      setResetting(false);
    }
  };

  // เลื่อนบัณฑิตคนถัดไป
  const scrollNextGraduate = useCallback(async () => {
    let nextIndex = currentIndex + 1;

    if (nextIndex >= graduates.length) {
      message.info('เลื่อนถึงบัณฑิตคนสุดท้ายแล้ว');
      setAutoScroll(false);
      return;
    }

    const graduate = graduates[nextIndex];

    // อัปเดตสถานะ
    // จาก 'รอเข้ารับ' => 'อยู่บนเวที'
    // จาก 'อยู่บนเวที' => 'เสร็จสิ้น'
    // ถ้าเป็น 'เสร็จสิ้น' ข้ามไปคนถัดไปเลย
    let newStatus = graduate.status;
    if (graduate.status === 'รอเข้ารับ') newStatus = 'อยู่บนเวที';
    else if (graduate.status === 'อยู่บนเวที') newStatus = 'เสร็จสิ้น';
    else if (graduate.status === 'เสร็จสิ้น') {
      setCurrentIndex(nextIndex);
      scrollNextGraduate(); // เลื่อนต่อถัดไปถ้า status เสร็จสิ้น
      return;
    } else {
      // กรณีอื่น ๆ ตั้ง default เป็น 'อยู่บนเวที'
      newStatus = 'อยู่บนเวที';
    }

    try {
      await updateStatus(graduate.id, newStatus);
      setCurrentIndex(nextIndex);
    } catch {
      // ถ้าล้มเหลวไม่เลื่อน index
    }
  }, [currentIndex, graduates]);

  // ควบคุม Auto Scroll
  useEffect(() => {
    if (autoScroll) {
      intervalRef.current = setInterval(() => {
        scrollNextGraduate();
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoScroll, scrollNextGraduate]);

  const columns = [
    { title: 'รหัส', dataIndex: 'student_id', key: 'student_id' },
    { title: 'ชื่อ - นามสกุล', dataIndex: 'name', key: 'name' },
    {
      title: 'สถานะ', dataIndex: 'status', key: 'status',
      render: (text) => {
        let color = 'default';
        if (text === 'รอเข้ารับ') color = 'blue';
        else if (text === 'อยู่บนเวที') color = 'orange';
        else if (text === 'เสร็จสิ้น') color = 'green';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { title: 'เวลาเรียก', dataIndex: 'call_time', key: 'call_time', render: (t) => t || '-' }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Graduation Dashboard</Title>
      <Space style={{ marginBottom: 10 }}>
        <Button onClick={fetchGraduates}>โหลดข้อมูลใหม่</Button>
        <Button danger onClick={resetAllStatus} loading={resetting}>รีเซ็ตสถานะทั้งหมด</Button>
      </Space>

      <Space style={{ marginBottom: 20 }}>
        {!autoScroll && <Button onClick={() => setAutoScroll(true)}>▶️ เริ่มเลื่อนอัตโนมัติ</Button>}
        {autoScroll && <Button danger onClick={() => setAutoScroll(false)}>⏸️ หยุดเลื่อนอัตโนมัติ</Button>}
        <Button onClick={scrollNextGraduate} disabled={autoScroll}>▶️ เลื่อนทีละบรรทัด</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={graduates}
        loading={loading}
        pagination={false}
        rowClassName={(record, index) => (index === currentIndex ? 'active-row' : '')}
      />
    </div>
  );
};

export default Dashboard;
