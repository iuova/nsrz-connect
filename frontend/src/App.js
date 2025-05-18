import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import News from './pages/News';
import Structure from './pages/Structure';
import Phonebook from './pages/Phonebook';
import Resources from './pages/Resources';
import AdminPanel from './pages/AdminPanel';
import EmployeesTab from './components/admin/EmployeesTab';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <main className="main-content">
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/news" element={<News />} />
          <Route path="/structure" element={<Structure />} />
          <Route path="/phonebook" element={<Phonebook />} />
          <Route path="/resources" element={<Resources />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div className="app">
                  <Navbar />
                  <main className="main-content">
                    <AdminPanel />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 