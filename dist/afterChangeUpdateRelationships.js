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
exports.isPayloadType = exports.afterChangeUpdateRelationships = void 0;
const RelationshipSet_1 = require("./RelationshipSet");
const payload_1 = __importDefault(require("payload"));
const utils_1 = require("./utils");
const afterChangeUpdateRelationships = (_a) => __awaiter(void 0, [_a], void 0, function* ({ collection, doc, }) {
    if ("_status" in doc && doc._status === "draft") {
        return doc;
    }
    const relationships = new RelationshipSet_1.RelationshipSet(...getRelationships(doc, collection)).values;
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
const getRelationships = (doc, collection) => {
    const relationships = [];
    collection.fields.forEach((field) => {
        switch (field.type) {
            case "upload": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                relationships.push({
                    relationTo: field.relationTo,
                    value: (0, exports.isPayloadType)(fieldValue) ? fieldValue.id : fieldValue,
                });
                break;
            }
            case "relationship": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                // Relation to only one collection
                if (typeof field.relationTo === "string") {
                    const relationTo = field.relationTo;
                    if (field.hasMany) {
                        fieldValue.forEach((value) => relationships.push({
                            relationTo,
                            value: (0, exports.isPayloadType)(value) ? value.id : value,
                        }));
                    }
                    else {
                        relationships.push({
                            relationTo,
                            value: fieldValue,
                        });
                    }
                    // Polymorphic relational field
                }
                else {
                    if (field.hasMany) {
                        fieldValue.forEach(({ relationTo, value }) => relationships.push({
                            relationTo,
                            value: (0, exports.isPayloadType)(value) ? value.id : value,
                        }));
                    }
                    else {
                        relationships.push(fieldValue);
                    }
                }
                break;
            }
            case "array": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                fieldValue.forEach((value) => {
                    relationships.push(...getRelationships(value, field));
                });
                break;
            }
            case "collapsible":
            case "row": {
                relationships.push(...getRelationships(doc, field));
                break;
            }
            case "group": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                relationships.push(...getRelationships(fieldValue, field));
                break;
            }
            case "blocks": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                field.blocks.forEach((block) => {
                    const blockConfig = field.blocks.find(({ slug }) => slug === block.slug);
                    if (!blockConfig) {
                        console.warn("Something's wrong");
                        return;
                    }
                    relationships.push(...getRelationships(block, blockConfig));
                });
                break;
            }
            case "tabs": {
                field.tabs.forEach((tab) => {
                    relationships.push(...getRelationships(doc, tab));
                });
                break;
            }
            case "richText": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                relationships.push(...getRichTextRelationships(fieldValue, field));
                break;
            }
            // These fields can't hold relationships.
            case "checkbox":
            case "point":
            case "number":
            case "code":
            case "date":
            case "email":
            case "json":
            case "radio":
            case "select":
            case "textarea":
            case "text":
            case "ui":
                break;
        }
    });
    return relationships;
};
const getRichTextRelationships = (content, config) => {
    const getNodeRelationships = (node) => {
        switch (node.type) {
            case "upload":
            case "relationship":
                return [
                    {
                        relationTo: node.relationTo,
                        value: (0, exports.isPayloadType)(node.value) ? node.value.id : node.value,
                    },
                ];
            case "list":
            case "listitem":
            case "paragraph":
                return node.children.flatMap(getNodeRelationships);
            case "link": {
                if (node.fields.linkType === "internal") {
                    return [
                        {
                            relationTo: node.fields.doc.relationTo,
                            value: (0, exports.isPayloadType)(node.fields.doc.value)
                                ? node.fields.doc.value.id
                                : node.fields.doc.value,
                        },
                    ];
                }
                break;
            }
            case "block": {
                const blocksConfig = config.editor.editorConfig.resolvedFeatureMap.get("blocks");
                if (!blocksConfig)
                    return [];
                const blocks = blocksConfig.props.blocks;
                const block = blocks.find((block) => block.slug === node.fields.blockType);
                if (!block)
                    return [];
                return getRelationships(node.fields, block);
                break;
            }
            case "text":
            case "autolink":
            case "tab":
            case "linebreak":
            default:
                break;
        }
        return [];
    };
    return content.root.children.flatMap(getNodeRelationships);
};
const isPayloadType = (value) => typeof value === "object";
exports.isPayloadType = isPayloadType;
