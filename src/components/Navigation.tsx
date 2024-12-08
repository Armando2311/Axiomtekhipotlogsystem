import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Search, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  {
    name: 'Start New Work Order',
    href: '/new-test',
    icon: ClipboardList,
  },
  {
    name: 'View Past Logs',
    href: '/logs',
    icon: Search,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center px-6 py-3 text-sm font-medium transition-colors',
              location.pathname === item.href
                ? 'bg-axiom-50 text-axiom-500 border-r-2 border-axiom-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
