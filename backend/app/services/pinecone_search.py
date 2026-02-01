from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from app.api.models import ArticleMatch, Region
from app.core.config import settings


class Embedder(Protocol):
    def embed(self, text: str) -> list[float]: ...


class PineconeIndex(Protocol):
    def query(
        self,
        *,
        vector: list[float],
        top_k: int,
        filter: dict[str, Any] | None = None,
        include_metadata: bool = True,
        include_values: bool = False,
    ) -> Any: ...


@dataclass(frozen=True)
class PineconeSearchService:
    index: PineconeIndex
    embedder: Embedder | None = None

    def _to_match(self, m: Any) -> ArticleMatch:
        md = getattr(m, "metadata", None) or {}
        values = getattr(m, "values", None)
        return ArticleMatch(
            id=str(getattr(m, "id", "")),
            score=float(getattr(m, "score", 0.0)),
            title=md.get("title"),
            url=md.get("url"),
            source=md.get("source"),
            country=md.get("country"),
            region=md.get("region"),
            published_at=md.get("published_at"),
            metadata=dict(md),
            embedding=list(values) if values is not None else None,
        )

    def _region_filter(self, region: Region) -> dict[str, Any]:
        # Prefer explicit metadata.region if you have it; otherwise, fall back to country list.
        countries = settings.region_countries.get(region, [])
        if countries:
            return {"$or": [{"region": {"$eq": region}}, {"country": {"$in": countries}}]}
        return {"region": {"$eq": region}}

    def search_grouped(
        self,
        *,
        title_or_text: str | None,
        embedding: list[float] | None,
        top_k: int = 50,
        per_region_k: int = 6,
        regions: list[Region] | None = None,
        include_vectors: bool = True,
    ) -> dict[Region, list[ArticleMatch]]:
        if embedding is None:
            if not title_or_text:
                raise ValueError("Need embedding or title/text")
            if not self.embedder:
                raise ValueError("No embedder configured; provide embedding")
            embedding = self.embedder.embed(title_or_text)

        regions = regions or ["US", "EU", "China", "India", "GlobalSouth"]
        out: dict[Region, list[ArticleMatch]] = {r: [] for r in regions}

        for region in regions:
            res = self.index.query(
                vector=embedding,
                top_k=min(top_k, per_region_k),
                filter=self._region_filter(region),
                include_metadata=True,
                include_values=include_vectors,
            )
            matches = getattr(res, "matches", None) or []
            out[region] = [self._to_match(m) for m in matches]

        return out
