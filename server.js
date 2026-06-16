const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001;
const DIR = __dirname;
const MENU_FILE = path.join(DIR, 'menu.html');
const INDEX_FILE = path.join(DIR, 'index.html');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // 메뉴 페이지 서빙
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(MENU_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // 저장 & 배포
  if (req.method === 'POST' && req.url === '/save') {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const { html } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        fs.writeFileSync(MENU_FILE, html, 'utf8');
        fs.writeFileSync(INDEX_FILE, html, 'utf8');

        const cmd = 'git add index.html menu.html & git commit -m "메뉴 업데이트" & git push origin main';
        exec(cmd, { cwd: DIR }, (err, stdout, stderr) => {
          console.log(stdout || stderr);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log('✅ 메뉴 서버 실행중 → http://localhost:' + PORT);
});
