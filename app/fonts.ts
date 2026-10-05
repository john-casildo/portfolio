import {Knewave, Permanent_Marker, Sedgwick_Ave_Display, Space_Grotesk} from 'next/font/google';

// Display + marker fonts use `block`: a brief invisible moment instead of flashing a plain fallback
// (the nav and ticker visibly "re-loaded" when the font swapped in).
export const displayFont = Knewave({weight: '400', subsets: ['latin'], variable: '--font-knewave', display: 'block'});
export const markerFont = Permanent_Marker({weight: '400', subsets: ['latin'], variable: '--font-marker', display: 'block'});
// Only used by decorative graffiti tags in the xl margins; don't compete with the fonts above.
export const tagStyleFont = Sedgwick_Ave_Display({weight: '400', subsets: ['latin'], variable: '--font-tagstyle', display: 'swap', preload: false});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${markerFont.variable} ${tagStyleFont.variable} ${sansFont.variable}`;
