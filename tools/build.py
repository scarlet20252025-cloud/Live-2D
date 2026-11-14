from pathlib import Path
from PIL import Image
import json, re, shutil

here = Path(__file__).resolve().parent
official = here.parent / 'Validated' / 'official'
target = here / 'PeizhengHairMotion'
target.mkdir(exist_ok=True)
atlas = (official / 'model.atlas').read_text(encoding='utf-8-sig')
bounds = json.loads((here / 'bounds.json').read_text())
bones = json.loads((here.parent / 'Validated' / 'bones.json').read_text())
source_skins = {
    'hat': ('HeadAcc_Font/HatE1_Color[Hat]', 'Accessory/Hat/HatE1_Color', ['HatB']),
    'bangs': ('Hair_Front/HairBangMiddle/HairBang_Middle_Color[HairBangMiddle]', 'Hair/HairBang_Middle/HairBang4_Middle_Color', ['HairBang_Middle1']),
    'body': ('Outfit_Front/Main_Outline[OutfitInnerOutline]', 'Outfit/Inner/Main3_Outline', ['Hip']),
    'skirt': ('Outfit_Front/Main_Color[OutfitInner]', 'Outfit/Inner/Main1_Color', ['Hip']),
}
for side, label in [('L', 'Left'), ('R', 'Right')]:
    leg_chain = ('Leg_L5', 'Leg_L3', 'Leg_L1') if side == 'L' else ('Leg_R4', 'Leg_R5', 'Leg_R3')
    source_skins['leg_' + side] = (f'Body/Leg_{side}[Leg{label}]', 'Base/Leg', leg_chain)
    source_skins['side_' + side] = (
        f'HeadAcc_Middle/HairClip_{label}[HairClip{label}]',
        'Accessory/HairClip/HairClip1_Color',
        [f'FrameHair_{label}{i}' for i in (1,2,3)],
    )
    source_skins['temple_' + side] = (
        f'Hair_Front/FrameHairColor/FrameHair_Branch_Color_{side}[FrameHair{label}]',
        'Hair/FrameHair/FrameHair_Branch_A1_Color',
        [f'FrameHair_Branch_{label}{i}' for i in (1,2,3)],
    )
    source_skins['tail_' + side] = (
        f'Hair_Back/Pigtail/PigtailC_Color_{side}[Pigtail{label}]',
        'Hair/Pigtail/Pigtail_C2_Color',
        [f'PonytailC_{label}{i}' for i in (1,2,3)],
    )

bindings = {}
chunks = []
for part, (slot, source_path, chain) in source_skins.items():
    name = f'PZ_{part}'
    with Image.open(here / 'art' / (part + '.png')) as src:
        page = Image.new('RGBA', (src.width + 8, src.height + 8))
        page.paste(src, (4,4))
        page.save(target / (name + '.png'))
        chunks.append(f'{name}.png\nsize: {page.width},{page.height}\nfilter: Linear,Linear\npma: false\nPeizheng/{part}\nbounds: 4,4,{src.width},{src.height}\n')
    bindings[slot] = dict(source=source_path, path=f'Peizheng/{part}', bounds=bounds[part], chain=[bones[n] for n in chain])

# Suppress only the displaced legacy outline/fill supports. Keep O-eye art
# intact so official open-eye expressions continue to work.
old_supports = {
    'Accessory/Hat/HatE1_Outline', 'Accessory/Hat/HatE2_Color','Accessory/Hat/HatE2_Outline',
    'Hair/HairBang_Middle/HairBang_MiddleBack_Outline',
    'Hair/HairBang_Middle/HairBang4_Middle_Outline',
    'Hair/Pigtail/Pigtail_C2_Outline',
    'Hair/FrameHair/FrameHair_A1_Outline', 'Hair/FrameHair/FrameHair_A1_Color',
    'Accessory/HairClip/HairClip1_Outline',
    'Hair/FrameHair/FrameHair_Branch_A1_Outline',
}
pose = json.loads((here.parent / 'pose.json').read_text())
old_supports.update(q['path'] for q in pose if any(k in q['slot'] for k in ('TopBack_Outline', 'FrameHair_Top_')) and q.get('path'))
pages = {}
for key in old_supports:
    m = re.search(r'(?m)^' + re.escape(key) + r'\n((?:[ \t]+[^\n]+\n)*)', atlas)
    if m is None:
        continue
    x,y,w,h = map(int, re.search(r'bounds: ([\d, ]+)',m[1])[1].split(','))
    if 'rotate: 90' in m[1]:
        w,h=h,w
    name = re.findall(r'(?m)^([^:\n]+\.png)\s*$',atlas[:m.start()])[-1].strip()
    if name not in pages:
        pages[name] = Image.open(official / name).convert('RGBA')
    pages[name].paste((0,0,0,0),(x,y,x+w,y+h))
for name in re.findall(r'(?m)^([^:\n]+\.png)\s*$',atlas):
    name = name.strip()
    if name in pages:
        pages[name].save(target / name)
    else:
        shutil.copy2(official / name,target / name)
(target / 'PeizhengHairMotion.atlas.txt').write_text(atlas.strip() + '\n\n' + '\n'.join(chunks),encoding='utf8')
(here / 'bindings.json').write_text(json.dumps(bindings,indent=2),encoding='utf8')
