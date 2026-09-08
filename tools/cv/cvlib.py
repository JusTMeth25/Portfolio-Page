import re
from pypdf import PdfReader

PDF = 'Lorenzo_Melis_CV_Canva_Editable.pptx.pdf'


def load(path=PDF):
    reader = PdfReader(path)
    page = reader.pages[0]
    xo = page['/Resources']['/XObject']['/X13'].get_object()
    return reader, page, xo


def cmap_maps(font):
    cmap = font['/ToUnicode'].get_object().get_data().decode('latin-1')
    fwd = {}
    for blk in re.findall(r'beginbfchar(.*?)endbfchar', cmap, re.S):
        for src, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            fwd[int(src, 16)] = chr(int(dst, 16))
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', cmap, re.S):
        for lo, hi, dst in re.findall(
                r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            lo, hi, dst = int(lo, 16), int(hi, 16), int(dst, 16)
            for i in range(lo, hi + 1):
                fwd[i] = chr(dst + i - lo)
    rev = {}
    for cid, ch in fwd.items():
        rev.setdefault(ch, cid)
    return fwd, rev


def widths(font):
    df = font['/DescendantFonts'][0].get_object()
    w = {}
    W = df.get('/W')
    if W:
        W = [x.get_object() if hasattr(x, 'get_object') else x for x in W]
        i = 0
        while i < len(W):
            first = int(W[i])
            nxt = W[i + 1]
            if isinstance(nxt, list):
                for j, wid in enumerate(nxt):
                    w[first + j] = float(wid)
                i += 2
            else:
                last = int(nxt)
                wid = float(W[i + 2])
                for c in range(first, last + 1):
                    w[c] = wid
                i += 3
    return w, float(df.get('/DW', 1000))


ESCAPES = {ord('n'): 10, ord('r'): 13, ord('t'): 9, ord('b'): 8,
           ord('f'): 12, 0x28: 0x28, 0x29: 0x29, 0x5C: 0x5C}


def parse_pdf_string(raw):
    out = bytearray()
    i = 0
    while i < len(raw):
        c = raw[i]
        if c == 0x5C:
            nxt = raw[i + 1]
            if nxt in ESCAPES:
                out.append(ESCAPES[nxt])
                i += 2
            elif 0x30 <= nxt <= 0x37:
                j = i + 1
                digits = ''
                while j < len(raw) and len(digits) < 3 and 0x30 <= raw[j] <= 0x37:
                    digits += chr(raw[j])
                    j += 1
                out.append(int(digits, 8) & 0xFF)
                i = j
            elif nxt == 0x0A:
                i += 2
            else:
                out.append(nxt)
                i += 2
        else:
            out.append(c)
            i += 1
    return bytes(out)


def find_strings(body):
    """Return list of (start, end, raw_inner_bytes) for literal PDF strings."""
    res = []
    i = 0
    n = len(body)
    while i < n:
        if body[i] == 0x28:
            j = i + 1
            depth = 1
            while j < n:
                ch = body[j]
                if ch == 0x5C:
                    j += 2
                    continue
                if ch == 0x28:
                    depth += 1
                elif ch == 0x29:
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            res.append((i, j + 1, body[i + 1:j]))
            i = j + 1
        else:
            i += 1
    return res


def escape_pdf_bytes(b):
    out = bytearray()
    for x in b:
        if x in (0x28, 0x29, 0x5C):
            out.append(0x5C)
        out.append(x)
    return bytes(out)


def encode_text(text, rev):
    """unicode -> 2-byte CID string bytes. Raises on missing glyph."""
    out = bytearray()
    missing = []
    for ch in text:
        cid = rev.get(ch)
        if cid is None:
            missing.append(ch)
            cid = rev.get(' ', 3)
        out.append((cid >> 8) & 0xFF)
        out.append(cid & 0xFF)
    return bytes(out), missing


def text_width(text, rev, wmap, dw, size):
    total = 0.0
    for ch in text:
        cid = rev.get(ch)
        total += wmap.get(cid, dw) if cid is not None else dw
    return total * size / 1000.0
