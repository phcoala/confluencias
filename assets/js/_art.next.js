/* =============================================================
   CONFLUÊNCIAS — arte original em SVG
   Personagens, cabelos, tecidos, rios e diagramas desenhados
   para esta apresentação. Nenhum recurso externo.
   -------------------------------------------------------------
   COMO CADA PERSONAGEM É MONTADO (de trás para a frente):
     sombra · cabelo de trás · perna de trás · pernas · tronco
     · roupa · braço de trás · braço da frente · orelhas · cabeça
     · cabelo da frente · barba · rosto · acessórios
   Cada peça recebe uma classe (ch-*) e o CSS cuida do movimento.
   O desenho é o mesmo para todo mundo: o que muda é o que entra
   como parâmetro — tom, forma do rosto, nariz, lábios, olhos,
   cabelo, roupa, pose. Nenhum recurso vem de fora.
   ============================================================= */
const Art = (function () {
  'use strict';

  let uid = 0;
  const nid = (p) => `${p}${(uid += 1)}`;

  /* números com uma casa: o SVG fica menor e não perde nada */
  const n = (v) => (Math.round(v * 10) / 10);
  const pct = (v) => Math.round(v * 100) + '%';

  function safe(c, fb) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(String(c || '').trim()) ? c.trim() : fb;
  }
  function rgb(hex) {
    const v = hex.slice(1);
    const s = v.length === 3 ? v.split('').map((x) => x + x).join('') : v.slice(0, 6);
    const num = parseInt(s, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  function hexOf(r, g, b) {
    return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  }
  /* mistura simples em sRGB: serve para gerar sombra e luz a partir
     de um tom único, em vez de manter três cores na mão */
  function mix(a, b, t) {
    const A = rgb(safe(a, '#000000')), B = rgb(safe(b, '#000000'));
    return hexOf(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  const dark = (c, t) => mix(c, '#160C07', t);
  const light = (c, t) => mix(c, '#FFF6E9', t);
  const shade = (c, amt) => (amt < 0 ? dark(c, Math.min(1, -amt / 100)) : light(c, Math.min(1, amt / 100)));

  /* =============================================================
     1. TONS DE PELE
     A escala vai da mais clara (1) à mais retinta (13) e cada tom
     carrega o subtom usado pelas pesquisas: quente, frio ou neutro.
     Nenhum tom é "melhor" que o outro: só são treze peles.
     ============================================================= */
  const TONE_ROWS = [
    [1,  'Marfim',     '#F8E3C9', 'frio',    'amarelo'],
    [2,  'Areia',      '#F3CDA6', 'quente',  'dourado'],
    [3,  'Mel claro',  '#EBBB8C', 'quente',  'dourado'],
    [4,  'Caramelo',   '#E0A878', 'quente',  'acaju'],
    [5,  'Âmbar',      '#D1935D', 'neutro',  'dourado'],
    [6,  'Mel',        '#C68552', 'neutro',  'oliva'],
    [7,  'Canela',     '#B1713F', 'quente',  'acaju'],
    [8,  'Castanho',   '#9C5F35', 'neutro',  'oliva'],
    [9,  'Nogueira',   '#854C2A', 'quente',  'acaju'],
    [10, 'Cacau',      '#6E3A20', 'quente',  'acaju'],
    [11, 'Chocolate',  '#5A2C17', 'frio',    'azulado'],
    [12, 'Ébano',      '#452111', 'frio',    'azulado'],
    [13, 'Retinto',    '#31170B', 'frio',    'azulado']
  ];
  const TONES = {};
  TONE_ROWS.forEach(([k, name, hex, under, sub]) => {
    TONES[k] = {
      k, name, hex, under, sub,
      shade: dark(hex, 0.17),   /* longe da luz */
      deep: dark(hex, 0.34),    /* contorno e sombra de contato */
      lite: light(hex, 0.2)     /* maçã do rosto, testa, ombro */
    };
  });
  const TONE_ORDER = TONE_ROWS.map((r) => r[0]);

  const TONE_TOOLTIP = {
    quente: 'subtom quente: dourado, acaju',
    frio: 'subtom frio: amarelado, azulado',
    neutro: 'subtom neutro: fica no meio'
  };

  /* =============================================================
     2. CORES DE CABELO
     ============================================================= */
  const PANTS = '#33303F';   /* calça: neutra, para a roupa assumir a cor */
  const HAIR = {
    black:  { base: '#20130D', mid: '#3B2318', lite: '#5C3A26' },
    dark:   { base: '#2E1B12', mid: '#4C2C1B', lite: '#6E4327' },
    brown:  { base: '#432616', mid: '#63391F', lite: '#8A5329' },
    auburn: { base: '#5E2A16', mid: '#833C1E', lite: '#A9562A' },
    honey:  { base: '#7A4A1E', mid: '#9E6828', lite: '#C38D46' },
    silver: { base: '#9A938C', mid: '#BDB6AD', lite: '#E2DCD3' },
    white:  { base: '#C9C2B8', mid: '#E1DAD0', lite: '#F6F2EA' }
  };

  /* =============================================================
     3. ESQUELETO
     viewBox 0 0 220 320, todo mundo de pé na mesma linha do chão.
     f = silhueta feminina, m = masculina, k = criança. A criança é
     menor que o adulto de verdade: o desenho respeita a altura.
     ============================================================= */
  const VY = {
    f: { cy: 48,   ry: 29,   rx: 23.4, chin: 77.5, shoY: 97,  chestY: 124, waistY: 152, hipY: 178, crotchY: 192, kneeY: 248, ankleY: 299 },
    m: { cy: 47.5, ry: 29.2, rx: 23.8, chin: 77,   shoY: 97,  chestY: 124, waistY: 153, hipY: 179, crotchY: 193, kneeY: 248, ankleY: 299 },
    k: { cy: 120,  ry: 26,   rx: 21,   chin: 147,  shoY: 167, chestY: 186, waistY: 205, hipY: 224, crotchY: 234, kneeY: 267, ankleY: 299 }
  };
  const SK = {
    f: { sho: 31.5, chest: 25.5, waist: 19.6, hip: 27, neck: 8.2, delt: 5.4,
         upArm: 13.6, foreArm: 10.2, hand: 6.9,
         legSep: 12.2, thigh: 12.4, knee: 9.4, calf: 10.6, ankle: 6.1, foot: 7.4, shoe: 8.6 },
    m: { sho: 38, chest: 30.5, waist: 25.4, hip: 28, neck: 10, delt: 6.6,
         upArm: 15.4, foreArm: 11.8, hand: 7.6,
         legSep: 13.4, thigh: 13.8, knee: 10.4, calf: 11.6, ankle: 6.9, foot: 8, shoe: 9 },
    k: { sho: 25, chest: 20.5, waist: 16.8, hip: 21.5, neck: 6.8, delt: 4.4,
         upArm: 10.8, foreArm: 8.4, hand: 5.8,
         legSep: 10, thigh: 10.2, knee: 7.8, calf: 8.6, ankle: 5.1, foot: 6.2, shoe: 7.2 }
  };
  const GROUND = 307;

  function skeleton(build) {
    const b = SK[build] ? build : 'f';
    return Object.assign({ build: b, cx: 110, ground: GROUND }, VY[b], SK[b]);
  }

  /* ---------- peças básicas ---------- */
  /* segmento com espessura que muda: braço, antebraço, dedo.
     A ponta é um arco, então o membro não termina em ângulo. */
  function seg(x1, y1, x2, y2, w1, w2) {
    const dx = x2 - x1, dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const px = -uy, py = ux;
    return `M${n(x1 + px * w1)} ${n(y1 + py * w1)}`
      + ` L${n(x2 + px * w2)} ${n(y2 + py * w2)}`
      + ` A${n(w2)} ${n(w2)} 0 0 0 ${n(x2 - px * w2)} ${n(y2 - py * w2)}`
      + ` L${n(x1 - px * w1)} ${n(y1 - py * w1)}`
      + ` A${n(w1)} ${n(w1)} 0 0 0 ${n(x1 + px * w1)} ${n(y1 + py * w1)} Z`;
  }
  /* direção do antebraço em graus, para girar a mão junto */
  const angOf = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI - 90;

  /* forma orgânica fechada: cabelo crespo, cocos, nuvens de volume.
     O balanço vem do índice, então a forma é sempre igual. */
  function blob(cx, cy, rx, ry, pts = 12, amp = 0.07, ph = 0.7) {
    const P = [];
    for (let i = 0; i < pts; i++) {
      const a = ph + (i / pts) * Math.PI * 2;
      const k = 1 + amp * (Math.sin(i * 2.4 + ph * 5) * 0.6 + Math.sin(i * 1.1 + ph * 2.4) * 0.4);
      P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(P[pts - 1], P[0]);
    let d = `M${n(m0[0])} ${n(m0[1])}`;
    for (let i = 0; i < pts; i++) {
      const c = P[i], e = mid(P[i], P[(i + 1) % pts]);
      d += ` Q${n(c[0])} ${n(c[1])} ${n(e[0])} ${n(e[1])}`;
    }
    return d + ' Z';
  }

  /* cachinho em espiral: a assinatura visual do fio crespo */
  function curlPath(x, y, r, rot = 0) {
    return `M${n(x - r)} ${n(y)} a${n(r)} ${n(r)} 0 1 1 ${n(r * 1.72)} 0 a${n(r * 0.58)} ${n(r * 0.58)} 0 1 1 ${n(-r * 1.02)} 0`;
  }
  function curl(x, y, r, rot = 0, w = 1.8, op = 0.34) {
  /* ---------- corpo ---------- */
  function torsoPath(s) {
    const { cx, neck, sho, chest, waist, hip, shoY, chestY, waistY, hipY, crotchY, chin, delt } = s;
    return `M${n(cx - neck)} ${n(chin - 9)}`
      + ` L${n(cx - neck)} ${n(shoY - 13)}`
      + ` C${n(cx - neck - 6)} ${n(shoY - 4)} ${n(cx - sho + delt)} ${n(shoY - 3)} ${n(cx - sho)} ${n(shoY + 5)}`
      + ` C${n(cx - sho - 1)} ${n(shoY + 16)} ${n(cx - chest - 1)} ${n(chestY - 8)} ${n(cx - chest)} ${n(chestY)}`
      + ` C${n(cx - chest + 1)} ${n(chestY + 15)} ${n(cx - waist - 1)} ${n(waistY - 11)} ${n(cx - waist)} ${n(waistY)}`
      + ` C${n(cx - waist - 2)} ${n(waistY + 13)} ${n(cx - hip - 1)} ${n(hipY - 11)} ${n(cx - hip)} ${n(hipY)}`
      + ` C${n(cx - hip)} ${n(hipY + 9)} ${n(cx - hip + 2)} ${n(crotchY - 5)} ${n(cx - hip * 0.46)} ${n(crotchY)}`
      + ` L${n(cx + hip * 0.46)} ${n(crotchY)}`
      + ` C${n(cx + hip - 2)} ${n(crotchY - 5)} ${n(cx + hip)} ${n(hipY + 9)} ${n(cx + hip)} ${n(hipY)}`
      + ` C${n(cx + hip + 1)} ${n(hipY - 11)} ${n(cx + waist + 2)} ${n(waistY + 13)} ${n(cx + waist)} ${n(waistY)}`
      + ` C${n(cx + waist + 1)} ${n(waistY - 11)} ${n(cx + chest - 1)} ${n(chestY + 15)} ${n(cx + chest)} ${n(chestY)}`
      + ` C${n(cx + chest + 1)} ${n(chestY - 8)} ${n(cx + sho + 1)} ${n(shoY + 16)} ${n(cx + sho)} ${n(shoY + 5)}`
      + ` C${n(cx + sho - delt)} ${n(shoY - 3)} ${n(cx + neck + 6)} ${n(shoY - 4)} ${n(cx + neck)} ${n(shoY - 13)}`
      + ` L${n(cx + neck)} ${n(chin - 9)} Z`;
  }

  function legPath(s, side) {
    const cxl = s.cx + side * s.legSep;
    const top = s.hipY - 8;
    const o = (v) => v;                 /* lado de fora */
    const i = (v) => v * 0.86;          /* lado de dentro, mais fino */
    const ox = (t) => (side < 0 ? cxl - o(t) : cxl - i(t));
    const ix = (t) => (side < 0 ? cxl + i(t) : cxl + o(t));
    const mid = top + (s.kneeY - top) * 0.5;
    return `M${n(ox(s.thigh))} ${n(top)}`
      + ` C${n(ox(s.thigh) - side)} ${n(mid)} ${n(ox(s.knee) - side)} ${n(s.kneeY - 26)} ${n(ox(s.knee))} ${n(s.kneeY)}`
      + ` C${n(ox(s.calf))} ${n(s.kneeY + 16)} ${n(ox(s.ankle))} ${n(s.ankleY - 34)} ${n(ox(s.ankle))} ${n(s.ankleY)}`
      + ` L${n(ix(s.ankle))} ${n(s.ankleY)}`
      + ` C${n(ix(s.ankle))} ${n(s.ankleY - 34)} ${n(ix(s.calf))} ${n(s.kneeY + 14)} ${n(ix(s.knee))} ${n(s.kneeY)}`
      + ` C${n(ix(s.knee) + side)} ${n(s.kneeY - 30)} ${n(ix(s.thigh) + side)} ${n(mid)} ${n(ix(s.thigh))} ${n(top)} Z`;
  }

  /* sapato: bico para fora, sola marcada */
  function shoePath(s, side) {
    const cxl = s.cx + side * s.legSep;
    const y = s.ankleY, w = s.foot, t = side * w * 0.95;
    return `M${n(cxl - w * 0.66)} ${n(y - 9)}`
      + ` C${n(cxl - w * 0.94)} ${n(y + 1)} ${n(cxl - w * 0.7)} ${n(y + 5.4)} ${n(cxl - w * 0.16)} ${n(y + 6.4)}`
      + ` L${n(cxl + t)} ${n(y + 6.4)}`
      + ` C${n(cxl + t + side * 1.8)} ${n(y + 6)} ${n(cxl + t + side * 1.5)} ${n(y - 1.4)} ${n(cxl + t - side * 1.6)} ${n(y - 2.8)}`
      + ` L${n(cxl + w * 0.66)} ${n(y - 9)} Z`;
  }

  /* cabeça: o contorno muda com a mandíbula e o queixo, então dois
     personagens não têm o mesmo rosto */
  const JAWS = {
    suave:   { jw: 0.6,  cw: 0.15, cheek: 1.0 },
    medio:   { jw: 0.72, cw: 0.21, cheek: 1.0 },
    marcado: { jw: 0.86, cw: 0.3,  cheek: 1.02 },
    redondo: { jw: 0.8,  cw: 0.25, cheek: 1.06 },
    fino:    { jw: 0.66, cw: 0.17, cheek: 0.96 }
  };
  function headPath(s, jaw) {
    const J = JAWS[jaw] || JAWS.medio;
    const { cx, rx, ry, cy } = s;
    const R = rx * J.cheek;
    const chin = cy + ry * 1.02;
    const top = cy - ry;
    return `M${n(cx - R)} ${n(cy - ry * 0.24)}`
      + ` C${n(cx - R)} ${n(top + ry * 0.16)} ${n(cx - R * 0.62)} ${n(top)} ${n(cx)} ${n(top)}`
      + ` C${n(cx + R * 0.62)} ${n(top)} ${n(cx + R)} ${n(top + ry * 0.16)} ${n(cx + R)} ${n(cy - ry * 0.24)}`
      + ` C${n(cx + R)} ${n(cy + ry * 0.2)} ${n(cx + R * J.jw + 1)} ${n(cy + ry * 0.58)} ${n(cx + R * J.cw)} ${n(chin)}`
      + ` C${n(cx + R * J.cw * 0.42)} ${n(chin + ry * 0.05)} ${n(cx - R * J.cw * 0.42)} ${n(chin + ry * 0.05)} ${n(cx - R * J.cw)} ${n(chin)}`
      + ` C${n(cx - R * J.jw - 1)} ${n(cy + ry * 0.58)} ${n(cx - R)} ${n(cy + ry * 0.2)} ${n(cx - R)} ${n(cy - ry * 0.24)} Z`;
  }

  function ear(s, side, tone) {
    const x = s.cx + side * (s.rx * 0.99), y = s.cy + s.ry * 0.14;
    return `<g class="ch-ear"><ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(s.rx * 0.2)}" ry="${n(s.ry * 0.24)}" fill="${tone.hex}"/>`
      + `<path d="M${n(x - side * 1.2)} ${n(y - 3.4)} q${n(side * 2.6)} 3.4 0 6.6" fill="none" stroke="${tone.deep}"`
      + ` stroke-width="1.4" opacity=".5" stroke-linecap="round"/></g>`;
  }

  /* mão: palma, quatro dedos sugeridos e polegar que troca de lado
     conforme o braço. Fica pequena na tela, mas tem forma de mão. */
  function hand(x, y, ang, r, side, fill, edge) {
    const f = [0.62, 0.24, -0.2, -0.6].map((d, i) => {
      const len = r * (i === 1 || i === 2 ? 0.98 : 0.84);
      return `<path d="M${n(d * r)} ${n(r * 1.15)} l${n(d * r * 0.06)} ${n(len)}" stroke="${edge}" stroke-width="${n(r * 0.4)}"`
        + ` stroke-linecap="round" opacity=".95"/>`;
    }).join('');
    return `<g class="ch-hand" transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})">`
      + `<path d="M${n(-r * 0.78)} ${n(r * 0.05)} q0 ${n(-r * 0.5)} ${n(r * 0.78)} ${n(-r * 0.55)}`
      + ` q${n(r * 0.78)} ${n(r * 0.05)} ${n(r * 0.78)} ${n(r * 0.55)} l0 ${n(r * 1.15)}`
      + ` q0 ${n(r * 0.42)} ${n(-r * 0.82)} ${n(r * 0.42)} q${n(-r * 0.74)} 0 ${n(-r * 0.74)} ${n(-r * 0.42)} Z" fill="${fill}"/>`
      + f
      + `<path d="M${n(-side * r * 0.6)} ${n(r * 0.5)} q${n(-side * r * 0.7)} ${n(r * 0.1)} ${n(-side * r * 0.62)} ${n(r * 0.78)}"`
      + ` fill="none" stroke="${edge}" stroke-width="${n(r * 0.42)}" stroke-linecap="round"/>`
      + `</g>`;
  }

  /* =============================================================
     4. ROSTO
     A posição dos olhos, do nariz e da boca sai do próprio esqueleto:
     rosto maior tem traço mais espaçado, criança tem tudo mais junto,
     como acontece de verdade.
     ============================================================= */
  function fg(s) {
    const eyeY = s.cy + s.ry * 0.02;
    return {
      eyeY,
      eyeDx: s.rx * 0.44,
      eyeRx: s.rx * 0.225,
      eyeRy: s.ry * 0.24,
      browY: eyeY - s.ry * 0.33,
      noseY0: eyeY + s.ry * 0.18,
      noseY1: eyeY + s.ry * 0.52,
      mouthY: eyeY + s.ry * 0.7
    };
  }
  const IRIS = { escuro: '#2A170D', castanho: '#4C2C18', mel: '#7C4B1B', verde: '#405E3D', cinza: '#4B4A52' };

  const EYES = {
    amendoa: { rx: 1,    ry: 1,    lid: 1.35, lash: 0 },
    redondo: { rx: 1.04, ry: 1.12, lid: 1.2,  lash: 0 },
    suave:   { rx: 1.06, ry: 0.86, lid: 1.1,  lash: 0 },
    gatinho: { rx: 1,    ry: 0.94, lid: 1.6,  lash: 1.1 },
    grande:  { rx: 1.12, ry: 1.1,  lid: 1.5,  lash: 0.7 },
    caido:   { rx: 1.02, ry: 0.92, lid: 1.15, lash: 0 }
  };

  /* um olho: esclera, íris grande, pupila, brilho, pálpebra e cílios */
  function eye(shape, x, y, side, g, iris) {
    const E = EYES[shape] || EYES.amendoa;
    const rx = g.eyeRx * E.rx, ry = g.eyeRy * E.ry;
    const ix = x + side * rx * 0.1, iy = y + ry * 0.08;
    const lash = E.lash
      ? `<g stroke="#1B0F08" stroke-width="${n(rx * 0.24)}" stroke-linecap="round" fill="none">
           <path d="M${n(x - rx * 0.95)} ${n(y - ry * 0.7)} l${n(-rx * 0.5)} ${n(-ry * 0.42)}"/>
           <path d="M${n(x + rx * 0.95)} ${n(y - ry * 0.7)} l${n(rx * 0.5)} ${n(-ry * 0.42)}"/>
         </g>` : '';
    return `<g class="ch-eye">
      <ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="#FBF4E8"/>
      <ellipse cx="${n(ix)}" cy="${n(iy)}" rx="${n(rx * 0.72)}" ry="${n(ry * 0.76)}" fill="${IRIS[iris] || IRIS.escuro}"/>
      <ellipse cx="${n(ix + side * 0.2)}" cy="${n(iy + ry * 0.06)}" rx="${n(rx * 0.32)}" ry="${n(ry * 0.36)}" fill="#160B05"/>
      <circle cx="${n(x - rx * 0.34)}" cy="${n(y - ry * 0.38)}" r="${n(rx * 0.24)}" fill="#FFFDF6" opacity=".9"/>
      <path d="M${n(x - rx * 1.04)} ${n(y - ry * 0.5)} Q${n(x)} ${n(y - ry * E.lid)} ${n(x + rx * 1.04)} ${n(y - ry * 0.5)}"
        fill="none" stroke="#241206" stroke-width="${n(rx * 0.3)}" stroke-linecap="round"/>
      ${lash}
    </g>`;
  }
  function eyeShut(x, y, w) {
    return `<g class="ch-eye ch-eye--shut">
      <path d="M${n(x - w)} ${n(y)} Q${n(x)} ${n(y - w * 1.06)} ${n(x + w)} ${n(y)}"
        fill="none" stroke="#241206" stroke-width="${n(w * 0.42)}" stroke-linecap="round"/>
    </g>`;
  }

  /* sobrancelha: reta, arqueada, grossa ou fina */
  const BROWS = {
    reta:     { w: 1.02, arch: 0.34, th: 0.2 },
    arqueada: { w: 1,    arch: 0.62, th: 0.18 },
    grossa:   { w: 1.06, arch: 0.4,  th: 0.3 },
    fina:     { w: 0.96, arch: 0.5,  th: 0.13 }
  };
  function brow(kind, x, y, side, g, col) {
    const B = BROWS[kind] || BROWS.arqueada;
    const w = g.eyeRx * B.w, h = g.eyeRy * B.th, arch = g.eyeRy * B.arch * 0.5;
  /* nariz: largo, médio, fino, chato ou adunco. As asas e as narinas
     mudam de largura — justamente o traço que o padrão único tratava
     como defeito, e que aqui é só mais uma variação. */
  const NOSES = {
    largo:  { w: 0.32, h: 1.06, wing: 1.5,  bridge: 0.5 },
    medio:  { w: 0.25, h: 1,    wing: 1.2,  bridge: 0.7 },
    fino:   { w: 0.19, h: 1.04, wing: 0.9,  bridge: 1 },
    chato:  { w: 0.34, h: 0.94, wing: 1.6,  bridge: 0.22 },
    adunco: { w: 0.23, h: 1.1,  wing: 1.05, bridge: 1.15 }
  };
  function nose(kind, s, g, tone) {
    const N = NOSES[kind] || NOSES.medio;
    const cx = s.cx;
    const w = s.rx * N.w * N.wing;
    const y1 = g.noseY0 + (g.noseY1 - g.noseY0) * N.h;
    const nr = n(w * 0.3), nry = n(w * 0.19);
    return `<g class="ch-nose">
      <path d="M${n(cx - w)} ${n(y1 - 2.4)} C${n(cx - w - 1.2)} ${n(y1 + 1)} ${n(cx - w * 0.42)} ${n(y1 + 2.6)} ${n(cx - w * 0.15)} ${n(y1 + 2.2)}`
      + ` L${n(cx + w * 0.15)} ${n(y1 + 2.2)} C${n(cx + w * 0.42)} ${n(y1 + 2.6)} ${n(cx + w + 1.2)} ${n(y1 + 1)} ${n(cx + w)} ${n(y1 - 2.4)}`
      + ` C${n(cx + w * 0.66)} ${n(y1 - 3.6)} ${n(cx - w * 0.66)} ${n(y1 - 3.6)} ${n(cx - w)} ${n(y1 - 2.4)} Z" fill="${tone.shade}" opacity=".45"/>`
      + `<ellipse cx="${n(cx - w * 0.58)}" cy="${n(y1 + 0.6)}" rx="${nr}" ry="${nry}" fill="${tone.deep}" opacity=".5" transform="rotate(-16 ${n(cx - w * 0.58)} ${n(y1 + 0.6)})"/>`
      + `<ellipse cx="${n(cx + w * 0.58)}" cy="${n(y1 + 0.6)}" rx="${nr}" ry="${nry}" fill="${tone.deep}" opacity=".5" transform="rotate(16 ${n(cx + w * 0.58)} ${n(y1 + 0.6)})"/>`
      + `<path d="M${n(cx + 1.4)} ${n(g.noseY0)} Q${n(cx - 1.2)} ${n((g.noseY0 + y1) / 2)} ${n(cx - w * 0.5)} ${n(y1 - 1.8)}"`
      + ` fill="none" stroke="${tone.shade}" stroke-width="${n(1.1 * N.bridge)}" opacity="${n(0.32 * N.bridge)}" stroke-linecap="round"/>`
      + `</g>`;
  }

  /* boca: volumosa, média ou fina. O lábio de cima tem arco e o de
     baixo é mais cheio; o tipo de boca muda essa proporção. */
  const LIPS_T = { volumosos: 1.36, medios: 1, finos: 0.66 };
  function mouth(kind, s, g, tone, mood) {
    const t = LIPS_T[kind] || 1;
    const cx = s.cx, y = g.mouthY, w = s.rx * 0.3 * (0.94 + t * 0.05);
    const up = mix('#8B3A38', tone.deep, 0.34);
    const dn = mix('#74292A', tone.deep, 0.22);
    const lo = mix(up, '#F7DEC8', 0.4);
    if (mood === 'grin') {
      return `<path d="M${n(cx - w)} ${n(y - 0.4)} Q${n(cx)} ${n(y + 1.4)} ${n(cx + w)} ${n(y - 0.4)}`
        + ` Q${n(cx + w * 0.8)} ${n(y + t * 5.4)} ${n(cx)} ${n(y + t * 5.6)}`
        + ` Q${n(cx - w * 0.8)} ${n(y + t * 5.4)} ${n(cx - w)} ${n(y - 0.4)} Z" fill="${dn}"/>`
        + `<path d="M${n(cx - w * 0.86)} ${n(y + 0.3)} Q${n(cx)} ${n(y + 2)} ${n(cx + w * 0.86)} ${n(y + 0.3)}`
        + ` Q${n(cx + w * 0.7)} ${n(y + 2.2)} ${n(cx)} ${n(y + 2.4)} Q${n(cx - w * 0.7)} ${n(y + 2.2)} ${n(cx - w * 0.86)} ${n(y + 0.3)} Z" fill="#FFF7ED"/>`;
    }
    if (mood === 'open') {
      return `<path d="M${n(cx - w * 0.8)} ${n(y - 0.6)} Q${n(cx)} ${n(y + 1)} ${n(cx + w * 0.8)} ${n(y - 0.6)}`
        + ` Q${n(cx + w * 0.6)} ${n(y + t * 4.6)} ${n(cx)} ${n(y + t * 4.8)} Q${n(cx - w * 0.6)} ${n(y + t * 4.6)} ${n(cx - w * 0.8)} ${n(y - 0.6)} Z" fill="${dn}"/>`
        + `<path d="M${n(cx - w * 0.5)} ${n(y + 0.4)} Q${n(cx)} ${n(y + 1.6)} ${n(cx + w * 0.5)} ${n(y + 0.4)}`
        + ` Q${n(cx + w * 0.4)} ${n(y + 1.8)} ${n(cx)} ${n(y + 1.9)} Q${n(cx - w * 0.4)} ${n(y + 1.8)} ${n(cx - w * 0.5)} ${n(y + 0.4)} Z" fill="#FFF7ED"/>`;
    }
    if (mood === 'flat') {
      return `<path d="M${n(cx - w * 0.9)} ${n(y + 0.6)} Q${n(cx)} ${n(y + t * 1.1)} ${n(cx + w * 0.9)} ${n(y + 0.6)}"`
        + ` fill="none" stroke="${up}" stroke-width="${n(1.5 * t + 1)}" stroke-linecap="round"/>`;
    }
    return `<path d="M${n(cx - w)} ${n(y - 0.6)} Q${n(cx - w * 0.5)} ${n(y + 0.4)} ${n(cx)} ${n(y - 1.5)}`
      + ` Q${n(cx + w * 0.5)} ${n(y + 0.4)} ${n(cx + w)} ${n(y - 0.6)}`
      + ` Q${n(cx + w * 0.66)} ${n(y + t * 1.7)} ${n(cx)} ${n(y + t * 1.8)} Q${n(cx - w * 0.66)} ${n(y + t * 1.7)} ${n(cx - w)} ${n(y - 0.6)} Z" fill="${up}"/>`
      + `<path d="M${n(cx - w * 0.82)} ${n(y + t * 0.5)} Q${n(cx)} ${n(y + t * 2.9)} ${n(cx + w * 0.82)} ${n(y + t * 0.5)}`
      + ` Q${n(cx + w * 0.5)} ${n(y + t * 1.5)} ${n(cx)} ${n(y + t * 1.6)} Q${n(cx - w * 0.5)} ${n(y + t * 1.5)} ${n(cx - w * 0.82)} ${n(y + t * 0.5)} Z" fill="${dn}"/>`
  /* =============================================================
     5. CABELO — ferramentas
     Cada penteado é montado com as mesmas peças: uma curva suave,
     uma trança que cruza, um fio com nós, uma espiral de cachinho.
     Assim dezoito penteados diferentes não custam dezoito códigos.
     ============================================================= */
  function crPath(pts) {
    let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      d += ` C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)}`
        + ` ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
    }
    return d;
  }
  function crPoint(pts, t) {
    const last = pts.length - 1;
    const s = Math.min(last - 1, Math.floor(t * last));
    const lt = t * last - s;
    const p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[Math.min(last, s + 1)], p3 = pts[Math.min(last, s + 2)];
    const t2 = lt * lt, t3 = t2 * lt;
    const c = (a, b, cc, d2) => 0.5 * (2 * b + (-a + cc) * lt + (2 * a - 5 * b + 4 * cc - d2) * t2 + (-a + 3 * b - 3 * cc + d2) * t3);
    return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
  }
  /* normal (perpendicular) da curva num ponto, para deitar o fio em cima */
  function crNorm(pts, t) {
    const p = crPoint(pts, t), q = crPoint(pts, Math.min(1, t + 0.03));
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    return [-dy / L, dx / L];
  }

  /* trança: dois fios cruzando em ziguezague. O que faz a leitura de
     "trança" não é o volume, é o cruzamento. */
  function braidAlong(pts, w, seg, phase, col, op = 1) {
    let d = '';
    const sgn = phase ? -1 : 1;
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const p = crPoint(pts, t), nr = crNorm(pts, t);
      const o = (i % 2 ? -sgn : sgn) * w * 0.6;
      d += (i ? ' L' : 'M') + n(p[0] + nr[0] * o) + ' ' + n(p[1] + nr[1] * o);
    }
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${n(w * 0.92)}"`
      + ` stroke-linecap="round" stroke-linejoin="round" opacity="${n(op)}"/>`;
  }

  /* fio de loc / torção: linha grossa com anéis de tempo */
  function locStrand(pts, w, col, ring, op = 1) {
    const s = `<path d="${crPath(pts)}" fill="none" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="round" opacity="${n(op)}"/>`;
    const rings = [];
    for (let i = 1; i <= 3; i++) {
      const t = i / 4, p = crPoint(pts, t), nr = crNorm(pts, t);
      const a = [p[0] + nr[0] * w * 0.6, p[1] + nr[1] * w * 0.6];
      const b = [p[0] - nr[0] * w * 0.6, p[1] - nr[1] * w * 0.6];
      rings.push(`<path d="M${n(a[0])} ${n(a[1])} L${n(b[0])} ${n(b[1])}" stroke="${ring}" stroke-width="${n(w * 0.5)}" stroke-linecap="round" opacity=".55"/>`);
    }
    return s + rings.join('');
  }

  /* pé de cabelo (as "edges"): fios fininhos que desenham a linha do
     cabelo. É o detalhe que faz um penteado parecer arrumado. */
  function edges(s, col, n_ = 5, spread = 1) {
    const y = s.cy - s.ry * 0.52;
    const out = [];
    for (let i = 0; i < n_; i++) {
      const dir = i < n_ / 2 ? -1 : 1;
      const k = i < n_ / 2 ? i : i - Math.floor(n_ / 2);
      const x = s.cx + dir * (s.rx * 0.5 + k * s.rx * 0.13) * spread;
      const curl = dir * (2.6 + k * 0.6);
      out.push(`<path d="M${n(x)} ${n(y + 2)} q${n(dir * 1.6)} ${n(-3.4)} ${n(curl)} ${n(-1.6)}"`
        + ` fill="none" stroke="${col}" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>`);
    }
    return `<g class="ch-edges">${out.join('')}</g>`;
  }

  /* tampa do couro cabeludo: o cabelo começa nessa linha.
     `front` é a altura da testa em fração do rosto — 0.42 é a linha
     do cabelo no meio da testa, com as têmporas um pouco acima. */
  function cap(s, front = 0.42) {
    const { cx, rx, ry, cy } = s;
    const R = rx * 1.03;
    const top = cy - ry * 1.04;
    const y = cy - ry * front;
    const t = y - 3.2;
    return `M${n(cx - R)} ${n(t)}`
      + ` C${n(cx - R)} ${n(top + ry * 0.22)} ${n(cx - R * 0.62)} ${n(top)} ${n(cx)} ${n(top)}`
      + ` C${n(cx + R * 0.62)} ${n(top)} ${n(cx + R)} ${n(top + ry * 0.22)} ${n(cx + R)} ${n(t)}`
      + ` C${n(cx + R * 0.74)} ${n(y - 1.6)} ${n(cx + R * 0.4)} ${n(y)} ${n(cx)} ${n(y)}`
      + ` C${n(cx - R * 0.4)} ${n(y)} ${n(cx - R * 0.74)} ${n(y - 1.6)} ${n(cx - R)} ${n(t)} Z`;
  }
  /* mecha comprida: massa de cabelo atrás do corpo, com comprimento
     que muda por estilo e por corpo (no homem para no ombro) */
  function curtainPath(s, len, wide = 1.2, tip = 0.88) {
    const { cx, rx, ry, cy } = s;
    const w1 = rx * wide, w2 = rx * wide * 1.04, w3 = rx * wide * tip;
    const y0 = cy - ry * 0.05, y1 = cy + ry * 0.8;
    return `M${n(cx - w1)} ${n(y0)}`
      + ` C${n(cx - w1 * 1.12)} ${n(y1)} ${n(cx - w2)} ${n(y1 + (len - y1) * 0.45)} ${n(cx - w3)} ${n(len)}`
      + ` Q${n(cx)} ${n(len + ry * 0.34)} ${n(cx + w3)} ${n(len)}`
      + ` C${n(cx + w2)} ${n(y1 + (len - y1) * 0.45)} ${n(cx + w1 * 1.12)} ${n(y1)} ${n(cx + w1)} ${n(y0)}`
      + ` Q${n(cx)} ${n(y0 - ry * 0.6)} ${n(cx - w1)} ${n(y0)} Z`;
  }
  /* ondulações de um cabelo liso ou ondulado: linhas que descem */
  function hairLines(s, len, col, count = 6, op = 0.3, w = 2.4) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const k = (i / (count - 1)) * 2 - 1;
      const x = s.cx + k * s.rx * 1.02;
      const y0 = s.cy + s.ry * 0.5;
      const swing = k * s.rx * 0.16;
      out.push(`<path d="M${n(x)} ${n(y0)} Q${n(x + swing)} ${n((y0 + len) / 2)} ${n(x + swing * 0.6)} ${n(len - s.ry * 0.2)}"`
        + ` fill="none" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="round" opacity="${n(op)}"/>`);
    }
    return out.join('');
  }
  const H_LEN = { curto: 0.5, medio: 1.1, longo: 2.2, xlongo: 3.4 };
  const lenOf = (s, kind, fallback = 'medio') => {
    const k = H_LEN[kind] || H_LEN[fallback];
    let len = s.cy + s.ry * k;
    if (s.build === 'm') len = Math.min(len, s.shoY + 16);
    if (s.build === 'k') len = Math.min(len, s.waistY + 6);
    return len;
  };

  /* contas: usadas nas pontas das tranças e nos colares */
  function beads(x, y, r, cols, gap = 1.9) {
    return `<g class="ch-beads">${cols.map((col, i) =>
      `<circle cx="${n(x)}" cy="${n(y + i * r * gap)}" r="${n(r * (1 - i * 0.08))}" fill="${col}" stroke="#000" stroke-opacity=".22" stroke-width=".7"/>`).join('')}</g>`;
  }

  /* textura presa dentro de uma área: o crespo não escorre para o rosto */
  function texIn(area, s, col, w = 1.5, op = 0.3, scale = 1) {
    const id = nid('tx');
    return `<clipPath id="${id}"><path d="${area}"/></clipPath>`
      + `<g clip-path="url(#${id})" stroke="${col}">${curlField(s, col, w, op, scale)}</g>`;
  }

  /* =============================================================
     6. CABELOS — estilos
     Cada estilo devolve duas camadas: `back` fica atrás do corpo
     (volume e comprimento) e `front` fica na frente, sobre a testa.
     ============================================================= */
  const HAIRS = {
    /* crespo volumoso — o "black power" dos anos 70 */
    afro: (c, o, s) => {
      const mass = blob(s.cx, s.cy - s.ry * 0.2, s.rx * 1.36, s.ry * 1.26, 13, 0.09, 0.6);
      const capP = cap(s, 0.5);
      return {
        back: `<g class="ch-hair">
          <path d="${mass}" fill="${c.base}"/>
          <path d="${blob(s.cx, s.cy - s.ry * 0.3, s.rx * 1.05, s.ry, 12, 0.1, 1.4)}" fill="${c.mid}" opacity=".45"/>
          ${texIn(mass, s, c.lite, 1.6, 0.26, 1.3)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          ${texIn(capP, s, c.lite, 1.5, 0.3, 1.1)}
          ${edges(s, c.mid)}
        </g>`
      };
    },

    /* crespo comprido: mesmo volume, caindo até a cintura */
    afrolongo: (c, o, s) => {
      const len = lenOf(s, o.len || 'longo');
      const mass = blob(s.cx, s.cy - s.ry * 0.18, s.rx * 1.34, s.ry * 1.22, 13, 0.09, 1.1);
      const capP = cap(s, 0.5);
      const fall = curtainPath(s, len, 1.3, 1.02);
      return {
        back: `<g class="ch-hair">
          <path d="${fall}" fill="${c.base}"/>
          <path d="${mass}" fill="${c.base}"/>
          ${texIn(fall, s, c.lite, 1.6, 0.22, 1.5)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          ${texIn(capP, s, c.lite, 1.5, 0.3, 1.1)}
          ${edges(s, c.mid)}
        </g>`
      };
    }
  };

  /* textura de crespo dentro de uma área: espirais em três anéis */
  function curlField(s, c, w = 1.6, op = 0.3, scale = 1) {
    const out = [];
    const rings = [[0.42, 7], [0.68, 10], [0.9, 12]];
    rings.forEach(([rr, q], ri) => {
      for (let i = 0; i < q; i++) {
        const a = (i / q) * Math.PI * 2 + ri * 0.4;
        const x = s.cx + Math.cos(a) * s.rx * rr * scale;
        const y = s.cy - s.ry * 0.12 + Math.sin(a) * s.ry * rr * scale;
        out.push(curl(x, y, (2.4 + (i % 3) * 0.5) * scale, (i * 47) % 360, w, op));
      }
    });
    return out.join('');
  }




  /* o resto dos penteados entra no mesmo registro */
  Object.assign(HAIRS, {
    /* dois cocos no alto do couro cabeludo */
    cocos: (c, o, s) => {
      const r = s.rx * 0.48, uy = s.cy - s.ry * 0.86;
      const a = blob(s.cx - s.rx * 0.64, uy, r, r * 0.9, 10, 0.12, 0.9);
      const b = blob(s.cx + s.rx * 0.64, uy, r, r * 0.9, 10, 0.12, 1.9);
      const capP = cap(s, 0.46);
      return {
        back: `<g class="ch-hair">
          <path d="${a}" fill="${c.base}"/><path d="${b}" fill="${c.base}"/>
          ${texIn(a, s, c.lite, 1.5, 0.3, 0.34)}
          ${texIn(b, s, c.lite, 1.5, 0.3, 0.34)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <path d="M${n(s.cx)} ${n(s.cy - s.ry * 0.44)} L${n(s.cx)} ${n(s.cy - s.ry)}" stroke="${c.mid}" stroke-width="1.6" opacity=".45"/>
          ${texIn(capP, s, c.lite, 1.4, 0.26, 1.02)}
          ${edges(s, c.mid)}
        </g>`
      };
    },

    /* cacheado curto, com cachos definidos */
    cacheado: (c, o, s) => {
      const mass = blob(s.cx, s.cy - s.ry * 0.14, s.rx * 1.26, s.ry * 1.06, 14, 0.11, 0.4);
      const capP = cap(s, 0.46);
      return {
        back: `<g class="ch-hair"><path d="${mass}" fill="${c.base}"/>${texIn(mass, s, c.lite, 1.7, 0.28, 1.2)}</g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          ${texIn(capP, s, c.lite, 1.7, 0.32, 1.05)}
          ${edges(s, c.mid, 4)}
        </g>`
      };
    },

    /* curto, sem volume */
    curto: (c, o, s) => ({
      back: '',
      front: `<g class="ch-hair-front">
        <path d="${cap(s, 0.4)}" fill="${c.base}"/>
        <path d="M${n(s.cx - s.rx * 0.72)} ${n(s.cy - s.ry * 0.5)} Q${n(s.cx)} ${n(s.cy - s.ry * 0.8)} ${n(s.cx + s.rx * 0.72)} ${n(s.cy - s.ry * 0.5)}"
          fill="none" stroke="${c.mid}" stroke-width="3" opacity=".38" stroke-linecap="round"/>
      </g>`
    }),

    /* raspado: quase rente ao couro */
    raspado: (c, o, s) => ({
      back: '',
      front: `<g class="ch-hair-front">
        <path d="${cap(s, 0.37)}" fill="${c.base}" opacity=".92"/>
        <g stroke="${c.lite}" stroke-width="1.6" opacity=".26" fill="none">
          <path d="M${n(s.cx - s.rx * 0.5)} ${n(s.cy - s.ry * 0.62)} q${n(s.rx * 0.16)} ${n(-s.ry * 0.12)} ${n(s.rx * 0.34)} ${n(-s.ry * 0.06)}"/>
          <path d="M${n(s.cx + s.rx * 0.12)} ${n(s.cy - s.ry * 0.72)} q${n(s.rx * 0.2)} ${n(-s.ry * 0.08)} ${n(s.rx * 0.36)} ${n(s.ry * 0.04)}"/>
        </g>
      </g>`
    }),

    /* degradê navalhado: curto em cima, raspado nas laterais */
    degrade: (c, o, s) => {
      const capP = cap(s, 0.4);
      const side = (k) => `<path d="M${n(s.cx + k * s.rx * 1.02)} ${n(s.cy - s.ry * 0.2)} Q${n(s.cx + k * s.rx * 0.9)} ${n(s.cy - s.ry * 0.5)} ${n(s.cx + k * s.rx * 0.68)} ${n(s.cy - s.ry * 0.46)}"
        fill="none" stroke="${c.lite}" stroke-width="3.4" opacity=".32" stroke-linecap="round"/>`;
      return {
        back: '',
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          ${side(-1)}${side(1)}
          ${texIn(capP, s, c.lite, 1.5, 0.24, 0.9)}
        </g>`
      };
    },

    /* curto com franja jogada para o lado */
    franja: (c, o, s) => {
      const capP = cap(s, 0.42);
      return {
        back: `<g class="ch-hair"><path d="${blob(s.cx, s.cy - s.ry * 0.1, s.rx * 1.16, s.ry * 0.98, 12, 0.08, 0.3)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <path d="M${n(s.cx - s.rx * 0.94)} ${n(s.cy - s.ry * 0.48)} Q${n(s.cx - s.rx * 0.2)} ${n(s.cy - s.ry * 0.88)} ${n(s.cx + s.rx * 0.9)} ${n(s.cy - s.ry * 0.3)} Q${n(s.cx + s.rx * 0.3)} ${n(s.cy - s.ry * 0.46)} ${n(s.cx - s.rx * 0.94)} ${n(s.cy - s.ry * 0.48)} Z" fill="${c.mid}"/>
        </g>`
      };
    },

    /* liso comprido, com repartição no meio e mechas na frente */
    liso: (c, o, s) => {
      const len = lenOf(s, o.len || 'longo');
      const fall = curtainPath(s, len, 1.22, 0.92);
      const capP = cap(s, 0.44);
      const mecha = (k) => `<path d="M${n(s.cx + k * s.rx * 0.96)} ${n(s.cy - s.ry * 0.34)} Q${n(s.cx + k * s.rx * 1.06)} ${n(s.cy + s.ry * 1.2)} ${n(s.cx + k * s.rx * 0.86)} ${n(len - s.ry * 0.2)}"
        fill="none" stroke="${c.lite}" stroke-width="4.4" opacity=".22" stroke-linecap="round"/>`;
      return {
        back: `<g class="ch-hair">
          <path d="${fall}" fill="${c.base}"/>
          <path d="${curtainPath(s, len * 0.94, 0.72, 0.6)}" fill="${c.mid}" opacity=".3"/>
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <path d="M${n(s.cx)} ${n(s.cy - s.ry * 0.42)} L${n(s.cx + 1.6)} ${n(s.cy - s.ry * 1.02)}" stroke="${c.mid}" stroke-width="1.8" opacity=".5"/>
          ${mecha(-1)}${mecha(1)}
        </g>`
      };
    },

    /* ondulado, caindo solto até o ombro */
    ondulado: (c, o, s) => {
      const len = lenOf(s, o.len || 'medio');
      const fall = curtainPath(s, len, 1.24, 0.9);
      const capP = cap(s, 0.44);
      return {
        back: `<g class="ch-hair">
          <path d="${fall}" fill="${c.base}"/>
          ${hairLines(s, len, c.lite, 7, 0.26, 2.6)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <path d="M${n(s.cx - s.rx * 0.9)} ${n(s.cy - s.ry * 0.42)} Q${n(s.cx - s.rx * 1.06)} ${n(s.cy + s.ry * 0.5)} ${n(s.cx - s.rx * 0.72)} ${n(s.cy + s.ry * 0.86)}"
            fill="none" stroke="${c.mid}" stroke-width="3.6" opacity=".4" stroke-linecap="round"/>
          <path d="M${n(s.cx + s.rx * 0.9)} ${n(s.cy - s.ry * 0.42)} Q${n(s.cx + s.rx * 1.06)} ${n(s.cy + s.ry * 0.5)} ${n(s.cx + s.rx * 0.72)} ${n(s.cy + s.ry * 0.86)}"
            fill="none" stroke="${c.mid}" stroke-width="3.6" opacity=".4" stroke-linecap="round"/>
        </g>`
      };
    },

    /* chanel curto, na altura do queixo */
    chanel: (c, o, s) => {
      const len = s.cy + s.ry * 1.5;
      const fall = curtainPath(s, len, 1.26, 1.04);
      return {
        back: `<g class="ch-hair"><path d="${fall}" fill="${c.base}"/>${hairLines(s, len, c.lite, 5, 0.24, 2.2)}</g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.42)}" fill="${c.base}"/>
          <path d="M${n(s.cx)} ${n(s.cy - s.ry * 0.4)} L${n(s.cx + 1.4)} ${n(s.cy - s.ry * 1)}" stroke="${c.mid}" stroke-width="1.7" opacity=".45"/>
        </g>`
      };
    },

    /* coque alto com o pé de cabelo desenhado */
    coque: (c, o, s) => {
      const r = s.rx * 0.56;
      const knot = blob(s.cx, s.cy - s.ry * 1.1, r, r * 0.86, 11, 0.1, 1.3);
      const capP = cap(s, 0.42);
      return {
        back: `<g class="ch-hair">
          <path d="${knot}" fill="${c.base}"/>
          ${texIn(knot, s, c.lite, 1.5, 0.26, 0.4)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <path d="M${n(s.cx - s.rx * 0.5)} ${n(s.cy - s.ry * 0.6)} Q${n(s.cx - s.rx * 0.1)} ${n(s.cy - s.ry * 0.86)} ${n(s.cx + s.rx * 0.5)} ${n(s.cy - s.ry * 0.62)}"
            fill="none" stroke="${c.mid}" stroke-width="2.4" opacity=".45" stroke-linecap="round"/>
          ${edges(s, c.mid, 6)}
        </g>`
      };
    },

    /* rabo de cavalo alto, com a nuvem de cabelo atrás */
    rabo: (c, o, s) => {
      const len = s.cy + s.ry * 1.9;
      const tail = crPath([[s.cx + s.rx * 0.2, s.cy - s.ry * 0.9], [s.cx + s.rx * 0.9, s.cy - s.ry * 0.2], [s.cx + s.rx * 1.1, s.cy + s.ry * 0.7], [s.cx + s.rx * 0.8, len]]);
      const capP = cap(s, 0.42);
      return {
        back: `<g class="ch-hair">
          <path d="${tail}" fill="none" stroke="${c.base}" stroke-width="${n(s.rx * 0.72)}" stroke-linecap="round"/>
          ${texIn(tail, s, c.lite, 1.5, 0.24, 1.1)}
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${capP}" fill="${c.base}"/>
          <ellipse cx="${n(s.cx)}" cy="${n(s.cy - s.ry * 0.98)}" rx="${n(s.rx * 0.3)}" ry="${n(s.ry * 0.16)}" fill="${c.mid}" opacity=".7"/>
          ${edges(s, c.mid, 6)}
        </g>`
      };
    },

    /* tranças coladas ao couro cabeludo — as nagô. Pesquisas registram
       que os desenhos das tranças ajudaram a marcar rotas de fuga. */
    nago: (c, o, s) => {
      const rows = 6, back = [], front = [];
      for (let i = 0; i < rows; i++) {
        const k = (i / (rows - 1)) * 2 - 1;
        const pts = [
          [s.cx + k * s.rx * 0.9, s.cy - s.ry * 0.46],
          [s.cx + k * s.rx * 0.88, s.cy - s.ry * 0.8],
          [s.cx + k * s.rx * 0.62, s.cy - s.ry * 1.02],
          [s.cx + k * s.rx * 0.22, s.cy - s.ry * 1.12]
        ];
        front.push(`<path d="${crPath(pts)}" fill="none" stroke="${c.base}" stroke-width="8" stroke-linecap="round"/>`);
        front.push(braidAlong(pts, 7.6, 8, i % 2, c.mid, 0.7));
      }
      const side = (k) => {
        const pts = [
          [s.cx + k * s.rx * 1.02, s.cy - s.ry * 0.3],
          [s.cx + k * s.rx * 0.94, s.cy - s.ry * 0.66],
          [s.cx + k * s.rx * 0.7, s.cy - s.ry * 0.94]
        ];
        return `<path d="${crPath(pts)}" fill="none" stroke="${c.base}" stroke-width="7.5" stroke-linecap="round"/>`
          + braidAlong(pts, 7, 6, k > 0 ? 1 : 0, c.mid, 0.65);
      };
      return {
        back: `<g class="ch-hair"><path d="${cap(s, 0.62)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.5)}" fill="${c.base}"/>
          ${side(-1)}${side(1)}
          ${front.join('')}
          ${edges(s, c.mid, 6)}
        </g>`
      };
    },

    /* tranças soltas — box braids. Ficam contas no fim de cada uma,
       como as contas de vidro que atravessaram o Atlântico. */
    trancas: (c, o, s) => {
      const len = lenOf(s, o.len || 'longo');
      const seeds = [[-1.02, 0.3], [-0.72, 0.1], [-0.4, 0.42], [0, 0.22], [0.4, 0.42], [0.72, 0.1], [1.02, 0.3]];
      const beadCols = [safe(o.acc, '#E5A83A'), safe(o.acc2, '#F1E4CE'), safe(o.wrap, '#2E9E6B')];
      const front = [], over = [];
      seeds.forEach(([k, d], i) => {
        const tip = len - (i % 3) * s.ry * 0.34;
        const pts = [
          [s.cx + k * s.rx * 0.86, s.cy - s.ry * (0.52 + d * 0.4)],
          [s.cx + k * s.rx * 1.06, s.cy - s.ry * (0.78 + d)],
          [s.cx + k * s.rx * 1.34, s.cy + s.ry * 0.9],
          [s.cx + k * s.rx * 1.5, tip]
        ];
        const inside = Math.abs(k) < 0.8;
        const w = inside ? 6.4 : 5.6;
        const ring = `<path d="${crPath(pts)}" fill="none" stroke="${c.base}" stroke-width="${n(w + 1.4)}" stroke-linecap="round"/>`;
        const plait = braidAlong(pts, w, 9, i % 2, c.mid, 0.8);
        const bead = beads(s.cx + k * s.rx * 1.5, tip + 3, 2.1, [beadCols[i % 3]]);
        (inside ? front : over).push(ring + plait + bead);
      });
      return {
        back: `<g class="ch-hair"><path d="${cap(s, 0.66)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.52)}" fill="${c.base}"/>
          ${Array.from({ length: 5 }, (_, i) => {
            const k = (i / 4) * 2 - 1;
            return `<path d="M${n(s.cx + k * s.rx * 0.8)} ${n(s.cy - s.ry * 0.56)} L${n(s.cx + k * s.rx * 0.2)} ${n(s.cy - s.ry * 1.06)}" stroke="${c.lite}" stroke-width="1.4" opacity=".4"/>`;
          }).join('')}
          ${front.join('')}
          ${edges(s, c.mid, 5)}
        </g>`,
        over: `<g class="ch-hair-over">${over.join('')}</g>`
      };
    },

    /* torções de dois fios */
    torcoes: (c, o, s) => {
      const len = lenOf(s, o.len || 'medio');
      const out = [];
      for (let i = 0; i < 7; i++) {
        const k = (i / 6) * 2 - 1;
        const pts = [
          [s.cx + k * s.rx * 0.82, s.cy - s.ry * 0.5],
          [s.cx + k * s.rx * 1.14, s.cy + s.ry * 0.32],
          [s.cx + k * s.rx * 1.34, (s.cy + len) / 2],
          [s.cx + k * s.rx * 1.42, len - (i % 2) * 8]
        ];
        out.push(`<path d="${crPath(pts)}" fill="none" stroke="${c.base}" stroke-width="7" stroke-linecap="round"/>`);
        out.push(braidAlong(pts, 5.6, 10, i % 2, c.mid, 0.85));
      }
      return {
        back: `<g class="ch-hair"><path d="${cap(s, 0.62)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.5)}" fill="${c.base}"/>
          ${out.join('')}
          ${edges(s, c.mid, 5)}
        </g>`
      };
    },

    /* locs: cada fio com os nós do tempo e a ponta enrolada */
    locs: (c, o, s) => {
      const len = lenOf(s, o.len || 'longo');
      const out = [], over = [];
      for (let i = 0; i < 8; i++) {
        const k = (i / 7) * 2 - 1;
        const tip = len - (i % 3) * s.ry * 0.5;
        const pts = [
          [s.cx + k * s.rx * 0.86, s.cy - s.ry * 0.52],
          [s.cx + k * s.rx * 1.14, s.cy + s.ry * 0.24],
          [s.cx + k * s.rx * 1.36, (s.cy + tip) / 2],
          [s.cx + k * s.rx * 1.42, tip]
        ];
        const w = Math.abs(k) < 0.8 ? 5.4 : 4.6;
        const strand = locStrand(pts, w, c.base, c.lite, 1)
          + locStrand([pts[2], pts[3]], w * 0.9, c.mid, c.lite, 0.5);
        (Math.abs(k) < 0.8 ? out : over).push(strand);
      }
      return {
        back: `<g class="ch-hair"><path d="${cap(s, 0.6)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.5)}" fill="${c.base}"/>
          ${out.join('')}
          ${edges(s, c.mid, 5)}
        </g>`,
        over: `<g class="ch-hair-over">${over.join('')}</g>`
      };
    },

    /* nós bantu: o cabelo dividido em quatro ou cinco trouxas */
    bantu: (c, o, s) => {
      const spots = [[-0.62, -0.96], [0.62, -0.96], [-1.02, -0.36], [1.02, -0.36], [0, -1.16]];
      const r = s.rx * 0.31;
      const knots = spots.map(([kx, ky], i) => {
        const x = s.cx + kx * s.rx * 0.92, y = s.cy + ky * s.ry * 0.9;
        const b = blob(x, y, r, r * 0.92, 9, 0.14, 0.5 + i * 0.7);
        return `<path d="${b}" fill="${c.base}"/>`
          + `<path d="${curlPath(x, y, r * 0.5)}" fill="none" stroke="${c.lite}" stroke-width="2" opacity=".45" stroke-linecap="round"/>`
          + `<path d="${curlPath(x + r * 0.4, y + r * 0.3, r * 0.3)}" fill="none" stroke="${c.mid}" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>`;
      }).join('');
      return {
        back: `<g class="ch-hair"><path d="${blob(s.cx, s.cy - s.ry * 0.4, s.rx * 1.08, s.ry * 0.86, 11, 0.06, 1.2)}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.5)}" fill="${c.base}"/>
          ${knots}
          ${edges(s, c.mid, 5)}
        </g>`
      };
    },

    /* turbante: pano enrolado, com dobras, nó e ponta caindo.
       As cores vêm de data-wrap e data-wrap2. */
    turbante: (c, o, s) => {
      const w1 = safe(o.wrap, '#2E9E6B'), w2 = safe(o.wrap2, '#F1E4CE');
      const mass = blob(s.cx, s.cy - s.ry * 0.66, s.rx * 1.26, s.ry * 0.98, 11, 0.05, 0.4);
      const folds = [0, 1, 2].map((i) => {
        const y = s.cy - s.ry * (0.5 + i * 0.42);
        return `<path d="M${n(s.cx - s.rx * 1.08)} ${n(y + 4)} Q${n(s.cx)} ${n(y - 2.4)} ${n(s.cx + s.rx * 1.08)} ${n(y + 4)}"`
          + ` fill="none" stroke="${w2}" stroke-width="${i === 1 ? 3.2 : 2.2}" opacity=".4" stroke-linecap="round"/>`;
      }).join('');
      const knot = blob(s.cx + s.rx * 1.04, s.cy - s.ry * 0.44, s.rx * 0.34, s.ry * 0.3, 9, 0.16, 2.1);
      const tail = [[s.cx + s.rx * 1.12, s.cy - s.ry * 0.3], [s.cx + s.rx * 1.3, s.cy + s.ry * 0.5], [s.cx + s.rx * 1.05, s.cy + s.ry * 1.35]];
      return {
        back: `<g class="ch-hair">
          <path d="${mass}" fill="${w1}"/>
          <path d="${mass}" fill="none" stroke="${w2}" stroke-width="1.6" opacity=".35"/>
          ${folds}
          <path d="${blob(s.cx, s.cy - s.ry * 0.9, s.rx * 0.9, s.ry * 0.4, 9, 0.1, 1.6)}" fill="${w2}" opacity=".35"/>
          <path d="${knot}" fill="${mix(w1, '#000000', 0.18)}"/>
          <path d="${crPath(tail)}" fill="none" stroke="${w1}" stroke-width="9" stroke-linecap="round"/>
          <path d="${crPath(tail)}" fill="none" stroke="${mix(w1, '#000000', 0.28)}" stroke-width="2" opacity=".5"/>
        </g>`,
        front: `<g class="ch-hair-front">
          <path d="${cap(s, 0.56)}" fill="${w1}"/>
          <path d="M${n(s.cx - s.rx * 1.04)} ${n(s.cy - s.ry * 0.28)} Q${n(s.cx)} ${n(s.cy - s.ry * 0.42)} ${n(s.cx + s.rx * 1.04)} ${n(s.cy - s.ry * 0.3)}"
            fill="none" stroke="${w2}" stroke-width="3.4" opacity=".5" stroke-linecap="round"/>
        </g>`
      };
    }
  });

  /* =============================================================
     7. BRAÇOS E POSES
     Cada pose são dois braços com ombro, cotovelo e punho. O
     antebraço é um grupo separado: a animação dobra o braço no
     cotovelo em vez de girar o braço inteiro, que ficava duro.
     ============================================================= */
  const POSES = {
    solto:    { r: [[9, 34], [4, 62]],    l: [[-9, 34], [-4, 62]] },
    aceno:    { r: [[24, 4], [15, -42]],  l: [[-9, 36], [-5, 64]] },
    aberto:   { r: [[28, 20], [44, 14]],  l: [[-28, 20], [-44, 14]] },
    conversa: { r: [[23, 26], [21, -6]],  l: [[-10, 34], [-6, 60]] },
    cintura:  { r: [[21, 26], [-9, 52]],  l: [[-9, 36], [-5, 64]] },
    aponta:   { r: [[24, 12], [50, 0]],   l: [[-8, 34], [-4, 62]] },
    cabelo:   { r: [[21, 6], [8, -36]],   l: [[-9, 36], [-5, 64]] },
    festa:    { r: [[24, -2], [14, -44]], l: [[-24, -2], [-14, -44]] },
    segura:   { r: [[21, 30], [33, 6]],   l: [[-21, 30], [-33, 6]] }
  };
  const POSE_ALIAS = { down: 'solto', wave: 'aceno', open: 'aberto', talk: 'conversa', hip: 'cintura', point: 'aponta' };

  /* manga: cobre o começo do braço e alarga na barra */
  function sleeveOf(kind, ax, ay, bx, by, w, col, dark) {
    if (!kind || kind === 'nada') return '';
    const t = kind === 'curta' ? 0.5 : 1;
    const mx = ax + (bx - ax) * t, my = ay + (by - ay) * t;
    const flare = kind === 'ampla' ? 1.8 : 1.22;
    const tip = kind === 'ampla' ? 1.62 : 1.06;
    const d = seg(ax, ay, mx, my, w * flare, w * tip);
    return `<path d="${d}" fill="${col}"/><path d="${d}" fill="none" stroke="${dark}" stroke-width="1.1" opacity=".3"/>`;
  }

  function arm(s, side, sp, tone, cloth, sleeveKind, order) {
    const k = s.upArm / 13.6;
    const sx = s.cx + side * (s.sho - 6.2);
    const sy = s.shoY + 4;
    const ex = sx + sp[0][0] * k, ey = sy + sp[0][1] * k;
    const wx = sx + sp[1][0] * k, wy = sy + sp[1][1] * k;
    const wU = s.upArm * 0.6, wF = s.foreArm * 0.5;
    const skin = order === 'front' ? tone.hex : tone.shade;
    const ang = angOf(ex, ey, wx, wy);
    const fore = `<path d="${seg(ex, ey, wx, wy, wF * 1.02, s.hand * 0.86)}" fill="${skin}"/>`
      + (sleeveKind === 'longa'
        ? `<path d="${seg(ex, ey, ex + (wx - ex) * 0.84, ey + (wy - ey) * 0.84, wF * 1.32, wF * 1.16)}" fill="${cloth.c1}"/>` : '')
      + hand(wx, wy, ang, s.hand, side, skin, order === 'front' ? tone.shade : tone.deep);
    return `<g class="ch-arm ch-arm-${side > 0 ? 'r' : 'l'}">
      <g class="ch-up">
        <path d="${seg(sx, sy, ex, ey, wU, wF * 1.05)}" fill="${skin}"/>
        ${sleeveOf(sleeveKind, sx, sy, ex, ey, wU, cloth.c1, cloth.c2)}
      </g>
      <g class="ch-fore" style="transform-origin:${n(ex)}px ${n(ey)}px">${fore}</g>
    </g>`;
  }

  /* =============================================================
     8. ROUPA
     A peça é montada com medidas (y, meia largura) descendo pelo
     corpo: ombro, peito, cintura, quadril, barra. O decote é um
     recorte com a cor da pele — o corpo aparece por baixo dele.
     ============================================================= */
  function collarGeo(s) {
    const ySho = s.shoY + 5;
    const yCol = s.shoY - 7;
    const t = (yCol - (s.chin - 9)) / (ySho - (s.chin - 9));
    const k = (s.cx - s.neck) + ((s.cx - s.sho) - (s.cx - s.neck)) * t;
    return { ySho, yCol, k };
  }

  function garmentPath(s, pts, collar) {
    const { ySho, yCol, k } = collarGeo(s);
    const sl = s.cx - s.sho, sr = s.cx + s.sho;
    const off = collar === 'ombro' ? 11 : 0;
    const y = ySho + off;
    let d = `M${n(sl)} ${n(y)} L${n(k)} ${n(yCol + off)}`;
    if (collar === 'v') d += ` L${n(s.cx)} ${n(yCol + off + 15)} L${n(2 * s.cx - k)} ${n(yCol + off)}`;
    else if (collar === 'quadrado') d += ` L${n(s.cx - k * 0.82)} ${n(yCol + off + 11)} L${n(s.cx + k * 0.82)} ${n(yCol + off + 11)} L${n(2 * s.cx - k)} ${n(yCol + off)}`;
    else d += ` Q${n(s.cx)} ${n(yCol + off + 13)} ${n(2 * s.cx - k)} ${n(yCol + off)}`;
    d += ` L${n(sr)} ${n(y)}`;
    d += ` Q${n(sr + 1)} ${n(s.shoY + 21)} ${n(s.cx + pts[0][1])} ${n(pts[0][0])}`;
    for (let i = 1; i < pts.length; i++) d += ` L${n(s.cx + pts[i][1])} ${n(pts[i][0])}`;
    const last = pts[pts.length - 1];
    d += ` Q${n(s.cx)} ${n(last[0] + 9)} ${n(s.cx - last[1])} ${n(last[0])}`;
    for (let i = pts.length - 1; i >= 1; i--) d += ` L${n(s.cx - pts[i][1])} ${n(pts[i][0])}`;
    d += ` Q${n(sl - 1)} ${n(s.shoY + 21)} ${n(sl)} ${n(y)} Z`;
    return d;
  }

  function neckCut(s, collar, tone, trim) {
    const { yCol, k } = collarGeo(s);
    const off = collar === 'ombro' ? 11 : 0;
    const y = yCol + off;
    let d;
    if (collar === 'ombro') d = `M${n(s.cx - s.sho)} ${n(y)} L${n(s.cx + s.sho)} ${n(y)}`;
    else if (collar === 'v') d = `M${n(s.cx - k)} ${n(y)} L${n(s.cx)} ${n(y + 15)} L${n(s.cx + k)} ${n(y)}`;
    else if (collar === 'quadrado') d = `M${n(s.cx - k)} ${n(y)} L${n(s.cx - k * 0.82)} ${n(y + 11)} L${n(s.cx + k * 0.82)} ${n(y + 11)} L${n(s.cx + k)} ${n(y)}`;
    else d = `M${n(s.cx - k)} ${n(y)} Q${n(s.cx)} ${n(y + 13)} ${n(s.cx + k)} ${n(y)}`;
    return `<path d="${d} L${n(s.cx + k)} ${n(y - 2)} L${n(s.cx - k)} ${n(y - 2)} Z" fill="${tone.hex}"/>`
      + `<path d="${d}" fill="none" stroke="${trim}" stroke-width="1.8" opacity=".7"/>`;
  }

  function trouserPath(s, col, dark) {
    const top = s.waistY - 8;
    const hipw = s.hip + 2.4;
    const pelvis = `M${n(s.cx - s.waist)} ${n(top)} L${n(s.cx + s.waist)} ${n(top)} L${n(s.cx + hipw)} ${n(s.hipY + 4)} L${n(s.cx - hipw)} ${n(s.hipY + 4)} Z`;
    const leg = (side) => {
      const cxl = s.cx + side * s.legSep;
      const wT = s.thigh + 2.6, wK = s.knee + 2.2, wA = s.ankle + 2;
      const ox = (t) => (side < 0 ? cxl - t : cxl - t * 0.88);
      const ix = (t) => (side < 0 ? cxl + t * 0.88 : cxl + t);
      const midy = (top + s.kneeY) / 2;
      return `M${n(ox(wT))} ${n(top)} C${n(ox(wK))} ${n(midy)} ${n(ox(wK))} ${n(s.kneeY - 16)} ${n(ox(wK))} ${n(s.kneeY)}`
        + ` C${n(ox(wA))} ${n(s.kneeY + 20)} ${n(ox(wA))} ${n(s.ankleY - 20)} ${n(ox(wA))} ${n(s.ankleY)}`
        + ` L${n(ix(wA))} ${n(s.ankleY)} C${n(ix(wA))} ${n(s.ankleY - 20)} ${n(ix(wK))} ${n(s.kneeY + 18)} ${n(ix(wK))} ${n(s.kneeY)}`
        + ` C${n(ix(wK))} ${n(s.kneeY - 18)} ${n(ix(wT))} ${n(midy)} ${n(ix(wT))} ${n(top)} Z`;
    };
    return `<g class="ch-trousers" fill="${col}">${pelvis}${leg(-1)}${leg(1)}`
      + `<path d="M${n(s.cx - s.waist)} ${n(top + 2.4)} L${n(s.cx + s.waist)} ${n(top + 2.4)}" stroke="${dark}" stroke-width="2" opacity=".5"/>`
      + `<path d="M${n(s.cx)} ${n(top + 5)} L${n(s.cx)} ${n(s.hipY)}" stroke="${dark}" stroke-width="1.6" opacity=".32"/></g>`;
  }

  function skirtPath(s, hemY, wide) {
    const top = s.hipY - 18;
    return `M${n(s.cx - s.waist)} ${n(top)} L${n(s.cx + s.waist)} ${n(top)} L${n(s.cx + wide)} ${n(hemY)}`
      + ` Q${n(s.cx)} ${n(hemY + 10)} ${n(s.cx - wide)} ${n(hemY)} Z`;
  }

  /* estampa: o tecido pode ser liso, listrado, com faixas, xadrez de
     madras, blocos de kente, pontos ou ziguezague geométrico */
  function patternOf(kind, s, c2, tone) {
    const y0 = s.shoY, x0 = s.cx - s.sho - 4;
    const out = [];
    if (kind === 'listras') {
      for (let i = 0; i < 9; i++) out.push(`<rect x="${n(x0 + i * 9.4)}" y="${n(y0 - 12)}" width="4" height="250" fill="${c2}" opacity=".5"/>`);
    } else if (kind === 'faixas') {
      [[21, 7, 0.7], [86, 13, 0.6], [150, 6, 0.65]].forEach(([dy, h, op]) =>
        out.push(`<rect x="0" y="${n(y0 + dy)}" width="220" height="${n(h)}" fill="${c2}" opacity="${op}"/>`));
    } else if (kind === 'kente') {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) {
        if ((i + j) % 2) out.push(`<rect x="${n(x0 + i * 11)}" y="${n(y0 + j * 24)}" width="11" height="24" fill="${c2}" opacity=".45"/>`);
      }
    } else if (kind === 'xadrez') {
      for (let i = 0; i < 13; i++) out.push(`<rect x="${n(x0 + i * 7.4)}" y="${n(y0 - 12)}" width="3" height="250" fill="${c2}" opacity=".4"/>`);
      for (let i = 0; i < 11; i++) out.push(`<rect x="0" y="${n(y0 + i * 22)}" width="220" height="3" fill="${tone.deep}" opacity=".26"/>`);
    } else if (kind === 'pontos') {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 14; j++) {
        out.push(`<circle cx="${n(x0 + 6 + i * 10)}" cy="${n(y0 + j * 16)}" r="1.9" fill="${c2}" opacity=".5"/>`);
      }
    } else if (kind === 'geo') {
      const zig = Array.from({ length: 7 }, () => 'l9 -8 l9 8').join(' ');
      for (let j = 0; j < 10; j++) {
        out.push(`<path d="M${n(x0)} ${n(y0 + j * 25 + 10)} ${zig}" fill="none" stroke="${c2}" stroke-width="2.4" opacity=".42"/>`);
      }
    }
    return out.join('');
  }

  /* pregas: sem elas a roupa parece um papel colado no corpo */
  function foldsOf(s, pts, c2) {
    const last = pts[pts.length - 1], hem = last[0], w = last[1];
    return [-0.7, -0.3, 0.25, 0.66].map((k, i) =>
      `<path d="M${n(s.cx + k * w * 0.86)} ${n(hem - 26 - (i % 2) * 10)} Q${n(s.cx + k * w * 0.7)} ${n(hem - 8)} ${n(s.cx + k * w * 0.94)} ${n(hem - 1)}"`
      + ` fill="none" stroke="${c2}" stroke-width="1.6" opacity=".38" stroke-linecap="round"/>`).join('');
  }

  /* faixa na cintura e pano jogado no ombro */
  function sashPath(s, kind, col, dark) {
    if (kind === 'cintura') {
      const y = s.waistY - 4, w = s.waist + 3;
      return `<g class="ch-sash"><path d="M${n(s.cx - w)} ${n(y - 7)} L${n(s.cx + w)} ${n(y - 7)} L${n(s.cx + w - 1)} ${n(y + 9)} L${n(s.cx - w + 1)} ${n(y + 9)} Z" fill="${col}"/>`
        + `<path d="M${n(s.cx - w)} ${n(y - 7)} L${n(s.cx + w)} ${n(y - 7)}" stroke="${dark}" stroke-width="1.6" opacity=".4"/>`
        + `<path d="M${n(s.cx + w * 0.5)} ${n(y + 7)} q${n(10)} ${n(14)} ${n(4)} ${n(30)}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`
        + `<path d="M${n(s.cx + w * 0.2)} ${n(y + 8)} q${n(6)} ${n(18)} ${n(-2)} ${n(30)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/></g>`;
    }
  /* =============================================================
     9. PEÇAS DE ROUPA
     Cada peça é só uma lista de medidas. O construtor faz o resto:
     recorte do decote, estampa presa dentro da peça, pregas e barra
     marcada. Peça nova = cinco números, não trinta linhas de SVG.
     ============================================================= */
  const OUTFITS = {
    /* vestido curto com faixa na cintura */
    vestido: (s) => ({
      pts: [[s.chestY, s.chest + 2], [s.waistY, s.waist - 1.4], [s.hipY, s.hip + 1.6], [s.kneeY - 26, s.hip + 14]],
      collar: 'redondo', sleeve: 'curta', sash: 'cintura'
    }),
    /* vestido longo, na altura da canela */
    vestidolongo: (s) => ({
      pts: [[s.chestY, s.chest + 2], [s.waistY, s.waist - 1], [s.hipY, s.hip + 2.4], [s.ankleY - 12, s.hip + 17]],
      collar: 'v', sleeve: 'curta', pattern: 'geo', sash: 'cintura'
    }),
    /* túnica / bubum: cai solta, manga ampla */
    tunica: (s) => ({
      pts: [[s.chestY, s.chest + 4], [s.hipY, s.hip + 6], [s.hipY + 32, s.hip + 11]],
      collar: 'v', sleeve: 'ampla', pattern: 'faixas'
    }),
    /* bata comprida com estampa geométrica */
    bata: (s) => ({
      pts: [[s.chestY, s.chest + 5], [s.hipY, s.hip + 8], [s.kneeY - 34, s.hip + 15]],
      collar: 'quadrado', sleeve: 'longa', pattern: 'geo'
    }),
    /* camisa de manga longa com calça */
    camisa: (s) => ({
      pts: [[s.chestY, s.chest + 2.4], [s.waistY, s.waist + 1], [s.hipY + 8, s.waist + 3]],
      collar: 'v', sleeve: 'longa', lower: 'calca', pattern: 'listras'
    }),
    /* camiseta de manga curta com calça */
    camiseta: (s) => ({
      pts: [[s.chestY, s.chest + 2.6], [s.waistY, s.waist + 1.2], [s.hipY + 6, s.waist + 3.4]],
      collar: 'redondo', sleeve: 'curta', lower: 'calca'
    }),
    /* blusa de manga longa, tecida em listras */
    blusa: (s) => ({
      pts: [[s.chestY, s.chest + 3], [s.waistY, s.waist + 1], [s.hipY + 2, s.hip + 2]],
      collar: 'ombro', sleeve: 'longa', pattern: 'listras', sash: 'cintura'
    }),
    /* pano da costa jogado no ombro, saia enrolada */
    pano: (s) => ({
      pts: [[s.chestY, s.chest + 1.6], [s.waistY, s.waist]], collar: 'ombro',
      sleeve: 'nada', lower: 'saia', sash: 'ombro', pattern: 'kente'
    }),
    /* blusão com xadrez de madras e calça */
    madras: (s) => ({
      pts: [[s.chestY, s.chest + 3.4], [s.waistY, s.waist + 1.4], [s.hipY + 4, s.hip + 2]],
      collar: 'quadrado', sleeve: 'longa', lower: 'calca', pattern: 'xadrez'
    })
  };
  const OUTFIT_ALIAS = { dress: 'vestido', tunic: 'tunica', shirt: 'camisa' };

  function buildOutfit(spec, s, c1, c2, tone) {
    const id = nid('cf');
    const d = garmentPath(s, spec.pts, spec.collar);
    const last = spec.pts[spec.pts.length - 1];
    const lower = spec.lower === 'calca' ? trouserPath(s, PANTS, dark(PANTS, 0.34))
      : spec.lower === 'saia' ? `<path d="${skirtPath(s, spec.skirtY || (s.kneeY - 26), spec.skirtW || (s.hip + 13))}" fill="${c1}"/>`
        + `<path d="M${n(s.cx - s.hip - 11)} ${n(s.kneeY - 34)} Q${n(s.cx)} ${n(s.kneeY - 26)} ${n(s.cx + s.hip + 11)} ${n(s.kneeY - 34)}" fill="none" stroke="${c2}" stroke-width="3" opacity=".5"/>`
      : '';
    const body = `<g class="ch-cloth">
      <path d="${d}" fill="${c1}"/>
      <clipPath id="${id}"><path d="${d}"/></clipPath>
      <g clip-path="url(#${id})">
        ${spec.pattern && spec.pattern !== 'none' ? patternOf(spec.pattern, s, c2, tone) : ''}
        ${foldsOf(s, spec.pts, c2)}
        <rect x="0" y="${n(last[0] - 8)}" width="220" height="16" fill="${c2}" opacity=".85"/>
      </g>
      <path d="${d}" fill="none" stroke="${tone.deep}" stroke-width="1.1" opacity=".28"/>
      ${spec.sash ? sashPath(s, spec.sash, c2, tone.deep) : ''}
    </g>`;
    return { lower, body, neck: neckCut(s, spec.collar, tone, c2), sleeve: spec.sleeve || 'nada' };
  }

  /* =============================================================
     10. ACESSÓRIOS E BARBA
     ============================================================= */
  const ACC_ALIAS = {
    hoops: 'argolas', studs: 'brincos', glasses: 'oculos', necklace: 'colar',
    earrings: 'brincos', shells: 'conchas', beads: 'contas'
  };

  function accessory(kind, s, o) {
    const kind2 = ACC_ALIAS[kind] || kind;
    const gold = safe(o.frame, '#E5A83A');
    const bone = safe(o.frame2, '#F1E4CE');
    const ex = s.cx - s.rx * 1.02, ex2 = s.cx + s.rx * 1.02;
    const ey = s.cy + s.ry * 0.18;
    const r = s.rx * 0.26;
    switch (kind2) {
      case 'argolas':
        return `<g class="ch-acc">
          <g class="ch-jewel ch-jewel--r"><circle cx="${n(ex2)}" cy="${n(ey + r * 1.5)}" r="${n(r)}" fill="none" stroke="${gold}" stroke-width="${n(r * 0.34)}"/></g>
          <g class="ch-jewel"><circle cx="${n(ex)}" cy="${n(ey + r * 1.5)}" r="${n(r)}" fill="none" stroke="${gold}" stroke-width="${n(r * 0.34)}"/></g>
        </g>`;
      case 'brincos':
        return `<g class="ch-acc">
          <circle cx="${n(ex + 1)}" cy="${n(ey)}" r="${n(r * 0.42)}" fill="${gold}"/>
          <circle cx="${n(ex2 - 1)}" cy="${n(ey)}" r="${n(r * 0.42)}" fill="${gold}"/>
        </g>`;
      case 'conchas':
        return `<g class="ch-acc">
          <g class="ch-jewel"><path d="M${n(ex)} ${n(ey + 1)} q${n(r * 0.5)} ${n(r * 0.9)} 0 ${n(r * 1.5)} q${n(-r * 0.5)} ${n(-r * 0.6)} 0 ${n(-r * 1.5)} Z" fill="${bone}" stroke="${gold}" stroke-width=".9"/></g>
          <g class="ch-jewel ch-jewel--r"><path d="M${n(ex2)} ${n(ey + 1)} q${n(r * 0.5)} ${n(r * 0.9)} 0 ${n(r * 1.5)} q${n(-r * 0.5)} ${n(-r * 0.6)} 0 ${n(-r * 1.5)} Z" fill="${bone}" stroke="${gold}" stroke-width=".9"/></g>
        </g>`;
      case 'oculos':
        return `<g class="ch-acc" fill="none" stroke="${gold}" stroke-width="1.8">
          <rect x="${n(s.cx - s.rx * 0.62)}" y="${n(s.cy - s.ry * 0.16)}" width="${n(s.rx * 0.5)}" height="${n(s.ry * 0.36)}" rx="${n(s.ry * 0.18)}"/>
          <rect x="${n(s.cx + s.rx * 0.12)}" y="${n(s.cy - s.ry * 0.16)}" width="${n(s.rx * 0.5)}" height="${n(s.ry * 0.36)}" rx="${n(s.ry * 0.18)}"/>
          <path d="M${n(s.cx - s.rx * 0.12)} ${n(s.cy - s.ry * 0.04)} h${n(s.rx * 0.24)}"/>
          <path d="M${n(s.cx - s.rx * 0.62)} ${n(s.cy - s.ry * 0.06)} l${n(-s.rx * 0.3)} ${n(s.ry * 0.06)}"/>
          <path d="M${n(s.cx + s.rx * 0.62)} ${n(s.cy - s.ry * 0.06)} l${n(s.rx * 0.3)} ${n(s.ry * 0.06)}"/>
        </g>`;
      case 'colar': {
        const y = s.shoY - 2, w = s.neck + 5;
        return `<g class="ch-acc ch-jewel"><path d="M${n(s.cx - w)} ${n(y - 2)} Q${n(s.cx)} ${n(y + 15)} ${n(s.cx + w)} ${n(y - 2)}" fill="none" stroke="${gold}" stroke-width="2" stroke-linecap="round"/>
          <circle cx="${n(s.cx)}" cy="${n(y + 14)}" r="${n(3.4)}" fill="${gold}"/></g>`;
      }
      case 'contas': {
        const y = s.shoY - 3, out = [];
        for (let k = 0; k < 3; k++) {
          const w = s.neck + 4 + k * 5, dy = k * 6;
          out.push(`<path d="M${n(s.cx - w)} ${n(y)} Q${n(s.cx)} ${n(y + 17 + dy)} ${n(s.cx + w)} ${n(y)}" fill="none" stroke="${gold}" stroke-width="1.4" opacity=".8"/>`);
          for (let i = 0; i <= 6; i++) {
            const t = i / 6, px = (1 - t) * (1 - t) * (s.cx - w) + 2 * (1 - t) * t * s.cx + t * t * (s.cx + w);
            const py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 17 + dy) + t * t * y;
            out.push(`<circle cx="${n(px)}" cy="${n(py)}" r="2.2" fill="${i % 2 ? bone : gold}"/>`);
          }
        }
        return `<g class="ch-acc ch-jewel">${out.join('')}</g>`;
      }
      default: return '';
    }
  }

  /* barba: a mesma silhueta do rosto, presa por um recorte */
  function beardOf(kind, s, o, col) {
    if (!kind || kind === 'no' || kind === 'nao') return '';
    const id = nid('bd');
    const { cx, rx, ry, cy } = s;
    const op = kind === 'stubble' || kind === 'barba' ? 0.34 : 1;
    const top = kind === 'full' || kind === 'cheia' ? cy - ry * 0.1 : kind === 'bigode' ? cy + ry * 0.44 : cy + ry * 0.24;
    const wide = kind === 'goatee' || kind === 'cavanhaque' ? rx * 0.5 : rx * 1.12;
    return `<clipPath id="${id}"><path d="${headPath(s, o.jaw)}"/></clipPath>
      <g clip-path="url(#${id})" opacity="${op}">
        <rect x="${n(cx - wide)}" y="${n(top)}" width="${n(wide * 2)}" height="${n(ry * 1.4)}" fill="${col}"/>
        <path d="M${n(cx - rx * 1.1)} ${n(cy)} q${n(rx * 0.5)} ${n(ry * 0.5)} ${n(rx * 0.36)} ${n(ry * 0.86)} q${n(-rx * 0.5)} ${n(-ry * 0.3)} ${n(-rx * 0.5)} ${n(-ry * 0.86)} Z" fill="${col}"/>
        <path d="M${n(cx + rx * 1.1)} ${n(cy)} q${n(-rx * 0.5)} ${n(ry * 0.5)} ${n(-rx * 0.36)} ${n(ry * 0.86)} q${n(rx * 0.5)} ${n(-ry * 0.3)} ${n(rx * 0.5)} ${n(-ry * 0.86)} Z" fill="${col}"/>
      </g>`;
  }

  /* =============================================================
     11. PERSONAGEM
     Traços que ninguém escolheu saem de um sorteio estável a partir
     do nome: o mesmo personagem sempre tem o mesmo rosto, e dois
     personagens nunca têm exatamente o mesmo. Quem quiser controlar
     tudo passa os atributos no HTML.
     ============================================================= */
  const MOODS = {
    sorriso: { olhos: 'aberto', boca: 'sorriso' },
    riso:    { olhos: 'fechado', boca: 'riso' },
    aberto:  { olhos: 'aberto', boca: 'aberto' },
    serio:   { olhos: 'aberto', boca: 'serio' },
    piscada: { olhos: 'piscada', boca: 'riso' }
  };
  const MOOD_ALIAS = { smile: 'sorriso', cheer: 'riso', open: 'aberto', think: 'serio', wink: 'piscada' };
  const HAIR_ALIAS = {
    coils: 'cocos', curls: 'cacheado', crop: 'curto', buzz: 'raspado', wavy: 'ondulado',
    straight: 'liso', braids: 'trancas', boxer: 'trancas', headwrap: 'turbante', puffs: 'cocos',
    long: 'afrolongo', blackpower: 'afro'
  };

  function legsOf(s, tone) {
    const shoe = '#2A1D17', shoeD = '#180F0B';
    const sole = (side) => {
      const cxl = s.cx + side * s.legSep, y = s.ankleY, w = s.foot;
      return `<path d="M${n(cxl - w * 0.5)} ${n(y + 5.4)} L${n(cxl + side * w * 0.86)} ${n(y + 5.4)}" stroke="${shoeD}" stroke-width="1.8" opacity=".6" stroke-linecap="round"/>`;
    };
    return `<g class="ch-legs">
      <path d="${legPath(s, -1)}" fill="${tone.shade}"/>
      <path d="${shoePath(s, -1)}" fill="${shade(shoe, 6)}"/>
      ${sole(-1)}
      <path d="${legPath(s, 1)}" fill="${tone.hex}"/>
      <path d="${shoePath(s, 1)}" fill="${shoe}"/>
      ${sole(1)}
    </g>`;
  }

  function character(opts) {
    const o = Object.assign({
      skin: 8, hair: 'afro', hairColor: 'black', outfit: 'vestido', build: 'f',
      pose: 'solto', mood: 'sorriso', beard: 'no', acc: 'nada', name: '',
      c1: null, c2: null, pattern: null, len: null,
      jaw: null, nose: null, lips: null, eyes: null, brow: null, iris: null,
      wrap: '#2E9E6B', wrap2: '#F1E4CE', frame: '#E5A83A', frame2: '#F1E4CE'
    }, opts || {});
    o.build = SK[o.build] ? o.build : 'f';
    const s = skeleton(o.build);
    const tone = TONES[o.skin] || TONES[8];
    const seed = hashOf(`${o.name}|${o.hair}|${o.outfit}|${o.skin}|${o.build}`);
    const pick = (arr, k) => arr[(seed >>> k) % arr.length];
    const fem = o.build !== 'm';
    o.jaw = o.jaw || (o.build === 'k' ? 'redondo' : fem ? pick(['suave', 'fino', 'medio'], 3) : pick(['medio', 'marcado'], 3));
    o.nose = o.nose || pick(['largo', 'medio', 'chato', 'fino', 'largo', 'medio'], 7);
    o.lips = o.lips || pick(['volumosos', 'volumosos', 'medios', 'finos'], 11);
    o.eyes = o.eyes || pick(['amendoa', 'grande', 'redondo', 'suave', 'gatinho', 'caido'], 13);
    o.brow = o.brow || (fem ? pick(['arqueada', 'fina', 'reta'], 17) : pick(['grossa', 'reta'], 17));
    o.iris = o.iris || pick(['escuro', 'castanho', 'escuro', 'mel', 'verde', 'castanho'], 19);
    o.c1 = safe(o.c1, '#C9553A');
    o.c2 = safe(o.c2, light(o.c1, 0.42));
    o.wrap = safe(o.wrap, '#2E9E6B');
    o.wrap2 = safe(o.wrap2, '#F1E4CE');
    o.frame = safe(o.frame, '#E5A83A');
    o.frame2 = safe(o.frame2, '#F1E4CE');

    const hairCol = HAIR[o.hairColor] || HAIR.black;
    const hairFn = HAIRS[o.hair] || HAIRS[HAIR_ALIAS[o.hair]] || HAIRS.afro;
    const hs = hairFn(hairCol, o, s);
    const spec = Object.assign({}, (OUTFITS[OUTFIT_ALIAS[o.outfit] || o.outfit] || OUTFITS.vestido)(s));
    if (o.pattern) spec.pattern = o.pattern;
    const fit = buildOutfit(spec, s, o.c1, o.c2, tone);
    const g = fg(s);
    const pos = POSES[POSE_ALIAS[o.pose] || o.pose] || POSES.solto;
    const mood = MOODS[MOOD_ALIAS[o.mood] || o.mood] || MOODS.sorriso;
    const browCol = mix(hairCol.base, '#2A170D', 0.4);
    const gid = nid('bg');
    const line = nid('ln');
    const hairline = mix(hairCol.base, tone.hex, 0.5);

    const openEye = (x, side) => eye(o.eyes, x, g.eyeY, side, g, o.iris);
    const shutEye = (x) => eyeShut(x, g.eyeY, g.eyeRx * 1.05);
    const eyes = mood.olhos === 'fechado' ? shutEye(s.cx - g.eyeDx) + shutEye(s.cx + g.eyeDx)
      : mood.olhos === 'piscada' ? openEye(s.cx - g.eyeDx, -1) + shutEye(s.cx + g.eyeDx)
        : openEye(s.cx - g.eyeDx, -1) + openEye(s.cx + g.eyeDx, 1);
    const moodBoca = mood.boca === 'riso' ? 'grin' : mood.boca === 'aberto' ? 'open' : mood.boca === 'serio' ? 'flat' : 'smile';

    const headD = headPath(s, o.jaw);
    const R = s.rx * (JAWS[o.jaw] || JAWS.medio).cheek;
    const glow = `<ellipse cx="${n(s.cx)}" cy="${n(s.cy - s.ry * 0.5)}" rx="${n(s.rx * 0.44)}" ry="${n(s.ry * 0.22)}" fill="${tone.lite}" opacity=".2"/>`
      + `<ellipse cx="${n(s.cx - s.rx * 0.6)}" cy="${n(s.cy + s.ry * 0.3)}" rx="${n(s.rx * 0.3)}" ry="${n(s.ry * 0.18)}" fill="${tone.lite}" opacity=".24"/>`
      + `<ellipse cx="${n(s.cx + s.rx * 0.6)}" cy="${n(s.cy + s.ry * 0.3)}" rx="${n(s.rx * 0.3)}" ry="${n(s.ry * 0.18)}" fill="${tone.lite}" opacity=".24"/>`;
    const rim = `<path d="M${n(s.cx - R + 2)} ${n(s.cy + s.ry * 0.34)} C${n(s.cx - R + 0.6)} ${n(s.cy - s.ry * 0.5)} ${n(s.cx - R * 0.55)} ${n(s.cy - s.ry * 1.06)} ${n(s.cx + s.rx * 0.34)} ${n(s.cy - s.ry * 1.06)}" fill="none" stroke="${tone.lite}" stroke-width="2.4" opacity=".36" stroke-linecap="round"/>`;
    /* sombra do queixo sobre o pescoço: é o que separa cabeça de tronco */
    const neckShade = `<rect x="${n(s.cx - s.neck * 0.98)}" y="${n(s.chin - 8)}" width="${n(s.neck * 1.96)}" height="${n(s.shoY - s.chin + 10)}" rx="${n(s.neck * 0.7)}" fill="${tone.deep}" opacity=".2"/>`;
    const cloth = { c1: o.c1, c2: o.c2 };
    const label = esc(o.name || 'Personagem ilustrado');

    return `<svg class="ch" viewBox="0 0 220 320" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${tone.shade}"/>
          <stop offset=".42" stop-color="${tone.hex}"/>
          <stop offset="1" stop-color="${dark(tone.hex, 0.14)}"/>
        </linearGradient>
        <linearGradient id="${line}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${tone.hex}"/>
          <stop offset="1" stop-color="${dark(tone.hex, 0.16)}"/>
        </linearGradient>
      </defs>
      <ellipse class="ch-shadow" cx="${s.cx}" cy="${GROUND + 5}" rx="${n(s.sho * 1.42)}" ry="6.5" fill="#000" opacity=".2"/>
      <g class="ch-bob">
        ${hs.back}
        ${legsOf(s, tone)}
        ${fit.lower}
        <path class="ch-torso" d="${torsoPath(s)}" fill="url(#${gid})"/>
        ${neckShade}
        ${fit.body}
        ${fit.neck}
        ${hs.over || ''}
        ${arm(s, -1, pos.l, tone, cloth, fit.sleeve, 'back')}
        ${arm(s, 1, pos.r, tone, cloth, fit.sleeve, 'front')}
        <g class="ch-head-g">
          ${ear(s, -1, tone)}${ear(s, 1, tone)}
          <path class="ch-head" d="${headD}" fill="${tone.hex}"/>
          ${glow}${rim}
          ${hs.front}
          ${beardOf(o.beard, s, o, hairCol.base)}
          <g class="ch-face">
            ${brow(o.brow, s.cx - g.eyeDx, g.browY, -1, g, browCol)}
            ${brow(o.brow, s.cx + g.eyeDx, g.browY, 1, g, browCol)}
            ${eyes}
            ${nose(o.nose, s, g, tone)}
            <g class="ch-mouth">${mouth(o.lips, s, g, tone, moodBoca)}</g>
          </g>
        </g>
        ${accessory(o.acc, s, o)}
      </g>
    </svg>`;
  }

  /* escapa o que vai dentro de atributo: nome vem do HTML */
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* =============================================================
     12. RITMO
     Sorteio estável a partir do nome: o mesmo personagem sempre
     anima igual, mas dois vizinhos nunca entram em fase — e como o
     sorteio entra na duração, o conjunto não repete a cada ciclo.
     ============================================================= */
  function hashOf(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function rhythm(name) {
    const seed = hashOf(name);
    const rnd = (k) => (((seed >>> ((k * 7) % 25)) ^ (seed >>> ((k * 11 + 3) % 25))) & 255) / 255;
    const dur = (k, a, b) => (a + (b - a) * rnd(k)).toFixed(2) + 's';
    const ph = (k, spread) => (-spread * rnd(k + 5)).toFixed(2) + 's';
    const st = {};
    st['--d-bob'] = dur(1, 5.4, 8.6);
    st['--d-head'] = dur(2, 6.6, 9.8);
    st['--d-arm'] = dur(3, 4.6, 7.4);
    st['--d-fore'] = dur(4, 3.2, 5.6);
    st['--d-cloth'] = dur(5, 5.8, 9);
    st['--d-hair'] = dur(6, 5.6, 9.4);
    st['--d-eye'] = dur(7, 3.4, 8.2);
    st['--d-mouth'] = dur(8, 6.4, 10.8);
    st['--d-brow'] = dur(9, 7.6, 12.4);
    st['--d-shadow'] = st['--d-bob'];
    st['--d-float'] = dur(10, 6.8, 9.8);
    st['--d-jewel'] = dur(11, 3.4, 6.2);
    st['--p-bob'] = ph(1, 5.5);
    st['--p-head'] = ph(2, 6);
    st['--p-arm'] = ph(3, 4.4);
    st['--p-fore'] = ph(4, 3.2);
    st['--p-cloth'] = ph(5, 7);
    st['--p-hair'] = ph(6, 6.5);
    st['--p-eye'] = ph(7, 7);
    st['--p-mouth'] = ph(8, 9);
    st['--p-brow'] = ph(9, 10);
    st['--p-shadow'] = st['--p-bob'];
    st['--p-jewel'] = ph(10, 3.4);
    st['--p-jewel-r'] = ph(11, 3.4);
    return st;
  }

  /* =============================================================
     13. RETRATO DE CABELO
     Mesmo rosto e mesmo desenho dos personagens, em enquadramento
     de busto. Usado na galeria de texturas.
     ============================================================= */
  const BUST_VIEW = '63 -14 94 112';
  function hairSample(name, skin = 8, color = 'black') {
    const s = skeleton('f');
    const tone = TONES[skin] || TONES[8];
    const hairCol = HAIR[color] || HAIR.black;
    const o = {
      build: 'f', jaw: 'suave', nose: 'medio', lips: 'volumosos', eyes: 'amendoa',
      iris: 'escuro', brow: 'arqueada', acc: 'nada', hairColor: color, len: 'medio', name,
      wrap: '#2E9E6B', wrap2: '#F1E4CE', frame: '#E5A83A', frame2: '#F1E4CE'
    };
    const hs = (HAIRS[name] || HAIRS[HAIR_ALIAS[name]] || HAIRS.afro)(hairCol, o, s);
    const g = fg(s);
    const bc = mix(hairCol.base, '#2A170D', 0.4);
    return `<svg class="hair-swatch" viewBox="${BUST_VIEW}" preserveAspectRatio="xMidYMin meet" role="img"
      aria-label="${esc(name)}" xmlns="http://www.w3.org/2000/svg">
      ${hs.back}
      <path d="${torsoPath(s)}" fill="${tone.shade}"/>
      <path d="${headPath(s, 'suave')}" fill="${tone.hex}"/>
      ${hs.front}
      <g class="ch-face">
        ${brow('arqueada', s.cx - g.eyeDx, g.browY, -1, g, bc)}
        ${brow('arqueada', s.cx + g.eyeDx, g.browY, 1, g, bc)}
        ${eye('amendoa', s.cx - g.eyeDx, g.eyeY, -1, g, 'escuro')}
        ${eye('amendoa', s.cx + g.eyeDx, g.eyeY, 1, g, 'escuro')}
        ${nose('medio', s, g, tone)}
        ${mouth('volumosos', s, g, tone, 'smile')}
      </g>
    </svg>`;
  }

  /* =============================================================
     14. MOTIVOS
     Geometrias inspiradas em tecidos africanos (kente, bogolan,
     adire, kuba, ndop, aso oke) e, novos aqui, os motivos de água —
     corrente, onda e o próprio encontro dos rios.
     São interpretações gráficas, não reproduções de peças.
     ============================================================= */
  const MOTIFS = {
    /* tira de kente: urdume cruzado pela trama */
    kente: `<g fill="none" stroke="currentColor" stroke-width="6"><path d="M13 2v60M32 2v60M51 2v60"/></g>
      <g fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="15 9"><path d="M2 16h60M2 48h60"/></g>`,
    /* bogolan: losango com losango miúdo dentro */
    bogolan: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
        <path d="M32 4 L60 32 L32 60 L4 32 Z"/><path d="M32 20 L46 32 L32 44 L18 32 Z"/></g>
      <circle cx="32" cy="32" r="4.5" fill="currentColor"/>`,
    /* adire: anéis de tinta resistida e marcas de canto */
    adire: `<g fill="none" stroke="currentColor" stroke-width="5"><circle cx="32" cy="32" r="11"/><circle cx="32" cy="32" r="24"/></g>
      <g fill="currentColor"><circle cx="6" cy="6" r="3.6"/><circle cx="58" cy="6" r="3.6"/><circle cx="6" cy="58" r="3.6"/><circle cx="58" cy="58" r="3.6"/></g>`,
    /* kuba: ziguezague de fibra trançada */
    kuba: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 44 L18 16 L32 44 L46 16 L60 44"/><path d="M4 58h56"/></g>`,
    /* ndop: bloco de índigo com marcas */
    ndop: `<g fill="none" stroke="currentColor" stroke-width="5"><rect x="6" y="6" width="52" height="52" rx="11"/></g>
      <g fill="currentColor"><circle cx="20" cy="20" r="3.6"/><circle cx="44" cy="20" r="3.6"/><circle cx="20" cy="44" r="3.6"/><circle cx="44" cy="44" r="3.6"/>
        <path d="M32 27 L37 32 L32 37 L27 32 Z"/></g>`,
    /* aso oke: faixas de tecelagem com ziguezague */
    aso: `<g fill="currentColor"><rect x="6" y="7" width="52" height="7"/><rect x="6" y="50" width="52" height="7"/></g>
      <g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M6 40 L17 24 L28 40 L39 24 L50 40 L58 30"/></g>`,
    /* trama de pente */
    comb: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
        <path d="M12 8v48M32 8v48M52 8v48"/><path d="M12 20h20M32 34h20M12 48h20"/></g>`,
    /* losango duplo */
    lozenge: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M32 6 L58 32 L32 58 L6 32 Z"/></g>
      <path d="M32 20 L44 32 L32 44 L20 32 Z" fill="currentColor"/>`,
    /* corrente: linhas que correm */
    corrente: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
        <path d="M2 20 q10 -8 20 0 t20 0 t20 0"/><path d="M2 36 q10 -8 20 0 t20 0 t20 0"/><path d="M2 52 q10 -8 20 0 t20 0 t20 0"/></g>`,
    /* encontro: dois caminhos que se juntam */
    encontro: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
        <path d="M4 14 q18 2 28 14"/><path d="M4 50 q18 -2 28 -14"/><path d="M34 28 q14 -3 26 0"/></g>
      <circle cx="34" cy="28" r="5" fill="currentColor"/>`
  };
  function motif(name, cls = '') {
    return `<svg class="motif ${cls}" viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${MOTIFS[name] || MOTIFS.kente}</svg>`;
  }

  /* =============================================================
     15. GLIFOS DE TEXTURA CAPILAR
     ============================================================= */
  const TEXTURES = {
    crespo: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="${curlPath(18, 34, 9)}"/><path d="${curlPath(40, 22, 8)}"/><path d="${curlPath(44, 46, 8)}"/></g>`,
    cacheado: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M8 44 q-2 -16 10 -18 q12 -2 12 8"/><path d="M34 24 q12 -6 18 4 q6 10 -4 14"/><path d="M18 52 q10 4 18 -2"/></g>`,
    ondulado: `<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">
      <path d="M6 22 q9 -10 18 0 t18 0 t16 0"/><path d="M6 40 q9 -10 18 0 t18 0 t16 0"/><path d="M6 58 q9 -10 18 0 t18 0"/></g>`,
    liso: `<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">
      <path d="M18 6 q-4 24 2 52"/><path d="M32 4 q-2 26 0 54"/><path d="M46 6 q4 24 -2 52"/></g>`,
    trancas: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 8 l8 8 l-8 8 l8 8 l-8 8 l8 8 l-8 8"/><path d="M50 8 l-8 8 l8 8 l-8 8 l8 8 l-8 8 l8 8"/></g>`,
    nago: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M10 14 q22 -8 44 0"/><path d="M8 30 q24 -8 48 0"/><path d="M10 46 q22 -8 44 0"/><path d="M14 60 q18 -6 36 0"/></g>`,
    locs: `<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <path d="M20 6 q-4 26 0 52"/><path d="M44 6 q4 26 0 52"/></g>
      <g stroke="currentColor" stroke-width="2" opacity=".7"><path d="M15 22h10M16 40h9M39 22h10M39 40h9"/></g>`,
    bantu: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="${curlPath(20, 20, 8)}"/><path d="${curlPath(44, 20, 8)}"/><path d="${curlPath(20, 46, 8)}"/><path d="${curlPath(44, 46, 8)}"/></g>`,
    boxer: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 18 q24 -12 48 0"/><path d="M6 32 q26 -12 52 0"/><path d="M8 46 q24 -12 48 0"/></g>`
  };
  function texture(name) {
    return `<svg class="tex" viewBox="-2 -2 68 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${TEXTURES[name] || TEXTURES.crespo}</svg>`;
  }

  /* =============================================================
     16. DIAGRAMAS E ESCALAS
     ============================================================= */
  /* melanina: os grânulos que dão a cor da pele */
  function melanina() {
    const seeds = [
      [40, 30, 16, 0.9], [78, 22, 11, 0.7], [112, 40, 19, 0.95], [58, 62, 13, 0.6],
      [140, 70, 14, 0.75], [96, 84, 9, 0.45], [30, 84, 10, 0.5], [164, 34, 8, 0.4],
      [124, 12, 7, 0.35], [70, 108, 8, 0.4], [150, 106, 10, 0.5], [18, 56, 7, 0.35]
    ];
    return `<svg class="art" viewBox="0 0 190 130" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${seeds.map(([x, y, r, o], i) => `<circle class="mf-gr" cx="${x}" cy="${y}" r="${r}" fill="currentColor" opacity="${o}" style="--d:${i * 0.09}s"/>`).join('')}
    </svg>`;
  }

  /* proporção populacional — barra empilhada (dado do IBGE) */
  function proporcao(seg) {
    const total = seg.reduce((a, x) => a + x.v, 0);
    let x = 0;
    const bars = seg.map((sg, i) => {
      const w = (sg.v / total) * 100;
      const el = `<g class="pf-seg" style="--d:${i * 0.12}s"><rect x="${n(x)}" y="0" width="${n(w)}" height="34" fill="${sg.c}"/></g>`;
      x += w;
      return el;
    }).join('');
    return `<svg class="chart" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  }

  /* =============================================================
     O RIO — o desenho do nome desta apresentação
     Sete afluentes entram pela esquerda e pelo alto, cada um com a
     sua cor, e desembocam num rio só: é a ideia de confluência, e é
     também o que acontece com os sete assuntos. As linhas de dentro
     correm (a animação está no slides.css).
     ============================================================= */
  const RIO_CORES = ['#E5A83A', '#C9553A', '#1E9E8C', '#6C7BF0', '#D2477F', '#3FA86B', '#A960C9'];
  const RIOS = [
    [[2, 14], [70, 38], [150, 74], [212, 102]],
    [[2, 50], [80, 64], [156, 86], [214, 110]],
    [[2, 90], [86, 90], [158, 104], [214, 119]],
    [[2, 130], [84, 126], [156, 126], [214, 127]],
    [[2, 170], [80, 158], [152, 142], [214, 135]],
    [[2, 210], [70, 188], [150, 158], [212, 143]],
    [[146, 2], [176, 38], [200, 80], [212, 115]]
  ];
  function rio(kind = '') {
    const id = nid('rio');
    const fios = RIOS.map((pts, i) => {
      const col = RIO_CORES[i % RIO_CORES.length];
      const d = crPath(pts);
      return `<g class="rio__afluente" style="--i:${i};--cor:${col}">
        <path d="${d}" fill="none" stroke="${col}" stroke-width="7.4" stroke-linecap="round" opacity=".9"/>
        <path class="rio__agua" d="${d}" fill="none" stroke="#FFF7EC" stroke-width="1.6" stroke-dasharray="4 10" opacity=".65"/>
      </g>`;
    }).join('');
    const corpo = `M212 100 C252 106 300 116 394 122 L394 152 C300 148 252 142 212 146 C205 132 205 114 212 100 Z`;
    const ondas = [108, 122, 136].map((y, i) =>
      `<path class="rio__agua" style="--i:${7 + i}" d="M216 ${y} C260 ${y + 4} 320 ${y + 8} 392 ${y + 9}" fill="none" stroke="#FFF7EC" stroke-width="1.8" stroke-dasharray="6 12" opacity=".5"/>`).join('');
    const encontro = `<g class="rio__encontro"><circle cx="212" cy="123" r="15" fill="none" stroke="#FFF7EC" stroke-width="1.4" opacity=".45"/>
      <circle cx="212" cy="123" r="7" fill="#FFF7EC" opacity=".18"/></g>`;
    const full = kind !== 'mini';
    return `<svg class="rio${full ? '' : ' rio--mini'}" viewBox="0 0 400 224" role="img"
      aria-label="Sete afluentes de cores diferentes desembocando num rio só" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="currentColor" stop-opacity=".22"/>
        <stop offset="1" stop-color="currentColor" stop-opacity=".1"/>
      </linearGradient></defs>
      <path d="${corpo}" fill="url(#${id})"/>
      <path d="${corpo}" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
      ${fios}
      ${ondas}
      ${encontro}
    </svg>`;
  }

  /* escala de tons: os treze tons, com o subtom que vem nas pesquisas */
  function toneStrip() {
    return `<div class="tira">${TONE_ROWS.map(([k, name, hex, under, sub]) =>
      `<span class="tira__i" style="--c:${hex}" title="${name} · ${TONE_TOOLTIP[under] || under}">
        <b class="tira__b">${name}</b><i class="tira__u">${under}<span>${sub}</span></i>
      </span>`).join('')}</div>`;
  }

  /* =============================================================
     17. LEITURA DOS ATRIBUTOS
     ============================================================= */
    return {
      skin: +(d.skin || 8), hair: d.hair || 'afro', hairColor: d.haircolor || 'black',
      outfit: d.outfit || 'vestido', build: d.build || 'f', pose: d.pose || 'solto',
      mood: d.mood || 'sorriso', beard: d.beard || 'no', acc: d.acc || 'nada',
      jaw: d.jaw, nose: d.nose, lips: d.lips, eyes: d.eyes, iris: d.iris, brow: d.brow,
      pattern: d.pattern, len: d.len, c1: d.c1, c2: d.c2,
      wrap: d.wrap, wrap2: d.wrap2, frame: d.frame, frame2: d.frame2,
      name: d.name || 'Personagem'
    };
  }

  function mount(root = document) {
    root.querySelectorAll('[data-char]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const d = el.dataset;
      el.innerHTML = character(charOpts(d));
      el.style.setProperty('--tilt', d.tilt || '0deg');
      el.style.setProperty('--lag', d.lag || '0s');
      /* a semente vem do conjunto todo, não só do nome: dois homônimos
         não entram em fase e o grupo nunca repete igual */
      const r = rhythm(`${d.name || 'p'}|${d.hair || ''}|${d.pose || ''}|${d.c1 || ''}|${d.build || 'f'}`);
      Object.keys(r).forEach((k) => el.style.setProperty(k, r[k]));
      /* cada olho pisca no seu tempo: nada de sincronia */
      const seed = `${d.name || 'p'}${d.hair || ''}${d.pose || ''}`;
      el.querySelectorAll('.ch-eye:not(.ch-eye--shut)').forEach((eyeEl, k) => {
        if (!k) return;
        eyeEl.style.animationDelay = (-((hashOf(seed + k) % 800) / 100)).toFixed(2) + 's';
        eyeEl.style.animationDuration = (3.6 + ((hashOf(seed + 'x' + k) % 480) / 100)).toFixed(2) + 's';
      });
    });
    root.querySelectorAll('[data-motif]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = motif(el.dataset.motif);
    });
    root.querySelectorAll('[data-hairswatch]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = hairSample(el.dataset.hairswatch, +(el.dataset.swatchskin || 8), el.dataset.swatchcolor || 'black');
    });
    root.querySelectorAll('[data-tex]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = texture(el.dataset.tex);
    });
    root.querySelectorAll('[data-melanina]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = melanina();
    });
    root.querySelectorAll('[data-proporcao]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = proporcao(JSON.parse(el.dataset.proporcao));
    });
    root.querySelectorAll('[data-rio]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = rio(el.dataset.rio || '');
    });
    root.querySelectorAll('[data-tons]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = toneStrip();
    });
  }

  return {
    TONES, TONE_ORDER, TONE_ROWS, HAIR, HAIRS, OUTFITS, POSES, HAIR_ALIAS, ACC_ALIAS, MOODS,
    character, hairSample, motif, texture, melanina, proporcao, rio, toneStrip,
    mount, shade, mix, hashOf
  };
})();

if (typeof window !== 'undefined') {
  window.Art = Art;
  document.addEventListener('DOMContentLoaded', () => Art.mount());
}









