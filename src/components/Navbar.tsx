import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, LogOut, Plus } from 'lucide-react';
import Button from './Button';

interface NavbarProps {
  isAdmin: boolean;
}

export default function Navbar({ isAdmin }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('operator');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-axiom-600">HiPot</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/')
                    ? 'border-b-2 border-axiom-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>

              <Link
                to="/new-test"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/new-test')
                    ? 'border-b-2 border-axiom-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Test
              </Link>

              <Link
                to="/logs"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/logs')
                    ? 'border-b-2 border-axiom-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </Link>

              {isAdmin && (
                <Link
                  to="/settings"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/settings')
                      ? 'border-b-2 border-axiom-500 text-gray-900'
                      : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
