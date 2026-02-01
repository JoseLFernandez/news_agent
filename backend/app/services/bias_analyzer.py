"""
BiasAnalyzer: Extracts bias signals from news articles using heuristics.

Detects sentiment, framing keywords, and other bias indicators.
Can be extended with LLM analysis for deeper insights.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.api.models import ArticleBiasProfile, ArticleMatch, BiasIndicator

# --- Sentiment Word Lists ---
# These determine positive/negative scoring. Domain-specific to news.

POSITIVE_WORDS: set[str] = {
    # Achievement / Success
    "achieves", "achieved", "breakthrough", "success", "successful",
    "wins", "won", "victory", "triumph", "celebrates",
    # Growth / Progress
    "grows", "growth", "improves", "improvement", "advances",
    "progress", "innovation", "innovative", "launches", "launched",
    # Positive framing
    "investment", "opportunity", "partnership", "agreement", "deal",
    "record", "milestone", "historic", "leads", "leading",
}

NEGATIVE_WORDS: set[str] = {
    # Failure / Problems
    "fails", "failed", "failure", "collapse", "collapses",
    "crisis", "disaster", "catastrophe", "scandal", "controversy",
    # Conflict / Aggression
    "attacks", "attacked", "slams", "blasts", "criticizes",
    "accuses", "accused", "threatens", "warned", "warns",
    # Negative framing
    "cost", "costs", "burden", "risk", "risks", "fears",
    "concerns", "worries", "plunges", "plummets", "crashes",
    "admits", "admitted", "denies", "denied", "refuses",
}

# --- Framing Keywords ---
# Loaded terms that subtly influence reader perception.

FRAMING_KEYWORDS: dict[str, str] = {
    # Positive spin
    "investment": "frames spending as beneficial",
    "reform": "frames change as improvement",
    "freedom fighter": "frames combatant positively",
    "entrepreneur": "frames business person positively",
    "visionary": "frames leader positively",
    # Negative spin
    "cost": "frames spending as burden",
    "regime": "frames government negatively",
    "terrorist": "frames combatant negatively",
    "admits": "implies guilt or wrongdoing",
    "controversial": "signals disapproval",
    "so-called": "expresses skepticism",
    "claims": "implies doubt about truth",
    "allegedly": "distances from assertion",
    # Urgency/Fear
    "crisis": "amplifies urgency",
    "threat": "invokes fear",
    "surge": "implies rapid uncontrolled change",
    "flood": "dehumanizes (when used for people)",
}


def _tokenize(text: str) -> list[str]:
    """Extract lowercase word tokens from text."""
    return re.findall(r"[a-zA-Z]+", text.lower())


def _calculate_sentiment(tokens: list[str]) -> float:
    """
    Calculate sentiment score from -1 (negative) to +1 (positive).

    Uses simple word counting with normalization.
    """
    if not tokens:
        return 0.0

    positive_count = sum(1 for t in tokens if t in POSITIVE_WORDS)
    negative_count = sum(1 for t in tokens if t in NEGATIVE_WORDS)

    total_sentiment_words = positive_count + negative_count
    if total_sentiment_words == 0:
        return 0.0

    # Score from -1 to +1
    score = (positive_count - negative_count) / total_sentiment_words

    # Dampen extreme scores if based on few words
    confidence_factor = min(1.0, total_sentiment_words / 5)
    return score * confidence_factor


def _extract_framing_keywords(tokens: list[str]) -> list[str]:
    """Find loaded/framing keywords in the text."""
    found = []
    for token in tokens:
        if token in FRAMING_KEYWORDS:
            found.append(token)
    return list(set(found))  # Deduplicate


@dataclass
class BiasAnalyzer:
    """
    Analyzes articles for bias signals using heuristics.

    Attributes:
        source_leanings: Optional mapping of source names to political lean.
    """

    source_leanings: dict[str, str] = field(default_factory=dict)

    def analyze(
        self,
        article: ArticleMatch,
        *,
        story_context: str | None = None,
    ) -> ArticleBiasProfile:
        """
        Analyze a single article for bias signals.

        Args:
            article: The article to analyze.
            story_context: Optional neutral summary of the story for comparison.

        Returns:
            ArticleBiasProfile with sentiment, framing, and indicators.
        """
        # Combine title and summary for analysis
        text = (article.title or "") + " " + article.metadata.get("summary", "")
        tokens = _tokenize(text)

        # Calculate sentiment
        sentiment = _calculate_sentiment(tokens)

        # Extract framing keywords
        framing_keywords = _extract_framing_keywords(tokens)

        # Build bias indicators
        indicators: list[BiasIndicator] = []

        # Add framing indicators
        for keyword in framing_keywords:
            explanation = FRAMING_KEYWORDS.get(keyword, "loaded language")
            indicators.append(
                BiasIndicator(
                    type="framing",
                    signal=f"Uses '{keyword}' - {explanation}",
                    confidence=0.7,
                    evidence=keyword,
                )
            )

        # Add sentiment indicator if notably biased
        if abs(sentiment) > 0.3:
            direction = "positive" if sentiment > 0 else "negative"
            indicators.append(
                BiasIndicator(
                    type="sentiment",
                    signal=f"Overall {direction} tone (score: {sentiment:.2f})",
                    confidence=min(0.9, abs(sentiment)),
                )
            )

        # Add source lean indicator if known
        source = article.source or ""
        if source in self.source_leanings:
            lean = self.source_leanings[source]
            indicators.append(
                BiasIndicator(
                    type="source_lean",
                    signal=f"Source typically leans {lean}",
                    confidence=0.6,
                )
            )

        return ArticleBiasProfile(
            article_id=article.id,
            sentiment_score=sentiment,
            framing_keywords=framing_keywords,
            emphasis=[],  # TODO: Extract from LLM analysis
            indicators=indicators,
        )

    def analyze_batch(
        self,
        articles: list[ArticleMatch],
        *,
        story_context: str | None = None,
    ) -> dict[str, ArticleBiasProfile]:
        """Analyze multiple articles, returning a dict keyed by article_id."""
        return {
            article.id: self.analyze(article, story_context=story_context)
            for article in articles
        }

    def generate_comparison(
        self,
        articles: list[ArticleMatch],
        profiles: dict[str, ArticleBiasProfile],
    ) -> str:
        """
        Generate a text comparison of how sources framed the same story.

        This is a heuristic version. Can be enhanced with LLM.
        """
        if len(articles) < 2:
            return ""

        lines = ["Coverage varies across sources:"]

        # Group by sentiment direction
        positive = [a for a in articles if profiles[a.id].sentiment_score > 0.1]
        negative = [a for a in articles if profiles[a.id].sentiment_score < -0.1]
        neutral = [
            a for a in articles
            if -0.1 <= profiles[a.id].sentiment_score <= 0.1
        ]

        if positive:
            sources = ", ".join(a.source or "unknown" for a in positive[:3])
            lines.append(f"- Positive framing: {sources}")

        if negative:
            sources = ", ".join(a.source or "unknown" for a in negative[:3])
            lines.append(f"- Negative framing: {sources}")

        if neutral:
            sources = ", ".join(a.source or "unknown" for a in neutral[:3])
            lines.append(f"- Neutral coverage: {sources}")

        # Highlight specific framing differences
        all_keywords: set[str] = set()
        for profile in profiles.values():
            all_keywords.update(profile.framing_keywords)

        if all_keywords:
            lines.append(
                f"- Key framing terms used: {', '.join(sorted(all_keywords)[:5])}"
            )

        return "\n".join(lines)
