function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export const site = {
  name: 'John Casildo',
  url: siteUrl(),
  email: 'johnbsns@outlook.com',
  whatsapp: '50661090625',
  github: 'https://github.com/john-casildo',
  stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'FastAPI', 'Docker', 'SwiftUI', 'Jetpack Compose'],
} as const;

/** True for a real international number (digits only, 8–15 long, not the all-zero placeholder). */
export function hasWhatsApp(number: string = site.whatsapp): boolean {
  return /^\d{8,15}$/.test(number) && !/^0+$/.test(number);
}

export function whatsappUrl(text: string, number: string = site.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
