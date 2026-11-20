import {guardRequest} from '../app/lib/domain-system/guard';

type Want = 'allow' | 'block' | 'redirect';
const cases: [string, string, Want][] = [
  ['ecombio.com', '/', 'allow'],
  ['ecombio.com', '/en-us', 'allow'],
  ['ecombio.com', '/en-us/products/x', 'allow'],
  ['ecombio.com', '/en-us/cart', 'allow'],
  ['ecombio.com', '/cart', 'allow'],
  ['ecombio.com', '/search', 'allow'],
  ['ecombio.com', '/home', 'redirect'],
  ['ecombio.com', '/nope', 'block'],
  ['ecombio.com', '/en-us/nope', 'block'],
  ['www.ecombio.com', '/', 'allow'],
  ['bicyclebio.com', '/', 'allow'],
  ['bicyclebio.com', '/en-us', 'allow'],
  ['bicyclebio.com', '/en-us/products/x', 'block'],
  ['hydrogen-test.bicyclebio.com', '/nope', 'allow'],
  ['hydrogen-test.skaterbio.com', '/en-us/products/x', 'allow'],
  ['site-4f18851d6ef40de010df.o2.myshopify.dev', '/nope', 'allow'],
  ['checkout.ecombio.com', '/', 'block'],
  ['evil.example.com', '/', 'block'],
];

let bad = 0;
for (const [host, path, want] of cases) {
  const r = guardRequest(new Request(`https://${host}${path}`));
  const got: Want = r.ok ? 'allow' : r.response.status === 404 ? 'block' : 'redirect';
  const pass = got === want;
  if (!pass) bad++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${host.padEnd(44)} ${path.padEnd(20)} want=${want} got=${got}`);
}
console.log(bad ? `\n${bad} FAILED` : '\nALL PASSED');
process.exit(bad ? 1 : 0);


