import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, FileText, UserCog, LogOut } from 'lucide-react';

interface AdminNavbarProps {
  onLogout?: () => void;
}

export default function AdminNavbar({ onLogout }: AdminNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/doctors', label: 'Doctors', icon: UserCog },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    if (onLogout) {
      onLogout();
    }
    navigate('/signin');
  };

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <span className="text-xl font-bold text-white block">LabInsight AI</span>
              <span className="text-xs text-red-400 font-medium">Admin Portal</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors hidden sm:block"
            >
              Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
