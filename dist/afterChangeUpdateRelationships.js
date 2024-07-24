"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterChangeUpdateRelationships = void 0;
const payload_1 = __importDefault(require("payload"));
const utils_1 = require("./utils");
const afterChangeUpdateRelationships = async ({ collection, doc, onOutgoingRelationRemoved, }) => {
    if ("_status" in doc && doc._status === "draft") {
        return doc;
    }
    const relationships = (0, utils_1.uniqueBy)((0, utils_1.getRelationships)(doc, collection), ({ value }) => value);
    const id = (0, utils_1.getRelationId)(collection.slug, doc.id);
    try {
        const existingEntry = await (0, utils_1.findRelationByID)(collection.slug, doc.id);
        const removedOutgoingRelations = (existingEntry.outgoingRelations ?? []).filter(({ relationTo, value }) => !relationships.some((newRelation) => {
            if (newRelation.relationTo !== relationTo)
                return false;
            const id = (0, utils_1.isPayloadType)(value) ? value.id : value;
            const newId = (0, utils_1.isPayloadType)(newRelation.value)
                ? newRelation.value.id
                : newRelation.value;
            return id === newId;
        }));
        if (removedOutgoingRelations.length > 0) {
            await onOutgoingRelationRemoved?.({
                id: existingEntry.id,
                document: existingEntry.document,
                removedOutgoingRelations,
            });
        }
        await payload_1.default.update({
            collection: "relationships",
            id: existingEntry.id,
            data: { outgoingRelations: relationships },
        });
    }
    catch {
        await payload_1.default.create({
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
};
exports.afterChangeUpdateRelationships = afterChangeUpdateRelationships;
