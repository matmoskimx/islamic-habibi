import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  MessageSquareHeart,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Lock,
  Unlock,
  MessageCircle
} from 'lucide-react';
import { MatrimonialProfile } from '../types';

interface ProfileCardProps {
  profile: MatrimonialProfile;
  onViewDetails: (profile: MatrimonialProfile) => void;
  onExpressInterest: (profile: MatrimonialProfile) => void;
  onToggleFavorite: (profileId: string) => void;
  isFavorited?: boolean;
  onStartChat?: (profile: MatrimonialProfile) => void;
  isChatUnlocked?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onViewDetails,
  onExpressInterest,
  onToggleFavorite,
  isFavorited = false,
  onStartChat,
  isChatUnlocked = false
}) => {
  const isFemale = profile.gender === 'female';
  const photos = profile.galleryPhotos && profile.galleryPhotos.length > 0 
    ? profile.galleryPhotos 
    : [profile.avatarUrl];

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="group relative bg-neutral-900/90 rounded-2xl border border-neutral-800 hover:border-emerald-700/60 shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Top Banner & Photo Area */}
      <div 
        onClick={() => onViewDetails(profile)}
        className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-950 cursor-pointer"
      >
        <img
          src={photos[currentPhotoIndex] || profile.avatarUrl}
          alt={profile.fullName}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter brightness-95"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = isFemale
              ? 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Gender / Seeker Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            isFemale 
              ? 'bg-rose-950/80 text-rose-200 border-rose-700/50' 
              : 'bg-emerald-950/80 text-emerald-200 border-emerald-700/50'
          }`}>
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{isFemale ? 'Sister · Seeking Groom' : 'Brother · Seeking Bride'}</span>
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Photos Count Indicator */}
            {photos.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-900/80 backdrop-blur-md text-neutral-300 border border-neutral-700">
                <Camera className="w-3 h-3 text-amber-300" />
                <span>{currentPhotoIndex + 1}/{photos.length}</span>
              </span>
            )}

            {/* Favorite Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(profile.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-rose-400 hover:bg-neutral-800'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Photo Navigation Controls */}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button
              type="button"
              onClick={prevPhoto}
              className="pointer-events-auto p-1.5 rounded-full bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800 hover:text-amber-300 transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="pointer-events-auto p-1.5 rounded-full bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800 hover:text-amber-300 transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Multi-Photo Dots */}
        {photos.length > 1 && (
          <div className="absolute top-12 right-3 flex flex-col gap-1 z-10">
            {photos.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentPhotoIndex ? 'bg-amber-400 h-3' : 'bg-neutral-500/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Floating Stats inside Photo */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-cinzel font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                {profile.fullName}
              </h3>
              <span className="text-sm font-semibold text-amber-400 bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-700">
                {profile.age} yrs
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{profile.city}, {profile.country}</span>
            </div>
          </div>

          {/* Verification Badge */}
          {profile.isVerified && (
            <div className="flex items-center gap-1 bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 text-[11px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Core Attributes */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-medium">{profile.profession}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <GraduationCap className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">{profile.education}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-medium">{profile.religiosity}</span>
            <span className="text-neutral-500">·</span>
            <span>{profile.maritalStatus}</span>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-xs text-neutral-400 line-clamp-2 italic leading-relaxed bg-neutral-950/50 p-2.5 rounded-xl border border-neutral-800/80">
          "{profile.aboutMe}"
        </p>

        {/* Spousal Wish Teaser */}
        <div className="text-[11px] text-neutral-300 bg-emerald-950/30 border border-emerald-900/40 p-2 rounded-xl">
          <span className="text-emerald-400 font-semibold block mb-0.5">Seeking:</span>
          <p className="line-clamp-2 text-neutral-300">{profile.seekingInSpouse}</p>
        </div>

        {/* Wali Protocol Badge */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Wali: {profile.waliRelation || 'Family Supervised'}</span>
          </div>
          <span className="text-neutral-500">{profile.interestsReceived || 0} Interests</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Halal Chat Button (Paid) */}
          {onStartChat && (
            <button
              type="button"
              onClick={() => onStartChat(profile)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${
                isChatUnlocked
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-neutral-950 shadow-emerald-950/40'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 text-neutral-950 shadow-amber-950/40'
              }`}
            >
              {isChatUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-neutral-950" />
                  <span>Open Halal Chat (Active)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-neutral-950" />
                  <span>Start Halal Chat ($3.00)</span>
                </>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(profile)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700 hover:border-neutral-500"
            >
              <span>View Photos ({photos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => onExpressInterest(profile)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800/90 hover:bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 border border-emerald-800/60 text-xs font-semibold transition-all"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
