const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      if (key === 'push') {
        options.push = true;
      } else {
        options[key] = args[++i];
      }
    }
  }
  return options;
}

const args = parseArgs();

if (!args.name || !args.bundleId || !args.downloadUrl) {
  console.log(`
Usage:
  node scripts/add-app-to-source.js \\
    --name "App Name" \\
    --bundleId "com.example.app" \\
    --version "1.0.0" \\
    --downloadUrl "https://..." \\
    --iconUrl "https://..." \\
    --description "Description of app" \\
    --developer "Developer Name" \\
    --push
`);
  process.exit(1);
}

const appEntry = {
  name: args.name,
  bundleIdentifier: args.bundleId,
  developerName: args.developer || args.name,
  version: args.version || '1.0.0',
  versionDate: new Date().toISOString().split('T')[0],
  versionDescription: args.versionDesc || `Added ${args.name} to repository.`,
  downloadURL: args.downloadUrl,
  localizedDescription: args.description || `${args.name} iOS application.`,
  iconURL: args.iconUrl || 'https://raw.githubusercontent.com/geky0/water-app/main/assets/icon.png',
  tintColor: args.tintColor || 'FF2A4D',
  size: parseInt(args.size, 10) || 15000000
};

const sourceFiles = ['altstore.json', 'apps.json', 'repo.json'];

sourceFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let data = { name: "DaMurxy's App Repo", identifier: "com.damurxy.apps.source", website: "https://github.com/geky0/water-app", apps: [], news: [] };
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  if (!data.apps) data.apps = [];

  const existingIdx = data.apps.findIndex(a => a.bundleIdentifier.toLowerCase() === appEntry.bundleIdentifier.toLowerCase());
  if (existingIdx >= 0) {
    data.apps[existingIdx] = { ...data.apps[existingIdx], ...appEntry };
    console.log(`Updated existing app "${appEntry.name}" in ${file}`);
  } else {
    data.apps.push(appEntry);
    console.log(`Added new app "${appEntry.name}" to ${file}`);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
});

console.log(`\nSuccessfully saved to altstore.json, apps.json, and repo.json!`);

if (args.push) {
  try {
    console.log('\nCommitting and pushing to git...');
    execSync(`git add altstore.json apps.json repo.json`, { stdio: 'inherit' });
    execSync(`git commit -m "repo: add/update ${appEntry.name} in source [skip ci]"`, { stdio: 'inherit' });
    execSync(`git push origin main`, { stdio: 'inherit' });
    console.log(`Pushed to GitHub! Sideload sources will reflect changes immediately.`);
  } catch (err) {
    console.error('Git push failed:', err.message);
  }
}
