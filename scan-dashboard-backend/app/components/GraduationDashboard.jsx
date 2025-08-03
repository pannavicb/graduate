// src/components/GraduationDashboard.jsx

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

// เปลี่ยน URL ด้านล่างเป็นของ backend จริงบนเครื่องคุณ (เช่น Raspberry Pi)
const socket = io("http://localhost:5000");

const statusColors = {
  "รอเข้ารับ": "bg-yellow-100",
  "อยู่บนเวที": "bg-blue-100",
  "รับเรียบร้อย": "bg-green-100",
  "ขาดการเข้ารับ": "bg-red-100",
};

export default function GraduationDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3333/api/graduates");
      setStudents(res.data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลนักศึกษาได้");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();

    socket.on("status_update", (data) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === data.id ? { ...s, status: data.status } : s
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">📡 Dashboard เรียลไทม์</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      {loading && students.length === 0 ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table className="w-full border border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ลำดับ (order_no)</th>
              <th className="border p-2">รหัสนักศึกษา (student_id)</th>
              <th className="border p-2">ชื่อ-สกุล (name)</th>
              <th className="border p-2">เวลาเรียก (call_time)</th>
              <th className="border p-2">สถานะ (status)</th>
              <th className="border p-2">อัพเดตล่าสุด (last_update)</th>
              <th className="border p-2">RFID</th>
              <th className="border p-2">เวลา Scan 1 (scan_time_1)</th>
              <th className="border p-2">เวลา Scan 2 (scan_time_2)</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              students.map((row) => (
                <tr key={row.id} className={statusColors[row.status] || ""}>
                  <td className="border p-2 text-center">{row.order_no}</td>
                  <td className="border p-2 text-center">{row.student_id}</td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2 text-center">{row.call_time || "-"}</td>
                  <td className="border p-2 text-center">{row.status}</td>
                  <td className="border p-2 text-center">{row.last_update || "-"}</td>
                  <td className="border p-2 text-center">{row.rfid || "-"}</td>
                  <td className="border p-2 text-center">{row.scan_time_1 || "-"}</td>
                  <td className="border p-2 text-center">{row.scan_time_2 || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
