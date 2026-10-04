import {Knewave, Permanent_Marker, Sedgwick_Ave_Display, Space_Grotesk} from 'next/font/google';

export const displayFont = Knewave({weight: '400', subsets: ['latin'], variable: '--font-knewave', display: 'swap'});
export const markerFont = Permanent_Marker({weight: '400', subsets: ['latin'], variable: '--font-marker', display: 'swap'});
export const tagStyleFont = Sedgwick_Ave_Display({weight: '400', subsets: ['latin'], variable: '--font-tagstyle', display: 'swap'});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${markerFont.variable} ${tagStyleFont.variable} ${sansFont.variable}`;
