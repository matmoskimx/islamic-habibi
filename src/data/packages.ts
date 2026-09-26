import { ServicePackage } from '../types';

export const INITIAL_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-niyyah-search',
    code: 'IH-ZWJ-01',
    title: 'Niyyah Halal Matchmaking Membership',
    arabicTitle: 'عضوية النية الصادقة للزواج الحلال المبارك',
    category: 'singles_search',
    priceUSD: 19,
    billingType: 'monthly',
    duration: 'Monthly Active Membership',
    tagline: 'Connect with practicing Muslim brothers and sisters seeking righteous Nikah.',
    description: 'A modest, Sharia-governed Muslim matrimonial search subscription. Strictly curated profiles with verified identity, religious values screening, and Wali contact integration for sincere marriage seekers.',
    features: [
      'Unlimited verified Muslim matrimonial profile searches',
      'Wali guardian contact transparency & notifications',
      'Islamic values, prayer regularity & lifestyle compatibility filters',
      'Sharia privacy safeguards — no casual chatting or public browsing',
      'Weekly curated pious matches delivered to your inbox'
    ],
    suitableFor: 'Practicing Muslim singles ready for marriage',
    popular: false
  },
  {
    id: 'pkg-zawaj-matchmaker',
    code: 'IH-ZWJ-02',
    title: 'Zawaj Blessed Matchmaker & Chaperone',
    arabicTitle: 'خدمة التوفيق والخطبة الشرعية بمرافقة المشرف',
    category: 'singles_search',
    priceUSD: 39,
    billingType: 'monthly',
    duration: 'Monthly Dedicated Matchmaking',
    tagline: 'Personalized matching guided by trusted Islamic marriage facilitators.',
    description: 'Our certified Islamic matrimonial coordinators manually review your family criteria, religious preferences, and life goals to hand-select compatible Muslim candidates with full chaperone oversight.',
    features: [
      'Dedicated personal Islamic Matchmaker assigned to your profile',
      '3 Hand-screened and pre-vetted candidate introductions per month',
      'Chaperoned virtual meet-ups with Wali or coordinator present',
      'Confidential background and reference verification',
      'Personalized marriage readiness feedback and coaching'
    ],
    suitableFor: 'Singles and parents seeking active, guided assistance',
    popular: true
  },
  {
    id: 'pkg-wali-circle',
    code: 'IH-WLI-03',
    title: 'Wali Family Matrimonial Concierge',
    arabicTitle: 'دائرة الولي والتوفيق العائلي الشرعي للزواج',
    category: 'wali_assisted',
    priceUSD: 79,
    billingType: 'quarterly',
    duration: '3 Months Comprehensive Concierge',
    tagline: 'Wali-to-Wali direct introductions upholding honor and Sunnah.',
    description: 'Designed specifically for Muslim parents, guardians, and Walis seeking pious spouses for their sons and daughters. Facilitates respectful family-to-family meetings, religious vetting, and family peace.',
    features: [
      'Direct Wali-to-Wali formal introductions and family exchanges',
      'Meticulous family lineage, character, and Deen vetting',
      'Facilitated family introductory dinners or virtual conferences',
      'Scholarly counsel on Mahr, spousal expectations, and family harmony',
      'Quarterly match status reports and family advisory sessions'
    ],
    suitableFor: 'Parents, guardians, and Walis coordinating their children’s Nikah',
    popular: false
  },
  {
    id: 'pkg-nikah-solemnization',
    code: 'IH-NKH-04',
    title: 'Sacred Nikah Solemnization & Sharia Contract',
    arabicTitle: 'توثيق وعقد النكاح الشرعي واستخراج الشهادة المباركة',
    category: 'nikah_contract',
    priceUSD: 149,
    billingType: 'one-time',
    duration: 'Full Solemnization & Document Vetting',
    tagline: 'Formalize your holy union with scholar-certified Nikah documentation.',
    description: 'Complete facilitation of your sacred Nikah ceremony. Covers legal Sharia clause drafting (including special spousal stipulations and Mahr agreements), pre-marriage scholar vetting, and issuance of the Islamic Habibi Marriage Certificate.',
    features: [
      'Custom Sharia matrimonial contract drafting & stipulation review',
      'Ijazah-certified Islamic Officiant (Qadi/Sheikh) coordination',
      'Mahr (dowry) registration and formal spousal rights documentation',
      'Official Islamic Habibi Certified Nikah Certificate',
      'Solemnization Khutbah (sermon) outline and blessings'
    ],
    suitableFor: 'Couples about to tie the knot seeking blessed Nikah certification',
    popular: true
  },
  {
    id: 'pkg-premarital-counsel',
    code: 'IH-CNS-05',
    title: 'Pre-Marital Harmony & Istikhara Guidance',
    arabicTitle: 'الاستخارة والاستشارة الأسرية الشرعية قبل الزواج',
    category: 'premarital_counseling',
    priceUSD: 29,
    billingType: 'one-time',
    duration: '60-Minute Intensive Live Session',
    tagline: 'Align your hearts, clarify doubts, and pray with certainty before saying "Qabilt".',
    description: 'Private, confidential consultation with experienced Islamic family counselors. Guidance on performing Salat al-Istikhara, resolving spousal hesitations, discussing finances and in-laws, and setting expectations.',
    features: [
      '1-on-1 private virtual session with certified Islamic counselor',
      'Istikhara prayer guidance, reflection & spiritual discernment',
      'Financial expectations, Mahr, and household responsibility roadmaps',
      'Conflict-resolution tools grounded in the Sunnah',
      'Post-session written action guide and marriage du’as'
    ],
    suitableFor: 'Engaged couples or individuals weighing a proposal',
    popular: false
  },
  {
    id: 'pkg-diaspora-match',
    code: 'IH-DSP-06',
    title: 'Global Muslim Diaspora Matrimonial Network',
    arabicTitle: 'شبكة الزواج الحلال للمسلمين في المهجر والاغتراب',
    category: 'singles_search',
    priceUSD: 119,
    billingType: 'quarterly',
    duration: '3 Months Cross-Border Search',
    tagline: 'Helping Muslims find practicing spouses across borders and continents.',
    description: 'Connecting practicing Muslims living abroad, in diaspora communities, or internationally. Overcome geographical barriers while maintaining strict Islamic etiquette, family involvement, and verified background credentials.',
    features: [
      'Global database access across East Africa, Middle East, Europe & Americas',
      'Immigration & relocation cultural compatibility advisory',
      'Cross-border Wali verification and background confirmation',
      'Time-zone coordinated virtual introductory sessions',
      'Multi-lingual Islamic counselor support (English, Arabic, Swahili, Luganda)'
    ],
    suitableFor: 'Muslims living abroad or open to international marriage',
    popular: false
  },
  {
    id: 'pkg-royal-nikah',
    code: 'IH-RYL-07',
    title: 'Royal Nikah Officiation & Celebration Package',
    arabicTitle: 'المراسم الملكية الكاملة لإشهار النكاح والخطبة المباركة',
    category: 'nikah_contract',
    priceUSD: 249,
    billingType: 'one-time',
    duration: 'Complete Wedding Ceremony Facilitation',
    tagline: 'An unforgettable, Sunnah-centered wedding ceremony presided over by senior scholars.',
    description: 'In-person or VIP virtual Nikah officiation by senior Islamic scholars. Includes inspiring matrimonial Khutbah, witness verification, formal certificate handover, and special supplications for the bride, groom, and both families.',
    features: [
      'Senior Sheikh / Qadi in-person or live virtual officiation',
      'Customized heartfelt Nikah Khutbah delivered to your guests',
      'Gold-embossed physical Islamic Habibi Marriage Certificate',
      'Deluxe engraved wooden Islamic Habibi Nikah keepsake box',
      'Private bridal & groom blessing supplications'
    ],
    suitableFor: 'Couples desiring an auspicious, memorable wedding celebration',
    popular: false
  },
  {
    id: 'pkg-vip-zawaj-patron',
    code: 'IH-VIP-08',
    title: 'VIP Matrimonial Lifetime Patron & Spousal Retainer',
    arabicTitle: 'العضوية الشاملة السنوية لكبار الشخصيات للزواج والاستقرار الأسري',
    category: 'vip_concierge',
    priceUSD: 499,
    billingType: 'annual',
    duration: '1 Full Year All-Inclusive Matrimonial Care',
    tagline: 'The ultimate royal stewardship from first proposal to marital bliss.',
    description: 'Elite, full-service matrimonial stewardship. Unlimited private introductions, priority access to senior scholars for marriage arbitration, full Nikah contract facilitation, and ongoing marital check-ins throughout your first blessed year.',
    features: [
      'Unlimited bespoke match introductions until successful Nikah',
      'Direct private mobile WhatsApp VIP hotline to senior scholars',
      'Full Sacred Nikah Contract & solemnization fees included',
      'Quarterly post-marriage marital harmony check-in sessions',
      'Immediate priority conflict resolution and family mediation support',
      'Commemorative Islamic Habibi Gold Family Covenant'
    ],
    suitableFor: 'Discerning families and professionals wanting end-to-end matrimonial care',
    popular: true
  }
];

export const MERCHANT_PROFILE = {
  businessName: 'Islamic Habibi',
  brandTagline: 'Halal Muslim Matrimonial, Nikah Facilitation & Blessed Family Stewardship',
  recipientPhone: '256744042286',
  formattedPhone: '+256 744 042 286',
  country: 'Uganda',
  settlementMethod: 'Direct Mobile Money Real-Time Settlement',
  primaryCarriers: ['Airtel Money Uganda (*185#)', 'MTN Mobile Money (*165#)', 'Visa / Mastercard Card Pay'],
  merchantCode: 'HABIBI-256744042286',
  status: 'ACTIVE_VERIFIED' as const,
  contactEmail: 'contact@islamichabibi.ug',
  supportPhone: '+256 744 042 286',
  registeredAddress: 'Plot 14, Kampala Road, Kampala, Uganda'
};
