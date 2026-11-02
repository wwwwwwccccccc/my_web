import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import SectionHead from './SectionHead'
import { archiveProvinces, type ArchivePhoto } from '../data/site'
import { asset } from '../lib/asset'
import { loadStoredPhotos, saveStoredPhoto, deleteStoredPhoto } from '../lib/photoStore'
import { chinaMapViewBox, chinaProvinces, type ChinaProvinceShape } from '../data/chinaMap'

const MAX_UPLOAD = 3 * 1024 * 1024
const MAX_FILES = 4

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const DATA_BY_CODE = new Map(archiveProvinces.map((province) => [province.code, province]))
const SHAPE_BY_CODE = new Map(chinaProvinces.map((province) => [province.code, province]))

const PIN_OFFSETS: Record<string, [number, number]> = {
  '310000': [34, -2],
  '110000': [24, -6],
  '370000': [18, -8],
  '420000': [0, -6],
  '440000': [18, 10],
  '530000': [-6, -4],
  '510000': [-8, -6],
}

const HIDDEN_KEY = 'wp-archive-hidden-photos'

function readHidden(): string[] {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function persistHidden(next: string[]) {
  try {
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify(next))
  } catch {
    // Ignore unavailable storage; the current session still reflects it.
  }
}

function pinWidth(name: string, count: number) {
  return 28 + name.length * 11 + String(count).length * 6 + 8
}

function ProvincePin({
  shape,
  name,
  count,
  active,
  onActivate,
}: {
  shape: ChinaProvinceShape
  name: string
  count: number
  active: boolean
  onActivate: () => void
}) {
  const [dx, dy] = PIN_OFFSETS[shape.code] ?? [0, 0]
  const width = pinWidth(name, count)
  return (
    <g
      className={`archive-map__pin${active ? ' is-active' : ''}`}
      transform={`translate(${shape.label[0] + dx} ${shape.label[1] + dy})`}
      aria-hidden="true"
      onClick={onActivate}
    >
      <rect x={-width / 2} y={-12} width={width} height={24} rx={12} />
      <text x={0} y={1.5} textAnchor="middle">
        {name}
        <tspan dx={5}>{count}</tspan>
      </text>
    </g>
  )
}

