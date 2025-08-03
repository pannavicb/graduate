import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Router>
      <nav className="bg-indigo-600 p-4 text-white flex space-x-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      </nav>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </Router>
  )
}

function Home() {
  return <h2 className="text-2xl font-semibold">Welcome to Home Page</h2>
}

function Dashboard() {
  return <h2 className="text-2xl font-semibold">Welcome to Dashboard</h2>
}

export default App
