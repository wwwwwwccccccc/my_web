# 王迧 · 个人作品集网站

基带软件开发工程师，现居上海。暗色、编辑感的个人作品集，React + Vite，PC-first，版心最大 1700px。

当前为 **v1 可运行版本**：全屏影像首页、About Me、慢档案地图、快生活、结尾一句话；包含 TechText 标题、图片缓慢漂移、项目详情弹窗、Cloudflare 全站累计访问、本地时间等细节。

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

### 环境要求

- Node.js **20.19+ 或 22.12+**（Vite 7 要求；建议 Node 22 LTS，本项目在 Node 24 下验证）
- 包管理器：**pnpm 11**（仓库自带 `pnpm-lock.yaml`，不要用 npm 生成新的 lockfile）

### Windows PowerShell（推荐，不需要全局安装 pnpm）

```powershell
# 第一次：安装依赖
corepack.cmd pnpm@11 install

# 开发
corepack.cmd pnpm@11 dev
# http://127.0.0.1:5174/ 或 http://localhost:5174/

# 类型检查 + 生产构建
corepack.cmd pnpm@11 build

# 本地预览生产构建
corepack.cmd pnpm@11 preview
# http://127.0.0.1:4173/
```

`corepack.cmd pnpm@11 ...` 是 Node 自带的 Corepack 用法：它会下载并运行 pnpm 11，**不依赖全局 `pnpm` 命令**，也不会碰到 PowerShell 禁止运行 `pnpm.ps1` 的问题。第一次运行需要联网下载 pnpm。

> 如果 Node 安装不完整、连 `corepack` 也没有，可以先执行 `npm.cmd install -g pnpm@11`，然后统一使用 `pnpm.cmd` 运行下面的命令。

### macOS / Linux

```bash
corepack pnpm@11 install
corepack pnpm@11 dev
corepack pnpm@11 build
corepack pnpm@11 preview
```

### 已经安装好 pnpm 的情况

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

技术栈：React 19、TypeScript、Vite 7、ogl（FlexCarousel WebGL 轮播）。无 UI 框架、无动画库，其余动效由 CSS + IntersectionObserver 实现。

---

## 页面结构

导航：**首页 / 慢档案 / 快生活**。

| 模块         | 内容                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Hero         | 上海夜景全屏背景、TechText 标题「Hi，这里是 / W」、OPEN TO OPPORTUNITIES、上海坐标/当地时间；已移除中部介绍文字与 CTA |
| About Me | 人像/城市图 + 自我介绍、当前身份、电话、邮箱、标签（嵌入式 / LTE） |
| 慢档案     | 中国省份地图 + 右侧照片面板；点击省份展开照片和文字；上传入口仅站点本人可见 |
| 快生活     | FlexCarousel 水平 WebGL 轮播：INSPECT / LINK / DRIVE / PORTFOLIO；每个项目图下方显示项目名，点击中心卡片打开详情 |
| 结尾         | 一句话「欢迎你来参观我的生命一角」+ 回到顶部，不再有整屏联系模块；它位于 folio 之外，01/02 切换不影响它 |

慢档案与快生活现在位于同一个 **100svh 水平 folio** 中：页面不再把 01/02 纵向堆叠，点击导航 01/02，或点击右侧不显眼的圆形箭头，会横向滑动切换；每个 panel 内部可独立纵向滚动。移动端导航隐藏，使用右下角的 `01 / 02` 箭头切换。

右上角的「累计访问次数」由 Cloudflare Pages Function `/api/visit` 和 D1 数据库统计全站访问次数；悬停或点击只显示数字，不再展开本机访问面板。具体部署步骤见下文「Cloudflare 全站访问次数」。

---

## 修改内容

所有文案、项目、关于我与档案内容都集中在：

```
src/data/site.ts
```

- `profile`：姓名、身份（基带软件开发工程师）、城市、邮箱、电话、脱敏电话、标签（嵌入式 / LTE）、坐标
- `archiveProvinces`：慢档案的 7 个省份、简介和照片（含照片说明/日期/地点）
- `src/data/chinaMap.ts`：由 `data/china-provinces.geojson` 生成的中国省份 SVG 路径
- `projects`：项目列表（标题、分类、年份、标签、封面、简介、详情、职责/周期/交付）
- `navItems`：导航

修改后页面会自动热更新。

---

## 01 / 02 横向切换

