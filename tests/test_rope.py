"""Tests for the Rope model."""

import numpy as np
import pytest

from server.simulation.rope import Rope


def test_initial_shape():
    rope = Rope(num_nodes=10, length=4.0)
    assert rope.positions.shape == (10, 3)
    assert rope.prev_positions.shape == (10, 3)
    assert rope.rest_lengths.shape == (9,)


def test_initial_layout_is_horizontal():
    rope = Rope(num_nodes=5, length=4.0)
    # All Y and Z coordinates should be zero at rest
    assert np.allclose(rope.positions[:, 1], 0.0)
    assert np.allclose(rope.positions[:, 2], 0.0)


def test_rest_lengths_are_uniform():
    rope = Rope(num_nodes=11, length=5.0)
    expected = 5.0 / 10
    assert np.allclose(rope.rest_lengths, expected)


def test_pin_and_unpin():
    rope = Rope()
    rope.pin(0)
    assert 0 in rope.pinned
    rope.unpin(0)
    assert 0 not in rope.pinned


def test_unpin_nonexistent_is_safe():
    rope = Rope()
    rope.unpin(99)  # should not raise


def test_set_node_position():
    rope = Rope()
    target = [1.0, 2.0, 3.0]
    rope.set_node_position(3, target)
    assert np.allclose(rope.positions[3], target)
    assert np.allclose(rope.prev_positions[3], target)


def test_state_dict_structure():
    rope = Rope(num_nodes=5)
    d = rope.state_dict()
    assert "nodes" in d
    assert len(d["nodes"]) == 5
    assert len(d["nodes"][0]) == 3
