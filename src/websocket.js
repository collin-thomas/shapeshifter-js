export function sendState(state) {
  if (ws.readyState !== WebSocket.OPEN) {
    return console.warn("Did not send data, websocket not ready");
  }
  //console.log(state);
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

const ws = new WebSocket("ws://localhost:3000/", "protocolOne");

ws.addEventListener("message", (event) => {
  console.log(JSON.parse(event.data));
});
