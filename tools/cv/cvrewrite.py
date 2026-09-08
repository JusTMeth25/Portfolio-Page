"""
Riscrive la sezione SELECTED DEVELOPMENT PROJECTS del CV PDF con i tre
progetti del portfolio, mantenendo layout, font e link del documento Canva.

Strategia:
1. i font incorporati sono sottoinsiemi di Arial: vengono sostituiti con nuovi
   sottoinsiemi generati da Arial di sistema, contenenti tutti i caratteri
   necessari (vecchi + nuovi);
2. OGNI stringa di testo del content stream viene ricodificata con i nuovi
   glyph id, tracciando il font corrente dagli operatori Tf;
3. i blocchi BT/ET della sezione progetti vengono riscritti con il nuovo testo,
   ricalcolando le posizioni orizzontali dalle metriche reali e andando a capo
   entro la larghezza della colonna;
4. rettangoli di sottolineatura, clip dei descender e annotazioni Link vengono
   spostati insieme al testo "Repository".
"""

import io
import os
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject,
    DecodedStreamObject,
    DictionaryObject,
    FloatObject,
    NameObject,
    NumberObject,
    TextStringObject,
)

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cvlib import escape_pdf_bytes, find_strings, parse_pdf_string  # noqa: E402

SRC = sys.argv[1]
DST = sys.argv[2]

SYSTEM_FONTS = {
    '/F9': r'C:\Windows\Fonts\arialbd.ttf',   # Arial-BoldMT
    '/F10': r'C:\Windows\Fonts\arial.ttf',    # ArialMT
    '/F12': r'C:\Windows\Fonts\ariali.ttf',   # Arial-ItalicMT
}
# Il prefisso di sottoinsieme (sei lettere + '+') è obbligatorio: senza,
# alcuni viewer considerano il font "standard" e lo sostituiscono con quello
# di sistema, disegnando i glifi sbagliati (gli id qui sono nostri).
BASE_NAMES = {
    '/F9': 'AAAAAA+Arial-BoldMT',
    '/F10': 'BAAAAA+ArialMT',
    '/F12': 'CAAAAA+Arial-ItalicMT',
}

REPO_LABEL = 'Repository'
SEPARATOR = '  |  '
LINE_HEIGHT = 32.0          # distanza fra le due righe di corpo (unità testo)
SCALE = 3.1249452           # scala del gruppo di testo nel form XObject

PROJECTS = [
    {
        'title': 'Spotify Clone (EPICODE Week 11 project)',
        'tags': 'React | Redux Toolkit | Vite | Deezer API',
        'url': 'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-11',
        'body': 'Built a Spotify-style music web app with React and Redux Toolkit: '
                'track search with debounced queries against the Deezer API, an audio '
                'player with shuffle, loop, seek and volume control, plus liked tracks '
                'and user-created playlists in a mobile-first Bootstrap layout.',
    },
    {
        'title': 'Vinilshelf - Vinyl Collection Manager (EPICODE Week 3 project)',
        'tags': 'JavaScript | HTML5 | CSS3 | localStorage',
        'url': 'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-3',
        'body': 'Framework-free JavaScript app built on a state-render-events '
                'pattern: add records, live search, status filters, sorting, '
                'counters and localStorage persistence.',
        'max_lines': 1,
    },
    {
        'title': 'EpiWeather - Weather Dashboard (EPICODE Week 10 project)',
        'tags': 'React | React Router | Vite | OpenWeather API | Vitest',
        'url': 'https://github.com/JusTMeth25/FS0226IT---PROGETTO-SETTIMANA-10',
        'body': 'Weather app using the OpenWeather Geocoding API to disambiguate '
                'cities, with routed detail pages for current weather, forecasts '
                'and Vitest component tests.',
        'max_lines': 1,
    },
]