- `src/components/Folio.tsx` 把慢档案和快生活放进一个 100svh 高的水平轨道；
- 点击导航「慢档案 / 快生活」会滚动到 folio 并切换对应 panel；
- 右侧中部有一个低对比度的圆形箭头和 `01 / 02` 计数，点击即可左右切换；
- 切换时用 `translateX` 滑动，当前 panel 会重置到顶部；
- 两个 panel 各自内部纵向滚动，因此 02 的轮播和项目信息不会再把整个页面拉长；
- 移动端导航隐藏，切换器移到右下角（`01 / 02` + 箭头）；
- 非当前 panel 使用 `inert` / `aria-hidden`，不会抢键盘焦点。

---

## 快生活轮播（FlexCarousel）

02 的内容现在是 React Bits 的 **FlexCarousel**，使用 `ogl` 在 WebGL2 中绘制弯曲的图片轨道：

- 组件源码：`src/components/FlexCarousel.tsx`
- 样式：`src/components/FlexCarousel.css`
- 依赖：`ogl`（已在 `package.json`）
- 数据来自 `projects`，封面按自然宽高比排列；项目数量会自动进入轮播和 `xx PROJECTS` 计数；
- 支持横向拖动、横向滚轮、触控板、← → 方向键；
- 自动轮播：以约 32px/s 的速度**连续缓慢滚动**，不是每隔几秒跳一张；鼠标悬停、键盘聚焦或交互后暂停，离开后恢复；
- 鼠标悬停在卡片上时，卡片外围出现一圈低对比度边框，并做缓慢的明暗“扇动”；
- 点击任意项目卡片会打开项目详情卡（`focusOnClick={false}` + `selectAnyClick` + `onSelect`）；
- `captureWheel={false}`：纵向滚轮不会被轮播吃掉，02 panel 仍可正常上下滚动；横向滚轮/触控板才移动轮播；
- 使用 `preset="liquid"`、`intro="rise"`、`cardHeight={0.64}`，卡片比最初版本放大约 23%；
- 在组件里增加了 `cardLabels` 扩展：每张卡片下方用 HTML 覆盖层显示对应项目名，随拖动/弯曲实时跟随（不再显示副标题小字）；
- 内置 `captions` 关闭，避免和自定义项目名重复；
- 轮播需要浏览器支持 **WebGL2**；不支持时该区域不会绘制卡片。

---

## 项目详情卡（02）

点击轮播中的任意项目图，会打开一个深色编辑感详情卡：

- 左边：项目封面图；
- 右边：`NO. 编号`、项目名、分类/年份胶囊、简介、项目背景、角色/周期/交付、技术标签和操作按钮；
- 颜色已按站点深色背景重新处理，而不是照搬参考图的米白纸卡；
- 组件：`src/components/ProjectDialog.tsx`
- 样式：`src/styles/global.css` 里的 `.project-sheet*`。

项目详情的内容都来自 `src/data/site.ts` 的 `projects`：

| 字段 | 显示位置 |
|---|---|
| `title` | 轮播下方项目名 + 详情卡大标题 |
| `subtitle` | 保留在数据里，当前不显示 |
| `summary` | 详情卡简介（第一段） |
| `description` | 详情卡正文段落（数组） |
| `facts` | 详情卡的角色 / 周期 / 交付行 |
| `tags` | 技术标签 |
| `category` / `year` | 胶囊、右上角 CASE 年份 |
| `cover` | 轮播封面 + 详情卡左侧图片 |
| `alt` | 图片替代文本 |
| `index` | `NO. 01` 编号 |
| `focus` | 图片 `object-position`，控制裁切位置 |

如果要改某一个项目的介绍，找到 `projects` 里对应的 `id`，改 `summary` 和 `description` 即可；封面图放在 `public/images/`，改 `cover` 路径。

### 添加一个新项目

1. 把封面图放进 `public/images/`，建议 WebP、1600px 宽左右，例如 `public/images/work-new.webp`。
2. 打开 `src/data/site.ts`，在 `projects` 数组末尾加一个项目对象：

```ts
{
  id: 'new-project',
  index: '05',
  title: 'NEW PROJECT',
  subtitle: '项目副标题',
  category: 'Embedded / C++',
  year: '2026',
  tags: ['C / C++', 'Linux', 'STM32'],
  cover: '/images/work-new.webp',
  alt: '项目封面描述',
  summary: '一句话项目简介，会显示在详情卡开头。',
  description: [
    '第一段背景。',
    '第二段实现、职责或结果。',
  ],
  facts: [
    { label: '角色', value: '主要负责人' },
    { label: '周期', value: '2026.01 — 2026.03' },
    { label: '交付', value: '固件 / 上位机 / 测试' },
  ],
  layout: 'feature',
  focus: '50% 50%',
}
```

