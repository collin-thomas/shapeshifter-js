const server = Bun.serve<{ authToken: string }>({
  fetch(req: Request, server) {
    const success = server.upgrade(req);
    if (success) {
      // Bun automatically returns a 101 Switching Protocols
      // if the upgrade succeeds
      return undefined;
    }

    const url = new URL(req.url);

    // Serve the HTML file
    if (url.pathname === "/") {
      return new Response(Bun.file("./dist/index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Serve the JavaScript bundle
    if (url.pathname === "/app.js") {
      return new Response(Bun.file("./dist/app.js"), {
        headers: {
          "Content-Type": "application/javascript",
        },
      });
    }

    // Handle not found
    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    // this is called when a message is received
    async message(ws, message) {
      console.log(message);
      // send back a message
      ws.send(message);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
