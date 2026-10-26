/** Shared venture context between /idea and /grants. Survives a tab switch on the same browser. */
const KEY = 'productica.workspace';

export interface Workspace {
  ideaId?: string;
  grantRunId?: string;
  venture?: string;
  stage?: string;
}

export function readWorkspace(): Workspace {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Workspace : {};
  } catch {
    return {};
  }
}

export function writeWorkspace(patch: Workspace) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...readWorkspace(), ...patch }));
  } catch {
    /* private mode */
  }
}
