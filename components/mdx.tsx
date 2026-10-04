import type {MDXComponents} from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-10 font-display text-4xl" {...props} />,
  p: (props) => <p className="mt-4 text-lg leading-relaxed" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-lg" {...props} />,
  a: (props) => <a className="text-ink underline" {...props} />,
};
