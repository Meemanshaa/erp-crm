import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Customers } from "./pages/Customers/Customers";
import { Products } from "./pages/Products/Products";
import { Challans } from "./pages/Challans/Challans";

export const App: React.FC = () => {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/challans" element={<Challans />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
    </AuthProvider>
  );
};

export default App;