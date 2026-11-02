# 王迧 · 个人作品集网站

基带软件开发工程师，现居上海。暗色、编辑感的个人作品集，React + Vite，PC-first，版心最大 1700px。

当前为 **v1 可运行版本**：全屏影像首页、About Me、慢档案地图、快生活、结尾一句话；包含 TechText 标题、图片缓慢漂移、项目详情弹窗、本机累计访问统计、本地时间等细节。

---

## 快速开始

### 环境要求

- Node.js **20.19+ 或 22.12+**（Vite 7 要求；建议 Node 22 LTS，本项目在 Node 24 下验证）
- 包管理器：**pnpm 10**（仓库自带 `pnpm-lock.yaml`，不要用 npm 生成新的 lockfile）

### Windows PowerShell（推荐，不需要全局安装 pnpm）

```powershell
# 第一次：安装依赖
corepack.cmd pnpm@10 install

# 开发
corepack.cmd pnpm@10 dev
# http://127.0.0.1:5174/ 或 http://localhost:5174/

# 类型检查 + 生产构建
corepack.cmd pnpm@10 build

# 本地预览生产构建
corepack.cmd pnpm@10 preview
# http://127.0.0.1:4173/
```

`corepack.cmd pnpm@10 ...` 是 Node 自带的 Corepack 用法：它会下载并运行 pnpm 10，**不依赖全局 `pnpm` 命令**，也不会碰到 PowerShell 禁止运行 `pnpm.ps1` 的问题。第一次运行需要联网下载 pnpm。

> 如果 Node 安装不完整、连 `corepack` 也没有，可以先执行 `npm.cmd install -g pnpm@10`，然后统一使用 `pnpm.cmd` 运行下面的命令。

### macOS / Linux

```bash
corepack pnpm@10 install
corepack pnpm@10 dev
corepack pnpm@10 build
corepack pnpm@10 preview
```

### 已经安装好 pnpm 的情况

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

如果 PowerShell 提示“无法加载 pnpm.ps1，因为在此系统上禁止运行脚本”，改用 `pnpm.cmd`：

```powershell
pnpm.cmd install
pnpm.cmd dev
pnpm.cmd build
pnpm.cmd preview
```

或者只对当前用户放开本地脚本：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

然后重新打开 PowerShell。

### npm 备选（无法使用 pnpm 时）

```powershell
npm.cmd install --no-package-lock
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

npm 构建时会出现：

```text
npm warn Unknown project config "strict-dep-builds"
npm warn Unknown project config "verify-deps-before-run"
```

这是 `.npmrc` 里两个 **pnpm 专用配置**，npm 不认识，只是 warning，**不阻止构建**。想彻底避免就用上面的 pnpm 命令；不建议为了消除 warning 删除 `.npmrc`。

### 端口说明

| 命令      | 地址                     | 说明                          |
| --------- | ------------------------ | ----------------------------- |
| `dev`     | `http://127.0.0.1:5174/` | Vite 开发服务器，支持热更新   |
| `preview` | `http://127.0.0.1:4173/` | 预览已经 build 出来的 `dist/` |
| `build`   | 无                       | 只生成 `dist/`，不启动网页    |

端口来自 [vite.config.ts](vite.config.ts) 的 `server.port` 和 `preview.port`。如果 5174 被占用，Vite 会自动尝试下一个端口，以终端打印的 `Local:` 地址为准。

### 安装时提示 `Ignored build scripts: esbuild`

这是 pnpm 对依赖构建脚本的提示。仓库的 `pnpm-workspace.yaml` 已声明 `onlyBuiltDependencies: esbuild`，通常不需要处理。如果构建确实异常，执行：

```powershell
corepack.cmd pnpm@10 approve-builds
```

勾选 esbuild 后重新运行构建。

技术栈：React 19、TypeScript、Vite 7。无 UI 框架、无动画库，动效由 CSS + IntersectionObserver 实现。

---

## 页面结构

导航：**首页 / 慢档案 / 快生活**。

