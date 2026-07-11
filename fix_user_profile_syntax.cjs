const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

// I will just read lines and fix them.
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</form>') && lines[i+1].includes('</div>') && lines[i+2].includes('</div>') && lines[i+4].includes('className="border-t border-gray-100 pt-6"')) {
    // Delete the two </div>
    lines.splice(i+1, 2);
    break;
  }
}

fs.writeFileSync('src/components/shop/UserProfile.tsx', lines.join('\n'));
