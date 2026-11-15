// The date ticket as a Rive animation (rive/ticket, built with the Rive CLI): "send" on his phone, "arrive" on hers.
// The runtime (rive/web, not shipped in the app build while the splash issue stands) loads only the first time a ticket plays. Any failure returns null and the CSS version plays.
let rtP = null;
function runtime() {
  if (!rtP) rtP = new Promise((ok, no) => {
    if (window.rive) return ok(window.rive);
    const s = document.createElement('script'); s.src = 'rive/web/rive.js';
    s.onload = () => (window.rive ? ok(window.rive) : no(new Error('rive'))); s.onerror = no; document.head.appendChild(s);
  }).then(R => { R.RuntimeLoader.setWasmUrl('rive/web/rive.wasm'); return R; }).catch(e => { rtP = null; throw e; });
  return rtP;
}
// Off by default: files exported on Rive's free plan open with a black "RIVE" splash screen that hides the ticket.
// Preview it with ?rive=1 until the file is exported from a plan without the splash.
const ON = /[?&]rive=1/.test(location.search);
export const preload = () => (ON ? runtime().catch(() => {}) : Promise.resolve());
// canvas: an empty <canvas> already in the page. data: title, plan, name, when, from, date. trig: 'send' or 'arrive'.
export async function play(canvas, data, trig, ms = 6000) {
  if (!ON) return null;
  try {
    const R = await runtime();
    return await new Promise((ok, no) => {
      const t = setTimeout(() => no(new Error('slow')), ms);
      const r = new R.Rive({
        src: 'rive/web/ticket.riv', canvas, stateMachines: 'Ticket', autoplay: true, autoBind: true,
        layout: new R.Layout({ fit: R.Fit.Contain, alignment: R.Alignment.Center }),
        onLoad: () => {
          clearTimeout(t); r.resizeDrawingSurfaceToCanvas();
          const vm = r.viewModelInstance;
          for (const k in data) { try { const p = vm && vm.string(k); if (p) p.value = String(data[k] ?? ''); } catch {} }
          let fired = false;
          try { const tr = vm && vm.trigger(trig); if (tr) { tr.trigger(); fired = true; } } catch {}
          if (!fired) { const i = (r.stateMachineInputs('Ticket') || []).find(x => x.name === trig); if (i) i.fire(); }
          ok(r);
        },
        onLoadError: e => { clearTimeout(t); no(e); },
      });
    });
  } catch { return null; }
}