| 模块     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| Hero     | 上海夜景全屏背景、TechText 标题「Hi，这里是 / W」、OPEN TO OPPORTUNITIES、上海坐标/当地时间；已移除中部介绍文字与 CTA |
| About Me | 人像/城市图 + 自我介绍、当前身份、电话、邮箱、标签（嵌入式 / LTE） |
| 慢档案   | 中国省份地图 + 右侧照片面板；点击省份展开照片和文字；面板内提供本地照片上传入口 |
| 快生活   | INSPECT（工业视觉检测）、LINK（RK3588/FPGA 高速传输）、DRIVE（车载冗余电源与诊断）、PORTFOLIO（本站） |
| 结尾     | 一句话「欢迎你来参观我的生命一角」+ 回到顶部，不再有整屏联系模块；它位于 folio 之外，01/02 切换不影响它 |

慢档案与快生活现在位于同一个 **100svh 水平 folio** 中：页面不再把 01/02 纵向堆叠，点击导航 01/02，或点击右侧不显眼的圆形箭头，会横向滑动切换；每个 panel 内部可独立纵向滚动。移动端导航隐藏，使用右下角的 `01 / 02` 箭头切换。

右上角的「累计访问人数」使用 `localStorage` / `sessionStorage` 统计当前浏览器的访问次数、首次与最近访问时间，不上传服务器。点击可打开详情面板；这是本机访问次数，不是全站真实人数。

---

## 修改内容

所有文案、项目、关于我与档案内容都集中在：

```
src/data/site.ts
```

- `profile`：姓名、身份（基带软件开发工程师）、城市、邮箱、电话、脱敏电话、标签（嵌入式 / LTE）、坐标
- `archiveProvinces`：慢档案的 7 个省份、简介和照片（含照片说明/日期/地点）
- `src/data/chinaMap.ts`：由 `data/china-provinces.geojson` 生成的中国省份 SVG 路径
- `projects`：4 个项目（标题、副标题、分类、年份、标签、封面、详情、职责/周期/交付）
- `navItems`：导航

修改后页面会自动热更新。

---

## 01 / 02 横向切换

- `src/components/Folio.tsx` 把慢档案和快生活放进一个 100svh 高的水平轨道；
- 点击导航「慢档案 / 快生活」会滚动到 folio 并切换对应 panel；
- 右侧中部有一个低对比度的圆形箭头和 `01 / 02` 计数，点击即可左右切换；
- 切换时用 `translateX` 滑动，当前 panel 会重置到顶部；
- 两个 panel 各自内部纵向滚动，因此 02 的项目列表不会再把整个页面拉长；
- 移动端导航隐藏，切换器移到右下角（`01 / 02` + 箭头）；
- 非当前 panel 使用 `inert` / `aria-hidden`，不会抢键盘焦点。

---

## 慢档案地图

慢档案章节现在是一张中国省份地图 + 右侧照片面板：

- 点击省份或地图上的名称标签，右侧面板才切换到该省份的照片；悬停不做任何切换；
- 键盘可以先聚焦省份，再按 Enter / Space 切换；
- 有照片的省份用紫色底和粉色名称标签标出，当前省份高亮为粉色；照片数量为 0 的省份不显示名称标签，也不着色；
- 没有照片的省份会显示「这一站，还没有归档」的空状态；
- 右侧面板可独立滚动，照片下方是日期、地点、标题和一段文字；
- 双击照片或点击照片右上角的「放大」可以打开大图；大图下方提供「编辑描述」，可改标题/描述；
- 本地照片右上角有「删除」，需要二次确认；删除后同步从 IndexedDB 移除；
- 网站自带的示例照片也支持删除（二次确认），删除记录保存在 `localStorage`；页面底部会出现「恢复示例照片」，可一键恢复；
- 上传到任意省份后，地图会自动为该省份生成/更新「名称 + 照片数量」标签；即使这个省份原本没有示例数据，也会出现标签，例如「浙江 1」；顶部站数和照片总数会同步更新；
- 面板顶部有「上传照片」入口：选择图片后会立即出现在当前省份下方，并保存在当前浏览器的 IndexedDB 中，刷新后仍在；换设备/浏览器或清理站点数据后不会同步。真正多端持久化需要后端或对象存储；
- 数据省份在 `src/data/site.ts` 的 `archiveProvinces` 中配置；照片放在 `public/images/archive/`。

地图路径由 `data/china-provinces.geojson`（DataV 中国省份数据）生成。更新地图数据后运行：

```bash
python scripts/build_china_map.py
```

这会重新生成 `src/data/chinaMap.ts`（1000×640 viewBox）。

