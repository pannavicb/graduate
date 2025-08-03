import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const statusColors = {
  "รอเข้ารับ": "bg-yellow-100",
  "อยู่บนเวที": "bg-blue-100",
  "รับเรียบร้อย": "bg-green-100",
  "ขาดการเข้ารับ": "bg-red-100",
};

export default function GraduationDashboard() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error("โหลดข้อมูลผิดพลาด", err);
    }
  };

  useEffect(() => {
    fetchStudents();

    socket.on("status_update", (data) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.order_no === data.order_no ? { ...s, status: data.status } : s
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
      <table className="w-full border border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ลำดับ</th>
            <th className="border p-2">รหัสนักศึกษา</th>
            <th className="border p-2">ชื่อ-สกุล</th>
            <th className="border p-2">เวลาเรียก</th>
            <th className="border p-2">สถานะ</th>
            <th className="border p-2">อัพเดตล่าสุด</th>
            <th className="border p-2">RFID</th>
            <th className="border p-2">Scan 1</th>
            <th className="border p-2">Scan 2</th>
          </tr>
        </thead>
        <tbody>
          {students.map((row) => (
            <tr key={row.order_no} className={statusColors[row.status] || ""}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
