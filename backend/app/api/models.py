from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


Region = Literal["US", "EU", "China", "India", "GlobalSouth"]


class GlobalPerspectiveRequest(BaseModel):
    article_id: str | None = Field(
        default=None, description="Your internal article ID"
    )
    text: str | None = Field(
        default=None, description="Article title or full text"
    )
    embedding: list[float] | None = Field(
        default=None,
        description="Optional embedding vector if you already computed it",
    )

    top_k: int = 50
    per_region_k: int = 6

    @model_validator(mode="after")
    def _validate_input(self) -> "GlobalPerspectiveRequest":
        if not self.article_id and not self.text and not self.embedding:
            msg = "Provide at least one of: article_id, text, embedding"
            raise ValueError(msg)
        return self


class ArticleMatch(BaseModel):
    id: str
    score: float | None = None
    title: str | None = None
    url: str | None = None
    source: str | None = None
    country: str | None = None
    region: Region | None = None
    published_at: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    embedding: list[float] | None = None


class Cluster(BaseModel):
    topic: str
    items: list[ArticleMatch]


class GlobalPerspectiveResponse(BaseModel):
    topic: str
    summary: str
    regional_perspectives: dict[Region, str]
    grouped_articles: dict[Region, list[ArticleMatch]]
    clusters: list[Cluster] = Field(default_factory=list)


# --- Bias Analysis Models ---

BiasType = Literal["sentiment", "framing", "omission", "emphasis", "source_lean"]


class BiasIndicator(BaseModel):
    """Individual bias signal detected in an article."""

    type: BiasType
    signal: str = Field(description="Description of the bias signal")
    confidence: float = Field(
        ge=0.0, le=1.0, description="Confidence score 0-1"
    )
    evidence: str | None = Field(
        default=None, description="Quote or excerpt as evidence"
    )


class ArticleBiasProfile(BaseModel):
    """Bias analysis for a single article."""

    article_id: str
    sentiment_score: float = Field(
        ge=-1.0, le=1.0, description="Sentiment from -1 (negative) to +1 (positive)"
    )
    framing_keywords: list[str] = Field(
        default_factory=list, description="Loaded or biased terms found"
    )
    emphasis: list[str] = Field(
        default_factory=list, description="Topics/aspects emphasized"
    )
    indicators: list[BiasIndicator] = Field(default_factory=list)


class StoryCluster(BaseModel):
    """A group of articles covering the same underlying event."""

    cluster_id: str
    canonical_title: str = Field(
        description="Representative title for the story"
    )
    event_summary: str = Field(
        description="Neutral summary of the underlying event"
    )
    articles: list[ArticleMatch]
    bias_profiles: dict[str, ArticleBiasProfile] = Field(
        default_factory=dict, description="article_id -> bias profile"
    )
    source_diversity: float = Field(
        ge=0.0, le=1.0, description="Score based on unique sources"
    )
    regional_coverage: dict[Region, int] = Field(
        default_factory=dict, description="Article count per region"
    )
    headline_variations: list[str] = Field(
        default_factory=list, description="Different headlines for same story"
    )
    framing_comparison: str = Field(
        default="", description="Comparative analysis narrative"
    )


class StoryClusterRequest(BaseModel):
    """Request to find story clusters for an article or topic."""

    article_id: str | None = Field(default=None)
    text: str | None = Field(default=None)
    embedding: list[float] | None = Field(default=None)
    include_bias_analysis: bool = True
    top_k: int = Field(default=30, description="Max articles to search")
    similarity_threshold: float = Field(
        default=0.85, ge=0.0, le=1.0, description="Min similarity for same-story"
    )

    @model_validator(mode="after")
    def _validate_input(self) -> "StoryClusterRequest":
        if not self.article_id and not self.text and not self.embedding:
            msg = "Provide at least one of: article_id, text, embedding"
            raise ValueError(msg)
        return self


class StoryClusterResponse(BaseModel):
    """Response containing story clusters with bias analysis."""

    clusters: list[StoryCluster]
    total_articles_analyzed: int
    query_article_id: str | None = None
