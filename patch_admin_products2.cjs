const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetStr = `              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">`;

const replaceStr = `              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (ZH)</label>
                  <ReactQuill theme="snow" value={descriptionZh} onChange={setDescriptionZh} className="bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (EN)</label>
                  <ReactQuill theme="snow" value={descriptionEn} onChange={setDescriptionEn} className="bg-white" />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
