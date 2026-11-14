# 培正娘 Live2D / EmoteLab 模型

广州培正学院拟人角色「培正娘」的 Spine 4.3 模型工程。模型复用 EmoteLab 官方 CoffeeBean 骨架、表情与 312 条动画，外观部分全部独立绘制：砖红双马尾、紫瞳、钟楼贝雷帽、紫花与红领结。

## 预览

| 生气 | 笑 | 害羞 |
| --- | --- | --- |
| ![生气](preview/angry.gif) | ![笑](preview/laugh.gif) | ![害羞](preview/shy.gif) |

| 打招呼 | 眨眼 | 爱心 |
| --- | --- | --- |
| ![打招呼](preview/wave.gif) | ![眨眼](preview/wink.gif) | ![爱心](preview/heart.gif) |

## 在线预览

- 公网：http://39.108.93.52:10006/

完整 239 张表情、搜索、分类、点赞与 ZIP 下载都在网页里。

## 角色设定

- 发色：砖红 `#D14B57`，双马尾加侧发，发尾系深蓝缎带
- 瞳色：浅紫 `#B39DDB`
- 帽饰：深蓝贝雷帽，帽檐红白蓝条纹，正面校徽，侧边简化钟楼与紫色小花
- 服装：深蓝制服外套、奶油白马甲与衬衫、红领结、红白格纹裙摆
- 构图：正面站姿，双手独立，裙摆下露出双腿

## 制作工艺

### 1. 母版

母版为 `1254 × 1254` 透明 PNG，见 [master/P1-master-no-hands.png](master/P1-master-no-hands.png)。

- 身体底图完整，不含固定手势，双手与活动袖口单独绘制
- 保留肩袖根、外套边缘与马甲，方便手臂旋转时遮挡
- 母版同时提供 `master/01-neutral.png`、`master/02-wave.png`、`master/03-parts-study.png` 三张拆件参考

### 2. 部件拆分

外观拆成 10 个独立部件，全部放在 `art/`，每个部件同时提供 SVG 源稿与透明 PNG：

| 部件 | 说明 |
| --- | --- |
| `hat` | 贝雷帽、校徽、钟楼、小花 |
| `bangs` | 刘海 |
| `side_L` / `side_R` | 左右侧发 |
| `temple_L` / `temple_R` | 左右鬓发，右侧为双瓣发梢 |
| `tail_L` / `tail_R` | 左右双马尾 |
| `body` | 制服、马甲、领结、手臂 |
| `skirt` | 格纹裙摆 |
| `leg_L` / `leg_R` | 左右腿 |

`art/bounds.json` 记录每个部件在 480 坐标系中的矩形范围，顺序为左、上、右、下。模型内部按约 3 倍贴图坐标使用。

### 3. 素材绘制与导出

- `tools/draw.cjs` 用 SVG 路径绘制初始素材，输出 3 倍尺寸 PNG
- 手绘修改直接编辑 `art/*.png`；修改 SVG 后需要重新导出同名 PNG
- 画布扩展时同步更新 `bounds.json`，否则打包会报尺寸不一致
- 手绘 PNG 之后不要再运行 `draw.cjs`，它会覆盖手绘结果

### 4. Spine 4.3 骨架与网格

- 官方骨架：EmoteLab `CoffeeBean` 模型，312 条动画
- 自定义附件：14 个 `MeshAttachment`，对应 10 个独立素材
- 每个自定义网格 9 个顶点、8 个三角形，UV 映射到独立图集页
- 头发按官方骨链绑定：`FrameHair_Left1..3`、`FrameHair_Right1..3`、`PonytailC_Left1..3`、`PonytailC_Right1..3`
- 帽子、刘海、侧发、鬓发、马尾、身体、裙摆、双腿都有独立 slot 与绘制顺序
- `tools/rebind.cjs` 以二进制方式重写 `PeizhengHairMotion.skel.bytes`，保留官方动画与骨骼，只替换 attachment，避免重新导出整个工程

关键约束：

- Spine 4.3 中 `attachment.region` 恒为 `null`，纹理要从 `attachment.sequence.regions` 读取
- `ClippingAttachment` 必须处理，否则刘海和眼睛遮罩会变成矩形色块
- 染色时保留图集页 alpha，缓存 key 必须包含图集页身份
- `clipTrianglesUnpacked()` 返回 `false` 可能表示无需裁剪，不能据此丢弃完整网格

