---
'@office-kit/pptx-preview': minor
---

feat: let `renderSlideToImage` / `renderSlideToRgba` load extra rasterizer fonts

`RenderImageOptions` gains `fontFiles` (extra ttf / otf / ttc paths handed to
resvg alongside the bundled Latin faces) and `loadSystemFonts` (opt-in OS font
fallback, default `false` to keep output deterministic). The bundled set has
no CJK coverage, so decks with Japanese / Chinese / Korean text previously
rasterized as missing-glyph boxes with no way to fix it — now callers can
supply a CJK face, pairing it with `buildFontkitMeasurer({ fonts })` so wrap
math and painted glyphs use the same metrics.
