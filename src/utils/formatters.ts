export function formatUSD(amount: number): string {
  const isWhole = Math.round(amount) === amount;
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2
  });
}

export function formatUGX(amount: number): string {
  return 'UGX ' + Math.round(amount).toLocaleString('en-US');
}

export function formatPriceUSD(amountUSD: number): string {
  return formatUSD(amountUSD);
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

// Gentle pleasant harmonious two-tone chime on successful payment/registration
export function playSuccessChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now); // F#5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, now + 0.15); // C#6
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch {
    // Audio context might be restricted before interaction, ignore gracefully
  }
}
