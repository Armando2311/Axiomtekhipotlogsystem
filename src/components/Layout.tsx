import { Link, Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex bg-white">
        <Link to="/" className="flex items-center bg-white h-16 w-[200px] px-4">
          <img 
            src="/axiomtek-logo.png"
            alt="Axiomtek Logo" 
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex-1 bg-axiom-500 h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-white">
            Hipot Test Log System
          </h1>
          <button
            onClick={logout}
            className="flex items-center text-white hover:text-axiom-100 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <Navigation />
        
        <main className="flex-1 p-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="bg-axiom-500 py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-white">
          {new Date().getFullYear()} Axiomtek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}