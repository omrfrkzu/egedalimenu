const fs = require('fs');

const replacements = new Map([
  ['Ã‡', 'Ç'], ['Ã§', 'ç'], ['Ã–', 'Ö'], ['Ã¶', 'ö'], ['Ãœ', 'Ü'], ['Ã¼', 'ü'],
  ['Ä°', 'İ'], ['Ä±', 'ı'], ['ÅŸ', 'ş'], ['Åž', 'Ş'], ['ÄŸ', 'ğ'], ['Äž', 'Ğ'],
  ['Ã ', 'à'], ['Ã¡', 'á'], ['Ã¢', 'â'], ['Ã£', 'ã'], ['Ã¤', 'ä'], ['Ã¨', 'è'],
  ['Ã©', 'é'], ['Ãª', 'ê'], ['Ã«', 'ë'], ['Ã¬', 'ì'], ['Ã­', 'í'], ['Ã®', 'î'],
  ['Ã¯', 'ï'], ['Ã°', 'ð'], ['Ã±', 'ñ'], ['Ã²', 'ò'], ['Ã³', 'ó'], ['Ã´', 'ô'],
  ['Ãµ', 'õ'], ['Ã¹', 'ù'], ['Ãº', 'ú'], ['Ã»', 'û'], ['Ã½', 'ý'], ['Ã¿', 'ÿ'],
  ['â€¢', '•'], ['â€“', '–'], ['â€”', '—'], ['â€˜', '‘'], ['â€™', '’'],
  ['â€œ', '“'], ['â€', '”'], ['â€¦', '…'], ['â‚º', '₺'], ['Â', '']
]);

const fix = (str) => {
  if (!str || typeof str !== 'string') return str;
  let result = str;
  replacements.forEach((value, key) => {
    result = result.split(key).join(value);
  });
  return result
    .replace(/[\u0000-\u001F\u007F]+/g, '')
    .replace(/\uFFFD+/g, '')
    .replace(/^[!+]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const data = JSON.parse(fs.readFileSync('menu-data.json', 'utf8'));
const cleaned = data.map((item) => ({
  name: fix(item.name.replace(/^ï¿½+/, '')),
  slug: fix(item.slug.replace(/^[-]+/, '')),
  price: fix(item.price),
  description: fix(item.description.replace(/\\$/, '')),
  image: item.image,
  category: fix(item.category),
  categoryCode: item.categoryCode
}));

fs.writeFileSync('menu-data-clean.json', JSON.stringify(cleaned, null, 2), 'utf8');
console.log('Temiz veri menu-data-clean.json dosyasÄ±na yazÄ±ldÄ±.');
