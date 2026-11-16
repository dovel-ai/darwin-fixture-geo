// The next release of this fixture library, on a schedule: a fix, a deprecation, the removal of what was
// deprecated, a rename, and once a signature change. Each is a real, tagged Go module release with notes worded as
// libraries word them, so Darwin, watching a repository that depends on this module, has real API changes to find,
// migrate or hold. State lives in api.json; geo.go and geo_test.go are rendered from it.
//
//   node .github/fixture/release-next.mjs [--dry-run]   -> edits the files, prints the version and notes as JSON
//
// The workflow commits, tags and publishes the release with what this prints.
import { readFileSync, writeFileSync } from 'node:fs'

const STATE = 'api.json'
const state = JSON.parse(readFileSync(STATE, 'utf8'))

// Names a function of each kind may take, in order; a rename takes the next one not in use.
const NAMES = {
  distance: ['Distance', 'HaversineDistance', 'GreatCircleDistance', 'DistanceKm', 'Dist'],
  bearing: ['Bearing', 'InitialBearing', 'Heading', 'Course', 'Azimuth'],
  // After the signature change (Interpolate, three arguments) a rename takes the names after it, never a two-argument one's.
  midpoint: ['Midpoint', 'MidPoint', 'Center', 'Between', 'Halfway', 'Interpolate', 'Slerp', 'Lerp', 'Blend'],
  format: ['FormatPoint', 'Format', 'PointString', 'Render', 'Encode'],
  parse: ['ParsePoint', 'Parse', 'PointFromString', 'Decode', 'ReadPoint'],
}
const KINDS = Object.keys(NAMES)
const FIXES = [
  'latitudes outside [-90, 90] are clamped before any calculation',
  'longitudes are normalized to (-180, 180] so points across the antimeridian compare equal',
  'parsing accepts surrounding whitespace',
  'bearings are returned in [0, 360) instead of (-180, 180]',
  'distances between identical points are exactly 0',
]
// The order of changes: first a full cycle with a signature change, then the four-step cycle for ever.
const FIRST = ['fix', 'deprecate', 'remove', 'rename', 'fix', 'deprecate', 'remove', 'signature']
const CYCLE = ['fix', 'deprecate', 'remove', 'rename']
// --render: geo.go and geo_test.go for the current state, no release (the first commit).
const renderOnly = process.argv.includes('--render')
const op = renderOnly ? 'render' : state.step < FIRST.length ? FIRST[state.step] : CYCLE[(state.step - FIRST.length) % CYCLE.length]
const kindAt = offset => KINDS[(state.step + offset) % KINDS.length]
const live = () => state.functions.filter(fn => fn.deprecatedFor === undefined)
const nextName = kind => {
  const used = new Set(state.functions.map(fn => fn.name))
  const fn = state.functions.find(item => item.kind === kind && item.deprecatedFor === undefined)
  const names = kind !== 'midpoint' ? NAMES[kind] : fn.arity === 3 ? NAMES.midpoint.slice(5) : NAMES.midpoint.slice(0, 5)
  const current = names.indexOf(fn.name)
  for (let i = 1; i <= names.length; i += 1) {
    const name = names[(current + i) % names.length]
    if (!used.has(name)) return name
  }
  throw new Error(`no free name for ${kind}`)
}
const [major, minor, patch] = state.version.split('.').map(Number)
let version
const notes = []
const marker = { op }

if (op === 'fix') {
  version = `${major}.${minor}.${patch + 1}`
  const fix = FIXES[state.fixes % FIXES.length]
  state.fixes += 1
  notes.push('### Fixed', '', `- ${fix[0].toUpperCase()}${fix.slice(1)}.`)
} else if (op === 'deprecate') {
  // A function gets a new name beside the old one, which stays, deprecated (a patch: nothing breaks).
  const kind = kindAt(0)
  const old = live().find(fn => fn.kind === kind)
  const name = nextName(kind)
  state.functions.push({ ...old, name })
  old.deprecatedFor = name
  version = `${major}.${minor}.${patch + 1}`
  notes.push('### Added', '', `- \`${name}\`, which replaces \`${old.name}\`.`, '', '### Deprecated', '', `- \`${old.name}\` is deprecated in favor of \`${name}\` and will be removed in the next minor release.`)
  Object.assign(marker, { kind, old: old.name, new: name, breaking: false })
} else if (op === 'remove') {
  // What the last deprecation kept is removed (a minor release of a 0.x module: a breaking one).
  const gone = state.functions.filter(fn => fn.deprecatedFor !== undefined)
  state.functions = state.functions.filter(fn => fn.deprecatedFor === undefined)
  version = `${major}.${minor + 1}.0`
  notes.push('### Breaking changes', '', ...gone.map(fn => `- The deprecated \`${fn.name}\` function has been removed; use \`${fn.deprecatedFor}\` instead (\`${fn.name}\` -> \`${fn.deprecatedFor}\`).`))
  Object.assign(marker, { removed: gone.map(fn => ({ old: fn.name, new: fn.deprecatedFor })), breaking: true })
} else if (op === 'rename') {
  const kind = kindAt(2)
  const fn = state.functions.find(item => item.kind === kind)
  const old = fn.name
  fn.name = nextName(kind)
  version = `${major}.${minor + 1}.0`
  notes.push('### Breaking changes', '', `- \`${old}\` has been renamed to \`${fn.name}\` (\`${old}\` -> \`${fn.name}\`); its behavior is unchanged.`)
  Object.assign(marker, { kind, old, new: fn.name, breaking: true })
} else if (op === 'signature') {
  // The midpoint becomes an interpolation: a new name and a third argument (0.5 keeps the old result).
  const fn = state.functions.find(item => item.kind === 'midpoint')
  const old = fn.name
  fn.name = 'Interpolate'
  fn.arity = 3
  version = `${major}.${minor + 1}.0`
  notes.push('### Breaking changes', '', `- \`${old}(a, b)\` has been replaced by \`Interpolate(a, b, fraction)\` (\`${old}\` -> \`Interpolate\`): pass \`0.5\` as \`fraction\` for the point halfway between \`a\` and \`b\`, as \`${old}\` returned.`)
  Object.assign(marker, { kind: 'midpoint', old, new: 'Interpolate', breaking: true, signature: true })
}

