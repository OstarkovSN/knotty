"""Knot detection stubs — topology analysis will live here."""

import logging

import numpy as np

from server.simulation.rope import Rope

logger = logging.getLogger(__name__)


def compute_writhe(rope: Rope) -> float:
    """Estimate the writhe of the rope curve (placeholder).

    Writhe is a measure of how much the rope crosses over itself and is
    related to knot complexity. A full implementation uses the Gauss
    linking integral over all pairs of rope segments.
    """
    # TODO: implement Gauss linking integral
    _ = rope  # suppress unused-arg warning until implemented
    logger.debug("compute_writhe called — not yet implemented")
    return 0.0


def detect_crossings(rope: Rope) -> list[dict]:
    """Find 2-D projection crossings of the rope (placeholder).

    Projects the rope onto the XY plane and finds pairs of segments that
    cross. Each crossing is returned as a dict with the two segment indices
    and the crossing point.
    """
    # TODO: implement segment–segment intersection in 2-D projection
    _ = rope
    logger.debug("detect_crossings called — not yet implemented")
    return []


def classify_knot(rope: Rope) -> str:
    """Attempt to classify the knot type from crossing data (placeholder).

    Uses crossing number and sign sequence to look up known knot types.
    Currently always returns 'unknown'.
    """
    crossings = detect_crossings(rope)
    n = len(crossings)
    logger.info("Crossing count: %d — classification not yet implemented", n)
    return "unknown"
