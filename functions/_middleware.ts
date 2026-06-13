export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === "speaker-rental.pages.dev") {
    return Response.redirect(`https://lejhojtaler.dk${url.pathname}${url.search}`, 301);
  }
  return context.next();
};
