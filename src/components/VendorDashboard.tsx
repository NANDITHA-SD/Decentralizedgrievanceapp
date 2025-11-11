import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageUpload } from './ImageUpload';
import { CheckCircle, Coins, FileText, MapPin, Image as ImageIcon, Clock, DollarSign, TrendingUp, Award, Star, AlertTriangle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const VendorDashboard: React.FC = () => {
  const { 
    user,
    complaints: allComplaintsInContext,
    getVendorComplaints,
    resolveComplaint,
    transactions,
    getVendorPerformance,
  } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');

  const performance = getVendorPerformance(user?.id || '');

  useEffect(() => {
    loadComplaints();
  }, [user, allComplaintsInContext]);

  const loadComplaints = () => {
    const vendorComplaints = getVendorComplaints();
    setComplaints(vendorComplaints);
  };

  const handleResolveComplaint = (complaintId: string) => {
    if (!proofUrl) return;
    
    resolveComplaint(complaintId, proofUrl);
    setProofUrl('');
    setSelectedComplaint(null);
    loadComplaints();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    if (diff <= 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  };

  const totalEarned = complaints
    .filter(c => c.fundsReleased)
    .reduce((sum, c) => sum + (c.allocatedAmount || c.depositAmount), 0);

  const assignedComplaints = complaints.filter(c => c.assignedVendorId === user?.id && (c.status === 'assigned' || c.status === 'in_progress'));
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'confirmed');

  // Available complaints (pending with 5+ upvotes)
  const availableComplaints = complaints.filter(c => 
    c.status === 'pending' && 
    c.upvotes >= 5 && 
    !c.assignedVendorId &&
    c.category !== 'harassment'
  );

  // Earnings chart data
  const myTransactions = transactions.filter(
    t => t.type === 'payment' && t.to === user?.id
  );
  
  const earningsChartData = myTransactions.map(t => ({
    date: new Date(t.timestamp).toLocaleDateString(),
    amount: t.amount,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-amber-400 mb-2">Vendor Dashboard</h1>
              <p className="text-slate-300">{user?.name} • Balance: ${user?.walletBalance}</p>
            </div>
            
            {/* Performance Badge */}
            <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-amber-400" />
                  <div>
                    <p className="text-amber-200 text-sm">Performance Score</p>
                    <p className="text-2xl text-white">{performance.score}/100</p>
                  </div>
                </div>
                {performance.badges.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {performance.badges.map((badge, index) => (
                      <Badge key={index} className="bg-amber-500/20 text-amber-400 text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-amber-300 text-xs mt-2">
                  {user?.rewardPoints || 0} Reward Points
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Assigned to Me</p>
                    <p className="text-3xl text-white mt-1">{assignedComplaints.length}</p>
                  </div>
                  <Clock className="h-12 w-12 text-blue-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Completed</p>
                    <p className="text-3xl text-white mt-1">{performance.completedJobs}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-200 text-sm">Total Earned</p>
                    <p className="text-3xl text-white mt-1">${totalEarned}</p>
                  </div>
                  <Coins className="h-12 w-12 text-amber-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Avg Rating</p>
                    <p className="text-3xl text-white mt-1 flex items-center gap-1">
                      {performance.averageRating > 0 ? performance.averageRating.toFixed(1) : 'N/A'}
                      {performance.averageRating > 0 && <Star className="h-6 w-6 fill-amber-400 text-amber-400" />}
                    </p>
                  </div>
                  <Award className="h-12 w-12 text-purple-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">On-Time Completion</span>
                    <span className="text-green-400">{performance.onTimeCompletion}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Total Jobs Completed</span>
                    <span className="text-white">{performance.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Average Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">{performance.averageRating > 0 ? performance.averageRating.toFixed(1) : 'N/A'}</span>
                      {performance.averageRating > 0 && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Performance Score</span>
                    <span className={`${performance.score >= 80 ? 'text-green-400' : performance.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {performance.score}/100
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {earningsChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Earnings History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={earningsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Available Complaints (Pending with 5+ upvotes) */}
        {availableComplaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-amber-400 mb-4">Available Complaints (5+ Upvotes)</h2>
            <div className="grid gap-4">
              {availableComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800 border-green-500/20 hover:border-green-500/40 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white flex items-center gap-2">
                            {complaint.title}
                            <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                              {complaint.upvotes} upvotes
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            ID: #{complaint.id} • By {complaint.studentName}
                          </CardDescription>
                        </div>
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
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-green-400">
                            Available for assignment • High community priority
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

        {/* Assigned Complaints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-amber-400 mb-4">My Assigned Tasks</h2>
          {assignedComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No complaints assigned yet. Check available complaints above or wait for admin assignment.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignedComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800 border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white">
                            {complaint.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            ID: #{complaint.id} • {formatDate(complaint.timestamp)}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline"
                          className="bg-blue-500/20 text-blue-400 border-blue-500/50"
                        >
                          Assigned
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
                          <p>Payment: ${complaint.allocatedAmount || complaint.depositAmount}</p>
                        </div>

                        {complaint.resolutionDeadline && (
                          <div className={`p-3 rounded-lg border ${
                            Date.now() > complaint.resolutionDeadline
                              ? 'bg-red-500/10 border-red-500/20'
                              : 'bg-amber-500/10 border-amber-500/20'
                          }`}>
                            <p className={Date.now() > complaint.resolutionDeadline ? 'text-red-400' : 'text-amber-400'}>
                              <Clock className="inline h-4 w-4 mr-1" />
                              {getTimeRemaining(complaint.resolutionDeadline)}
                              {Date.now() > complaint.resolutionDeadline && (
                                <span className="ml-2">
                                  <AlertTriangle className="inline h-4 w-4" /> 20% penalty will be applied
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-700">
                          {selectedComplaint === complaint.id ? (
                            <div className="space-y-3">
                              <ImageUpload
                                onImageCapture={(imageData) => setProofUrl(imageData)}
                                currentImage={proofUrl}
                                title="Resolution Proof (Required)"
                                description="Upload or capture a photo showing the completed work"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleResolveComplaint(complaint.id)}
                                  disabled={!proofUrl}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Submit Resolution
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedComplaint(null);
                                    setProofUrl('');
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
                              Mark as Resolved
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

        {/* Completed Work */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-amber-400 mb-4">Completed Work</h2>
          {resolvedComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No completed work yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resolvedComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white">
                            {complaint.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            ID: #{complaint.id} • Completed
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline"
                          className={complaint.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-500/20 text-green-400'}
                        >
                          {complaint.status}
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
                          <p>Payment: ${complaint.allocatedAmount || complaint.depositAmount}</p>
                        </div>

                        {complaint.averageRating > 0 && (
                          <div className="flex items-center gap-2 text-amber-400">
                            <Star className="h-4 w-4 fill-amber-400" />
                            <span>Student Rating: {complaint.averageRating.toFixed(1)}/5</span>
                          </div>
                        )}

                        {complaint.fundsReleased ? (
                          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-emerald-400 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Payment Released - ${complaint.allocatedAmount || complaint.depositAmount} Received
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-amber-400">
                              {complaint.status === 'resolved' 
                                ? 'Awaiting student confirmation'
                                : 'Awaiting admin to release payment'}
                            </p>
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
      </div>
    </div>
  );
};
