import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
const ext = path.extname(file).toLowerCase();

try {
  if (ext === '.json') {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    const converted = convertAll(json);
    fs.writeFileSync(file, JSON.stringify(converted, null, 2));
  } else if (ext === '.atlas') {
    const raw = fs.readFileSync(file, 'utf8');
    const fixed = removeEmptyFirstLine(raw);
    if (fixed !== raw) {
      fs.writeFileSync(file, fixed);
    }
  } else {
    console.error('skip:', file);
  }
} catch (e) {
  console.error('FAIL', file, e.message);
  process.exit(1);
}

function removeEmptyFirstLine(text) {
  const hasBOM = text.charCodeAt(0) === 0xfeff;
  let s = hasBOM ? text.slice(1) : text;

  const m = s.match(/^[ \t]*\r?\n/);
  if (m) {
    const out = s.slice(m[0].length);
    return (hasBOM ? '\uFEFF' : '') + out;
  }
  if (/^[ \t]+$/.test(s)) return hasBOM ? '\uFEFF' : '';
  return text; 
}

function convertAll(data) {
  const cloned = JSON.parse(JSON.stringify(data));
  const animations = cloned.animations || {};

  for (const animName of Object.keys(animations)) {
    const anim = animations[animName];

    if (anim && anim.bones) {
      for (const boneName of Object.keys(anim.bones)) {
        const timelines = anim.bones[boneName];
        for (const tlType of Object.keys(timelines)) {
          const keys = timelines[tlType];
          if (!Array.isArray(keys)) continue;

          const is1D = tlType === 'rotate';
          const is2D = tlType === 'translate' || tlType === 'scale';
          if (!is1D && !is2D) continue;

          if (is1D) {
            for (const k of keys) {
              if ('angle' in k && !('value' in k)) {
                k.value = num(k.angle, 0);
                delete k.angle;
              }
            }
          }

          for (let i = 0; i < keys.length - 1; i++) {
            const k0 = keys[i];
            const k1 = keys[i + 1];

            const t0 = num(k0.time, 0);
            const t1 = num(k1.time, 0);
            const dt = t1 - t0;
            if (!(dt > 0)) {
              cleanupCurveProps(k0);
              continue;
            }

            if (k0.curve === 'stepped') {
              cleanupCurveProps(k0, { keepStepped: true });
              continue;
            }

            const c2 =
              'c2' in k0
                ? num(k0.c2, 0)
                : typeof k0.curve === 'number'
                  ? num(k0.curve, 0)
                  : 0;
            const c3 = 'c3' in k0 ? num(k0.c3, 1) : undefined;
            const c4 = 'c4' in k0 ? num(k0.c4, 1) : undefined;

            const cLeft = clamp01(c2);
            const cRight = clamp01(c4 ?? c3 ?? 1);

            const T1 = fix(t0 + cLeft * dt);
            const T2 = fix(t0 + cRight * dt);

            if (is1D) {
              const v0 = getPrev1DValue(keys, i);
              const v1 = getKey1DValue(k1);
              k0.curve = [T1, v0, T2, v1];
            } else if (is2D) {
              const [x0, y0] = getPrev2DValue(keys, i, tlType);
              const [x1, y1] = getKey2DValue(k1, tlType);
              k0.curve = [T1, x0, T2, x1, T1, y0, T2, y1];
            }

            cleanupCurveProps(k0);
          }
          if (keys.length) cleanupCurveProps(keys[keys.length - 1]);
        }
      }
    }

    if (anim && anim.deform && typeof anim.deform === 'object') {
      anim.attachments = anim.attachments || {};
      const deform = anim.deform;

      for (const skin of Object.keys(deform)) {
        anim.attachments[skin] = anim.attachments[skin] || {};
        const bySlot = deform[skin];
        if (!bySlot || typeof bySlot !== 'object') continue;

        for (const slot of Object.keys(bySlot)) {
          anim.attachments[skin][slot] = anim.attachments[skin][slot] || {};
          const byAttach = bySlot[slot];
          if (!byAttach || typeof byAttach !== 'object') continue;

          for (const attach of Object.keys(byAttach)) {
            const frames = byAttach[attach];
            anim.attachments[skin][slot][attach] =
              anim.attachments[skin][slot][attach] || {};
            anim.attachments[skin][slot][attach].deform = Array.isArray(frames)
              ? frames
              : [];
          }
        }
      }
      delete anim.deform;
    }
  }

  return cloned;
}

function num(value, defaultValue = 0) {
  return value == null || Number.isNaN(+value) ? defaultValue : +value;
}
function clamp01(x) {
  x = num(x);
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function fix(x) {
  return +(+x).toFixed(4);
}

function cleanupCurveProps(k, options = {}) {
  delete k.c2;
  delete k.c3;
  delete k.c4;
  if (!options.keepStepped && k.curve !== 'stepped' && !Array.isArray(k.curve))
    delete k.curve;
}

function default1D() {
  return 0;
}
function default2D(tl) {
  return tl === 'scale' ? [1, 1] : [0, 0];
}

function getKey1DValue(k) {
  if ('value' in k) return num(k.value, default1D());
  if ('angle' in k) return num(k.angle, default1D());
  return default1D();
}
function getPrev1DValue(arr, idx) {
  for (let j = idx; j >= 0; j--) {
    const k = arr[j];
    if ('value' in k) return num(k.value, default1D());
    if ('angle' in k) return num(k.angle, default1D());
  }
  return default1D();
}

function getKey2DValue(k, tl) {
  const [dx, dy] = default2D(tl);
  return ['x' in k ? num(k.x, dx) : dx, 'y' in k ? num(k.y, dy) : dy];
}
function getPrev2DValue(arr, idx, tl) {
  const [dx, dy] = default2D(tl);
  let x, y;
  for (let j = idx; j >= 0; j--) {
    const k = arr[j];
    if (x === undefined && 'x' in k) x = num(k.x, dx);
    if (y === undefined && 'y' in k) y = num(k.y, dy);
    if (x !== undefined && y !== undefined) break;
  }
  return [x === undefined ? dx : x, y === undefined ? dy : y];
}
