import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// User Components
import Home from './components/Home';
import SignIn from './components/SignIn';
import GetStarted from './components/GetStarted';
import Profile from './components/Profile';
import ViewReports from './components/ViewReports';
import UploadReport from './components/UploadReport';
import ReportInsights from './components/ReportInsights';
import Trends from './components/Trends';
import Chat from './components/Chat';
import Settings from './components/Settings';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import ManageReports from './components/admin/ManageReports';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [hasUploadedReports, setHasUploadedReports] = useState(false);

  // Check localStorage for previously uploaded reports
  useEffect(() => {
    const uploadedReports = localStorage.getItem('uploadedReports');
    if (uploadedReports) {
      const reports = JSON.parse(uploadedReports);
      if (reports && reports.length > 0) {
        setHasUploadedReports(true);
      }
    }
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleAdminSignIn = () => {
    setIsAdminAuthenticated(true);
  };

  const handleReportUpload = () => {
    setHasUploadedReports(true);
  };
  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userEmail");
    window.location.href = "/signin"; // force redirect
  };


  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} onAdminSignIn={handleAdminSignIn} />} />
        <Route path="/get-started" element={<GetStarted onSignUp={handleSignUp} />} />

        {/* User Protected Routes */}
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/view-reports"
          element={isAuthenticated ? <ViewReports hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/upload-report"
          element={isAuthenticated ? <UploadReport onReportUpload={handleReportUpload} hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/report-insights/:id"
          element={isAuthenticated ? <ReportInsights hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/trends"
          element={isAuthenticated ? <Trends hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <Chat hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings hasUploadedReports={hasUploadedReports} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Profile
                hasUploadedReports={hasUploadedReports}
                onSignOut={handleSignOut}
              />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />


        {/* Admin Routes - No separate login page needed */}
        <Route
          path="/admin/dashboard"
          element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin/users"
          element={isAdminAuthenticated ? <ManageUsers /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin/reports"
          element={isAdminAuthenticated ? <ManageReports /> : <Navigate to="/signin" />}
        />
        

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}