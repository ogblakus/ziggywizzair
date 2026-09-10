/* ZiggyWizzAir desk — notification worker. Does not intercept fetches. */
function safeUrl(raw) {
  if (typeof raw !== "string" || !raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw, self.location.origin);
    if (u.origin === self.location.origin) return `${u.pathname}${u.search}${u.hash}` || "/";
  } catch {
    /* ignore */
  }
  return "/";
}

self.addEventListener("push", (event) => {
  let payload = { title: "ZiggyWizzAir", body: "Desk update", tag: "zw-desk", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    try {
      if (event.data) payload.body = event.data.text();
    } catch {
      /* empty push */
    }
  }
  const title = typeof payload.title === "string" ? payload.title.slice(0, 80) : "ZiggyWizzAir";
  const body = typeof payload.body === "string" ? payload.body.slice(0, 180) : "Desk update";
  event.waitUntil(
    self.registration.showNotification(title || "ZiggyWizzAir", {
      body: body || "Desk update",
      tag: typeof payload.tag === "string" ? payload.tag.slice(0, 80) : "zw-desk",
      icon: "/__grok/icon-180.png",
      badge: "/__grok/icon-180.png",
      data: { url: safeUrl(payload.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
