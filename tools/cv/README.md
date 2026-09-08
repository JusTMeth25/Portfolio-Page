# Aggiornare la sezione progetti del CV

Script one-off usato per riscrivere la sezione **Selected Development Projects**
del CV PDF esportato da Canva, mantenendo layout, font, colori e link del
documento originale.

Serve solo se vuoi rigenerare il PDF partendo di nuovo dall'export Canva.
Se hai un CV nuovo, di solito basta sostituire
`public/cv/lorenzo-melis-cv.pdf`.

## Uso

```bash
pip install pypdf fonttools
python tools/cv/cvrewrite.py <export-canva.pdf> public/cv/lorenzo-melis-cv.pdf
```

I testi dei tre progetti stanno nella costante `PROJECTS` in `cvrewrite.py`.

## Cosa fa

1. Sostituisce i font incorporati (sottoinsiemi di Arial privi di molti glifi)
   con nuovi sottoinsiemi generati da Arial di sistema, che contengono tutti i
   caratteri vecchi e nuovi.
2. Ricodifica **tutte** le stringhe del content stream con i nuovi glyph id,
   comprese quelle in forma esadecimale.
3. Riscrive i blocchi di testo della sezione progetti calcolando le posizioni
   orizzontali dalle metriche reali dei font e mandando a capo entro la
   larghezza della colonna.
4. Sposta di conseguenza le sottolineature del link "Repository", i ritagli dei
   discendenti e le annotazioni `/Link`, e ne aggiorna gli URL.
5. Riscrive le mappe `ToUnicode`: il PDF risulta selezionabile, ricercabile e
   leggibile dai parser automatici (nell'export originale la mappa era
   incompleta e le cifre venivano estratte in modo errato).

## Note

- Richiede Arial di sistema (`C:\Windows\Fonts\arial*.ttf`): il CV originale è
  già in Arial, quindi le metriche coincidono e il layout non cambia.
- Gli indici dei blocchi di testo in `LAYOUT` dipendono dalla struttura di
  questo specifico export Canva. Lo script si ferma con un `assert` se la
  struttura non corrisponde, invece di produrre un PDF corrotto.
- Verifica sempre il risultato: `python -c "from pypdf import PdfReader;
  print(PdfReader('public/cv/lorenzo-melis-cv.pdf').pages[0].extract_text())"`
  e un'occhiata al rendering.
