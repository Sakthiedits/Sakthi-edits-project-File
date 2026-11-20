import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#06050b] flex flex-col items-center justify-center">
      <div className="w-9 h-9 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
      <span className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-mono font-bold">
        SAKTHIEDITS
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
