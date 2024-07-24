"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueBy = exports.isPayloadType = exports.getRelationships = exports.findOutgoingRelationships = exports.findIncomingRelationships = exports.findRelationByID = exports.getRelationId = void 0;
const payload_1 = __importDefault(require("payload"));
const getRelationId = (collection, id) => `${collection}_${id}`;
exports.getRelationId = getRelationId;
const findRelationByID = (collection, id) => {
    return payload_1.default.findByID({
        collection: "relationships",
        id: (0, exports.getRelationId)(collection, id),
    });
};
exports.findRelationByID = findRelationByID;
const findIncomingRelationships = async (collection, id) => {
    try {
        const { incomingRelations } = await (0, exports.findRelationByID)(collection, id);
        return incomingRelations ?? [];
    }
    catch {
        return [];
    }
};
exports.findIncomingRelationships = findIncomingRelationships;
const findOutgoingRelationships = async (collection, id) => {
    try {
        const { outgoingRelations } = await (0, exports.findRelationByID)(collection, id);
        return outgoingRelations;
    }
    catch {
        return [];
    }
};
exports.findOutgoingRelationships = findOutgoingRelationships;
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
                    relationships.push(...(0, exports.getRelationships)(value, field));
                });
                break;
            }
            case "collapsible":
            case "row": {
                relationships.push(...(0, exports.getRelationships)(doc, field));
                break;
            }
            case "group": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                relationships.push(...(0, exports.getRelationships)(fieldValue, field));
                break;
            }
            case "blocks": {
                const fieldValue = doc[field.name];
                if (!fieldValue)
                    return;
                fieldValue.forEach((block) => {
                    const blockConfig = field.blocks.find(({ slug }) => slug === block.blockType);
                    if (!blockConfig) {
                        return;
                    }
                    relationships.push(...(0, exports.getRelationships)(block, blockConfig));
                });
                break;
            }
            case "tabs": {
                field.tabs.forEach((tab) => {
                    relationships.push(...(0, exports.getRelationships)(doc, tab));
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
exports.getRelationships = getRelationships;
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
                return (0, exports.getRelationships)(node.fields, block);
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
const uniqueBy = (array, getKey) => {
    const alreadyFoundKeys = [];
    return array.filter((item) => {
        var currentItemKey = getKey(item);
        if (alreadyFoundKeys.includes(currentItemKey))
            return false;
        alreadyFoundKeys.push(currentItemKey);
        return true;
    });
};
exports.uniqueBy = uniqueBy;
