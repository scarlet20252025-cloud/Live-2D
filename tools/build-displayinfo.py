"""Generate DisplayInfo/Animations.csv with Chinese names for every ANIM entry.

Sources:
  - emotelab-skill/references/animations.csv  (official zh-Hans names)
  - SUPPLEMENT below                          (v1.6-v1.9 animations missing from that table)
"""
from pathlib import Path
import csv
import json
import sys

HERE = Path(__file__).resolve().parent
REFERENCE = Path('E:/肥鱼不乐园/emotelab-skill/references/animations.csv')
OUT_DIR = HERE / 'DisplayInfo'
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / 'Animations.csv'

SUPPLEMENT = {
    'ANIM/Battery-Charge': '电池充电',
    'ANIM/Battery-Low': '电量低',
    'ANIM/Bite-1': '咬一口 1',
    'ANIM/Bite-2': '咬一口 2',
    'ANIM/Blink-1': '眨眼 1',
    'ANIM/BlowNose': '擤鼻涕',
    'ANIM/Blushing-1': '脸红 1',
    'ANIM/Blushing-2': '脸红 2',
    'ANIM/Bongo-Frame': '敲邦戈鼓（定格）',
    'ANIM/Bongo-FrameLeft': '敲邦戈鼓（左手定格）',
    'ANIM/Bongo-FrameRight': '敲邦戈鼓（右手定格）',
    'ANIM/Bongo-Smooth': '敲邦戈鼓（流畅）',
    'ANIM/Book-Blush': '看书脸红',
    'ANIM/Book-Read': '看书',
    'ANIM/Cauldron-Magic1': '坩埚施法 1',
    'ANIM/Cauldron-Magic2': '坩埚施法 2',
    'ANIM/Cauldron-Stir1': '搅拌坩埚 1',
    'ANIM/Cauldron-Stir2': '搅拌坩埚 2',
    'ANIM/Draw-Angry': '画画（生气）',
    'ANIM/Draw-Normal': '画画（平常）',
    'ANIM/Draw-Tired': '画画（疲倦）',
    'ANIM/Drink-EnergyDrink1': '喝能量饮料 1',
    'ANIM/Drink-EnergyDrink2': '喝能量饮料 2',
    'ANIM/Hurt': '受伤',
    'ANIM/Hydrate': '补水',
    'ANIM/Lick-IceCream': '舔冰淇淋',
    'ANIM/Lick-Popsicle': '舔冰棒',
    'ANIM/Music-1': '听音乐 1',
    'ANIM/Music-2': '听音乐 2',
    'ANIM/Music-3': '听音乐 3',
    'ANIM/Nerd-1': '书呆子 1',
    'ANIM/Nerd-2': '书呆子 2',
    'ANIM/Nerd-3': '书呆子 3',
    'ANIM/Nervous-3': '紧张 3',
    'ANIM/Pillow-Lick': '舔枕头',
    'ANIM/Pillow-Rub': '蹭枕头',
    'ANIM/Pillow-Rub2': '蹭枕头 2',
    'ANIM/Pumpkin': '南瓜',
    'ANIM/Scared-Cross': '害怕（十字）',
    'ANIM/Shy-3': '害羞 3',
    'ANIM/Sick': '生病',
    'ANIM/Sick-bed': '生病卧床',
    'ANIM/Sparkling-3': '闪闪发光 3',
    'ANIM/Stop': '停下',
    'ANIM/Sweat-Wipe1': '擦汗 1',
    'ANIM/Sweat-Wipe2': '擦汗 2',
    'ANIM/Wiggle-1': '扭动 1',
    'ANIM/Wiggle-2': '扭动 2',
}

NODE_SCRIPT = r"""
const fs=require('fs'),path=require('path');
const spine=require(process.env.NODE_PATH+'/@esotericsoftware/spine-canvas');
const t='PeizhengHairMotion';
const atlas=new spine.TextureAtlas(fs.readFileSync(path.join(t,'PeizhengHairMotion.atlas.txt'),'utf8'));
const sd=new spine.SkeletonBinary(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(path.join(t,'PeizhengHairMotion.skel.bytes'))));
console.log(JSON.stringify(sd.animations.map(a=>a.name).filter(n=>n.startsWith('ANIM/'))));
"""


def read_model_anims():
    # Pipe the animation list in from stdin: the sandbox blocks CreatePipe here.
    return json.load(sys.stdin)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    anims = read_model_anims()
    with REFERENCE.open('r', encoding='utf-8-sig', newline='') as handle:
        official = list(csv.DictReader(handle))
    names = {row['AnimationName']: row['zh-Hans'].strip() for row in official}

    missing = [name for name in anims if name not in names]
    unmapped = [name for name in missing if name not in SUPPLEMENT]
    if unmapped:
        raise SystemExit('No Chinese name for: ' + ', '.join(unmapped))
    for name in missing:
        names[name] = SUPPLEMENT[name]

    header = ['AnimationName', 'DisplayName', 'zh-Hans']
    rows = []
    for name in anims:
        chinese = names[name]
        rows.append({'AnimationName': name, 'DisplayName': chinese, 'zh-Hans': chinese})

    writer = csv.DictWriter(sys.stdout, fieldnames=header)
    writer.writeheader()
    writer.writerows(rows)

    print(f'anims={len(anims)} official={len(official)} supplemented={len(missing)}', file=sys.stderr)


if __name__ == '__main__':
    main()
