import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';

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
import ManageDoctors from './components/admin/ManageDoctors';

// Doctor Components
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorPatients from './components/doctor/DoctorPatients';
import DoctorPatientDetail from './components/doctor/DoctorPatientDetail';
import DoctorRequests from './components/doctor/DoctorRequests';
import DoctorProfile from './components/doctor/DoctorProfile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(false);
  const [hasUploadedReports, setHasUploadedReports] = useState(false);

  // Check localStorage on mount for persisted auth state
  useEffect(() => {
    // Check for uploaded reports
    const uploadedReports = localStorage.getItem('uploadedReports');
    if (uploadedReports) {
      const reports = JSON.parse(uploadedReports);
      if (reports && reports.length > 0) {
        setHasUploadedReports(true);
      }
    }

    // Check for persisted user session
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setIsAuthenticated(true);
    }

    // Check for persisted admin session
    const adminEmail = localStorage.getItem('adminEmail');
    if (adminEmail) {
      setIsAdminAuthenticated(true);
    }

    // Check for persisted doctor session
    const doctorEmail = localStorage.getItem('doctorEmail');
    if (doctorEmail) {
      setIsDoctorAuthenticated(true);
    }
  }, []);

  // User handlers
  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userEmail");
    window.location.href = "/signin";
  };

  const handleReportUpload = () => {
    setHasUploadedReports(true);
  };

  // Admin handlers
  const handleAdminSignIn = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminSignOut = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem("adminEmail");
    window.location.href = "/signin";
  };

  // Doctor handlers
  const handleDoctorSignIn = () => {
    setIsDoctorAuthenticated(true);
  };

  const handleDoctorSignOut = () => {
    setIsDoctorAuthenticated(false);
    localStorage.removeItem("doctorEmail");
    localStorage.removeItem("doctorToken");
    window.location.href = "/signin";
  };

  return (
    <>
    <Toaster />
    <Router>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/signin" 
          element={
            <SignIn 
              onSignIn={handleSignIn} 
              onAdminSignIn={handleAdminSignIn} 
              onDoctorSignIn={handleDoctorSignIn}
            />
          } 
        />
        <Route path="/get-started" element={<GetStarted onSignUp={handleSignUp} />} />

        {/* ==================== USER PROTECTED ROUTES ==================== */}
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
          element={isAuthenticated ? <Settings hasUploadedReports={hasUploadedReports} onSignOut={handleSignOut} /> : <Navigate to="/signin" />}
        />

        {/* ==================== ADMIN PROTECTED ROUTES ==================== */}
        <Route
          path="/admin/dashboard"
          element={isAdminAuthenticated ? <AdminDashboard onLogout={handleAdminSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin/users"
          element={isAdminAuthenticated ? <ManageUsers onLogout={handleAdminSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin/reports"
          element={isAdminAuthenticated ? <ManageReports onLogout={handleAdminSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin/doctors"
          element={isAdminAuthenticated ? <ManageDoctors onLogout={handleAdminSignOut} /> : <Navigate to="/signin" />}
        />

        {/* ==================== DOCTOR PROTECTED ROUTES ==================== */}
        <Route
          path="/doctor/dashboard"
          element={isDoctorAuthenticated ? <DoctorDashboard onLogout={handleDoctorSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/doctor/patients"
          element={isDoctorAuthenticated ? <DoctorPatients onLogout={handleDoctorSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/doctor/patient/:patientId"
          element={isDoctorAuthenticated ? <DoctorPatientDetail onLogout={handleDoctorSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/doctor/requests"
          element={isDoctorAuthenticated ? <DoctorRequests onLogout={handleDoctorSignOut} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/doctor/profile"
          element={isDoctorAuthenticated ? <DoctorProfile onLogout={handleDoctorSignOut} /> : <Navigate to="/signin" />}
        />

        {/* ==================== CATCH ALL ==================== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </>
  );
}
