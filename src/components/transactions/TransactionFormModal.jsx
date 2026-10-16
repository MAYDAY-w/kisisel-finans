import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_CONFIG } from '../../types/index.js';
import { getTodayDateString } from '../../utils/formatters';
import { compressMultipleImages } from '../../utils/imageCompressor';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Coins,
  TrendingUp,
  MoreHorizontal,
  Calculator,
  PlusCircle,
  Tag,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  Loader2,
  FileText,
  CreditCard,
  Wallet,
  Sparkles
} from 'lucide-react';

import { analyzeReceiptWithGemini } from '../../services/receiptVision.js';

export function TransactionFormModal() {
  const {
    isAddModalOpen,
    closeAddTransactionModal,
    editingTransaction,
    addTransaction,
    updateTransaction,
    addInvestment,
    categories,
    accounts,
    settings,
    openReceiptViewer,
    getCreditCardDetails,
    t,
    getCategoryName,
    getTransactionTypeName,
    language,
  } = useFinance();

  // Form states
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  // Asset/item specific fields (for Alış / Satış / Yatırım)
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [showAssetFields, setShowAssetFields] = useState(false);
  const [alsoAddToPortfolio, setAlsoAddToPortfolio] = useState(false);

  // Receipt photos state
  const [receiptImages, setReceiptImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const amountInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleAnalyzeReceipt = async (imgUrl) => {
    if (!settings.geminiApiKey) {
      alert("Lütfen Ayarlar sayfasından Gemini API anahtarınızı ekleyin.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const catString = categories.map(c => `${c.id} (${c.name})`).join(', ');
      const result = await analyzeReceiptWithGemini(imgUrl, settings.geminiApiKey, catString);
      
      if (result.totalAmount) {
        setAmount(String(result.totalAmount));
      }
      if (result.merchant || (result.items && result.items.length > 0)) {
        let desc = result.merchant || '';
        if (result.items && result.items.length > 0) {
          desc += desc ? ': ' + result.items[0].name : result.items[0].name;
          if (result.items.length > 1) {
            desc += ' + ' + (result.items.length - 1) + ' ürün';
          }
        }
        setDescription(desc);
      }
      if (result.date) {
        setDate(result.date);
      }
      if (result.note) {
        setNote(result.note);
      }
      
      // Auto-categorize based on AI result
      if (result.category) {
        const aiCat = String(result.category).toLowerCase();
        const matched = categories.find(c => 
          c.id.toLowerCase() === aiCat || 
          c.name.toLowerCase() === aiCat ||
          aiCat.includes(c.id.toLowerCase()) ||
          aiCat.includes(c.name.toLowerCase())
        );
        if (matched) {
          setCategoryId(matched.id);
        } else {
          // Fallback if AI hallucinates a non-existent category
          const fallbackMatches = {
            'market': 'food', 'restoran': 'food', 'gıda': 'food',
            'giyim': 'shopping', 'kıyafet': 'shopping',
            'elektronik': 'electronics', 'fatura': 'bills',
            'akaryakıt': 'transport', 'benzin': 'transport', 'sağlık': 'health'
          };
          for (const [key, val] of Object.entries(fallbackMatches)) {
            if (aiCat.includes(key)) {
              setCategoryId(val);
              break;
            }
          }
        }
      }
      
      // Since it's a receipt, it's most likely an expense
      setType(TRANSACTION_TYPES.EXPENSE);
      
    } catch (err) {
      alert("Fiş analizi başarısız oldu: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Type buttons configuration with icons
  const typeButtons = [
    { type: TRANSACTION_TYPES.EXPENSE, label: getTransactionTypeName(TRANSACTION_TYPES.EXPENSE, 'Gider'), icon: ArrowDownLeft, color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-rose-700 bg-rose-50/80 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700 dark:hover:bg-rose-900/40' },
    { type: TRANSACTION_TYPES.INCOME, label: getTransactionTypeName(TRANSACTION_TYPES.INCOME, 'Gelir'), icon: ArrowUpRight, color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-emerald-700 bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900/40' },
    { type: TRANSACTION_TYPES.PURCHASE, label: getTransactionTypeName(TRANSACTION_TYPES.PURCHASE, 'Alış'), icon: ShoppingBag, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-blue-700 bg-blue-50/80 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/40' },
    { type: TRANSACTION_TYPES.SALE, label: getTransactionTypeName(TRANSACTION_TYPES.SALE, 'Satış'), icon: Coins, color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-amber-700 bg-amber-50/80 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/40' },
    { type: TRANSACTION_TYPES.INVESTMENT, label: getTransactionTypeName(TRANSACTION_TYPES.INVESTMENT, 'Yatırım'), icon: TrendingUp, color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-purple-700 bg-purple-50/80 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/40' },
    { type: TRANSACTION_TYPES.OTHER, label: getTransactionTypeName(TRANSACTION_TYPES.OTHER, 'Diğer'), icon: MoreHorizontal, color: 'hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 text-slate-800 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-750' },
  ];

  // Populate or reset form when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type || TRANSACTION_TYPES.EXPENSE);
        setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
        setDate(editingTransaction.date || getTodayDateString());
        setCategoryId(editingTransaction.categoryId || (categories[0]?.id || 'other'));
        setAccountId(editingTransaction.accountId || (accounts[0]?.id || ''));
        setDescription(editingTransaction.description || '');
        setNote(editingTransaction.note || '');
        setItemName(editingTransaction.itemName || '');
        setQuantity(editingTransaction.quantity ? String(editingTransaction.quantity) : '');
        setUnitPrice(editingTransaction.unitPrice ? String(editingTransaction.unitPrice) : '');
        setShowAssetFields(
          Boolean(editingTransaction.itemName || editingTransaction.quantity || editingTransaction.unitPrice) ||
          [TRANSACTION_TYPES.PURCHASE, TRANSACTION_TYPES.SALE, TRANSACTION_TYPES.INVESTMENT].includes(editingTransaction.type)
        );
        setAlsoAddToPortfolio(false);
        setReceiptImages(editingTransaction.receiptImages || []);
      } else {
        const defaultType = settings.lastUsedType || TRANSACTION_TYPES.EXPENSE;
        const defaultCat = settings.lastUsedCategoryId || (categories[0]?.id || 'food');
        const defaultAcc = settings.lastUsedAccountId || (accounts[0]?.id || '');

        setType(defaultType);
        setAmount('');
        setDate(getTodayDateString());
        setCategoryId(defaultCat);
        setAccountId(defaultAcc);
        setDescription('');
        setNote('');
        setItemName('');
        setQuantity('');
        setUnitPrice('');
        setShowAssetFields(
          [TRANSACTION_TYPES.PURCHASE, TRANSACTION_TYPES.SALE, TRANSACTION_TYPES.INVESTMENT].includes(defaultType)
        );
        setAlsoAddToPortfolio(false);
        setReceiptImages([]);
      }

      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 100);

      if (editingTransaction?.autoAnalyzeOnMount && editingTransaction.receiptImages?.length > 0) {
        // Clear the flag to prevent infinite loops if state changes
        editingTransaction.autoAnalyzeOnMount = false;
        handleAnalyzeReceipt(editingTransaction.receiptImages[0].url);
      }
    }
  }, [isAddModalOpen, editingTransaction, categories, accounts, settings]);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    if ([TRANSACTION_TYPES.PURCHASE, TRANSACTION_TYPES.SALE, TRANSACTION_TYPES.INVESTMENT].includes(selectedType)) {
      setShowAssetFields(true);
    }
  };

  // Quantity * UnitPrice calculation
  const handleQuantityChange = (val) => {
    setQuantity(val);
    const numQty = parseFloat(val);
    const numUnit = parseFloat(unitPrice);
    if (!isNaN(numQty) && !isNaN(numUnit) && numQty > 0 && numUnit > 0) {
      setAmount((numQty * numUnit).toFixed(2).replace(/\.00$/, ''));
    }
  };

  const handleUnitPriceChange = (val) => {
    setUnitPrice(val);
    const numQty = parseFloat(quantity);
    const numUnit = parseFloat(val);
    if (!isNaN(numQty) && !isNaN(numUnit) && numQty > 0 && numUnit > 0) {
      setAmount((numQty * numUnit).toFixed(2).replace(/\.00$/, ''));
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    const numAmt = parseFloat(val);
    const numQty = parseFloat(quantity);
    if (!isNaN(numAmt) && !isNaN(numQty) && numQty > 0 && numAmt > 0) {
      setUnitPrice((numAmt / numQty).toFixed(2).replace(/\.00$/, ''));
    }
  };

  // Voice NLP recognized callback
  const handleVoiceParsed = (parsed) => {
    if (parsed.amount) setAmount(String(parsed.amount));
    if (parsed.type) handleTypeSelect(parsed.type);
    if (parsed.categoryId) setCategoryId(parsed.categoryId);
    if (parsed.description) setDescription(parsed.description);
  };

  // Handle Image File Upload & Compression
  const handleImageFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const compressedList = await compressMultipleImages(files);
      setReceiptImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      alert('Görsel sıkıştırılırken bir hata oluştu: ' + err.message);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imgId) => {
    setReceiptImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.toString().replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId) || {
      id: categoryId || 'other',
      name: 'Diğer',
    };

    const selectedAccount = accounts.find((a) => a.id === accountId);

    const finalDescription =
      description.trim() ||
      itemName.trim() ||
      `${selectedCategory.name} ${TRANSACTION_TYPE_CONFIG[type].label}`;

    const txPayload = {
      type,
      amount: parsedAmount,
      date,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      accountId: selectedAccount?.id || undefined,
      accountName: selectedAccount?.name || undefined,
      description: finalDescription,
      note: note.trim(),
      itemName: itemName.trim() || undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
      receiptImages: receiptImages.length > 0 ? receiptImages : undefined,
    };

    if (editingTransaction?.id) {
      updateTransaction(editingTransaction.id, txPayload);
    } else {
      addTransaction(txPayload);

      if (alsoAddToPortfolio && itemName.trim() && quantity) {
        addInvestment({
          name: itemName.trim(),
          type: categoryId === 'gold' ? 'gold' : categoryId === 'crypto' ? 'crypto' : categoryId === 'stocks' ? 'stocks' : 'other',
          quantity: parseFloat(quantity) || 1,
          unit: categoryId === 'gold' ? 'gram' : categoryId === 'stocks' ? 'lot' : 'adet',
          purchasePrice: unitPrice ? parseFloat(unitPrice) : (parsedAmount / (parseFloat(quantity) || 1)),
          currentPrice: unitPrice ? parseFloat(unitPrice) : (parsedAmount / (parseFloat(quantity) || 1)),
          purchaseDate: date,
          note: `İşlemden eklendi: ${finalDescription}`,
        });
      }
    }

    closeAddTransactionModal();
  };

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={closeAddTransactionModal}
      title={editingTransaction?.id ? t('transactions.editTransaction') : t('transactions.newTransaction')}
      subtitle={t('transactions.formSubtitle', 'Gelir, harcama, fiş veya varlık hareketinizi kaydedin')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Input Header Bar */}
        <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/30 p-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              🎙️ {t('transactions.voiceInputTip', 'Sesinle Söyle, Doldursun')}
            </span>
          </div>
          <VoiceInputButton onParsed={handleVoiceParsed} categories={categories} />
        </div>

        {/* Transaction Type Selector Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('transactions.type', 'İşlem Türü')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typeButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = type === btn.type;
              return (
                <button
                  type="button"
                  key={btn.type}
                  onClick={() => handleTypeSelect(btn.type)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? `${btn.color} ring-2 ring-offset-1 ring-current shadow-sm`
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Amount Input */}
        <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('common.amount')} ({settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : '₺'})
          </label>
          <div className="relative flex items-center">
            <input
              ref={amountInputRef}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              className="w-full text-3xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">{t('transactions.quickPreset', 'Hızlı')}:</span>
            {[50, 100, 250, 500, 1000, 5000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount(String(current + preset));
                }}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg text-slate-700 dark:text-slate-200 font-semibold transition-colors shrink-0"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Account & Category Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Account / Wallet */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('common.account')}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {accounts.map((acc) => {
                let label = `${acc.name} (${acc.balance.toLocaleString('tr-TR')} ₺)`;
                if (acc.type === 'credit_card') {
                  const details = getCreditCardDetails ? getCreditCardDetails(acc) : null;
                  const bNum = Number(acc.balance) || 0;
                  const prefix = details?.isMainCard
                    ? '[👑 Ana Kart] '
                    : details?.isSubCard
                    ? '[🔗 Ek Kart] '
                    : '';
                  const rem = details ? details.availableLimit : 0;

                  if (bNum > 0) {
                    label = `${prefix}${acc.name} (${language === 'en' ? 'Excess: +' : 'Artı Bakiye: +'}${bNum.toLocaleString('tr-TR')} ₺ | ${language === 'en' ? 'Avail: ' : 'Kalan: '}${rem.toLocaleString('tr-TR')} ₺)`;
                  } else {
                    const debt = Math.abs(bNum);
                    label = `${prefix}${acc.name} (${language === 'en' ? 'Debt: ' : 'Borç: '}${debt.toLocaleString('tr-TR')} ₺ | ${language === 'en' ? 'Avail: ' : 'Kalan: '}${rem.toLocaleString('tr-TR')} ₺)`;
                  }
                }
                return (
                  <option key={acc.id} value={acc.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('common.category')}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat.id, cat.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('common.date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('common.description')}
            </label>
            <input
              type="text"
              placeholder={t('transactions.descriptionPlaceholder', 'Örn: Market alışverişi, Maaş, Gram Altın...')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* RECEIPT / BILL PHOTO ATTACHMENT SECTION */}
        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {t('transactions.receiptPhoto', 'Fiş / Fatura Fotoğrafı')}
              </span>
            </div>
            {receiptImages.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                {receiptImages.length} {language === 'en' ? 'Receipts Attached' : 'Fiş Eklendi'}
              </span>
            )}
          </div>

          {/* Upload Buttons */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageFiles(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleImageFiles(e.target.files)}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              icon={Camera}
              className="flex-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold"
              disabled={isUploadingImage}
            >
              {t('transactions.takePhoto', 'Fotoğraf Çek')}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={ImageIcon}
              className="flex-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold"
              disabled={isUploadingImage}
            >
              {t('transactions.chooseFromGallery', 'Galeriden Seç')}
            </Button>
          </div>

          {isUploadingImage && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'Optimizing image...' : 'Görsel optimize ediliyor...'}</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-indigo-700 font-medium bg-indigo-50 rounded-xl border border-indigo-200">
              <Sparkles className="w-4 h-4 animate-pulse text-indigo-600" />
              <span>{language === 'en' ? 'AI is analyzing receipt, please wait...' : 'Yapay Zeka fişi inceliyor, lütfen bekleyin...'}</span>
            </div>
          )}

          {receiptImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {receiptImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-emerald-300/80 bg-slate-100 shadow-sm"
                >
                  <div className="aspect-square">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="absolute top-1 right-1 flex gap-1 z-10">
                    <button
                      type="button"
                      onClick={() => openReceiptViewer({ ...img, description })}
                      className="p-1.5 bg-white/90 shadow-sm text-slate-800 rounded-lg hover:bg-white"
                      title={language === 'en' ? 'Zoom' : 'Büyüt'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-1.5 bg-rose-600 shadow-sm text-white rounded-lg hover:bg-rose-700"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => handleAnalyzeReceipt(img.url)}
                    className="absolute bottom-0 inset-x-0 w-full py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('transactions.aiFill', 'Yapay Zeka ile Doldur')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Asset/Purchase details toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAssetFields(!showAssetFields)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 py-1"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{showAssetFields ? (language === 'en' ? 'Hide Asset / Quantity Fields' : 'Varlık / Miktar Alanlarını Gizle') : (language === 'en' ? '+ Add Asset Name, Quantity & Unit Price' : '+ Varlık Adı, Miktar ve Birim Fiyat Ekle')}</span>
          </button>

          {showAssetFields && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2.5 animate-slide-up">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Asset / Item Name' : 'Varlık / Kalem Adı'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Gold Gram, Apple Stock, USD, MacBook' : 'Örn: Gram Altın, THYAO, USD, MacBook'}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Quantity / Amount' : 'Miktar / Adet'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="5"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Unit Price' : 'Birim Fiyat'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="4500"
                    value={unitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {!editingTransaction && (
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alsoAddToPortfolio}
                    onChange={(e) => setAlsoAddToPortfolio(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {language === 'en' ? 'Also add this item to my Investment Portfolio' : 'Bu kalemi Yatırım Portföyüme de ekle'}
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Optional Note */}
        <div>
          <textarea
            rows="3"
            placeholder={t('transactions.notePlaceholder', 'Ek notlar, ürün detayları vb. (isteğe bağlı)...')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={closeAddTransactionModal}
            className="flex-1"
            size="md"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 font-bold"
            size="md"
          >
            {editingTransaction?.id ? t('common.save') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