# Indici dei blocchi BT/ET (ordine nel content stream) della sezione progetti.
LAYOUT = [
    {'title': 44, 'sep1': (45, 46, 47), 'tags': 48, 'sep2': (49, 50, 51),
     'repo': 52, 'body': (53, 54)},
    {'title': 55, 'sep1': (56, 57, 58), 'tags': 59, 'sep2': (60, 61, 62),
     'repo': 63, 'body': (64,)},
    {'title': 65, 'sep1': (66, 67, 68), 'tags': 69, 'sep2': (70, 71, 72),
     'repo': 73, 'body': (74,)},
]

# ------------------------------------------------------------------ utilities


def cmap_forward(font_dict):
    """gid -> unicode letto dal font incorporato (più completo del ToUnicode)."""
    descendant = font_dict['/DescendantFonts'][0].get_object()
    descriptor = descendant['/FontDescriptor'].get_object()
    ttf = TTFont(io.BytesIO(descriptor['/FontFile2'].get_object().get_data()))
    index = {name: i for i, name in enumerate(ttf.getGlyphOrder())}
    forward = {}
    for codepoint, glyph_name in ttf.getBestCmap().items():
        gid = index.get(glyph_name)
        if gid is not None:
            forward.setdefault(gid, chr(codepoint))
    return forward


def fmt(value):
    text = f'{value:.5f}'.rstrip('0').rstrip('.')
    return text if text else '0'


def string_spans(data):
    """
    (inizio, fine, byte) di ogni stringa del content stream, sia letterale
    `(...)` sia esadecimale `<...>`. Canva usa entrambe le forme.
    """
    spans = [(s, e, raw, 'lit') for s, e, raw in find_strings(data)]
    for match in re.finditer(rb'<([0-9A-Fa-f\s]+)>', data):
        if data[match.start():match.start() + 2] == b'<<':
            continue
        digits = re.sub(rb'\s', b'', match.group(1))
        if len(digits) % 2:
            continue
        spans.append((match.start(), match.end(), bytes.fromhex(digits.decode()),
                      'hex'))
    spans.sort(key=lambda item: item[0])
    # Nessuna sovrapposizione: una stringa esadecimale non può stare dentro
    # una letterale e viceversa.
    cleaned, last_end = [], -1
    for start, end, raw, kind in spans:
        if start < last_end:
            continue
        cleaned.append((start, end, raw, kind))
        last_end = end
    return cleaned


def font_at(data, position, cache={}):
    """Font attivo (ultimo operatore Tf) prima di `position`."""
    if 'ops' not in cache:
        cache['ops'] = [(m.start(), '/' + m.group(1).decode())
                        for m in re.finditer(rb'/(F\d+)\s+[\d.]+\s+Tf', data)]
    current = None
    for offset, key in cache['ops']:
        if offset < position:
            current = key
        else:
            break
    return current


# --------------------------------------------------------------------- lettura

reader = PdfReader(SRC)
page = reader.pages[0]
xobject = page['/Resources']['/XObject']['/X13'].get_object()
data = xobject.get_data()
fonts = xobject['/Resources']['/Font']

FORWARD = {key: cmap_forward(fonts[key].get_object()) for key in SYSTEM_FONTS}

# Testo di ogni stringa del documento, con il font che la disegna.
spans = string_spans(data)
decoded_spans = []
unknown = 0
for start, end, raw, kind in spans:
    key = font_at(data, start)
    payload = parse_pdf_string(raw) if kind == 'lit' else raw
    text = ''
    for i in range(0, len(payload) - 1, 2):
        gid = payload[i] * 256 + payload[i + 1]
        char = FORWARD[key].get(gid)
        if char is None:
            unknown += 1
            char = ' '
        text += char
    decoded_spans.append((start, end, key, text))
if unknown:
    print(f'  glyph id senza mappatura unicode: {unknown} (resi come spazio)')

blocks = [(m.start(), m.end()) for m in re.finditer(rb'BT\n.*?\nET', data, re.S)]


def block_text(index):
    start, end = blocks[index]
    return ''.join(text for s, _, _, text in decoded_spans if start < s < end)


