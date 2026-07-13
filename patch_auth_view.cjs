const fs = require('fs');
let code = fs.readFileSync('src/components/shop/AuthView.tsx', 'utf8');

code = code.replace(
  'import { fetchWithAuth as apiFetch } from \'../../utils/api\';\nimport React, { useState } from \'react\';',
  'import { fetchWithAuth as apiFetch } from \'../../utils/api\';\nimport React, { useState } from \'react\';\nimport { Locale } from \'../../types/index.ts\';'
);

code = code.replace(
  'interface AuthViewProps {\n  onLoginSuccess: (token: string, user: any) => void;\n}',
  'interface AuthViewProps {\n  locale: Locale;\n  onLoginSuccess: (token: string, user: any) => void;\n}'
);

code = code.replace(
  'export default function AuthView({ onLoginSuccess }: AuthViewProps) {',
  'export default function AuthView({ locale, onLoginSuccess }: AuthViewProps) {'
);

// Translate headings
code = code.replace(
  '{isForgot ? \'Reset Password\' : isLogin ? \'Login to your account\' : \'Create an account\'}',
  '{isForgot ? (locale === "zh-HK" ? "重設密碼" : "Reset Password") : isLogin ? (locale === "zh-HK" ? "登入帳戶" : "Login to your account") : (locale === "zh-HK" ? "建立帳戶" : "Create an account")}'
);

// Translate labels
code = code.replace(
  '<label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>',
  '<label className="block text-xs font-semibold text-gray-700 mb-1">{locale === "zh-HK" ? "電郵地址" : "Email"}</label>'
);

code = code.replace(
  '<label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>',
  '<label className="block text-xs font-semibold text-gray-700 mb-1">{locale === "zh-HK" ? "密碼" : "Password"}</label>'
);

// Translate buttons
code = code.replace(
  '{isForgot ? \'Send Reset Link\' : isLogin ? \'Sign In\' : \'Sign Up\'}',
  '{isForgot ? (locale === "zh-HK" ? "發送重設連結" : "Send Reset Link") : isLogin ? (locale === "zh-HK" ? "登入" : "Sign In") : (locale === "zh-HK" ? "註冊" : "Sign Up")}'
);

code = code.replace(
  '>Back to Login</button>',
  '>{locale === "zh-HK" ? "返回登入" : "Back to Login"}</button>'
);

code = code.replace(
  '{isLogin ? "Don\'t have an account? " : "Already have an account? "}',
  '{isLogin ? (locale === "zh-HK" ? "還未有帳戶？ " : "Don\'t have an account? ") : (locale === "zh-HK" ? "已有帳戶？ " : "Already have an account? ")}'
);

code = code.replace(
  '>{isLogin ? \'Register\' : \'Login\'}</button>',
  '>{isLogin ? (locale === "zh-HK" ? "註冊" : "Register") : (locale === "zh-HK" ? "登入" : "Login")}</button>'
);

code = code.replace(
  '>Forgot Password?</button>',
  '>{locale === "zh-HK" ? "忘記密碼？" : "Forgot Password?"}</button>'
);

fs.writeFileSync('src/components/shop/AuthView.tsx', code);
