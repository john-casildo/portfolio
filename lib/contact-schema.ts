import {z} from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[^\r\n]*$/),
  email: z.string().trim().max(254).pipe(z.email()),
  message: z.string().trim().min(10).max(2000),
  company: z.string().max(200).optional().default(''),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = 'name' | 'email' | 'message';

const FIELDS: ContactField[] = ['name', 'email', 'message'];

export function fieldErrors(error: z.ZodError): ContactField[] {
  const bad = new Set(error.issues.map((issue) => issue.path[0]));
  return FIELDS.filter((f) => bad.has(f));
}
