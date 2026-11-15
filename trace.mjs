// Build one open prefix of the sampled curve. Distance, rather than sample
// index, controls progress so tight loops and long arcs trace at the same speed.
export function prepareTrace(points) {
  const distances = new Float64Array(points.length);
  const ends = new Uint32Array(points.length);
  let path = '';
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    path += `${i ? 'L' : 'M'}${x.toFixed(3)},${y.toFixed(3)}`;
    ends[i] = path.length;
    if (i) distances[i] = distances[i - 1] + Math.hypot(x - points[i - 1][0], y - points[i - 1][1]);
  }
  const length = distances.at(-1) || 0;
  return {
    length,
    pathAt(progress) {
      if (!points.length) return '';
      if (progress >= 1) return path + 'Z';
      if (progress <= 0 || !length) return path.slice(0, ends[0]);
      const target = progress * length;
      let lo = 0, hi = points.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >>> 1;
        if (distances[mid] <= target) lo = mid;
        else hi = mid - 1;
      }
      if (lo === points.length - 1) return path;
      const span = distances[lo + 1] - distances[lo];
      const t = span ? (target - distances[lo]) / span : 0;
      const [x, y] = points[lo], [nx, ny] = points[lo + 1];
      return path.slice(0, ends[lo]) + `L${(x + (nx - x) * t).toFixed(3)},${(y + (ny - y) * t).toFixed(3)}`;
    },
  };
}

// One moving endpoint, including when the drawing has several visible layers.
// Full model geometry remains untouched for saving/exporting during playback.
export function animateTrace(entries, {
  duration,
  onFinish = () => {},
  onLayerChange = () => {},
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = id => cancelAnimationFrame(id),
} = {}) {
  let total = 0;
  const layers = entries.map(({path, points}) => {
    const trace = prepareTrace(points);
    const layer = {path, trace, original: path.getAttribute('d'), start: total, complete: false};
    total += trace.length;
    layer.end = total;
    path.setAttribute('d', trace.pathAt(0));
    return layer;
  });
  let running = true, frameId, started, current = -1;
  const restore = () => layers.forEach(layer => layer.path.setAttribute('d', layer.original));
  const tick = timestamp => {
    if (!running) return;
    started ??= timestamp;
    const progress = Math.min(1, Math.max(0, (timestamp - started) / duration));
    const distance = total * progress;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (distance >= layer.end) {
        if (!layer.complete) { layer.path.setAttribute('d', layer.original); layer.complete = true; }
      } else if (distance >= layer.start) {
        layer.path.setAttribute('d', layer.trace.pathAt((distance - layer.start) / layer.trace.length));
        if (current !== i) { current = i; onLayerChange(i + 1, layers.length); }
        break;
      }
    }
    if (progress >= 1) { running = false; restore(); onFinish(); }
    else frameId = requestFrame(tick);
  };
  frameId = requestFrame(tick);
  return {cancel() { if (!running) return; running = false; cancelFrame(frameId); restore(); }};
}