当前 10 张照片和文案都是**示例素材**，请换成自己的照片和真实经历；如果新增省份，只要在 `archiveProvinces` 中补一条，地图会自动出现对应的可点击区域和标签。

---

## 替换素材

| 素材          | 位置                                | 建议规格                                              |
| ------------- | ----------------------------------- | ----------------------------------------------------- |
| 项目封面      | `public/images/work-*.jpg`          | 宽幅 2400×1333，竖版 1800×2175                        |
| 首页背景      | `public/images/hero-shanghai.webp`  | 1279×1706 以上；竖版或横版均可，CSS 会按 `cover` 裁切 |
| About Me 图片 | `public/images/about-portrait.webp` | 900×1125（4:5）；当前使用你提供的苏州东方之门照片     |
| 慢档案照片    | `public/images/archive/*.webp`      | 1200×800（3:2）最稳；照片文字在 `archiveProvinces` 中 |
| 分享图        | `public/images/work-inspect.jpg`    | 1200×630 更佳，可在 `index.html` 修改                 |

项目封面的可编辑源文件在 `docs/artboards/*.html`，重新渲染：

```bash
python scripts/render_covers.py
```

需要本机安装 Chrome；如路径不同，设置环境变量 `CHROME_PATH`。

首页背景图的裁切位置在 `src/styles/global.css` 的 `.hero__image` 中（`object-position: 50% 38%`）。当前使用的是你提供的上海三件套夜景，已转为约 373KB 的 WebP。

---

## 字体

中文使用思源黑体 / 思源宋体子集，数字与英文使用 DIN Next LT Pro；首页 TechText 标题的中文行使用 Ma Shan Zheng（SIL OFL）子集。当前 subset 只包含站内已出现的字符（黑体约 185KB、宋体约 242KB、手写体约 8KB）。

手写中文行的字符集在 `scripts/subset_fonts.py` 的 `BRUSH_TEXT` 中，改标题后同步修改并重新生成；字体许可见 `public/fonts/OFL-MaShanZheng.txt`。

```bash
python scripts/subset_fonts.py
```

该脚本读取本机 Windows 字体（Noto Sans SC、Noto Serif SC、DIN Next LT Pro）与 `docs/fonts/MaShanZheng-Regular.ttf`，需要 Python、fonttools 与 brotli。如果换机器或没有这些字体，可以把 `src/styles/global.css` 里的 `@font-face` 指向完整字体，或扩大子集字符范围。

> 素材生成脚本（封面 / 字体）都需要 Python 及对应依赖：Pillow、fonttools、brotli。它们只用于制作素材，不是运行网站的必需项。

---

## 首页标题 / TechText

