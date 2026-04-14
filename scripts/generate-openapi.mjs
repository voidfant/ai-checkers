import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import swaggerConfig from "../swagger.config.mjs";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");
const swaggerJsdoc = require("swagger-jsdoc");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "docs", "openapi.yaml");
const legacyJsonPath = path.join(projectRoot, "docs", "openapi.generated.json");

const resolvedConfig = {
  ...swaggerConfig,
  apis: swaggerConfig.apis.map((pattern) => path.join(projectRoot, pattern)),
};

const spec = swaggerJsdoc(resolvedConfig);

const yamlOutput = yaml.dump(spec, {
  noRefs: false,
  lineWidth: 120,
});

await fs.writeFile(outputPath, yamlOutput, "utf8");
await fs.rm(legacyJsonPath, { force: true });

console.log(`Generated OpenAPI spec: ${outputPath}`);
