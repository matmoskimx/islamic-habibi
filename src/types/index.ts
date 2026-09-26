export interface ServicePackage {
  id: string;
  code: string;
  title: string;
  arabicTitle: string;
  category: 'singles_search' | 'wali_assisted' | 'nikah_contract' | 'premarital_counseling' | 'vip_concierge';
  priceUSD: number;
  billingType: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'one-time';
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  tagline: string;
  suitableFor: string;
}

export type PaymentMethod = 'airtel_money' | 'mtn_momo' | 'card' | 'bank_transfer';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  reference: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: 'USD' | 'UGX';
  amountUSD: number;
  amountUGX: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  recipientPhone: string; // "256744042286"
  recipientName: string; // "Islamic Habibi"
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  ussdPrompt: string;
  channel: 'API' | 'PORTAL' | 'TERMINAL';
  preferredDate?: string;
  preferredTime?: string;
}

export interface MerchantProfile {
  businessName: string;
  brandTagline: string;
  recipientPhone: string;
  formattedPhone: string;
  country: string;
  settlementMethod: string;
  primaryCarriers: string[];
  merchantCode: string;
  status: 'ACTIVE_VERIFIED';
  contactEmail: string;
  supportPhone: string;
  totalReceivedUSD: number;
  completedCount: number;
}

export interface ChargeRequest {
  packageId?: string;
  customPackageTitle?: string;
  amount: number;
  currency?: 'USD' | 'UGX';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  channel?: 'API' | 'PORTAL' | 'TERMINAL';
}

export interface MatrimonialProfile {
  id: string;
  fullName: string;
  nickname: string;
  gender: 'female' | 'male';
  age: number;
  city: string;
  country: string;
  nationality: string;
  profession: string;
  education: string;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  children: string;
  religiosity: 'Practicing Sunnah' | 'Very Practicing / Hafiz' | 'Moderate Practicing' | 'Revert / Eager Learner';
  prayers: 'Always 5 daily on time' | 'Usually 5 daily' | 'Striving to improve';
  fasting: 'Ramadan + voluntary Sunnah fasts' | 'Ramadan obligatory';
  hijabOrBeard: string;
  islamicSect: 'Sunni / Ahl us-Sunnah' | 'General Practicing Muslim';
  diet: 'Strict Halal & Zabiha only';
  aboutMe: string;
  seekingInSpouse: string;
  dealbreakers?: string[];
  hobbies: string[];
  languages: string[];
  willingToRelocate: 'Yes, internationally' | 'Within country only' | 'Prefers spouse to relocate' | 'Open to discussion';
  avatarUrl: string;
  galleryPhotos?: string[];
  isVerified: boolean;
  hasWaliInvolved: boolean;
  waliRelation?: 'Father' | 'Brother' | 'Uncle' | 'Guardian / Imam';
  waliName?: string;
  waliContactPhone?: string;
  waliContactEmail?: string;
  memberSince: string;
  subscriptionTier: 'Free Member' | 'Search Pass' | 'Zawaj Matchmaker' | 'VIP Spousal Patron';
  interestsReceived: number;
  isFavorited?: boolean;
}

export interface ProfileInterestRequest {
  profileId: string;
  senderName: string;
  senderGender: 'female' | 'male';
  senderPhone: string;
  senderEmail: string;
  message: string;
  includeWaliContact: boolean;
  senderWaliPhone?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'candidate' | 'wali' | 'system';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateNickname: string;
  candidateAvatar: string;
  candidateGender: 'female' | 'male';
  candidateCity: string;
  candidateCountry: string;
  candidateProfession: string;
  candidateReligiosity: string;
  waliName?: string;
  waliRelation?: string;
  waliPhone?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  expiresAt?: string;
  amountPaidUSD?: number;
  lastMessageText?: string;
  lastMessageTime?: string;
  messages: ChatMessage[];
}

export interface PaidChatUnlockRequest {
  candidateId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  planType: 'single_chat' | 'starter_pass' | 'gold_pass';
  amountUSD: number;
}
