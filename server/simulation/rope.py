"""Rope model: nodes, segments, and rest lengths."""

import logging

import numpy as np

from server.config import ROPE as _ROPE_CFG

logger = logging.getLogger(__name__)


class Rope:
    """A rope represented as a chain of point masses (nodes).

    Attributes:
        positions: (N, 3) array of node positions.
        prev_positions: (N, 3) positions from the previous simulation step (for Verlet).
        masses: (N,) array of node masses.
        rest_lengths: (N-1,) distances between adjacent nodes at rest.
        pinned: set of node indices that are fixed in space.
    """

    def __init__(
        self,
        num_nodes: int = _ROPE_CFG.num_nodes,
        length: float = _ROPE_CFG.length,
    ) -> None:
        self.num_nodes = num_nodes
        # Lay the rope out horizontally along the X axis
        xs = np.linspace(-length / 2, length / 2, num_nodes)
        self.positions = np.column_stack([xs, np.zeros(num_nodes), np.zeros(num_nodes)])
        self.prev_positions = self.positions.copy()
        self.masses = np.ones(num_nodes)
        segment_len = length / (num_nodes - 1)
        self.rest_lengths = np.full(num_nodes - 1, segment_len)
        self.pinned: set[int] = set()

        logger.info("Rope created: %d nodes, total length %.2f", num_nodes, length)

    def pin(self, index: int) -> None:
        """Fix a node so the physics solver cannot move it."""
        self.pinned.add(index)
        logger.debug("Node %d pinned", index)

    def unpin(self, index: int) -> None:
        """Release a previously pinned node."""
        self.pinned.discard(index)
        logger.debug("Node %d unpinned", index)

    def set_node_position(self, index: int, position: list[float]) -> None:
        """Teleport a node to a new position (e.g. on user drag)."""
        pos = np.array(position, dtype=float)
        self.positions[index] = pos
        self.prev_positions[index] = pos
        logger.debug("Node %d moved to %s", index, pos)

    def state_dict(self) -> dict:
        """Serialisable snapshot of the rope state for the WebSocket protocol."""
        return {"nodes": self.positions.tolist()}
