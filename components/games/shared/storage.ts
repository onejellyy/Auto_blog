const PREFIX = "onejelly.games.best";

function key(id: string) {
  return `${PREFIX}.${id}`;
}

export function loadBestNumber(id: string, fallback = 0): number {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key(id));
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function saveBestNumber(id: string, value: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(id), String(value));
}
