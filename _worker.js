export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. OAuth2 Callback-Route
    if (path === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Kein OAuth2-Code angegeben.', { status: 400 });
      }

      const CLIENT_ID = env.CLIENT_ID;
      const CLIENT_SECRET = env.CLIENT_SECRET;
      const REDIRECT_URI = env.REDIRECT_URI || `${url.origin}/callback`;

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

    // 2. Die Website (HTML) für die Startseite
    const html = `<!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Verifizierung</title>
        <style>
            body { background-color: #313338; color: #dbdee1; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background-color: #2b2d31; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-align: center; max-width: 400px; width: 100%; }
            h1 { color: #ffffff; font-size: 24px; margin-bottom: 10px; }
            p { color: #949ba4; font-size: 14px; margin-bottom: 30px; }
            .btn { background-color: #5865F2; color: white; border: none; padding: 12px 20px; font-size: 16px; font-weight: 600; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; transition: background-color 0.2s; width: 100%; box-sizing: border-box; }
            .btn:hover { background-color: #4752C4; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Server Verifizierung</h1>
            <p>Klicke unten, um dich mit deinem Discord-Account zu verifizieren und Zugriff auf den Server zu erhalten.</p>
            <a id="verify-btn" href="#" class="btn">Mit Discord verifizieren</a>
        </div>
        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const guildId = urlParams.get('guild');
            const CLIENT_ID = '${env.CLIENT_ID || 'DEINE_CLIENT_ID'}';
            const REDIRECT_URI = encodeURIComponent(window.location.origin + '/callback');
            const authUrl = \`https://discord.com/api/oauth2/authorize?client_id=\${CLIENT_ID}&redirect_uri=\${REDIRECT_URI}&response_type=code&scope=identify%20guilds.join\${guildId ? \`&state=\${guildId}\` : ''}\`;
            document.getElementById('verify-btn').href = authUrl;
        </script>
    </body>
    </html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
