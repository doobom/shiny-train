const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const targetTabList = `        {[
          { id: 'orders', label: dict.tabOrders },
          { id: 'tickets', label: dict.tabTickets },
          { id: 'faqs', label: dict.tabFaq }
        ].map(tab => (`;

const replaceTabList = `        {[
          { id: 'profile', label: locale === 'zh-HK' ? '個人資料' : 'Profile' },
          { id: 'orders', label: dict.tabOrders },
          { id: 'tickets', label: dict.tabTickets },
          { id: 'faqs', label: dict.tabFaq }
        ].map(tab => (`;

code = code.replace(targetTabList, replaceTabList);
fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
