const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ShopHome.tsx', 'utf-8');

// Update states
const stateTarget = `  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');`;
const stateReplacement = `  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);`;
code = code.replace(stateTarget, stateReplacement);

// Update fetch URL and data handling
const fetchTarget = `  // Fetch filtered products dynamically
  useEffect(() => {
    let url = \`/api/products?keyword=\${searchQuery}\`;
    if (selectedCategory) url += \`&categoryId=\${selectedCategory}\`;
    if (sortBy !== 'default') url += \`&sort=\${sortBy}\`;
    if (priceRange === 'under100') url += \`&priceMax=10000\`;
    else if (priceRange === '100to200') url += \`&priceMin=10000&priceMax=20000\`;
    else if (priceRange === 'over200') url += \`&priceMin=20000\`;

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, [searchQuery, selectedCategory, priceRange, sortBy]);`;

const fetchReplacement = `  // Fetch filtered products dynamically
  useEffect(() => {
    let url = \`/api/products?q=\${searchQuery}&page=\${page}&limit=8\`;
    if (selectedCategory) url += \`&categoryId=\${selectedCategory}\`;
    
    if (sortBy === 'price_asc' || sortBy === 'price_desc' || sortBy === 'newest') url += \`&sort=\${sortBy}\`;
    
    if (priceRange === 'under100') url += \`&maxPrice=10000\`;
    else if (priceRange === '100to200') url += \`&minPrice=10000&maxPrice=20000\`;
    else if (priceRange === 'over200') url += \`&minPrice=20000\`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProducts(data.data);
          setTotalPages(data.pagination.totalPages || 1);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalPages(1);
        }
      })
      .catch(err => console.error(err));
  }, [searchQuery, selectedCategory, priceRange, sortBy, page]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);`;
code = code.replace(fetchTarget, fetchReplacement);

// Update pagination UI
const gridTarget = `        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}`;

const gridReplacement = `        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locale === 'zh-HK' ? '上一頁' : 'Previous'}
            </button>
            <span className="text-sm font-bold text-gray-500">
              {page} / {totalPages}
            </span>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locale === 'zh-HK' ? '下一頁' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}`;
code = code.replace(gridTarget, gridReplacement);

fs.writeFileSync('src/components/shop/ShopHome.tsx', code);
