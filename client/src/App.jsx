import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import Cars from './pages/Cars';
import RequestDelivery from './pages/RequestDelivery';
import MyRequests from './pages/MyRequests';
import AdminDashboard from './pages/AdminDashboard';
import AdminCars from './pages/AdminCars';
import AdminUsers from './pages/AdminUsers';
import DelivererDashboard from './pages/DelivererDashboard';
import ChangePassword from './pages/ChangePassword';
import DeleteAccount from './pages/DeleteAccount';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rute Client */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <ClientDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/cars" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <Cars />
                    </ProtectedRoute>
                } />
                <Route path="/request-delivery/:carId" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <RequestDelivery />
                    </ProtectedRoute>
                } />
                <Route path="/my-requests" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <MyRequests />
                    </ProtectedRoute>
                } />
                <Route path="/change-password" element={
                    <ProtectedRoute allowedRoles={['client', 'deliverer', 'admin']}>
                        <ChangePassword />
                    </ProtectedRoute>
                } />
                <Route path="/delete-account" element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <DeleteAccount />
                    </ProtectedRoute>
                } />

                {/* Rute Admin */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/cars" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminCars />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminUsers />
                    </ProtectedRoute>
                } />

                {/* Rute Livrator */}
                <Route path="/deliverer/dashboard" element={
                    <ProtectedRoute allowedRoles={['deliverer']}>
                        <DelivererDashboard />
                    </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;