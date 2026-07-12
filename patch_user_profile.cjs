const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const targetStr = `  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'faqs'>('profile');
  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });
  const [profileMessage, setProfileMessage] = useState('');`;

const replaceStr = `  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'faqs'>('profile');
  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });
  const [profileMessage, setProfileMessage] = useState('');
  
  useEffect(() => {
    if (activeTab === 'profile') {
      apiFetch('/api/user/profile', { headers: { Authorization: \`Bearer \${token}\` } })
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            setProfileForm(p => ({
              ...p,
              addressRecipient: data.address.recipient || '',
              addressPhone: data.address.phone || '',
              addressDetail: data.address.detail || ''
            }));
          }
        });
    }
  }, [activeTab, token]);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
