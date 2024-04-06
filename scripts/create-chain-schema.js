import fs from 'fs'
import { zodToJsonSchema } from "zod-to-json-schema";
import {ChainMetadataSchemaObject} from "@hyperlane-xyz/sdk";

const schema = zodToJsonSchema(ChainMetadataSchemaObject, "hyperlaneChainMetadata");
const schemaStr = JSON.stringify(schema, null, 2);
fs.writeFileSync(`./chains/schema`, schemaStr, 'utf8');