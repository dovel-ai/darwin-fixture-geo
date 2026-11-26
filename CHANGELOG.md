# Changelog

## v0.11.0 (2026-11-26)

### Breaking changes

- `InitialBearing` has been renamed to `Heading` (`InitialBearing` -> `Heading`); its behavior is unchanged.

## v0.10.0 (2026-11-26)

### Breaking changes

- The deprecated `Slerp` function has been removed; use `Lerp` instead (`Slerp` -> `Lerp`).

## v0.9.2 (2026-11-25)

### Added

- `Lerp`, which replaces `Slerp`.

### Deprecated

- `Slerp` is deprecated in favor of `Lerp` and will be removed in the next minor release.

## v0.9.1 (2026-11-25)

### Fixed

- Distances between identical points are exactly 0.

## v0.9.0 (2026-11-24)

### Breaking changes

- `Interpolate` has been renamed to `Slerp` (`Interpolate` -> `Slerp`); its behavior is unchanged.

## v0.8.0 (2026-11-24)

### Breaking changes

- The deprecated `Format` function has been removed; use `PointString` instead (`Format` -> `PointString`).

## v0.7.2 (2026-11-24)

### Added

- `PointString`, which replaces `Format`.

### Deprecated

- `Format` is deprecated in favor of `PointString` and will be removed in the next minor release.

## v0.7.1 (2026-11-23)

### Fixed

- Bearings are returned in [0, 360) instead of (-180, 180].

## v0.7.0 (2026-11-22)

### Breaking changes

- `FormatPoint` has been renamed to `Format` (`FormatPoint` -> `Format`); its behavior is unchanged.

## v0.6.0 (2026-11-22)

### Breaking changes

- The deprecated `ParsePoint` function has been removed; use `Parse` instead (`ParsePoint` -> `Parse`).

## v0.5.2 (2026-11-21)

### Added

- `Parse`, which replaces `ParsePoint`.

### Deprecated

- `ParsePoint` is deprecated in favor of `Parse` and will be removed in the next minor release.

## v0.5.1 (2026-11-21)

### Fixed

- Parsing accepts surrounding whitespace.

## v0.5.0 (2026-11-20)

### Breaking changes

- `Midpoint(a, b)` has been replaced by `Interpolate(a, b, fraction)` (`Midpoint` -> `Interpolate`): pass `0.5` as `fraction` for the point halfway between `a` and `b`, as `Midpoint` returned.

## v0.4.0 (2026-11-20)

### Breaking changes

- The deprecated `HaversineDistance` function has been removed; use `GreatCircleDistance` instead (`HaversineDistance` -> `GreatCircleDistance`).

## v0.3.2 (2026-11-19)

### Added

- `GreatCircleDistance`, which replaces `HaversineDistance`.

### Deprecated

- `HaversineDistance` is deprecated in favor of `GreatCircleDistance` and will be removed in the next minor release.

## v0.3.1 (2026-11-19)

### Fixed

- Longitudes are normalized to (-180, 180] so points across the antimeridian compare equal.

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
