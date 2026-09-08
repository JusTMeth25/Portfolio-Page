"""
Genera la versione italiana del CV a partire dall'export Canva in inglese.

Stessa idea di `cvrewrite.py`, ma generalizzata: invece di riscrivere una sola
sezione, ricostruisce ogni riga del documento.

Modello del documento
---------------------
Ogni blocco di testo ha una trasformazione `cm` (dove sta il paragrafo) e una
`Tm` (dove sta la riga dentro il paragrafo). Da qui:

    paragrafo = tutti i blocchi con lo stesso (cm.x, cm.y)
    riga      = i blocchi di un paragrafo con la stessa Tm.y
    run       = un blocco dentro una riga, ordinato per Tm.x

Le posizioni orizzontali dei run non vengono copiate: si ricalcolano sommando
le larghezze reali dei glifi. Così una traduzione più lunga o più corta
dell'originale non sfasa il resto della riga.

Uso
---
    pip install pypdf fonttools
    python tools/cv/cvtranslate.py <cv-inglese.pdf> public/cv/lorenzo-melis-cv-it.pdf
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
# 'it' traduce tutto; 'en' applica solo le correzioni al CV inglese.
LANG = sys.argv[3] if len(sys.argv) > 3 else 'it'

SYSTEM_FONTS = {
    '/F9': r'C:\Windows\Fonts\arialbd.ttf',
    '/F10': r'C:\Windows\Fonts\arial.ttf',
    '/F12': r'C:\Windows\Fonts\ariali.ttf',
}
BASE_NAMES = {
    '/F9': 'AAAAAA+Arial-BoldMT',
    '/F10': 'BAAAAA+ArialMT',
    '/F12': 'CAAAAA+Arial-ItalicMT',
}

SCALE = 3.1249452
PAGE_SCALE = 0.23999999

# Sito pubblicato. Il link "github" dell'intestazione punta qui: dal CV si
# arriva al portfolio, e il profilo GitHub resta comunque in fondo, alla riga
# "Altri progetti". Il blocco 15 è il testo, la seconda annotazione il link.
PORTFOLIO_URL = 'https://justmeth25.github.io/Portfolio-Page/'
PORTFOLIO_TEXT = 'justmeth25.github.io/Portfolio-Page'
HEADER_LINK_BLOCK = 15

# ------------------------------------------------------------------ traduzioni

# `flow`: la riga inizia con delle etichette a testo fisso e prosegue con un
# testo che va a capo da solo sulle righe disponibili.
# `map`: sostituzioni puntuali blocco per blocco (le posizioni si ricalcolano).
IT = {
    2: {'map': {2: 'Ingegneria Informatica | React | JavaScript | TypeScript | Java | Spring Boot | PostgreSQL | REST API'}},
    16: {'map': {16: 'PROFILO PROFESSIONALE'}},
    17: {'flow': {
        'labels': [],
        'text': 'Junior Full-Stack Developer attualmente impegnato nel percorso EPICODE AI Full-Stack Developer, con progetti pratici in JavaScript, React, Redux, '
                'TypeScript, Java, Spring Boot, REST API, SQL e PostgreSQL. Laureato in Ingegneria Informatica, con precedente esperienza in ambito IT aziendale '
                'e cybersecurity: capacità analitiche, attenzione alla sicurezza e problem solving strutturato applicati allo sviluppo software.',
    }},
    20: {'map': {20: 'COMPETENZE TECNICHE'}},
    21: {'flow': {
        'labels': [(21, 'Programmazione e frontend: ')],
        'text': 'JavaScript, TypeScript, Java, HTML5, CSS3, React, Redux Toolkit, Bootstrap, Sass',
    }},
    24: {'flow': {
        'labels': [(24, 'Backend e dati: ')],
        'text': 'Spring Boot, Spring Web, Spring Data JPA, Spring Security, REST API, SQL, PostgreSQL',
    }},
    27: {'flow': {
        'labels': [(27, 'Strumenti: ')],
        'text': 'Git, GitHub, Postman, Maven, Vite',
    }},
    29: {'flow': {
        'labels': [(29, 'Altre competenze IT: ')],
        'text': 'Linux, Microsoft Azure, networking, cybersecurity',
    }},
    31: {'flow': {
        'labels': [(31, 'Lingue: ')],
        'text': 'italiano (madrelingua), inglese (avanzato), spagnolo (base)',
    }},
    33: {'flow': {
        'labels': [(33, 'Certificazioni linguistiche: ')],
        'text': 'Cisco English for IT 2; certificato di spagnolo B1 - FU International Academy Tenerife',
    }},
    36: {'map': {36: 'FORMAZIONE E PERCORSO DI SVILUPPO'}},
    38: {'map': {38: 'Mag 2026 - In corso'}},
    39: {'flow': {
        'labels': [(39, 'Completamento previsto: nov 2026. ')],
        'text': 'Formazione pratica su HTML/CSS, JavaScript, React, Redux e TypeScript, Java, Spring Framework, database relazionali e SQL, Spring Data JPA, '
                'API RESTful con Spring Web, integrazione frontend-backend e geolocalizzazione.',
    }},
    42: {'flow': {
        'labels': [],
        'text': 'Il lavoro pratico comprende esercizi individuali, progetti settimanali e sviluppo su GitHub.',
    }},
    43: {'map': {43: 'PROGETTI DI SVILUPPO SELEZIONATI'}},
    44: {'map': {44: 'Spotify Clone (progetto EPICODE settimana 11)'}},
    53: {'flow': {
        'labels': [],
        'text': 'Web app musicale in stile Spotify con React e Redux Toolkit: ricerca brani con debounce sull’API Deezer, player audio con shuffle, loop, seek e '
                'controllo del volume, brani preferiti e playlist create dall’utente in un layout mobile-first con Bootstrap.',
    }},
    56: {'map': {56: 'Vinylshelf - Gestione di una collezione di vinili (progetto EPICODE settimana 3)'}},
    65: {'flow': {
        'labels': [],
        'text': 'App JavaScript senza framework, costruita sul pattern stato-render-eventi: inserimento dischi, ricerca live, filtri di stato, ordinamenti, contatori e persistenza in localStorage.',
    }},
    66: {'map': {66: 'EpiWeather - Dashboard meteo (progetto EPICODE settimana 10)'}},
    75: {'flow': {
        'labels': [],
        'text': 'App meteo con Geocoding API di OpenWeather per città omonime, pagine di dettaglio su rotta con meteo e previsioni, test di componente con Vitest.',
    }},
    76: {'flow': {
        'labels': [(76, 'Altri progetti: ')],
        'text': 'github.com/JusTMeth25',
    }},
    78: {'map': {78: 'ESPERIENZA LAVORATIVA'}},
    79: {'map': {83: 'Protiviti - Roma'}},
    84: {'map': {84: 'Set 2025 - Apr 2026'}},
    85: {'flow': {
        'labels': [],
        'text': 'Supporto a clienti del settore finanziario e aerospaziale su governance e compliance della cybersecurity: valutazioni del rischio ICT legate a DORA, '
                'valutazione dei controlli, audit di sicurezza sui fornitori, pianificazione della remediation e supporto PMO.',
    }},
    87: {'map': {91: 'KPMG Advisory - Roma'}},
    92: {'map': {92: 'Mar 2025 - Giu 2025'}},
    93: {'flow': {
        'labels': [],
        'text': 'Progetti di information security e technology risk: analisi delle policy di sicurezza, vulnerability assessment, IAM/IAG, continuità operativa e '
                'disaster recovery, valutazioni di conformità, controlli DORA/PCI-DSS e revisioni tecniche.',
    }},
    95: {'map': {99: 'Cybertech - Engineering, Roma'}},
    100: {'map': {100: 'Mag 2019 - Dic 2024'}},
    101: {'flow': {
        'labels': [],
        'text': 'Percorso: Analyst (mag-dic 2019), Specialist (gen 2020-giu 2021), Consultant (giu 2021-dic 2024). Attività su analisi SIEM e log, incident handling, '
                'Microsoft Azure, IAM/PAM, DLP, Microsoft Defender, integrazioni di sicurezza, reporting del rischio e collaborazione con team tecnici e operativi.',
    }},
    103: {'map': {103: 'ISTRUZIONE'}},
    104: {'map': {104: 'Laurea in Ingegneria Informatica L-08', 116: 'Voto: 105/110'}},
    117: {'map': {121: 'ELIS College - Roma'}},
    126: {'map': {126: 'Diploma di liceo linguistico'}},
    135: {'map': {135: 'CERTIFICAZIONI'}},
    136: {'flow': {
        'labels': [],
        'text': 'Certificazione CompTIA Security+ ce | Linux LPIC-1 v.500 (LPI) | Cisco CCNA Routing and Switching (200-125) | Cisco Cyber Threat Management | '
                'ITILv4 Foundation Certificate in IT Service Management | ISMS Auditor ISO/IEC 27001 | Lead Auditor di Sistemi di Gestione ISO 19011 - ISO/IEC 17021 | '
                'Auditor Interno Norma UNI EN ISO 9001:2015',
    }},
    138: {'map': {138: 'Autorizzo il trattamento dei miei dati personali ai sensi del D.lgs. 196 del 30 giugno 2003 e del GDPR (Regolamento UE 2016/679).'}},
}

# Il CV inglese resta in inglese: qui solo le correzioni puntuali.
EN = {
    38: {'map': {38: 'May 2026 - In progress'}},
    56: {'map': {56: 'Vinylshelf - Vinyl Collection Manager (EPICODE Week 3 project)'}},
}

# Il testo dell'intestazione è uguale nelle due lingue.
for _table in (IT, EN):
    _table[3] = {'map': {HEADER_LINK_BLOCK: PORTFOLIO_TEXT}}

TABLES = {'it': IT, 'en': EN}
TRANSLATIONS = TABLES[LANG]

# Metadati del documento. Il file di partenza porta ancora `/Title` uguale al
# nome dell'export Canva (`..._Canva_Editable.pptx`): il visore PDF di Chrome
# lo usa come titolo della scheda e come nome proposto al salvataggio, ed è il
# motivo per cui il CV finiva sul disco con "pptx" nel nome.
METADATA = {
    'it': {
        '/Title': 'Lorenzo Melis - CV',
        '/Subject': 'Curriculum vitae di Lorenzo Melis, Junior Full-Stack Developer',
    },
    'en': {
        '/Title': 'Lorenzo Melis - CV',
        '/Subject': 'Curriculum vitae of Lorenzo Melis, Junior Full-Stack Developer',
    },
}

# --------------------------------------------------------------------- lettura

reader = PdfReader(SRC)
page = reader.pages[0]
xobject = page['/Resources']['/XObject']['/X13'].get_object()
data = xobject.get_data()
fonts = xobject['/Resources']['/Font']


def embedded_forward(key):
    """gid -> unicode letto dal font incorporato."""
    descriptor = (
        fonts[key].get_object()['/DescendantFonts'][0].get_object()['/FontDescriptor']
        .get_object()
    )
    ttf = TTFont(io.BytesIO(descriptor['/FontFile2'].get_object().get_data()))
    index = {name: i for i, name in enumerate(ttf.getGlyphOrder())}
    forward = {}
    for codepoint, glyph_name in ttf.getBestCmap().items():
        gid = index.get(glyph_name)
        if gid is not None:
            forward.setdefault(gid, chr(codepoint))
    return forward


FORWARD = {key: embedded_forward(key) for key in SYSTEM_FONTS}

BLOCK_RE = re.compile(rb'BT\n.*?\nET', re.S)
CM_RE = re.compile(rb'([-\d.]+) 0 0 ([-\d.]+) ([-\d.]+) ([-\d.]+) cm')
TF_RE = re.compile(rb'/(F\d+)\s+([\d.]+)\s+Tf')
TM_RE = re.compile(rb'1 0 0 -1 ([-\d.]+) ([-\d.]+) Tm')

blocks = []
for match in BLOCK_RE.finditer(data):
    body = data[match.start() + 3:match.end() - 3]
    tf = TF_RE.search(body)
    tm = TM_RE.search(body)
    cm = CM_RE.findall(data[:match.start()])
    key = '/' + tf.group(1).decode()
    text = ''
    for _, _, raw in find_strings(body):
        payload = parse_pdf_string(raw)
        for i in range(0, len(payload) - 1, 2):
            text += FORWARD[key].get(payload[i] * 256 + payload[i + 1], '')
    blocks.append({
        'index': len(blocks),
        'start': match.start(),
        'end': match.end(),
        'font': key,
        'size': float(tf.group(2)),
        'x': float(tm.group(1)) if tm else 0.0,
        'y': float(tm.group(2)) if tm else 0.0,
        'cmx': float(cm[-1][2]) if cm else 0.0,
        'cmy': float(cm[-1][3]) if cm else 0.0,
        'text': text,
    })

# Paragrafi: stesso `cm`. Righe: stessa `Tm.y`.
paragraphs = {}
for block in blocks:
    paragraphs.setdefault((block['cmx'], block['cmy']), []).append(block)

# --------------------------------------------------------- sottoinsiemi font

needed = {key: set(' |-,.():/&;+') for key in SYSTEM_FONTS}
for block in blocks:
    needed[block['font']].update(block['text'])
for entry in TRANSLATIONS.values():
    if 'map' in entry:
        for index, text in entry['map'].items():
            needed[blocks[index]['font']].update(text)
    if 'flow' in entry:
        for index, text in entry['flow']['labels']:
            needed[blocks[index]['font']].update(text)
        # il testo che scorre eredita il font dell'ultimo run della prima riga
        needed['/F10'].update(entry['flow']['text'])
        needed['/F12'].update(entry['flow']['text'])

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
    NEW[key] = {'bytes': payload, 'rev': reverse, 'widths': widths}
    missing = sorted(ch for ch in needed[key] if ch not in reverse)
    if missing:
        print(f'  ATTENZIONE {key}: glifi mancanti {missing!r}')


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


def fmt(value):
    text = f'{value:.5f}'.rstrip('0').rstrip('.')
    return text if text else '0'


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


# ------------------------------------------------------- larghezza di colonna

# Un paragrafo affiancato da un altro con la stessa `cm.y` sta in mezza colonna.
right_column_y = {cmy for (cmx, cmy) in paragraphs if cmx > 3000}
CONTENT_RIGHT = 6814.0  # bordo destro del testo, in unità del form XObject


def column_limit(cmx, cmy):
    full = (CONTENT_RIGHT - cmx) / SCALE
    if cmx < 3000 and cmy in right_column_y:
        return (3603.6367 - cmx) / SCALE - 20
    return full


# ------------------------------------------------- ricostruzione dei blocchi

def make_block(key, size, x, y, text):
    head = b'BT\n/%s %s Tf\n1 0 0 -1 %s %s Tm\n' % (
        key[1:].encode(), fmt(size).encode(), fmt(x).encode(), fmt(y).encode())
    body = (b'(%s) Tj\n' % escape_pdf_bytes(encode(text, key))) if text else b''
    return head + body + b'ET'


replacements = {}
moved = {}  # indice blocco -> (x vecchia, x nuova, testo vecchio, testo nuovo)

for (cmx, cmy), group in paragraphs.items():
    first = min(block['index'] for block in group)
    entry = TRANSLATIONS.get(first, {})
    limit = column_limit(cmx, cmy)

    lines = {}
    for block in group:
        lines.setdefault(block['y'], []).append(block)
    ordered_y = sorted(lines)
    for y in ordered_y:
        lines[y].sort(key=lambda b: b['x'])

    if 'flow' in entry:
        spec = entry['flow']
        label_text = {index: text for index, text in spec['labels']}
        head_line = lines[ordered_y[0]]
        # I run fissi stanno in testa; l'ultimo run porta il testo che scorre.
        fixed = [b for b in head_line if b['index'] in label_text]
        flowing = [b for b in head_line if b['index'] not in label_text]
        flow_block = flowing[-1] if flowing else head_line[-1]

        cursor = head_line[0]['x']
        for block in fixed:
            text = label_text[block['index']]
            replacements[block['index']] = make_block(
                block['font'], block['size'], cursor, block['y'], text)
            cursor += width_of(text, block['font'], block['size'])

        key, size = flow_block['font'], flow_block['size']
        first_limit = limit - cursor
        words = spec['text'].split(' ')
        head_text, rest = '', []
        for position, word in enumerate(words):
            candidate = f'{head_text} {word}'.strip()
            if head_text and width_of(candidate, key, size) > first_limit:
                rest = words[position:]
                break
            head_text = candidate

        replacements[flow_block['index']] = make_block(
            key, size, cursor, flow_block['y'], head_text)
        # Anche qui va registrato lo spostamento: se il run che scorre è un
        # link (es. "Altri progetti: github.com/..."), la sua sottolineatura
        # deve seguirlo.
        if abs(cursor - flow_block['x']) > 0.01 or head_text != flow_block['text']:
            moved[flow_block['index']] = (
                flow_block['x'], cursor, flow_block['text'], head_text)
        for block in flowing[:-1]:
            replacements[block['index']] = make_block(key, size, 0, block['y'], '')

        tail_lines = wrap(' '.join(rest), key, size, limit) if rest else []
        available = ordered_y[1:]
        assert len(tail_lines) <= len(available), (
            f'paragrafo {first}: servono {len(tail_lines) + 1} righe, '
            f'ce ne sono {len(available) + 1}')
        for position, y in enumerate(available):
            text = tail_lines[position] if position < len(tail_lines) else ''
            for block in lines[y]:
                replacements[block['index']] = make_block(
                    block['font'], block['size'], 0, y,
                    text if block is lines[y][0] else '')
        continue

    # Nessun riflusso: si riscrivono i run ricalcolando le x.
    mapping = entry.get('map', {})
    for y in ordered_y:
        cursor = lines[y][0]['x']
        for block in lines[y]:
            text = mapping.get(block['index'], block['text'])
            replacements[block['index']] = make_block(
                block['font'], block['size'], cursor, y, text)
            if abs(cursor - block['x']) > 0.01 or text != block['text']:
                moved[block['index']] = (block['x'], cursor, block['text'], text)
            cursor += width_of(text, block['font'], block['size'])

# ------------------------------------------------------- nuovo content stream

pieces, position = [], 0
for block in blocks:
    pieces.append(data[position:block['start']])
    pieces.append(replacements[block['index']])
    position = block['end']
pieces.append(data[position:])
new_data = b''.join(pieces)

# Sottolineature dei link: stessa x del testo, larghezza del testo.
for block in blocks:
    if block['index'] not in moved:
        continue
    old_x, new_x, old_text, new_text = moved[block['index']]
    old_width = width_of(old_text, block['font'], block['size'])
    new_width = width_of(new_text, block['font'], block['size'])
    # La larghezza scritta nel file non coincide al centesimo con quella
    # ricalcolata qui: il rettangolo si aggancia sulla x, che invece è esatta.
    # L'altezza fa da filtro: una sottolineatura è alta 2 unità, mentre a x=0
    # ci sono anche i grandi rettangoli di sfondo, che vanno lasciati stare.
    pattern = re.compile(
        (r'(?<![\d.])%s ([\d.]+) [\d.]+ ([\d.]+) re' % re.escape(fmt(old_x))).encode()
    )

    def move_underline(match):
        height = float(match.group(2))
        if height > 4:
            return match.group(0)
        return (r'%s %s %s %s re' % (
            fmt(new_x), match.group(1).decode(), fmt(new_width),
            match.group(2).decode())).encode()

    new_data, moves = pattern.subn(move_underline, new_data)
    if moves:
        print(f'  sottolineatura: blocco {block["index"]} ({moves})')

    # I ritagli dei discendenti seguono lo spostamento, in coordinate pagina.
    delta = (new_x - old_x) * SCALE
    if abs(delta) < 0.01:
        continue
    base = block['cmx'] + old_x * SCALE
    span = old_width * SCALE
    out_lines = []
    for line in new_data.split(b'\n'):
        match = re.fullmatch(rb'([-\d.]+) ([-\d.]+) (m|l)', line)
        if match:
            px = float(match.group(1))
            py = float(match.group(2))
            expected = block['cmy'] + block['y'] * SCALE
            if abs(py - expected) < 40 and base - 30 <= px <= base + span + 30:
                line = ('%s %s %s' % (fmt(px + delta), match.group(2).decode(),
                                      match.group(3).decode())).encode()
        out_lines.append(line)
    new_data = b'\n'.join(out_lines)

# ------------------------------------------------------------ scrittura PDF

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

# Annotazioni: seguono lo spostamento del testo che le sottolinea.
annotations = out_page.get('/Annots') or []
for annotation in annotations:
    obj = annotation.get_object()
    rect = obj['/Rect']
    left = float(rect[0])
    for index, (old_x, new_x, old_text, new_text) in moved.items():
        block = blocks[index]
        page_x = (block['cmx'] + old_x * SCALE) * PAGE_SCALE
        if abs(page_x - left) > 3:
            continue
        delta = (new_x - old_x) * SCALE * PAGE_SCALE
        width = width_of(new_text, block['font'], block['size']) * SCALE * PAGE_SCALE
        obj[NameObject('/Rect')] = ArrayObject([
            FloatObject(round(left + delta, 3)),
            rect[1],
            FloatObject(round(left + delta + width, 3)),
            rect[3],
        ])
        if index == HEADER_LINK_BLOCK:
            action = obj.get('/A')
            target = action if isinstance(action, DictionaryObject) else action.get_object()
            target[NameObject('/URI')] = TextStringObject(PORTFOLIO_URL)
        break

# Metadati: senza questo il file resta intestato all'export Canva e il visore
# PDF propone quel nome (con "pptx" dentro) al salvataggio.
writer.add_metadata({
    '/Title': METADATA[LANG]['/Title'],
    '/Subject': METADATA[LANG]['/Subject'],
    '/Author': 'Lorenzo Melis',
    '/Creator': 'Lorenzo Melis',
    '/Producer': 'Lorenzo Melis',
    '/Keywords': '',
})

os.makedirs(os.path.dirname(DST), exist_ok=True)
with open(DST, 'wb') as handle:
    writer.write(handle)

print('scritto', DST, os.path.getsize(DST) // 1024, 'KB')
