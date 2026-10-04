type Listener = () => void;

let active = 'top';
const listeners = new Set<Listener>();

export function getActiveSection(): string {
  return active;
}

export function setActiveSection(id: string): void {
  if (id === active) return;
  active = id;
  for (const listener of listeners) listener();
}

export function subscribeActiveSection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
