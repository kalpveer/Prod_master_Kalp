import type { ComponentType } from 'react';

// Every app-style page (anything beyond the marketing site) is a module registered here.
// To add one: create src/modules/<name>/<Name>Module.tsx (default export a component),
// then add a line below. See docs/MODULES.md.
export interface AppModule {
  /** Route prefix, e.g. '/idea' also serves '/idea/anything'. */
  path: string;
  /** Shown in the header of the sign-in screen. */
  title: string;
  /** Signed-out visitors see the email sign-in instead of the page. */
  requiresAuth: boolean;
  /** Lazy so the marketing site never downloads module code (or Supabase). */
  load: () => Promise<{ default: ComponentType }>;
}

export const modules: AppModule[] = [
  {
    path: '/idea',
    title: 'Idea Validation',
    requiresAuth: true,
    load: () => import('./idea/IdeaModule'),
  },
];

export const findModule = (pathname: string) =>
  modules.find(m => pathname === m.path || pathname.startsWith(`${m.path}/`));
