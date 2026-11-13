const fs = require('fs');
const path = require('path');

const ohuhuPath = path.resolve('decotime-tracker/ohuhu_data.js');
const content = fs.readFileSync(ohuhuPath, 'utf8');
const match = content.match(/const OHUHU_COLORS = (\[[\s\S]*?\]);/);
const colors = JSON.parse(match[1]);

const s1_rows = [
  ['Y02', 'Y03', 'Y08', 'Y14', 'Y111'],
  ['Y26', 'Y27', 'Y28', 'Y29', 'Y210'],
  ['Y211', 'Y213', 'Y214', 'Y216', 'Y34'],
  ['Y37', 'Y310', 'Y315', 'Y43', 'Y48'],
  ['Y411', 'Y415', 'Y416', 'Y57', 'Y516'],
  ['Y66', 'Y68', 'Y610', 'Y611', 'Y613'],
  ['Y615', 'YR02', 'YR04', 'YR07', 'YR09'],
  ['YR014', 'YR11', 'YR19', 'YR110', 'YR112'],
  ['YR114', 'YR25', 'YR27', 'YR29', 'YR214'],
  ['YR33', 'YR34', 'YR36', 'YR37', 'YR38'],
  ['YR39', 'YR310', 'YR313', 'YR316', 'YR44'],
  ['YR47', 'YR52', 'YR54', 'YR57', 'YR58'],
  ['YR510', 'YR511', 'YR515', 'E03', 'E13'],
  ['E111', 'E26', 'E215', 'E30', 'E36'],
  ['E312', 'E315', 'E47', 'E49', 'E411'],
  ['E413', 'E415', 'E59', 'E511', 'E513']
];

const s2_rows = [
  ['E514', 'E515', 'E64', 'E66', 'E69'],
  ['E612', 'E613', 'E615', 'E75', 'E710'],
  ['E711', 'E712', 'E714', 'E81', 'E85'],
  ['E814', 'E93', 'E912', 'E913', 'E915'],
  ['R014', 'R015', 'R15', 'R16', 'R19'],
  ['R111', 'R23', 'R27', 'R28', 'R210'],
  ['R213', 'R214', 'R215', 'R38', 'R310'],
  ['R48', 'R412', 'R413', 'R414', 'R50'],
  ['R54', 'R57', 'R58', 'R59', 'R510'],
  ['R513', 'R514', 'R68', 'R612', 'R613'],
  ['RV04', 'RV05', 'RV08', 'RV09', 'RV17'],
  ['RV18', 'RV19', 'RV111', 'RV23', 'RV24'],
  ['RV25', 'RV27', 'RV28', 'RV29', 'RV210'],
  ['RV211', 'RV212', 'RV31', 'RV32', 'RV35'],
  ['RV39', 'RV311', 'RV313', 'RV314', 'RV316'],
  ['RV45', 'RV53', 'RV57', 'RV58', 'RV514']
];

const s3_rows = [
  ['RV515', 'V07', 'V09', 'V010', 'V013'],
  ['V015', 'V016', 'V12', 'V13', 'V18'],
  ['V23', 'V24', 'V25', 'V29', 'V214'],
  ['V32', 'V35', 'V33', 'V38', 'V411'],
  ['V413', 'BV03', 'BV04', 'BV05', 'BV09'],
  ['BV013', 'BV014', 'BV18', 'BV19', 'BV26'],
  ['BV27', 'BV28', 'BV210', 'BV31', 'BV34'],
  ['BV35', 'BV37', 'BV38', 'BV310', 'BV311'],
  ['BV312', 'BV314', 'BV315', 'BV48', 'BV414'],
  ['BV415', 'BV59', 'BV514', 'B03', 'B07'],
  ['B08', 'B010', 'B111', 'B112', 'B114'],
  ['B115', 'B27', 'B28', 'B310', 'B311'],
  ['B315', 'B411', 'B415', 'BG05', 'BG010'],
  ['BG115', 'BG22', 'BG24', 'BG211', 'BG212'],
  ['BG310', 'BG311', 'BG312', 'BG314', 'BG315'],
  ['G112', 'G24', 'G29', 'G210', 'G213']
];

const s4_rows = [
  ['G215', 'G34', 'G310', 'G312', 'G315'],
  ['G316', 'G41', 'G44', 'G47', 'G49'],
  ['G410', 'YG07', 'YG012', 'YG013', 'YG014'],
  ['YG015', 'YG111', 'YG112', 'YG114', 'YG29'],
  ['YG212', 'YG215', 'YG313', 'YG414', 'YG510'],
  ['YG66', 'YG610', 'CG03', 'CG13', 'CG14'],
  ['CG17', 'CG25', 'CG26', 'CG27', 'CG28'],
  ['BGY00', 'BGY05', 'BGY08', 'BGY15', 'BGY17'],
  ['BGY24', 'BGY36', 'BGY38', 'YGY01', 'YGY03'],
  ['YGY11', 'YGY13', 'YGY21', 'YGY22', 'YGY24'],
  ['YGY25', 'YGY26', 'YGY27', 'WG05', 'WG06'],
  ['WG08', 'WG10', 'WG12', 'WG23', 'WG24'],
  ['WG27', 'WG28', 'WG35', 'WG36', 'GG03'],
  ['GG05', 'GG10', 'GG11', 'GG12', 'GG15'],
  ['GG16', 'GG18', 'GG20', 'GG28', 'FY00'],
  ['FY01', 'FY02', 'FY03', 'FY04', '120']
];

const allSwatches = [
  { s: 1, list: s1_rows.flat() },
  { s: 2, list: s2_rows.flat() },
  { s: 3, list: s3_rows.flat() },
  { s: 4, list: s4_rows.flat() }
];

const colorMap = new Map();
colors.forEach(c => colorMap.set(c.code, c));

const reordered = [];
allSwatches.forEach(({ s, list }) => {
  list.forEach((code, idx) => {
    const c = colorMap.get(code);
    if (!c) {
      throw new Error(`Code ${code} not found in colors!`);
    }
    reordered.push({
      ...c,
      swatch: s,
      swatchIndex: idx + 1
    });
  });
});

const newContent = `// Database completo Ohuhu Oahu 320 Colori (ordinati per Swatch da 1 a 4 secondo le schede originali)\nconst OHUHU_COLORS = ${JSON.stringify(reordered, null, 2)};\n`;
fs.writeFileSync(ohuhuPath, newContent, 'utf8');
console.log('Saved reordered ohuhu_data.js! Total count:', reordered.length);
