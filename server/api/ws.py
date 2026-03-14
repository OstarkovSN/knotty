"""WebSocket handler: bridges browser input and the physics simulation loop."""

import asyncio
import logging

from fastapi import WebSocket, WebSocketDisconnect

from server.config import SERVER as _SRV_CFG
from server.simulation.physics import PhysicsSolver
from server.simulation.rope import Rope
from server.simulation.settings import RuntimeSettings

logger = logging.getLogger(__name__)

_SIM_DT = 1.0 / _SRV_CFG.tick_rate


async def handle_connection(websocket: WebSocket) -> None:
    """Accept a WebSocket connection and run the simulation loop for it."""
    await websocket.accept()
    logger.info("Client connected: %s", websocket.client)

    settings = RuntimeSettings()
    rope = Rope()
    rope.pin(0)
    solver = PhysicsSolver(rope, settings)

    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(_sim_loop(websocket, rope, solver))
            tg.create_task(_input_loop(websocket, rope, settings))
    except* WebSocketDisconnect:
        logger.info("Client disconnected: %s", websocket.client)
    except* Exception:
        logger.exception("Unhandled error in WebSocket session for %s", websocket.client)


# ------------------------------------------------------------------
# Internal coroutines
# ------------------------------------------------------------------

async def _sim_loop(websocket: WebSocket, rope: Rope, solver: PhysicsSolver) -> None:
    """Advance physics and push rope state to the client at the configured tick rate."""
    while True:
        solver.step(_SIM_DT)
        await websocket.send_json(rope.state_dict())
        await asyncio.sleep(_SIM_DT)


async def _input_loop(websocket: WebSocket, rope: Rope, settings: RuntimeSettings) -> None:
    """Receive commands from the client and apply them to the rope or settings.

    Expected message formats (JSON):
        {"action": "move_node",       "index": <int>, "position": [x, y, z]}
        {"action": "pin_node",        "index": <int>}
        {"action": "unpin_node",      "index": <int>}
        {"action": "update_settings", "settings": {<field>: <value>, ...}}
    """
    while True:
        data = await websocket.receive_json()
        action = data.get("action")

        if action == "move_node":
            rope.set_node_position(data["index"], data["position"])
        elif action == "pin_node":
            rope.pin(data["index"])
        elif action == "unpin_node":
            rope.unpin(data["index"])
        elif action == "update_settings":
            settings.patch(data.get("settings", {}))
        else:
            logger.warning("Unknown action received: %s", action)
