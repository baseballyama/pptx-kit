// Combo charts — per-series `chartKind` overrides and the secondary
// value axis (`secondaryAxis: true`).
//
// Verifies end-to-end:
//   - The builder splits the series into plot groups (`<c:barChart>` +
//     `<c:lineChart>`) and emits the secondary axis pair on demand.
//   - `getShapeChartSpec` round-trips `chartKind` / `secondaryAxis`.
//   - Non-combo base kinds reject the per-series fields.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  addSlideChart,
  getShapeChartSpec,
  getSlides,
  inches,
  loadPresentation,
  readPackagePart,
  savePresentation,
} from '../src/api/index.ts';

const fixture = (name: string): string =>
  fileURLToPath(new URL(`./fixtures/minimal/${name}`, import.meta.url));

const decoder = new TextDecoder();

describe('fn API: combo charts', () => {
  it('column + line(secondaryAxis) emits both plot groups and the secondary axis pair', async () => {
    const pres = await loadPresentation(await readFile(fixture('two-slides.pptx')));
    const slide = getSlides(pres)[0]!;

    addSlideChart(slide, {
      x: inches(0.5),
      y: inches(0.5),
      w: inches(8),
      h: inches(4.5),
      spec: {
        kind: 'column',
        categories: ['速い', '普通', '遅い'],
        series: [
          { name: '件数', values: [92, 118, 54] },
          { name: '平均スコア', values: [4.5, 3.8, 2.9], chartKind: 'line', secondaryAxis: true },
        ],
      },
    });

    const bytes = await savePresentation(pres);
    const reloaded = await loadPresentation(bytes);
    const chartXmlBytes = readPackagePart(reloaded, '/ppt/charts/chart1.xml');
    expect(chartXmlBytes).not.toBeNull();
    const xml = decoder.decode(chartXmlBytes!);

    expect(xml).toContain('<c:barChart>');
    expect(xml).toContain('<c:lineChart>');
    // Secondary value axis on the right, crossing at max, with its
    // deleted companion category axis.
    expect(xml).toContain('<c:axId val="444444444"/>');
    expect(xml).toContain('<c:axPos val="r"/>');
    expect(xml).toContain('<c:crosses val="max"/>');
    expect(xml).toContain('<c:axId val="333333333"/>');
    // The line group must reference the secondary pair, the bar group
    // the primary pair.
    const lineChartXml = xml.slice(xml.indexOf('<c:lineChart>'), xml.indexOf('</c:lineChart>'));
    expect(lineChartXml).toContain('<c:axId val="333333333"/>');
    expect(lineChartXml).toContain('<c:axId val="444444444"/>');
    const barChartXml = xml.slice(xml.indexOf('<c:barChart>'), xml.indexOf('</c:barChart>'));
    expect(barChartXml).toContain('<c:axId val="111111111"/>');
    expect(barChartXml).toContain('<c:axId val="222222222"/>');
  });

  it('round-trips chartKind / secondaryAxis through getShapeChartSpec', async () => {
    const pres = await loadPresentation(await readFile(fixture('two-slides.pptx')));
    const slide = getSlides(pres)[0]!;

    addSlideChart(slide, {
      x: inches(0.5),
      y: inches(0.5),
      w: inches(8),
      h: inches(4.5),
      spec: {
        kind: 'column',
        categories: ['A', 'B'],
        series: [
          { name: 'count', values: [100, 200] },
          { name: 'rate', values: [0.5, 0.7], chartKind: 'line', secondaryAxis: true },
        ],
      },
    });

    const bytes = await savePresentation(pres);
    const reloaded = await loadPresentation(bytes);
    const shapes = getSlides(reloaded)[0]!;
    const chartShape = (await import('../src/api/index.ts')).getSlideShapes(shapes).at(-1)!;
    const spec = getShapeChartSpec(chartShape);
    expect(spec).not.toBeNull();
    expect(spec!.kind).toBe('column');
    expect(spec!.series).toHaveLength(2);
    const [count, rate] = spec!.series;
    expect(count!.chartKind).toBeUndefined();
    expect(count!.secondaryAxis).toBeUndefined();
    expect(rate!.chartKind).toBe('line');
    expect(rate!.secondaryAxis).toBe(true);
    expect(rate!.values).toEqual([0.5, 0.7]);
  });

  it('rejects per-series combo fields on pie charts', async () => {
    const pres = await loadPresentation(await readFile(fixture('two-slides.pptx')));
    const slide = getSlides(pres)[0]!;

    expect(() =>
      addSlideChart(slide, {
        x: inches(1),
        y: inches(1),
        w: inches(4),
        h: inches(4),
        spec: {
          kind: 'pie',
          categories: ['A', 'B'],
          series: [{ name: 's', values: [1, 2], secondaryAxis: true }],
        },
      }),
    ).toThrow(/combo/);
  });
});
