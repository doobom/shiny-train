const fs = require('fs');
let code = fs.readFileSync('src/server/schema.sql', 'utf-8');

const targetSql = `CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    content TEXT NOT NULL,
    admin_reply TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const newSql = `CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    type VARCHAR(50),
    contact VARCHAR(100),
    order_id VARCHAR(50),
    content TEXT NOT NULL,
    admin_reply TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

code = code.replace(targetSql, newSql);
fs.writeFileSync('src/server/schema.sql', code);
