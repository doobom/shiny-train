const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf8');

const shareFunc = `
  const handleShare = async () => {
    const shareData = {
      title: product.nameZh || product.nameEn,
      text: 'Check out this product!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotification(dict.copiedToClipboard);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
`;

code = code.replace(
  `const handleAddToCart = () => {`,
  `${shareFunc}\n  const handleAddToCart = () => {`
);

// Add dict key
code = code.replace(
  `sfDesc: '本商品默認使用順豐快遞發貨，支持全港配送。16:00前完成付款的訂單均為當天發貨。',`,
  `sfDesc: '本商品默認使用順豐快遞發貨，支持全港配送。16:00前完成付款的訂單均為當天發貨。',\n      copiedToClipboard: '連結已複製到剪貼簿',`
);
code = code.replace(
  `sfDesc: 'This item ships via SF Express with trackable services across Hong Kong. Paid before 16:00 ships same day.',`,
  `sfDesc: 'This item ships via SF Express with trackable services across Hong Kong. Paid before 16:00 ships same day.',\n      copiedToClipboard: 'Link copied to clipboard',`
);

// Add the button to the header
code = code.replace(
  `<button onClick={onBack} className="p-2 bg-white rounded-full shadow-md text-neutral-900 hover:bg-neutral-50">
          <ChevronLeft className="h-6 w-6" />
        </button>`,
  `<button onClick={onBack} className="p-2 bg-white rounded-full shadow-md text-neutral-900 hover:bg-neutral-50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={handleShare} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-neutral-900 hover:bg-neutral-50">
          <Share2 className="h-6 w-6" />
        </button>`
);

fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
