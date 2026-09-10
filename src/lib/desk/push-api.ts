import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  const { getVapidPublicKey } = await import("./push.server");
  return { publicKey: await getVapidPublicKey() };
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { endpoint: string; keys: { p256dh: string; auth: string } }) => input)
  .handler(async ({ context, data }) => {
    const { saveSubscription } = await import("./push.server");
    return saveSubscription({ ...data, userId: context.userId });
  });

export const dropPushSubscription = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { endpoint: string }) => input)
  .handler(async ({ context, data }) => {
    const { dropSubscription } = await import("./push.server");
    await dropSubscription(data.endpoint, context.userId);
    return { ok: true as const };
  });
