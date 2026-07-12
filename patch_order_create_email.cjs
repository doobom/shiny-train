const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  res.json({ success: true, orderId });
});`;

const replaceStr = `
  if (user && user.email) {
    emailQueue.push({
      to: user.email,
      subject: \`【香港生活百貨】訂單已收到 (訂單號: \${orderId})\`,
      content: \`<p>您好，我們已收到您的訂單 <b>\${orderId}</b>。</p><p>請盡快完成付款，我們將為您安排發貨！</p>\`
    });
  }
  res.json({ success: true, orderId });
});`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
