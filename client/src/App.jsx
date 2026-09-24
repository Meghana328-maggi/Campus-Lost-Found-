import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Auth Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public & User Pages
import HomePage from './pages/HomePage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import ClaimsPage from './pages/ClaimsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import BookmarksPage from './pages/BookmarksPage';
import SmartAlertsPage from './pages/SmartAlertsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminItemsPage from './pages/admin/AdminItemsPage';
import AdminClaimsPage from './pages/admin/AdminClaimsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

export default function App() {
  return (
    <Routes>
      {/* Public and Standard User Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lost" element={<LostItemsPage />} />
        <Route path="/found" element={<FoundItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected User Routes */}
        <Route
          path="/report-lost"
          element={
            <ProtectedRoute>
              <ReportLostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-found"
          element={
            <ProtectedRoute>
              <ReportFoundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <ClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <SmartAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="items" element={<AdminItemsPage />} />
        <Route path="claims" element={<AdminClaimsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="locations" element={<AdminLocationsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>
    </Routes>
  );
}
