const fs = require('fs');
function replaceFile(path, target, replacement) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(target, replacement);
  fs.writeFileSync(path, code);
}
replaceFile('src/components/admin/AdminMarketing.tsx', '>Save<', '>{locale === "zh-HK" ? "保存" : "Save"}<');
replaceFile('src/components/admin/AdminMarketing.tsx', '>Save<', '>{locale === "zh-HK" ? "保存" : "Save"}<');
replaceFile('src/components/admin/AdminProducts.tsx', '>Save<', '>{locale === "zh-HK" ? "保存" : "Save"}<');
