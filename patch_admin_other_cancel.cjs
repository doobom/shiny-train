const fs = require('fs');

function replaceFile(path, target, replacement) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(target, replacement);
  fs.writeFileSync(path, code);
}

replaceFile('src/components/admin/AdminUsers.tsx', '>Cancel<', '>{locale === "zh-HK" ? "取消" : "Cancel"}<');
replaceFile('src/components/admin/AdminMarketing.tsx', '>Cancel<', '>{locale === "zh-HK" ? "取消" : "Cancel"}<');
replaceFile('src/components/admin/AdminMarketing.tsx', '>Cancel<', '>{locale === "zh-HK" ? "取消" : "Cancel"}<');

