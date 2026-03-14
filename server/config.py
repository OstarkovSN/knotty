"""Central configuration for the Knotty simulation server."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RopeConfig:
    num_nodes: int = 20
    length: float = 5.0       # total rope length in world units


@dataclass(frozen=True)
class PhysicsConfig:
    substeps: int = 5
    damping: float = 0.98     # velocity damping per step (1.0 = no damping)
    gravity: tuple[float, float, float] = (0.0, -9.81, 0.0)


@dataclass(frozen=True)
class ServerConfig:
    tick_rate: int = 60       # simulation ticks per second
    host: str = "0.0.0.0"
    port: int = 8000


ROPE = RopeConfig()
PHYSICS = PhysicsConfig()
SERVER = ServerConfig()
