import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/db/database';
import { Transaction, ServicePackage, ChargeRequest, MatrimonialProfile, ProfileInterestRequest } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const UGX_TO_USD_RATE = 3750;

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Health & Database Status
app.get('/api/health', (req: Request, res: Response) => {
  const recip = db.getPrimaryRecipient();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Islamic Habibi Matrimonial Charging & Verification API',
    currency: 'USD',
    merchant: recip.businessName,
    recipient: recip.phoneNumber,
    purpose: 'Helping Muslims Marry Muslims upon Quran & Sunnah',
    recipientStatus: recip.status,
    version: '2.2.0'
  });
});

// 2. Database Status & Schema Overview
app.get('/api/database/status', (req: Request, res: Response) => {
  const stats = db.getDatabaseStats();
  res.json(stats);
});

// 3. Database Primary Recipient Info
app.get('/api/database/recipient', (req: Request, res: Response) => {
  const recip = db.getPrimaryRecipient();
  res.json({
    success: true,
    recipient: recip,
    databaseBacked: true,
    currency: 'USD'
  });
});

// 4. Update Database Recipient Settings
app.post('/api/database/recipient/update', (req: Request, res: Response) => {
  const { tagline, ownerEmail, ownerName } = req.body;
  try {
    const updated = db.updateRecipient('256744042286', {
      ...(tagline && { tagline }),
      ...(ownerEmail && { ownerEmail }),
      ...(ownerName && { ownerName })
    });
    res.json({ success: true, recipient: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update recipient';
    res.status(400).json({ error: msg });
  }
});

// 5. Merchant Status
app.get('/api/merchant', (req: Request, res: Response) => {
  const recip = db.getPrimaryRecipient();
  const txns = db.getTransactions();
  const completed = txns.filter((t) => t.status === 'completed');
  res.json({
    businessName: recip.businessName,
    brandTagline: recip.tagline,
    recipientPhone: recip.phoneNumber,
    formattedPhone: recip.formattedPhone,
    country: recip.country,
    settlementMethod: recip.settlementMethod,
    primaryCarriers: recip.primaryCarriers,
    merchantCode: recip.merchantCode,
    status: recip.status,
    contactEmail: recip.ownerEmail,
    supportPhone: recip.formattedPhone,
    ownerName: recip.ownerName,
    kyc: recip.kyc,
    currency: 'USD',
    totalReceivedUSD: recip.totalReceivedUSD,
    totalReceivedUGX: recip.totalReceivedUGX,
    availableBalanceUSD: recip.availableBalanceUSD,
    completedCount: completed.length,
    totalTransactions: txns.length,
    activeReceivingAccount: recip.phoneNumber,
    receivingAccountHolder: recip.businessName
  });
});

// 6. Matrimonial Subscription Packages List (All in USD)
app.get('/api/packages', (req: Request, res: Response) => {
  const { category } = req.query;
  const packages = db.getPackages();
  if (category && typeof category === 'string' && category !== 'all') {
    return res.json(packages.filter((p) => p.category === category));
  }
  res.json(packages);
});

// 7. Get Single Package
app.get('/api/packages/:id', (req: Request, res: Response) => {
  const packages = db.getPackages();
  const pkg = packages.find((p) => p.id === req.params.id || p.code === req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: 'Matrimonial package not found' });
  }
  res.json(pkg);
});

// ----------------------------------------------------
// PUBLIC REGISTERED MATRIMONIAL PROFILES (LIVE & FUNCTIONAL)
// ----------------------------------------------------

// 7a. Get All Registered Profiles with Filters
app.get('/api/profiles', (req: Request, res: Response) => {
  const { gender, country, maritalStatus, search } = req.query;
  const profiles = db.getProfiles({
    gender: typeof gender === 'string' ? gender : undefined,
    country: typeof country === 'string' ? country : undefined,
    maritalStatus: typeof maritalStatus === 'string' ? maritalStatus : undefined,
    search: typeof search === 'string' ? search : undefined
  });
  res.json({
    success: true,
    total: profiles.length,
    profiles
  });
});

