import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')
const sourceFile = path.join(rootDir, 'menu-data-clean.json')
const outputDir = path.join(rootDir, 'public', 'menu')

const slugify = (value = '') => value.toLowerCase().trim().replace(/\s+/g, '-')

const main = async () => {
  const raw = await fs.readFile(sourceFile, 'utf-8')
  const data = JSON.parse(raw)

  const categories = new Map()

  await fs.mkdir(outputDir, { recursive: true })

  data.forEach((item, index) => {
    const label = item.category?.trim()
    if (!label) {
      return
    }

    const id = slugify(label)
    if (!categories.has(id)) {
      categories.set(id, { id, label, items: [] })
    }

    categories.get(id).items.push({
      ...item,
      __generatedId: index + 1
    })
  })

  const categoryIndex = []

  for (const { id, label, items } of categories.values()) {
    const filepath = path.join(outputDir, `${id}.json`)
    await fs.writeFile(filepath, JSON.stringify(items, null, 2), 'utf-8')
    categoryIndex.push({ id, label })
  }

  await fs.writeFile(path.join(outputDir, 'index.json'), JSON.stringify(categoryIndex, null, 2), 'utf-8')
}

main().catch((error) => {
  console.error('Menü verileri bölünürken hata oluştu:', error)
  process.exitCode = 1
})




