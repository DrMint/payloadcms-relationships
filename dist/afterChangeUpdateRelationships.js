"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterChangeUpdateRelationships = void 0;
const RelationshipSet_1 = require("./RelationshipSet");
const payload_1 = __importDefault(require("payload"));
const utils_1 = require("./utils");
const afterChangeUpdateRelationships = (_a) => __awaiter(void 0, [_a], void 0, function* ({ collection, doc, }) {
    if ("_status" in doc && doc._status === "draft") {
        return doc;
    }
    const relationships = new RelationshipSet_1.RelationshipSet(...(0, utils_1.getRelationships)(doc, collection)).values;
    const id = (0, utils_1.getRelationId)(collection.slug, doc.id);
    if (relationships.length === 0)
        return doc;
    try {
        const existingEntry = yield (0, utils_1.findRelationByID)(collection.slug, doc.id);
        yield payload_1.default.update({
            collection: "relationships",
            id: existingEntry.id,
            data: { outgoingRelations: relationships },
        });
    }
    catch (_b) {
        yield payload_1.default.create({
            collection: "relationships",
            data: {
                id,
                document: {
                    relationTo: collection.slug,
                    value: doc.id,
                },
                outgoingRelations: relationships,
            },
        });
    }
});
exports.afterChangeUpdateRelationships = afterChangeUpdateRelationships;
