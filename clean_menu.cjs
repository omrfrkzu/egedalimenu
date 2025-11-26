const fs = require('fs');

const inputPath = 'menu-data.json';
const outputPath = 'menu-data-clean.json';

const fixEncoding = (value) => {
  if (!value) return '';
  const buffer = Buffer.from(value, 'latin1');
  let text = buffer.toString('utf8');
  text = text.replace(/[\x00-\x1f]/g, ' ').replace(/ï¿½/g, ' ').replace(/\s+/g, ' ').trim();
  text = text.replace(/Ã¢â€šÂº/g, 'â‚º');
  return text.trim();
};

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const cleaned = raw.map((item) => {
  const name = fixEncoding(item.name);
  const slug = fixEncoding(item.slug);
  let price = fixEncoding(item.price);
  const priceMatch = price.match(/([0-9]+(?:\.[0-9]+)?)â‚º/);
  if (priceMatch) {
    price = `${priceMatch[1]}â‚º`;
  }
  const description = fixEncoding(item.description).replace(/\\$/,'').trim();
  const image = item.image;
  const category = fixEncoding(item.category);
  const categoryCode = item.category_code;
  return { name, slug, price, description, image, categoryCode, category };
});

fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log(`TemizlenmiÅŸ ${cleaned.length} kayÄ±t menu-data-clean.json dosyasÄ±na yazÄ±ldÄ±.`);
