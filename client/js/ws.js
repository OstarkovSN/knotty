/**
 * WebSocket client wrapper.
 * Connects to the server and dispatches incoming rope state to a callback.
 */

export class RopeSocket {
  /**
   * @param {string} url - WebSocket URL (e.g. "ws://localhost:8000/ws")
   * @param {function(Object): void} onState - called with each rope state message
   */
  constructor(url, onState) {
    this.url = url;
    this.onState = onState;
    this.ws = null;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      console.log("Connected to simulation server");
    });

    this.ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      this.onState(data);
    });

    this.ws.addEventListener("close", () => {
      console.warn("WebSocket closed — retrying in 2s");
      setTimeout(() => this.connect(), 2000);
    });

    this.ws.addEventListener("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }

  /**
   * Send a command to the server.
   * @param {Object} message - must include an "action" field
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /** Move a rope node to a new [x, y, z] position. */
  moveNode(index, position) {
    this.send({ action: "move_node", index, position });
  }

  /** Pin a node so the server keeps it fixed. */
  pinNode(index) {
    this.send({ action: "pin_node", index });
  }

  /** Release a pinned node. */
  unpinNode(index) {
    this.send({ action: "unpin_node", index });
  }
}
