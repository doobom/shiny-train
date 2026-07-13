const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { ShoppingCart, User, Shield, HelpCircle, LogIn, LogOut, CheckCircle, Store, Layers } from 'lucide-react';",
  "import { ShoppingCart, User, Shield, HelpCircle, LogIn, LogOut, CheckCircle, Store, Layers, Moon, Sun } from 'lucide-react';"
);

if (!code.includes('isDarkMode')) {
  code = code.replace(
    /const \[isAdminMode, setIsAdminMode\] = useState<boolean>.*?;/,
    match => `${match}\n  const [isDarkMode, setIsDarkMode] = useState(false);`
  );
  
  code = code.replace(
    'useEffect(() => {\n    if (userId) {\n      fetchCartCount();\n    }\n  }, [userId]);',
    'useEffect(() => {\n    if (userId) {\n      fetchCartCount();\n    }\n  }, [userId]);\n\n  useEffect(() => {\n    if (isDarkMode) document.documentElement.classList.add("dark");\n    else document.documentElement.classList.remove("dark");\n  }, [isDarkMode]);'
  );

  // Use a more robust match for the locale toggle button replacement
  code = code.replace(
    /<button\s+onClick=\{\(\) => setLocale\(locale === 'zh-HK' \? 'en' : 'zh-HK'\)\}/g,
    '<button\n                  onClick={() => setIsDarkMode(!isDarkMode)}\n                  className="font-bold text-gray-500 hover:text-gray-950 text-xs px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"\n                >\n                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}\n                </button>\n                <button\n                  onClick={() => setLocale(locale === \'zh-HK\' ? \'en\' : \'zh-HK\')}'
  );

  fs.writeFileSync('src/App.tsx', code);
}
