export type Project = {
  id: string
  index: string
  title: string
  subtitle: string
  category: string
  year: string
  tags: string[]
  cover: string
  alt: string
  summary: string
  description: string[]
  facts: { label: string; value: string }[]
  layout: 'feature' | 'tall' | 'wide'
  focus?: string
}

export const profile = {
  name: '王迧',
  nameEn: 'WANG',
  role: '基带软件开发工程师',
  roleShort: 'Baseband Software Engineer',
  city: '上海，中国',
  cityEn: 'Shanghai, China',
  email: '1148327574@qq.com',
  phone: '15884117277',
  phoneHref: '15884117277',
  phoneMasked: '158****7277',
  wechat: '15884117277',
  tags: ['嵌入式', 'LTE'],
  availability: '2026—27 开放合作',
  coordinates: '31.23°N / 121.47°E',
}

export const projects: Project[] = [
  {
    id: 'inspect',
    index: '01',
    title: 'INSPECT',
    subtitle: '工业视觉检测系统',
    category: 'Industrial Vision / C++',
    year: '2024',
    tags: ['C++ / Qt', 'OpenCV', '多线程', '机器视觉'],
    cover: '/images/work-inspect.webp',
    alt: '四路相机监控画面与缺陷标记界面',
    summary:
      '为拉挤板材产线做在线缺陷检测：四路相机、1 fps 采集、缺陷识别与自动标记，替代人工目检。',
    description: [
      '产线上的缺陷检测原本依赖人工目检，效率低、易漏检，也容易受主观判断影响。这个系统把相机采集、图像处理和执行机构控制串成一条实时链路。',
      '我用 Qt 搭建上位机界面，用 QThread 让界面线程与四路相机处理线程并行，保证相机按每秒 1 帧采集并及时处理；识别出的缺陷坐标经自定义串口协议下发给 STM32，由舵机与步进电机完成标记，同时写入本地文件。',
    ],
    facts: [
      { label: '角色', value: '主要负责人' },
      { label: '周期', value: '2023.10 — 2024.01' },
      { label: '交付', value: '上位机 / 通信协议 / 现场调试' },
    ],
    layout: 'feature',
    focus: '62% 50%',
  },
  {
    id: 'link',
    index: '02',
    title: 'LINK',
    subtitle: '异构算力高速传输',
    category: 'Systems / Linux',
    year: '2023',
    tags: ['RK3588', 'FPGA', 'PCIe', 'Linux 驱动'],
    cover: '/images/work-link.webp',
    alt: 'LINK 异构算力高速传输：RK3588 与 FPGA 之间的 PCIe 链路示意',
    summary:
      '在 RK3588 与 FPGA 之间打通 PCIe 2.0 x2 高速链路，完成内核裁剪、设备树修改、驱动移植与速度测试。',
    description: [
      '项目目标是在 RK3588 与 FPGA 之间建立稳定的 PCIe 高速传输通道。我从系统移植开始：用 menuconfig 裁剪内核、把 Ubuntu 移植到 RK3588 平台，保证系统能正常启动。',
      '随后阅读原理图与手册，修改 PCIe 控制器相关的设备树节点（phy、pcie2.0、pcie3.0、pinctl），移植开源 Riffa 驱动并编写测试用例，完成 PCIe 2.0 x2 lane 的通信速度测试与板卡功耗记录。',
    ],
    facts: [
      { label: '角色', value: '主要负责人' },
      { label: '周期', value: '2023.09 — 2023.10' },
      { label: '交付', value: '系统移植 / 驱动 / 测试报告' },
    ],
    layout: 'tall',
    focus: '50% 35%',
  },
  {
    id: 'drive',
    index: '03',
    title: 'DRIVE',
    subtitle: '车载冗余电源与诊断',
    category: 'Embedded / Automotive',
    year: '2023',
    tags: ['TMS570', 'CAN', '冗余电源', '硬件调试'],
    cover: '/images/work-drive.webp',
    alt: 'DRIVE 车载冗余电源与诊断：车载控制器、CAN 总线与冗余电源路径示意',
    summary:
      '参与数字胶轮车导向系统的冗余电源板设计与 TMS570 / RM57L 外设调试，配合完成工控机上车联调。',
    description: [
      '这是我在上海智能交通科技的实习项目，参与数字胶轮车导向系统的部分硬件模块设计与软件调试。',
      '我完成了冗余电源板卡的原理图绘制，测试 TI TMS570 与 RM57L 的定时器、串口、CAN 通信功能，并配合团队完成工控机上车调试，处理现场通信与供电问题。',
    ],
    facts: [
      { label: '角色', value: '嵌入式硬件实习生' },
      { label: '周期', value: '2023.06 — 2023.09' },
      { label: '交付', value: '原理图 / 板级测试 / 上车联调' },
    ],
    layout: 'tall',
    focus: '50% 45%',
  },
  {
    id: 'portfolio',
    index: '04',
    title: 'PORTFOLIO',
    subtitle: '个人作品集网站',
    category: 'Web / React',
    year: '2026',
    tags: ['React 19', 'TypeScript', 'Vite', 'CSS'],
    cover: '/images/work-portfolio.webp',
    alt: 'PORTFOLIO 个人作品集网站：代码编辑器与暗色首页预览',
    summary:
      '你正在看的这个站点：全屏影像首页、项目详情弹窗、响应式布局，动画与排版全部手写 CSS。',
    description: [
      '这个作品集本身也是一个项目。它使用 React 19 + TypeScript + Vite 构建，没有引入 UI 框架或动画库，滚动显现、图片漂移、项目弹窗都由原生 CSS 与 IntersectionObserver 实现。',
      '设计上刻意保持克制：深色底、单一强调色、DIN 与思源字体的组合；首页用一张上海夜景与手写标题建立记忆点，项目页则尽量让作品自己说话。',
    ],
    facts: [
      { label: '角色', value: '设计 & 开发' },
      { label: '周期', value: '2026' },
      { label: '交付', value: '前端 / 动效 / 部署' },
    ],
    layout: 'wide',
    focus: '50% 50%',
  },
]

