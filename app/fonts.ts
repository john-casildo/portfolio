import {Rubik_Wet_Paint, Sedgwick_Ave, Space_Grotesk} from 'next/font/google';

export const displayFont = Rubik_Wet_Paint({weight: '400', subsets: ['latin'], variable: '--font-wet-paint', display: 'swap'});
export const tagFont = Sedgwick_Ave({weight: '400', subsets: ['latin'], variable: '--font-sedgwick', display: 'swap'});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${tagFont.variable} ${sansFont.variable}`;