3. 保存后：
   - 轮播会自动出现新卡片，名称来自 `title`
   - `xx PROJECTS` 数量自动更新
   - 点击卡片自动打开详情卡，内容来自这个对象
   - 详情卡左侧图片使用 `cover`

注意事项：

- `projects` 的数组顺序就是轮播顺序；插在中间要同步调整后面项目的 `index`，尾插直接用 `05`。
- 顶部「年份范围 / 项目数量」会自动从 `projects[].year` 和数组长度计算，不需要手改。
- `id` 保持唯一且稳定，建议用英文短横线。
- `subtitle` 目前详情卡不显示，保留作数据字段。
- `cover` 必须真实存在，否则轮播和详情卡会显示裂图。
- `focus` 控制详情卡左侧图片裁切位置，例如 `'62% 50%'`。
- `layout` 是旧字段，当前轮播不依赖它；保留任意合法值即可。
- 完成后 `npm.cmd run dev` 会自动热更新；生产预览需要重新 `npm.cmd run build`。

当前项目封面映射：

- `01 INSPECT` → `work-inspect.webp`
- `02 LINK` → `work-link.webp`
- `03 DRIVE` → `work-drive.webp`
- `04 PORTFOLIO` → `work-portfolio.webp`

---

## 慢档案地图

慢档案章节现在是一张中国省份地图 + 右侧照片面板：

- 点击省份或地图上的名称标签，右侧面板才切换到该省份的照片；悬停不做任何切换；
- 键盘可以先聚焦省份，再按 Enter / Space 切换；
- 有照片的省份用紫色底和粉色名称标签标出，当前省份高亮为粉色；照片数量为 0 的省份不显示名称标签，也不着色；
- 没有照片的省份会显示「这一站，还没有归档」的空状态；
- 右侧面板可独立滚动，照片下方只显示日期、地点和标题，不再展示说明小字；
- 双击照片或点击照片右上角的「放大」可以打开大图；大图内再次双击图片可以退出；大图只显示日期、标题和描述，文件夹/本机位置小字已去掉；
- 大图里的照片日期和描述可由站点本人在 owner 模式下编辑；
- 本地照片右上角有「删除」，需要二次确认；删除后同步从 IndexedDB 移除；
- 网站自带的示例图也已经放进对应省份文件夹；从文件夹删除文件即可移除，页面不提供示例图的单独删除按钮；
- 上传到任意省份后，地图会自动为该省份生成/更新「名称 + 照片数量」标签；即使这个省份原本没有示例数据，也会出现标签，例如「浙江 1」；顶部站数和照片总数会同步更新；
- 面板顶部的「上传照片」入口仅在站点本人（owner 模式）下显示：选择图片后会立即出现在当前省份下方，并保存在当前浏览器的 IndexedDB 中，刷新后仍在；普通访客看不到入口，也无法触发上传；
- 省份简介、示例图标题/日期等元数据在 `src/data/site.ts` 的 `archiveProvinces` 中配置；所有照片文件都在 `src/assets/province-photos/<省份>/`。

### 省份文件夹批量照片

除了网页上传，也可以把照片直接放进本地省份文件夹：

```text
src/assets/province-photos/山东/第一次去青岛.jpg
src/assets/province-photos/四川/成都-01.jpg
```

- 34 个省级目录已经创建好，目录名固定为：北京、天津、河北、山西、内蒙古、辽宁、吉林、黑龙江、上海、江苏、浙江、安徽、福建、江西、山东、河南、湖北、湖南、广东、广西、海南、重庆、四川、贵州、云南、西藏、陕西、甘肃、青海、宁夏、新疆、台湾、香港、澳门。
- 支持 jpg / jpeg / png / webp / avif；文件名会作为照片标题。
- 开发服务器运行期间复制文件，页面会自动刷新；切到对应省份即可看到新照片。
- 照片会自动参与省份数量、地图标签、站数和照片总数统计；原本没有示例数据的省份也会出现标签和可点击区域。
- 示例图也已经放进对应省份文件夹；同一省份内按文件名排序。
- 文件夹照片不提供网页内删除；从文件夹移除文件、刷新后即可消失。
- 部署前重新 `build`，`dist/` 才会包含新照片。
- 不要把照片只放进 `dist/images/`；`dist` 是构建产物，会被覆盖。

扫描逻辑在 `src/data/folderPhotos.ts`，文件夹说明见 `src/assets/province-photos/README.md`。

### 本人编辑模式

大图里的日期、标题和描述默认只读。站点本人可以临时打开编辑：

```text
http://127.0.0.1:5174/?owner=1
```

- 地址里的 `owner=1` 会写入当前浏览器的 `localStorage`，随后普通地址也会保留编辑按钮和上传入口；
- 关闭：

