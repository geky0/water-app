const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getToken() {
  const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n', encoding: 'utf8' });
  const m = creds.match(/password=(.+)/);
  return m ? m[1].trim() : null;
}

const token = getToken();

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      family: 4,
      ...options,
      headers: {
        'User-Agent': 'node',
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github+json',
        ...(options.headers || {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function uploadAsset(uploadUrl, filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const cleanUrl = uploadUrl.replace(/\{.*\}/, '') + '?name=' + encodeURIComponent(fileName);
    const parsed = new URL(cleanUrl);

    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      family: 4,
      headers: {
        'User-Agent': 'node',
        'Authorization': 'token ' + token,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileStats.size
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    fileStream.pipe(req);
  });
}

async function main() {
  const ipaPath = path.join(__dirname, '../HydroDark.ipa');
  if (!fs.existsSync(ipaPath)) {
    console.error('HydroDark.ipa not found at ' + ipaPath);
    process.exit(1);
  }

  const appJson = require('../app.json');
  const tag = process.env.TAG_NAME || ('v' + (appJson.expo?.version || '1.1.0'));
  console.log(`Creating GitHub Release ${tag}...`);
  const releaseRes = await request({
    path: '/repos/geky0/water-app/releases',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({
    tag_name: tag,
    target_commitish: 'main',
    name: `HydroDark ${tag} (iOS IPA)`,
    body: `iOS IPA build for HydroDark ${tag}.\n\nDownload \`HydroDark.ipa\` below to install or test on iOS.`,
    draft: false,
    prerelease: false
  }));

  console.log('Release response status:', releaseRes.status);
  let release = releaseRes.data;

  if (releaseRes.status === 422 && release.errors) {
    console.log('Release may already exist, fetching existing release...');
    const existing = await request({ path: `/repos/geky0/water-app/releases/tags/${tag}` });
    release = existing.data;
  }

  if (!release.upload_url) {
    console.error('Failed to get upload_url from release:', release);
    process.exit(1);
  }

  console.log('Uploading HydroDark.ipa to release...');
  const uploadRes = await uploadAsset(release.upload_url, ipaPath, 'HydroDark.ipa');
  console.log('Upload response status:', uploadRes.status);
  if (uploadRes.status === 201) {
    console.log('Asset uploaded successfully!');
    console.log('Download URL:', uploadRes.data.browser_download_url);
    console.log('Release URL:', release.html_url);
  } else {
    console.error('Asset upload error:', uploadRes.data);
  }
}

main().catch(console.error);
