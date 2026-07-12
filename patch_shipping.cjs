const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      CREATE TABLE IF NOT EXISTS "shipping_templates" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "fee_cents" integer NOT NULL,
        "free_threshold_cents" integer,
        "enabled" boolean DEFAULT true
      );`;

const replaceStr = `      DROP TABLE IF EXISTS "shipping_templates" CASCADE;
      CREATE TABLE IF NOT EXISTS "shipping_templates" (
        "id" text PRIMARY KEY NOT NULL,
        "name_zh" text,
        "name_en" text,
        "base_fee_cents" integer NOT NULL DEFAULT 3000,
        "free_shipping_threshold_cents" integer DEFAULT 30000,
        "active" boolean DEFAULT true
      );`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
