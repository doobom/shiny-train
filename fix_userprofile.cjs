const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

code = code.replace(
  /export default function UserProfile\(\{ userId, locale \}: UserProfileProps\) \{/,
  `export default function UserProfile({ userId, locale }: UserProfileProps) {
  const token = localStorage.getItem('token') || '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');`
);

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
