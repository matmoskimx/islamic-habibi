import fs from 'fs';
import path from 'path';
import { 
  ServicePackage, 
  Transaction, 
  MatrimonialProfile, 
  ProfileInterestRequest,
  ChatSession,
  ChatMessage,
  PaidChatUnlockRequest
} from '../types';
import { INITIAL_PACKAGES } from '../data/packages';
import { INITIAL_PROFILES } from '../data/profiles';

export interface RecipientRecord {
  id: string;
  phoneNumber: string; // "256744042286"
  formattedPhone: string; // "+256 744 042 286"
  businessName: string; // "Islamic Habibi"
  tagline: string;
  ownerName: string;
  ownerEmail: string; // "mosesmatovu082@gmail.com"
  country: string;
  currency: string;
  settlementMethod: string;
  primaryCarriers: string[];
  merchantCode: string;
  status: 'VERIFIED_ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  isDefault: boolean;
  kyc: {
    nin: string;
    nationalIdVerified: boolean;
    phoneOtpVerified: boolean;
    emailVerified: boolean;
    shariaBoardCertified: boolean;
    verifiedAt: string;
    verifiedBy: string;
  };
  limits: {
    maxSingleTransactionUSD: number;
    dailyLimitUSD: number;
    maxSingleTransactionUGX: number;
    dailyLimitUGX: number;
  };
  totalReceivedUSD: number;
  totalReceivedUGX: number;
  totalTransactions: number;
  availableBalanceUSD: number;
  updatedAt: string;
}

export interface VerificationCodeRecord {
  id: string;
  target: string;
  code: string;
  purpose: 'REGISTRATION' | 'MERCHANT_VERIFY' | 'PAYMENT_AUTH' | 'PASSWORD_RESET';
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  attempts: number;
  metadata?: Record<string, unknown>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'MERCHANT_ADMIN' | 'SCHOLAR' | 'CLIENT';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface EmailDispatchRecord {
  id: string;
  to: string;
  subject: string;
  code: string;
  purpose: string;
  bodyText: string;
  sentAt: string;
  status: 'DELIVERED';
}

export interface DatabaseSchema {
  version: string;
  createdAt: string;
  updatedAt: string;
  recipients: RecipientRecord[];
  users: UserRecord[];
  verificationCodes: VerificationCodeRecord[];
  emailDispatches: EmailDispatchRecord[];
  packages: ServicePackage[];
  transactions: Transaction[];
  profiles: MatrimonialProfile[];
  chatSessions: ChatSession[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'islamic_habibi_database.json');

const DEFAULT_PRIMARY_RECIPIENT: RecipientRecord = {
  id: 'recip-ih-256744042286',
  phoneNumber: '256744042286',
  formattedPhone: '+256 744 042 286',
  businessName: 'Islamic Habibi',
  tagline: 'Helping Muslims Marry Muslims upon Quran & Sunnah',
  ownerName: 'Moses Matovu',
  ownerEmail: 'mosesmatovu082@gmail.com',
  country: 'Uganda',
  currency: 'USD',
  settlementMethod: 'Direct Mobile Money & Card Real-Time Settlement',
  primaryCarriers: ['Airtel Money Uganda (*185#)', 'MTN Mobile Money (*165#)', 'Visa / Mastercard Card Pay'],
  merchantCode: 'HABIBI-256744042286',
  status: 'VERIFIED_ACTIVE',
  isDefault: true,
  kyc: {
    nin: 'CM910248192019',
    nationalIdVerified: true,
    phoneOtpVerified: true,
    emailVerified: true,
    shariaBoardCertified: true,
    verifiedAt: '2026-01-15T08:00:00.000Z',
    verifiedBy: 'Uganda Sharia Matrimonial Council & Telecom Escrow'
  },
  limits: {
    maxSingleTransactionUSD: 5000,
    dailyLimitUSD: 25000,
    maxSingleTransactionUGX: 20000000,
    dailyLimitUGX: 100000000
  },
  totalReceivedUSD: 795,
  totalReceivedUGX: 2981250,
  totalTransactions: 5,
  availableBalanceUSD: 795,
  updatedAt: new Date().toISOString()
};

const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'usr-admin-01',
    name: 'Moses Matovu',
    email: 'mosesmatovu082@gmail.com',
    phone: '+256744042286',
    role: 'MERCHANT_ADMIN',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr-scholar-02',
    name: 'Sheikh Sulaiman Kiggundu',
    email: 'scholar.sulaiman@islamichabibi.ug',
    phone: '+256772991024',
    role: 'SCHOLAR',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2026-02-01T09:00:00.000Z'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Always refresh matrimonial packages and recipient branding
        parsed.packages = [...INITIAL_PACKAGES];
        if (!parsed.profiles || parsed.profiles.length === 0) {
          parsed.profiles = [...INITIAL_PROFILES];
        } else {
          // Update seeded profiles with enriched photos & galleries
          for (const initProf of INITIAL_PROFILES) {
            const existing = parsed.profiles.find((p) => p.id === initProf.id);
            if (existing) {
              existing.avatarUrl = initProf.avatarUrl;
              existing.galleryPhotos = initProf.galleryPhotos;
            } else {
              parsed.profiles.push(initProf);
            }
          }
        }

