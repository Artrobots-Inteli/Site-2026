import type { ReactNode, SVGProps } from 'react';

// Inline stroke geometry keeps the published icon dimensions without a runtime
// DOM replacement or a CDN script. React owns the SVG and its accessibility.
const shapes = {
  'arrow-up-right': <><path d="M7 17 17 7M7 7h10v10" /></>,
  'arrow-down': <><path d="M12 5v14M5 12l7 7 7-7" /></>,
  'arrow-left': <><path d="M19 12H5m7-7-7 7 7 7" /></>,
  'arrow-right': <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'message-circle': <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />,
  cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 5h3M1 9h3m-3 5h3" /></>,
  zap: <path d="m13 2-10 12h9l-1 8 10-12h-9l1-8Z" />,
  tool: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0L21.47 5.53a6 6 0 0 1-7.94 7.94l-6.91 6.91a3 3 0 0 1-4.24-4.24l6.91-6.91a6 6 0 0 1 7.94-7.94L14.7 6.3Z" />,
  'share-2': <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /><circle cx="9" cy="7" r="4" /></>,
  user: <><path d="M20 21v-2a7 7 0 0 0-7-7h-2a7 7 0 0 0-7 7v2" /><circle cx="12" cy="5" r="4" /></>,
  'help-circle': <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  'map-pin': <><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" /></>,
  x: <path d="m18 6-12 12M6 6l12 12" />,
  check: <path d="m20 6-11 11-5-5" />,
  'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" /></>,
  award: <><circle cx="12" cy="8" r="7" /><path d="m8.21 13.89-1.21 9.11 5-3 5 3-1.21-9.12" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8m8 4H8M8 9h2" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
  shield: <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />,
  'dollar-sign': <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  'trending-up': <path d="m23 6-9.5 9.5-5-5L1 18M17 6h6v6" />,
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z" />,
  navigation: <path d="m3 11 19-9-9 20-2-9-8-2Z" />,
  'external-link': <><path d="M15 3h6v6m0-6L10 14m8-1v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7 .54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof shapes;

export function Icon({ name, className = '', ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  const safeName = Object.prototype.hasOwnProperty.call(shapes, name) ? name as IconName : 'users';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={`feather feather-${name} ${className}`} {...props}>
      {shapes[safeName]}
    </svg>
  );
}
