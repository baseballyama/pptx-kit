---
'@office-kit/pptx': minor
'@office-kit/pptx-preview': minor
---

Combo charts: per-series `chartKind` overrides and a secondary value axis.

`ChartSeries` gains `chartKind` (`'bar' | 'column' | 'line' | 'area'`) to
overlay e.g. a line series on a column chart, and `secondaryAxis: true` to
plot a series against a right-hand secondary value axis — the standard
PowerPoint combo layout for series with mixed units (counts vs. rates).
The builder splits series into plot groups (`<c:barChart>` + `<c:lineChart>`
…) and emits the secondary `<c:valAx>`/`<c:catAx>` pair on demand;
`getShapeChartSpec` round-trips both fields. The preview renderer paints
bars below line/area overlays, scales each axis from its own series, and
draws the secondary ticks on the plot's right edge.