        // Initialize chat sessions if missing
        if (!parsed.chatSessions || parsed.chatSessions.length === 0) {
          parsed.chatSessions = this.createInitialChatSessions(parsed.profiles || INITIAL_PROFILES);
        } else {
          for (const initProf of (parsed.profiles || INITIAL_PROFILES)) {
            const existing = parsed.chatSessions.find((s) => s.candidateId === initProf.id);
            if (!existing) {
              const newSession = this.createInitialChatSessions([initProf])[0];
              if (newSession) parsed.chatSessions.push(newSession);
            }
          }
        }

        const recip = parsed.recipients.find((r) => r.phoneNumber === '256744042286');
        if (recip) {
          recip.tagline = 'Helping Muslims Marry Muslims upon Quran & Sunnah';
          recip.currency = 'USD';
        } else {
          parsed.recipients.unshift(DEFAULT_PRIMARY_RECIPIENT);
        }
        this.saveDatabase(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('[Database] Failed to read database file, initializing default:', e);
    }

    const initialSchema: DatabaseSchema = {
      version: '2.2.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipients: [DEFAULT_PRIMARY_RECIPIENT],
      users: DEFAULT_USERS,
      verificationCodes: [],
      emailDispatches: [],
      packages: [...INITIAL_PACKAGES],
      profiles: [...INITIAL_PROFILES],
      chatSessions: this.createInitialChatSessions(INITIAL_PROFILES),
      transactions: [
        {
          id: 'txn-101',
          reference: 'IH-TXN-847291',
          packageId: 'pkg-nikah-solemnization',
          packageName: 'Sacred Nikah Solemnization & Sharia Contract',
          amount: 149,
          currency: 'USD',
          amountUSD: 149,
          amountUGX: 558750,
          customerName: 'Sulaiman & Maryam Kigozi',
          customerPhone: '+256772189402',
          customerEmail: 's.kigozi@kampalamail.ug',
          paymentMethod: 'mtn_momo',
          recipientPhone: '256744042286',
          recipientName: 'Islamic Habibi',
          status: 'completed',
          notes: 'Sacred Nikah contract drafting and scholar officiation',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 5 + 45000).toISOString(),
          ussdPrompt: 'Approved $149 (UGX 558,750) via MTN MoMo to Islamic Habibi (256744042286)',
          channel: 'PORTAL',
          preferredDate: '2026-10-15',
          preferredTime: '14:00'
        },
        {
          id: 'txn-102',
          reference: 'IH-TXN-930412',
          packageId: 'pkg-wali-circle',
          packageName: 'Wali Family Matrimonial Concierge',
          amount: 79,
          currency: 'USD',
          amountUSD: 79,
          amountUGX: 296250,
          customerName: 'Al-Hajj Bashir Nsubuga (Wali for Daughter)',
          customerPhone: '+256701552390',
          customerEmail: 'bashir@nsubugatrading.co.ug',
          paymentMethod: 'airtel_money',
          recipientPhone: '256744042286',
          recipientName: 'Islamic Habibi',
          status: 'completed',
          notes: 'Quarterly Wali-to-Wali formal introductions and family lineage review',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 18 + 30000).toISOString(),
          ussdPrompt: 'Approved $79 (UGX 296,250) via Airtel Money to Islamic Habibi (256744042286)',
          channel: 'API',
          preferredDate: '2026-10-02',
          preferredTime: '10:00'
        },
        {
          id: 'txn-103',
          reference: 'IH-TXN-418903',
          packageId: 'pkg-zawaj-matchmaker',
          packageName: 'Zawaj Blessed Matchmaker & Chaperone',
          amount: 39,
          currency: 'USD',
          amountUSD: 39,
          amountUGX: 146250,
          customerName: 'Amina Nalwanga',
          customerPhone: '+256784309871',
          customerEmail: 'amina.nalwanga@outlook.com',
          paymentMethod: 'airtel_money',
          recipientPhone: '256744042286',
          recipientName: 'Islamic Habibi',
          status: 'completed',
          notes: 'Monthly personalized matchmaking & chaperoned virtual introductions',
          createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 28 + 60000).toISOString(),
          ussdPrompt: 'Approved $39 via Airtel Money to Islamic Habibi (256744042286)',
          channel: 'PORTAL'
        },
        {
          id: 'txn-104',
          reference: 'IH-TXN-552194',
          packageId: 'pkg-premarital-counsel',
          packageName: 'Pre-Marital Harmony & Istikhara Guidance',
          amount: 29,
          currency: 'USD',
          amountUSD: 29,
          amountUGX: 108750,
          customerName: 'Hassan Ssekandi',
          customerPhone: '+256752889104',
          customerEmail: 'hssekandi@gmail.com',
          paymentMethod: 'mtn_momo',
          recipientPhone: '256744042286',
          recipientName: 'Islamic Habibi',
          status: 'completed',
          notes: 'Istikhara reflection and spousal financial alignment session',
          createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 42 + 25000).toISOString(),
          ussdPrompt: 'Approved $29 via MTN MoMo to Islamic Habibi (256744042286)',
          channel: 'PORTAL'
        },
        {
          id: 'txn-105',
          reference: 'IH-TXN-618402',
          packageId: 'pkg-vip-zawaj-patron',
          packageName: 'VIP Matrimonial Lifetime Patron & Spousal Retainer',
          amount: 499,
          currency: 'USD',
          amountUSD: 499,
          amountUGX: 1871250,
          customerName: 'Dr. Zubeir Masagazi',
          customerPhone: '+256778401923',
          customerEmail: 'dr.zubeir@hospital.org',
          paymentMethod: 'card',
          recipientPhone: '256744042286',
          recipientName: 'Islamic Habibi',
          status: 'completed',
          notes: 'Annual matrimonial retainer with priority scholar access and mediation',
          createdAt: new Date(Date.now() - 3600000 * 70).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 70 + 15000).toISOString(),
          ussdPrompt: 'Card charged $499 -> Settled to Islamic Habibi (256744042286)',
          channel: 'TERMINAL'
        }
      ]
    };

    this.saveDatabase(initialSchema);
    return initialSchema;
  }

  private saveDatabase(data: DatabaseSchema): void {
    data.updatedAt = new Date().toISOString();
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    } catch (e) {
      console.error('[Database] Failed to save database file:', e);
    }
  }

  public getPrimaryRecipient(): RecipientRecord {
    const found = this.data.recipients.find((r) => r.phoneNumber === '256744042286');
    if (found) return found;
    return this.data.recipients[0] || DEFAULT_PRIMARY_RECIPIENT;
  }

  public getAllRecipients(): RecipientRecord[] {
    return this.data.recipients;
  }

  public updateRecipient(phoneNumber: string, partial: Partial<RecipientRecord>): RecipientRecord {
    const index = this.data.recipients.findIndex((r) => r.phoneNumber === phoneNumber);
    if (index === -1) {
      throw new Error(`Recipient with phone number ${phoneNumber} not found in database.`);
    }

    this.data.recipients[index] = {
      ...this.data.recipients[index],
      ...partial,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase(this.data);
    return this.data.recipients[index];
  }

  public creditRecipient(phoneNumber: string, amountUSD: number, amountUGX: number): void {
    const r = this.getPrimaryRecipient();
    r.totalReceivedUSD += amountUSD;
    r.totalReceivedUGX += amountUGX;
    r.totalTransactions += 1;
    r.availableBalanceUSD += amountUSD;
    r.updatedAt = new Date().toISOString();
    this.saveDatabase(this.data);
  }

  public generateVerificationCode(
    target: string,
    purpose: 'REGISTRATION' | 'MERCHANT_VERIFY' | 'PAYMENT_AUTH' | 'PASSWORD_RESET',
    metadata?: Record<string, unknown>
  ): { code: string; expiresAt: string; emailDispatch: EmailDispatchRecord } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    this.data.verificationCodes.forEach((vc) => {
      if (vc.target.toLowerCase() === target.toLowerCase() && vc.purpose === purpose && !vc.used) {
        vc.used = true;
      }
    });

    const newCodeRecord: VerificationCodeRecord = {
      id: `vc-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      target: target.trim().toLowerCase(),
      code,
      purpose,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false,
      attempts: 0,
      metadata
    };

    this.data.verificationCodes.unshift(newCodeRecord);

    const subject =
      purpose === 'REGISTRATION'
        ? `Islamic Habibi Matrimonial - Registration Code: ${code}`
        : purpose === 'MERCHANT_VERIFY'
        ? `Islamic Habibi Matrimonial (+256744042286) - Verification Code: ${code}`
        : `Islamic Habibi - Matrimonial Security Code: ${code}`;

    const bodyText = `
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
Peace and Blessings from Islamic Habibi Matrimonial.

"And among His signs is that He created for you spouses from among yourselves so that you may find tranquility in them..." [Surah Ar-Rum 30:21]

Your 6-digit matrimonial verification code is:
=======================================
               ${code}
=======================================

Purpose: ${purpose.replace('_', ' ')}
Account Target: ${target}
Merchant Recipient: +256 744 042 286 (Islamic Habibi)
Validity: 15 minutes

Please enter this verification code to confirm your registration and begin your blessed Nikah journey.
    `.trim();

    const emailDispatch: EmailDispatchRecord = {
      id: `eml-${Date.now().toString(36)}`,
      to: target.trim(),
      subject,
      code,
      purpose,
      bodyText,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED'
    };

    this.data.emailDispatches.unshift(emailDispatch);
    if (this.data.emailDispatches.length > 50) {
      this.data.emailDispatches = this.data.emailDispatches.slice(0, 50);
    }

    this.saveDatabase(this.data);
    return { code, expiresAt, emailDispatch };
  }

  public verifyCode(
    target: string,
    code: string,
    purpose?: 'REGISTRATION' | 'MERCHANT_VERIFY' | 'PAYMENT_AUTH' | 'PASSWORD_RESET'
  ): { valid: boolean; message: string; record?: VerificationCodeRecord } {
    const cleanTarget = target.trim().toLowerCase();
    const cleanCode = code.trim();

    const record = this.data.verificationCodes.find(
      (vc) =>
        vc.target.toLowerCase() === cleanTarget &&
        vc.code === cleanCode &&
        !vc.used &&
        (purpose ? vc.purpose === purpose : true)
    );

    if (!record) {
      const existing = this.data.verificationCodes.find((vc) => vc.target.toLowerCase() === cleanTarget && !vc.used);
      if (existing) {
        existing.attempts += 1;
        this.saveDatabase(this.data);
        if (new Date() > new Date(existing.expiresAt)) {
          return { valid: false, message: 'Verification code has expired. Please request a new code.' };
        }
        return { valid: false, message: `Invalid code. ${Math.max(0, 3 - existing.attempts)} attempt(s) remaining.` };
      }
      return { valid: false, message: 'Invalid or already used verification code.' };
    }

    if (new Date() > new Date(record.expiresAt)) {
      record.used = true;
      this.saveDatabase(this.data);
      return { valid: false, message: 'Verification code has expired. Please request a new code.' };
    }

    record.used = true;
    record.usedAt = new Date().toISOString();

    if (cleanTarget === '256744042286' || cleanTarget === 'mosesmatovu082@gmail.com') {
      const recip = this.getPrimaryRecipient();
      recip.kyc.phoneOtpVerified = true;
      recip.kyc.emailVerified = true;
      recip.status = 'VERIFIED_ACTIVE';
      recip.updatedAt = new Date().toISOString();
    }

    this.saveDatabase(this.data);
    return { valid: true, message: 'Verification code confirmed successfully.', record };
  }

  public registerUser(name: string, email: string, phone: string, verifiedCode?: string): UserRecord {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      existing.name = name.trim();
      existing.phone = phone.trim();
      existing.emailVerified = true;
      existing.lastLoginAt = new Date().toISOString();
      this.saveDatabase(this.data);
      return existing;
    }

    const newUser: UserRecord = {
      id: `usr-${Date.now().toString(36)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'CLIENT',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.data.users.unshift(newUser);
    this.saveDatabase(this.data);
    return newUser;
  }

  public getUsers(): UserRecord[] {
    return this.data.users;
  }

  public getEmailInbox(): EmailDispatchRecord[] {
    return this.data.emailDispatches;
  }

  public getPackages(): ServicePackage[] {
    return this.data.packages;
  }

  public getTransactions(): Transaction[] {
    return this.data.transactions;
  }

  public addTransaction(txn: Transaction): void {
    this.data.transactions.unshift(txn);
    if (txn.status === 'completed') {
      this.creditRecipient(txn.recipientPhone, txn.amountUSD, txn.amountUGX);
    } else {
      this.saveDatabase(this.data);
    }
  }

  public getProfiles(filters?: {
    gender?: string;
    country?: string;
    maritalStatus?: string;
    search?: string;
  }): MatrimonialProfile[] {
    if (!this.data.profiles) {
      this.data.profiles = [...INITIAL_PROFILES];
      this.saveDatabase(this.data);
    }

    let result = [...this.data.profiles];

    if (filters?.gender && filters.gender !== 'all') {
      result = result.filter((p) => p.gender.toLowerCase() === filters.gender?.toLowerCase());
    }

    if (filters?.country && filters.country !== 'all') {
      const q = filters.country.toLowerCase();
      result = result.filter((p) => p.country.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
    }

    if (filters?.maritalStatus && filters.maritalStatus !== 'all') {
      result = result.filter((p) => p.maritalStatus.toLowerCase() === filters.maritalStatus?.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      result = result.filter((p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.nickname.toLowerCase().includes(term) ||
        p.profession.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.country.toLowerCase().includes(term) ||
        p.education.toLowerCase().includes(term) ||
        p.aboutMe.toLowerCase().includes(term) ||
        p.seekingInSpouse.toLowerCase().includes(term)
      );
    }

    return result;
  }

  public getProfileById(id: string): MatrimonialProfile | undefined {
    return (this.data.profiles || []).find((p) => p.id === id);
  }

  public createProfile(profileInput: Partial<MatrimonialProfile>): MatrimonialProfile {
    if (!this.data.profiles) {
      this.data.profiles = [...INITIAL_PROFILES];
    }

    const id = `prof-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: MatrimonialProfile = {
      id,
      fullName: profileInput.fullName || 'Anonymous Sister/Brother',
      nickname: profileInput.nickname || profileInput.fullName?.split(' ')[0] || 'Member',
      gender: profileInput.gender || 'female',
      age: Number(profileInput.age) || 25,
      city: profileInput.city || 'Kampala',
      country: profileInput.country || 'Uganda',
      nationality: profileInput.nationality || 'Ugandan',
      profession: profileInput.profession || 'Professional',
      education: profileInput.education || 'Bachelor Degree',
      maritalStatus: profileInput.maritalStatus || 'Never Married',
      children: profileInput.children || 'None',
      religiosity: profileInput.religiosity || 'Practicing Sunnah',
      prayers: profileInput.prayers || 'Always 5 daily on time',
      fasting: profileInput.fasting || 'Ramadan + voluntary Sunnah fasts',
      hijabOrBeard: profileInput.hijabOrBeard || (profileInput.gender === 'female' ? 'Modest Hijab' : 'Sunnah Beard'),
      islamicSect: 'Sunni / Ahl us-Sunnah',
      diet: 'Strict Halal & Zabiha only',
      aboutMe: profileInput.aboutMe || 'Practicing Muslim seeking marriage for the sake of Allah.',
      seekingInSpouse: profileInput.seekingInSpouse || 'A righteous, Allah-fearing spouse.',
      dealbreakers: profileInput.dealbreakers || ['Lack of prayer', 'Dishonesty'],
      hobbies: profileInput.hobbies || ['Reading Islamic books', 'Family time'],
      languages: profileInput.languages || ['English'],
      willingToRelocate: profileInput.willingToRelocate || 'Open to discussion',
      avatarUrl: profileInput.avatarUrl || (profileInput.gender === 'female' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'),
      isVerified: true,
      hasWaliInvolved: profileInput.hasWaliInvolved ?? true,
      waliRelation: profileInput.waliRelation || 'Father',
      waliName: profileInput.waliName || 'Wali / Family Guardian',
      waliContactPhone: profileInput.waliContactPhone || '+256744042286',
      waliContactEmail: profileInput.waliContactEmail || 'wali@islamichabibi.org',
      memberSince: new Date().toISOString().split('T')[0],
      subscriptionTier: profileInput.subscriptionTier || 'Free Member',
      interestsReceived: 0,
      isFavorited: false
    };

    this.data.profiles.unshift(newProfile);
    this.saveDatabase(this.data);
    return newProfile;
  }

  public expressInterest(profileId: string, interest: ProfileInterestRequest): { success: boolean; message: string; profile: MatrimonialProfile } {
    const prof = this.getProfileById(profileId);
    if (!prof) {
      throw new Error(`Matrimonial profile with ID ${profileId} not found.`);
    }

    prof.interestsReceived = (prof.interestsReceived || 0) + 1;

    // Dispatch notification to email inbox for Wali & Profile
    const dispatch: EmailDispatchRecord = {
      id: `disp-interest-${Date.now().toString(36)}`,
      to: prof.waliContactEmail || `${prof.nickname.toLowerCase()}@islamichabibi.org`,
      subject: `[Islamic Habibi] Halal Matrimonial Interest Expressed for ${prof.fullName}`,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      purpose: 'MATRIMONIAL_INTEREST',
      bodyText: `Assalamu alaikum wa Rahmatullah,\n\nA sincere suitor (${interest.senderName}, ${interest.senderGender === 'male' ? 'Brother' : 'Sister'}) has expressed matrimonial interest in ${prof.fullName}.\n\nMessage from suitor: "${interest.message}"\n\nSuitor Contact: ${interest.senderPhone} | ${interest.senderEmail}\n${interest.includeWaliContact && interest.senderWaliPhone ? `Suitor Wali Phone: ${interest.senderWaliPhone}\n` : ''}Under Islamic Habibi Halal Zawaj Protocol, all matchmaking introductions proceed with Wali consultation.\nRecipient funds router: +256 744 042 286 (Islamic Habibi).`,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED'
    };

    this.data.emailDispatches.unshift(dispatch);
    this.saveDatabase(this.data);

    return {
      success: true,
      message: `Alhamdulillah! Your halal interest and message have been respectfully dispatched to ${prof.fullName} and her/his Wali (${prof.waliName || 'Wali'}).`,
      profile: prof
    };
  }

  public toggleFavoriteProfile(profileId: string): boolean {
    const prof = this.getProfileById(profileId);
    if (!prof) return false;
    prof.isFavorited = !prof.isFavorited;
    this.saveDatabase(this.data);
    return prof.isFavorited;
  }

  // ----------------------------------------------------
  // HALAL CHAT SYSTEM (PAID DIRECT MESSAGING & WALI OVERSIGHT)
  // ----------------------------------------------------

  public createInitialChatSessions(profiles: MatrimonialProfile[]): ChatSession[] {
    return profiles.map((p) => {
      const isFemale = p.gender === 'female';
      const welcomeText = isFemale
        ? `As-salamu alaykum wa rahmatullahi wa barakatuh. I am Sister ${p.nickname || p.fullName} from ${p.city}. May Allah grant you blessings in your search for a righteous spouse. My Wali (${p.waliRelation || 'Father'} ${p.waliName || ''}) is informed of all communication. Once you activate your direct halal chat pass, feel free to ask about my religious commitments, family background, and marriage timeline.`
        : `As-salamu alaykum wa rahmatullah. I am Brother ${p.nickname || p.fullName} from ${p.city}. I am seeking a practicing, righteous sister upon the Sunnah. When you unlock our chat room, we can discuss our visions for building a home based on Islamic principles and connect with your Wali.`;

      const initialMessage: ChatMessage = {
        id: `msg-init-${p.id}`,
        chatId: `chat-${p.id}`,
        senderId: p.id,
        senderName: p.fullName,
        senderRole: 'candidate',
        text: welcomeText,
        timestamp: new Date().toISOString()
      };

      return {
        id: `chat-${p.id}`,
        candidateId: p.id,
        candidateName: p.fullName,
        candidateNickname: p.nickname,
        candidateAvatar: p.avatarUrl,
        candidateGender: p.gender,
        candidateCity: p.city,
        candidateCountry: p.country,
        candidateProfession: p.profession,
        candidateReligiosity: p.religiosity,
        waliName: p.waliName,
        waliRelation: p.waliRelation,
        waliPhone: p.waliContactPhone,
        isUnlocked: false,
        lastMessageText: welcomeText,
        lastMessageTime: new Date().toISOString(),
        messages: [initialMessage]
      };
    });
  }

  public getChatSessions(): ChatSession[] {
    if (!this.data.chatSessions || this.data.chatSessions.length === 0) {
      this.data.chatSessions = this.createInitialChatSessions(this.data.profiles || INITIAL_PROFILES);
      this.saveDatabase(this.data);
    }
    return this.data.chatSessions;
  }

  public getChatSession(candidateId: string): ChatSession | undefined {
    const sessions = this.getChatSessions();
    return sessions.find((s) => s.candidateId === candidateId || s.id === candidateId);
  }

  public unlockChat(req: PaidChatUnlockRequest): { success: boolean; session: ChatSession; transaction: Transaction } {
    let session = this.data.chatSessions.find((s) => s.candidateId === req.candidateId);
    const profile = this.getProfileById(req.candidateId);
    if (!session && profile) {
      session = this.createInitialChatSessions([profile])[0];
      this.data.chatSessions.push(session);
    }
    if (!session) {
      throw new Error('Matrimonial candidate not found for chat unlock.');
    }

    const planTitles: Record<string, string> = {
      single_chat: `Halal Direct Chat Pass (30-Days) with ${session.candidateName}`,
      starter_pass: `Zawaj Starter Membership (Includes 5 Candidate Chats)`,
      gold_pass: `Nikah Gold Membership (Includes 15 Candidate Chats)`
    };

    const amountUSD = req.amountUSD || 3;
    const amountUGX = Math.round(amountUSD * 3750);
    const txnRef = `IH-CHAT-${Math.floor(100000 + Math.random() * 900000)}`;

    const txn: Transaction = {
      id: `txn-chat-${Date.now()}`,
      reference: txnRef,
      packageId: req.candidateId,
      packageName: planTitles[req.planType] || `Direct Halal Chat Pass with ${session.candidateName}`,
      amount: amountUSD,
      currency: 'USD',
      amountUSD,
      amountUGX,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerEmail: req.customerEmail || 'suitor@islamichabibi.org',
      paymentMethod: req.paymentMethod || 'mtn_momo',
      recipientPhone: '256744042286',
      recipientName: 'Islamic Habibi',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      channel: 'PORTAL',
      ussdPrompt: req.paymentMethod === 'airtel_money'
        ? `Airtel Money Prompt sent to ${req.customerPhone}. Approved $${amountUSD} (${amountUGX.toLocaleString()} UGX) to Islamic Habibi (+256744042286).`
        : `MTN MoMo (*165#) prompt sent to ${req.customerPhone}. Approved $${amountUSD} (${amountUGX.toLocaleString()} UGX) to Islamic Habibi (+256744042286).`,
      notes: `Halal direct chat access unlocked with ${session.candidateName}. Wali (${session.waliName || 'Guardian'}: ${session.waliPhone || '+256744042286'}) notified.`
    };

    // Update session status
    session.isUnlocked = true;
    session.unlockedAt = new Date().toISOString();
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    session.amountPaidUSD = amountUSD;

    const unlockMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      chatId: session.id,
      senderId: 'system',
      senderName: 'Islamic Habibi Concierge',
      senderRole: 'system',
      text: `✨ Halal Direct Messaging Unlocked! You now have 30 days of supervised messaging with ${session.candidateName}. An automated alert has been dispatched to their Wali (${session.waliName || 'Guardian'} at ${session.waliPhone || 'verified phone'}). Please maintain noble speech and Islamic etiquette.`,
      timestamp: new Date().toISOString()
    };
    session.messages.push(unlockMsg);
    session.lastMessageText = unlockMsg.text;
    session.lastMessageTime = unlockMsg.timestamp;

    // Record transaction & update recipient
    this.data.transactions.unshift(txn);
    const recip = this.getPrimaryRecipient();
    recip.totalReceivedUSD += amountUSD;
    recip.totalReceivedUGX += amountUGX;
    recip.availableBalanceUSD += amountUSD;
    recip.totalTransactions += 1;
    recip.updatedAt = new Date().toISOString();

    // Dispatch email/SMS notification to Wali & user
    const dispatch: EmailDispatchRecord = {
      id: `disp-${Date.now()}`,
      to: req.customerEmail || 'suitor@islamichabibi.org',
      subject: `[Chat Unlocked] Halal Messaging with ${session.candidateName}`,
      code: txnRef,
      purpose: 'CHAT_UNLOCK_RECEIPT',
      bodyText: `As-salamu alaykum ${req.customerName},\n\nYour Halal Direct Chat Pass for ${session.candidateName} has been activated ($${amountUSD} USD paid to Islamic Habibi).\n\nWali on record: ${session.waliName || 'Family Guardian'} (${session.waliPhone || '+256744042286'}).\n\nMay Allah bless this noble step towards Nikah.`,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED'
    };
    this.data.emailDispatches.unshift(dispatch);

    this.saveDatabase(this.data);
    return { success: true, session, transaction: txn };
  }

  public sendChatMessage(candidateId: string, text: string, senderName: string): { userMessage: ChatMessage; candidateReply: ChatMessage } {
    let session = this.data.chatSessions.find((s) => s.candidateId === candidateId);
    if (!session) {
      const prof = this.getProfileById(candidateId);
      if (prof) {
        session = this.createInitialChatSessions([prof])[0];
        this.data.chatSessions.push(session);
      }
    }
    if (!session) {
      throw new Error('Matrimonial candidate not found.');
    }

    if (!session.isUnlocked) {
      throw new Error('This chat is locked. Direct messaging with registered matrimonial candidates requires a paid Halal Chat Pass ($3.00) or an active Zawaj plan.');
    }

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      chatId: session.id,
      senderId: 'current-user',
      senderName: senderName || 'Marriage Seeker',
      senderRole: 'user',
      text,
      timestamp: now
    };
    session.messages.push(userMessage);

    // Generate in-character candidate response
    const profile = this.getProfileById(candidateId);
    const replyText = profile 
      ? this.generateCandidateResponse(profile, text, senderName)
      : `Wa alaykum as-salam. Thank you for your sincere message. In sha Allah my family and I will reflect on this as we pursue marriage in a halal manner.`;

    const candidateReply: ChatMessage = {
      id: `msg-cand-${Date.now() + 10}`,
      chatId: session.id,
      senderId: candidateId,
      senderName: session.candidateName,
      senderRole: 'candidate',
      text: replyText,
      timestamp: new Date(Date.now() + 500).toISOString()
    };
    session.messages.push(candidateReply);

    session.lastMessageText = candidateReply.text;
    session.lastMessageTime = candidateReply.timestamp;

    this.saveDatabase(this.data);
    return { userMessage, candidateReply };
  }

  private generateCandidateResponse(prof: MatrimonialProfile, userText: string, senderName: string): string {
    const lower = userText.toLowerCase();

    if (lower.includes('salam') || lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
      return `Wa alaykum as-salam wa rahmatullah ${senderName || 'respected brother/sister'}. Alhamdulillah, it is a pleasure to connect with you upon halal terms. I pray you are in the best of health and Imaan. How is your search going?`;
    }

    if (lower.includes('work') || lower.includes('job') || lower.includes('career') || lower.includes('profession')) {
      return `Alhamdulillah, in my profession as ${prof.profession}, I strive to earn a lawful halal living while keeping my prayers and Islamic duties as the primary focus. Work is a means to sustain a righteous home. What is your profession, and how do you balance work with family life?`;
    }

    if (lower.includes('family') || lower.includes('wali') || lower.includes('father') || lower.includes('parent')) {
      return `Family is of immense importance to me. My Wali, ${prof.waliName || 'my guardian'} (${prof.waliRelation || 'father'}), is very supportive of my search for a righteous spouse who fears Allah. Whenever you feel comfortable and we assess preliminary compatibility, we can arrange an introductory call with my Wali.`;
    }

    if (lower.includes('prayer') || lower.includes('quran') || lower.includes('deen') || lower.includes('sunnah') || lower.includes('islam') || lower.includes('fasting')) {
      return `SubhanAllah, my commitment to Deen is: "${prof.prayers}" and "${prof.religiosity}". In a spouse, I am seeking someone who loves Allah and His Messenger ﷺ and is eager to grow together in Islamic knowledge. What aspects of Islamic knowledge or practice are you currently focused on?`;
    }

    if (lower.includes('relocate') || lower.includes('city') || lower.includes('country') || lower.includes('move') || lower.includes('live')) {
      return `Regarding residence, I am currently based in ${prof.city}, ${prof.country}. My perspective on relocation is: "${prof.willingToRelocate}". Marriage is about partnership and mutual ease, so in sha Allah we can discuss practical arrangements as things progress.`;
    }

    if (lower.includes('timeline') || lower.includes('marry') || lower.includes('nikah') || lower.includes('when')) {
      return `In sha Allah, my family and I desire a halal, straightforward process without unnecessary delay. Once mutual character, Deen, and compatibility are clear, we hope to formalize Nikah within a reasonable timeline (3-6 months), respecting Islamic traditions. What timeline are you hoping for?`;
    }

    if (lower.includes('dealbreaker') || lower.includes('expect') || lower.includes('looking for') || lower.includes('seeking')) {
      return `Regarding spousal expectations, what I am seeking is: "${prof.seekingInSpouse}". Honesty, gentleness, and prioritizing Allah are vital to me. How does this align with your values?`;
    }

    return `Jazakallahu khayran for sharing that. In ${prof.city}, I always value clear and sincere communication. My goal in marriage is to build a tranquil home filled with mawaddah and rahmah (love and mercy), as Allah describes in Surah Ar-Rum. I would love to hear more about your background and your vision for an Islamic family.`;
  }

  public getDatabaseStats() {
    const recip = this.getPrimaryRecipient();
    return {
      version: this.data.version,
      updatedAt: this.data.updatedAt,
      primaryRecipientNumber: recip.phoneNumber,
      primaryRecipientName: recip.businessName,
      status: recip.status,
      currency: 'USD',
      totalReceivedUSD: recip.totalReceivedUSD,
      totalReceivedUGX: recip.totalReceivedUGX,
      totalTransactions: this.data.transactions.length,
      usersCount: this.data.users.length,
      activePackagesCount: this.data.packages.length,
      emailDispatchesCount: this.data.emailDispatches.length,
      publicProfilesCount: this.data.profiles ? this.data.profiles.length : 0
    };
  }
}

export const db = new DatabaseService();
