const fs = require('fs');

const FIELD_NAME = 'xtyUKk3cs';
const FIELD_SLUG = 't5wtsukx2';
const FIELD_PRICE = 'U9s4W9k8b';
const FIELD_DESC = 'ZD9ytwHer';
const FIELD_IMAGE = 'FmYlxDJhJ';
const FIELD_TAG = 'KPlPo4IbM';

const codes = {
  'sdQMagOj9': 'Favoriler',
  's9vSwHOZc': 'SandviÃ§ler',
  'ZMKsaip4q': 'KahvaltÄ± TabaklarÄ±',
  'twu2yZs_Y': 'Yumurta Ã‡eÅŸitleri',
  'o9D7pjkuV': 'SÄ±cak Lezzetler',
  'JSvfz4KNU': 'Ä°Ã§ecekler',
  'pzSCkdZXL': 'Mezeler'
};

const path = 'C:\\Users\\Omer\\.cursor\\browser-logs\\snapshot-2025-11-24T13-42-20-429Z.log';
const text = fs.readFileSync(path, 'latin1');

const fixUtf = (value) => {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const clean = (raw) => {
  if (!raw) return '';
  let value = raw.replace(/\\x[0-9A-Fa-f]{2}/g, ' ');
  value = value.replace(/[\x00-\x1f]/g, ' ').trim();
  let utf8 = Buffer.from(value, 'latin1').toString('utf8');
  utf8 = fixUtf(utf8);
  utf8 = utf8.replace(/[\u0000-\u001F]/g, ' ');
  utf8 = utf8.replace(/ï¿½/g, ' ');
  utf8 = utf8.replace(/\s+/g, ' ').trim();
  utf8 = utf8.replace(/Ã¢â€šÂº/g, 'â‚º');
  return utf8.trim();
};

const records = [];
let pos = 0;

const nextIndex = (needle, start) => text.indexOf(needle, start);

while (true) {
  const idx = nextIndex(FIELD_NAME, pos);
  if (idx === -1) break;
  const idxSlug = nextIndex(FIELD_SLUG, idx);
  if (idxSlug === -1) break;
  const nameBlock = text.slice(idx + FIELD_NAME.length, idxSlug);

  const idxPrice = nextIndex(FIELD_PRICE, idxSlug);
  if (idxPrice === -1) break;
  const slugBlock = text.slice(idxSlug + FIELD_SLUG.length, idxPrice);

  const idxDesc = nextIndex(FIELD_DESC, idxPrice);
  if (idxDesc === -1) break;
  const priceBlock = text.slice(idxPrice + FIELD_PRICE.length, idxDesc);

  const idxImg = nextIndex(FIELD_IMAGE, idxDesc);
  if (idxImg === -1) break;
  const descBlock = text.slice(idxDesc + FIELD_DESC.length, idxImg);

  const idxTag = nextIndex(FIELD_TAG, idxImg);
  if (idxTag === -1) break;
  const imgBlock = text.slice(idxImg + FIELD_IMAGE.length, idxTag);

  const tagBlock = text.slice(idxTag + FIELD_TAG.length, idxTag + 80);
  const tagMatch = tagBlock.match(/([A-Za-z0-9_]{6,})/);
  const tagCode = tagMatch ? tagMatch[1] : '';

  const name = clean(nameBlock);
  const slug = clean(slugBlock).replace(/[^a-zA-Z0-9-Ã§ÄŸÄ±Ã¶ÅŸÃ¼Ã‡ÄÄ°Ã–ÅÃœ]/g, '-');
  let price = clean(priceBlock);
  const priceMatch = price.match(/([0-9]+(?:\.[0-9]+)?)â‚º/);
  if (priceMatch) {
    price = `${priceMatch[1]}â‚º`;
  } else if (price) {
    price = price.split(' ')[0];
  }

  const descMatches = [...descBlock.matchAll(/"([^\"]+)"/g)].map((m) => m[1]);
  const descParts = descMatches.filter((part) => part.length > 2 && part.toLowerCase() !== 'p' && part.toLowerCase() !== 'null' && !part.startsWith('http'));
  const description = clean(descParts.join(' '));

  let imageUrl = null;
  const startJson = imgBlock.indexOf('{');
  const endJson = imgBlock.lastIndexOf('}');
  if (startJson !== -1 && endJson !== -1 && endJson > startJson) {
    try {
      const jsonText = imgBlock.slice(startJson, endJson + 1).replace(/\\"/g, '\"');
      imageUrl = JSON.parse(jsonText).src || null;
    } catch (err) {
      imageUrl = null;
    }
  }

  records.push({
    name,
    slug,
    price,
    description,
    image: imageUrl,
    category: codes[tagCode] || 'Bilinmiyor',
    categoryCode: tagCode
  });

  pos = idxTag + FIELD_TAG.length;
}

fs.writeFileSync('menu-data.json', JSON.stringify(records, null, 2), 'utf8');
console.log(`Parsed ${records.length} kayÄ±t menu-data.json dosyasÄ±na yazÄ±ldÄ±.`);
