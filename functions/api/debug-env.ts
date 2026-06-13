interface Env {
  ADMIN_SECRET: string;
  BOOKINGS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const hasSecret = !!context.env.ADMIN_SECRET;
  const secretLength = context.env.ADMIN_SECRET?.length ?? 0;
  const secretPrefix = context.env.ADMIN_SECRET?.slice(0, 4) ?? "N/A";
  const kvBound = !!context.env.BOOKINGS;

  return new Response(
    JSON.stringify({
      hasSecret,
      secretLength,
      secretPrefix,
      kvBound,
      envKeys: Object.keys(context.env).filter(
        (k) => !["BOOKINGS"].includes(k)
      ),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
