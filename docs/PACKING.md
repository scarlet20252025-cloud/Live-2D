# 培正娘 EmoteLab 打包教程

把这份说明交给另一个 AI 时，可以同时发给它工程目录或下面的绝对路径。任务是从当前手绘素材重新构建并更新现有角色「培正娘」。

## 直接运行

在本机 PowerShell 执行：

```powershell
Set-Location -LiteralPath 'E:/肥鱼不乐园/Codex111/Peizheng-CoffeeBean/HairMotion'
pwsh -NoProfile -File .\Pack-Art.ps1
```

默认会重建模型、生成 `Peizheng-art.zip`，然后同步到现有 EmoteLab 模型。只打包时使用 `pwsh -NoProfile -File .\Pack-Art.ps1 -PackOnly`。原来的 `-Install` 参数也可用。仅更新教程时使用 `-PackOnly` 刷新包内说明即可。

## 输入和构建顺序

1. **素材入口**为 `art/*.png`。直接使用当前 PNG，保留用户手绘修改。SVG 是可编辑源稿，改 SVG 后先导出同名透明 PNG。跳过 `draw.cjs`，因为运行它会重新生成 PNG 并覆盖手绘稿。
2. **坐标**由 `bounds.json` 管理。每项为 `[左, 上, 右, 下]`，单位是 480 设计画布的坐标。脚本允许任意 PNG 像素尺寸，会把整张贴图映射到当前坐标范围，不做尺寸拦截。扩画布且想维持原画面比例和位置时，请同步更新坐标。原稿按 3 倍绘制时，左边增加 18 个贴图像素对应 `左 -= 6`，下边增加 24 个贴图像素对应 `下 += 8`。左右按角色自身命名，`temple_R` 是屏幕左边的鬓发。
3. **`build.py`** 从独立 PNG 生成 `PZ_*.png` 图集页、`PeizhengHairMotion.atlas.txt` 和 `bindings.json`。构建使用本机原始 CoffeeBean 资源及已有槽位数据。
4. **`rebind.cjs`** 按 `bindings.json` 重建自定义网格，写出 `PeizhengHairMotion.skel.bytes`。贴图、图集文本和骨架应来自同一次构建，扩画布后尤其要一并更新。
5. **`Pack-Art.ps1`** 生成素材 ZIP，并按 SHA-256 比较、复制和核验 EmoteLab 安装目录中有变化的模型文件。

## 依赖与目录

- 用原工程目录运行脚本。需要 Python 与 Pillow、Node.js，以及安装了 Spine 运行库的 `emotelab-skill/scripts/headless/node_modules`。默认使用本机路径 `E:/肥鱼不乐园/emotelab-skill/scripts/headless/node_modules`，可用 `-NodeModules '实际路径'` 修改。
- 构建所需的相对路径还包括 `../Validated/official/`、`../Validated/bones.json` 和 `../pose.json`。
- `Peizheng-art.zip` 是素材包，包含 `art/`、`bounds.json`、打包脚本和这份说明。独立重建还需要上述工程文件和依赖。可加载的模型文件在工程的 `PeizhengHairMotion/` 子目录里。
- 脚本通过 Windows 的「文档」实际路径定位安装目录。这台电脑的模型目录是 `D:/文档/EmoteLab/SpineModels/PeizhengHairMotion`，现有角色配置是 `D:/文档/EmoteLab/Characters/PeizhengHairMotion/培正娘/培正娘.json`。更新现有模型即可，无需新增模型或角色条目。

## 验证更新

看到 `Installed and verified` 后，在 EmoteLab 关闭当前模型并重新加载 **PeizhengHairMotion → 培正娘**。仍显示旧贴图时重开应用。输出 `0 files updated` 表示工作区构建结果与安装目录一致。

如果应用里未生效，先看脚本是否成功完成两步构建和安装，再比较工作区与安装目录里的对应 `PZ_*.png`、`.atlas.txt`、`.skel.bytes` 的 SHA-256。只生成 ZIP 或运行了 `-PackOnly` 时，安装目录仍是上一次同步的版本。文件哈希一致后，再用默认姿态和相关动作检查贴图位置、遮挡及边缘。
