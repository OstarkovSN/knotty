"""Tests for the PhysicsSolver."""

import numpy as np
import pytest

from server.simulation.physics import PhysicsSolver
from server.simulation.rope import Rope
from server.simulation.settings import RuntimeSettings


@pytest.fixture()
def default_sim():
    s = RuntimeSettings()
    r = Rope(num_nodes=10, length=3.0)
    p = PhysicsSolver(r, s)
    return p, r, s


def test_step_does_not_crash(default_sim):
    solver, rope, _ = default_sim
    solver.step(1 / 60)


def test_gravity_moves_nodes_down(default_sim):
    solver, rope, _ = default_sim
    initial_y = rope.positions[:, 1].copy()
    for _ in range(10):
        solver.step(1 / 60)
    # Free (unpinned) nodes should have moved downward
    assert np.all(rope.positions[1:, 1] < initial_y[1:])


def test_pinned_node_does_not_move(default_sim):
    solver, rope, _ = default_sim
    rope.pin(0)
    pinned_pos = rope.positions[0].copy()
    for _ in range(30):
        solver.step(1 / 60)
    assert np.allclose(rope.positions[0], pinned_pos)


def test_stiffness_zero_allows_stretch(default_sim):
    solver, rope, settings = default_sim
    # Disable damping so velocity accumulates freely; use a huge stretch limit
    settings.patch({"stiffness": 0.0, "stretch_limit": 99.0, "damping": 1.0})
    rope.pin(0)
    initial_length = _rope_length(rope)
    for _ in range(60):
        solver.step(1 / 60)
    # With no constraints and no damping, free nodes fall and the rope elongates
    assert _rope_length(rope) > initial_length * 1.5


def test_stretch_limit_caps_extension(default_sim):
    solver, rope, settings = default_sim
    limit = 1.1
    settings.patch({"stiffness": 0.0, "stretch_limit": limit})
    rope.pin(0)
    rest = float(rope.rest_lengths[0])
    for _ in range(60):
        solver.step(1 / 60)
    # Multiple constraint iterations per substep (see PhysicsSolver._CONSTRAINT_ITERS)
    # keep overshoot negligible; allow 1% tolerance for floating-point residuals
    tolerance = rest * 0.01
    for i in range(rope.num_nodes - 1):
        dist = float(np.linalg.norm(rope.positions[i + 1] - rope.positions[i]))
        assert dist <= rest * limit + tolerance, (
            f"segment {i} exceeded stretch limit: {dist:.4f} > {rest * limit:.4f}"
        )


def test_gravity_settings_take_effect_immediately(default_sim):
    solver, rope, settings = default_sim
    rope.pin(0)
    settings.patch({"gravity_y": 0.0})
    initial_y = rope.positions[1:, 1].copy()
    for _ in range(30):
        solver.step(1 / 60)
    # With zero gravity nodes should stay at roughly the same height
    # (damping will kill velocity, so they shouldn't drift far)
    assert np.allclose(rope.positions[1:, 1], initial_y, atol=0.05)


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _rope_length(rope: Rope) -> float:
    return float(sum(
        np.linalg.norm(rope.positions[i + 1] - rope.positions[i])
        for i in range(rope.num_nodes - 1)
    ))
