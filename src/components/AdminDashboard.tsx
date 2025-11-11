import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  CheckCircle, 
  Coins, 
  FileText, 
  MapPin, 
  Image as ImageIcon, 
  UserPlus,
  ArrowUp,
  TrendingUp,
  Database,
  Activity,
  Shield,
  AlertTriangle,
  Heart,
  Award,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { 
    user,
    getAllComplaints,
    getHarassmentComplaints,
    assignVendor,
    assignCounselor,
    releaseFunds,
    addVendor,
    addCounselor,
    getTotalFundsPool,
    getVendors,
    getCounselors,
    transactions,
    getStats,
    getVendorPerformance,
    users,
  } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedCounselorId, setSelectedCounselorId] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddCounselor, setShowAddCounselor] = useState(false);
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newCounselorEmail, setNewCounselorEmail] = useState('');
  const [newCounselorName, setNewCounselorName] = useState('');

  const vendors = getVendors();
  const counselors = getCounselors();
  const stats = getStats();
  const harassmentComplaints = getHarassmentComplaints();

  useEffect(() => {
    loadData();
  }, [user, users]);

  const loadData = () => {
    const allComplaints = getAllComplaints();
    setComplaints(allComplaints);
  };

  const handleAssignVendor = (complaintId: string) => {
    if (!selectedVendorId || !allocatedAmount) return;
    
    assignVendor(complaintId, selectedVendorId, Number(allocatedAmount));
    setSelectedVendorId('');
    setAllocatedAmount('');
    setSelectedComplaint(null);
    loadData();
  };

  const handleAssignCounselor = (complaintId: string) => {
    if (!selectedCounselorId) return;
    
    assignCounselor(complaintId, selectedCounselorId);
    setSelectedCounselorId('');
    loadData();
  };

  const handleReleaseFunds = (complaintId: string) => {
    releaseFunds(complaintId);
    loadData();
  };

  const handleAddVendor = () => {
    if (!newVendorEmail || !newVendorName) return;
    
    addVendor(newVendorEmail, newVendorName);
    setNewVendorEmail('');
    setNewVendorName('');
    setShowAddVendor(false);
  };

  const handleAddCounselor = () => {
    if (!newCounselorEmail || !newCounselorName) return;
    
    addCounselor(newCounselorEmail, newCounselorName);
    setNewCounselorEmail('');
    setNewCounselorName('');
    setShowAddCounselor(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending' && c.category !== 'harassment');
  const awaitingVotesComplaints = complaints.filter(c => c.status === 'awaiting_votes');
  const assignedComplaints = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const confirmedComplaints = complaints.filter(c => c.status === 'confirmed');

  // Chart data
  const statusChartData = [
    { name: 'Awaiting Votes', count: stats.awaitingVotesComplaints, color: '#64748b' },
    { name: 'Pending', count: stats.pendingComplaints, color: '#eab308' },
    { name: 'Assigned', count: stats.assignedComplaints, color: '#3b82f6' },
    { name: 'Resolved', count: stats.resolvedComplaints, color: '#22c55e' },
    { name: 'Confirmed', count: stats.confirmedComplaints, color: '#10b981' },
  ];

  // Vendor leaderboard
  const vendorLeaderboard = vendors.map(v => ({
    ...v,
    performance: getVendorPerformance(v.id),
  })).sort((a, b) => b.performance.score - a.performance.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-amber-400 mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">{user?.name} • System Administrator</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Awaiting Votes</p>
                    <p className="text-3xl text-white mt-1">{stats.awaitingVotesComplaints}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-slate-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-200 text-sm">Pending Assignment</p>
                    <p className="text-3xl text-white mt-1">{stats.pendingComplaints}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-yellow-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">In Progress</p>
                    <p className="text-3xl text-white mt-1">{stats.assignedComplaints}</p>
                  </div>
                  <Database className="h-12 w-12 text-blue-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-sm">Harassment Cases</p>
                    <p className="text-3xl text-white mt-1">{stats.harassmentComplaints}</p>
                  </div>
                  <Shield className="h-12 w-12 text-red-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-200 text-sm">Total Pool</p>
                    <p className="text-2xl text-white mt-1">${stats.totalFundsPool}</p>
                  </div>
                  <Coins className="h-12 w-12 text-amber-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Leaderboard */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Complaint Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Vendor Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {vendorLeaderboard.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-amber-500 text-slate-900' :
                          index === 1 ? 'bg-slate-400 text-slate-900' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white text-sm">{vendor.name}</p>
                          <p className="text-slate-400 text-xs">{vendor.performance.completedJobs} jobs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`${
                          vendor.performance.score >= 80 ? 'text-green-400' :
                          vendor.performance.score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {vendor.performance.score}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {vendor.badges?.slice(0, 2).map((badge, i) => (
                            <Badge key={i} className="bg-amber-500/20 text-amber-400 text-xs px-1 py-0">
                              {badge.slice(0, 1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Management Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => setShowAddVendor(!showAddVendor)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showAddVendor ? 'Cancel' : 'Add Vendor'}
          </Button>

          <Button
            onClick={() => setShowAddCounselor(!showAddCounselor)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Heart className="mr-2 h-4 w-4" />
            {showAddCounselor ? 'Cancel' : 'Add Counselor'}
          </Button>
        </div>

        {/* Add Vendor Form */}
        {showAddVendor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card className="bg-slate-800 border-amber-500/20">
              <CardContent className="p-6">
                <h3 className="text-white mb-4">Add New Vendor</h3>
                <div className="space-y-4">
                  <Input
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="Vendor name"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    placeholder="Vendor email"
                    type="email"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={handleAddVendor}
                    disabled={!newVendorEmail || !newVendorName}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add Counselor Form */}
        {showAddCounselor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card className="bg-slate-800 border-blue-500/20">
              <CardContent className="p-6">
                <h3 className="text-white mb-4">Add New Counselor</h3>
                <div className="space-y-4">
                  <Input
                    value={newCounselorName}
                    onChange={(e) => setNewCounselorName(e.target.value)}
                    placeholder="Counselor name (e.g., Dr. Smith)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    value={newCounselorEmail}
                    onChange={(e) => setNewCounselorEmail(e.target.value)}
                    placeholder="Counselor email"
                    type="email"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={handleAddCounselor}
                    disabled={!newCounselorEmail || !newCounselorName}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add Counselor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-400" />
                Registered Users
              </CardTitle>
              <CardDescription className="text-slate-400">
                All registered students, vendors, counselors, and admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Students */}
                <div>
                  <h3 className="text-amber-400 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Students ({users.filter(u => u.role === 'student').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {users.filter(u => u.role === 'student').map(student => (
                      <div key={student.id} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{student.name}</p>
                            <p className="text-slate-400 text-sm">{student.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500/20 text-green-400">
                              {student.walletBalance} coins
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {users.filter(u => u.role === 'student').length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No students registered</p>
                    )}
                  </div>
                </div>

                {/* Vendors */}
                <div>
                  <h3 className="text-blue-400 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vendors ({users.filter(u => u.role === 'vendor').length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {users.filter(u => u.role === 'vendor').map(vendor => {
                      const performance = getVendorPerformance(vendor.id);
                      return (
                        <div key={vendor.id} className="p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white">{vendor.name}</p>
                              <p className="text-slate-400 text-sm">{vendor.email}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                performance.score >= 80 ? 'bg-green-500/20 text-green-400' :
                                performance.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                Score: {performance.score}
                              </Badge>
                              {vendor.badges && vendor.badges.length > 0 && (
                                <div className="flex gap-1 mt-1 justify-end">
                                  {vendor.badges.slice(0, 2).map((badge, i) => (
                                    <span key={i} className="text-xs">
                                      {badge.includes('Gold') ? '🏆' : badge.includes('Silver') ? '🥈' : '⭐'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {users.filter(u => u.role === 'vendor').length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No vendors registered</p>
                    )}
                  </div>
                </div>

                {/* Counselors */}
                <div>
                  <h3 className="text-purple-400 mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Counselors ({users.filter(u => u.role === 'counselor').length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {users.filter(u => u.role === 'counselor').map(counselor => (
                      <div key={counselor.id} className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-white">{counselor.name}</p>
                        <p className="text-slate-400 text-sm">{counselor.email}</p>
                      </div>
                    ))}
                    {users.filter(u => u.role === 'counselor').length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No counselors registered</p>
                    )}
                  </div>
                </div>

                {/* Admins */}
                <div>
                  <h3 className="text-amber-400 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admins ({users.filter(u => u.role === 'admin').length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {users.filter(u => u.role === 'admin').map(admin => (
                      <div key={admin.id} className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-white">{admin.name}</p>
                        <p className="text-slate-400 text-sm">{admin.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* URGENT: Harassment Complaints */}
        {harassmentComplaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-red-400 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              🚨 URGENT: Harassment Cases (Special Team)
            </h2>
            <div className="grid gap-4">
              {harassmentComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-red-900/20 border-red-500/50 hover:border-red-500 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white flex items-center gap-2">
                            {complaint.title}
                            <Badge variant="outline" className="bg-red-500/20 text-red-400">
                              URGENT - HARASSMENT
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-slate-300">
                            ID: #{complaint.id} • Priority: {complaint.priority} • {formatDate(complaint.timestamp)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-slate-200">
                          <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                          <p>{complaint.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <p>{complaint.location}</p>
                        </div>

                        {complaint.needsCounseling && (
                          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-300 mb-2">
                              <Heart className="inline h-4 w-4 mr-1" />
                              Student may need counseling support
                            </p>
                            {!complaint.assignedCounselorId ? (
                              <div className="space-y-2 mt-3">
                                <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Assign counselor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {counselors.map(counselor => (
                                      <SelectItem key={counselor.id} value={counselor.id}>
                                        {counselor.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={() => handleAssignCounselor(complaint.id)}
                                  disabled={!selectedCounselorId}
                                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                  size="sm"
                                >
                                  Assign Counselor
                                </Button>
                              </div>
                            ) : (
                              <p className="text-green-300 mt-2">
                                <CheckCircle className="inline h-4 w-4 mr-1" />
                                Counselor assigned
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-red-300 text-sm">
                            <AlertTriangle className="inline h-4 w-4 mr-1" />
                            Confidential case - Handle with care • Escalate to special committee if needed
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Awaiting Votes Complaints */}
        {awaitingVotesComplaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h2 className="text-slate-400 mb-4">Awaiting Community Votes ({'<'}5 upvotes)</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <p className="text-slate-400">
                  {awaitingVotesComplaints.length} complaints waiting for community votes.
                  They will appear in "Pending Assignment" once they reach 5 upvotes.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pending Complaints (Need Vendor Assignment) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <h2 className="text-amber-400 mb-4">Pending Assignment (5+ upvotes achieved)</h2>
          {pendingComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No complaints pending assignment
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingComplaints
                .sort((a, b) => b.upvotes - a.upvotes)
                .map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800 border-amber-500/20 hover:border-amber-500/40 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                              {complaint.title}
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {complaint.upvotes} votes
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                              ID: #{complaint.id} • Student: {complaint.studentName} • {formatDate(complaint.timestamp)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-slate-300">
                            <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                            <p>{complaint.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <p>{complaint.location}</p>
                          </div>
                          {complaint.photoUrl && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <ImageIcon className="h-4 w-4 flex-shrink-0" />
                              <a 
                                href={complaint.photoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-amber-400 hover:text-amber-300 underline"
                              >
                                View Photo
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-green-400">
                            <Coins className="h-4 w-4 flex-shrink-0" />
                            <p>Escrow: ${complaint.depositAmount}</p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-700">
                            {selectedComplaint === complaint.id ? (
                              <div className="space-y-3">
                                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map(vendor => (
                                      <SelectItem key={vendor.id} value={vendor.id}>
                                        {vendor.name} (Score: {getVendorPerformance(vendor.id).score})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={allocatedAmount}
                                  onChange={(e) => setAllocatedAmount(e.target.value)}
                                  placeholder="Allocated fund amount ($)"
                                  className="bg-slate-700 border-slate-600 text-white"
                                />
                                <p className="text-slate-400 text-sm">
                                  Escrow: ${complaint.depositAmount} • Allocate amount vendor will receive
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAssignVendor(complaint.id)}
                                    disabled={!selectedVendorId || !allocatedAmount}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                  >
                                    Assign Vendor with Fund Allocation
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedComplaint(null);
                                      setSelectedVendorId('');
                                      setAllocatedAmount('');
                                    }}
                                    variant="outline"
                                    className="border-slate-600 text-slate-300"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setSelectedComplaint(complaint.id)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                              >
                                Assign to Vendor
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>

        {/* Confirmed Complaints (Ready for Fund Release) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h2 className="text-amber-400 mb-4">Confirmed - Ready for Payment</h2>
          {confirmedComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No confirmed complaints pending payment
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {confirmedComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-800 border-emerald-500/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white">{complaint.title}</CardTitle>
                          <CardDescription className="text-slate-400">
                            ID: #{complaint.id} • Vendor: {complaint.assignedVendorName}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline"
                          className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                        >
                          Confirmed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-slate-300">
                          <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                          <p>{complaint.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <Coins className="h-4 w-4 flex-shrink-0" />
                          <p>Allocated Amount: ${complaint.allocatedAmount || complaint.depositAmount}</p>
                        </div>

                        {complaint.averageRating > 0 && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-amber-400">
                              Student Rating: {complaint.averageRating.toFixed(1)}/5 ⭐
                            </p>
                          </div>
                        )}

                        {complaint.fundsReleased ? (
                          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-emerald-400 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Payment Released Successfully
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <Button
                              onClick={() => handleReleaseFunds(complaint.id)}
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Coins className="mr-2 h-4 w-4" />
                              Release ${complaint.allocatedAmount || complaint.depositAmount} to Vendor
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <h2 className="text-amber-400 mb-4">Recent Transaction History</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(-15).reverse().map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-amber-400" />
                        <div>
                          <p className="text-white text-sm">{tx.description}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {tx.amount > 0 && (
                        <div className="text-right">
                          <p className={`${
                            tx.type === 'payment' ? 'text-green-400' :
                            tx.type === 'penalty' ? 'text-red-400' :
                            'text-amber-400'
                          }`}>
                            ${tx.amount}
                          </p>
                          <p className="text-slate-500 text-xs">{tx.type}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