### 5. 表情与动画

- 官方表情、眼睛、嘴型、手势与 312 条动画全部保留
- 动画列表中 `ANIM/` 前缀的 239 条会显示在 EmoteLab 动画面板
- `DisplayInfo/Animations.csv` 为这 239 条动画提供中文显示名，字段为 `AnimationName,DisplayName,zh-Hans`
- 动画名称对照见 [docs/动画名对照表.md](docs/动画名对照表.md)

### 6. EmoteLab 接入

模型目录复制到 `Documents\EmoteLab\SpineModels\PeizhengHairMotion`，角色目录为 `Documents\EmoteLab\Characters\PeizhengHairMotion\培正娘`。

必需皮肤会自动补齐：

- `B_HairFront/BaseHair`
- `G_Outfit/Hand`
- `G_Outfit/Leg`
- `A_FacialFeatures/Eye`
- `G_Outfit/OutfitInner`

### 7. 导出

- 尺寸 `240 × 240`
- 帧率 `33.3 fps`，GIF 每帧 `30 ms`
- 使用 EmoteLab「场景列表 → 导出所有场景」批量导出
- 校验脚本：`tools/verify-export.py`

## 目录结构

```text
Live-2D/
├── art/                  # 10 个部件的 SVG 源稿与 PNG
│   └── bounds.json       # 部件矩形范围
├── model/                # Spine 4.3 模型资源
│   ├── PeizhengHairMotion.json
│   ├── PeizhengHairMotion.skel.bytes
│   ├── PeizhengHairMotion.atlas.txt
│   ├── PZ_*.png          # 自定义部件图集页
│   └── CoffeeBean*.png   # EmoteLab 官方图集页（16 张）
├── tools/                # 构建、重绑定、渲染与打包脚本
│   ├── build.py
│   ├── rebind.cjs
│   ├── render.mjs
│   ├── draw.cjs
│   ├── build-displayinfo.py
│   ├── verify-export.py
│   └── Pack-Art.ps1
├── docs/                 # 打包教程与动画名对照
│   ├── PACKING.md
│   └── 动画名对照表.md
├── master/               # 母版与拆件参考图
└── preview/              # README 示例 GIF
```

## 工具链

| 工具 | 用途 |
| --- | --- |
| `build.py` | 从 `art/*.png` 生成自定义图集页与 `PeizhengHairMotion.atlas.txt` |
| `rebind.cjs` | 二进制重写骨架，替换 attachment，保留官方动画 |
| `render.mjs` | 离线渲染与 GIF 导出，支持 `--all-emotes`、`--size`、`--fps`、`--supersample`、`--zoom` |
| `Pack-Art.ps1` | 一键打包素材并同步到 EmoteLab 模型目录 |
| `build-displayinfo.py` | 生成 239 条动画中文名表 |
| `verify-export.py` | 校验 GIF 数量、尺寸、帧延迟与可解码性 |

打包命令：

```powershell
Set-Location -LiteralPath '.\tools'
pwsh -NoProfile -File .\Pack-Art.ps1
```

只生成素材包、不安装到 EmoteLab：

```powershell
pwsh -NoProfile -File .\Pack-Art.ps1 -PackOnly
```

## 已知限制

- Bongo 系列动画的桌子在离线渲染器中只显示一条黑线，EmoteLab 原生导出正常
- 官方 CoffeeBean 图集页来自 EmoteLab 安装包，仅用于本地模型与学习，不随本仓库再分发授权
- 离线渲染器与 EmoteLab 原生导出在边缘抗锯齿上存在差异，正式发布建议使用 EmoteLab 原生批量导出

## 作者声明

本项目为个人学习与社团展示用途。角色「培正娘」是广州培正学院的拟人化同人创作，与学校官方无关。EmoteLab / CoffeeBean 的骨架、动画与官方图集版权归 GlycoProduction 所有，本项目仅保留自绘外观、工程脚本与文档。请勿将本项目用于商业贩卖或二次售卖。

## 致谢

- 骨架与动画：EmoteLab / GlycoProduction CoffeeBean
- 工具链参考：EmoteLab 官方文档、spine-canvas runtime