def block_font(index):
    start, end = blocks[index]
    body = data[start:end]
    match = re.search(rb'/(F\d+)\s+([\d.]+)\s+Tf', body)
    return '/' + match.group(1).decode(), float(match.group(2))


def block_tm(index):
    start, end = blocks[index]
    match = re.search(rb'1 0 0 -1 ([-\d.]+) ([-\d.]+) Tm', data[start:end])
    return float(match.group(1)), float(match.group(2))


assert block_text(43) == 'SELECTED DEVELOPMENT PROJECTS', block_text(43)
for spec in LAYOUT:
    assert block_text(spec['repo']) == REPO_LABEL, block_text(spec['repo'])

# ---- 1. charset completo ----------------------------------------------------

needed = {key: set() for key in SYSTEM_FONTS}
for _, _, key, text in decoded_spans:
    needed[key].update(text)

for spec, project in zip(LAYOUT, PROJECTS):
    needed[block_font(spec['title'])[0]].update(project['title'])
    needed[block_font(spec['tags'])[0]].update(project['tags'] + SEPARATOR)
    needed[block_font(spec['body'][0])[0]].update(project['body'])
    needed[block_font(spec['repo'])[0]].update(REPO_LABEL)
for key in needed:
    needed[key].update(' |-,.():/&')
    needed[key].discard('\ufffd')

# ---- 2. nuovi sottoinsiemi di Arial -----------------------------------------

NEW = {}
for key, path in SYSTEM_FONTS.items():
    font = TTFont(path)
    options = subset.Options()
    options.set(layout_features=[], notdef_outline=True, recalc_bounds=True,
                drop_tables=['DSIG'], glyph_names=False, hinting=True)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=[ord(ch) for ch in sorted(needed[key])])
    subsetter.subset(font)
    buffer = io.BytesIO()
    font.save(buffer)
    payload = buffer.getvalue()

    reloaded = TTFont(io.BytesIO(payload))
    order = reloaded.getGlyphOrder()
    gid_of_name = {name: i for i, name in enumerate(order)}
    reverse = {}
    for codepoint, glyph_name in reloaded.getBestCmap().items():
        gid = gid_of_name.get(glyph_name)
        if gid is not None:
            reverse[chr(codepoint)] = gid
    upem = reloaded['head'].unitsPerEm
    metrics = reloaded['hmtx'].metrics
    widths = {gid_of_name[name]: metrics[name][0] * 1000.0 / upem
              for name in order if name in metrics}
    NEW[key] = {'bytes': payload, 'rev': reverse, 'widths': widths,
                'nglyphs': len(order)}
    missing = sorted(ch for ch in needed[key] if ch not in reverse)
    if missing:
        print(f'  ATTENZIONE {key}: glifi mancanti {missing!r}')

