export const TRANSACTION_TYPES = {
  INCOME: 'income',       // Gelir
  EXPENSE: 'expense',     // Gider
  PURCHASE: 'purchase',   // Alış (Varlık/Eşya)
  SALE: 'sale',           // Satış (Varlık/Eşya)
  INVESTMENT: 'investment', // Yatırım
  TRANSFER: 'transfer',   // Hesaplar arası virman/transfer
  OTHER: 'other',         // Diğer
};

export const TRANSACTION_TYPE_CONFIG = {
  [TRANSACTION_TYPES.INCOME]: {
    id: TRANSACTION_TYPES.INCOME,
    label: 'Gelir',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    amountPrefix: '+',
    amountClass: 'text-emerald-600',
    description: 'Maaş, ek gelir, faiz vb.'
  },
  [TRANSACTION_TYPES.EXPENSE]: {
    id: TRANSACTION_TYPES.EXPENSE,
    label: 'Gider',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600',
    amountPrefix: '-',
    amountClass: 'text-rose-600',
    description: 'Yemek, fatura, alışveriş vb.'
  },
  [TRANSACTION_TYPES.PURCHASE]: {
    id: TRANSACTION_TYPES.PURCHASE,
    label: 'Alış',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
    amountPrefix: '-',
    amountClass: 'text-blue-600',
    description: 'Altın, döviz, cihaz, araç vb. alımı'
  },
  [TRANSACTION_TYPES.SALE]: {
    id: TRANSACTION_TYPES.SALE,
    label: 'Satış',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    amountPrefix: '+',
    amountClass: 'text-amber-600',
    description: 'Varlık veya eşya satışı geliri'
  },
  [TRANSACTION_TYPES.INVESTMENT]: {
    id: TRANSACTION_TYPES.INVESTMENT,
    label: 'Yatırım',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
    amountPrefix: '-',
    amountClass: 'text-purple-600',
    description: 'Fon, hisse, kripto vb. yatırımı'
  },
  [TRANSACTION_TYPES.TRANSFER]: {
    id: TRANSACTION_TYPES.TRANSFER,
    label: 'Transfer',
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconBg: 'bg-cyan-100 text-cyan-600',
    amountPrefix: '⇄',
    amountClass: 'text-cyan-600',
    description: 'Hesaplar arası para transferi (Virman)'
  },
  [TRANSACTION_TYPES.OTHER]: {
    id: TRANSACTION_TYPES.OTHER,
    label: 'Diğer',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-600',
    amountPrefix: '',
    amountClass: 'text-slate-600',
    description: 'Diğer finansal transferler'
  }
};

export const ACCOUNT_TYPES = {
  CASH: 'cash',
  BANK: 'bank',
  CREDIT_CARD: 'credit_card',
  INVESTMENT: 'investment',
};