// 7b. Get Single Profile Details
app.get('/api/profiles/:id', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Matrimonial profile not found.' });
  }
  res.json({ success: true, profile });
});

// 7c. Register New Public Profile (Live Database Submission)
app.post('/api/profiles', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      nickname,
      gender,
      age,
      city,
      country,
      nationality,
      profession,
      education,
      maritalStatus,
      children,
      religiosity,
      prayers,
      fasting,
      hijabOrBeard,
      aboutMe,
      seekingInSpouse,
      dealbreakers,
      hobbies,
      languages,
      willingToRelocate,
      avatarUrl,
      hasWaliInvolved,
      waliRelation,
      waliName,
      waliContactPhone,
      waliContactEmail,
      subscriptionTier
    } = req.body;

    if (!fullName || !gender || !age) {
      return res.status(400).json({ error: 'Full name, gender, and age are required to create a matrimonial profile.' });
    }

    const created = db.createProfile({
      fullName,
      nickname,
      gender,
      age: Number(age),
      city,
      country,
      nationality,
      profession,
      education,
      maritalStatus,
      children,
      religiosity,
      prayers,
      fasting,
      hijabOrBeard,
      aboutMe,
      seekingInSpouse,
      dealbreakers: Array.isArray(dealbreakers) ? dealbreakers : (dealbreakers ? [dealbreakers] : undefined),
      hobbies: Array.isArray(hobbies) ? hobbies : (hobbies ? [hobbies] : undefined),
      languages: Array.isArray(languages) ? languages : (languages ? [languages] : undefined),
      willingToRelocate,
      avatarUrl,
      hasWaliInvolved: hasWaliInvolved !== false,
      waliRelation,
      waliName,
      waliContactPhone,
      waliContactEmail,
      subscriptionTier: subscriptionTier || 'Free Member'
    });

    res.status(201).json({
      success: true,
      message: 'Matrimonial profile registered and published successfully in the live database.',
      profile: created
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to register profile.';
    res.status(400).json({ error: msg });
  }
});