export type ArchivePhoto = {
  id?: string
  src: string
  alt: string
  caption: string
  note: string
  date: string
  place: string
  local?: boolean
  folder?: boolean
}

export type ArchiveProvince = {
  code: string
  name: string
  region: string
  blurb: string
  photos: ArchivePhoto[]
}

export const archiveProvinces: ArchiveProvince[] = [
  {
    code: '310000',
    name: '上海',
    region: '华东',
    blurb: '现在住的地方。江风、加班后的路灯，和慢慢熟悉起来的街区。',
    photos: [
      {
        src: '/images/archive/shanghai-01.webp',
        alt: '上海陆家嘴三件套夜景',
        caption: '外滩的夜',
        note: '第一次带相机走到江边，风把三脚架吹得一直晃。',
        date: '2026.03',
        place: '上海',
      },
      {
        src: '/images/archive/shanghai-02.webp',
        alt: '雨夜车窗上的灯光',
        caption: '雨天的车窗',
        note: '加班结束，雨没有停。车窗外的灯被拉成一条一条的。',
        date: '2025.11',
        place: '上海',
      },
    ],
  },
  {
    code: '420000',
    name: '湖北',
    region: '华中',
    blurb: '读书的城市。东湖、轮渡，和毕业前最后一个夏天。',
    photos: [
      {
        src: '/images/archive/wuhan-01.webp',
        alt: '湖面上的薄雾与远山',
        caption: '东湖的风',
        note: '毕业前最后一次绕湖骑车，耳机里还是四年前那首歌。',
        date: '2025.06',
        place: '武汉',
      },
      {
        src: '/images/archive/wuhan-02.webp',
        alt: '渡轮内部的座位与顶灯',
        caption: '过江的轮渡',
        note: '从汉口到武昌，二十分钟，江面比想象中安静。',
        date: '2025.05',
        place: '武汉',
      },
    ],
  },
  {
    code: '370000',
    name: '山东',
    region: '华东',
    blurb: '第一次独自出差，第一次把代码放到产线上。',
    photos: [
      {
        src: '/images/archive/tengzhou-01.webp',
        alt: '夜晚的建筑连廊与灯光',
        caption: '第一次独自出差',
        note: '凌晨的车间、相机的补光灯，和一张改了七遍的参数表。',
        date: '2023.10',
        place: '滕州',
      },
    ],
  },
  {
    code: '530000',
    name: '云南',
    region: '西南',
    blurb: '没有日程的几天。风、山，和走累了就停下来的下午。',
    photos: [
      {
        src: '/images/archive/dali-01.webp',
        alt: '云层下的山脊与草地',
        caption: '大理的风',
        note: '没有日程的一天，沿着洱海走到太阳落下去。',
        date: '2024.10',
        place: '大理',
      },
      {
        src: '/images/archive/kunming-01.webp',
        alt: '清晨路边开满花的树',
        caption: '昆明的早晨',
        note: '转车前的两个小时，路边开满了不知名的花。',
        date: '2024.10',
        place: '昆明',
      },
    ],
  },
  {
    code: '440000',
    name: '广东',
    region: '华南',
    blurb: '出差路过。海风、夜宵，和短暂但明亮的几天。',
    photos: [
      {
        src: '/images/archive/shenzhen-01.webp',
        alt: '海面上的雾与远处海岸',
        caption: '深圳湾的傍晚',
        note: '出差最后一天，海面起雾，远处的桥只剩一条线。',
        date: '2024.06',
        place: '深圳',
      },
    ],
  },
  {
    code: '510000',
    name: '四川',
    region: '西南',
    blurb: '雨、茶馆，和一整段没有会议的时间。',
    photos: [
      {
        src: '/images/archive/chengdu-01.webp',
        alt: '雨雾中的水面',
        caption: '雨停之前',
        note: '成都的雨下了两天，索性在茶馆里把一本书看完。',
        date: '2023.05',
        place: '成都',
      },
    ],
  },
  {
    code: '110000',
    name: '北京',
    region: '华北',
    blurb: '转车停留。日落很长，城市很大。',
    photos: [
      {
        src: '/images/archive/beijing-01.webp',
        alt: '山脊上很长的日落',
        caption: '北方的傍晚',
        note: '转车路过北京，赶上了很慢、很长的一次日落。',
        date: '2024.03',
        place: '北京',
      },
    ],
  },
]

export const navItems = [
  { id: 'top', label: '首页', index: '00' },
  { id: 'archive', label: '慢档案', index: '01' },
  { id: 'works', label: '快生活', index: '02' },
]
