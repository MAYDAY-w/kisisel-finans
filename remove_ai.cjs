const fs = require('fs');

const headerPath = 'src/components/layout/Header.jsx';
let headerCode = fs.readFileSync(headerPath, 'utf8');
headerCode = headerCode.replace(/<span className="text-\[10px\] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-1\.5 py-0\.2 rounded-full uppercase tracking-wider">\s*AI\s*<\/span>/g, '');
fs.writeFileSync(headerPath, headerCode, 'utf8');

const authPath = 'src/components/auth/AuthView.jsx';
let authCode = fs.readFileSync(authPath, 'utf8');
authCode = authCode.replace(/<span className="text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0\.5 rounded-md uppercase tracking-wider shadow-sm">\s*AI\s*<\/span>/g, '');
// Wait, I don't know the exact class in AuthView. Let's just remove anything that is <span ...>AI</span> next to the title.
authCode = authCode.replace(/<span[^>]*>\s*AI\s*<\/span>/g, '');
fs.writeFileSync(authPath, authCode, 'utf8');

console.log('AI removed');
