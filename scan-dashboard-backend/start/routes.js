const Route = use('Route')

//Backend
Route.get('/graduates', 'GraduateController.show')

// API ดึงข้อมูลรายชื่อผู้รับปริญญา
Route.get('/api/graduates', 'GraduatesController.index')

// API อัปเดตสถานะ (จาก ESP32 หรือ ระบบอื่น)
Route.post('/api/graduates/update-status', 'GraduatesController.updateStatus')
