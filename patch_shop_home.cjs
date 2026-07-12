const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ShopHome.tsx', 'utf8');

const targetStr = `  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);`;

const replaceStr = `  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);`;

code = code.replace(targetStr, replaceStr);

const heroTarget = `      {/* Hero Banner Area */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[24/9] bg-gray-100 group">
          <img 
            src={banners[0].imageUrl} 
            alt="Hero promotion" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-6 md:p-12 text-white">
            <span className="bg-amber-500 text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max mb-3">
              {locale === 'zh-HK' ? '超值狂歡' : 'Mega Offer'}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold font-display max-w-sm leading-tight shadow-black drop-shadow-md">
              {locale === 'zh-HK' ? '港式經典 生活優選' : 'Classic HK Lifestyle'}
            </h1>
            <p className="mt-2 text-white/90 text-xs md:text-sm mb-6 hidden md:block">
              {dict.freeShipTip}
            </p>
          </div>
        </div>
      )}`;

const heroReplace = `      {/* Hero Banner Area */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[24/9] bg-gray-100 group">
          <a href={banners[currentBannerIndex].linkUrl || '#'} className="block w-full h-full">
            <img 
              key={banners[currentBannerIndex].id}
              src={banners[currentBannerIndex].imageUrl} 
              alt="Hero promotion" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] animate-fade-in"
            />
            {/* Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {banners.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => { e.preventDefault(); setCurrentBannerIndex(idx); }}
                    className={\`w-2 h-2 rounded-full transition-colors \${idx === currentBannerIndex ? 'bg-white' : 'bg-white/50'}\`}
                  />
                ))}
              </div>
            )}
          </a>
        </div>
      )}`;
code = code.replace(heroTarget, heroReplace);

fs.writeFileSync('src/components/shop/ShopHome.tsx', code);