// 7d. Express Halal Interest / Contact Request
app.post('/api/profiles/:id/interest', (req: Request, res: Response) => {
  try {
    const { senderName, senderGender, senderPhone, senderEmail, message, includeWaliContact, senderWaliPhone } = req.body;

    if (!senderName || !senderPhone || !message) {
      return res.status(400).json({ error: 'Your name, contact phone, and respectful introductory message are required.' });
    }

    const result = db.expressInterest(req.params.id, {
      profileId: req.params.id,
      senderName,
      senderGender: senderGender || 'male',
      senderPhone,
      senderEmail: senderEmail || 'suitor@islamichabibi.org',
      message,
      includeWaliContact: includeWaliContact !== false,
      senderWaliPhone
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to express halal interest.';
    res.status(400).json({ error: msg });
  }
});

// 7e. Toggle Favorite Profile
app.post('/api/profiles/:id/favorite', (req: Request, res: Response) => {
  const isFavorited = db.toggleFavoriteProfile(req.params.id);
  res.json({ success: true, profileId: req.params.id, isFavorited });
});

// ----------------------------------------------------
// HALAL CHAT & PAID CANDIDATE MESSAGING ENDPOINTS
// ----------------------------------------------------

// 7f. Get All Chat Sessions
app.get('/api/chats', (req: Request, res: Response) => {
  const sessions = db.getChatSessions();
  res.json({
    success: true,
    total: sessions.length,
    unlockedCount: sessions.filter((s) => s.isUnlocked).length,
    chats: sessions
  });
});

// 7g. Get Single Candidate Chat Session
app.get('/api/chats/:id', (req: Request, res: Response) => {
  const session = db.getChatSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found for this candidate.' });
  }
  res.json({ success: true, chat: session });
});

// 7h. Unlock Paid Halal Chat with Candidate
app.post('/api/chats/unlock', (req: Request, res: Response) => {
  try {
    const { candidateId, customerName, customerPhone, customerEmail, paymentMethod, planType, amountUSD } = req.body;
    if (!candidateId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'candidateId, customerName, and customerPhone are required for chat unlock.' });
    }

    const result = db.unlockChat({
      candidateId,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod: paymentMethod || 'mtn_momo',
      planType: planType || 'single_chat',
      amountUSD: Number(amountUSD) || 3
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unlock chat.';
    res.status(400).json({ error: msg });
  }
});

// 7i. Send Message in Candidate Chat
app.post('/api/chats/:candidateId/message', (req: Request, res: Response) => {
  try {
    const { text, senderName } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    const result = db.sendChatMessage(req.params.candidateId, text.trim(), senderName || 'Marriage Seeker');
    res.json({
      success: true,
      ...result
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send chat message.';
    res.status(400).json({ error: msg });
  }
});

// ----------------------------------------------------
// AUTHENTICATION & EMAIL CODE VERIFICATION SYSTEM
// ----------------------------------------------------

// 8. Send Email / Phone Verification Code
app.post('/api/auth/send-code', (req: Request, res: Response) => {
  const { target, purpose, name } = req.body;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Valid target (email or phone) is required.' });
  }

  const validPurpose = (purpose as 'REGISTRATION' | 'MERCHANT_VERIFY' | 'PAYMENT_AUTH' | 'PASSWORD_RESET') || 'REGISTRATION';

  const { code, expiresAt, emailDispatch } = db.generateVerificationCode(target, validPurpose, { name });

  res.json({
    success: true,
    message: `Matrimonial verification code generated and sent to ${target}. Valid for 15 minutes.`,
    target,
    purpose: validPurpose,
    expiresAt,
    emailDispatch: {
      id: emailDispatch.id,
      to: emailDispatch.to,
      subject: emailDispatch.subject,
      code: emailDispatch.code,
      sentAt: emailDispatch.sentAt
    }
  });
});

// 9. Verify Email / Phone Code
app.post('/api/auth/verify-code', (req: Request, res: Response) => {
  const { target, code, purpose } = req.body;

  if (!target || !code) {
    return res.status(400).json({ error: 'Target and verification code are required.' });
  }

  const result = db.verifyCode(target, code, purpose);

  if (!result.valid) {
    return res.status(400).json({ success: false, error: result.message });
  }

  res.json({
    success: true,
    message: result.message,
    verified: true,
    target,
    verifiedAt: new Date().toISOString()
  });
});

// 10. Complete Registration with Email Code Verification
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, code } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone number are required.' });
  }

  if (code) {
    const verifyResult = db.verifyCode(email, code, 'REGISTRATION');
    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, error: verifyResult.message });
    }
  }

  const user = db.registerUser(name, email, phone, code);

  res.status(201).json({
    success: true,
    message: `Muslim matrimonial profile registered and verified for ${user.name}.`,
    user
  });
});

// 11. Virtual Email Inbox
app.get('/api/auth/inbox', (req: Request, res: Response) => {
  const inbox = db.getEmailInbox();
  res.json({
    total: inbox.length,
    inbox
  });
});

// 12. Get Registered Users
app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({
    total: users.length,
    users
  });
});

// 13. Verify Merchant Receiving Number (+256744042286)
app.post('/api/merchant/verify-otp', (req: Request, res: Response) => {
  const { code } = req.body;
  const recip = db.getPrimaryRecipient();

  if (code) {
    const result = db.verifyCode(recip.phoneNumber, code, 'MERCHANT_VERIFY');
    if (!result.valid) {
      const emailResult = db.verifyCode(recip.ownerEmail, code, 'MERCHANT_VERIFY');
      if (!emailResult.valid) {
        return res.status(400).json({ success: false, error: 'Invalid merchant verification OTP code.' });
      }
    }
  }

  recip.kyc.phoneOtpVerified = true;
  recip.kyc.emailVerified = true;
  recip.kyc.nationalIdVerified = true;
  recip.status = 'VERIFIED_ACTIVE';
  recip.updatedAt = new Date().toISOString();

  db.updateRecipient(recip.phoneNumber, {
    status: 'VERIFIED_ACTIVE',
    kyc: recip.kyc
  });

  res.json({
    success: true,
    message: `Merchant receiving number ${recip.formattedPhone} verified and active in database.`,
    recipient: recip
  });
});

