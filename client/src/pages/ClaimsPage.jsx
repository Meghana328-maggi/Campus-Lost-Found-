import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  Shield,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';
import BadgeDisplay from '../components/common/BadgeDisplay';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'submitted'
  const [submittedClaims, setSubmittedClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approve / Reject modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const [subRes, recRes] = await Promise.all([
        api.get('/claims/my'),
        api.get('/claims/received'),
      ]);
      setSubmittedClaims(subRes.data.data.claims || []);
      setReceivedClaims(recRes.data.data.claims || []);
    } catch (err) {
      console.error('[Claims Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await api.put(`/claims/${selectedClaim._id}/approve`);
      success(`Claim approved for "${selectedClaim.itemId?.title}"! You can now chat to organize safe handover.`);
      setApproveConfirmOpen(false);
      fetchClaims();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to approve claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await api.put(`/claims/${selectedClaim._id}/reject`, {
        rejectionReason: rejectionReason || 'Verification details did not match.',
      });
      success('Claim rejected.');
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchClaims();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteHandover = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await api.put(`/claims/${selectedClaim._id}/complete`);
      success('Recovery completed! You earned +30 campus reputation points!');
      setCompleteConfirmOpen(false);
      fetchClaims();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to complete recovery.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentClaims = activeTab === 'received' ? receivedClaims : submittedClaims;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <span>Item Ownership Claims</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review incoming claims for your listings or track status of claims you submitted.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'received'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span>Claims Received for My Listings</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-extrabold">
            {receivedClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'submitted'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span>My Submitted Claims</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-extrabold">
            {submittedClaims.length}
          </span>
        </button>
      </div>

      {/* Claims List */}
      {loading ? (
        <LoadingSpinner />
      ) : currentClaims.length > 0 ? (
        <div className="space-y-4">
          {currentClaims.map((claim) => {
            const isApproved = claim.status === 'approved';
            const isPending = claim.status === 'pending';
            const isRejected = claim.status === 'rejected';
            const isCompleted = claim.status === 'completed';

            const otherUser = activeTab === 'received' ? claim.claimantId : claim.ownerId;

            return (
              <div
                key={claim._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                      {claim.itemId?.images && claim.itemId.images.length > 0 ? (
                        <img src={claim.itemId.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/items/${claim.itemId?._id}`}
                        className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 transition line-clamp-1"
                      >
                        {claim.itemId?.title || 'Item Details'}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {claim.itemId?.campusZone} • Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        isApproved
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isRejected
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Other User Info */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center">
                      {otherUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {activeTab === 'received' ? 'Claimant: ' : 'Item Poster: '} {otherUser?.name}
                      </span>
                      <span className="text-slate-500">{otherUser?.college}</span>
                    </div>
                  </div>

                  {otherUser?.reputationScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        ★ {otherUser.reputationScore} reputation
                      </span>
                      {otherUser.badges && otherUser.badges.length > 0 && (
                        <BadgeDisplay badge={otherUser.badges[0]} />
                      )}
                    </div>
                  )}
                </div>

                {/* Reason & Details */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Reason for Claim:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {claim.reason}
                    </p>
                  </div>

                  {claim.uniqueDetails && (
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Identifying Features Provided by Claimant:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                        {claim.uniqueDetails}
                      </p>
                    </div>
                  )}

                  {/* Verification Answers Comparison */}
                  {claim.verificationAnswers && claim.verificationAnswers.length > 0 && (
                    <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 space-y-2.5">
                      <span className="font-bold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Hidden Verification Answers:</span>
                      </span>
                      {claim.verificationAnswers.map((va, vIdx) => (
                        <div key={vIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900/60">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">Q: {va.question}</p>
                          <p className="text-brand-600 dark:text-brand-400 font-medium mt-0.5">A: {va.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {claim.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                      <span className="font-bold block mb-0.5">Rejection Note:</span>
                      <p>{claim.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/messages?targetUser=${otherUser?._id}&itemId=${claim.itemId?._id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                      <span>Message {otherUser?.name?.split(' ')[0]}</span>
                    </button>

                    <Link
                      to={`/items/${claim.itemId?._id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>Item Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {activeTab === 'received' && (
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setRejectModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setApproveConfirmOpen(true);
                            }}
                            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            Approve Claim
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setCompleteConfirmOpen(true);
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          Confirm Handover Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={activeTab === 'received' ? 'No claims received yet' : 'You have not submitted any claims'}
          description={
            activeTab === 'received'
              ? 'When someone recognizes an item you reported and submits verification answers, it will appear here.'
              : 'Browse found items to claim anything you lost on campus.'
          }
          actionText="Browse Found Items"
          actionLink="/found"
        />
      )}

      {/* Confirmation & Rejection Modals */}
      <ConfirmationModal
        isOpen={approveConfirmOpen}
        title="Approve Ownership Claim"
        message={`Are you sure you want to approve this claim? This will verify ${selectedClaim?.claimantId?.name} as the rightful owner and allow coordination for handover.`}
        confirmText="Approve Claim"
        danger={false}
        loading={actionLoading}
        onConfirm={handleApprove}
        onClose={() => setApproveConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={completeConfirmOpen}
        title="Confirm Safe Handover Completed"
        message="Did the physical handover safely take place? This marks the item recovered and awards reputation points to both participants."
        confirmText="Mark Completed"
        danger={false}
        loading={actionLoading}
        onConfirm={handleCompleteHandover}
        onClose={() => setCompleteConfirmOpen(false)}
      />

      {/* Custom Reject Modal with Reason */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Reject Ownership Claim
            </h3>
            <p className="text-xs text-slate-500">
              Please specify why this claim is being declined so the claimant is informed:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Verification answers did not match secret features, serial number mismatch..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white shadow-xs"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
