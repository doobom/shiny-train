const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const importStr = `import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';`;

code = code.replace("import React, { useState, useEffect } from 'react';", importStr);

const quillZh = `<div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (ZH)</label>
                  <ReactQuill theme="snow" value={descriptionZh} onChange={setDescriptionZh} className="bg-white" />
                </div>`;
const textZh = `<div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (ZH)</label>
                  <textarea rows={4} value={descriptionZh} onChange={e => setDescriptionZh(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />
                </div>`;
code = code.replace(textZh, quillZh);

const quillEn = `<div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (EN)</label>
                  <ReactQuill theme="snow" value={descriptionEn} onChange={setDescriptionEn} className="bg-white" />
                </div>`;
const textEn = `<div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (EN)</label>
                  <textarea rows={4} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />
                </div>`;
code = code.replace(textEn, quillEn);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
