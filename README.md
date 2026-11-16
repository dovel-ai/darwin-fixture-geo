# darwin-fixture-geo

A small great-circle geometry library for Go, and a **Darwin test fixture**: every 12 hours its
[release cycle](.github/workflows/release-cycle.yml) publishes the next release (a fix, a deprecation, the removal of
what was deprecated, a rename, and once a signature change) as a tagged module release with notes. The API changes
are real: [darwin-fixture-app](https://github.com/dovel-ai/darwin-fixture-app) depends on this module, and Darwin,
watching that repository, should find each change and propose the update (migrating the call sites for a breaking
one) or hold it with the reason.

`api.json` is the state; `geo.go` and `geo_test.go` are generated from it. Do not edit them by hand.