export const ACCOUNT_TYPE_CONFIG = {
  [ACCOUNT_TYPES.CASH]: {
    id: ACCOUNT_TYPES.CASH,
    label: 'Nakit Cüzdan',
    icon: 'Wallet',
    color: '#10b981',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [ACCOUNT_TYPES.BANK]: {
    id: ACCOUNT_TYPES.BANK,
    label: 'Banka Hesabı',
    icon: 'Landmark',
    color: '#3b82f6',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [ACCOUNT_TYPES.CREDIT_CARD]: {
    id: ACCOUNT_TYPES.CREDIT_CARD,
    label: 'Kredi Kartı',
    icon: 'CreditCard',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  [ACCOUNT_TYPES.INVESTMENT]: {
    id: ACCOUNT_TYPES.INVESTMENT,
    label: 'Yatırım Hesabı',
    icon: 'TrendingUp',
    color: '#f59e0b',
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export const DEBT_TYPES = {
  LENT: 'lent',         // Alacak (Başkasına verdiğim, geri alacağım para)
  BORROWED: 'borrowed', // Borç (Başkasına olan borcum, geri ödeyeceğim para)
};

export const RECURRING_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Yemek & Market', icon: 'Utensils', color: '#f97316' },
  { id: 'transport', name: 'Ulaşım & Akaryakıt', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'Alışveriş', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'bills', name: 'Faturalar & Abonelik', icon: 'Receipt', color: '#ef4444' },
  { id: 'rent', name: 'Ev Kirası & Konut', icon: 'Home', color: '#f43f5e' },
  { id: 'dues', name: 'Aidat & Site Yönetimi', icon: 'Building', color: '#64748b' },
  { id: 'subscriptions', name: 'Dijital Abonelikler', icon: 'Tv', color: '#8b5cf6' },
  { id: 'clothing', name: 'Giyim & Aksesuar', icon: 'Shirt', color: '#ec4899' },
  { id: 'personal_care', name: 'Kişisel Bakım & Kozmetik', icon: 'Sparkles', color: '#d946ef' },
  { id: 'home', name: 'Ev & Yaşam', icon: 'Sofa', color: '#f59e0b' },
  { id: 'travel', name: 'Tatil & Seyahat', icon: 'Plane', color: '#06b6d4' },
  { id: 'pet', name: 'Evcil Hayvan', icon: 'Dog', color: '#eab308' },
  { id: 'health', name: 'Sağlık & Bakım', icon: 'HeartPulse', color: '#f43f5e' },
  { id: 'education', name: 'Eğitim & Kurs', icon: 'GraduationCap', color: '#84cc16' },
  { id: 'entertainment', name: 'Eğlence & Hobi', icon: 'Gamepad2', color: '#a855f7' },
  { id: 'electronics', name: 'Elektronik & Teknoloji', icon: 'Smartphone', color: '#6366f1' },
  { id: 'vehicle', name: 'Araç & Bakım', icon: 'Wrench', color: '#64748b' },
  { id: 'salary', name: 'Maaş & Gelir', icon: 'Wallet', color: '#10b981' },
  { id: 'interest', name: 'Faiz Kazancı', icon: 'Percent', color: '#059669' },
  { id: 'dividend', name: 'Temettü & Kâr Payı', icon: 'PieChart', color: '#10b981' },
  { id: 'rental_income', name: 'Kira Geliri', icon: 'Key', color: '#10b981' },
  { id: 'bonus', name: 'Prim & İkramiye', icon: 'Award', color: '#10b981' },
  { id: 'investment', name: 'Yatırım & Fon', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'gold', name: 'Altın', icon: 'Coins', color: '#eab308' },
  { id: 'stocks', name: 'Borsa & Hisse', icon: 'LineChart', color: '#06b6d4' },
  { id: 'crypto', name: 'Kripto Para', icon: 'Bitcoin', color: '#f59e0b' },
  { id: 'foreign_currency', name: 'Döviz', icon: 'Banknote', color: '#14b8a6' },
  { id: 'insurance', name: 'Sigorta & Kasko', icon: 'ShieldCheck', color: '#0284c7' },
  { id: 'tax', name: 'Vergi & Harçlar', icon: 'Scale', color: '#dc2626' },
  { id: 'debt', name: 'Borç & Alacak', icon: 'Handshake', color: '#6366f1' },
  { id: 'gift', name: 'Hediye & Bağış', icon: 'Gift', color: '#f43f5e' },
  { id: 'kids', name: 'Çocuk & Bebek', icon: 'Baby', color: '#38bdf8' },
  { id: 'other', name: 'Diğer', icon: 'MoreHorizontal', color: '#64748b' },
];

export const CURRENCIES = {
  TRY: { code: 'TRY', symbol: '₺', name: 'Türk Lirası', position: 'after' },
  USD: { code: 'USD', symbol: '$', name: 'Amerikan Doları', position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', position: 'before' },
};

export const ASSET_TYPES = [
  { id: 'gold', label: 'Altın / Kıymetli Maden', unit: 'gram' },
  { id: 'stocks', label: 'Hisse Senedi (BIST/ABD)', unit: 'lot' },
  { id: 'crypto', label: 'Kripto Para', unit: 'adet' },
  { id: 'currency', label: 'Döviz (USD, EUR vb.)', unit: 'adet' },
  { id: 'deposit', label: 'Vadeli Mevduat', unit: 'TL' },
  { id: 'daily_interest', label: 'Gecelik / Günlük Faiz', unit: 'TL' },
  { id: 'fund', label: 'Yatırım Fonu (TEFAS)', unit: 'pay' },
  { id: 'other', label: 'Diğer Varlık', unit: 'adet' },
];
