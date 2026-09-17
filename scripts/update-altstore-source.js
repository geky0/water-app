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
    if (data.apps && data.apps[0]) {
      data.apps[0].version = version;
      data.apps[0].versionDate = versionDate;
      data.apps[0].downloadURL = `https://github.com/geky0/water-app/releases/download/v${version}/HydroDark.ipa`;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`Updated ${file} to v${version} (${versionDate})`);
    }
  }
});
