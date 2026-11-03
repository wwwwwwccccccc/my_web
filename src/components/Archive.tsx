import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import SectionHead from './SectionHead'
import { archiveProvinces, type ArchivePhoto } from '../data/site'
import { folderPhotosByCode, provinceName } from '../data/folderPhotos'
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

const OWNER_KEY = 'wp-archive-owner'
const META_KEY = 'wp-archive-photo-meta'

type PhotoMeta = Partial<Pick<ArchivePhoto, 'caption' | 'note' | 'date'>>

function readOwner(): boolean {
  try {
    return window.localStorage.getItem(OWNER_KEY) === '1'
  } catch {
    return false
  }
}

function readMeta(): Record<string, PhotoMeta> {
  try {
    const raw = window.localStorage.getItem(META_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : {}
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, PhotoMeta>) : {}
  } catch {
    return {}
  }
}

function persistMeta(next: Record<string, PhotoMeta>) {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(next))
  } catch {
    // The current session still reflects the edit.
  }
}

const PIN_OFFSETS: Record<string, [number, number]> = {
  '310000': [34, -2],
  '110000': [24, -6],
  '370000': [18, -8],
  '420000': [0, -6],
  '440000': [18, 10],
  '530000': [-6, -4],
  '510000': [-8, -6],
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
  const [uploadError, setUploadError] = useState('')
  const [owner, setOwner] = useState<boolean>(() => readOwner())
  const [metaOverrides, setMetaOverrides] = useState<Record<string, PhotoMeta>>(() => readMeta())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ code: string; photo: ArchivePhoto } | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftCaption, setDraftCaption] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [draftDate, setDraftDate] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const active = DATA_BY_CODE.get(activeCode)
  const activeShape = SHAPE_BY_CODE.get(activeCode)
  const activeName = active?.name || provinceName(activeCode) || activeShape?.name || '未知省份'
  const localPhotos = uploads[activeCode] ?? []
  const applyMeta = (photo: ArchivePhoto): ArchivePhoto => {
    const override = metaOverrides[photo.id ?? photo.src]
    return override ? { ...photo, ...override } : photo
  }
  const folderPhotos = (folderPhotosByCode[activeCode] ?? []).map(applyMeta)
  const photos = [...folderPhotos, ...localPhotos]
  const photoCountFor = (code: string) =>
    (folderPhotosByCode[code]?.length ?? 0) + (uploads[code]?.length ?? 0)
  const pinCodes = Array.from(
    new Set([
      ...archiveProvinces.map((province) => province.code),
      ...Object.keys(folderPhotosByCode),
      ...Object.keys(uploads),
    ]),
  ).filter((code) => photoCountFor(code) > 0)
  const totalPhotos = pinCodes.reduce((sum, code) => sum + photoCountFor(code), 0)
  const nameFor = (code: string) =>
    DATA_BY_CODE.get(code)?.name || provinceName(code) || SHAPE_BY_CODE.get(code)?.name || code
  const region =
    active?.region ??
    (folderPhotos.length ? '本地文件夹' : localPhotos.length ? '本机上传' : '中国')
  const blurb =
    active?.blurb ??
    (folderPhotos.length
      ? '这些照片来自本地省份文件夹，开发时会自动同步；部署前重新构建即可。'
      : localPhotos.length
        ? '这些照片保存在当前浏览器，还没有写进示例数据。'
        : '这一站还没有归档。上传一张照片，或把照片放进对应省份文件夹。')

  useEffect(() => {
    const url = new URL(window.location.href)
    const param = url.searchParams.get('owner')
    if (param === '1') {
      try {
        window.localStorage.setItem(OWNER_KEY, '1')
      } catch {
        // Owner mode still applies to this session.
      }
      setOwner(true)
      url.searchParams.delete('owner')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    } else if (param === '0') {
      try {
        window.localStorage.removeItem(OWNER_KEY)
      } catch {
        // Ignore storage errors.
      }
      setOwner(false)
      url.searchParams.delete('owner')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

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
    setDraftDate(photo.date)
  }

  const closeLightbox = () => {
    setLightbox(null)
    setEditing(false)
  }

  const deletePhoto = (code: string, photo: ArchivePhoto) => {
    if (!photo.local || !photo.id) return
    setUploads((current) => ({
      ...current,
      [code]: (current[code] ?? []).filter((item) => item.id !== photo.id),
    }))
    void deleteStoredPhoto(photo.id).catch(() => {
      setUploadError('照片已从页面移除，但浏览器存储删除失败。')
    })
    if (lightbox?.photo.id === photo.id) closeLightbox()
    setDeleteTarget(null)
  }

  const saveDescription = () => {
    if (!lightbox || !owner) return
    const updated: ArchivePhoto = {
      ...lightbox.photo,
      caption: draftCaption.trim() || '未命名照片',
      note: draftNote.trim(),
      date: draftDate.trim() || '未标注日期',
    }

    if (lightbox.photo.folder) {
      const key = lightbox.photo.id ?? lightbox.photo.src
      setMetaOverrides((current) => {
        const next = {
          ...current,
          [key]: {
            caption: updated.caption,
            note: updated.note,
            date: updated.date,
          },
        }
        persistMeta(next)
        return next
      })
      setLightbox({ ...lightbox, photo: updated })
      setEditing(false)
      return
    }

    if (!updated.id) return
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
                      aria-label={`${nameFor(province.code)}，${
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
              <span className="mono">中国省份地图</span>
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
                      <img
                        src={photo.folder ? photo.src : asset(photo.src)}
                        alt={photo.alt}
                        loading="lazy"
                      />
                    </div>
                    <div
                      className="archive-photo__tools"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button type="button" onClick={() => openLightbox(photo)}>
                        放大
                      </button>
                      {photo.folder ? null : (
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => setDeleteTarget(photo.id ?? photo.src)}
                        >
                          删除
                        </button>
                      )}
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
                        </span>
                      </div>
                      <h4>{photo.caption}</h4>
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
                <img
                  src={lightbox.photo.folder ? lightbox.photo.src : asset(lightbox.photo.src)}
                  alt={lightbox.photo.alt}
                />
              </div>

              <div className="archive-lightbox__body">
                <div className="archive-lightbox__meta">
                  <span className="mono">{lightbox.photo.date}</span>
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
                      <span>日期</span>
                      <input
                        value={draftDate}
                        maxLength={20}
                        onChange={(event) => setDraftDate(event.target.value)}
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
                      owner ? (
                        <div className="archive-lightbox__actions">
                          <button
                            type="button"
                            onClick={() => {
                              setDraftCaption(lightbox.photo.caption)
                              setDraftNote(lightbox.photo.note)
                              setDraftDate(lightbox.photo.date)
                              setEditing(true)
                            }}
                          >
                            编辑信息
                          </button>
                          <button
                            type="button"
                            className="is-danger"
                            onClick={() => deletePhoto(lightbox.code, lightbox.photo)}
                          >
                            删除照片
                          </button>
                        </div>
                      ) : null
                    ) : lightbox.photo.folder ? (
                      owner ? (
                        <div className="archive-lightbox__actions">
                          <button
                            type="button"
                            onClick={() => {
                              setDraftCaption(lightbox.photo.caption)
                              setDraftNote(lightbox.photo.note)
                              setDraftDate(lightbox.photo.date)
                              setEditing(true)
                            }}
                          >
                            编辑信息
                          </button>
                        </div>
                      ) : null
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
            目前是 {pinCodes.length} 站、{totalPhotos} 张照片。
          </p>
        </div>
      </div>
    </section>
  )
}
