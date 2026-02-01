"""
StoryClusterService: Finds articles covering the same story and groups them
for comparative bias analysis.

Uses a lower similarity threshold (85%) than standard clustering (90%)
to catch articles with different framing of the same underlying event.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Protocol

from app.api.models import (
    ArticleBiasProfile,
    ArticleMatch,
    Region,
    StoryCluster,
)
from app.services.bias_analyzer import BiasAnalyzer
from app.utils.similarity import cosine_similarity


class SearchService(Protocol):
    """Protocol for article search services."""

    def search_grouped(
        self,
        *,
        title_or_text: str | None,
        embedding: list[float] | None,
        top_k: int,
        per_region_k: int,
        regions: list[Region] | None,
        include_vectors: bool,
    ) -> dict[Region, list[ArticleMatch]]: ...


# Threshold for considering articles to cover the "same story"
# Lower than standard clustering (90%) to catch different framings
SAME_STORY_THRESHOLD = 0.85

# Threshold for near-identical deduplication
NEAR_DUPLICATE_THRESHOLD = 0.97


def _dedupe_by_url(articles: list[ArticleMatch]) -> list[ArticleMatch]:
    """Remove articles with duplicate URLs."""
    seen_urls: set[str] = set()
    deduped: list[ArticleMatch] = []
    for article in articles:
        url = article.url or ""
        if url and url in seen_urls:
            continue
        if url:
            seen_urls.add(url)
        deduped.append(article)
    return deduped


def _dedupe_near_identical(
    articles: list[ArticleMatch],
    threshold: float = NEAR_DUPLICATE_THRESHOLD,
) -> list[ArticleMatch]:
    """Remove near-identical articles based on embedding similarity."""
    kept: list[ArticleMatch] = []
    for article in articles:
        is_duplicate = False
        for existing in kept:
            if article.embedding and existing.embedding:
                sim = cosine_similarity(article.embedding, existing.embedding)
                if sim >= threshold:
                    is_duplicate = True
                    break
        if not is_duplicate:
            kept.append(article)
    return kept


def _cluster_same_story(
    articles: list[ArticleMatch],
    threshold: float = SAME_STORY_THRESHOLD,
) -> list[list[ArticleMatch]]:
    """
    Group articles into clusters where each cluster covers the same story.

    Uses greedy clustering: each article joins the first cluster where it
    has >= threshold similarity with the cluster representative.
    """
    clusters: list[list[ArticleMatch]] = []

    for article in articles:
        placed = False
        for cluster in clusters:
            representative = cluster[0]
            if article.embedding and representative.embedding:
                sim = cosine_similarity(
                    article.embedding,
                    representative.embedding,
                )
                if sim >= threshold:
                    cluster.append(article)
                    placed = True
                    break
        if not placed:
            clusters.append([article])

    return clusters


def _extract_headline_variations(articles: list[ArticleMatch]) -> list[str]:
    """Extract unique headlines from articles."""
    headlines: list[str] = []
    seen: set[str] = set()
    for article in articles:
        title = (article.title or "").strip()
        if title and title.lower() not in seen:
            headlines.append(title)
            seen.add(title.lower())
    return headlines


def _calculate_source_diversity(articles: list[ArticleMatch]) -> float:
    """
    Calculate diversity score based on unique sources.

    Returns 0-1 where 1 means maximum diversity.
    """
    if len(articles) <= 1:
        return 0.0

    sources = {a.source for a in articles if a.source}
    if len(sources) <= 1:
        return 0.0

    # Score increases with more unique sources, max at ~5 sources
    return min(1.0, (len(sources) - 1) / 4)


def _calculate_regional_coverage(
    articles: list[ArticleMatch],
) -> dict[Region, int]:
    """Count articles per region."""
    coverage: dict[Region, int] = {}
    for article in articles:
        region = article.region
        if region:
            coverage[region] = coverage.get(region, 0) + 1
    return coverage


def _generate_canonical_title(articles: list[ArticleMatch]) -> str:
    """Pick the most representative title (shortest non-empty)."""
    titles = [a.title for a in articles if a.title]
    if not titles:
        return "Untitled Story"
    # Prefer shorter titles as they tend to be more factual
    return min(titles, key=len)


def _generate_event_summary(
    articles: list[ArticleMatch],
    profiles: dict[str, ArticleBiasProfile],
) -> str:
    """
    Generate a neutral summary of the underlying event.

    This is a simple heuristic version - extracts common elements.
    Can be enhanced with LLM for better summaries.
    """
    # For now, use the title from the most neutral article
    if not articles:
        return ""

    # Find article with sentiment closest to 0
    neutral_article = min(
        articles,
        key=lambda a: abs(profiles.get(a.id, ArticleBiasProfile(
            article_id=a.id,
            sentiment_score=0.0,
        )).sentiment_score),
    )

    return neutral_article.title or "News event covered by multiple sources"


@dataclass
class StoryClusterService:
    """
    Service for finding and analyzing story clusters.

    A story cluster is a group of articles from different sources
    covering the same underlying news event.
    """

    bias_analyzer: BiasAnalyzer = field(default_factory=BiasAnalyzer)
    same_story_threshold: float = SAME_STORY_THRESHOLD

    def find_clusters(
        self,
        articles: list[ArticleMatch],
        *,
        include_bias: bool = True,
        min_sources: int = 2,
    ) -> list[StoryCluster]:
        """
        Find story clusters in a list of articles.

        Args:
            articles: Articles to cluster (should have embeddings).
            include_bias: Whether to run bias analysis.
            min_sources: Minimum unique sources for a valid cluster.

        Returns:
            List of StoryCluster objects with bias analysis.
        """
        # Step 1: Deduplicate
        articles = _dedupe_by_url(articles)
        articles = _dedupe_near_identical(articles)

        # Step 2: Cluster by story similarity
        raw_clusters = _cluster_same_story(articles, self.same_story_threshold)

        # Step 3: Filter to multi-source clusters
        multi_source_clusters = [
            c for c in raw_clusters
            if len({a.source for a in c if a.source}) >= min_sources
        ]

        # Step 4: Build StoryCluster objects with bias analysis
        result: list[StoryCluster] = []
        for cluster_articles in multi_source_clusters:
            # Run bias analysis
            if include_bias:
                profiles = self.bias_analyzer.analyze_batch(cluster_articles)
                comparison = self.bias_analyzer.generate_comparison(
                    cluster_articles, profiles
                )
            else:
                profiles = {}
                comparison = ""

            cluster = StoryCluster(
                cluster_id=str(uuid.uuid4()),
                canonical_title=_generate_canonical_title(cluster_articles),
                event_summary=_generate_event_summary(cluster_articles, profiles),
                articles=cluster_articles,
                bias_profiles=profiles,
                source_diversity=_calculate_source_diversity(cluster_articles),
                regional_coverage=_calculate_regional_coverage(cluster_articles),
                headline_variations=_extract_headline_variations(cluster_articles),
                framing_comparison=comparison,
            )
            result.append(cluster)

        # Sort by source diversity (most diverse first)
        result.sort(key=lambda c: c.source_diversity, reverse=True)

        return result

    def find_clusters_for_article(
        self,
        search_service: Any,
        *,
        article_id: str | None = None,
        text: str | None = None,
        embedding: list[float] | None = None,
        top_k: int = 30,
        include_bias: bool = True,
    ) -> list[StoryCluster]:
        """
        Find story clusters related to a specific article or query.

        Uses the search service to find similar articles, then clusters them.
        """
        # Search for similar articles across all regions
        grouped = search_service.search_grouped(
            title_or_text=text,
            embedding=embedding,
            top_k=top_k,
            per_region_k=top_k,  # Get all from each region
            regions=None,  # All regions
            include_vectors=True,  # Need embeddings for clustering
        )

        # Flatten results from all regions
        all_articles: list[ArticleMatch] = []
        for region_articles in grouped.values():
            all_articles.extend(region_articles)

        return self.find_clusters(
            all_articles,
            include_bias=include_bias,
        )
