async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.error) message = errBody.error;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

export function generatePlan(answers) {
  return postJSON("/api/generate-plan", { answers });
}

export function generateActionPlan(opportunity, answers) {
  return postJSON("/api/generate-action-plan", { opportunity, answers });
}
