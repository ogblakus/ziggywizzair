/* QUORUM desk — notification worker. Does not intercept fetches. */
self.addEventListener("push", (event) => {
  let payload = { title: "QUORUM", body: "Desk fill", tag: "quorum-fill" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    try {
      if (event.data) payload.body = event.data.text();
    } catch {
      /* empty push */
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "QUORUM", {
      body: payload.body || "Desk fill",
      tag: payload.tag || "quorum-fill",
      icon: "/__grok/icon-180.png",
      badge: "/__grok/icon-180.png",
      data: { url: "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
