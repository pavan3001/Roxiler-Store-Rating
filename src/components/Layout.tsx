import React from 'react';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Store } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'store_owner':
        return <Store className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'System Administrator';
      case 'store_owner':
        return 'Store Owner';
      default:
        return 'User';
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/60 glass-card border-b fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Roxiler Store Rating</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                {getRoleIcon()}
                <span className="font-medium truncate max-w-[160px]">{user?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="truncate max-w-[120px]">{getRoleLabel()}</span>
              </div>

              {/* Mobile compact menu */}
              <div className="sm:hidden">
                <button onClick={logout} className="p-2 text-gray-600 hover:text-gray-900 rounded-md">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden sm:block">
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
  <div style={{ paddingTop: '8px', paddingBottom: '80px' }}>{children}</div>
      </main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;