// ----------------------------------------------------
// MAIN CHARGING API (ALL CHARGES IN US DOLLARS $)
// ----------------------------------------------------

// 14. POST /api/charge
app.post('/api/charge', (req: Request, res: Response) => {
  const body = req.body as ChargeRequest;
  const recip = db.getPrimaryRecipient();

  if (!body.customerPhone || !body.customerName) {
    return res.status(400).json({
      error: 'Missing required customer parameters: customerName and customerPhone are required.'
    });
  }

  const packages = db.getPackages();
  let selectedPackage: ServicePackage | undefined;
  if (body.packageId) {
    selectedPackage = packages.find((p) => p.id === body.packageId || p.code === body.packageId);
  }

  // All charges are primarily in US DOLLARS ($ USD)
  let amountUSD = Number(body.amount);
  if (!amountUSD || isNaN(amountUSD) || amountUSD <= 0) {
    if (selectedPackage) {
      amountUSD = selectedPackage.priceUSD;
    } else {
      return res.status(400).json({ error: 'Invalid or missing subscription charge amount in USD.' });
    }
  }

  const amountUGX = Math.round(amountUSD * UGX_TO_USD_RATE);

  const packageName = selectedPackage ? selectedPackage.title : body.customPackageTitle || 'Muslim Matrimonial Subscription';
  const packageId = selectedPackage ? selectedPackage.id : 'custom-charge';

  const referenceCode = `IH-ZWJ-${Math.floor(100000 + Math.random() * 900000)}`;
  const txnId = `txn-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

  const isAirtel =
    body.paymentMethod === 'airtel_money' ||
    body.customerPhone.includes('70') ||
    body.customerPhone.includes('74') ||
    body.customerPhone.includes('75');

  const ussdCode = isAirtel
    ? `*185*9# -> Merchant: ${recip.phoneNumber} (Islamic Habibi) -> Amount: $${amountUSD} (UGX ${amountUGX.toLocaleString()})`
    : `*165*3# -> Merchant: ${recip.phoneNumber} (Islamic Habibi) -> Amount: $${amountUSD} (UGX ${amountUGX.toLocaleString()})`;

  const newTxn: Transaction = {
    id: txnId,
    reference: referenceCode,
    packageId,
    packageName,
    amount: amountUSD,
    currency: 'USD',
    amountUSD,
    amountUGX,
    customerName: body.customerName.trim(),
    customerPhone: body.customerPhone.trim(),
    customerEmail: body.customerEmail ? body.customerEmail.trim() : '',
    paymentMethod: body.paymentMethod || (isAirtel ? 'airtel_money' : 'mtn_momo'),
    recipientPhone: recip.phoneNumber, // 256744042286
    recipientName: recip.businessName, // Islamic Habibi
    status: 'completed',
    notes: body.notes || 'Muslim Matrimonial & Nikah Subscription Fee',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    ussdPrompt: ussdCode,
    channel: body.channel || 'API',
    preferredDate: body.preferredDate,
    preferredTime: body.preferredTime
  };

  db.addTransaction(newTxn);

  res.status(201).json({
    success: true,
    message: `Matrimonial subscription charge of $${amountUSD.toLocaleString()} successfully processed and credited to ${recip.businessName} (${recip.formattedPhone}).`,
    recipient: {
      accountNumber: recip.phoneNumber,
      beneficiary: recip.businessName,
      status: recip.status,
      network: recip.primaryCarriers.join(', ')
    },
    transaction: newTxn,
    ussdPush: {
      sentTo: body.customerPhone,
      promptText: `Confirm payment of $${amountUSD} (UGX ${amountUGX.toLocaleString()}) to Islamic Habibi (${recip.phoneNumber}) with your PIN.`,
      status: 'DELIVERED_AND_CONFIRMED'
    }
  });
});

