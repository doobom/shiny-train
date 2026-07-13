const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ShopHome.tsx', 'utf8');

code = code.replace(
  'let url = `/api/products?keyword=${searchQuery}`;',
  'let url = `/api/products?q=${searchQuery}`;'
);
code = code.replace(
  'if (priceRange === \'under100\') url += `&priceMax=10000`;\n    else if (priceRange === \'100to200\') url += `&priceMin=10000&priceMax=20000`;\n    else if (priceRange === \'over200\') url += `&priceMin=20000`;',
  'if (priceRange === \'under100\') url += `&maxPrice=10000`;\n    else if (priceRange === \'100to200\') url += `&minPrice=10000&maxPrice=20000`;\n    else if (priceRange === \'over200\') url += `&minPrice=20000`;'
);

fs.writeFileSync('src/components/shop/ShopHome.tsx', code);
