import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ASSET_TYPES, TRANSACTION_TYPES } from '../../types';
import { getTodayDateString, formatDate } from '../../utils/formatters';
import {
  calculateDailyInterestAccrual,
  calculateDepositAccrual,
  getDaysDiff,
} from '../../utils/interestCalculations';
import { Trash2, PlusCircle, Landmark, Wallet } from 'lucide-react';

export function InvestmentFormModal() {
  const {
    isInvestmentModalOpen,
    closeAddInvestmentModal,
    editingInvestment,
    addInvestment,
    updateInvestment,
    accounts,
    addTransaction,
    settings,
    language,
    t,
    getAssetTypeName,
    formatMoney,
  } = useFinance();
  const isEn = language === 'en';

  const [name, setName] = useState('');
  const [type, setType] = useState('gold');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('gram');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [additions, setAdditions] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [deductFromAccount, setDeductFromAccount] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [marketData, setMarketData] = useState({ crypto: {}, tr: {} });
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [interestRate, setInterestRate] = useState('');
  const [maturityDays, setMaturityDays] = useState('32');
  const [uninvestedAmount, setUninvestedAmount] = useState('');
  const [stopajRate, setStopajRate] = useState('10');

  const isInterest = type === 'deposit' || type === 'daily_interest';
  const selectedAccount = accounts?.find((a) => a.id === accountId);
  const effectivePrincipal = (isInterest && selectedAccount)
    ? (Number(selectedAccount.balance) || 0)
    : (parseFloat(purchasePrice.toString().replace(',', '.')) || 0);
  const unitSymbol = unit === 'USD' ? '$' : unit === 'EUR' ? '€' : unit === 'GBP' ? '£' : '₺';

  useEffect(() => {
    if (isInvestmentModalOpen) {
      Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price').catch(() => null),
        fetch('https://finans.truncgil.com/today.json').catch(() => null)
      ]).then(async ([cryptoRes, trRes]) => {
        const cData = cryptoRes ? await cryptoRes.json().catch(()=>[]) : [];
        const tData = trRes ? await trRes.json().catch(()=>({})) : {};
        const cMap = {};
        if (Array.isArray(cData)) {
          cData.forEach(item => { cMap[item.symbol] = item.price; });
        }
        setMarketData({ crypto: cMap, tr: tData });
      });

      if (editingInvestment) {
        setName(editingInvestment.name || '');
        setType(editingInvestment.type || 'gold');
        setQuantity(editingInvestment.quantity ? String(editingInvestment.quantity) : '');
        setUnit(editingInvestment.unit || 'gram');
        setPurchasePrice(editingInvestment.purchasePrice ? String(editingInvestment.purchasePrice) : '');
        setCurrentPrice(
          editingInvestment.currentPrice !== undefined
            ? String(editingInvestment.currentPrice)
            : String(editingInvestment.purchasePrice || '')
        );
        setPurchaseDate(editingInvestment.purchaseDate || getTodayDateString());
        setNote(editingInvestment.note || '');
        setInterestRate(editingInvestment.interestRate ? String(editingInvestment.interestRate) : '');
        setMaturityDays(editingInvestment.maturityDays ? String(editingInvestment.maturityDays) : '32');
        setUninvestedAmount(editingInvestment.uninvestedAmount ? String(editingInvestment.uninvestedAmount) : '');
        setStopajRate(
          editingInvestment.stopajRate !== undefined
            ? String(editingInvestment.stopajRate)
            : '10'
        );
        setAdditions(
          Array.isArray(editingInvestment.additions) ? editingInvestment.additions : []
        );
        setAccountId(editingInvestment.accountId || '');
        setDeductFromAccount(false);
      } else {
        setName('');
        setType('gold');
        setQuantity('');
        setUnit('gram');
        setPurchasePrice('');
        setCurrentPrice('');
        setPurchaseDate(getTodayDateString());
        setNote('');
        setInterestRate('');
        setMaturityDays('32');
        setUninvestedAmount('');
        setStopajRate('10');
        setAdditions([]);
        setAccountId('');
        setDeductFromAccount(false);
      }
    }
  }, [isInvestmentModalOpen, editingInvestment]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'gold') setUnit('gram');
    else if (newType === 'stocks') setUnit('lot');
    else if (newType === 'crypto') setUnit('adet');
    else if (newType === 'currency') setUnit('birim');
    else if (newType === 'deposit' || newType === 'daily_interest') {
      if (!['TL', 'USD', 'EUR', 'GBP'].includes(unit)) {
        setUnit('TL');
      }
      setQuantity('1');
    }
    else setUnit('adet');
  };

  const calculateDepositReturn = () => {
    const res = calculateDepositAccrual({
      purchasePrice: effectivePrincipal,
      purchaseDate,
      maturityDays,
      interestRate,
      stopajRate,
      additions,
    });
    if (res.totalPrincipal <= 0 || !interestRate) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir ana para, faiz oranı ve vade giriniz.');
      return;
    }
    setCurrentPrice(res.maturityTotal.toFixed(2));
  };

  const calculateDailyReturn = () => {
    const res = calculateDailyInterestAccrual({
      purchasePrice: effectivePrincipal,
      purchaseDate,
      interestRate,
      stopajRate,
      uninvestedAmount,
      additions,
    });
    if (res.totalPrincipal <= 0 || !interestRate) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir ana para ve yıllık faiz oranı giriniz.');
      return;
    }
    setCurrentPrice(res.currentTotal.toFixed(2));
  };

  const fetchLivePrice = async (overrideName, overrideUnit) => {
    try {
      setIsFetchingPrice(true);
      const currentName = overrideName || name;
      const currentUnit = overrideUnit || unit;
      
      if (type === 'crypto') {
        let symbol = currentName.toUpperCase().trim();
        if (!symbol.endsWith('TRY') && !symbol.endsWith('USDT')) symbol += 'TRY';
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + symbol);
        const data = await res.json();
        if (data && data.price) {
          setCurrentPrice(parseFloat(data.price).toFixed(4));
          return;
        }
      }

      const res = await fetch('https://finans.truncgil.com/today.json');
      const data = await res.json();
      
      let searchKey = '';
      if (type === 'gold') {
        const u = currentUnit.toLowerCase();
        if (u.includes('çeyrek') || u.includes('ceyrek')) searchKey = 'ceyrek-altin';
        else if (u.includes('yarım') || u.includes('yarim')) searchKey = 'yarim-altin';
        else if (u.includes('tam')) searchKey = 'tam-altin';
        else if (u.includes('cumhuriyet')) searchKey = 'cumhuriyet-altini';
        else if (u.includes('ata')) searchKey = 'ata-altin';
        else if (u.includes('gümüş') || u.includes('gumus')) searchKey = 'gumus';
        else if (u.includes('ons')) searchKey = 'ons';
        else searchKey = 'gram-altin';
      } else if (type === 'currency' || type === 'fx') {
        searchKey = currentName.toUpperCase().trim();
      }

      if (searchKey && data[searchKey]) {
        const pStr = data[searchKey]['Satış'] || data[searchKey]['Satıs'] || data[searchKey]['Alış'] || data[searchKey];
        if (pStr) {
          const val = parseFloat(pStr.replace(/\./g, '').replace(',', '.'));
          if (!isNaN(val)) setCurrentPrice(val.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const linkedAcc = accounts.find((a) => a.id === accountId);
    const parsedQty = isInterest ? 1 : (parseFloat(quantity.toString().replace(',', '.')) || 1);
    const parsedBuyPrice = (isInterest && linkedAcc)
      ? (Number(linkedAcc.balance) || 0)
      : (parseFloat(purchasePrice.toString().replace(',', '.')) || 0);
    const parsedCurrPrice = parseFloat(currentPrice.toString().replace(',', '.'));
    const finalCurrPrice = (isInterest && linkedAcc && isNaN(parsedCurrPrice))
      ? parsedBuyPrice
      : (!isNaN(parsedCurrPrice) ? parsedCurrPrice : parsedBuyPrice);

    const payload = {
      name: name.trim(),
      type,
      typeName: getAssetTypeName(type),
      quantity: parsedQty,
      unit: unit.trim() || (isInterest ? 'TL' : 'adet'),
      purchasePrice: parsedBuyPrice,
      currentPrice: finalCurrPrice,
      purchaseDate,
      note: note.trim(),
      accountId: accountId || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      maturityDays: maturityDays ? parseFloat(maturityDays) : undefined,
      uninvestedAmount: uninvestedAmount ? parseFloat(uninvestedAmount) : undefined,
      stopajRate: stopajRate !== '' ? parseFloat(stopajRate) : 10,
      additions: additions,
    };

    if (editingInvestment?.id) {
      updateInvestment(editingInvestment.id, payload);
    } else {
      addInvestment(payload);
      if (accountId && deductFromAccount && parsedBuyPrice > 0 && type !== 'daily_interest') {
        addTransaction({
          type: TRANSACTION_TYPES.EXPENSE,
          amount: parsedBuyPrice,
          accountId,
          category: 'investment',
          date: purchaseDate,
          description: t('investments.openInvestmentTransactionDesc', { name: name.trim() }),
        });
      }
    }

    closeAddInvestmentModal();
  };

  const POPULAR_ASSETS = {
    crypto: [
      { id: 'BTC', name: 'Bitcoin', symbol: 'BTCTRY', icon: '₿' },
      { id: 'ETH', name: 'Ethereum', symbol: 'ETHTRY', icon: 'Ξ' },
      { id: 'USDT', name: 'Tether', symbol: 'USDTTRY', icon: '₮' },
      { id: 'BNB', name: 'BNB', symbol: 'BNBTRY', icon: 'B' },
      { id: 'SOL', name: 'Solana', symbol: 'SOLTRY', icon: 'S' },
      { id: 'AVAX', name: 'Avalanche', symbol: 'AVAXTRY', icon: 'A' },
      { id: 'XRP', name: 'Ripple', symbol: 'XRPTRY', icon: '✕' },
    ],
    currency: [
      { id: 'USD', name: isEn ? 'US Dollar' : 'Amerikan Doları', symbol: 'USD', icon: '$' },
      { id: 'EUR', name: 'Euro', symbol: 'EUR', icon: '€' },
      { id: 'GBP', name: isEn ? 'British Pound' : 'İngiliz Sterlini', symbol: 'GBP', icon: '£' },
    ],
    gold: [
      { id: 'Gram Altın', name: 'Gram Altın', symbol: 'gram-altin', icon: '🟡', unit: 'Gram' },
      { id: 'Çeyrek Altın', name: 'Çeyrek Altın', symbol: 'ceyrek-altin', icon: '🪙', unit: 'Çeyrek' },
      { id: 'Yarım Altın', name: 'Yarım Altın', symbol: 'yarim-altin', icon: '🪙', unit: 'Yarım' },
      { id: 'Tam Altın', name: 'Tam Altın', symbol: 'tam-altin', icon: '🪙', unit: 'Tam' },
      { id: 'Gümüş', name: 'Gümüş (Gram)', symbol: 'gumus', icon: '⚪', unit: 'Gram' },
    ],
    stocks: [
      { id: 'THYAO', name: 'Türk Hava Yolları', icon: '✈️' },
      { id: 'SASA', name: 'SASA Polyester', icon: '🏭' },
      { id: 'TUPRS', name: 'Tüpraş', icon: '🛢️' },
      { id: 'EREGL', name: 'Erdemir', icon: '🏗️' },
      { id: 'ISCTR', name: 'İş Bankası (C)', icon: '🏦' },
    ],
    daily_interest: [
      { id: 'ING Turuncu', name: 'ING Turuncu (%49 Günlük)', icon: '🟠', unit: 'TL' },
      { id: 'Fibabanka Kiraz', name: 'Fibabanka Kiraz (%50 Günlük)', icon: '🍒', unit: 'TL' },
      { id: 'Enpara Günlük', name: 'Enpara Günlük Birikim (%45)', icon: '🟣', unit: 'TL' },
      { id: 'TEB Marifetli', name: 'TEB Marifetli (%48 Günlük)', icon: '🟢', unit: 'TL' },
      { id: 'Garanti Günlük', name: 'Garanti Günlük Vadeli (%46)', icon: '🟢', unit: 'TL' },
    ],
    deposit: [
      { id: 'Garanti Vadeli', name: 'Garanti BBVA Vadeli (%48)', icon: '🏦', unit: 'TL' },
      { id: 'İş Bankası Vadeli', name: 'İş Bankası Vadeli (%47)', icon: '🏦', unit: 'TL' },
      { id: 'Akbank Vadeli', name: 'Akbank Vadeli Mevduat (%49)', icon: '🏦', unit: 'TL' },
      { id: 'Yapı Kredi Vadeli', name: 'Yapı Kredi Vadeli (%48)', icon: '🏦', unit: 'TL' },
    ]
  };

  const renderSuggestions = () => {
    const assets = POPULAR_ASSETS[type];
    if (!assets || !showSuggestions) return null;
    return (
      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto left-0">
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-750 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
          {t('investments.popularPicks')}
        </div>
        {assets.map(asset => {
           let price = null;
           if (type === 'crypto' && marketData && marketData.crypto && marketData.crypto[asset.symbol]) {
             price = parseFloat(marketData.crypto[asset.symbol]);
           } else if ((type === 'gold' || type === 'currency') && marketData && marketData.tr && marketData.tr[asset.symbol]) {
             const pStr = marketData.tr[asset.symbol]['Satış'] || marketData.tr[asset.symbol]['Alış'] || marketData.tr[asset.symbol];
             if (typeof pStr === 'string') {
               price = parseFloat(pStr.replace(/\./g, '').replace(',', '.'));
             }
           }
           
           return (
             <div 
               key={asset.id} 
               onMouseDown={(e) => e.preventDefault()}
               onClick={() => {
                 setName(asset.id);
                 if (asset.unit) setUnit(asset.unit);
                 if (price) setCurrentPrice(price.toString());
                 setShowSuggestions(false);
               }}
               className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700/60 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm border border-slate-200 dark:border-slate-600">
                   {asset.icon}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{asset.id}</span>
                   <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{asset.name}</span>
                 </div>
               </div>
               {price && (
                 <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                   {parseFloat(price) < 10 ? parseFloat(price).toFixed(4) : parseFloat(price).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                 </div>
               )}
             </div>
           );
        })}
      </div>
    );
  };

  const renderLinkedAccountSection = () => (
    <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{t('investments.linkedAccount')}</span>
        </label>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
        {t('investments.linkedAccountSubtitle')}
      </p>
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
      >
        <option value="">{t('investments.noLinkedAccount')}</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} ({formatMoney(acc.balance)})
          </option>
        ))}
      </select>

      {type === 'daily_interest' && accountId ? (
        <div className="p-2.5 bg-teal-50/80 dark:bg-teal-950/25 border border-teal-200/80 dark:border-teal-800/40 rounded-xl text-[11px] text-teal-800 dark:text-teal-200 leading-relaxed mt-1">
          {t('investments.liquidDailyNotice')}
        </div>
      ) : (
        !editingInvestment && accountId && !isInterest && parseFloat(purchasePrice) > 0 && (
          <label className="flex items-center gap-2 cursor-pointer mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={deductFromAccount}
              onChange={(e) => setDeductFromAccount(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
            <span>
              {t('investments.deductOpeningAmount', {
                amount: formatMoney(parseFloat(purchasePrice.toString().replace(',', '.')) || 0),
              })}
            </span>
          </label>
        )
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isInvestmentModalOpen}
      onClose={closeAddInvestmentModal}
      title={editingInvestment ? t('common.edit') : t('investments.newAsset')}
      subtitle={t('investments.subtitle')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('investments.assetClass')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ASSET_TYPES.map((aType) => (
              <button
                type="button"
                key={aType.id}
                onClick={() => handleTypeChange(aType.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  type === aType.id
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {getAssetTypeName(aType.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('investments.assetName')}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Gram Altın, THYAO, BTC, USD..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {renderSuggestions()}
          </div>
        </div>

        {/* For Interest Assets: Selectable Currency Dropdown & Linked Account & Dynamic Principal */}
        {isInterest ? (
          <div className="space-y-4">
            {/* Currency Dropdown (TL, USD, EUR, GBP) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t('investments.currencyOrUnit')}
              </label>
              <select
                value={unit === 'TRY' ? 'TL' : unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="TL">₺ TL (Türk Lirası)</option>
                <option value="USD">$ USD (Amerikan Doları)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (İngiliz Sterlini)</option>
              </select>
            </div>

            {/* Linked Bank / Wallet Account (Shown first for interest so selecting it feeds the principal) */}
            {renderLinkedAccountSection()}

            {/* Principal Amount & Maturity Value */}
            {accountId && selectedAccount ? (
              <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('investments.principalFromAccount')}</span>
                  </span>
                  <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                    {selectedAccount.name}
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                  {formatMoney(selectedAccount.balance)}
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 leading-tight">
                  {t('investments.principalFromAccountDesc', { name: selectedAccount.name })}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('investments.principalAmount')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="100000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('investments.maturityTotal')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0,00"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* For Non-Interest Assets (Gold, Stocks, Crypto, etc.) */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('investments.quantity')}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('investments.unit')}
                </label>
                <input
                  type="text"
                  placeholder="gram, lot, adet..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('investments.costPrice')}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="100"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                  <span>{t('investments.currentPrice')}</span>
                  <button 
                    type="button" 
                    onClick={() => fetchLivePrice()} 
                    disabled={isFetchingPrice} 
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 normal-case bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                  >
                    {isFetchingPrice ? "..." : t('investments.fetchLivePrice')}
                  </button>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0,00"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Daily Interest Calculator */}
        {type === 'daily_interest' && (() => {
          const stats = calculateDailyInterestAccrual({
            purchasePrice: effectivePrincipal,
            purchaseDate,
            interestRate,
            stopajRate,
            uninvestedAmount,
            additions,
          });

          return (
            <div className="p-3.5 bg-teal-50/90 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-800/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>{t('investments.dailyInterestCalculator')}</span>
                </span>
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">
                  {t('investments.stopajNotice', { rate: stopajRate })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-teal-700 dark:text-teal-300 uppercase mb-1">
                    {t('investments.annualRate')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="49"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-teal-700 dark:text-teal-300 uppercase mb-1">
                    {t('investments.uninvestedFloor')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={uninvestedAmount}
                    onChange={(e) => setUninvestedAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Stopaj Vergi Kesintisi Oranı */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-teal-700 dark:text-teal-300 uppercase">
                    {t('investments.stopajRate')}
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    (Standart: %10)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="any"
                    placeholder="10"
                    value={stopajRate}
                    onChange={(e) => setStopajRate(e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                    {['10', '7.5', '5', '15', '0'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setStopajRate(val)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                          stopajRate === val
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100/50 dark:hover:bg-teal-900/30'
                        }`}
                      >
                        %{val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additions list if any */}
              {additions.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-teal-100 dark:border-teal-800/40 text-[11px] space-y-1.5">
                  <div className="flex justify-between font-bold text-teal-900 dark:text-teal-200 border-b border-teal-50 dark:border-teal-900/40 pb-1">
                    <span>{t('investments.balanceAdditions')} ({additions.length})</span>
                    <span className="text-emerald-700 dark:text-emerald-400">+{formatMoney(stats.additionsTotal)}</span>
                  </div>
                  {additions.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[10px]">
                      <span>{formatDate(a.date)}: +{formatMoney(a.amount)} {a.note ? `(${a.note})` : ''}</span>
                      <button
                        type="button"
                        onClick={() => setAdditions(additions.filter((x) => x.id !== a.id))}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-teal-50 dark:border-teal-900/40 font-extrabold text-slate-800 dark:text-slate-100">
                    <span>{t('investments.newTotalPrincipal')}:</span>
                    <span>{formatMoney(stats.totalPrincipal)}</span>
                  </div>
                </div>
              )}

              {(effectivePrincipal > 0 || purchasePrice) && interestRate && (
                <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-teal-100 dark:border-teal-800/40 text-[11px] space-y-1.5 shadow-2xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('investments.dailyGrossReturn')}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">+{stats.currentGrossDaily.toFixed(2)} {unitSymbol}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>{t('investments.dailyStopaj')} (%{stopajRate}):</span>
                    <span className="font-semibold">-{stats.currentDailyTax.toFixed(2)} {unitSymbol}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-teal-50 dark:border-teal-900/40">
                    <span className="font-bold">{t('investments.dailyNetReturn')}:</span>
                    <strong className="text-teal-700 dark:text-teal-300 font-extrabold text-xs">
                      +{stats.currentDailyNet.toFixed(2)} {unitSymbol} / {t('investments.dailyGain')}
                    </strong>
                  </div>
                  {stats.baseDays > 0 && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-0.5 text-[10px]">
                      <span>{t('investments.elapsedTime')} ({stats.baseDays} {t('common.days')}):</span>
                      <span className="font-semibold text-teal-800 dark:text-teal-200">+{stats.totalAccruedNet.toFixed(2)} {unitSymbol} {t('investments.accruedNetGain')}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={calculateDailyReturn}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                {t('investments.calcDailyAccrued')}
              </button>
            </div>
          );
        })()}

        {/* Deposit Interest Calculator */}
        {type === 'deposit' && (() => {
          const stats = calculateDepositAccrual({
            purchasePrice: effectivePrincipal,
            purchaseDate,
            maturityDays,
            interestRate,
            stopajRate,
            additions,
          });

          return (
            <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <span>🏦</span>
                  <span>{t('investments.depositCalculator')}</span>
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                  {t('investments.stopajNotice', { rate: stopajRate })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase mb-1">
                    {t('investments.annualRate')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="48"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase mb-1">
                    {t('investments.maturityDays')}
                  </label>
                  <input
                    type="number"
                    placeholder="32"
                    value={maturityDays}
                    onChange={(e) => setMaturityDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stopaj Vergi Kesintisi Oranı */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                    {t('investments.stopajRate')}
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="any"
                    placeholder="10"
                    value={stopajRate}
                    onChange={(e) => setStopajRate(e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                    {['10', '7.5', '5', '0'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setStopajRate(val)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                          stopajRate === val
                            ? 'bg-indigo-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30'
                        }`}
                      >
                        %{val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additions list if any */}
              {additions.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40 text-[11px] space-y-1.5">
                  <div className="flex justify-between font-bold text-indigo-900 dark:text-indigo-200 border-b border-indigo-50 dark:border-indigo-900/40 pb-1">
                    <span>{t('investments.balanceAdditions')} ({additions.length})</span>
                    <span className="text-emerald-700 dark:text-emerald-400">+{formatMoney(stats.additionsTotal)}</span>
                  </div>
                  {additions.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[10px]">
                      <span>{formatDate(a.date)}: +{formatMoney(a.amount)} {a.note ? `(${a.note})` : ''}</span>
                      <button
                        type="button"
                        onClick={() => setAdditions(additions.filter((x) => x.id !== a.id))}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-indigo-50 dark:border-indigo-900/40 font-extrabold text-slate-800 dark:text-slate-100">
                    <span>{t('investments.newTotalPrincipal')}:</span>
                    <span>{formatMoney(stats.totalPrincipal)}</span>
                  </div>
                </div>
              )}

              {stats.totalPrincipal > 0 && interestRate && (
                <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40 text-[11px] space-y-1.5 shadow-2xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('investments.grossInterestReturn')}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">+{stats.totalGrossInterest.toFixed(2)} {unitSymbol}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>{t('investments.stopajAmount')} (%{stopajRate}):</span>
                    <span className="font-semibold">-{stats.totalTax.toFixed(2)} {unitSymbol}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-indigo-50 dark:border-indigo-900/40">
                    <span className="font-bold">{t('investments.netInterestReturn')}:</span>
                    <strong className="text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                      +{stats.totalNetInterest.toFixed(2)} {unitSymbol}
                    </strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={calculateDepositReturn}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                {t('investments.calcMaturityTotal')}
              </button>
            </div>
          );
        })()}

        {/* Linked Bank / Wallet Account (For non-interest assets) */}
        {!isInterest && renderLinkedAccountSection()}

        {/* Purchase Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('investments.purchaseDate')}
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('transactions.note')}
          </label>
          <input
            type="text"
            placeholder="..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeAddInvestmentModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingInvestment ? t('common.edit') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
