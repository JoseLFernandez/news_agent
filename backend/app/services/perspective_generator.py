from __future__ import annotations

from dataclasses import dataclass

from app.api.models import Cluster, Region


@dataclass(frozen=True)
class PerspectiveGenerator:
    """Generate a region-by-region framing comparison.

    This is intentionally deterministic for now; swap in an LLM-backed implementation
    later without changing the API surface.
    """

    def generate(
        self,
        *,
        topic: str,
        clusters: list[Cluster],
        regional_titles: dict[Region, list[str]],
    ) -> tuple[str, dict[Region, str]]:
        def best_title(region: Region) -> str | None:
            titles = [t for t in regional_titles.get(region, []) if t]
            return titles[0] if titles else None

        perspectives: dict[Region, str] = {}
        for region in ["US", "EU", "China", "India", "GlobalSouth"]:
            t = best_title(region)
            perspectives[region] = (
                f"Emphasis suggested by headlines: {t}" if t else "No matching coverage found."
            )

        summary = (
            "Regional coverage differs mainly in which aspects are emphasized (policy, markets, "
            "geopolitics, or local impact)."
        )
        return summary, perspectives
