/* =============================================================
   CONFLUÊNCIAS — arte original em SVG
   Símbolos, glifos de textura e diagramas desenhados para esta
   apresentação. Nenhum recurso externo.

   Nesta versão não há personagens: a galeria de tipos capilares
   usa fotografias reais (assets/img) em vez de retrato desenhado.
   ============================================================= */
const Art = (function () {
  'use strict';

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
   Usados como legenda simbólica; a foto é a imagem principal.
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

  /* melanina: grânulos no citoplasma */
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
   MONTAGEM
   ============================================================= */
  function mount(root = document) {
    root.querySelectorAll('[data-motif]').forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      el.innerHTML = motif(el.dataset.motif);
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

  return { motif, texture, melanina, proporcao, mount };
})();

if (typeof window !== 'undefined') {
  window.Art = Art;
  document.addEventListener('DOMContentLoaded', () => Art.mount());
}
