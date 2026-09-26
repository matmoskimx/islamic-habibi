import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  HeartHandshake, 
  MapPin, 
  CheckCircle2, 
  Heart,
  RefreshCw,
  Crown
} from 'lucide-react';
import { MatrimonialProfile } from '../types';
import { ProfileCard } from './ProfileCard';

interface ProfilesDirectoryProps {
  profiles: MatrimonialProfile[];
  onViewDetails: (profile: MatrimonialProfile) => void;
  onExpressInterest: (profile: MatrimonialProfile) => void;
  onOpenRegisterProfile: () => void;
  onOpenSubscribe: () => void;
  onToggleFavorite: (profileId: string) => void;
  favorites: string[];
  onStartChat?: (profile: MatrimonialProfile) => void;
  unlockedChatIds?: string[];
}

export const ProfilesDirectory: React.FC<ProfilesDirectoryProps> = ({
  profiles,
  onViewDetails,
  onExpressInterest,
  onOpenRegisterProfile,
  onOpenSubscribe,
  onToggleFavorite,
  favorites,
  onStartChat,
  unlockedChatIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [maritalFilter, setMaritalFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Extract distinct countries
  const countries = useMemo(() => {
    const list = Array.from(new Set(profiles.map((p) => p.country)));
    return ['all', ...list];
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches = 
          p.fullName.toLowerCase().includes(term) ||
          p.nickname.toLowerCase().includes(term) ||
          p.profession.toLowerCase().includes(term) ||
          p.city.toLowerCase().includes(term) ||
          p.country.toLowerCase().includes(term) ||
          p.education.toLowerCase().includes(term) ||
          p.aboutMe.toLowerCase().includes(term) ||
          p.seekingInSpouse.toLowerCase().includes(term);

        if (!matches) return false;
      }

      // Gender filter
      if (genderFilter !== 'all' && p.gender !== genderFilter) {
        return false;
      }

      // Country filter
      if (countryFilter !== 'all' && !p.country.toLowerCase().includes(countryFilter.toLowerCase())) {
        return false;
      }

      // Marital status filter
      if (maritalFilter !== 'all' && p.maritalStatus.toLowerCase() !== maritalFilter.toLowerCase()) {
        return false;
      }

      // Favorites only
      if (onlyFavorites && !favorites.includes(p.id)) {
        return false;
      }

      return true;
    });
  }, [profiles, searchTerm, genderFilter, countryFilter, maritalFilter, onlyFavorites, favorites]);

  const sistersCount = profiles.filter((p) => p.gender === 'female').length;
  const brothersCount = profiles.filter((p) => p.gender === 'male').length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Sacred Promise */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/60 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Public Matrimonial Directory · Helping Muslims Marry Muslims</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-cinzel font-bold text-neutral-100 tracking-tight leading-tight">
            Registered Muslim Candidates Seeking <span className="text-amber-400">Blessed Halal Nikah</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-2xl">
            Browse verified practicing brothers and sisters seeking marriage for the sake of Allah. All candidate introductions adhere strictly to Quran, Sunnah, and authorized Wali coordination.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-2xl">
              <span className="text-xs text-neutral-400 block">Total Active Profiles</span>
              <span className="text-xl sm:text-2xl font-cinzel font-bold text-emerald-400">{profiles.length}</span>
              <span className="text-[10px] text-neutral-500 block">Public & Ready</span>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-2xl">
              <span className="text-xs text-neutral-400 block">Sisters Seeking</span>
              <span className="text-xl sm:text-2xl font-cinzel font-bold text-rose-400">{sistersCount}</span>
              <span className="text-[10px] text-neutral-500 block">Wali Assisted</span>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-2xl">
              <span className="text-xs text-neutral-400 block">Brothers Seeking</span>
              <span className="text-xl sm:text-2xl font-cinzel font-bold text-teal-400">{brothersCount}</span>
              <span className="text-[10px] text-neutral-500 block">Sunnah Committed</span>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-2xl">
              <span className="text-xs text-neutral-400 block">Wali Protocol</span>
              <span className="text-xl sm:text-2xl font-cinzel font-bold text-amber-400">100%</span>
              <span className="text-[10px] text-neutral-500 block">Sharia Compliant</span>
            </div>
          </div>

          {/* Actions: Register Profile CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRegisterProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Your Profile (Join Now)</span>
            </button>

            <button
              onClick={onOpenSubscribe}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-semibold text-xs sm:text-sm transition-colors"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>View Matrimonial Subscriptions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Top Search Input & Gender Filter Pills */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name, city (e.g. Kampala, London), profession, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Gender Filter Tabs */}
          <div className="inline-flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                genderFilter === 'all'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({profiles.length})
            </button>

            <button
              onClick={() => setGenderFilter('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                genderFilter === 'female'
                  ? 'bg-rose-950 text-rose-200 border border-rose-800/60 shadow-sm'
                  : 'text-neutral-400 hover:text-rose-300'
              }`}
            >
              <span>🧕 Sisters ({sistersCount})</span>
            </button>

            <button
              onClick={() => setGenderFilter('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                genderFilter === 'male'
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-800/60 shadow-sm'
                  : 'text-neutral-400 hover:text-emerald-300'
              }`}
            >
              <span>🧔 Brothers ({brothersCount})</span>
            </button>
          </div>
        </div>

        {/* Second Row: Country, Marital Status & Saved Favorites Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Country Dropdown */}
            <div className="flex items-center gap-1.5 text-neutral-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Locations</option>
                <option value="Uganda">Uganda (Local)</option>
                <option value="United Kingdom">United Kingdom (UK)</option>
                <option value="United States">United States (USA)</option>
                <option value="Canada">Canada</option>
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="Kenya">Kenya (East Africa)</option>
              </select>
            </div>

            {/* Marital Status Dropdown */}
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="text-neutral-400">Status:</span>
              <select
                value={maritalFilter}
                onChange={(e) => setMaritalFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Marital Statuses</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                onlyFavorites
                  ? 'bg-rose-950/80 border-rose-600/70 text-rose-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-400' : ''}`} />
              <span>Saved Candidates ({favorites.length})</span>
            </button>
          </div>

          {/* Reset Filters / Profile count */}
          <div className="flex items-center gap-3 text-neutral-400">
            <span>
              Showing <strong className="text-neutral-100">{filteredProfiles.length}</strong> of {profiles.length} candidates
            </span>

            {(searchTerm || genderFilter !== 'all' || countryFilter !== 'all' || maritalFilter !== 'all' || onlyFavorites) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setGenderFilter('all');
                  setCountryFilter('all');
                  setMaritalFilter('all');
                  setOnlyFavorites(false);
                }}
                className="text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Profile Cards Grid */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onViewDetails={onViewDetails}
              onExpressInterest={onExpressInterest}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favorites.includes(profile.id)}
              onStartChat={onStartChat}
              isChatUnlocked={unlockedChatIds.includes(profile.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-neutral-900/60 rounded-3xl border border-neutral-800 space-y-4">
          <div className="w-14 h-14 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-cinzel font-bold text-neutral-200">
            No Matrimonial Profiles Match Your Current Filters
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Try resetting your filters or adjusting your location and search terms to discover more righteous practicing candidates.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setGenderFilter('all');
              setCountryFilter('all');
              setMaritalFilter('all');
              setOnlyFavorites(false);
            }}
            className="px-5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold"
          >
            Show All Profiles
          </button>
        </div>
      )}
    </div>
  );
};
