---
'@office-kit/pptx-preview': patch
---

fix(preview): stop shrinking text in shapes without `<a:normAutofit>`

PowerPoint never shrinks text in shapes that lack `<a:normAutofit>`:
`<a:noAutofit>` (or no autofit element) simply overflows the box, and
`<a:spAutoFit>` grows the box to fit the text. The preview applied a
heuristic shrink-to-fit to such shapes, which rendered template
placeholders (font size inherited from the layout/master, box authored
tightly around the sample text) at down to 0.4× of their PowerPoint
size. The heuristic estimator is removed; only an authored
`<a:normAutofit>` (with or without a baked `fontScale`) shrinks text,
matching PowerPoint.
