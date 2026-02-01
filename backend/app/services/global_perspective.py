from __future__ import annotations

from dataclasses import dataclass

from app.api.models import GlobalPerspectiveResponse, Region
from app.services.clustering import ClusteringService
from app.services.perspective_generator import PerspectiveGenerator
from app.services.pinecone_search import PineconeSearchService


@dataclass(frozen=True)
class GlobalPerspectiveService:
    search: PineconeSearchService
    clustering: ClusteringService
    generator: PerspectiveGenerator

    def build(
        self,
        *,
        title_or_text: str | None,
        embedding: list[float] | None,
        top_k: int,
        per_region_k: int,
    ) -> GlobalPerspectiveResponse:
        grouped = self.search.search_grouped(
            title_or_text=title_or_text,
            embedding=embedding,
            top_k=top_k,
            per_region_k=per_region_k,
            include_vectors=True,
        )

        all_items = [m for region_items in grouped.values() for m in region_items]
        clusters = self.clustering.cluster(all_items)

        topic = clusters[0].topic if clusters else "Topic"
        regional_titles: dict[Region, list[str]] = {
            r: [m.title for m in ms if m.title] for r, ms in grouped.items()
        }
        summary, regional_perspectives = self.generator.generate(
            topic=topic, clusters=clusters, regional_titles=regional_titles
        )

        return GlobalPerspectiveResponse(
            topic=topic,
            summary=summary,
            regional_perspectives=regional_perspectives,
            grouped_articles=grouped,
            clusters=clusters,
        )
