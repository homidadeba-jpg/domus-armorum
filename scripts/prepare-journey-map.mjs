import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';

// Build-time cartography. The website ships only SVG path data, no mapping runtime or external requests.
const source = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const cached = process.argv[2];
const world = JSON.parse(cached ? await readFile(cached, 'utf8') : await (await fetch(source)).text());
const projection = geoOrthographic().rotate([22, -12, 0]).translate([500, 367]).scale(322).precision(.3);
const path = geoPath(projection).digits(2);
const origin = [-53.4552, -24.9555]; // Cascavel, Paraná; city-level marker only.
const destination = [12.5, 42.5]; // Italy; a country connection, not a disclosed partner location.
const [ox, oy] = projection(origin).map(n => +n.toFixed(2));
const [dx, dy] = projection(destination).map(n => +n.toFixed(2));
// An explicitly illustrative raised connection, not a flight route or an itinerary.
const route = 'M' + ox + ',' + oy + 'C' + (ox - 12) + ',' + (oy - 172) + ' ' + (dx - 210) + ',' + (dy + 48) + ' ' + dx + ',' + dy;
const output = {
  source,
  license: 'Natural Earth public domain: https://www.naturalearthdata.com/about/terms-of-use/',
  sphere: path({ type: 'Sphere' }),
  graticule: path(geoGraticule10()),
  countries: world.features.map(feature => ({
    name: feature.properties.ADMIN,
    code: feature.properties.ADM0_A3,
    path: path(feature),
  })).filter(feature => feature.path),
  route,
  origin: projection(origin).map(n => +n.toFixed(2)),
  destination: projection(destination).map(n => +n.toFixed(2)),
};
await mkdir('src/data', { recursive: true });
await writeFile('src/data/journey-map.json', JSON.stringify(output));
console.log('Prepared journey map: ' + output.countries.length + ' visible country shapes.');
