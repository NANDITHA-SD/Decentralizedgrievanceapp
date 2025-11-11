import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Shield, Users, GraduationCap, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'vendor'>('student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(signupEmail, signupPassword, signupName, signupRole);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'student' | 'vendor') => {
    const demoAccounts = {
      admin: { email: 'admin@blockfix.com', password: 'admin123' },
      student: { email: 'student@test.com', password: 'student123' },
      vendor: { email: 'vendor@test.com', password: 'vendor123' },
    };

    const account = demoAccounts[role];
    setLoginEmail(account.email);
    setLoginPassword(account.password);
    toast.info(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials loaded. Click Login to continue.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl w-full"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 mb-4"
          >
            BlockFix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-xl"
          >
            Transparent Grievance Redressal System
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 mt-2"
          >
            For Colleges, Hostels, and Communities
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="h-8 w-8 text-amber-400" />
                  <div>
                    <h3 className="text-white">Secure & Transparent</h3>
                    <p className="text-slate-400 text-sm">Track every complaint and resolution</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <Users className="h-8 w-8 text-amber-400" />
                  <div>
                    <h3 className="text-white">Community Voting</h3>
                    <p className="text-slate-400 text-sm">Upvote issues to prioritize them</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <GraduationCap className="h-8 w-8 text-amber-400" />
                  <div>
                    <h3 className="text-white">Escrow Protection</h3>
                    <p className="text-slate-400 text-sm">Funds released only after confirmation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-amber-400">Quick Access</CardTitle>
                <CardDescription className="text-slate-400">
                  Sign in with your account credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleDemoLogin('admin')}
                  variant="outline"
                  className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
                <Button
                  onClick={() => handleDemoLogin('student')}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Student Login
                </Button>
                <Button
                  onClick={() => handleDemoLogin('vendor')}
                  variant="outline"
                  className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Vendor Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800 border-amber-500/30 shadow-2xl">
              <CardContent className="p-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="login-email" className="text-slate-300">
                          Email
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="login-email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="login-password" className="text-slate-300">
                          Password
                        </Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="signup-name" className="text-slate-300">
                          Full Name
                        </Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signup-email" className="text-slate-300">
                          Email
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signup-password" className="text-slate-300">
                          Password
                        </Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-password"
                            type="password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300 mb-3 block">
                          Select Role
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            onClick={() => setSignupRole('student')}
                            variant={signupRole === 'student' ? 'default' : 'outline'}
                            className={
                              signupRole === 'student'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'border-slate-600 text-slate-300'
                            }
                          >
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Student
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setSignupRole('vendor')}
                            variant={signupRole === 'vendor' ? 'default' : 'outline'}
                            className={
                              signupRole === 'vendor'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'border-slate-600 text-slate-300'
                            }
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Vendor
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                      >
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
