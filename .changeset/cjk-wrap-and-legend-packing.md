---
'@office-kit/pptx-preview': patch
---

East Asian line breaking and measured legend packing.

The text layout engine tokenized wrapped text by whitespace only, so a
space-free CJK clause travelled as one unbreakable "word" — the greedy
wrapper pushed the whole clause to the next line, leaving artifacts like a
lone bullet glyph on its own line. CJK runs now break between any two
characters with simple kinsoku (closing punctuation glued to its
predecessor, opening brackets to their successor), matching PowerPoint's
East Asian line breaking.

Chart legends previously packed items into fixed-width slots
(`min(140px, frameW / n)`), so long CJK series names overflowed into the
neighbouring item. Horizontal legends ('b'/'t') now pack items by an
estimated per-label width and shrink the font when the row exceeds the
frame; vertical legends ('r'/'tr') size the right column to the widest
label instead of a fixed 100px.
