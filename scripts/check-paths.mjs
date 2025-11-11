import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'swagger';
const OPENAPI = path.join(ROOT, 'openapi.yaml');
const PATHS_DIR = path.join(ROOT, 'paths');

function listAllPathFiles(dir) {
  const out = new Set(); // абсолютные пути
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && /\.ya?ml$/i.test(e.name))
        out.add(path.resolve(full));
    }
  })(dir);
  return out;
}

function loadYaml(p) {
  return yaml.load(fs.readFileSync(p, 'utf8'));
}

// собрать все $ref из openapi, которые указывают на ./paths/...
function listAllRefsToPaths(openapiAbs) {
  const spec = loadYaml(openapiAbs);
  const baseDir = path.dirname(openapiAbs);
  const refs = new Set();

  function addRef(refStr) {
    if (typeof refStr !== 'string') return;
    if (!refStr.startsWith('./paths/')) return;
    const fsPath = path.resolve(baseDir, refStr.replace(/^\.\/+/, ''));
    refs.add(fsPath);
  }

  const pathsObj = spec?.paths || {};
  for (const [, pathItem] of Object.entries(pathsObj)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    // $ref на уровне Path Item
    if ('$ref' in pathItem) addRef(pathItem['$ref']);

    // операции
    for (const m of [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'trace',
    ]) {
      const op = pathItem[m];
      if (!op || typeof op !== 'object') continue;
      if ('$ref' in op) addRef(op['$ref']);
    }
  }
  return refs;
}

function main() {
  if (!fs.existsSync(OPENAPI)) {
    console.error('❌ Не найден', OPENAPI);
    process.exit(1);
  }
  if (!fs.existsSync(PATHS_DIR)) {
    console.error('❌ Не найдена папка', PATHS_DIR);
    process.exit(1);
  }

  const allFiles = listAllPathFiles(PATHS_DIR); // всё, что лежит в ./paths
  const allRefs = listAllRefsToPaths(path.resolve(OPENAPI)); // всё, на что реально ссылаются из openapi

  let missingInSpec = 0;
  for (const f of allFiles) {
    if (!allRefs.has(f)) {
      console.log('❌ Не подключено в openapi.yaml:', path.relative('.', f));
      missingInSpec++;
    }
  }

  let brokenRefs = 0;
  for (const r of allRefs) {
    if (!fs.existsSync(r)) {
      console.log('❌ Битый $ref в openapi.yaml ->', path.relative('.', r));
      brokenRefs++;
    }
  }

  console.log('———');
  console.log(
    `Итог: не подключено файлов: ${missingInSpec}, битых $ref: ${brokenRefs}`,
  );

  if (missingInSpec || brokenRefs) process.exit(2);
  console.log(
    '✅ Всё, на что ссылается openapi.yaml, существует; лишних «висящих» файлов нет.',
  );
}

main();
