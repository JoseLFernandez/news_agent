from __future__ import annotations

import math
from typing import Sequence


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    """Compute cosine similarity between two vectors.

    Returns 0.0 when either vector is all-zeros.
    """

    if len(a) != len(b):
        raise ValueError("Vectors must have the same dimensionality")

    dot = 0.0
    norm_a = 0.0
    norm_b = 0.0
    for x, y in zip(a, b):
        dot += float(x) * float(y)
        norm_a += float(x) * float(x)
        norm_b += float(y) * float(y)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot / (math.sqrt(norm_a) * math.sqrt(norm_b))
