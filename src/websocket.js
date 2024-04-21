export const ws = new WebSocket("ws://localhost:3000/", "protocolOne");

export function sendState(state) {
  if (ws.readyState !== WebSocket.OPEN) {
    return console.warn("Did not send data, websocket not ready");
  }
  //console.log("Send State", state);
  ws.send(JSON.stringify(state));
}

export function waitForWebSocketOpen(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const maxTimeout = setTimeout(() => {
      reject(new Error("Timed out waiting for WebSocket to open"));
    }, timeout);

    ws.addEventListener("open", function onOpen() {
      clearTimeout(maxTimeout);
      ws.removeEventListener("open", onOpen);
      resolve(ws);
    });

    ws.addEventListener("error", function onError(event) {
      clearTimeout(maxTimeout);
      ws.removeEventListener("error", onError);
      reject(new Error("WebSocket error: " + event.message));
    });
  });
}

export function waitForNewPlayerData(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const maxTimeout = setTimeout(() => {
      reject(new Error("Timed out waiting for new player data"));
    }, timeout);

    ws.addEventListener("message", function onMessage(event) {
      console.log("New Player WebSocket Message Received Message");
      const data = JSON.parse(event.data);
      if (!data.newPlayer) return;
      console.log("New Player WebSocket Message");
      clearTimeout(maxTimeout);
      ws.removeEventListener("message", onMessage);
      resolve(data);
    });

    ws.addEventListener("error", function onError(event) {
      clearTimeout(maxTimeout);
      ws.removeEventListener("error", onError);
      reject(new Error("WebSocket error: " + event.message));
    });
  });
}
