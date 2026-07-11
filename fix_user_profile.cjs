const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const newVars = `
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
`;

code = code.replace(
  /const \[profileMessage, setProfileMessage\] = useState\(''\);/,
  "const [profileMessage, setProfileMessage] = useState('');" + newVars
);

const formRegex = /<form onSubmit=\{async \(e\) => \{[\s\S]*?setEmailMsg\(''\);/;
code = code.replace(
  /<form onSubmit=\{async \(e\) => \{[\s\S]*?setEmailMsg\(''\);/,
  `<form onSubmit={async (e) => {
              e.preventDefault();
              setEmailMsg('');`
);

// fix setUser 
code = code.replace(
  /setUser\(\{ \.\.\.user, email: data\.email \}\);/,
  "localStorage.setItem('user', JSON.stringify({ ...user, email: data.email })); window.location.reload();"
);

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
