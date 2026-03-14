"""Tests for RuntimeSettings."""

import pytest

from server.simulation.settings import RuntimeSettings


def test_defaults_match_config():
    from server.config import PHYSICS as cfg

    s = RuntimeSettings()
    assert s.gravity_y == cfg.gravity[1]
    assert s.damping == cfg.damping
    assert s.substeps == cfg.substeps


def test_patch_updates_known_fields():
    s = RuntimeSettings()
    s.patch({"gravity_y": -5.0, "damping": 0.5, "substeps": 10})
    assert s.gravity_y == -5.0
    assert s.damping == 0.5
    assert s.substeps == 10


def test_patch_coerces_types():
    s = RuntimeSettings()
    # substeps is int; passing a float string should coerce correctly
    s.patch({"substeps": 8.9})
    assert isinstance(s.substeps, int)
    assert s.substeps == 8

    s.patch({"damping": "0.7"})
    assert isinstance(s.damping, float)
    assert s.damping == pytest.approx(0.7)


def test_patch_ignores_unknown_keys():
    s = RuntimeSettings()
    original = s.as_dict()
    s.patch({"nonexistent_field": 42})
    assert s.as_dict() == original


def test_stiffness_and_stretch_limit_defaults():
    s = RuntimeSettings()
    assert s.stiffness == pytest.approx(1.0)
    assert s.stretch_limit == pytest.approx(1.5)


def test_patch_rope_settings():
    s = RuntimeSettings()
    s.patch({"stiffness": 0.3, "stretch_limit": 2.0})
    assert s.stiffness == pytest.approx(0.3)
    assert s.stretch_limit == pytest.approx(2.0)


def test_as_dict_contains_all_fields():
    s = RuntimeSettings()
    d = s.as_dict()
    for field in ("gravity_y", "damping", "substeps", "stiffness", "stretch_limit"):
        assert field in d
