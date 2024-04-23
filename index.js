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

// For consistency
const serverState = { connections: [] };

const db = { players: [], playableObjects: [...initValuesForPlayableObjects] };

function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor.padStart(6, "0");
}

const generateNewPlayer = (id) => {
  // spawn random coords and color.
  // todo: and ensure there is not a collision
  const newPlayer = {
    id,
    // Interesting bug where odd numbers the block couldn't move right up against each other
    x: Math.floor(Math.random() * 201) * 2,
    y: Math.floor(Math.random() * 201) * 2,
    size: 30,
    color: getRandomHexColor(),
    speed: 2,
    lastDirection: null,
    previous: null,
  };
  db.players.push(newPlayer);
  return newPlayer;
};

const applyPlayerUpdate = (player) => {
  db.players = db.players.map((p) => (p.id !== player.id ? p : player));
};

const applyPlayableObjectsUpdate = (playableObjects) => {
  db.playableObjects = playableObjects;
};

const removePlayer = (id) => {
  if (!id) return;
  db.players = db.players.filter((p) => p.id !== id);
};

const parseCookies = (req) => {
  const cs = req?.headers?.get("cookie");
  if (!cs) return {};
  const cookies = cs.split(" ;");
  const cookie = {};
  cookies.forEach((c) => {
    const split = c.split(/=(.*)/s);
    cookie[split[0]] = split[1];
  });
  return cookie;
};

const syncClients = (server) => {
  server.publish(
    "sync-clients",
    JSON.stringify({ ...db, type: "sync-clients" })
  );
};

const generatePlayerId = () => {
  const playerId = randomUUID();
  return playerId;
};

const server = Bun.serve({
  fetch(req, server) {
    console.log("fetch");
    let playerId;
    const cookie = parseCookies(req);
    if (cookie.id) {
      playerId = cookie.id;
    } else {
      playerId = generatePlayerId();
    }
    const success = server.upgrade(req, { data: { id: playerId } });
    if (success) {
      console.log("ws upgrade success");
      // Bun automatically returns a 101 Switching Protocols
      // if the upgrade succeeds
      return undefined;
    }

    const url = new URL(req.url);

    // Serve the HTML file
    if (url.pathname === "/") {
      console.log("page");
      return new Response(Bun.file("./dist/index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    if (url.pathname === "/admin") {
      return new Response(Bun.file("./dist/admin.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    if (url.pathname === "/api/admin") {
      return new Response(JSON.stringify({ serverState, db }), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Serve the JavaScript bundle
    if (url.pathname === "/app.js") {
      return new Response(Bun.file("./dist/app.js"), {
        headers: {
          "Content-Type": "application/javascript",
          "Set-Cookie": `id=${playerId}; HttpOnly`,
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
        // Prevent someone trying to sending updates
        // with a player id that doesn't exist.
        console.log("message");
        const playerId = ws.data.id;

        // If you cannot find playerid, close connection
        if (!serverState.connections.find((c) => c.playerId === playerId)) {
          ws.close(4001);
          return;
        }

        const data = JSON.parse(message);
        if (data.player) {
          applyPlayerUpdate(data.player);
        }
        if (data.playableObjects) {
          applyPlayableObjectsUpdate(data.playableObjects);
        }
        // Publish update to rest of players
        syncClients(server);
      } catch (error) {
        console.error(error);
      }
    },
    async open(ws) {
      const playerId = ws.data.id;
      const connectionId = randomUUID();

      console.log("open", {
        playerId,
        connectionId,
        connections: serverState.connections,
      });

      if (serverState.connections.find((c) => c.playerId === playerId)) {
        console.log("Connection Refused");

        // Terminate triggers the error event listener on the browser
        // It returns a code 1006.
        // We get our code 4000 on the server here.
        // Why this matters is the close handler gets called on the server.
        // So it might be safer to go with close(4000).
        //ws.terminate();
        ws.close(4000, "Connection Refused");
        return;
      }

      // If player exists, they must have opened a second tab,
      // don't create a new player, use existing one.
      const player = db.players.find((p) => p.id === playerId);
      if (player) {
        const message = { ...db, newPlayer: player };
        // Send message to just this client
        ws.send(JSON.stringify(message));
      } else {
        const newPlayer = generateNewPlayer(playerId);
        const message = { ...db, newPlayer };
        // Send message to just this client
        ws.send(JSON.stringify(message));
      }

      serverState.connections.push({ playerId, connectionId });

      ws.subscribe("sync-clients");
      syncClients(server);

      //console.log("open", playerId, db.players);
    },
    close(ws, code, message) {
      const playerId = ws.data.id;
      console.log("close", { playerId, code, message });
      if (code === 4000) {
        return;
      }
      if (code === 4001) {
        return;
      }
      ws.unsubscribe("sync-clients");
      removePlayer(playerId);
      serverState.connections = serverState.connections.filter(
        (p) => p.playerId !== playerId
      );
      syncClients(server);
      //console.log("close", playerId, db.players);
    },
    async drain(ws) {}, // the socket is ready to receive more data
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
