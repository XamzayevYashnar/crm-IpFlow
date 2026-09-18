"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.10.0",
    "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../generated/prisma\"\n  moduleFormat = \"cjs\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nenum Role {\n  SUPER_ADMIN\n  ADMIN\n  STAFF\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n}\n\nmodel User {\n  id Int @id @default(autoincrement())\n\n  fullName String? @db.VarChar(100)\n  email    String  @unique @db.VarChar(254)\n  password String\n\n  role   Role\n  status UserStatus @default(INACTIVE)\n\n  hourlyPrice Decimal? @db.Decimal(12, 2)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"fullName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"UserStatus\"},{\"name\":\"hourlyPrice\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null,\"schema\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_avg\",\"_sum\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"fullName\",\"email\",\"password\",\"Role\",\"role\",\"UserStatus\",\"status\",\"hourlyPrice\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"set\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
    graph: "RgsQDBwAADIAMB0AAAQAEB4AADIAMB8CAAAAASABADQAISEBAAAAASIBADUAISQAADYkIiYAADcmIicQADgAIShAADkAISlAADkAIQEAAAABACABAAAAAQAgDBwAADIAMB0AAAQAEB4AADIAMB8CADMAISABADQAISEBADUAISIBADUAISQAADYkIiYAADcmIicQADgAIShAADkAISlAADkAIQIgAAA6ACAnAAA6ACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAJHwIAAAABIAEAAAABIQEAAAABIgEAAAABJAAAACQCJgAAACYCJxAAAAABKEAAAAABKUAAAAABAQgAAAkAIAkfAgAAAAEgAQAAAAEhAQAAAAEiAQAAAAEkAAAAJAImAAAAJgInEAAAAAEoQAAAAAEpQAAAAAEBCAAACwAwAQgAAAsAMAkfAgBGACEgAQBAACEhAQBBACEiAQBBACEkAABCJCImAABDJiInEABEACEoQABFACEpQABFACECAAAAAQAgCAAADgAgCR8CAEYAISABAEAAISEBAEEAISIBAEEAISQAAEIkIiYAAEMmIicQAEQAIShAAEUAISlAAEUAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBxUAADsAIBYAADwAIBcAAD8AIBgAAD4AIBkAAD0AICAAADoAICcAADoAIAwcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAdACEiAQAdACEkAAAeJCImAAAfJiInEAAgACEoQAAhACEpQAAhACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAwcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAdACEiAQAdACEkAAAeJCImAAAfJiInEAAgACEoQAAhACEpQAAhACENFQAAIwAgFgAAMQAgFwAAIwAgGAAAIwAgGQAAIwAgKgIAAAABKwIAAAAELAIAAAAELQIAAAABLgIAAAABLwIAAAABMAIAAAABMQIAMAAhDhUAACYAIBgAAC8AIBkAAC8AICoBAAAAASsBAAAABSwBAAAABS0BAAAAAS4BAAAA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"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map