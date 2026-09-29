/* =============================================================
   CONFLUÊNCIAS — arte original em SVG
   Personagens, tecidos, símbolos e diagramas desenhados à mão
   para esta apresentação. Nenhum recurso externo.
   ============================================================= */
const Art = (function () {
  'use strict';

  let uid = 0;
  const nid = (p) => `${p}${(uid += 1)}`;

  /* =============================================================
     ELENCO EM OBRAS
     Enquanto os personagens não estão prontos, cada espaço que
     receberia uma figura mostra um aviso no lugar dela — assim o
     site pode ir para o ar sem desenho pela metade.
     Para ver a arte em andamento: index.html?elenco=completo
     Troque WIP para false (ou false) quando os personagens
     entrarem de vez.
     ============================================================= */
  const WIP = !/[?&]elenco=completo(?:[&#]|$)/.test(location.search);

  /* cx, cy e w, h são em unidades do viewBox (que pode não começar
     em 0 — o retrato de cabelo é um recorte). */
  function wipArt(view, cx, cy, w, h, titulo, sub, extra) {
    const fs = Math.max(8.5, Math.min(w, h) * 0.08);
    const boxW = w * 0.88, boxH = h * 0.7;
    const r = w * 0.085;
    return `<svg class="ch ch--wip${extra ? ' ' + extra : ''}" viewBox="${view}" role="img" aria-label="Personagem em construção"
      xmlns="http://www.w3.org/2000/svg">
      <rect x="${(cx - boxW / 2).toFixed(1)}" y="${(cy - boxH / 2).toFixed(1)}"
        width="${boxW.toFixed(1)}" height="${boxH.toFixed(1)}" rx="10"
        style="fill:var(--card);stroke:var(--line)" fill-opacity=".92" stroke-width="2.2" stroke-dasharray="8 7"/>
      <circle cx="${cx}" cy="${(cy - h * 0.09).toFixed(1)}" r="${r.toFixed(1)}"
        fill="none" style="stroke:var(--fg-dim)" stroke-width="${(w * 0.022).toFixed(1)}"/>
      <path d="M${(cx - w * 0.24).toFixed(1)} ${(cy + h * 0.1).toFixed(1)}
        C${(cx - w * 0.24).toFixed(1)} ${(cy - h * 0.06).toFixed(1)} ${(cx + w * 0.24).toFixed(1)} ${(cy - h * 0.06).toFixed(1)} ${(cx + w * 0.24).toFixed(1)} ${(cy + h * 0.1).toFixed(1)}"
        fill="none" style="stroke:var(--fg-dim)" stroke-width="${(w * 0.022).toFixed(1)}" stroke-linecap="round"/>
      <text x="${cx}" y="${(cy + h * 0.2).toFixed(1)}" text-anchor="middle"
        style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;fill:var(--fg-soft)" font-size="${fs.toFixed(1)}">${titulo}</text>
      ${sub ? `<text x="${cx}" y="${(cy + h * 0.28).toFixed(1)}" text-anchor="middle"
        style="font-family:'Martian Mono',monospace;fill:var(--fg-dim)" font-size="${(fs * 0.5).toFixed(1)}" letter-spacing="1">${sub}</text>` : ''}
    </svg>`;
  }

  /* ---------- paletas ---------- */
  const TONES = {
    1: { name: 'Areia',    hex: '#F3CDA6', shade: '#DFAB80', deep: '#C08A5F' },
    2: { name: 'Caramelo', hex: '#E0A878', shade: '#C4874F', deep: '#A66B3C' },
    3: { name: 'Mel',      hex: '#C68552', shade: '#A56839', deep: '#875028' },
    4: { name: 'Castanho', hex: '#9C5F35', shade: '#7B4623', deep: '#5F3315' },
    5: { name: 'Cacau',    hex: '#6E3A20', shade: '#522A14', deep: '#3B1C0C' },
    6: { name: 'Ébano',    hex: '#4A2415', shade: '#341708', deep: '#1F0D04' }
  };
  const TONE_ORDER = [6, 5, 4, 3, 2, 1];

  const HAIR = {
    black:  { base: '#22150F', lite: '#452A1A' },
    brown:  { base: '#3C2415', lite: '#65391E' },
    auburn: { base: '#66301A', lite: '#8E4823' },
    silver: { base: '#C3B8AC', lite: '#E6DED5' }
  };

  const LIPS = '#8E3A38';
  const LIPS_D = '#5E1F1E';
  const PANTS = '#33303F';

  /* =============================================================
     GEOMETRIA
     viewBox 0 0 220 320. Adulto estilizado de ~5,7 cabeças:
     cabeça 21..73, ombro 90, cintura 146, quadril 172, joelho 244,
     tornozelo 296, pé 306, sombra 315.
     ============================================================= */
  const H = { cx: 110, cy: 47, rx: 22.5, ry: 26 };
  const EYE_Y = 48, EYE_DX = 9.6;
  const CHIN_Y = 73, NECK_Y = 86, SHO_Y = 90, ARMPIT_Y = 104;
  const CHEST_Y = 118, WAIST_Y = 146, HIP_Y = 172, CROTCH_Y = 188;
  const KNEE_Y = 244, ANKLE_Y = 294, FOOT_Y = 306;
  const SH = { f: [77, 143], m: [71, 149] };       /* ombro: meia largura 33 / 39 */
  const NW = { f: 8.6, m: 10.2 };                  /* pescoço */
  const ARMW = { f: [14, 10.5], m: [15.5, 11.5] }; /* braço / antebraço */
  const HAND_R = 6.4;
  /* larguras do tronco: peito, cintura, quadril, barra */
  const BODY = {
    f: { chest: 27, waist: 20.5, hip: 27.5, hem: 40 },
    m: { chest: 32, waist: 25,   hip: 28.5, hem: 34 }
  };
  /* pernas: separação dos eixos e espessuras */
  const LEG = {
    f: { sep: 12.4, thigh: 12.4, calf: 9.4, foot: 7.4 },
    m: { sep: 13.2, thigh: 13.4, calf: 10.2, foot: 7.9 }
  };
  const build = (o) => (o.build === 'm' ? 'm' : 'f');

  function safe(c, fallback) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(String(c || '').trim()) ? c.trim() : fallback;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* =============================================================
     OLHOS
     Íris grande ocupando quase toda a esclera — leitura boa também
     no tamanho de um selo. A pálpebra superior é uma linha grossa
     arqueada; o piscar comprime o grupo inteiro.
     ============================================================= */
  function eye(kind, s, tone) {
    const x = H.cx + s * EYE_DX, y = EYE_Y;
    const lash = (rx) =>
      `<path d="M${(x - rx).toFixed(1)} ${y - 1.2} Q${x} ${y - rx * 1.35} ${(x + rx).toFixed(1)} ${y - 1.2}"
         stroke="#241408" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const open = (rx, ry) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#FFF7EC"/>
       <ellipse cx="${(x + s * 0.7).toFixed(1)}" cy="${(y + 0.8).toFixed(1)}" rx="${(rx * 0.72).toFixed(1)}" ry="${(ry * 0.74).toFixed(1)}" fill="#2B170D"/>
       <circle cx="${(x - rx * 0.3).toFixed(1)}" cy="${(y - ry * 0.34).toFixed(1)}" r="${(rx * 0.3).toFixed(1)}" fill="#FFF7EC"/>
       ${lash(rx + 0.6)}`;
    const shut = (w) =>
      `<path d="M${x - w} ${y + 1.4} Q${x} ${y - w * 1.05} ${x + w} ${y + 1.4}"
         stroke="#241408" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
    const g = (inner, blink) => `<g class="ch-eye${blink ? '' : ' ch-eye--shut'}">${inner}</g>`;

    switch (kind) {
      case 'almond':  return g(open(6.2, 6.6), true);
      case 'soft':    return g(open(4.8, 7), true);
      case 'happy':   return g(shut(6.4), false);
      case 'wink':    return s < 0 ? g(open(5.6, 7.6), true) : g(shut(6.4), false);
      case 'lash':
        return g(open(5.8, 7.4) +
          `<path d="M${x - 6.4} ${y - 5.2} l-2.4 -3.2 M${x + 6.4} ${y - 5.2} l2.4 -3.2"
             stroke="#241408" stroke-width="2.4" stroke-linecap="round" fill="none"/>`, true);
      default:        return g(open(5.6, 7.4), true);
    }
  }

  /* =============================================================
     BOCAS — boca entre y=60 e y=69, queixo em 73
     ============================================================= */
  function mouth(kind) {
    switch (kind) {
      case 'grin':
        return `<path d="M103.6 61.4 Q110 64.6 116.4 61.4 Q115.4 69.4 110 69.8 Q104.6 69.4 103.6 61.4Z" fill="${LIPS_D}"/>
                <path d="M104.6 62.6 Q110 65 115.4 62.6 Q114.8 65.6 110 65.6 Q105.2 65.6 104.6 62.6Z" fill="#FFF6EC"/>`;
      case 'open':
        return `<path d="M106 61.4 Q110 63.4 114 61.4 Q113.4 69.4 110 69.6 Q106.6 69.4 106 61.4Z" fill="${LIPS_D}"/>
                <path d="M106.8 62.6 Q110 64 113.2 62.6 Q112.8 64.6 110 64.6 Q107.2 64.6 106.8 62.6Z" fill="#FFF6EC"/>`;
      case 'flat':
        return `<path d="M104.6 64.6 h10.8" stroke="#1C0F08" stroke-width="3.4" fill="none" stroke-linecap="round"/>
                <path d="M104.6 63.4 v2.4 M115.4 63.4 v2.4" stroke="#1C0F08" stroke-width="2.2" stroke-linecap="round"/>`;
      case 'smirk':
        return `<path d="M104.4 65.6 Q110 69 116 61.8" stroke="${LIPS_D}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
                <path d="M115.6 58.6 l3.4 -2" stroke="${LIPS_D}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      default:
        return `<path d="M104.6 62.8 Q110 68.4 115.4 62.8" stroke="${LIPS_D}" stroke-width="3.8" fill="none" stroke-linecap="round"/>
                <path d="M107.4 67.6 Q110 69.2 112.6 67.6" stroke="${LIPS}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".5"/>`;
    }
  }

  const MOODS = {
    smile: { eyes: 'round', mouth: 'smile' },
    cheer: { eyes: 'happy', mouth: 'grin' },
    open:  { eyes: 'round', mouth: 'open' },
    think: { eyes: 'soft',  mouth: 'flat' },
    wink:  { eyes: 'wink',  mouth: 'grin' }
  };

  function face(o, mood) {
    const t = o.tone;
    const male = o.build === 'm';
    const eyeKind = o.eyes || (MOODS[mood] || MOODS.smile).eyes;
    const mouthKind = o.mouth || (MOODS[mood] || MOODS.smile).mouth;
    const tilt = mood === 'cheer' ? -6 : mood === 'think' ? 4 : mood === 'wink' ? -3 : 0;
    /* sobrancelha encosta no olho; no homem mais grossa e reta */
    const bw = male ? 15 : 13.6, bh = male ? 4.6 : 3.7;
    const brows = [-1, 1].map((s) =>
      `<rect class="ch-brow" x="${(H.cx + s * EYE_DX - bw / 2).toFixed(1)}" y="${EYE_Y - 14}" width="${bw}" height="${bh}" rx="${bh / 2}"
        fill="#1C0F08" opacity=".85" transform="rotate(${(tilt * s).toFixed(1)} ${(H.cx + s * EYE_DX).toFixed(1)} ${EYE_Y - 12})"/>`).join('');

    return `<g class="ch-face">
      <ellipse class="ch-blush" cx="${H.cx - 14.5}" cy="58" rx="6" ry="3.4" fill="#E2705A" opacity=".22"/>
      <ellipse class="ch-blush" cx="${H.cx + 14.5}" cy="58" rx="6" ry="3.4" fill="#E2705A" opacity=".22"/>
      ${brows}
      ${eye(eyeKind, -1, t)}
      ${eye(eyeKind, 1, t)}
      <path d="M107.4 54.5 Q111.4 58.6 108 60.2" stroke="${t.deep}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g class="ch-mouth">${mouth(mouthKind)}</g>
    </g>`;
  }

  /* =============================================================
     CAPUZ DE CABELO — linha de cabelo sempre ACIMA das sobrancelhas
     (y=35), senão o rosto some atrás do cabelo.
     ============================================================= */
  const CAP = 'M89 58 Q86.5 20 110 18.5 Q133.5 20 131 58 L129.5 61 Q128.5 33 110 29.5 Q91.5 33 90.5 61 Z';
  const CAP_W = 'M87 58 Q84 12 110 11 Q136 12 133 58 L131 66 Q130 30 110 26 Q90 30 89 66 Z';

  const puffRing = (pts, cx, cy) =>
    pts.map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}"/>`).join('');

  const HAIRS = {
    /* afro / cocos — nuvem de bolas além do crânio */
    coils: (c) => {
      const pts = [[-32, 6, 12], [-27, -15, 12], [-14, -29, 12], [0, -34, 13],
                   [14, -29, 12], [27, -15, 12], [32, 6, 12], [28, 24, 11],
                   [15, 35, 10], [0, 40, 10], [-15, 35, 10], [-28, 24, 11]];
      return {
        back: `<g class="ch-hair" fill="${c.base}">
            <ellipse cx="110" cy="44" rx="34" ry="35"/>
            ${puffRing(pts, 110, 44)}
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            <g fill="${c.lite}" opacity=".26">
              <circle cx="96" cy="30" r="5.5"/><circle cx="110" cy="24" r="6.5"/>
              <circle cx="124" cy="30" r="5.5"/><circle cx="103" cy="20" r="4.4"/>
              <circle cx="117" cy="20" r="4.4"/>
            </g>
          </g>`
      };
    },

    /* locs — cordões; no homem param na nuca */
    locs: (c, o) => {
      const m = o.build === 'm';
      const loc = (x1, y1, x2, y2, x3, y3, w) =>
        `<path d="M${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${y2 - 34} ${x3} ${y3}"
          stroke="${c.base}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
      const lite = (x1, y1, x2, y2, x3, y3) =>
        `<path d="M${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${y2 - 34} ${x3} ${y3}"
          stroke="${c.lite}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".34"/>`;
      const B = m
        ? [[93, 26, 78, 74, 74, 108, 8.4], [102, 20, 89, 78, 87, 120, 8],
           [110, 18, 110, 80, 110, 126, 8], [118, 20, 131, 78, 133, 120, 8],
           [127, 26, 142, 74, 146, 108, 8.4]]
        : [[93, 26, 76, 104, 71, 156, 8.4], [102, 20, 87, 108, 83, 172, 8],
           [110, 18, 110, 110, 110, 180, 8], [118, 20, 133, 108, 137, 172, 8],
           [127, 26, 144, 104, 149, 156, 8.4]];
      const F = m
        ? [[94, 30, 78, 66, 72, 96, 5.4], [126, 30, 142, 66, 148, 96, 5.4]]
        : [[94, 30, 77, 74, 70, 128, 5.4], [126, 30, 143, 74, 150, 128, 5.4]];
      return {
        back: `<g class="ch-hair">
            ${B.map((a) => loc(...a)).join('')}
            ${m
              ? lite(93, 26, 78, 74, 74, 104) + lite(127, 26, 142, 74, 146, 104)
              : lite(93, 26, 76, 104, 72, 150) + lite(102, 20, 87, 108, 84, 168)
                + lite(118, 20, 133, 108, 136, 168) + lite(127, 26, 144, 104, 148, 150)}
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            ${F.map((a) => loc(...a)).join('')}
            <path d="M100 24 Q110 18 120 24" stroke="${c.lite}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".38"/>
          </g>`
      };
    },

    /* tranças com miçangas nas da frente */
    braids: (c, o) => {
      const beads = [safe(o.acc, '#E5A83A'), safe(o.acc2, '#F1E4CE'), '#F1E4CE'];
      const braid = (x1, y1, x2, y2, x3, y3, w, i, nb) => {
        let s = `<path d="M${x1} ${y1} C ${x1} ${y1 + 40} ${x2} ${y2 - 26} ${x3} ${y3}"
                 stroke="${c.base}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
        for (let k = 0; k < (nb || 0); k++) {
          s += `<circle cx="${x3}" cy="${y3 + 8 + k * 8}" r="${3.6 - k * 0.35}" fill="${beads[(i + k) % 3]}"/>`;
        }
        return s;
      };
      return {
        back: `<g class="ch-hair">
            ${braid(78, 34, 66, 96, 62, 154, 6.6, 0, 0)}
            ${braid(93, 24, 84, 96, 79, 176, 6.6, 1, 0)}
            ${braid(110, 20, 110, 98, 110, 186, 7, 2, 0)}
            ${braid(127, 24, 136, 96, 141, 176, 6.6, 0, 0)}
            ${braid(142, 34, 154, 96, 158, 154, 6.6, 1, 0)}
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            ${braid(96, 26, 86, 84, 80, 132, 5.6, 2, 3)}
            ${braid(124, 26, 134, 84, 140, 132, 5.6, 1, 3)}
            <g class="ch-jewel">
              <circle cx="87" cy="76" r="3.4" fill="${beads[2]}"/>
              <circle cx="84.5" cy="88" r="3" fill="${beads[0]}"/>
              <circle cx="133" cy="76" r="3.4" fill="${beads[0]}"/>
              <circle cx="135.5" cy="88" r="3" fill="${beads[2]}"/>
            </g>
            <path d="M110 18 L110 30" stroke="${c.lite}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".45"/>
            <path d="M100 22 Q110 16 120 22" stroke="${c.lite}" stroke-width="2.6" fill="none" opacity=".4"/>
          </g>`
      };
    },

    /* cacheados curtos */
    curls: (c) => {
      const pts = [[-26, -6, 11], [-17, -22, 11], [0, -29, 12], [17, -22, 11], [26, -6, 11],
                   [22, 12, 10], [8, 22, 10], [-8, 22, 10], [-22, 12, 10]];
      return {
        back: `<g class="ch-hair" fill="${c.base}">
            <ellipse cx="110" cy="44" rx="30" ry="31"/>
            ${puffRing(pts, 110, 44)}
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            <g fill="${c.lite}" opacity=".24">
              <circle cx="99" cy="26" r="5"/><circle cx="110" cy="21" r="5.8"/>
              <circle cx="121" cy="26" r="5"/>
            </g>
          </g>`
      };
    },

    /* ondas — massa atrás da cabeça; no homem para na orelha */
    wavy: (c, o) => {
      const m = o.build === 'm';
      return {
      back: `<g class="ch-hair">
          <path d="${m
            ? 'M86 62 Q82 16 110 14 Q138 16 134 62 Q140 82 132 94 Q120 102 110 97 Q100 102 88 94 Q80 82 86 62Z'
            : 'M86 62 Q82 16 110 14 Q138 16 134 62 Q143 96 133 124 Q121 138 110 131 Q99 138 87 124 Q77 96 86 62Z'}" fill="${c.base}"/>
          <g fill="none" stroke="${c.lite}" stroke-width="3" stroke-linecap="round" opacity=".32">
            <path d="M92 96 Q86 112 92 ${m ? 108 : 128}"/><path d="M102 104 Q97 118 102 ${m ? 114 : 134}"/>
            <path d="M118 104 Q123 118 118 ${m ? 114 : 134}"/><path d="M128 96 Q134 112 128 ${m ? 108 : 128}"/>
          </g>
        </g>`,
      front: `<g class="ch-hair-front">
          <path d="${CAP}" fill="${c.base}"/>
          <path d="M97 26 Q110 19 123 25" stroke="${c.lite}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".42"/>
          ${m ? '' : `<path d="M84 64 Q78 78 84 92 M136 64 Q142 78 136 92"
              stroke="${c.lite}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>
            <path d="M89 72 Q85 84 89 96 M131 72 Q135 84 131 96"
              stroke="${c.lite}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".32"/>`}
        </g>`
      };
    },

    /* turbante — pano com nó lateral */
    headwrap: (c, o) => {
      const a = safe(o.wrap, '#2E9E6B');
      const lite = safe(o.wrap2, '#F1E4CE');
      const dark = shade(a, -34);
      const id = nid('hw');
      return {
        back: `<g class="ch-hair">
            <path d="M84 64 Q79 10 110 9 Q141 10 136 64 Q145 88 134 110 Q120 100 110 116
                     Q100 100 86 110 Q75 88 84 64Z" fill="${a}"/>
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP_W}" fill="${a}"/>
            <clipPath id="${id}"><path d="${CAP_W}"/></clipPath>
            <g clip-path="url(#${id})" opacity=".42">
              ${[...Array(6)].map((_, i) => `<path d="M${88 + i * 9.5} 30 l5 -10 l5 10" stroke="${lite}" stroke-width="3.2" fill="none"/>`).join('')}
            </g>
            <path d="M93 22 Q110 31 127 22" stroke="${dark}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".7"/>
            <circle cx="136" cy="64" r="7.5" fill="${a}"/>
            <circle cx="136" cy="64" r="7.5" fill="none" stroke="${dark}" stroke-width="2.4"/>
            <path d="M138 70 Q148 84 146 104" stroke="${a}" stroke-width="9" fill="none" stroke-linecap="round"/>
            <path d="M139 72 Q146 84 145 98" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
          </g>`
      };
    },

    /* curto degradê */
    crop: (c) => {
      const id = nid('cr');
      return {
        back: `<g class="ch-hair"><path d="${CAP}" fill="${c.base}"/></g>`,
        front: `<g class="ch-hair-front">
          <path d="${CAP}" fill="${c.base}"/>
          <clipPath id="${id}"><path d="${CAP}"/></clipPath>
          <g clip-path="url(#${id})">
            ${[...Array(9)].map((_, i) => `<path d="M${94 + i * 4.4} 12 q-2 12 0 24" stroke="${c.lite}" stroke-width="2.2" fill="none" opacity=".3"/>`).join('')}
            <path d="M98 30 Q110 23 122 29" stroke="${c.lite}" stroke-width="4" fill="none" opacity=".24" stroke-linecap="round"/>
          </g>
        </g>`
      };
    },

    /* puffs: dois volumes laterais + faixa na linha do cabelo */
    puffs: (c, o) => ({
      back: `<g class="ch-hair">
          <ellipse cx="110" cy="44" rx="29" ry="31" fill="${c.base}"/>
          <circle cx="80" cy="20" r="16" fill="${c.base}"/>
          <circle cx="140" cy="20" r="16" fill="${c.base}"/>
          <circle cx="75" cy="28" r="6.5" fill="${c.lite}" opacity=".35"/>
          <circle cx="145" cy="28" r="6.5" fill="${c.lite}" opacity=".35"/>
        </g>`,
      front: `<g class="ch-hair-front">
          <path d="${CAP}" fill="${c.base}"/>
          <path d="M92 58 Q95 34 110 30 Q125 34 128 58" stroke="${safe(o.acc, '#E5A83A')}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
          <circle cx="110" cy="32" r="3.2" fill="${safe(o.acc2, '#F1E4CE')}"/>
        </g>`
    }),

    /* longo crespo — no homem para no ombro */
    long: (c, o) => {
      const m = o.build === 'm';
      return {
        back: `<g class="ch-hair">
            <path d="${m
              ? 'M85 62 Q80 12 110 10 Q140 12 135 62 Q144 96 136 126 Q124 138 110 132 Q96 138 84 126 Q76 96 85 62Z'
              : 'M85 62 Q80 12 110 10 Q140 12 135 62 Q148 138 138 184 Q124 202 110 194 Q96 202 82 184 Q72 138 85 62Z'}" fill="${c.base}"/>
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            <g fill="none" stroke="${c.lite}" stroke-width="3.4" stroke-linecap="round" opacity=".28">
              <path d="M92 104 Q85 140 92 ${m ? 126 : 180}"/>
              <path d="M128 104 Q135 140 128 ${m ? 126 : 180}"/>
              <path d="M101 100 Q96 136 101 ${m ? 122 : 174}"/>
              <path d="M119 100 Q124 136 119 ${m ? 122 : 174}"/>
              ${m ? '' : `<path d="M86 64 Q80 80 85 97"/><path d="M134 64 Q140 80 135 97"/>
                <path d="M91 72 Q87 85 91 97"/><path d="M129 72 Q133 85 129 97"/>`}
            </g>
          </g>`
      };
    },

    /* raspado */
    buzz: (c) => ({
      back: '',
      front: `<g class="ch-hair-front">
        <path d="${CAP}" fill="${c.base}"/>
        <path d="M97 32 Q110 25 123 31" stroke="${c.lite}" stroke-width="3.4" fill="none" opacity=".26" stroke-linecap="round"/>
      </g>`
    }),

    /* liso com meia; no homem curto até a orelha */
    straight: (c, o) => {
      const m = o.build === 'm';
      return {
        back: `<g class="ch-hair">
            <path d="${m
              ? 'M87 62 Q83 14 110 12 Q137 14 133 62 Q141 84 133 102 Q121 110 110 105 Q99 110 87 102 Q79 84 87 62Z'
              : 'M85 64 Q81 10 110 8 Q139 10 135 64 Q148 140 136 186 Q124 200 110 192 Q96 200 84 186 Q72 140 85 64Z'}" fill="${c.base}"/>
          </g>`,
        front: `<g class="ch-hair-front">
            <path d="${CAP}" fill="${c.base}"/>
            <path d="M110 20 L110 32" stroke="${c.lite}" stroke-width="2" fill="none" opacity=".42" stroke-linecap="round"/>
            <path d="M96 34 Q104 27 109 31" stroke="${c.lite}" stroke-width="2.2" fill="none" opacity=".26" stroke-linecap="round"/>
            <path d="M124 34 Q116 27 111 31" stroke="${c.lite}" stroke-width="2.2" fill="none" opacity=".26" stroke-linecap="round"/>
            ${m ? '' : `<g fill="none" stroke="${c.lite}" stroke-width="3.4" stroke-linecap="round" opacity=".4">
              <path d="M86 64 Q81 78 86 96"/><path d="M134 64 Q139 78 134 96"/>
            </g>`}
          </g>`
      };
    },

    /* trança boxer: costelas na frente + faixa */
    boxer: (c, o) => {
      const id = nid('bx');
      const rows = [24, 30, 36];
      let s = `<path d="${CAP}" fill="${c.base}"/>
        <clipPath id="${id}"><path d="${CAP}"/></clipPath>
        <g clip-path="url(#${id})">`;
      rows.forEach((y, i) => {
        s += `<path d="M${95 + i * 2} ${y} Q110 ${y - 5} ${125 - i * 2} ${y}" stroke="${c.lite}" stroke-width="2.4" fill="none" opacity=".5"/>`;
      });
      s += `</g>
        <path d="M92 58 Q95 34 110 30 Q125 34 128 58" stroke="${safe(o.acc, '#E5A83A')}" stroke-width="4.6" fill="none" stroke-linecap="round"/>`;
      return { back: '', front: `<g class="ch-hair-front">${s}</g>` };
    }
  };

  /* =============================================================
     POSE DOS BRAÇOS
     Cada pose descreve só o lado DIREITO da tela: [cotovelo x, y,
     pulso x, y] medidos a partir do ombro. O esquerdo ou espelha ou
     fica pendurado. O braço sai DEPOIS da roupa e a manga é filha
     do grupo, então acompanha a animação.
     ============================================================= */
  const HANG = [4, 34, 1, 64];
  const POSES = {
    down:  { r: HANG,          l: 'mirror' },
    /* mão erguida ao lado da cabeça */
    wave:  { r: [26, 4, 20, -46], l: 'hang' },
    open:  { r: [26, 20, 40, 14], l: 'mirror' },
    /* mão levantada para falar */
    talk:  { r: [24, 24, 20, -2], l: 'hang' },
    /* mão na cintura */
    hip:   { r: [18, 28, -8, 56], l: 'hang' },
    point: { r: [28, 14, 50, 6],  l: 'hang' }
  };

  function armPts(pose, o) {
    const p = POSES[pose] || POSES.wave;
    const SHK = SH[build(o)];
    const sx = SHK[1] - 6;                 /* ombro direito */
    const lx = SHK[0] + 6;                 /* ombro esquerdo */
    const mk = (x, d) => ({ s: [x, SHO_Y + 4], e: [x + d[0], SHO_Y + 4 + d[1]], w: [x + d[2], SHO_Y + 4 + d[3]] });
    const r = mk(sx, p.r);
    if (p.l === 'mirror') {
      return { r, l: { s: [220 - r.s[0], r.s[1]], e: [220 - r.e[0], r.e[1]], w: [220 - r.w[0], r.w[1]] } };
    }
    return { r, l: mk(lx, HANG) };
  }

  /* manga: acompanha o primeiro trecho do braço com folga */
  function sleevePath(a, w) {
    const dx = a.e[0] - a.s[0], dy = a.e[1] - a.s[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux;
    const t0 = -0.12, t1 = 0.62;
    const w0 = w / 2 + 3, w1 = w / 2 + 1.8;
    const P = (t, hw) => `${(a.s[0] + ux * len * t + px * hw).toFixed(1)} ${(a.s[1] + uy * len * t + py * hw).toFixed(1)}`;
    return `M${P(t0, w0)} L${P(t1, w1)} L${P(t1, -w1)} L${P(t0, -w0)} Z`;
  }

  /* Braço inteiro — pele, manga e mão — num grupo só. O grupo gira
     em volta do ombro (transform-box: view-box), então a manga sai
     junto com o braço. */
  function arms(pose, o, color) {
    const P = armPts(pose, o);
    const w = ARMW[build(o)];
    const one = (a, cls) =>
      `<g class="${cls}" style="transform-box:view-box;transform-origin:${a.s[0]}px ${a.s[1]}px">
        <path d="M${a.s[0]} ${a.s[1]} L${a.e[0]} ${a.e[1]}" stroke="${o.tone.hex}" stroke-width="${w[0]}" fill="none" stroke-linecap="round"/>
        <path d="M${a.e[0]} ${a.e[1]} L${a.w[0]} ${a.w[1]}" stroke="${o.tone.hex}" stroke-width="${w[1]}" fill="none" stroke-linecap="round"/>
        <path d="${sleevePath(a, w[0])}" fill="${color}"/>
        <circle class="ch-hand" cx="${a.w[0]}" cy="${a.w[1]}" r="${HAND_R}" fill="${o.tone.shade}"/>
      </g>`;
    return one(P.l, 'ch-arm-l') + one(P.r, 'ch-arm-r');
  }

  /* =============================================================
     PERNAS E SAPATOS
     ============================================================= */
  function legPath(side, b) {
    const L = LEG[b];
    const cx = 110 + side * L.sep;
    const top = HIP_Y - 4, knee = KNEE_Y, ankle = ANKLE_Y;
    const wt = L.thigh, wk = L.calf, wa = L.foot;
    return `M${(cx - wt).toFixed(1)} ${top}
      C${(cx - wt - .6).toFixed(1)} ${top + 34} ${(cx - wk - .6).toFixed(1)} ${knee - 34} ${(cx - wk).toFixed(1)} ${knee}
      C${(cx - wk).toFixed(1)} ${knee + 30} ${(cx - wa - .3).toFixed(1)} ${ankle - 24} ${(cx - wa).toFixed(1)} ${ankle}
      L${(cx + wa).toFixed(1)} ${ankle}
      C${(cx + wa + .3).toFixed(1)} ${ankle - 24} ${(cx + wk).toFixed(1)} ${knee + 30} ${(cx + wk).toFixed(1)} ${knee}
      C${(cx + wk + .6).toFixed(1)} ${knee - 34} ${(cx + wt + .6).toFixed(1)} ${top + 34} ${(cx + wt).toFixed(1)} ${top} Z`;
  }

  function shoePath(side, b) {
    const L = LEG[b];
    const cx = 110 + side * L.sep;
    const w = L.foot;
    const yTop = ANKLE_Y - 6, yBot = FOOT_Y;
    const a = cx - side * w, t = cx + side * w;
    return `M${a.toFixed(1)} ${yTop} L${t.toFixed(1)} ${yTop}
      Q${(t + side * 8).toFixed(1)} ${yTop} ${(t + side * 8).toFixed(1)} ${yBot - 6}
      Q${(t + side * 8).toFixed(1)} ${yBot} ${(t + side * 3).toFixed(1)} ${yBot}
      L${(a - side * 2).toFixed(1)} ${yBot}
      Q${(a - side * 4).toFixed(1)} ${yBot} ${(a - side * 4).toFixed(1)} ${yBot - 5} Z`;
  }

  function legs(b, o) {
    const skin = o.tone.hex;
    const dark = o.tone.shade;
    const shoe = '#2B1E18';
    const one = (side, fill) =>
      `<path d="${legPath(side, b)}" fill="${fill}"/>`;
    return `<g class="ch-legs">
      ${one(-1, skin)}${one(1, dark)}
      <path d="${shoePath(-1, b)}" fill="${shoe}"/>
      <path d="${shoePath(1, b)}" fill="${shade(shoe, -14)}"/>
    </g>`;
  }

  function trousers(b) {
    const B = BODY[b], L = LEG[b];
    const hw = B.waist, hipw = B.hip + 2.6;
    const top = WAIST_Y - 6, knee = KNEE_Y, hem = ANKLE_Y - 4;
    const pelvis = `M${110 - hw} ${top} L${110 + hw} ${top} L${110 + hipw} ${HIP_Y + 6} L${110 - hipw} ${HIP_Y + 6} Z`;
    const leg = (side) => {
      const cx = 110 + side * L.sep;
      const wt = L.thigh + 2.6, wk = L.calf + .6, wa = L.foot + 1.6;
      return `M${(cx - wt).toFixed(1)} ${top}
        C${(cx - wt - .6).toFixed(1)} ${top + 34} ${(cx - wk - .6).toFixed(1)} ${knee - 34} ${(cx - wk).toFixed(1)} ${knee}
        C${(cx - wk).toFixed(1)} ${knee + 30} ${(cx - wa).toFixed(1)} ${hem - 26} ${(cx - wa).toFixed(1)} ${hem}
        L${(cx + wa).toFixed(1)} ${hem}
        C${(cx + wa).toFixed(1)} ${hem - 26} ${(cx + wk).toFixed(1)} ${knee + 30} ${(cx + wk).toFixed(1)} ${knee}
        C${(cx + wk + .6).toFixed(1)} ${knee - 34} ${(cx + wt + .6).toFixed(1)} ${top + 34} ${(cx + wt).toFixed(1)} ${top} Z`;
    };
    return pelvis + leg(-1) + leg(1);
  }

  /* =============================================================
     ROUPA — silhueta montada com (y, meia largura): peito, cintura,
     quadril, barra. A gola começa na linha do ombro, então a pele
     só aparece acima dela (pescoço).
     ============================================================= */
  function garment(pts, nw, sho) {
    const [sl, sr] = sho;
    const ySho = SHO_Y + 4;        /* 94 */
    const yCol = SHO_Y;            /* 90 — linha da gola */
    const t = (yCol - NECK_Y) / (ySho - NECK_Y);
    const k = (110 - nw) + (sl - (110 - nw)) * t;
    const chest = pts[0][1];
    const armpitY = ARMPIT_Y + 4;
    let d = `M${sl} ${ySho} L${k.toFixed(1)} ${yCol}`;
    d += ` Q110 ${(yCol + 8).toFixed(1)} ${(220 - k).toFixed(1)} ${yCol}`;
    d += ` L${sr} ${ySho}`;
    d += ` Q${sr + 2} ${armpitY} ${110 + chest} ${pts[0][0]}`;
    for (let i = 1; i < pts.length; i++) d += ` L${110 + pts[i][1]} ${pts[i][0]}`;
    const last = pts[pts.length - 1];
    d += ` Q110 ${last[0] + 8} ${110 - last[1]} ${last[0]}`;
    for (let i = pts.length - 1; i >= 1; i--) d += ` L${110 - pts[i][1]} ${pts[i][0]}`;
    d += ` Q${sl - 2} ${armpitY} ${sl} ${ySho} Z`;
    return d;
  }

  function outfit(kind, o, id) {
    const c1 = o.c1, c2 = o.c2;
    const b = build(o), m = b === 'm';
    const B = BODY[b];
    const nw = NW[b], sho = SH[b];
    const collar = (op) =>
      `<path d="M${110 - nw - 1.5} 91 Q110 105 ${110 + nw + 1.5} 91 Z" fill="${o.tone.deep}" opacity="${op}"/>`;

    if (kind === 'dress' || kind === 'tunic') {
      const long = kind === 'dress';
      const hemY = long ? 234 : 210;
      const straight = m && !long;
      const hem = straight ? B.hip + 3 : B.hem;
      const pts = straight
        ? [[CHEST_Y, B.chest], [HIP_Y, B.hip], [hemY, hem]]
        : [[CHEST_Y, B.chest], [WAIST_Y, B.waist], [HIP_Y, B.hip], [hemY, hem]];
      const body = garment(pts, nw, sho);
      return `<g class="ch-body-cloth">
        <path d="${body}" fill="${c1}"/>
        <clipPath id="${id}"><path d="${body}"/></clipPath>
        <g clip-path="url(#${id})" opacity=".3">
          ${[...Array(8)].map((_, i) => `<rect x="${74 + i * 9.5}" y="${SHO_Y - 8}" width="3.4" height="${hemY - SHO_Y + 40}" fill="${c2}"/>`).join('')}
        </g>
        <path d="M${110 - hem - 2} ${hemY - 4} Q110 ${hemY + 7} ${110 + hem + 2} ${hemY - 4} L${110 + hem + 2} ${hemY - 1} Q110 ${hemY + 10} ${110 - hem - 2} ${hemY - 1}Z" fill="${c2}"/>
        ${collar(.32)}
      </g>`;
    }

    /* camisa + calça */
    const top = garment([[CHEST_Y, B.chest], [WAIST_Y, B.waist], [WAIST_Y + 16, B.waist + 1.5]], nw, sho);
    return `<g class="ch-body-cloth">
      <path d="${trousers(b)}" fill="${PANTS}"/>
      <path d="M110 ${WAIST_Y + 14} L110 ${CROTCH_Y + 6}" stroke="rgba(0,0,0,.24)" stroke-width="2"/>
      <path d="${top}" fill="${c1}"/>
      ${collar(.44)}
    </g>`;
  }

  /* ---------- acessórios ---------- */
  function accessory(kind, o) {
    const gold = safe(o.frame, '#E5A83A');
    const ex = H.cx - H.rx - 1, ex2 = H.cx + H.rx + 1;   /* orelhas */
    switch (kind) {
      case 'hoops':
        return `<g class="ch-acc">
          <g class="ch-jewel ch-jewel--l"><path d="M${ex} 56 v4" stroke="${gold}" stroke-width="2.6"/><circle cx="${ex}" cy="66" r="7.4" fill="none" stroke="${gold}" stroke-width="3.4"/></g>
          <g class="ch-jewel ch-jewel--r"><path d="M${ex2} 56 v4" stroke="${gold}" stroke-width="2.6"/><circle cx="${ex2}" cy="66" r="7.4" fill="none" stroke="${gold}" stroke-width="3.4"/></g>
        </g>`;
      case 'studs':
        return `<g class="ch-acc">
          <circle cx="${ex + 2}" cy="55" r="3.4" fill="${gold}"/>
          <circle cx="${ex2 - 2}" cy="55" r="3.4" fill="${gold}"/>
        </g>`;
      case 'glasses':
        return `<g class="ch-acc">
          <rect x="91.5" y="41.5" width="17.5" height="14" rx="7" fill="none" stroke="${gold}" stroke-width="2.8"/>
          <rect x="111" y="41.5" width="17.5" height="14" rx="7" fill="none" stroke="${gold}" stroke-width="2.8"/>
          <path d="M109 48 L111 48" stroke="${gold}" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M91.5 46 L85.5 47.5 M128.5 46 L134.5 47.5" stroke="${gold}" stroke-width="2.8" stroke-linecap="round"/>
        </g>`;
      case 'necklace':
        return `<g class="ch-acc ch-jewel"><path d="M97 97 Q110 112 123 97" stroke="${gold}" stroke-width="2.8" fill="none" stroke-linecap="round"/><circle cx="101" cy="103" r="2.6" fill="${gold}"/><circle cx="110" cy="110" r="4.2" fill="${gold}"/><circle cx="119" cy="103" r="2.6" fill="${gold}"/></g>`;
      case 'earrings':
        return `<g class="ch-acc">
          <path d="M${ex} 56 v6" stroke="${gold}" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="${ex}" cy="66" r="3.8" fill="${gold}"/>
          <path d="M${ex2} 56 v6" stroke="${gold}" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="${ex2}" cy="66" r="3.8" fill="${gold}"/>
        </g>`;
      default: return '';
    }
  }

  /* =============================================================
     PERSONAGEM
     ============================================================= */
  function character(opts) {
    if (WIP) return wipArt('0 0 220 320', 110, 160, 220, 320, 'Sendo feito ainda', '');
    const o = Object.assign({
      skin: 4, hair: 'coils', hairColor: 'black', outfit: 'dress', build: 'f',
      pose: 'wave', beard: 'no',
      c1: '#C9553A', c2: null, acc: '#E5A83A', acc2: null, wrap: '#2E9E6B', wrap2: '#F1E4CE',
      accKind: 'hoops', frame: '#E5A83A', mood: 'smile', eyes: null, mouth: null, name: ''
    }, opts || {});
    o.tone = TONES[o.skin] || TONES[4];
    o.c1 = safe(o.c1, '#C9553A');
    o.c2 = safe(o.c2, shade(o.c1, -26));
    o.acc = safe(o.acc, '#E5A83A');
    o.acc2 = safe(o.acc2, '#F1E4CE');
    o.wrap = safe(o.wrap, '#2E9E6B');
    o.wrap2 = safe(o.wrap2, '#F1E4CE');
    o.frame = safe(o.frame, '#E5A83A');

    const hairCol = HAIR[o.hairColor] || HAIR.black;
    const H_ = HAIRS[o.hair] || HAIRS.coils;
    const { back, front } = H_(hairCol, o);
    const cid = nid('cp');
    const b = build(o), m = b === 'm';
    const nw = NW[b];
    const [sl, sr] = SH[b];
    const shoe = '#2B1E18';

    /* barba: contorno da mandíbula, sempre abaixo do lábio */
    let beard = '';
    const bd = shade(o.tone.deep, -34);
    const bs = shade(o.tone.deep, -16);
    const JAW = 'M91.5 52 C92.5 66 100 74.5 110 74.5 C120 74.5 127.5 66 128.5 52'
      + ' L123 56.5 C121.5 67 117 71.5 110 71.5 C103 71.5 98.5 67 97 56.5 Z';
    const MOU = 'M104.5 59 Q110 56.6 115.5 59 Q114.5 62.4 110 62.6 Q105.5 62.4 104.5 59Z';
    if (o.beard === 'full') {
      beard = `<g class="ch-beard"><path d="${JAW}" fill="${bd}"/><path d="${MOU}" fill="${bd}"/></g>`;
    } else if (o.beard === 'stubble') {
      beard = `<g class="ch-beard" opacity=".5"><path d="${JAW}" fill="${bs}"/><path d="${MOU}" fill="${bs}"/></g>`;
    }

    const neck =
      `<rect x="${110 - nw}" y="${CHIN_Y - 9}" width="${nw * 2}" height="${NECK_Y - CHIN_Y + 16}" rx="${nw}" fill="${o.tone.hex}"/>
       <ellipse cx="110" cy="${CHIN_Y + 4}" rx="${nw * 0.82}" ry="3.6" fill="${o.tone.deep}" opacity=".22"/>`;

    const torso =
      `M${110 - nw} ${NECK_Y} Q${110 - nw - 7} ${SHO_Y - 3} ${sl} ${SHO_Y + 4}
       L${sr} ${SHO_Y + 4} Q${110 + nw + 7} ${SHO_Y - 3} ${110 + nw} ${NECK_Y} Z`;

    return `<svg class="ch" viewBox="0 0 220 320" role="img" aria-label="${o.name || 'Personagem ilustrado'}" xmlns="http://www.w3.org/2000/svg">
      <ellipse class="ch-shadow" cx="110" cy="${FOOT_Y + 9}" rx="${m ? 50 : 45}" ry="6.5" fill="rgba(0,0,0,.22)"/>
      <g class="ch-bob">
        ${back}
        ${legs(b, o)}
        ${neck}
        <path class="ch-torso" d="${torso}" fill="${o.tone.hex}"/>
        ${outfit(o.outfit, o, cid)}
        ${arms(o.pose, o, o.c1)}
        <ellipse cx="${H.cx - H.rx + 0.5}" cy="52" rx="6" ry="8" fill="${o.tone.shade}"/>
        <ellipse cx="${H.cx + H.rx - 0.5}" cy="52" rx="6" ry="8" fill="${o.tone.shade}"/>
        <ellipse cx="${H.cx}" cy="${H.cy}" rx="${H.rx}" ry="${H.ry}" fill="${o.tone.hex}"/>
        ${front}
        ${beard}
        ${face(o, o.mood)}
        ${accessory(o.accKind, o)}
      </g>
    </svg>`;
  }

  /* =============================================================
     RETRATO DE CABELO
     Mesmo rosto e mesmo desenho dos personagens, num enquadramento
     de busto: cabeça, ombros e um pouco do tronco. O tronco fica
     NA FRENTE do cabelo de trás, então o corte de baixo passa
     despercebido — igual a um retrato de verdade.
     ============================================================= */
  const PORTRAIT_VIEW = '64 -6 92 98';

  function hairSample(name, skin = 3, color = 'black') {
    if (WIP) return wipArt(PORTRAIT_VIEW, 110, 43, 92, 98, 'Em breve', '', 'hair-swatch');
    const H_ = HAIRS[name] || HAIRS.coils;
    const c = HAIR[color] || HAIR.black;
    const t = TONES[skin] || TONES[3];
    const o = { acc: '#E5A83A', acc2: '#F1E4CE', wrap: '#2E9E6B', wrap2: '#F1E4CE',
                build: 'f', tone: t, mood: 'smile' };
    const { back, front } = H_(c, o);
    const nw = NW.f, [sl, sr] = SH.f;
    const torso =
      `M${110 - nw} ${NECK_Y} Q${110 - nw - 7} ${SHO_Y - 3} ${sl} ${SHO_Y + 4}
       L${sr} ${SHO_Y + 4} Q${110 + nw + 7} ${SHO_Y - 3} ${110 + nw} ${NECK_Y} Z`;
    return `<svg class="hair-swatch" viewBox="${PORTRAIT_VIEW}" role="img"
      aria-label="${name}" xmlns="http://www.w3.org/2000/svg">
      ${back}
      <ellipse cx="${H.cx}" cy="${H.cy}" rx="${H.rx}" ry="${H.ry}" fill="${t.hex}"/>
      <rect x="${110 - nw}" y="${CHIN_Y - 9}" width="${nw * 2}" height="${NECK_Y - CHIN_Y + 16}" rx="${nw}" fill="${t.hex}"/>
      <path d="${torso}" fill="${t.shade}"/>
      ${front}
      ${face(o, 'smile')}
    </svg>`;
  }

/* =============================================================
     MOTIVOS TÊXTEIS — geometrias inspiradas em tecidos africanos
     (kente, bogolan, adire, kuba, ndop, aso oke). Interpretações
     gráficas, não reproduções de peças específicas.
     ============================================================= */
  const MOTIFS = {
    /* tira de kente: urdume cruzado pela trama */
    kente: `<g fill="none" stroke="currentColor" stroke-width="6">
        <path d="M13 2v60M32 2v60M51 2v60"/></g>
      <g fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="15 9">
        <path d="M2 16h60M2 48h60"/></g>`,
    /* bogolan: losango com losango miúdo dentro */
    bogolan: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
        <path d="M32 4 L60 32 L32 60 L4 32 Z"/>
        <path d="M32 20 L46 32 L32 44 L18 32 Z"/></g>
      <circle cx="32" cy="32" r="4.5" fill="currentColor"/>`,
    /* adire: anéis de tinta resistida e marcas de canto */
    adire: `<g fill="none" stroke="currentColor" stroke-width="5">
        <circle cx="32" cy="32" r="11"/><circle cx="32" cy="32" r="24"/></g>
      <g fill="currentColor">
        <circle cx="6" cy="6" r="3.6"/><circle cx="58" cy="6" r="3.6"/>
        <circle cx="6" cy="58" r="3.6"/><circle cx="58" cy="58" r="3.6"/></g>`,
    /* kuba: ziguezague de fibra trançada */
    kuba: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 44 L18 16 L32 44 L46 16 L60 44"/><path d="M4 58h56"/></g>`,
    /* ndop: bloco de índigo com marcas */
    ndop: `<g fill="none" stroke="currentColor" stroke-width="5">
        <rect x="6" y="6" width="52" height="52" rx="11"/></g>
      <g fill="currentColor">
        <circle cx="20" cy="20" r="3.6"/><circle cx="44" cy="20" r="3.6"/>
        <circle cx="20" cy="44" r="3.6"/><circle cx="44" cy="44" r="3.6"/>
        <path d="M32 27 L37 32 L32 37 L27 32 Z"/></g>`,
    /* aso oke: faixas de tecelagem com ziguezague */
    aso: `<g fill="currentColor">
        <rect x="6" y="7" width="52" height="7"/><rect x="6" y="50" width="52" height="7"/></g>
      <g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
        <path d="M6 40 L17 24 L28 40 L39 24 L50 40 L58 30"/></g>`,
    /* trama de pente */
    comb: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
        <path d="M12 8v48M32 8v48M52 8v48"/>
        <path d="M12 20h20M32 34h20M12 48h20"/></g>`,
    /* losango duplo */
    lozenge: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
        <path d="M32 6 L58 32 L32 58 L6 32 Z"/></g>
      <path d="M32 20 L44 32 L32 44 L20 32 Z" fill="currentColor"/>`
  };
  function motif(name, cls = '') {
    return `<svg class="motif ${cls}" viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${MOTIFS[name] || MOTIFS.kente}</svg>`;
  }

  /* =============================================================
     GLIFOS DE TEXTURA CAPILAR
     ============================================================= */
  const TEXTURES = {
    crespo: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M8 40 q-4-10 4-14 q8-4 12 2 q4 6-2 10 q-6 4-9-1"/>
      <path d="M34 26 q10-6 16 3 q6 9-3 15"/></g>
      <g fill="currentColor"><circle cx="10" cy="20" r="3"/><circle cx="26" cy="12" r="3.4"/><circle cx="44" cy="14" r="3"/></g>`,
    cacheado: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M6 44 q0-14 10-16 q10-2 12 8 q2 10-8 12"/>
      <path d="M34 30 q12-2 14 8 q2 10-8 12"/></g>
      <g fill="currentColor"><circle cx="14" cy="14" r="4"/><circle cx="32" cy="12" r="4"/><circle cx="50" cy="18" r="3.4"/></g>`,
    ondulado: `<g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round">
      <path d="M6 40 q9-16 18 0 q9 16 18 0 q7-11 14-4"/>
      <path d="M6 54 q9-12 18 0"/></g>`,
    tranca: `<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">
      <path d="M12 8 q9 8 0 16 q-9 8 0 16"/><path d="M30 8 q9 8 0 16 q-9 8 0 16"/><path d="M48 8 q9 8 0 16 q-9 8 0 16"/></g>
      <g fill="currentColor"><circle cx="12" cy="52" r="3"/><circle cx="30" cy="52" r="3"/><circle cx="48" cy="52" r="3"/></g>`,
    loc: `<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <path d="M12 6 v42 M26 4 v46 M40 4 v46 M54 6 v42"/></g>
      <g fill="currentColor"><circle cx="12" cy="52" r="3.4"/><circle cx="26" cy="54" r="3.4"/><circle cx="40" cy="54" r="3.4"/><circle cx="54" cy="52" r="3.4"/></g>`,
    blackpower: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <circle cx="32" cy="26" r="16"/></g>
      <g fill="currentColor"><circle cx="32" cy="4" r="4"/><circle cx="6" cy="26" r="4"/><circle cx="58" cy="26" r="4"/>
      <circle cx="14" cy="8" r="3.4"/><circle cx="50" cy="8" r="3.4"/><circle cx="32" cy="56" r="4"/>
      <circle cx="12" cy="44" r="3.4"/><circle cx="52" cy="44" r="3.4"/></g>`,
    boxer: `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M8 18 q24-12 48 0 M6 32 q26-12 52 0 M8 46 q24-12 48 0"/></g>`
  };
  function texture(name) {
    return `<svg class="tex" viewBox="-2 -2 68 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${TEXTURES[name] || TEXTURES.crespo}</svg>`;
  }

  /* =============================================================
     DIAGRAMAS
     ============================================================= */
  /* proporção populacional — barra empilhada */
  function proporcao(seg) {
    const total = seg.reduce((a, s) => a + s.v, 0);
    let x = 0;
    const bars = seg.map((s, i) => {
      const w = (s.v / total) * 100;
      const el = `<g class="pf-seg" style="--d:${i * .12}s">
        <rect x="${x}" y="0" width="${w}" height="34" fill="${s.c}"/>
      </g>`;
      x += w;
      return el;
    }).join('');
    return `<svg class="chart" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  }

  /* =============================================================
     MONTAGEM
     ============================================================= */
  function melanina() {
    const seeds = [
      [40, 30, 16, .9], [78, 22, 11, .7], [112, 40, 19, .95], [58, 62, 13, .6],
      [140, 70, 14, .75], [96, 84, 9, .45], [30, 84, 10, .5], [164, 34, 8, .4],
      [124, 12, 7, .35], [70, 108, 8, .4], [150, 106, 10, .5], [18, 56, 7, .35]
    ];
    return `<svg class="art" viewBox="0 0 190 130" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${seeds.map(([x, y, r, o], i) => `<circle class="mf-gr" cx="${x}" cy="${y}" r="${r}" fill="currentColor" opacity="${o}" style="--d:${i * 0.09}s"/>`).join('')}
    </svg>`;
  }

  /* =============================================================
     RITMO DE CADA PERSONAGEM
     Sorteio estavel a partir do nome: o mesmo personagem sempre anima
     igual, mas dois vizinhos nunca entram em fase. E como o sorteio
     entra na duracao, o conjunto nao repete a cada ciclo.
     ============================================================= */
  function hashOf(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function rhythm(name) {
    const seed = hashOf(name);
    /* sorteia em bits nao contiguos: o mesmo>> 5 colidia entre
      duracoes vizinhas e deixava personagens com o mesmo tempo */
    const rnd = (n) => (((seed >>> ((n * 7) % 25)) ^ (seed >>> ((n * 11 + 3) % 25))) & 255) / 255;
    const dur = (n, a, b) => (a + (b - a) * rnd(n)).toFixed(2) + 's';
    const ph = (n, spread) => (-spread * rnd(n + 3)).toFixed(2) + 's';
    const st = {};
    st['--d-bob'] = dur(1, 3.8, 6.6);
    st['--d-arm'] = dur(2, 2.8, 5.2);
    st['--d-arm2'] = dur(3, 3.6, 6.4);
    st['--d-hair'] = dur(4, 4.6, 8.4);
    st['--d-eye'] = dur(5, 3.4, 8.2);
    st['--d-mouth'] = dur(6, 5.2, 9.6);
    st['--d-brow'] = dur(7, 6.4, 11.2);
    st['--d-shadow'] = st['--d-bob'];
    st['--d-float'] = dur(8, 6.2, 9.4);
    st['--d-jewel'] = dur(9, 3.2, 5.6);
    st['--p-bob'] = ph(1, 5.5);
    st['--p-arm'] = ph(2, 4.2);
    st['--p-arm2'] = ph(3, 5);
    st['--p-hair'] = ph(4, 6.5);
    st['--p-eye'] = ph(5, 7);
    st['--p-mouth'] = ph(6, 8);
    st['--p-brow'] = ph(7, 9);
    st['--p-shadow'] = st['--p-bob'];
    st['--p-float'] = ph(8, 7.5);
    st['--p-jewel'] = ph(9, 3.4);
    st['--p-jewel-r'] = ph(10, 3.4);
    return st;
  }

  /* =============================================================
     MONTAGEM
     ============================================================= */
  function mount(root = document) {
    root.querySelectorAll('[data-char]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const d = el.dataset;
      el.innerHTML = character({
        skin: +(d.skin || 4),
        hair: d.hair || 'coils',
        hairColor: d.haircolor || 'black',
        outfit: d.outfit || 'dress',
        build: d.build || 'f',
        pose: d.pose || 'wave',
        beard: d.beard || 'no',
        c1: d.c1, c2: d.c2,
        acc: d.acc, acc2: d.acc2,
        wrap: d.wrap, wrap2: d.wrap2,
        accKind: d.acc || 'hoops',
        frame: d.frame,
        mood: d.mood || 'smile',
        eyes: d.eyes, mouth: d.mouth,
        name: d.name || 'Personagem'
      });
      el.style.setProperty('--tilt', d.tilt || '0deg');
      el.style.setProperty('--lag', d.lag || '0s');
      /* a semente vem do desenho inteiro, nao so do nome: assim dois
         personagens com o mesmo nome (tres "mulher de cocos") nao entram
         em fase, e o conjunto nunca repete igual a cada ciclo */
      const r = rhythm(`${d.name || 'p'}|${d.hair || ''}|${d.pose || ''}|${d.c1 || ''}|${d.build || 'f'}`);
      Object.keys(r).forEach((k) => el.style.setProperty(k, r[k]));
      /* o olho de cada lado pisca em separado: nada de sincronia */
      const seed = `${d.name || 'p'}${d.hair || ''}${d.pose || ''}`;
      el.querySelectorAll('.ch-eye:not(.ch-eye--shut)').forEach((eyeEl, k) => {
        if (!k) return;
        eyeEl.style.animationDelay = (-((hashOf(seed + k) % 800) / 100)).toFixed(2) + 's';
        eyeEl.style.animationDuration = (3.4 + ((hashOf(seed + 'x' + k) % 460) / 100)).toFixed(2) + 's';
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
      el.innerHTML = hairSample(el.dataset.hairswatch, +(el.dataset.swatchskin || 3), el.dataset.swatchcolor || 'black');
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
  }

  return {
    TONES, TONE_ORDER, HAIR, character, motif, texture, melanina,
    proporcao, mount, shade, hairSample
  };
})();

if (typeof window !== 'undefined') {
  window.Art = Art;
  document.addEventListener('DOMContentLoaded', () => Art.mount());
}
