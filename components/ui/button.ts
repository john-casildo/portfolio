type Variant = 'primary' | 'secondary';

const variants: Record<Variant, string> = {
  primary: 'bg-spray text-ink',
  secondary: 'bg-paper text-ink',
};

export function buttonClass(variant: Variant = 'primary'): string {
  return `btn-press inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-lg border-2 border-ink px-5 py-3 font-bold ${variants[variant]}`;
}
