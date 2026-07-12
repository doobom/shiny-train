const fs = require('fs');
let code = fs.readFileSync('src/components/shop/CheckoutView.tsx', 'utf8');

const targetStr = `.then(res => res.json())
          .then(previewData => setPreview(previewData))`;

const replaceStr = `.then(res => res.json())
          .then(previewData => {
            if (previewData.code || previewData.error) {
              setErr(previewData.message || previewData.error);
            } else {
              setPreview(previewData);
            }
          })`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `if (!preview) {
    return (`;

const replaceStr2 = `if (err) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-900 font-medium">{err}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-900 text-white rounded">Retry</button>
      </div>
    );
  }

  if (!preview) {
    return (`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/components/shop/CheckoutView.tsx', code);