export default function Archive() {
  const [activeCode, setActiveCode] = useState('310000')
  const [uploads, setUploads] = useState<Record<string, ArchivePhoto[]>>({})
  const [hidden, setHidden] = useState<string[]>(() => readHidden())
  const [uploadError, setUploadError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ code: string; photo: ArchivePhoto } | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftCaption, setDraftCaption] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const active = DATA_BY_CODE.get(activeCode)
  const activeShape = SHAPE_BY_CODE.get(activeCode)
  const activeName = active?.name ?? activeShape?.name ?? '未知省份'
  const localPhotos = uploads[activeCode] ?? []
  const visibleDataPhotos = active
    ? active.photos.filter((photo) => !hidden.includes(photo.src))
    : []
  const photos = [...visibleDataPhotos, ...localPhotos]
  const photoCountFor = (code: string) => {
    const province = DATA_BY_CODE.get(code)
    const dataCount = province
      ? province.photos.filter((photo) => !hidden.includes(photo.src)).length
      : 0
    return dataCount + (uploads[code]?.length ?? 0)
  }
  const totalPhotos =
    archiveProvinces.reduce((sum, province) => sum + photoCountFor(province.code), 0) +
    Object.entries(uploads).reduce(
      (sum, [code, items]) => sum + (DATA_BY_CODE.has(code) ? 0 : items.length),
      0,
    )
  const pinCodes = Array.from(
    new Set([
      ...archiveProvinces.map((province) => province.code),
      ...Object.keys(uploads),
    ]),
  ).filter((code) => photoCountFor(code) > 0)
  const nameFor = (code: string) =>
    DATA_BY_CODE.get(code)?.name ?? SHAPE_BY_CODE.get(code)?.name ?? code
  const region = active?.region ?? (localPhotos.length ? '本机上传' : '中国')
  const blurb =
    active?.blurb ??
    (localPhotos.length
      ? '这些照片保存在当前浏览器，还没有写进示例数据。'
      : '这一站还没有归档。上传一张照片，从这里开始。')

  useEffect(() => {
    let alive = true
    loadStoredPhotos()
      .then((stored) => {
        if (alive) setUploads(stored)
      })
      .catch(() => {
        // IndexedDB may be unavailable; the in-memory preview still works.
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0
    setDeleteTarget(null)
  }, [activeCode])

  useEffect(() => {
    if (!lightbox) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('is-locked')
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('is-locked')
    }
  }, [lightbox])

  const openLightbox = (photo: ArchivePhoto) => {
    setLightbox({ code: activeCode, photo })
    setDeleteTarget(null)
    setEditing(false)
    setDraftCaption(photo.caption)
    setDraftNote(photo.note)
  }

  const closeLightbox = () => {
    setLightbox(null)
    setEditing(false)
  }

  const deletePhoto = (code: string, photo: ArchivePhoto) => {
    if (photo.local) {
      if (!photo.id) return
      setUploads((current) => ({
        ...current,
        [code]: (current[code] ?? []).filter((item) => item.id !== photo.id),
      }))
      void deleteStoredPhoto(photo.id).catch(() => {
        setUploadError('照片已从页面移除，但浏览器存储删除失败。')
      })
    } else {
      setHidden((current) => {
        if (current.includes(photo.src)) return current
        const next = [...current, photo.src]
        persistHidden(next)
        return next
      })
    }
    if (
      lightbox &&
      (photo.local ? lightbox.photo.id === photo.id : lightbox.photo.src === photo.src)
    ) {
      closeLightbox()
    }
    setDeleteTarget(null)
  }

  const restoreSamples = () => {
    setHidden([])
    persistHidden([])
  }

  const saveDescription = () => {
    if (!lightbox?.photo.id) return
    const updated: ArchivePhoto = {
      ...lightbox.photo,
      caption: draftCaption.trim() || '未命名照片',
      note: draftNote.trim(),
    }
    setUploads((current) => ({
      ...current,
      [lightbox.code]: (current[lightbox.code] ?? []).map((item) =>
        item.id === updated.id ? updated : item,
      ),
    }))
    void saveStoredPhoto(lightbox.code, updated)
    setLightbox({ ...lightbox, photo: updated })
    setEditing(false)
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const files = Array.from(input.files ?? [])
    input.value = ''
    setUploadError('')
    if (!files.length) return

    if (files.some((file) => file.size > MAX_UPLOAD)) {
      setUploadError('单张图片请小于 3MB。')
      return
    }

    const accepted = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, MAX_FILES)

    if (!accepted.length) {
      setUploadError('请选择图片文件（JPG / PNG / WebP）。')
      return
    }

    Promise.all(accepted.map(readFile))
      .then((urls) => {
        const now = new Date()
        const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
        const added: ArchivePhoto[] = accepted.map((file, index) => ({
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${activeCode}-${Date.now()}-${index}`,
          src: urls[index],
          alt: file.name,
          caption: '新上传的照片',
          note: '保存在当前浏览器；换设备或清理浏览器数据后不会同步。',
          date,
          place: activeName,
          local: true,
        }))
        added.forEach((photo) => {
          void saveStoredPhoto(activeCode, photo).catch(() => {
            setUploadError('图片已预览，但浏览器未能持久保存。')
          })
        })
        setUploads((current) => ({
          ...current,
          [activeCode]: [...(current[activeCode] ?? []), ...added],
        }))
      })
      .catch(() => setUploadError('图片读取失败，请重试。'))
  }

  return (
    <section className="section archive" id="archive" aria-labelledby="archive-title">
      <div className="shell">
        <SectionHead
          index="01"
          label="SLOW ARCHIVE / 慢档案"
          title={
            <span id="archive-title">
              把日子，
              <br />
              <em>慢慢归档</em>
            </span>
          }
          intro="把去过的城市收进一张地图。"
        />

        <div className="archive-map" data-reveal>
          <div className="archive-map__stage">
            <div className="archive-map__head">
              <span className="mono archive-map__badge">
                <span className="archive-map__dot" aria-hidden="true" />
                {pinCodes.length} 站 · {totalPhotos} 张照片
              </span>
              <span className="mono archive-map__hint">CLICK / 点击省份</span>
            </div>

            <svg
              className="archive-map__svg"
              viewBox={chinaMapViewBox}
              role="group"
              aria-label="中国省份生活照片地图，点击省份查看照片"
            >
              <g className="archive-map__provinces">
                {chinaProvinces.map((province) => {
                  const data = DATA_BY_CODE.get(province.code)
                  const count = photoCountFor(province.code)
                  const hasContent = count > 0
                  const isActive = province.code === activeCode
                  return (
                    <path
                      key={province.code}
                      d={province.d}
                      fillRule="evenodd"
                      className={[
                        'archive-map__province',
                        hasContent ? 'has-data' : '',
                        isActive ? 'is-active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      tabIndex={hasContent ? 0 : -1}
                      role={hasContent ? 'button' : undefined}
                      aria-label={`${data?.name ?? province.name}，${
                        count ? `${count} 张照片` : '暂无照片'
                      }`}
                      aria-pressed={hasContent ? isActive : undefined}
                      onClick={() => setActiveCode(province.code)}
                      onKeyDown={(event) => {
                        if (!hasContent) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setActiveCode(province.code)
                        }
                      }}
                    />
                  )
                })}
              </g>
              <g className="archive-map__pins">
                {pinCodes.map((code) => {
                  const shape = SHAPE_BY_CODE.get(code)
                  if (!shape) return null
                  return (
                    <ProvincePin
                      key={code}
                      shape={shape}
                      name={nameFor(code)}
                      count={photoCountFor(code)}
                      active={code === activeCode}
                      onActivate={() => setActiveCode(code)}
                    />
                  )
                })}
              </g>
            </svg>

            <div className="archive-map__foot">
              <span className="mono">中国省份地图 · 示例数据</span>
              <span className="mono">PHOTO ARCHIVE / 2023—26</span>
            </div>
          </div>

          <div className="archive-map__chips" aria-label="选择省份">
            {pinCodes.map((code) => {
              const shape = SHAPE_BY_CODE.get(code)
              if (!shape) return null
              return (
                <button
                  type="button"
                  key={code}
                  className={`archive-map__chip${code === activeCode ? ' is-active' : ''}`}
                  aria-pressed={code === activeCode}
                  onClick={() => setActiveCode(code)}
                >
                  {nameFor(code)}
                  <span>{photoCountFor(code)}</span>
                </button>
              )
            })}
          </div>

          <aside className="archive-panel" aria-live="polite">
            <header className="archive-panel__head">
              <span className="mono archive-panel__eyebrow">
                {region} · {photos.length} 张照片
              </span>
              <div className="archive-panel__title-row">
                <h3>{activeName}</h3>
              </div>
              <p>{blurb}</p>
            </header>

            <div
              className="archive-panel__list"
              ref={listRef}
              key={activeCode}
              tabIndex={0}
              aria-label={`${activeName}的照片`}
            >
              <label className="archive-upload">
                <input type="file" accept="image/*" multiple onChange={handleUpload} />
                <span className="archive-upload__mark" aria-hidden="true">+</span>
                <span className="archive-upload__copy">
                  <b>上传照片</b>
                  <small>本机保存 · 不上传服务器</small>
                </span>
                <span className="archive-upload__limit mono">JPG / PNG · ≤3MB</span>
              </label>

              {uploadError ? <p className="archive-upload__error">{uploadError}</p> : null}

              {photos.length ? (
                photos.map((photo, index) => (
                  <figure
                    className={`archive-photo${photo.local ? ' is-local' : ''}`}
                    key={photo.id ?? photo.src}
                    style={{ '--delay': `${index * 70}ms` } as CSSProperties}
                    onDoubleClick={() => openLightbox(photo)}
                  >
                    <div className="archive-photo__media">
                      <img src={asset(photo.src)} alt={photo.alt} loading="lazy" />
                    </div>
                    <div
                      className="archive-photo__tools"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button type="button" onClick={() => openLightbox(photo)}>
                        放大
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => setDeleteTarget(photo.id ?? photo.src)}
                      >
                        删除
                      </button>
                    </div>

                    {deleteTarget === (photo.id ?? photo.src) ? (
                      <div
                        className="archive-photo__confirm"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span>删除这张照片？</span>
                        <div>
                          <button
                            type="button"
                            onClick={() => deletePhoto(activeCode, photo)}
                          >
                            删除
                          </button>
                          <button type="button" onClick={() => setDeleteTarget(null)}>
                            取消
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <figcaption>
                      <div className="archive-photo__meta">
                        <span className="mono">{photo.date}</span>
                        <span className="mono">
                          {photo.local ? `本机 · ${photo.place}` : photo.place}
                        </span>
                      </div>
                      <h4>{photo.caption}</h4>
                      <p>{photo.note}</p>
                    </figcaption>
                  </figure>
                ))
              ) : (
                <div className="archive-panel__empty">
                  <span className="mono">{activeName} · 暂无照片</span>
                  <h3>这一站，还没有归档。</h3>
                  <p>上传一张照片，或等下一次路过。</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {lightbox ? createPortal(
          <div
            className="archive-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="查看照片"
            onClick={closeLightbox}
          >
            <div className="archive-lightbox__panel" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="archive-lightbox__close"
                onClick={closeLightbox}
                aria-label="关闭"
              >
                ×
              </button>

              <div className="archive-lightbox__media">
                <img src={asset(lightbox.photo.src)} alt={lightbox.photo.alt} />
              </div>

              <div className="archive-lightbox__body">
                <div className="archive-lightbox__meta">
                  <span className="mono">{lightbox.photo.date}</span>
                  <span className="mono">
                    {lightbox.photo.local ? `本机 · ${lightbox.photo.place}` : lightbox.photo.place}
                  </span>
                </div>

                {editing ? (
                  <form
                    className="archive-lightbox__form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      saveDescription()
                    }}
                  >
                    <label>
                      <span>标题</span>
                      <input
                        value={draftCaption}
                        maxLength={40}
                        onChange={(event) => setDraftCaption(event.target.value)}
                        autoFocus
                      />
                    </label>
                    <label>
                      <span>描述</span>
                      <textarea
                        value={draftNote}
                        rows={3}
                        maxLength={180}
                        onChange={(event) => setDraftNote(event.target.value)}
                      />
                    </label>
                    <div className="archive-lightbox__form-actions">
                      <button type="submit">保存</button>
                      <button type="button" onClick={() => setEditing(false)}>
                        取消
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{lightbox.photo.caption}</h3>
                    <p>{lightbox.photo.note || '还没有写下描述。'}</p>
                    {lightbox.photo.local ? (
                      <div className="archive-lightbox__actions">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftCaption(lightbox.photo.caption)
                            setDraftNote(lightbox.photo.note)
                            setEditing(true)
                          }}
                        >
                          编辑描述
                        </button>
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => deletePhoto(lightbox.code, lightbox.photo)}
                        >
                          删除照片
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="archive-lightbox__actions">
                          <button
                            type="button"
                            className="is-danger"
                            onClick={() => deletePhoto(lightbox.code, lightbox.photo)}
                          >
                            删除这张示例照片
                          </button>
                        </div>
                        <span className="archive-lightbox__sample">
                          示例照片 · 描述可在 src/data/site.ts 中修改
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        ) : null}

        <div className="archive__foot" data-reveal>
          <span className="mono">MORE NOTES / 持续更新</span>
          <p>
            目前是 {pinCodes.length} 站、{totalPhotos} 张照片。示例照片和本机上传都可以删除，也可以随时恢复示例。
          </p>
          {hidden.length ? (
            <button type="button" className="archive__restore" onClick={restoreSamples}>
              恢复示例照片
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
