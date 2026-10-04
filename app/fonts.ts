import {Knewave, Permanent_Marker, Space_Grotesk} from 'next/font/google';

export const displayFont = Knewave({weight: '400', subsets: ['latin'], variable: '--font-knewave', display: 'swap'});
export const markerFont = Permanent_Marker({weight: '400', subsets: ['latin'], variable: '--font-marker', display: 'swap'});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${markerFont.variable} ${sansFont.variable}`;
