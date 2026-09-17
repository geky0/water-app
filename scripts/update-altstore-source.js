const fs = require('fs');
const path = require('path');

const appJson = require('../app.json');
const version = appJson.expo.version || '1.1.0';
const versionDate = new Date().toISOString().split('T')[0];

const files = ['altstore.json', 'apps.json'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.apps) {
      const hydroDark = data.apps.find(a => a.bundleIdentifier === 'com.damurxy.hydrodark') || data.apps[0];
      if (hydroDark) {
        hydroDark.version = version;
        hydroDark.versionDate = versionDate;
        hydroDark.downloadURL = `https://github.com/geky0/water-app/releases/download/v${version}/HydroDark.ipa`;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        console.log(`Updated HydroDark in ${file} to v${version} (${versionDate})`);
      }
    }
  }
});
