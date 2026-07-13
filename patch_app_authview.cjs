const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<AuthView onLoginSuccess={handleLoginSuccess} />',
  '<AuthView locale={locale} onLoginSuccess={handleLoginSuccess} />'
);

fs.writeFileSync('src/App.tsx', code);
