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
  Wallet
} from 'lucide-react';

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

  const amountInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Type buttons configuration with icons
  const typeButtons = [
    { type: TRANSACTION_TYPES.EXPENSE, label: 'Gider', icon: ArrowDownLeft, color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-rose-700 bg-rose-50/80 border-rose-300' },
    { type: TRANSACTION_TYPES.INCOME, label: 'Gelir', icon: ArrowUpRight, color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-emerald-700 bg-emerald-50/80 border-emerald-300' },
    { type: TRANSACTION_TYPES.PURCHASE, label: 'Alış', icon: ShoppingBag, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-blue-700 bg-blue-50/80 border-blue-300' },
    { type: TRANSACTION_TYPES.SALE, label: 'Satış', icon: Coins, color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-amber-700 bg-amber-50/80 border-amber-300' },
    { type: TRANSACTION_TYPES.INVESTMENT, label: 'Yatırım', icon: TrendingUp, color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-purple-700 bg-purple-50/80 border-purple-300' },
    { type: TRANSACTION_TYPES.OTHER, label: 'Diğer', icon: MoreHorizontal, color: 'hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 text-slate-800 bg-slate-100 border-slate-300' },
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
      title={editingTransaction?.id ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
      subtitle="Gelir, harcama, fiş veya varlık hareketinizi kaydedin"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Voice Input Header Bar */}
        <div className="flex items-center justify-between bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900">
              🎙️ Sesinle Söyle, Doldursun
            </span>
          </div>
          <VoiceInputButton onParsed={handleVoiceParsed} categories={categories} />
        </div>

        {/* Transaction Type Selector Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            İşlem Türü
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
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Tutar ({settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : '₺'})
          </label>
          <div className="relative flex items-center">
            <input
              ref={amountInputRef}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              className="w-full text-3xl font-extrabold text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
            />
          </div>
          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Hızlı:</span>
            {[50, 100, 250, 500, 1000, 5000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount(String(current + preset));
                }}
                className="text-xs px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors shrink-0"
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Hesap / Cüzdan
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.balance.toLocaleString('tr-TR')} ₺)
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tarih
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Açıklama / Başlık
            </label>
            <input
              type="text"
              placeholder="Örn: Market alışverişi, Maaş, Gram Altın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* RECEIPT / BILL PHOTO ATTACHMENT SECTION */}
        <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900">
                Fiş / Fatura Fotoğrafı
              </span>
            </div>
            {receiptImages.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {receiptImages.length} Fiş Eklendi
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
              className="flex-1 bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
              disabled={isUploadingImage}
            >
              Fotoğraf Çek
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={ImageIcon}
              className="flex-1 bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
              disabled={isUploadingImage}
            >
              Galeriden Seç
            </Button>
          </div>

          {isUploadingImage && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-700 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Görsel optimize ediliyor...</span>
            </div>
          )}

          {receiptImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {receiptImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-emerald-300/80 bg-slate-100 shadow-sm"
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openReceiptViewer({ ...img, description })}
                      className="p-1 bg-white/90 text-slate-800 rounded hover:bg-white"
                      title="Büyüt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            <span>{showAssetFields ? 'Varlık / Miktar Alanlarını Gizle' : '+ Varlık Adı, Miktar ve Birim Fiyat Ekle'}</span>
          </button>

          {showAssetFields && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 animate-slide-up">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Varlık / Kalem Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Gram Altın, THYAO, USD, MacBook"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Miktar / Adet
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Örn: 5"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Birim Fiyat
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Örn: 4500"
                    value={unitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {!editingTransaction && (
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alsoAddToPortfolio}
                    onChange={(e) => setAlsoAddToPortfolio(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Bu kalemi Yatırım Portföyüme de ekle
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Optional Note */}
        <div>
          <input
            type="text"
            placeholder="Ek notlar (isteğe bağlı)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
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
            Vazgeç
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 font-bold"
            size="md"
          >
            {editingTransaction?.id ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
