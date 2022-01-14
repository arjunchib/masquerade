function handleWebSocket(request) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener("message", (event) => {
    console.log(event.data);
    server.send("PONG");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/new/")) {
      return handleWebSocket(request);
    }
    // Serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
};
