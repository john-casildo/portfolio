type Variant = 'primary' | 'secondary';

const variants: Record<Variant, string> = {
  primary: 'bg-red text-paper',
  secondary: 'bg-paper text-ink',
};

export function buttonClass(variant: Variant = 'primary'): string {
  return `btn-press inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-md border-[3px] border-ink px-5 py-3 font-bold uppercase tracking-wide ${variants[variant]}`;
}
