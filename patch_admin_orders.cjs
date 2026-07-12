const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const targetFilters = `{/* Filter and search bars */}`;

const replaceFilters = `<button onClick={() => {
        window.open('/api/admin/orders/export?token=' + localStorage.getItem('token'), '_blank');
      }} className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 absolute right-6 top-6">
        Export CSV
      </button>
      {/* Filter and search bars */}`;

code = code.replace(targetFilters, replaceFilters);
fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
