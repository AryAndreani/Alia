/*
export const C = {
  bg: '#07070f',
  surface: '#11111e',
  surfaceHigh: '#191928',
  surfaceMid: '#14142200',
  border: 'rgba(255,255,255,0.07)',
  borderHigh: 'rgba(255,255,255,0.13)',
  textPrimary: '#f0f0ff',
  textSecondary: 'rgba(240,240,255,0.55)',
  textMuted: 'rgba(240,240,255,0.28)',
  accent: '#7c6ef7',
  accentLight: '#a390ff',
  accentGlow: 'rgba(124,110,247,0.4)',
  accentSoft: 'rgba(124,110,247,0.12)',
  gold: '#f5c842',
  goldGlow: 'rgba(245,200,66,0.3)',
  panic: '#0f0620',
  panicAccent: '#b06ef7',
  starCore: '#fff8e8',
  starGlow: 'rgba(200,180,255,0.6)',
}

// Pattern di polvere di stelle — lo stesso usato nello sfondo della home,
// riutilizzato anche per riempire i margini laterali dell'app su schermi
// più larghi di un telefono (vedi App.jsx).
export const dustBackground = {
  backgroundImage: `
    radial-gradient(1px 1px at 3% 6%, rgba(200,195,255,0.55), transparent),
    radial-gradient(1px 1px at 9% 34%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 15% 60%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 21% 18%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 27% 82%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 33% 44%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 39% 8%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 45% 68%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 51% 26%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 57% 90%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 63% 12%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 69% 52%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 75% 74%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 81% 30%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 87% 86%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 93% 4%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 97% 56%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 6% 96%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 18% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 44% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 60% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 78% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 90% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 12% 46%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 36% 32%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 54% 76%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 72% 20%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 84% 64%, rgba(200,195,255,0.25), transparent)
  `,
  backgroundSize: '150px 150px',
  backgroundRepeat: 'repeat',
}

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    height: 100%;
    overscroll-behavior: none;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background: ${C.bg};
    color: ${C.textPrimary};
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  input, textarea, button { font-family: inherit; }
  button { cursor: pointer; border: none; background: none; color: inherit; }
  input, textarea { outline: none; color: ${C.textPrimary}; }

  @keyframes starBorn {
    0%   { opacity: 0; transform: scale(0) }
    60%  { opacity: 1; transform: scale(1.4) }
    100% { opacity: 1; transform: scale(1) }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1 }
    50% { opacity: 0.6 }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px) }
    to   { opacity: 1; transform: translateY(0) }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center }
    100% { background-position:  200% center }
  }
`
*/

export const C = {
  bg: '#07070f',
  surface: '#11111e',
  surfaceHigh: '#191928',
  surfaceMid: '#14142200',
  border: 'rgba(255,255,255,0.07)',
  borderHigh: 'rgba(255,255,255,0.13)',
  textPrimary: '#f0f0ff',
  textSecondary: 'rgba(240,240,255,0.55)',
  textMuted: 'rgba(240,240,255,0.28)',
  accent: '#4F9DFF',
  accentRGB: '79,157,255',
  accentLight: '#8CC4FF',
  accentGlow: 'rgba(79,157,255,0.4)',
  accentSoft: 'rgba(79,157,255,0.12)',
  gold: '#f5c842',
  goldGlow: 'rgba(245,200,66,0.3)',
  panic: '#0f0620',
  panicAccent: '#b06ef7',
  starCore: '#fff8e8',
  starGlow: 'rgba(200,180,255,0.6)',
}

// Pattern di polvere di stelle — lo stesso usato nello sfondo della home,
// riutilizzato anche per riempire i margini laterali dell'app su schermi
// più larghi di un telefono (vedi App.jsx).
export const dustBackground = {
  backgroundImage: `
    radial-gradient(1px 1px at 3% 6%, rgba(200,195,255,0.55), transparent),
    radial-gradient(1px 1px at 9% 34%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 15% 60%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 21% 18%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 27% 82%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 33% 44%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 39% 8%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 45% 68%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 51% 26%, rgba(200,195,255,0.45), transparent),
    radial-gradient(1px 1px at 57% 90%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 63% 12%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 69% 52%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 75% 74%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 81% 30%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 87% 86%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 93% 4%, rgba(200,195,255,0.4), transparent),
    radial-gradient(1px 1px at 97% 56%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 6% 96%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 18% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 44% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 60% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 78% 96%, rgba(200,195,255,0.35), transparent),
    radial-gradient(1px 1px at 90% 98%, rgba(200,195,255,0.3), transparent),
    radial-gradient(1px 1px at 12% 46%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 36% 32%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 54% 76%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 72% 20%, rgba(200,195,255,0.25), transparent),
    radial-gradient(1px 1px at 84% 64%, rgba(200,195,255,0.25), transparent)
  `,
  backgroundSize: '150px 150px',
  backgroundRepeat: 'repeat',
}

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    height: 100%;
    overscroll-behavior: none;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background: ${C.bg};
    color: ${C.textPrimary};
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  input, textarea, button { font-family: inherit; }
  button { cursor: pointer; border: none; background: none; color: inherit; }
  input, textarea { outline: none; color: ${C.textPrimary}; }

  @keyframes starBorn {
    0%   { opacity: 0; transform: scale(0) }
    60%  { opacity: 1; transform: scale(1.4) }
    100% { opacity: 1; transform: scale(1) }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1 }
    50% { opacity: 0.6 }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px) }
    to   { opacity: 1; transform: translateY(0) }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center }
    100% { background-position:  200% center }
  }
`