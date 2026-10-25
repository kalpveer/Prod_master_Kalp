import { Suspense, lazy } from 'react';
import { AuthProvider } from '../auth/AuthProvider';
import AuthGate from '../auth/AuthGate';
import { modules, type AppModule } from './registry';

function Splash() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-label="Loading" />
    </div>
  );
}

// Created once at load (not per render) so a module keeps its state across re-renders.
const pages = Object.fromEntries(modules.map(m => [m.path, lazy(m.load)]));

// Mounts a registered module with auth handled in one place, so modules never deal with sign-in themselves.
export default function ModuleHost({ module }: { module: AppModule }) {
  const Page = pages[module.path];
  const page = (
    <Suspense fallback={<Splash />}>
      <Page />
    </Suspense>
  );

  return (
    <AuthProvider>
      {module.requiresAuth ? <AuthGate title={module.title}>{page}</AuthGate> : page}
    </AuthProvider>
  );
}
