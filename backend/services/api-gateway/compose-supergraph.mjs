import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeServices } from '@apollo/composition';
import { parse } from 'graphql';
import YAML from 'yaml';

const baseDir = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(baseDir, 'supergraph.yaml');
const outputPath = resolve(baseDir, 'supergraph.graphql');
const checkOnly = process.argv.includes('--check');

const config = YAML.parse(readFileSync(configPath, 'utf8'));

const services = Object.entries(config.subgraphs).map(([name, subgraph]) => ({
  name,
  url: subgraph.routing_url,
  typeDefs: parse(readFileSync(resolve(baseDir, subgraph.schema.file), 'utf8')),
}));

const result = composeServices(services);

if (result.errors?.length) {
  for (const error of result.errors) {
    console.error(error.message);
  }
  process.exit(1);
}

for (const hint of result.hints ?? []) {
  console.warn(`hint: ${hint.definition.code}: ${hint.message}`);
}

const supergraph = `${result.supergraphSdl.trim()}\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n');
  if (current !== supergraph) {
    console.error('supergraph.graphql is out of date. Run npm run compose.');
    process.exit(1);
  }
  console.log('supergraph.graphql is up to date.');
} else {
  writeFileSync(outputPath, supergraph);
  console.log(`Composed ${services.length} subgraphs into supergraph.graphql`);
}
