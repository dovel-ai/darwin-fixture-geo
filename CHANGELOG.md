# Changelog

## v0.3.0 (2026-11-18)

### Breaking changes

- `Distance` has been renamed to `HaversineDistance` (`Distance` -> `HaversineDistance`); its behavior is unchanged.

## v0.2.0 (2026-11-18)

### Breaking changes

- The deprecated `Bearing` function has been removed; use `InitialBearing` instead (`Bearing` -> `InitialBearing`).

## v0.1.2 (2026-11-17)

### Added

- `InitialBearing`, which replaces `Bearing`.

### Deprecated

- `Bearing` is deprecated in favor of `InitialBearing` and will be removed in the next minor release.

## v0.1.1 (2026-11-17)

### Fixed

- Latitudes outside [-90, 90] are clamped before any calculation.

## v0.1.0

- First release: `Distance`, `Bearing`, `Midpoint`, `FormatPoint` and `ParsePoint`.