```text
http://127.0.0.1:5174/?owner=0
```

- 文件夹照片的修改写入当前浏览器的 `localStorage`，不修改源文件；换浏览器或清理站点数据后会恢复为源文件里的内容；
- 上传照片的修改继续写入 IndexedDB；
- 普通访客没有编辑按钮。

这是一个纯静态站点，`?owner=1` 不是服务器鉴权；知道这个参数的人也能开启本机编辑。如果要做真正的多人/远程权限控制，需要后端登录和数据库。

地图路径由 `data/china-provinces.geojson`（DataV 中国省份数据）生成。更新地图数据后运行：

```bash
python scripts/build_china_map.py
```

这会重新生成 `src/data/chinaMap.ts`（1000×640 viewBox）。

当前示例图和文案都是**示例素材**，请换成自己的照片和真实经历；示例图已经按省份放进 `src/assets/province-photos/`，新增省份时在 `archiveProvinces` 中补一条简介，再把照片放进同名文件夹。

---

## 替换素材

| 素材          | 位置                                | 建议规格                                              |
| ------------- | ----------------------------------- | ----------------------------------------------------- |
| 项目封面      | `public/images/work-*.webp`         | 1600px 宽；原 JPG 保留给分享图                        |
| 首页背景      | `public/images/hero-shanghai.webp`  | 1279×1706 以上；竖版或横版均可，CSS 会按 `cover` 裁切 |
| About Me 图片 | `public/images/about-portrait.webp` | 900×1125（4:5）；当前使用你提供的苏州东方之门照片     |
| 慢档案照片    | `src/assets/province-photos/省份/`  | 任意尺寸；文件名作为标题，元数据在 `archiveProvinces` 中 |
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

## Cloudflare 全站访问次数

前端只请求同源接口：

```text
POST /api/visit
→ { "count": 1234 }
```

接口文件：`functions/api/visit.js`  
数据库迁移：`migrations/0001_visits.sql`

### 1. 创建 D1 数据库

```powershell
npx wrangler@latest login
npx wrangler@latest d1 create portfolio-visits
```

记下返回的 `database_id`。

### 2. 建表

```powershell
npx wrangler@latest d1 execute portfolio-visits --remote --file=./migrations/0001_visits.sql
```

### 3. 绑定到 Pages 项目

在 Cloudflare Dashboard：

```text
Workers & Pages → 你的 Pages 项目
→ Settings → Functions → D1 database bindings
→ 添加 VISITS_DB，选择 portfolio-visits
```

或者把 `wrangler.toml.example` 复制为 `wrangler.toml`，填入真实 `database_id`。

### 4. 重新部署

如果使用 Git 集成：提交并 push，`functions/` 会随 Pages 构建一起部署。

如果当前项目是 Direct Upload，Pages Functions 不一定会随 `dist/` 一起上传。请改成 Git 集成，或者把同一个接口部署成 Cloudflare Worker 并绑定到 `/api/visit`。不要只上传 `dist/` 后期待 `/api/visit` 自动存在。

如果用 Wrangler 且确认 Functions 已包含，可以重新上传：

```powershell
npm.cmd run build
npx wrangler@latest pages deploy dist --project-name=你的项目名
```

### 5. 验证

```powershell
curl.exe -X POST https://你的域名/api/visit
```

应该返回：

```json
{ "count": 1 }
```

每刷新一次页面加 1，导航栏会显示全站累计访问次数。悬停或点击不再展开面板。

注意：

- 本地 `vite preview` 没有 Cloudflare Function，右上角会显示 `—`，这是正常的；以线上 Pages 地址为准。
- 统计的是**访问次数（页面加载）**，不是去重人数；刷新页面也会加 1。
- 公开 POST 接口可能被脚本刷量；需要的话可在 Cloudflare 加 Rate Limiting 或 Turnstile。
- Pages Functions 必须位于项目根目录的 `functions/`，不要放进 `dist/`。

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

```powershell
# Windows PowerShell：先设置环境变量，再构建
$env:BASE_URL="/repo/"
corepack.cmd pnpm@11 build
Remove-Item Env:BASE_URL
```

macOS / Linux：

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

## 已知边界 / 下一版可做

- 目前按 PC 端设计，移动端做了基础适配（无汉堡菜单）。
- 项目详情用弹窗呈现，没有独立案例页 / 路由。
- 没有后台，内容为静态数据；照片上传保存在当前浏览器的 IndexedDB 中，不适合做真正的云端相册。
- 后续可以根据你提供的真实项目、截图或参考站，继续调整版式、动效节奏与内容。