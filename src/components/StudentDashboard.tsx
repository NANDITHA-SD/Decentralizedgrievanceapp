import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { VoiceInput } from './VoiceInput';
import { ImageUpload } from './ImageUpload';
import { 
  ArrowUp, AlertCircle, CheckCircle, Clock, FileText, MapPin, 
  Image as ImageIcon, Coins, TrendingUp, Activity, Star, 
  Heart, Shield, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CATEGORY_COLORS = {
  mess: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  infrastructure: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  harassment: 'bg-red-500/20 text-red-400 border-red-500/50',
  hygiene: 'bg-green-500/20 text-green-400 border-green-500/50',
  security: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  academic: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};

const PRIORITY_COLORS = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

export const StudentDashboard: React.FC = () => {
  const { 
    user,
    complaints: allComplaintsInContext,
    raiseComplaint, 
    getMyComplaints, 
    getAllComplaints,
    upvoteComplaint,
    confirmResolution,
    hasUserUpvoted,
    getStats,
    rateResolution,
    acceptCounseling,
  } = useAuth();

  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    photoUrl: '',
    category: 'other' as any,
    language: 'en-US',
  });

  const stats = getStats();

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user, allComplaintsInContext]);

  const loadComplaints = () => {
    const my = getMyComplaints();
    setMyComplaints(my);
    
    // Show all complaints from other students (except harassment cases which go directly to admin)
    const all = getAllComplaints();
    const others = all.filter(c => 
      c.studentId !== user?.id && 
      c.category !== 'harassment'
    );
    setAllComplaints(others);
  };

  const handleVoiceTranscript = (text: string, language: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + (prev.description ? ' ' : '') + text,
      language,
    }));
  };

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    raiseComplaint(
      formData.title,
      formData.description,
      formData.location,
      formData.photoUrl,
      formData.category,
      formData.language
    );
    setFormData({
      title: '',
      description: '',
      location: '',
      photoUrl: '',
      category: 'other',
      language: 'en-US',
    });
    setShowRaiseForm(false);
    loadComplaints();
  };

  const handleUpvote = (complaintId: string) => {
    upvoteComplaint(complaintId);
    loadComplaints();
  };

  const handleConfirmResolution = (complaintId: string) => {
    confirmResolution(complaintId);
    setShowRatingModal(complaintId);
  };

  const handleSubmitRating = () => {
    if (showRatingModal && rating > 0) {
      rateResolution(showRatingModal, rating, ratingComment);
      setShowRatingModal(null);
      setRating(0);
      setRatingComment('');
      loadComplaints();
    }
  };

  const handleAcceptCounseling = (complaintId: string) => {
    acceptCounseling(complaintId);
    loadComplaints();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Chart data
  const statusChartData = [
    { name: 'Awaiting Votes', value: myComplaints.filter(c => c.status === 'awaiting_votes').length, color: '#64748b' },
    { name: 'Pending', value: myComplaints.filter(c => c.status === 'pending').length, color: '#eab308' },
    { name: 'Assigned', value: myComplaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Resolved', value: myComplaints.filter(c => c.status === 'resolved').length, color: '#22c55e' },
    { name: 'Confirmed', value: myComplaints.filter(c => c.status === 'confirmed').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  const categoryChartData = [
    { name: 'Mess', value: myComplaints.filter(c => c.category === 'mess').length, color: '#f97316' },
    { name: 'Infrastructure', value: myComplaints.filter(c => c.category === 'infrastructure').length, color: '#3b82f6' },
    { name: 'Hygiene', value: myComplaints.filter(c => c.category === 'hygiene').length, color: '#22c55e' },
    { name: 'Security', value: myComplaints.filter(c => c.category === 'security').length, color: '#a855f7' },
    { name: 'Other', value: myComplaints.filter(c => ['academic', 'other'].includes(c.category)).length, color: '#6b7280' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-amber-400 mb-2">Student Dashboard</h1>
          <p className="text-slate-300">{user?.name} • Balance: ${user?.walletBalance}</p>
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
                    <p className="text-blue-200 text-sm">My Complaints</p>
                    <p className="text-3xl text-white mt-1">{myComplaints.length}</p>
                  </div>
                  <FileText className="h-12 w-12 text-blue-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-200 text-sm">Awaiting Votes</p>
                    <p className="text-3xl text-white mt-1">
                      {myComplaints.filter(c => c.status === 'awaiting_votes').length}
                    </p>
                  </div>
                  <Clock className="h-12 w-12 text-amber-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Resolved</p>
                    <p className="text-3xl text-white mt-1">
                      {myComplaints.filter(c => c.status === 'confirmed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-300 opacity-50" />
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
                    <p className="text-purple-200 text-sm">Total Upvotes</p>
                    <p className="text-3xl text-white mt-1">
                      {myComplaints.reduce((sum, c) => sum + c.upvotes, 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-300 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        {myComplaints.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {categoryChartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {/* Raise Complaint Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Button
            onClick={() => setShowRaiseForm(!showRaiseForm)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            size="lg"
          >
            {showRaiseForm ? 'Cancel' : 'Raise New Complaint'}
          </Button>
        </motion.div>

        {/* Raise Complaint Form */}
        {showRaiseForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card className="bg-slate-800 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Register New Grievance</CardTitle>
                <CardDescription className="text-slate-400">
                  AI-powered auto-categorization • Multi-language support • Voice input enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRaiseComplaint} className="space-y-6">
                  <div>
                    <label className="text-slate-300 mb-2 block">Complaint Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief description of the issue"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 mb-2 block">Category</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mess">🍽️ Mess/Food</SelectItem>
                        <SelectItem value="infrastructure">🏗️ Infrastructure</SelectItem>
                        <SelectItem value="harassment">🚨 Harassment (Urgent)</SelectItem>
                        <SelectItem value="hygiene">🧼 Hygiene</SelectItem>
                        <SelectItem value="security">🔒 Security</SelectItem>
                        <SelectItem value="academic">📚 Academic</SelectItem>
                        <SelectItem value="other">📋 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-slate-500 text-sm mt-1">
                      {formData.category === 'harassment' 
                        ? '⚠️ Goes directly to admin team. Counseling support available.'
                        : formData.category === 'mess' || formData.category === 'infrastructure'
                        ? '📊 Requires 5 upvotes to be visible to vendors'
                        : 'AI will help categorize your complaint'}
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-300 mb-2 block">Description (Text or Voice)</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the issue..."
                      required
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Voice Input Component */}
                  <VoiceInput onTranscript={handleVoiceTranscript} />

                  <div>
                    <label className="text-slate-300 mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Room number / Building / Area"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Image Upload Component */}
                  <ImageUpload 
                    onImageCapture={(imageDataUrl) => setFormData({ ...formData, photoUrl: imageDataUrl })}
                    currentImage={formData.photoUrl}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                    >
                      Submit Complaint
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowRaiseForm(false)}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRatingModal(null)}
          >
            <Card 
              className="bg-slate-800 border-amber-500/30 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="text-white">Rate the Resolution</CardTitle>
                <CardDescription className="text-slate-400">
                  Help us improve by rating the vendor's work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-300 mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-2"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 mb-2 block">Comment (Optional)</label>
                    <Textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your feedback..."
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={rating === 0}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                    >
                      Submit Rating
                    </Button>
                    <Button
                      onClick={() => setShowRatingModal(null)}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* My Complaints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-amber-400 mb-4">My Complaints</h2>
          {myComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No complaints raised yet. Click "Raise New Complaint" to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myComplaints
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800 border-amber-500/20 hover:border-amber-500/40 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                              {complaint.title}
                              {complaint.isUrgent && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                              ID: #{complaint.id} • {formatDate(complaint.timestamp)}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={CATEGORY_COLORS[complaint.category as keyof typeof CATEGORY_COLORS]}>
                              {complaint.category}
                            </Badge>
                            <Badge variant="outline" className={PRIORITY_COLORS[complaint.priority as keyof typeof PRIORITY_COLORS]}>
                              {complaint.status}
                            </Badge>
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
                          <div className="flex items-center gap-2 text-slate-300">
                            <Coins className="h-4 w-4 flex-shrink-0" />
                            <p>Deposit: ${complaint.depositAmount}</p>
                          </div>
                          <div className="flex items-center gap-2 text-purple-400">
                            <ArrowUp className="h-4 w-4 flex-shrink-0" />
                            <p>{complaint.upvotes} Upvotes {complaint.status === 'awaiting_votes' && `(${5 - complaint.upvotes} more needed)`}</p>
                          </div>

                          {complaint.status === 'awaiting_votes' && (
                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                              <p className="text-amber-400 text-sm">
                                ⏳ Awaiting community votes. Share with fellow students to reach 5 upvotes!
                              </p>
                            </div>
                          )}

                          {complaint.needsCounseling && !complaint.counselingAccepted && (
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="text-blue-400 mb-3">
                                <Heart className="inline h-4 w-4 mr-1" />
                                Counseling support is available for you. Would you like to speak with a counselor?
                              </p>
                              <Button
                                onClick={() => handleAcceptCounseling(complaint.id)}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                Accept Counseling
                              </Button>
                            </div>
                          )}

                          {complaint.counselingAccepted && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-green-400">
                                <CheckCircle className="inline h-4 w-4 mr-1" />
                                Counseling session will be scheduled soon. Stay strong!
                              </p>
                            </div>
                          )}

                          {complaint.assignedVendorName && (
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="text-blue-400">
                                Assigned to: {complaint.assignedVendorName}
                                {complaint.allocatedAmount && ` • Fund Allocated: $${complaint.allocatedAmount}`}
                              </p>
                            </div>
                          )}

                          {complaint.status === 'resolved' && complaint.proofUrl && (
                            <div className="mt-4 space-y-3">
                              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-400 mb-2">Vendor has submitted proof of resolution</p>
                                <a 
                                  href={complaint.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:text-amber-300 underline"
                                >
                                  View Proof
                                </a>
                              </div>
                              <Button
                                onClick={() => handleConfirmResolution(complaint.id)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                              >
                                Confirm Resolution
                              </Button>
                            </div>
                          )}

                          {complaint.status === 'confirmed' && (
                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                              <p className="text-emerald-400">
                                <CheckCircle className="inline h-4 w-4 mr-1" />
                                Resolution confirmed! Admin will release funds to vendor.
                              </p>
                              {complaint.averageRating && (
                                <div className="mt-2 flex items-center gap-2 text-amber-400">
                                  <Star className="h-4 w-4 fill-amber-400" />
                                  <span>Your Rating: {complaint.averageRating.toFixed(1)}/5</span>
                                </div>
                              )}
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

        {/* Community Complaints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-amber-400 mb-4">Community Complaints (Vote to Support)</h2>
          {allComplaints.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No community complaints to display
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allComplaints
                .sort((a, b) => b.upvotes - a.upvotes)
                .slice(0, 10)
                .map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-white">{complaint.title}</CardTitle>
                            <CardDescription className="text-slate-400">
                              By {complaint.studentName} • {formatDate(complaint.timestamp)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={CATEGORY_COLORS[complaint.category as keyof typeof CATEGORY_COLORS]}>
                            {complaint.category}
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

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-purple-400">
                              <ArrowUp className="h-5 w-5" />
                              <span className="text-lg">{complaint.upvotes}</span>
                            </div>
                            <Button
                              onClick={() => handleUpvote(complaint.id)}
                              disabled={hasUserUpvoted(complaint.id)}
                              variant="outline"
                              className={
                                hasUserUpvoted(complaint.id)
                                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                  : 'border-slate-600 text-slate-300 hover:border-purple-500 hover:text-purple-400'
                              }
                            >
                              <ArrowUp className="mr-2 h-4 w-4" />
                              {hasUserUpvoted(complaint.id) ? 'Upvoted' : 'Upvote'}
                            </Button>
                          </div>
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
