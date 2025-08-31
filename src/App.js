import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Permissions from './pages/Permissions';
import Dashboard from './pages/Dashboard';
import CompanyManagement from './pages/CompanyManagement';
import UserManagement from './pages/UserManagement';
import ProjectManagement from './pages/ProjectManagement';
import TicketManagement from './pages/TicketManagement';
import TicketDetail from './pages/TicketDetails/TicketDetail';
import AddPO from './pages/PO/AddPO';
// import {ViewPO} from './pages/PO/ViewPO';
import CreateInvoice from './pages/Invoice/CreateInvoice';
import AddInvoice from './pages/Invoice/AddInvoice';
import ViewInvoice from './pages/Invoice/ViewInvoice';
import TicketReport from './pages/TicketReport/Report';

const ProtectedRoute = ({ children }) => {
  return !!localStorage.getItem('authToken') ? children : <Navigate to="/login" replace />;
};

function App() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/permissions" element={<ProtectedRoute><Layout><Permissions /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><Layout><CompanyManagement /></Layout></ProtectedRoute>} />
        <Route path="/create-user" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Layout><ProjectManagement /></Layout></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><Layout><TicketManagement /></Layout></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><Layout><TicketDetail /></Layout></ProtectedRoute>} />
        <Route path="/ticket-report" element={<ProtectedRoute><Layout><TicketReport /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/AddPO" element={<Layout><AddPO /></Layout>} />
        {/* <Route path="/ViewPO" element={<Layout><ViewPO /></Layout>} /> */}
        <Route path="/CreateInvoice" element={<Layout><CreateInvoice /></Layout>} />
        <Route path="/AddInvoice" element={<Layout><AddInvoice /></Layout>} />
        <Route path="/ViewInvoice" element={<Layout><ViewInvoice /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;