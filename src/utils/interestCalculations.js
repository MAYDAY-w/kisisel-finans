/**
 * Helper to calculate calendar days between two dates (YYYY-MM-DD strings or Date objects).
 */
export function getDaysDiff(startDate, endDate = null) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = e.getTime() - s.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates daily interest returns considering initial principal and later additions.
 * Each addition accrues interest strictly from its addition date to today,
 * preserving existing profits and accurately scaling future yields.
 */
export function calculateDailyInterestAccrual({
  purchasePrice = 0,
  purchaseDate = null,
  interestRate = 0,
  stopajRate = 10,
  uninvestedAmount = 0,
  additions = [],
  targetDate = null,
}) {
  const p0 = parseFloat(purchasePrice?.toString().replace(',', '.')) || 0;
  const rate = parseFloat(interestRate?.toString().replace(',', '.')) || 0;
  const uninvested = parseFloat(uninvestedAmount?.toString().replace(',', '.')) || 0;
  const tax = parseFloat(stopajRate?.toString().replace(',', '.')) || 0;

  const dailyGrossFactor = (rate / 100) / 365;
  const dailyNetFactor = dailyGrossFactor * (1 - tax / 100);

  // Parse valid additions
  const validAdditions = (additions || []).map((a) => ({
    ...a,
    amount: parseFloat(a.amount?.toString().replace(',', '.')) || 0,
    date: a.date || purchaseDate,
  }));
  const additionsTotal = validAdditions.reduce((sum, a) => sum + a.amount, 0);
  const totalPrincipal = p0 + additionsTotal;

  // Accrual on base principal
  const baseDays = getDaysDiff(purchaseDate, targetDate);
  const netBasePrincipal = Math.max(0, p0 - uninvested);
  const baseAccruedNet = netBasePrincipal * dailyNetFactor * baseDays;

  // Accrual on each addition from its addition date to targetDate
  let additionsAccruedNet = 0;
  const additionsBreakdown = validAdditions.map((a) => {
    const days = getDaysDiff(a.date, targetDate);
    const accrued = a.amount * dailyNetFactor * days;
    additionsAccruedNet += accrued;
    return {
      ...a,
      days,
      accruedNet: accrued,
      dailyNet: a.amount * dailyNetFactor,
    };
  });

  const totalAccruedNet = baseAccruedNet + additionsAccruedNet;
  const currentTotal = totalPrincipal + totalAccruedNet;

  // Active yield from today onwards with all capital
  const activePrincipal = Math.max(0, totalPrincipal - uninvested);
  const currentGrossDaily = activePrincipal * dailyGrossFactor;
  const currentDailyTax = currentGrossDaily * (tax / 100);
  const currentDailyNet = currentGrossDaily - currentDailyTax;

  return {
    initialPrincipal: p0,
    additionsTotal,
    totalPrincipal,
    baseDays,
    baseAccruedNet,
    additionsAccruedNet,
    additionsBreakdown,
    totalAccruedNet,
    currentTotal,
    currentGrossDaily,
    currentDailyTax,
    currentDailyNet,
    dailyNetFactor,
  };
}

/**
 * Calculates term deposit (vadeli mevduat) returns considering initial principal and later additions.
 * Each addition accrues interest for its remaining days until the maturity date.
 */
export function calculateDepositAccrual({
  purchasePrice = 0,
  purchaseDate = null,
  maturityDays = 32,
  interestRate = 0,
  stopajRate = 10,
  additions = [],
  targetDate = null,
}) {
  const p0 = parseFloat(purchasePrice?.toString().replace(',', '.')) || 0;
  const rate = parseFloat(interestRate?.toString().replace(',', '.')) || 0;
  const mDays = parseInt(maturityDays?.toString()) || 32;
  const tax = parseFloat(stopajRate?.toString().replace(',', '.')) || 0;

  // Maturity End Date
  const startDate = purchaseDate ? new Date(purchaseDate) : new Date();
  const maturityEndDate = new Date(startDate);
  maturityEndDate.setDate(maturityEndDate.getDate() + mDays);
  const maturityDateStr = maturityEndDate.toISOString().split('T')[0];

  const dailyGrossFactor = (rate / 100) / 365;
  const dailyNetFactor = dailyGrossFactor * (1 - tax / 100);

  const validAdditions = (additions || []).map((a) => ({
    ...a,
    amount: parseFloat(a.amount?.toString().replace(',', '.')) || 0,
    date: a.date || purchaseDate,
  }));
  const additionsTotal = validAdditions.reduce((sum, a) => sum + a.amount, 0);
  const totalPrincipal = p0 + additionsTotal;

  // Base maturity interest
  const baseGrossInterest = (p0 * rate * mDays) / 36500;
  const baseTax = baseGrossInterest * (tax / 100);
  const baseNetInterest = baseGrossInterest - baseTax;

  // Additions maturity interest
  let additionsGrossInterest = 0;
  let additionsNetInterest = 0;
  const additionsBreakdown = validAdditions.map((a) => {
    const remainingDays = getDaysDiff(a.date, maturityDateStr);
    const gross = (a.amount * rate * remainingDays) / 36500;
    const taxDed = gross * (tax / 100);
    const net = gross - taxDed;
    additionsGrossInterest += gross;
    additionsNetInterest += net;
    return {
      ...a,
      remainingDays,
      grossInterest: gross,
      netInterest: net,
    };
  });

  const totalGrossInterest = baseGrossInterest + additionsGrossInterest;
  const totalTax = baseTax + additionsGrossInterest * (tax / 100);
  const totalNetInterest = baseNetInterest + additionsNetInterest;
  const maturityTotal = totalPrincipal + totalNetInterest;

  // Accrued to targetDate (today)
  const baseElapsedDays = Math.min(mDays, getDaysDiff(purchaseDate, targetDate));
  const baseAccruedToday = p0 * dailyNetFactor * baseElapsedDays;
  let additionsAccruedToday = 0;
  validAdditions.forEach((a) => {
    const remaining = getDaysDiff(a.date, maturityDateStr);
    const elapsed = Math.min(remaining, getDaysDiff(a.date, targetDate));
    additionsAccruedToday += a.amount * dailyNetFactor * elapsed;
  });
  const totalAccruedToday = baseAccruedToday + additionsAccruedToday;
  const currentTotalToday = totalPrincipal + totalAccruedToday;

  return {
    initialPrincipal: p0,
    additionsTotal,
    totalPrincipal,
    maturityDays: mDays,
    maturityDateStr,
    baseGrossInterest,
    baseTax,
    baseNetInterest,
    additionsGrossInterest,
    additionsNetInterest,
    additionsBreakdown,
    totalGrossInterest,
    totalTax,
    totalNetInterest,
    maturityTotal,
    baseElapsedDays,
    totalAccruedToday,
    currentTotalToday,
  };
}
