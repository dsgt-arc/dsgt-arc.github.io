#!/usr/bin/env -S uv run --script
# /// script
# dependencies = [
#   "jsonschema>=4.25.1",
#   "PyYAML>=6.0.2",
# ]
# ///

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
import sys

import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
PUBLICATIONS_DIR = ROOT / "data" / "publications"
VENUES_DIR = ROOT / "data" / "venues"
AUTHORS_FILE = ROOT / "data" / "authors.yml"
SCHEMAS_DIR = ROOT / "schemas"


@dataclass
class ValidationErrorRecord:
    path: Path
    message: str


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def load_validator(path: Path) -> Draft202012Validator:
    schema = load_yaml(path)
    return Draft202012Validator(schema, format_checker=FormatChecker())


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def validate_entity(validator: Draft202012Validator, data, path: Path, errors: list[ValidationErrorRecord], prefix: str = "") -> None:
    for err in validator.iter_errors(data):
        location = list(err.path)
        dotted = "".join(f"[{part}]" if isinstance(part, int) else f".{part}" for part in location)
        errors.append(
            ValidationErrorRecord(
                path=path,
                message=f"{prefix}{dotted or ''}: {err.message}",
            )
        )


def main() -> int:
    errors: list[ValidationErrorRecord] = []

    publication_validator = load_validator(SCHEMAS_DIR / "publication.schema.yml")
    venue_validator = load_validator(SCHEMAS_DIR / "venue.schema.yml")
    author_validator = load_validator(SCHEMAS_DIR / "author.schema.yml")

    publication_files = sorted(PUBLICATIONS_DIR.glob("*.yml"))
    venue_files = sorted(VENUES_DIR.glob("*.yml"))

    # Validate and load the authors lookup table.
    authors_data = load_yaml(AUTHORS_FILE)
    validate_entity(author_validator, authors_data, AUTHORS_FILE, errors)
    known_author_slugs: set[str] = set(authors_data.keys()) if isinstance(authors_data, dict) else set()

    publication_stems = {path.stem for path in publication_files}
    venue_stems = {path.stem for path in venue_files}

    missing_venues = sorted(publication_stems - venue_stems)
    missing_publications = sorted(venue_stems - publication_stems)

    for stem in missing_venues:
        errors.append(
            ValidationErrorRecord(
                path=PUBLICATIONS_DIR / f"{stem}.yml",
                message=f"missing matching venue metadata file: data/venues/{stem}.yml",
            )
        )

    for stem in missing_publications:
        errors.append(
            ValidationErrorRecord(
                path=VENUES_DIR / f"{stem}.yml",
                message=f"missing matching publications file: data/publications/{stem}.yml",
            )
        )

    venues_by_stem: dict[str, dict] = {}

    for venue_path in venue_files:
        stem = venue_path.stem
        venue = load_yaml(venue_path)
        validate_entity(venue_validator, venue, venue_path, errors)

        if not isinstance(venue, dict):
            errors.append(ValidationErrorRecord(venue_path, "root value must be a mapping/object"))
            continue

        venues_by_stem[stem] = venue

        if venue.get("key") != stem:
            errors.append(ValidationErrorRecord(venue_path, f"key must match filename stem '{stem}'"))

        year = venue.get("year")
        if isinstance(year, int) and not stem.endswith(str(year)):
            errors.append(ValidationErrorRecord(venue_path, f"year {year} does not match filename stem '{stem}'"))

        start_date = venue.get("start_date")
        end_date = venue.get("end_date")
        if isinstance(start_date, str) and isinstance(end_date, str):
            try:
                if parse_date(start_date) > parse_date(end_date):
                    errors.append(ValidationErrorRecord(venue_path, "start_date must be on or before end_date"))
            except ValueError as exc:
                errors.append(ValidationErrorRecord(venue_path, f"invalid ISO date: {exc}"))

    for publication_path in publication_files:
        stem = publication_path.stem
        publications = load_yaml(publication_path)

        if not isinstance(publications, list):
            errors.append(ValidationErrorRecord(publication_path, "root value must be a list of publication objects"))
            continue

        venue = venues_by_stem.get(stem)
        for idx, publication in enumerate(publications):
            validate_entity(publication_validator, publication, publication_path, errors, prefix=f"entry {idx}")

            if not isinstance(publication, dict):
                errors.append(ValidationErrorRecord(publication_path, f"entry {idx}: publication must be an object"))
                continue

            for slug in publication.get("authors") or []:
                if isinstance(slug, str) and slug not in known_author_slugs:
                    errors.append(
                        ValidationErrorRecord(
                            publication_path,
                            f"entry {idx}: unknown author slug '{slug}' — add it to data/authors.yml",
                        )
                    )

            if venue:
                if publication.get("year") != venue.get("year"):
                    errors.append(
                        ValidationErrorRecord(
                            publication_path,
                            f"entry {idx}: year {publication.get('year')} does not match venue year {venue.get('year')}",
                        )
                    )
                if publication.get("short_venue") != venue.get("short_name"):
                    errors.append(
                        ValidationErrorRecord(
                            publication_path,
                            f"entry {idx}: short_venue {publication.get('short_venue')!r} does not match venue short_name {venue.get('short_name')!r}",
                        )
                    )
                if publication.get("venue") != venue.get("name"):
                    errors.append(
                        ValidationErrorRecord(
                            publication_path,
                            f"entry {idx}: venue {publication.get('venue')!r} does not match venue name {venue.get('name')!r}",
                        )
                    )

    if errors:
        print("Data validation failed:\n", file=sys.stderr)
        for error in errors:
            rel = error.path.relative_to(ROOT)
            print(f"- {rel}: {error.message}", file=sys.stderr)
        return 1

    print("Data validation passed.")
    print(f"- publication files: {len(publication_files)}")
    print(f"- venue files: {len(venue_files)}")
    print(f"- authors: {len(known_author_slugs)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
