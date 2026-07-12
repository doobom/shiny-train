const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            {currentView === 'profile' && (
              <UserProfile
                userId={userId}
                locale={locale}
              />
            )}`;

const replaceStr = `            {currentView === 'profile' && (
              <UserProfile
                userId={userId}
                locale={locale}
                onPayNow={handleDirectBuy}
              />
            )}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', code);