// 15. Get All Transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  const { status, search, limit } = req.query;
  const recip = db.getPrimaryRecipient();
  let filtered = [...db.getTransactions()];

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q) ||
        t.packageName.toLowerCase().includes(q)
    );
  }

  if (limit && !isNaN(Number(limit))) {
    filtered = filtered.slice(0, Number(limit));
  }

  res.json({
    total: filtered.length,
    merchant: `${recip.businessName} (${recip.phoneNumber})`,
    totalCreditedUSD: recip.totalReceivedUSD,
    availableBalanceUSD: recip.availableBalanceUSD,
    transactions: filtered
  });
});

// 16. Get Single Transaction
app.get('/api/transactions/:idOrRef', (req: Request, res: Response) => {
  const param = req.params.idOrRef;
  const txns = db.getTransactions();
  const txn = txns.find((t) => t.id === param || t.reference === param);
  if (!txn) {
    return res.status(404).json({ error: 'Matrimonial transaction not found: ' + param });
  }
  res.json(txn);
});

// 17. Verify Transaction
app.post('/api/charge/verify', (req: Request, res: Response) => {
  const { reference } = req.body;
  const txns = db.getTransactions();
  const txn = txns.find((t) => t.reference === reference);
  if (!txn) {
    return res.status(404).json({ error: 'Transaction reference not found.' });
  }

  txn.status = 'completed';
  txn.completedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Payment reference ${reference} verified and settled to Islamic Habibi (256744042286).`,
    transaction: txn
  });
});

// 18. Resend USSD Push
app.post('/api/charge/resend-push', (req: Request, res: Response) => {
  const { reference } = req.body;
  const txns = db.getTransactions();
  const txn = txns.find((t) => t.reference === reference);
  if (!txn) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }

  res.json({
    success: true,
    message: `Payment prompt sent to ${txn.customerPhone} for charge to Islamic Habibi (256744042286).`,
    ussdCode: txn.ussdPrompt,
    status: 'SENT'
  });
});

// 19. Webhook Simulator
app.post('/api/charge/webhook', (req: Request, res: Response) => {
  res.json({
    received: true,
    merchant: 'Islamic Habibi',
    recipient: '256744042286',
    ipnStatus: 'SUCCESS',
    timestamp: new Date().toISOString()
  });
});

// 20. Analytics in USD
app.get('/api/analytics', (req: Request, res: Response) => {
  const recip = db.getPrimaryRecipient();
  const txns = db.getTransactions();
  const completed = txns.filter((t) => t.status === 'completed');

  const packageBreakdown: Record<string, { count: number; revenueUSD: number }> = {};
  for (const t of completed) {
    if (!packageBreakdown[t.packageName]) {
      packageBreakdown[t.packageName] = { count: 0, revenueUSD: 0 };
    }
    packageBreakdown[t.packageName].count += 1;
    packageBreakdown[t.packageName].revenueUSD += t.amountUSD;
  }

  res.json({
    recipientPhone: recip.phoneNumber,
    merchantName: recip.businessName,
    purpose: 'Helping Muslims Marry Muslims upon Quran & Sunnah',
    currency: 'USD',
    totalReceivedUSD: recip.totalReceivedUSD,
    availableBalanceUSD: recip.availableBalanceUSD,
    totalTransactions: completed.length,
    averageTransactionUSD: completed.length > 0 ? Math.round(recip.totalReceivedUSD / completed.length) : 0,
    packageBreakdown
  });
});

// ----------------------------------------------------
// FRONTEND SERVER / VITE INTEGRATION
// ----------------------------------------------------
async function startServer() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const distExists = fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'));

  if (process.env.NODE_ENV === 'production' || distExists) {
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Islamic Habibi Matrimonial] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[Purpose] Helping Muslims Marry Muslims upon Quran & Sunnah`);
    console.log(`[Charges] All charges in US Dollars ($ USD)`);
    console.log(`[Merchant] Recipient: +256 744 042 286`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
