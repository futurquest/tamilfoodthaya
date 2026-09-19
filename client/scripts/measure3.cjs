const WebSocket = require('ws');
(async () => {
  const targets = await (await fetch('http://localhost:9255/json')).json();
  const page = targets.find(t => t.type === 'page');
  if (!page) { console.log(JSON.stringify({ error: 'no page' })); return; }
  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 128e6 });
  let id = 0; const pending = new Map();
  ws.on('message', raw => { const m = JSON.parse(raw.toString()); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  await new Promise(r => ws.on('open', r));
  const send = (method, params = {}) => new Promise(res => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });

  await send('Emulation.setDeviceMetricsOverride', { width: 1506, height: 735, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 3000));

  // Sample the active slot + track transform every 120ms for ~30s.
  const samples = await new Promise(resolve => {
    const out = [];
    const probe = `(() => {
      const img = document.querySelector('.event-gallery__card.is-active img');
      const track = document.querySelector('.event-gallery__track');
      const pos = document.querySelectorAll('.event-gallery__card').length;
      return {
        t: Date.now(),
        slot: document.querySelectorAll('.event-gallery__segment.is-active').length ? null : null,
        img: img ? img.getAttribute('src').split('/').pop() : null,
        x: track ? track.style.transform : null,
      };
    })()`;
    const runner = () => {
      send('Runtime.evaluate', { expression: probe, returnByValue: true }).then(m => {
        out.push(m.result.result.value);
        if (out.length < 150) setTimeout(runner, 120); else resolve(out);
      });
    };
    runner();
  });

  // Snapshot analysis: report runs where the image stays the same longest
  // (a dwell/stop), and the biggest single-frame x-candidates (a jump).
  let prevImg = null, runStart = 0, longest = { img: null, ms: 0 };
  const gates = [];
  samples.forEach((s, i) => {
    if (s.img !== prevImg) {
      const ms = s.t - runStart;
      if (prevImg && ms > longest.ms) longest = { img: prevImg, ms };
      runStart = s.t; prevImg = s.img;
    }
  });
  const ms = samples[samples.length - 1].t - runStart;
  if (ms > longest.ms) longest = { img: prevImg, ms };

  const frames = samples.map(s => s.x).filter(Boolean);
  console.log(JSON.stringify({
    sampleCount: samples.length,
    durationMs: samples[samples.length - 1].t - samples[0].t,
    activeImgs: [...new Set(samples.map(s => s.img))],
    longestStill: longest,
    xCount: frames.length,
    firstX: frames[0],
    lastX: frames[frames.length - 1],
  }, null, 2));
  ws.close();
})().catch(e => { console.error(e); process.exit(1); });
