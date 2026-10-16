const fs = require('fs');
const path = 'src/components/investments/InvestmentFormModal.jsx';
let code = fs.readFileSync(path, 'utf8');

// Inject fetchLivePrice function
const fetchLivePriceCode = `  const fetchLivePrice = async (overrideName, overrideUnit) => {
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
        if (u.includes('çeyrek')) searchKey = 'ceyrek-altin';
        else if (u.includes('yarım')) searchKey = 'yarim-altin';
        else if (u.includes('tam')) searchKey = 'tam-altin';
        else if (u.includes('cumhuriyet')) searchKey = 'cumhuriyet-altini';
        else if (u.includes('ata')) searchKey = 'ata-altin';
        else if (u.includes('gümüş')) searchKey = 'gumus';
        else if (u.includes('ons')) searchKey = 'ons';
        else searchKey = 'gram-altin';
      } else if (type === 'fx') {
        searchKey = currentName.toUpperCase().trim();
      }

      if (searchKey && data[searchKey]) {
        const priceObj = data[searchKey];
        const priceStr = priceObj['Satış'] || priceObj['Alış'] || priceObj;
        if (typeof priceStr === 'string') {
          const cleanPrice = parseFloat(priceStr.replace(/\\./g, '').replace(',', '.'));
          if (!isNaN(cleanPrice)) {
            setCurrentPrice(cleanPrice.toString());
            return;
          }
        }
      }

      alert('Anlık fiyat bulunamadı. Lütfen manuel giriniz.');
    } catch (error) {
      console.error(error);
      alert('Fiyat alınırken bir hata oluştu.');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = (e) => {`;

code = code.replace("const handleSubmit = (e) => {", fetchLivePriceCode);

// Inject the button next to Guncel Birim Fiyat
const newLabel = `<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Güncel Birim Fiyat</span>
              <button 
                type="button" 
                onClick={() => fetchLivePrice()} 
                disabled={isFetchingPrice} 
                className="text-emerald-600 hover:text-emerald-700 normal-case bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
              >
                {isFetchingPrice ? "..." : "Canlı Veri Çek"}
              </button>
            </label>`;

code = code.replace(/<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1\.5">\s*Güncel Birim Fiyat\s*<\/label>/, newLabel);

fs.writeFileSync(path, code, 'utf8');
console.log('Restored fetchLivePrice and button.');
