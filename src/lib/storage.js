const STORAGE_KEY = "income-button-ai:state";

export async function getState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("storage: read failed", e);
    return null;
  }
}

export async function setState(patch) {
  try {
    const current = (await getState()) || {};
    const next = { ...current, ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    console.error("storage: write failed", e);
    return null;
  }
}

export async function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("storage: clear failed", e);
  }
}
