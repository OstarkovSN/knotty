"""FastAPI application entry point."""

import logging
from pathlib import Path

from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles

from server.api.ws import handle_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Knotty")

CLIENT_DIR = Path(__file__).parent.parent / "client"
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await handle_connection(websocket)


app.mount("/", StaticFiles(directory=CLIENT_DIR, html=True), name="static")
