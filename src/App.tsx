import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { StudentDashboard } from './components/StudentDashboard';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Toaster } from './components/ui/sonner';
import { motion } from 'motion/react';
import { LogOut, User, Shield, Users, GraduationCap } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'vendor' | 'admin' | null>(null);

  // Auto-select role based on user type
  React.useEffect(() => {
    if (user && !selectedRole) {
      if (user.role === 'admin') {
        setSelectedRole('admin');
      } else if (user.role === 'vendor') {
        setSelectedRole('vendor');
      } else {
        setSelectedRole('student');
      }
    }
  }, [user, selectedRole]);

  // If not logged in, show auth page
  if (!user) {
    return <Auth />;
  }

  // Role Selection Screen (if user has multiple capabilities)
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-amber-400 mb-2">Select Your Dashboard</h1>
            <p className="text-slate-300">
              Welcome, {user.name}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {user.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  onClick={() => setSelectedRole('admin')}
                  className="bg-slate-800 border-amber-500/30 hover:border-amber-500 cursor-pointer transition-all hover:scale-105"
                >
                  <CardContent className="p-8 text-center">
                    <Shield className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-white mb-2">Admin</h3>
                    <p className="text-slate-400 text-sm">
                      Manage complaints, assign vendors, release funds
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {user.role === 'vendor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  onClick={() => setSelectedRole('vendor')}
                  className="bg-slate-800 border-amber-500/30 hover:border-amber-500 cursor-pointer transition-all hover:scale-105"
                >
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-white mb-2">Vendor</h3>
                    <p className="text-slate-400 text-sm">
                      View assignments, resolve issues, receive payments
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {user.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  onClick={() => setSelectedRole('student')}
                  className="bg-slate-800 border-amber-500/30 hover:border-amber-500 cursor-pointer transition-all hover:scale-105"
                >
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-white mb-2">Student</h3>
                    <p className="text-slate-400 text-sm">
                      Raise complaints, vote on issues, track resolutions
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => setSelectedRole(user.role)}
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              Continue as {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard Navigation
  return (
    <div className="relative">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-amber-400">BlockFix</h2>
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-sm">${user.walletBalance}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user.role !== selectedRole && (
              <Button
                onClick={() => setSelectedRole(null)}
                variant="outline"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                Switch Dashboard
              </Button>
            )}
            <Button
              onClick={() => {
                setSelectedRole(null);
                logout();
              }}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content with padding for fixed nav */}
      <div className="pt-20">
        {selectedRole === 'student' && <StudentDashboard />}
        {selectedRole === 'vendor' && <VendorDashboard />}
        {selectedRole === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
};

export default function App() {
  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((error) => {
            console.log('SW registration failed: ', error);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <MainApp />
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}
