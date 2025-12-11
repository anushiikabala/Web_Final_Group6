import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, User, UserPlus, LogOut } from 'lucide-react';

interface DoctorNavbarProps {
  onLogout?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

export default function DoctorNavbar({ onLogout }: DoctorNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("doctorEmail");
    localStorage.removeItem("doctorToken");
    if (onLogout) {
      onLogout();
    }
    navigate('/signin');
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'My Patients', path: '/doctor/patients', icon: Users },
    { name: 'Requests', path: '/doctor/requests', icon: UserPlus },
    { name: 'Profile', path: '/doctor/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/doctor/dashboard" className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">LabInsight AI</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Doctor Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all ml-2"
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