首页标题使用 [React Bits](https://reactbits.dev) 的 **TechText**（TypeScript + CSS），源码在：

- `src/components/TechText.tsx`
- `src/components/TechText.css`

为了实现「Hi，这里是」单独一行、`W` 单独一行的效果，使用了两个实例：

1. 第一行 `Hi，这里是` — DIN + Ma Shan Zheng 字体栈，带 idle sweep；
2. 第二行 `W` — Ma Shan Zheng 手写体，静态。

交互：鼠标移到字母上会从实心变为虚线描边，字母可拖动、点击会弹跳；字体、字号、行高在 `src/components/Hero.tsx` 与 `src/styles/global.css` 的 `.hero__tech-line` 中调整。没有新增第三方依赖。

---

## 两侧 Glimmer Wrap

官方 React Bits Pro 的 **Glimmer Wrap** 通过授权 registry 分发，需要 `components.json` 和 `REACTBITS_LICENSE_KEY`。当前项目不是 shadcn/Tailwind 结构，环境里也没有配置 license key，所以无法通过 `npx shadcn@latest add @reactbits-starter/glimmer-wrap-tw` 安装官方源码。

为了让 01 / 02 / 03 两侧不再全黑，新增了一个自研的等价背景：

- `src/components/GlimmerWrap.tsx`
- `src/components/GlimmerWrap.css`

实现要点：

- Canvas 2D 绘制的稀疏细闪点，缓慢横向漂移，按长周期（10–26 秒）各自“接住光”；
- 以暖白为主，少量冷白与粉调，没有彩虹色、没有快速闪烁；
- 固定全屏层，用内容感知的左右 mask 只填 1700px 版心之外的侧边，中间保持干净；
- 左右位置、亮度与漂移方向完全镜像，保证对称；
- 1024px 以下隐藏；`prefers-reduced-motion` 下只渲染静态帧；
- 无额外依赖。

在更宽的屏幕上（例如 2560px）两侧各约 430px 会被填满；在 1700px 屏幕上只剩版心外的 64px 边缘带，所以效果会比较克制。如果后续提供 license key，可以安装官方组件并替换 `GlimmerWrap` 的实现。

---

## Smooth Cursor

官方 React Bits Pro 的 **Smooth Cursor** 同样通过授权 registry 分发，需要 `components.json` 和 `REACTBITS_LICENSE_KEY`；当前环境没有配置，所以使用自研实现：

- `src/components/SmoothCursor.tsx`
- `src/components/SmoothCursor.css`

实现内容：

- 光标精确位置是一颗象牙白小点，带深色描边，深色/浅色按钮上都可见；
- 外围粉色圆环用弹簧阻尼跟随光标，移动时有轻微延迟和回弹；
- 圆环后方保留 24 个采样点，绘制一条逐渐变细、变淡的粉色轨迹；
- 悬停链接、按钮、TechText、卡片时圆环放大；按下时缩小；
- `pointer: fine` 才启用，并隐藏原生光标；触摸设备和 `prefers-reduced-motion` 下保留原生光标；
- 全屏 canvas `pointer-events: none`，不阻挡点击或 TechText 拖动；`z-index: 1000` 位于 grain、导航和弹窗之上；
- 无额外依赖。

---

## 部署

构建：

```powershell
# Windows PowerShell（推荐）
corepack.cmd pnpm@10 build

# 已经装好 pnpm
pnpm build
```

然后把 `dist/` 部署到任意静态托管（Vercel / Netlify / Cloudflare Pages / 对象存储）。

如果部署在子路径（如 GitHub Pages 的 `/repo/`）：

```powershell
# Windows PowerShell：先设置环境变量，再构建
$env:BASE_URL="/repo/"
corepack.cmd pnpm@10 build
Remove-Item Env:BASE_URL
```

macOS / Linux：

```bash
BASE_URL=/repo/ pnpm build
```

---

## 关于简历与当前内容（重要）

你的简历 `王迧-简历5.pdf` 是 **嵌入式 / 软件方向**（武汉理工大学硕士、机器视觉检测、RK3588/FPGA、Qt/C++），与你现在的「基带软件开发工程师 / 上海」身份一致。

当前处理方式：

- **真实信息**：姓名、邮箱、电话来自简历；现居上海、基带软件开发工程师身份来自你的说明。
- **About Me 图片**：已换成你提供的苏州东方之门照片；后续替换 `public/images/about-portrait.webp` 即可。
- **慢档案**：地图中的 7 个省份、10 张照片和文案目前是示例；上海/武汉/滕州的叙事来自你的城市与简历项目，其余是示例旅行片段。照片一部分来自 Picsum（Unsplash）示例图，一张雨夜车窗为生成图；请全部替换成你自己的照片和真实经历。
- **本地照片上传**：入口会把图片保存在当前浏览器的 IndexedDB 中，刷新后仍在；换设备/浏览器不同步，真正云端保存需要后端/对象存储，当前静态站点没有该能力。
- **项目来源**：INSPECT / LINK / DRIVE 的内容来自简历中的真实项目（工业视觉检测、RK3588/FPGA PCIe、车载硬件）；PORTFOLIO 是本站本身。导航中的「快生活」指向这组项目。
- **封面是概念稿**：四张封面为这版网站单独设计的视觉稿，不是真实系统截图；请替换成你的项目截图或界面图。
- **累计访问人数是本机的**：没有后端，统计的是当前浏览器的访问次数，不代表全站真实人数；如果要做全站统计，需要接第三方统计服务或后端。
- 请把真实项目图与更完整的项目信息发我，或在 `src/data/site.ts` 中替换。

---

## 已知边界 / 下一版可做

- 目前按 PC 端设计，移动端做了基础适配（无汉堡菜单）。
- 项目详情用弹窗呈现，没有独立案例页 / 路由。
- 没有后台，内容为静态数据；照片上传保存在当前浏览器的 IndexedDB 中，不适合做真正的云端相册。
- 后续可以根据你提供的真实项目、截图或参考站，继续调整版式、动效节奏与内容。