print('sottoinsiemi generati:',
      {k: (v['nglyphs'], len(v['bytes']) // 1024) for k, v in NEW.items()})


def encode(text, key):
    rev = NEW[key]['rev']
    out = bytearray()
    for ch in text:
        gid = rev.get(ch, rev.get(' ', 0))
        out.append((gid >> 8) & 0xFF)
        out.append(gid & 0xFF)
    return bytes(out)


def width_of(text, key, size):
    rev = NEW[key]['rev']
    widths = NEW[key]['widths']
    total = 0.0
    for ch in text:
        gid = rev.get(ch)
        if gid is not None:
            total += widths.get(gid, 0.0)
    return total * size / 1000.0


def wrap(text, key, size, limit):
    lines, current = [], ''
    for word in text.split(' '):
        candidate = f'{current} {word}'.strip()
        if current and width_of(candidate, key, size) > limit:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


# ---- 3. ricodifica globale di tutte le stringhe -----------------------------

pieces, cursor = [], 0
for start, end, key, text in decoded_spans:
    pieces.append(data[cursor:start])
    pieces.append(b'(' + escape_pdf_bytes(encode(text, key)) + b')')
    cursor = end
pieces.append(data[cursor:])
new_data = b''.join(pieces)

# Le posizioni dei blocchi cambiano: le ricalcoliamo sullo stream ricodificato.
new_blocks = [(m.start(), m.end())
              for m in re.finditer(rb'BT\n.*?\nET', new_data, re.S)]
assert len(new_blocks) == len(blocks)

# ---- 4. riscrittura dei blocchi della sezione progetti ----------------------


def make_block(key, size, x, baseline, lines):
    """Un BT/ET per riga; `lines` può essere una stringa o una lista."""
    if isinstance(lines, str):
        lines = [lines] if lines else []
    out = []
    for index, line in enumerate(lines or ['']):
        y = baseline + index * LINE_HEIGHT
        head = b'BT\n/%s %s Tf\n1 0 0 -1 %s %s Tm\n' % (
            key[1:].encode(), fmt(size).encode(), fmt(x).encode(), fmt(y).encode())
        body = (b'(%s) Tj\n' % escape_pdf_bytes(encode(line, key))) if line else b''
        out.append(head + body + b'ET')
    return b'\n'.join(out)


# Larghezza utile della colonna: quella della riga di corpo più lunga del CV
# originale (che il layout Canva già faceva stare su una riga).
reference = block_text(53)
BODY_LIMIT = width_of(reference, *block_font(53)) + 4

replacements = {}
repo_moves = []

for spec, project in zip(LAYOUT, PROJECTS):
    title_key, title_size = block_font(spec['title'])
    tags_key, tags_size = block_font(spec['tags'])
    repo_key, repo_size = block_font(spec['repo'])
    body_key, body_size = block_font(spec['body'][0])

    baseline = block_tm(spec['title'])[1]
    body_baseline = block_tm(spec['body'][0])[1]
    separator_width = width_of(SEPARATOR, tags_key, tags_size)

    x_sep1 = width_of(project['title'], title_key, title_size)
    x_tags = x_sep1 + separator_width
    x_sep2 = x_tags + width_of(project['tags'], tags_key, tags_size)
    x_repo = x_sep2 + separator_width

    replacements[spec['title']] = make_block(
        title_key, title_size, 0, baseline, project['title'])
    replacements[spec['sep1'][0]] = make_block(
        tags_key, tags_size, x_sep1, baseline, SEPARATOR)
    replacements[spec['tags']] = make_block(
        tags_key, tags_size, x_tags, baseline, project['tags'])
    replacements[spec['sep2'][0]] = make_block(
        tags_key, tags_size, x_sep2, baseline, SEPARATOR)
    for index in spec['sep1'][1:] + spec['sep2'][1:]:
        replacements[index] = make_block(tags_key, tags_size, 0, baseline, '')

    old_repo_x = block_tm(spec['repo'])[0]
    replacements[spec['repo']] = make_block(
        repo_key, repo_size, x_repo, baseline, REPO_LABEL)
    repo_moves.append((old_repo_x, x_repo))

    lines = wrap(project['body'], body_key, body_size, BODY_LIMIT)
    assert len(lines) <= project.get('max_lines', 2), (project['title'], lines)
    replacements[spec['body'][0]] = make_block(
        body_key, body_size, 0, body_baseline, lines)
    for index in spec['body'][1:]:
        replacements[index] = make_block(body_key, body_size, 0, body_baseline, '')

pieces, cursor = [], 0
for index, (start, end) in enumerate(new_blocks):
    if index not in replacements:
        continue
    pieces.append(new_data[cursor:start])
    pieces.append(replacements[index])
    cursor = end
pieces.append(new_data[cursor:])
new_data = b''.join(pieces)

# ---- 5. sottolineature, clip dei descender e link ---------------------------

for old_x, new_x in repo_moves:
    pattern = ('%s 29 140.5625 2 re' % fmt(old_x)).encode()
    assert pattern in new_data, pattern
    new_data = new_data.replace(
        pattern, ('%s 29 140.5625 2 re' % fmt(new_x)).encode())

# I "buchi" nella sottolineatura (discendenti di p e y) sono disegnati in
# coordinate pagina: si spostano insieme al testo, riscalati.
lines = new_data.split(b'\n')
for i, line in enumerate(lines):
    match = re.fullmatch(rb'([-\d.]+) ([-\d.]+) (m|l)', line)
    if not match:
        continue
    y = float(match.group(2))
    if not (4150 < y < 4180 or 4590 < y < 4620 or 5020 < y < 5060):
        continue
    x = float(match.group(1))
    for old_x, new_x in repo_moves:
        base = 212.22752 + old_x * SCALE
        if base - 40 <= x <= base + 40 + 140.5625 * SCALE:
            lines[i] = ('%s %s %s' % (fmt(x + (new_x - old_x) * SCALE),
                                      match.group(2).decode(),
                                      match.group(3).decode())).encode()
            break
new_data = b'\n'.join(lines)

# ---- 6. scrittura del PDF ---------------------------------------------------

writer = PdfWriter(clone_from=SRC)
out_page = writer.pages[0]
out_xobject = out_page['/Resources']['/XObject']['/X13']
out_xobject.set_data(new_data)

out_fonts = out_xobject['/Resources']['/Font']
for key in SYSTEM_FONTS:
    payload = NEW[key]['bytes']
    font_dict = out_fonts[key].get_object()
    descendant = font_dict['/DescendantFonts'][0].get_object()
    descriptor = descendant['/FontDescriptor'].get_object()

    stream = DecodedStreamObject()
    stream.set_data(payload)
    stream[NameObject('/Length1')] = NumberObject(len(payload))
    descriptor[NameObject('/FontFile2')] = writer._add_object(stream)

    name = NameObject('/' + BASE_NAMES[key])
    font_dict[NameObject('/BaseFont')] = name
    descendant[NameObject('/BaseFont')] = name
    descriptor[NameObject('/FontName')] = name

    widths = NEW[key]['widths']
    array = ArrayObject()
    for gid in sorted(widths):
        array.append(NumberObject(gid))
        array.append(ArrayObject([FloatObject(round(widths[gid], 2))]))
    descendant[NameObject('/W')] = array
    descendant[NameObject('/DW')] = NumberObject(0)
    descendant[NameObject('/CIDToGIDMap')] = NameObject('/Identity')

    # ToUnicode coerente con i nuovi gid: il PDF resta selezionabile,
    # ricercabile e leggibile dai parser ATS.
    entries = sorted(NEW[key]['rev'].items(), key=lambda item: item[1])
    chunks = []
    for i in range(0, len(entries), 100):
        part = entries[i:i + 100]
        body = '\n'.join('<%04X> <%04X>' % (gid, ord(ch)) for ch, gid in part)
        chunks.append('%d beginbfchar\n%s\nendbfchar' % (len(part), body))
    cmap = (
        '/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n'
        '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n'
        '/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n'
        '1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n'
        + '\n'.join(chunks) +
        '\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend'
    )
    tounicode = DecodedStreamObject()
    tounicode.set_data(cmap.encode('latin-1'))
    font_dict[NameObject('/ToUnicode')] = writer._add_object(tounicode)

# Annotazioni Link dei tre progetti (indici 2, 3, 4).
annotations = out_page['/Annots']
for annotation, (old_x, new_x), project in zip(
        [annotations[i] for i in (2, 3, 4)], repo_moves, PROJECTS):
    obj = annotation.get_object()
    rect = obj['/Rect']
    delta = (new_x - old_x) * SCALE * 0.23999999
    obj[NameObject('/Rect')] = ArrayObject([
        FloatObject(round(float(rect[0]) + delta, 3)),
        rect[1],
        FloatObject(round(float(rect[2]) + delta, 3)),
        rect[3],
    ])
    action = obj['/A']
    target = action if isinstance(action, DictionaryObject) else action.get_object()
    target[NameObject('/URI')] = TextStringObject(project['url'])

os.makedirs(os.path.dirname(DST), exist_ok=True)
with open(DST, 'wb') as handle:
    writer.write(handle)

print('scritto', DST, os.path.getsize(DST) // 1024, 'KB')
