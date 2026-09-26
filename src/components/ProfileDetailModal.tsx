import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Phone, 
  Mail, 
  MessageSquareHeart, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Calendar,
  Globe,
  Languages,
  BookOpen,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';
import { MatrimonialProfile } from '../types';

interface ProfileDetailModalProps {
  profile: MatrimonialProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onExpressInterest: (profile: MatrimonialProfile) => void;
  onOpenSubscribe: () => void;
  onToggleFavorite: (profileId: string) => void;
  isFavorited?: boolean;
  onStartChat?: (profile: MatrimonialProfile) => void;
  isChatUnlocked?: boolean;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onExpressInterest,
  onOpenSubscribe,
  onToggleFavorite,
  isFavorited = false,
  onStartChat,
  isChatUnlocked = false
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset photo index when profile changes
  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [profile?.id]);

  // Interest Form Fields
  const [suitorName, setSuitorName] = useState('');
  const [suitorGender, setSuitorGender] = useState<'male' | 'female'>('male');
  const [suitorPhone, setSuitorPhone] = useState('');
  const [suitorEmail, setSuitorEmail] = useState('');
  const [suitorMessage, setSuitorMessage] = useState('');
  const [includeWali, setIncludeWali] = useState(true);
  const [suitorWaliPhone, setSuitorWaliPhone] = useState('');

  if (!isOpen || !profile) return null;

  const isFemale = profile.gender === 'female';

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmissionSuccess(null);

    if (!suitorName.trim() || !suitorPhone.trim() || !suitorMessage.trim()) {
      setErrorMessage('Please fill in your name, contact phone, and respectful introductory message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: suitorName,
          senderGender: suitorGender,
          senderPhone: suitorPhone,
          senderEmail: suitorEmail || 'suitor@islamichabibi.org',
          message: suitorMessage,
          includeWaliContact: includeWali,
          senderWaliPhone: suitorWaliPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit interest.');
      }

      setSubmissionSuccess(data.message || 'Halal matrimonial interest respectfully sent!');
      // Update local interest count
      profile.interestsReceived = (profile.interestsReceived || 0) + 1;
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Connection failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background Photo Vignette & Gallery Controls */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-neutral-950 shrink-0 group">
          {(() => {
            const photos = profile.galleryPhotos && profile.galleryPhotos.length > 0 
              ? profile.galleryPhotos 
              : [profile.avatarUrl];
            const currentImg = photos[selectedPhotoIndex] || profile.avatarUrl;

            return (
              <>
                <img
                  src={currentImg}
                  alt={`${profile.fullName} - Photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-cover object-top filter brightness-90 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = isFemale
                      ? 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

                {/* Left/Right Photo Carousel Arrows */}
                {photos.length > 1 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                      className="pointer-events-auto p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 hover:text-amber-300 transition-colors shadow-lg backdrop-blur-md"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)}
                      className="pointer-events-auto p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 hover:text-amber-300 transition-colors shadow-lg backdrop-blur-md"
                      title="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Photo Counter Pill */}
                {photos.length > 1 && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/80 border border-neutral-700 backdrop-blur-md text-xs font-mono text-amber-300">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo {selectedPhotoIndex + 1} of {photos.length}</span>
                  </div>
                )}
              </>
            );
          })()}

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => onToggleFavorite(profile.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-rose-400'
              }`}
              title="Bookmark"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-neutral-900/80 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Floating Profile Title */}
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                  isFemale 
                    ? 'bg-rose-950/80 text-rose-200 border-rose-700/50' 
                    : 'bg-emerald-950/80 text-emerald-200 border-emerald-700/50'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isFemale ? 'Muslimah Sister · Seeking Groom' : 'Muslim Brother · Seeking Bride'}</span>
                </span>

                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ID & Wali Verified</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                  <span>{profile.subscriptionTier}</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl sm:text-4xl font-cinzel font-bold text-neutral-100">
                  {profile.fullName}
                </h2>
                <span className="text-xl font-bold text-amber-400">
                  {profile.age} years
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-300 mt-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{profile.city}, {profile.country}</span>
                <span className="text-neutral-500">·</span>
                <span>{profile.nationality}</span>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInterestForm(!showInterestForm)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-neutral-950 font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>{showInterestForm ? 'View Profile Info' : 'Express Halal Interest'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Bar (if more than 1 photo) */}
        {profile.galleryPhotos && profile.galleryPhotos.length > 1 && (
          <div className="px-5 sm:px-8 py-3 bg-neutral-950 border-b border-neutral-800/80 flex items-center gap-3 overflow-x-auto shrink-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-1 shrink-0">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Photos:</span>
            </span>
            <div className="flex items-center gap-2.5">
              {profile.galleryPhotos.map((photoUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    idx === selectedPhotoIndex
                      ? 'border-amber-400 scale-105 shadow-md shadow-amber-950'
                      : 'border-neutral-700 opacity-60 hover:opacity-100 hover:border-neutral-500'
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* Halal Interest Form (Toggleable) */}
          {showInterestForm && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-neutral-950 to-neutral-950 border border-emerald-700/60 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareHeart className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-cinzel text-lg font-bold text-emerald-200">
                    Express Halal Matrimonial Interest
                  </h3>
                </div>
                <button
                  onClick={() => setShowInterestForm(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Send a respectful, formal message to <strong className="text-amber-300">{profile.fullName}</strong> and her/his Wali. 
                Under Islamic Habibi’s Halal Zawaj Protocol, messages are delivered with dignity and family oversight.
              </p>

              {submissionSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Interest Dispatched Successfully</span>
                  </div>
                  <p className="text-xs text-emerald-300">{submissionSuccess}</p>
                  <p className="text-[11px] text-neutral-400">
                    The Wali has been notified. You may also subscribe to an Islamic Habibi plan to request immediate telephone mediation.
                  </p>
                  <button
                    onClick={() => {
                      setSubmissionSuccess(null);
                      setShowInterestForm(false);
                    }}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-800 text-xs text-white font-medium hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInterest} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Your Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={suitorName}
                        onChange={(e) => setSuitorName(e.target.value)}
                        placeholder="e.g. Brother Ahmad / Sister Maryam"
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        You Are <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={suitorGender}
                        onChange={(e) => setSuitorGender(e.target.value as 'male' | 'female')}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="male">Brother seeking Marriage</option>
                        <option value="female">Sister seeking Marriage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Your WhatsApp / Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={suitorPhone}
                        onChange={(e) => setSuitorPhone(e.target.value)}
                        placeholder="e.g. +256 701 234 567"
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        value={suitorEmail}
                        onChange={(e) => setSuitorEmail(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Respectful Introductory Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={suitorMessage}
                      onChange={(e) => setSuitorMessage(e.target.value)}
                      placeholder="Assalamu alaikum wa Rahmatullah, I came across your profile on Islamic Habibi and was impressed by your Islamic commitment and values..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Wali Checkbox */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={includeWali}
                        onChange={(e) => setIncludeWali(e.target.checked)}
                        className="rounded border-neutral-700 text-emerald-600 focus:ring-0"
                      />
                      <span>Include my Wali / Guardian’s contact details for Islamic propriety</span>
                    </label>

                    {includeWali && (
                      <input
                        type="tel"
                        value={suitorWaliPhone}
                        onChange={(e) => setSuitorWaliPhone(e.target.value)}
                        placeholder="Your Wali's Phone (Father/Brother/Guardian)"
                        className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInterestForm(false)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700"
                    >
                      Close Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-neutral-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Halal Interest'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Section 1: About Me & Personal Statement */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Personal Reflection & Islamic Character
            </h4>
            <div className="bg-neutral-950/70 p-5 rounded-2xl border border-neutral-800/80 leading-relaxed text-sm text-neutral-200">
              <p className="italic">"{profile.aboutMe}"</p>
            </div>
          </div>

          {/* Section 2: Deen & Religious Commitment Grid */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Deen & Practice (According to Quran & Sunnah)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Obligatory Prayers</span>
                <span className="text-xs font-semibold text-emerald-300">{profile.prayers}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Fasting (Sawm)</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.fasting}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Attire & Sunnah Appearance</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.hijabOrBeard}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Islamic Methodology</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.islamicSect}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Dietary Observance</span>
                <span className="text-xs font-semibold text-emerald-300">{profile.diet}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Religiosity Level</span>
                <span className="text-xs font-semibold text-amber-300">{profile.religiosity}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Life, Career & Education */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Education, Career & Family Status</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Profession</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.profession}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Education</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.education}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Marital Status & Children</span>
                <span className="text-xs font-semibold text-neutral-200">
                  {profile.maritalStatus} {profile.children !== 'None' ? `(${profile.children})` : '(No children)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Relocation Preference</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.willingToRelocate}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Languages Spoken</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.languages?.join(', ') || 'English'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Registered Since</span>
                <span className="text-xs font-semibold text-neutral-200">{profile.memberSince}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Desired Spouse & Dealbreakers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                What I Am Seeking in a Spouse
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {profile.seekingInSpouse}
              </p>
            </div>

            <div className="bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-rose-400">
                Dealbreakers & Non-Negotiables
              </h4>
              {profile.dealbreakers && profile.dealbreakers.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {profile.dealbreakers.map((db, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{db}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-400">Standard Sharia propriety and respect for Islamic obligations.</p>
              )}
            </div>
          </div>

          {/* Section 5: Wali & Family Oversight (Halal Protocol) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-neutral-950 to-amber-950/30 border border-emerald-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-cinzel font-bold text-amber-200">
                  Authorized Wali & Family Matrimonial Protocol
                </h4>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60 font-mono">
                100% Sharia Guarded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Wali Guardian</span>
                <span className="font-semibold text-neutral-100">{profile.waliName || 'Father / Guardian'}</span>
                <span className="text-[11px] text-amber-300 block mt-0.5">({profile.waliRelation || 'Father'})</span>
              </div>

              <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Wali Contact Telephone</span>
                <span className="font-mono text-emerald-300 font-semibold">{profile.waliContactPhone || '+256 744 042 286'}</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Verified WhatsApp / Direct Call</span>
              </div>

              <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Matrimonial Channel</span>
                <span className="text-neutral-200 font-semibold">Islamic Habibi Concierge</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Router: +256 744 042 286</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-900/50 flex-wrap gap-2 text-xs">
              <p className="text-neutral-400 text-[11px] max-w-xl">
                Ready to take the next step towards Nikah? Unlock direct scholar mediation and official Wali introductions via our monthly or quarterly membership plans.
              </p>
              <button
                onClick={onOpenSubscribe}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Unlock Matrimonial Plans ($19+)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Islamic Habibi · Verified Halal Matrimonial Network</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {onStartChat && (
              <button
                onClick={() => {
                  onClose();
                  onStartChat(profile);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-105 ${
                  isChatUnlocked
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-neutral-950 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 shadow-amber-950/40'
                }`}
              >
                {isChatUnlocked ? (
                  <>
                    <Unlock className="w-4 h-4 text-neutral-950" />
                    <span>Open Halal Chat (Active)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-neutral-950" />
                    <span>Start Halal Chat ($3.00)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowInterestForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold text-xs shadow-md transition-all hover:scale-105"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Express Interest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
