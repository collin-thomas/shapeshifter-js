import { randomUUID } from "crypto";

const initValuesForPlayableObjects = [
  {
    id: randomUUID(),
    x: 150,
    y: 70,
    size: 30,
    color: "red",
    speed: 2,
  },
  {
    id: randomUUID(),
    x: 230,
    y: 150,
    size: 30,
    color: "green",
    speed: 2,
  },
  {
    id: randomUUID(),
    x: 230,
    y: 200,
    size: 30,
    color: "yellow",
    speed: 2,
  },
  {
    id: randomUUID(),
    x: 50,
    y: 300,
    size: 30,
    color: "pink",
    speed: 2,
  },
  {
    id: randomUUID(),
    x: 400,
    y: 40,
    size: 30,
    color: "black",
    speed: 2,
  },
];

const db = { players: [], playableObjects: [...initValuesForPlayableObjects] };

const generateNewPlayer = (id) => {
  // spawn random coords and color.
  // todo: and ensure there is not a collision
  const newPlayer = {
    id,
    // Interesting bug where odd numbers the block couldn't move right up against each other
    x: Math.floor(Math.random() * 201) * 2,
    y: Math.floor(Math.random() * 201) * 2,
    size: 30,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    speed: 2,
    lastDirection: null,
    previous: null,
  };
  db.players.push(newPlayer);
  return newPlayer;
};

const applyPlayerUpdate = (player) => {
  //console.log("before", db.players);
  db.players = db.players.map((p) => (p.id !== player.id ? p : player));
  //console.log("after", db.players);
};

const removePlayer = (id) => {
  if (!id) return;
  db.players = db.players.filter((p) => p.id !== id);
};

const syncClients = (server) => {
  server.publish(
    "sync-clients",
    JSON.stringify({ ...db, type: "sync-clients" })
  );
};

const server = Bun.serve({
  fetch(req, server) {
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
      try {
        const data = JSON.parse(message);
        if (data.player) {
          applyPlayerUpdate(data.player);
        }
        // Publish update to rest of players
        syncClients(server);
      } catch (error) {
        console.error(error);
      }
    },
    async open(ws) {
      const newPlayer = generateNewPlayer(randomUUID());
      const message = { ...db, newPlayer };
      ws.send(JSON.stringify(message));

      ws.subscribe("sync-clients");
      syncClients(server);
    }, // a socket is opened
    close(ws) {
      console.log("close", ws?.data?.id);
      ws.unsubscribe("sync-clients");
      //removePlayer(ws.data.id);
      syncClients(server);
    },
    async drain(ws) {}, // the socket is ready to receive more data
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
