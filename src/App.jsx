import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import GuestRoute from './components/auth/GuestRoute.jsx';

import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';

import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminVets from './pages/AdminVets.jsx';
import AdminFarmers from './pages/AdminFarmers.jsx';
import AdminRequests from './pages/AdminRequests.jsx';
import AdminSubscriptions from './pages/AdminSubscriptions.jsx';
import AdminDeposits from './pages/AdminDeposits.jsx';
import AdminReports from './pages/AdminReports.jsx';

import FarmerDashboard from './pages/FarmerDashboard.jsx';
import FarmerRequestDetail from './pages/FarmerRequestDetail.jsx';
import FarmerChats from './pages/FarmerChats.jsx';
import FarmerSubscriptions from './pages/FarmerSubscriptions.jsx';
import FarmerPayments from './pages/FarmerPayments.jsx';
import FarmerProfile from './pages/FarmerProfile.jsx';
import FarmerWallet from './pages/FarmerWallet.jsx';
import FarmerRequestService from './pages/FarmerRequestService.jsx';
import FarmerRequests from './pages/FarmerRequests.jsx';
import NotFound from './pages/NotFound.jsx';
import ToastContainer from './components/ui/ToastContainer.jsx';
import LoadingBar from './components/ui/LoadingBar.jsx';

import VetDashboard from './pages/VetDashboard.jsx';
import VetRequestDetail from './pages/VetRequestDetail.jsx';
import VetChats from './pages/VetChats.jsx';
import VetEarnings from './pages/VetEarnings.jsx';
import VetProfile from './pages/VetProfile.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <LoadingProvider>
          <NotificationProvider>
            <AppShell />
            <ToastContainer />
            <LoadingBar />
          </NotificationProvider>
        </LoadingProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { c } = useTheme();
  return (
    <div className="mf-body" style={{ background: c.bg, color: c.text, minHeight: '100vh' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Auth /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Auth /></GuestRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/vets" element={<ProtectedRoute allowedRoles={['admin']}><AdminVets /></ProtectedRoute>} />
          <Route path="/admin/farmers" element={<ProtectedRoute allowedRoles={['admin']}><AdminFarmers /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptions /></ProtectedRoute>} />
          <Route path="/admin/deposits" element={<ProtectedRoute allowedRoles={['admin']}><AdminDeposits /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/farmer" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/requests" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerRequests /></ProtectedRoute>} />
          <Route path="/farmer/request-service" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerRequestService /></ProtectedRoute>} />
          <Route path="/farmer/requests/:id" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerRequestDetail /></ProtectedRoute>} />
          <Route path="/farmer/chats" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerChats /></ProtectedRoute>} />
          <Route path="/farmer/subscriptions" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerSubscriptions /></ProtectedRoute>} />
          <Route path="/farmer/payments" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerPayments /></ProtectedRoute>} />
          <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerProfile /></ProtectedRoute>} />
          <Route path="/farmer/wallet" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerWallet /></ProtectedRoute>} />
          <Route path="/vet" element={<ProtectedRoute allowedRoles={['vet']}><VetDashboard /></ProtectedRoute>} />
          <Route path="/vet/requests/:id" element={<ProtectedRoute allowedRoles={['vet']}><VetRequestDetail /></ProtectedRoute>} />
          <Route path="/vet/chats" element={<ProtectedRoute allowedRoles={['vet']}><VetChats /></ProtectedRoute>} />
          <Route path="/vet/earnings" element={<ProtectedRoute allowedRoles={['vet']}><VetEarnings /></ProtectedRoute>} />
          <Route path="/vet/profile" element={<ProtectedRoute allowedRoles={['vet']}><VetProfile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
