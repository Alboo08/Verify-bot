export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Kein OAuth2-Code angegeben.', { status: 400 });
  }

  const CLIENT_ID = env.CLIENT_ID;
  const CLIENT_SECRET = env.CLIENT_SECRET;
  const REDIRECT_URI = `${url.origin}/callback`;

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    }).then(r => r.json());

    if (!tokenResponse.access_token) {
      return new Response('Fehler beim Abrufen des Discord Tokens.', { status: 400 });
    }

    return new Response('Du wurdest erfolgreich verifiziert! Du kannst dieses Fenster jetzt schließen.', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (err) {
    return new Response('Interner Fehler bei der Verifizierung: ' + err.message, { status: 500 });
  }
}