if (!renderOnly) {
  state.version = version
  state.step += 1
}

const BODY = {
  distance: name => `func ${name}(a, b Point) float64 { return haversine(a, b) }`,
  bearing: name => `func ${name}(a, b Point) float64 { return initialBearing(a, b) }`,
  midpoint: (name, arity) => arity === 3
    ? `func ${name}(a, b Point, fraction float64) Point { return interpolate(a, b, fraction) }`
    : `func ${name}(a, b Point) Point { return interpolate(a, b, 0.5) }`,
  format: name => `func ${name}(p Point) string { return formatPoint(p) }`,
  parse: name => `func ${name}(s string) (Point, error) { return parsePoint(s) }`,
}
const DOC = {
  distance: () => 'returns the great-circle distance between a and b in kilometres.',
  bearing: () => 'returns the initial bearing from a to b in degrees.',
  midpoint: arity => arity === 3
    ? 'returns the point on the great circle from a to b at the given fraction (0.5: halfway).'
    : 'returns the point halfway between a and b on the great circle.',
  format: () => 'formats p as "lat,lon" with five decimals.',
  parse: () => 'reads a point written as "lat,lon".',
}
const lines = ['// Code generated by .github/fixture/release-next.mjs from api.json. DO NOT EDIT.', '', 'package geo', '']
for (const fn of state.functions) {
  lines.push(`// ${fn.name} ${DOC[fn.kind](fn.arity)}`)
  if (fn.deprecatedFor !== undefined) lines.push('//', `// Deprecated: use ${fn.deprecatedFor}.`)
  lines.push(BODY[fn.kind](fn.name, fn.arity), '')
}
writeFileSync('geo.go', `${lines.join('\n').trimEnd()}\n`)

const call = fn => ({
  distance: `if d := ${fn.name}(Point{Lat: 52.52, Lon: 13.405}, Point{Lat: 48.8566, Lon: 2.3522}); d < 870 || d > 885 {\n\t\tt.Fatalf("${fn.name}: %v", d)\n\t}`,
  bearing: `if b := ${fn.name}(Point{Lat: 0, Lon: 0}, Point{Lat: 0, Lon: 10}); b < 89.9 || b > 90.1 {\n\t\tt.Fatalf("${fn.name}: %v", b)\n\t}`,
  midpoint: `if m := ${fn.name}(Point{Lat: 0, Lon: 0}, Point{Lat: 0, Lon: 10}${fn.arity === 3 ? ', 0.5' : ''}); m.Lon < 4.99 || m.Lon > 5.01 {\n\t\tt.Fatalf("${fn.name}: %v", m)\n\t}`,
  format: `if s := ${fn.name}(Point{Lat: 1.5, Lon: -2.25}); s != "1.50000,-2.25000" {\n\t\tt.Fatalf("${fn.name}: %q", s)\n\t}`,
  parse: `if p, err := ${fn.name}(" 1.5,-2.25 "); err != nil || p.Lat != 1.5 || p.Lon != -2.25 {\n\t\tt.Fatalf("${fn.name}: %v %v", p, err)\n\t}`,
}[fn.kind])
const tests = ['// Code generated by .github/fixture/release-next.mjs from api.json. DO NOT EDIT.', '', 'package geo', '', 'import "testing"', '']
for (const fn of state.functions) tests.push(`func Test${fn.name}${fn.deprecatedFor === undefined ? '' : 'Deprecated'}(t *testing.T) {`, `\t${call(fn)}`, '}', '')
writeFileSync('geo_test.go', `${tests.join('\n').trimEnd()}\n`)

if (renderOnly) process.exit(0)
const date = new Date().toISOString().slice(0, 10)
const changelog = readFileSync('CHANGELOG.md', 'utf8')
const entry = `## v${version} (${date})\n\n${notes.join('\n')}\n`
writeFileSync('CHANGELOG.md', changelog.replace(/^(# Changelog\n\n)/u, `$1${entry}\n`))
if (!process.argv.includes('--dry-run')) writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`)
// The fixture watcher reads what each release changed from this marker in its notes.
process.stdout.write(JSON.stringify({ version: `v${version}`, op, notes: `${notes.join('\n')}\n\n<!-- darwin-fixture ${JSON.stringify(marker)} -->\n` }))
