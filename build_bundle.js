const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('decotime-tracker');
const html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
const data = fs.readFileSync(path.join(srcDir, 'data.js'), 'utf8');
const ohuhu = fs.readFileSync(path.join(srcDir, 'ohuhu_data.js'), 'utf8');
const app = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8');

let bundle = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>');
bundle = bundle.replace('<script src="data.js"></script>', '<script>\n' + data + '\n</script>');
bundle = bundle.replace('<script src="ohuhu_data.js"></script>', '<script>\n' + ohuhu + '\n</script>');
bundle = bundle.replace('<script src="app.js"></script>', '<script>\n' + app + '\n</script>');

fs.writeFileSync('DecoTime_Color_Tracker_Standalone.html', bundle, 'utf8');
console.log('Standalone generated, size:', bundle.length);

const assetsDir = path.resolve('android-app/app/src/main/assets');
['index.html', 'styles.css', 'data.js', 'ohuhu_data.js', 'app.js', 'inventory.json'].forEach(f => {
  fs.copyFileSync(path.join(srcDir, f), path.join(assetsDir, f));
});
console.log('Assets copied to android-app successfully!');
