from __future__ import annotations

from pydantic import BaseModel


class Settings(BaseModel):
    # Pinecone
    pinecone_api_key: str | None = None
    pinecone_index: str | None = None

    # Optional: map region -> list of ISO country codes in your metadata.
    region_countries: dict[str, list[str]] = {
        "US": ["US"],
        "EU": [
            "AT",
            "BE",
            "BG",
            "HR",
            "CY",
            "CZ",
            "DK",
            "EE",
            "FI",
            "FR",
            "DE",
            "GR",
            "HU",
            "IE",
            "IT",
            "LV",
            "LT",
            "LU",
            "MT",
            "NL",
            "PL",
            "PT",
            "RO",
            "SK",
            "SI",
            "ES",
            "SE",
        ],
        "China": ["CN"],
        "India": ["IN"],
        "GlobalSouth": [
            # Heuristic bucket; adjust to match your dataset.
            "BR",
            "MX",
            "ZA",
            "NG",
            "ID",
            "PK",
            "BD",
            "KE",
            "EG",
            "AR",
            "CL",
            "CO",
            "PE",
            "PH",
            "VN",
        ],
    }


settings = Settings()
