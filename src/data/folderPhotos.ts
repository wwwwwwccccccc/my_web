import { archiveProvinces, type ArchivePhoto } from './site'

/**
 * Local province photo folders.
 *
 * Copy images into:
 *   src/assets/province-photos/<province>/
 *
 * Keep the province folder names exactly as listed in PROVINCE_NAMES below.
 * Vite picks the files up in dev automatically and includes them in a build.
 */
export const PROVINCE_NAMES: Record<string, string> = {
  '110000': '北京',
  '120000': '天津',
  '130000': '河北',
  '140000': '山西',
  '150000': '内蒙古',
  '210000': '辽宁',
  '220000': '吉林',
  '230000': '黑龙江',
  '310000': '上海',
  '320000': '江苏',
  '330000': '浙江',
  '340000': '安徽',
  '350000': '福建',
  '360000': '江西',
  '370000': '山东',
  '410000': '河南',
  '420000': '湖北',
  '430000': '湖南',
  '440000': '广东',
  '450000': '广西',
  '460000': '海南',
  '500000': '重庆',
  '510000': '四川',
  '520000': '贵州',
  '530000': '云南',
  '540000': '西藏',
  '610000': '陕西',
  '620000': '甘肃',
  '630000': '青海',
  '640000': '宁夏',
  '650000': '新疆',
  '710000': '台湾',
  '810000': '香港',
  '820000': '澳门',
}

const CODE_BY_NAME = new Map(
  Object.entries(PROVINCE_NAMES).map(([code, name]) => [name, code]),
)

const SAMPLE_META = new Map<string, ArchivePhoto>()
for (const province of archiveProvinces) {
  for (const photo of province.photos) {
    SAMPLE_META.set(`${province.code}:${photo.caption}`, photo)
  }
}

export function provinceName(code: string): string {
  return PROVINCE_NAMES[code] ?? ''
}

const modules = import.meta.glob<string>(
  '../assets/province-photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, query: '?url', import: 'default' },
)

export const folderPhotosByCode: Record<string, ArchivePhoto[]> = {}

for (const [path, url] of Object.entries(modules)) {
  const parts = path.split('/')
  const folder = parts[parts.length - 2]
  const file = parts[parts.length - 1]
  const code = CODE_BY_NAME.get(folder)
  if (!code) continue

  const name = PROVINCE_NAMES[code]
  const dot = file.lastIndexOf('.')
  const caption = (dot > 0 ? file.slice(0, dot) : file).replace(/[_-]+/g, ' ')
  const meta = SAMPLE_META.get(`${code}:${caption}`)

  const photo: ArchivePhoto = {
    id: `folder:${code}:${file}`,
    src: url,
    alt: meta?.alt ?? `${name} · ${caption}`,
    caption,
    note: meta?.note ?? '来自本地省份文件夹，开发时自动同步；部署前重新 build 即可。',
    date: meta?.date ?? 'LOCAL',
    place: meta?.place ?? name,
    folder: true,
  }

  folderPhotosByCode[code] ??= []
  folderPhotosByCode[code].push(photo)
}

for (const list of Object.values(folderPhotosByCode)) {
  list.sort((a, b) => a.caption.localeCompare(b.caption, 'zh-CN'))
}
