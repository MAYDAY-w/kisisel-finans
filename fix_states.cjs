const fs = require('fs');
const path = 'src/components/investments/InvestmentFormModal.jsx';
let code = fs.readFileSync(path, 'utf8');

// Inject states
code = code.replace(
  "const [note, setNote] = useState('');",
  "const [note, setNote] = useState('');\n  const [showSuggestions, setShowSuggestions] = useState(false);\n  const [marketData, setMarketData] = useState({ crypto: {}, tr: {} });"
);

// Inject effect
code = code.replace(
  /if \(isInvestmentModalOpen\) \{\s*if \(editingInvestment\)/m,
  `if (isInvestmentModalOpen) {
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

      if (editingInvestment)`
);

fs.writeFileSync(path, code, 'utf8');
console.log('States and effect injected.');
