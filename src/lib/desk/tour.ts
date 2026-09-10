const KEY = (id: string) => `zw-tour-v1:${id}`;

let forceOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function isTourDone(userId: string): boolean {
  try {
    return localStorage.getItem(KEY(userId)) === "1";
  } catch {
    return false;
  }
}

export function markTourDone(userId: string) {
  try {
    localStorage.setItem(KEY(userId), "1");
  } catch {
    /* private mode */
  }
  forceOpen = false;
  emit();
}

export function requestTour() {
  forceOpen = true;
  emit();
}

export function dismissTour(userId: string) {
  forceOpen = false;
  markTourDone(userId);
}

export function shouldShowTour(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return forceOpen || !isTourDone(userId);
}

export function subscribeTour(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function tourSnapshot(userId: string | null | undefined) {
  return shouldShowTour(userId);
}
