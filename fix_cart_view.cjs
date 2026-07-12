const fs = require('fs');
let code = fs.readFileSync('src/components/shop/CartView.tsx', 'utf8');

const target1 = `  const fetchCart = () => {
    setLoading(true);
    apiFetch(\`/api/cart/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };`;

const replace1 = `  const fetchCart = () => {
    setLoading(true);
    if (!userId) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      if (localCart.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      fetch('/api/cart/local-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localItems: localCart })
      })
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
      return;
    }
    
    apiFetch(\`/api/cart/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };`;

code = code.replace(target1, replace1);

const target2 = `  const updateItem = (itemId: string, qty?: number, checked?: boolean) => {
    apiFetch(\`/api/cart/items/\${itemId}\`, {`;
const replace2 = `  const updateItem = (itemId: string, qty?: number, checked?: boolean) => {
    if (!userId && String(itemId).startsWith('local_')) {
      const idx = parseInt(itemId.replace('local_', ''));
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      if (localCart[idx]) {
        if (qty !== undefined) localCart[idx].qty = qty;
        if (checked !== undefined) localCart[idx].checked = checked;
        localStorage.setItem('localCart', JSON.stringify(localCart));
        fetchCart();
      }
      return;
    }
    apiFetch(\`/api/cart/items/\${itemId}\`, {`;
code = code.replace(target2, replace2);

const target3 = `  const deleteItem = (itemId: string) => {
    apiFetch(\`/api/cart/items/\${itemId}\`, {`;
const replace3 = `  const deleteItem = (itemId: string) => {
    if (!userId && String(itemId).startsWith('local_')) {
      const idx = parseInt(itemId.replace('local_', ''));
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart.splice(idx, 1);
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    apiFetch(\`/api/cart/items/\${itemId}\`, {`;
code = code.replace(target3, replace3);

const target4 = `  const handleSelectAll = (checked: boolean) => {
    apiFetch('/api/cart/batch', {`;
const replace4 = `  const handleSelectAll = (checked: boolean) => {
    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart = localCart.map((i: any) => ({ ...i, checked }));
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    apiFetch('/api/cart/batch', {`;
code = code.replace(target4, replace4);

const target5 = `  const handleDeleteSelected = () => {
    const selectedIds = items.filter(i => i.checked).map(i => i.id);
    if (selectedIds.length === 0) return;
    
    apiFetch('/api/cart/batch', {`;
const replace5 = `  const handleDeleteSelected = () => {
    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart = localCart.filter((i: any) => i.checked === false);
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    
    const selectedIds = items.filter(i => i.checked).map(i => i.id);
    if (selectedIds.length === 0) return;
    
    apiFetch('/api/cart/batch', {`;
code = code.replace(target5, replace5);

fs.writeFileSync('src/components/shop/CartView.tsx', code);
