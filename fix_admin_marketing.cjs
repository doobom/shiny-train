const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf-8');

const fetchTarget = `    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/settings').then(res => res.json()) // we read reductions or defaults
    ])
    .then(([cats, settings]) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);

      // Simple fetch campaigns mock
      fetch('/api/checkout/preview', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }) // we can extract static rules from server files or local presets
      });

      // Load static preset reductions since they are simulated
      setReductions([
        { id: 'fr_1', nameZh: '零食食品專區滿$80減$20', nameEn: 'Snacks & Food Section Buy $80 Save $20', thresholdCents: 8000, reductionCents: 2000, stackable: false, scope: 'category', categoryId: 'cat_3', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' },
        { id: 'fr_2', nameZh: '全店狂歡滿$250減$30', nameEn: 'Storewide Mega Sale Spend $250 Save $30', thresholdCents: 25000, reductionCents: 3000, stackable: false, scope: 'all', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' },
        { id: 'fr_3', nameZh: '全店大促加疊滿$200減$10', nameEn: 'Storewide Extra Stackable $200 Save $10', thresholdCents: 20000, reductionCents: 1000, stackable: true, scope: 'all', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' }
      ]);
      setLoading(false);
    });`;

const fetchNew = `    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/reductions', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('jwt_token')}\` } }).then(res => res.json())
    ])
    .then(([cats, reds]) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
      setReductions(reds);
      setLoading(false);
    });`;

code = code.replace(fetchTarget, fetchNew);

const submitTarget = `    const newRule: FullReduction = {
      id: \`fr_\${Date.now()}\`,
      nameZh,
      nameEn,
      thresholdCents: threshold,
      reductionCents: reduction,
      stackable,
      scope,
      categoryId: scope === 'category' ? categoryId : undefined,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    };
    
    setReductions([newRule, ...reductions]);
    setShowAddForm(false);
    setNotif(locale === 'zh-HK' ? '滿減活動發布成功！' : 'Full Reduction campaign scheduled.');
    setNameZh('');
    setNameEn('');
    setTimeout(() => setNotif(null), 3000);`;

const submitNew = `    const newRule = {
      nameZh,
      nameEn: nameEn || nameZh,
      thresholdCents: threshold,
      reductionCents: reduction,
      stackable,
      scope,
      categoryId: scope === 'category' ? categoryId : undefined,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    };
    
    fetch('/api/admin/reductions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('jwt_token')}\` },
      body: JSON.stringify(newRule)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setReductions([{ ...newRule, id: data.id }, ...reductions]);
        setShowAddForm(false);
        setNotif(locale === 'zh-HK' ? '滿減活動發布成功！' : 'Full Reduction campaign scheduled.');
        setNameZh('');
        setNameEn('');
        setTimeout(() => setNotif(null), 3000);
      }
    });`;

code = code.replace(submitTarget, submitNew);
fs.writeFileSync('src/components/admin/AdminMarketing.tsx', code);
