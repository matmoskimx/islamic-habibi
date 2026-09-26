import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Heart, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Camera 
} from 'lucide-react';
import { MatrimonialProfile } from '../types';

interface RegisterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (newProfile: MatrimonialProfile) => void;
}

export const RegisterProfileModal: React.FC<RegisterProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<MatrimonialProfile | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [age, setAge] = useState<number>(25);
  const [city, setCity] = useState('Kampala');
  const [country, setCountry] = useState('Uganda');
  const [nationality, setNationality] = useState('Ugandan');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'Never Married' | 'Divorced' | 'Widowed'>('Never Married');
  const [children, setChildren] = useState('None');
  
  // Religious practice
  const [religiosity, setReligiosity] = useState<'Practicing Sunnah' | 'Very Practicing / Hafiz' | 'Moderate Practicing' | 'Revert / Eager Learner'>('Practicing Sunnah');
  const [prayers, setPrayers] = useState<'Always 5 daily on time' | 'Usually 5 daily' | 'Striving to improve'>('Always 5 daily on time');
  const [fasting, setFasting] = useState<'Ramadan + voluntary Sunnah fasts' | 'Ramadan obligatory'>('Ramadan + voluntary Sunnah fasts');
  const [hijabOrBeard, setHijabOrBeard] = useState('Full Modest Hijab & Abaya');
  
  // Reflection & Spouse
  const [aboutMe, setAboutMe] = useState('');
  const [seekingInSpouse, setSeekingInSpouse] = useState('');
  const [dealbreakersInput, setDealbreakersInput] = useState('Missing obligatory prayers, Non-halal income, Smoking');
  const [hobbiesInput, setHobbiesInput] = useState('Reading Islamic literature, Family time, Cooking');
  const [languagesInput, setLanguagesInput] = useState('English, Luganda');
  const [willingToRelocate, setWillingToRelocate] = useState<'Yes, internationally' | 'Within country only' | 'Prefers spouse to relocate' | 'Open to discussion'>('Open to discussion');
  
  // Wali Information
  const [waliName, setWaliName] = useState('');
  const [waliRelation, setWaliRelation] = useState<'Father' | 'Brother' | 'Uncle' | 'Guardian / Imam'>('Father');
  const [waliContactPhone, setWaliContactPhone] = useState('+256 744 042 286');
  const [waliContactEmail, setWaliContactEmail] = useState('');
  
  // Photo
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isOpen) return null;

  const handleGenderChange = (newGender: 'female' | 'male') => {
    setGender(newGender);
    if (newGender === 'female') {
      setHijabOrBeard('Full Modest Hijab & Abaya');
      if (!avatarUrl) {
        setAvatarUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80');
      }
    } else {
      setHijabOrBeard('Full Sunnah Beard');
      if (!avatarUrl) {
        setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !profession.trim() || !aboutMe.trim() || !seekingInSpouse.trim()) {
      setErrorMessage('Please fill in your Full Name, Profession, About Me statement, and Spousal desires.');
      return;
    }

    const defaultAvatar = gender === 'female'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          nickname: nickname.trim() || fullName.trim().split(' ')[0],
          gender,
          age: Number(age),
          city: city.trim(),
          country: country.trim(),
          nationality: nationality.trim(),
          profession: profession.trim(),
          education: education.trim() || 'University Degree',
          maritalStatus,
          children,
          religiosity,
          prayers,
          fasting,
          hijabOrBeard,
          aboutMe: aboutMe.trim(),
          seekingInSpouse: seekingInSpouse.trim(),
          dealbreakers: dealbreakersInput.split(',').map((s) => s.trim()).filter(Boolean),
          hobbies: hobbiesInput.split(',').map((s) => s.trim()).filter(Boolean),
          languages: languagesInput.split(',').map((s) => s.trim()).filter(Boolean),
          willingToRelocate,
          avatarUrl: avatarUrl.trim() || defaultAvatar,
          hasWaliInvolved: true,
          waliRelation,
          waliName: waliName.trim() || `${waliRelation} of ${fullName}`,
          waliContactPhone: waliContactPhone.trim() || '+256744042286',
          waliContactEmail: waliContactEmail.trim() || 'wali@islamichabibi.org',
          subscriptionTier: 'Free Member'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register profile.');
      }

      setSuccessData(data.profile);
      onProfileCreated(data.profile);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Database submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/40 border border-emerald-500/40 flex items-center justify-center text-amber-300">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
                <span>Register Matrimonial Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                  Live Database
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Helping Muslims marry Muslims upon Quran & Sunnah with dignity and family oversight
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {successData ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-900/60 border border-emerald-500 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-cinzel font-bold text-emerald-200">
                Alhamdulillah! Your Profile is Live
              </h4>
              <p className="text-xs text-neutral-300 max-w-lg mx-auto leading-relaxed">
                Your matrimonial profile for <strong className="text-amber-300">{successData.fullName}</strong> ({successData.gender === 'female' ? 'Sister' : 'Brother'}, {successData.city}) has been recorded into the live Islamic Habibi database and published to the public matrimonial directory.
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-neutral-950 font-bold text-xs shadow-lg transition-all"
                >
                  View in Directory
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Gender & Identity */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  1. Basic Identity & Candidate Status
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      gender === 'female'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500 shadow-md'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span>🧕 Muslimah Sister (Seeking Groom)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      gender === 'male'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 shadow-md'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span>🧔 Muslim Brother (Seeking Bride)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={gender === 'female' ? 'e.g. Fatima Namubiru' : 'e.g. Tariq Al-Mansoor'}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Display / Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Fatima"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Age (Years) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={75}
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      City of Residence <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kampala, London, Dallas"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Country <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Uganda, UK, USA"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Ugandan"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Marital Status
                    </label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as 'Never Married' | 'Divorced' | 'Widowed')}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Children
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="None">None</option>
                      <option value="1 child">1 child</option>
                      <option value="2 children">2 children</option>
                      <option value="3+ children">3+ children</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Profession & Education */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  2. Career, Education & Relocation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Profession / Occupation <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Clinical Pharmacist, Civil Engineer"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Education Level / Degree
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. Bachelor of Pharmacy, Makerere Univ"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Willingness to Relocate
                    </label>
                    <select
                      value={willingToRelocate}
                      onChange={(e) => setWillingToRelocate(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Open to discussion">Open to discussion</option>
                      <option value="Yes, internationally">Yes, internationally</option>
                      <option value="Within country only">Within country only</option>
                      <option value="Prefers spouse to relocate">Prefers spouse to relocate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      placeholder="English, Luganda, Arabic"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Deen & Religious Commitments */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  3. Deen & Religious Observance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Daily Obligatory Prayers (Salah)
                    </label>
                    <select
                      value={prayers}
                      onChange={(e) => setPrayers(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Always 5 daily on time">Always 5 daily on time</option>
                      <option value="Usually 5 daily">Usually 5 daily</option>
                      <option value="Striving to improve">Striving to improve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Religiosity & Sunnah Focus
                    </label>
                    <select
                      value={religiosity}
                      onChange={(e) => setReligiosity(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Practicing Sunnah">Practicing Sunnah</option>
                      <option value="Very Practicing / Hafiz">Very Practicing / Hafiz</option>
                      <option value="Moderate Practicing">Moderate Practicing</option>
                      <option value="Revert / Eager Learner">Revert / Eager Learner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Appearance (Hijab / Beard)
                    </label>
                    <input
                      type="text"
                      value={hijabOrBeard}
                      onChange={(e) => setHijabOrBeard(e.target.value)}
                      placeholder="e.g. Modest Hijab & Abaya / Full Beard"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Fasting Commitment
                    </label>
                    <select
                      value={fasting}
                      onChange={(e) => setFasting(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Ramadan + voluntary Sunnah fasts">Ramadan + voluntary Sunnah fasts</option>
                      <option value="Ramadan obligatory">Ramadan obligatory</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Personal Statement & Seeking in Spouse */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  4. About You & Your Ideal Spouse
                </h4>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Personal Reflection (About Me) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Describe your character, what brings barakah to your daily life, your Islamic goals and personality..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    What You Are Seeking in a Spouse <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={seekingInSpouse}
                    onChange={(e) => setSeekingInSpouse(e.target.value)}
                    placeholder="Describe the qualities, akhlaaq, spiritual habits, and emotional qualities you seek in your future spouse..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Dealbreakers (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={dealbreakersInput}
                    onChange={(e) => setDealbreakersInput(e.target.value)}
                    placeholder="e.g. Missing prayers, Smoking, Dishonesty"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Step 5: Wali & Family Oversight */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>5. Wali / Guardian Contact Information</span>
                  </h4>
                  <span className="text-[11px] text-amber-300 font-mono">Required for Halal Process</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Wali Relation
                    </label>
                    <select
                      value={waliRelation}
                      onChange={(e) => setWaliRelation(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Father">Father</option>
                      <option value="Brother">Brother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Guardian / Imam">Guardian / Imam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Wali's Full Name
                    </label>
                    <input
                      type="text"
                      value={waliName}
                      onChange={(e) => setWaliName(e.target.value)}
                      placeholder="e.g. Hajj Sulaiman Nsubuga"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Wali's Phone / WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={waliContactPhone}
                      onChange={(e) => setWaliContactPhone(e.target.value)}
                      placeholder="+256 744 042 286"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Photo selection / URL */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-medium text-neutral-300">
                  Profile Photo URL (Optional or uses verified modest avatar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl(gender === 'female' 
                        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 shrink-0"
                  >
                    Default Photo
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving into Database...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Profile Right Away</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
