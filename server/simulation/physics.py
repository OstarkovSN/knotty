"""Position-Based Dynamics (PBD) physics solver for the rope."""

import logging

import numpy as np

from server.config import PHYSICS as _PHYS_CFG
from server.simulation.rope import Rope

logger = logging.getLogger(__name__)


class PhysicsSolver:
    """Advances the rope simulation by one time step using PBD.

    Each call to :meth:`step` runs several substeps for stability. Within each
    substep, distance constraints between adjacent nodes are projected to satisfy
    the rest-length requirement.
    """

    def __init__(
        self,
        rope: Rope,
        substeps: int = _PHYS_CFG.substeps,
        damping: float = _PHYS_CFG.damping,
    ) -> None:
        self.rope = rope
        self.substeps = substeps
        self.damping = damping
        self._gravity = np.array(_PHYS_CFG.gravity)
        logger.info("PhysicsSolver ready: %d substeps, damping=%.3f", substeps, damping)

    def step(self, dt: float) -> None:
        """Advance the simulation by *dt* seconds."""
        sub_dt = dt / self.substeps
        for _ in range(self.substeps):
            self._integrate(sub_dt)
            self._solve_constraints()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _integrate(self, dt: float) -> None:
        """Verlet integration: estimate new positions from velocity + gravity."""
        rope = self.rope
        velocity = (rope.positions - rope.prev_positions) * self.damping
        new_positions = rope.positions + velocity + self._gravity * dt * dt

        # Keep pinned nodes fixed
        for idx in rope.pinned:
            new_positions[idx] = rope.positions[idx]

        rope.prev_positions = rope.positions.copy()
        rope.positions = new_positions

    def _solve_constraints(self) -> None:
        """Project distance constraints for each rope segment."""
        rope = self.rope
        for i in range(rope.num_nodes - 1):
            p1 = rope.positions[i]
            p2 = rope.positions[i + 1]
            delta = p2 - p1
            dist = float(np.linalg.norm(delta))
            if dist < 1e-8:
                continue
            rest = rope.rest_lengths[i]
            correction = delta * ((dist - rest) / dist)

            pinned1 = i in rope.pinned
            pinned2 = (i + 1) in rope.pinned

            if pinned1 and pinned2:
                pass
            elif pinned1:
                rope.positions[i + 1] -= correction
            elif pinned2:
                rope.positions[i] += correction
            else:
                rope.positions[i] += correction * 0.5
                rope.positions[i + 1] -= correction * 0.5
