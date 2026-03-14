"""Mutable runtime settings for a simulation session.

All physics parameters that can be changed live by the client are stored here.
To add a new setting: add a field below and a matching entry in the client schema.
"""

import logging
from dataclasses import asdict, dataclass

from server.config import PHYSICS as _PHYS_CFG

logger = logging.getLogger(__name__)


@dataclass
class RuntimeSettings:
    # Physics — must match field ids in client/js/settings_schema.js
    gravity_y: float = _PHYS_CFG.gravity[1]
    damping: float = _PHYS_CFG.damping
    substeps: int = _PHYS_CFG.substeps

    def patch(self, updates: dict) -> None:
        """Apply a {field: value} patch, coercing types and ignoring unknown keys."""
        for key, value in updates.items():
            if not hasattr(self, key):
                logger.warning("Unknown setting ignored: %s", key)
                continue
            coerced = type(getattr(self, key))(value)
            setattr(self, key, coerced)
            logger.info("Setting updated: %s = %s", key, coerced)

    def as_dict(self) -> dict:
        return asdict(self)
