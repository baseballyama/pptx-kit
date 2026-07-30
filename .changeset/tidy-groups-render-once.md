---
'@office-kit/pptx-preview': patch
---

fix: render group children exactly once

`getSlideShapes` / `getSlideLayoutShapes` / `getSlideMasterShapes` flatten
group descendants into their result, while `renderSlideToSvg` already recurses
into groups and draws every child with the group transform applied. Rendering
the flat list verbatim painted each group child a second time, untransformed —
visibly offset whenever the group's `chOff` differs from its `off` (common in
Google Slides exports, e.g. shape-built charts showing doubled axis labels).

`auditTextLayout` had the same double-enumeration and reported each group
child's issues twice; it now audits every shape exactly once.
