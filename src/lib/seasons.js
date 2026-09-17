// Il cielo segue il calendario reale — dettagli quasi impercettibili che
// rendono l'app viva nel tempo, senza bisogno di alcuna azione dell'utente.

export function getSeason(date = new Date()) {
  const month = date.getMonth() // 0 = gennaio
  if (month >= 2 && month <= 4) return 'spring'   // mar-mag
  if (month >= 5 && month <= 7) return 'summer'   // giu-ago
  if (month >= 8 && month <= 10) return 'autumn'  // set-nov
  return 'winter'                                 // dic-feb
}

// dustRGB: tripletta "r,g,b" usata per la polvere di stelle (StarCanvas,
// FallingStars). skyGradient: sfumatura di sfondo dietro alla costellazione.
export const SEASON_PALETTES = {
  spring: {
    label: 'Primavera',
    dustRGB: '235,190,220',
    skyGradient: 'radial-gradient(ellipse at 50% 20%, rgba(255,200,225,0.10) 0%, #06060e 65%)',
  },
  summer: {
    label: 'Estate',
    dustRGB: '190,210,255',
    skyGradient: 'radial-gradient(ellipse at 50% 20%, rgba(140,170,255,0.14) 0%, #06060e 60%)',
  },
  autumn: {
    label: 'Autunno',
    dustRGB: '235,200,150',
    skyGradient: 'radial-gradient(ellipse at 50% 20%, rgba(230,170,100,0.10) 0%, #06060e 65%)',
  },
  winter: {
    label: 'Inverno',
    dustRGB: '210,225,255',
    skyGradient: 'radial-gradient(ellipse at 50% 15%, rgba(180,200,255,0.08) 0%, #06060e 70%)',
  },
}

export function getSeasonPalette(date = new Date()) {
  return SEASON_PALETTES[getSeason(date)]
}