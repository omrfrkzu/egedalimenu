import re
import json
import pathlib

codes = {
    'sdQMagOj9': 'Favoriler',
    's9vSwHOZc': 'SandviÃ§ler',
    'ZMKsaip4q': 'KahvaltÄ± TabaklarÄ±',
    'twu2yZs_Y': 'Yumurta Ã‡eÅŸitleri',
    'o9D7pjkuV': 'SÄ±cak Lezzetler',
    'JSvfz4KNU': 'Ä°Ã§ecekler',
    'pzSCkdZXL': 'Mezeler',
}

path = r'C:\Users\Omer\.cursor\browser-logs\snapshot-2025-11-24T13-42-20-429Z.log'
text = pathlib.Path(path).read_bytes().decode('latin-1', errors='ignore')


def clean(raw: str) -> str:
    raw = raw.replace('ï¿½', ' ')
    raw = re.sub(r'[\x00-\x1f]', ' ', raw)
    raw = raw.strip()
    raw = raw.encode('latin-1', errors='ignore').decode('utf-8', errors='ignore')
    return re.sub(r'\s+', ' ', raw).strip()


records = []
pos = 0
while True:
    idx = text.find('xtyUKk3cs', pos)
    if idx == -1:
        break
    idx += len('xtyUKk3cs')
    idx_slug = text.find('t5wtsukx2', idx)
    if idx_slug == -1:
        break
    name_block = text[idx:idx_slug]

    idx_price = text.find('U9s4W9k8b', idx_slug)
    if idx_price == -1:
        break
    slug_block = text[idx_slug + len('t5wtsukx2'):idx_price]

    idx_desc = text.find('ZD9ytwHer', idx_price)
    if idx_desc == -1:
        break
    price_block = text[idx_price + len('U9s4W9k8b'):idx_desc]

    idx_img = text.find('FmYlxDJhJ', idx_desc)
    if idx_img == -1:
        break
    desc_block = text[idx_desc + len('ZD9ytwHer'):idx_img]

    idx_tag = text.find('KPlPo4IbM', idx_img)
    if idx_tag == -1:
        break
    img_block = text[idx_img + len('FmYlxDJhJ'):idx_tag]

    tag_block = text[idx_tag + len('KPlPo4IbM'):idx_tag + 80]
    tag_match = re.search(r'([A-Za-z0-9_]{6,})', tag_block)
    tag_code = tag_match.group(1) if tag_match else ''

    name = clean(name_block)
    slug = clean(slug_block)
    price = clean(price_block).replace('Ã¢â€šÂº', 'â‚º')

    raw_desc_parts = re.findall(r'"([^\"]+)"', desc_block)
    desc_parts = [part for part in raw_desc_parts if len(part) > 2 and part.lower() not in {'p', 'null'} and not part.startswith('http')]
    description = clean(' '.join(desc_parts))

    image_url = None
    if '{' in img_block and '}' in img_block:
        try:
            block = img_block[img_block.index('{'):img_block.rindex('}') + 1]
            block = block.replace('\\"', '\"')
            image_url = json.loads(block).get('src')
        except Exception:
            image_url = None

    records.append({
        'name': name,
        'slug': slug,
        'price': price,
        'description': description,
        'image': image_url,
        'category_code': tag_code,
        'category': codes.get(tag_code, 'Bilinmiyor')
    })

    pos = idx_tag + 10

output_path = pathlib.Path('menu-data.json')
output_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Parsed {len(records)} kayÄ±t menu-data.json dosyasÄ±na yazÄ±ldÄ±.')
