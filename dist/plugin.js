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
exports.relationshipsPlugin = void 0;
const afterChangeUpdateRelationships_1 = require("./afterChangeUpdateRelationships");
const payload_1 = __importDefault(require("payload"));
/**
 * PayloadCMS Relationships plugin. This plugin adds a new "relationships" collection which holds all the relationships found in all your collections' documents.
 * This plugin makes it easier to list all incoming and outgoing relationships for a given document.
 */
const relationshipsPlugin = (params) => (config) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { collectionConfig, enabled = true, rebuildOnInit } = params;
    if (!enabled)
        return config;
    const managedCollections = (_c = (_a = params.managedCollections) !== null && _a !== void 0 ? _a : (_b = config.collections) === null || _b === void 0 ? void 0 : _b.map(({ slug }) => slug)) !== null && _c !== void 0 ? _c : [];
    const relationshipsCollection = Object.assign(Object.assign({}, collectionConfig), { slug: "relationships", timestamps: (_d = collectionConfig === null || collectionConfig === void 0 ? void 0 : collectionConfig.timestamps) !== null && _d !== void 0 ? _d : false, admin: Object.assign(Object.assign({}, collectionConfig === null || collectionConfig === void 0 ? void 0 : collectionConfig.admin), { group: (_f = (_e = collectionConfig === null || collectionConfig === void 0 ? void 0 : collectionConfig.admin) === null || _e === void 0 ? void 0 : _e.group) !== null && _f !== void 0 ? _f : "Plugins" }), fields: [
            {
                name: "id",
                type: "text",
                required: true,
                unique: true,
            },
            {
                name: "document",
                type: "relationship",
                index: true,
                required: true,
                unique: true,
                relationTo: managedCollections,
            },
            {
                name: "incomingRelations",
                type: "relationship",
                hasMany: true,
                relationTo: managedCollections,
                admin: { readOnly: true },
                hooks: {
                    beforeChange: [
                        ({ siblingData }) => {
                            delete siblingData.incomingRelations;
                        },
                    ],
                    afterRead: [
                        (_j) => __awaiter(void 0, [_j], void 0, function* ({ data, context }) {
                            if (context.stopPropagation || data === undefined) {
                                return [];
                            }
                            const document = data.document;
                            const result = yield payload_1.default.find({
                                collection: "relationships",
                                where: {
                                    and: [
                                        {
                                            "outgoingRelations.relationTo": {
                                                equals: document.relationTo,
                                            },
                                        },
                                        {
                                            "outgoingRelations.value": {
                                                equals: typeof document.value === "object"
                                                    ? document.value.id
                                                    : document.value,
                                            },
                                        },
                                    ],
                                },
                                pagination: false,
                                depth: 0,
                                context: { stopPropagation: true },
                            });
                            return result.docs.map((doc) => doc.document);
                        }),
                    ],
                },
            },
            {
                name: "outgoingRelations",
                type: "relationship",
                hasMany: true,
                minRows: 1,
                required: true,
                relationTo: managedCollections,
            },
        ] });
    const afterChangeHook = ({ collection, doc }) => (0, afterChangeUpdateRelationships_1.afterChangeUpdateRelationships)({ collection, doc });
    const collections = (_h = (_g = config.collections) === null || _g === void 0 ? void 0 : _g.map((collection) => {
        var _a, _b;
        return (Object.assign(Object.assign({}, collection), { hooks: Object.assign(Object.assign({}, collection.hooks), { afterChange: [
                    ...((_b = (_a = collection.hooks) === null || _a === void 0 ? void 0 : _a.afterChange) !== null && _b !== void 0 ? _b : []),
                    ...(collection.slug in managedCollections ? [afterChangeHook] : []),
                ] }) }));
    })) !== null && _h !== void 0 ? _h : [];
    return Object.assign(Object.assign({}, config), { collections: [...collections, relationshipsCollection], onInit: (payload) => __awaiter(void 0, void 0, void 0, function* () {
            var _k;
            yield ((_k = config.onInit) === null || _k === void 0 ? void 0 : _k.call(config, payload));
            if (rebuildOnInit === false)
                return;
            if (rebuildOnInit === undefined) {
                const firstRelationship = yield payload.find({
                    collection: "relationships",
                    limit: 1,
                });
                if (firstRelationship.docs.length > 0)
                    return;
            }
            console.log("[payloadcms-relationships] Rebuilding on init...");
            // Delete all existing relationships
            yield payload.delete({
                collection: "relationships",
                where: { id: { exists: true } },
            });
            // For each collection
            managedCollections.forEach((collection) => __awaiter(void 0, void 0, void 0, function* () {
                var _l;
                const config = (_l = payload.collections[collection]) === null || _l === void 0 ? void 0 : _l.config;
                if (!config)
                    return;
                const result = yield payload.find({
                    collection: collection,
                    depth: 0,
                    pagination: false,
                });
                // For each doc in that collection
                for (const doc of result.docs) {
                    yield (0, afterChangeUpdateRelationships_1.afterChangeUpdateRelationships)({
                        collection: config,
                        doc,
                    });
                }
            }));
            console.log("[payloadcms-relationships] Rebuilding on init completed!");
        }) });
};
exports.relationshipsPlugin = relationshipsPlugin;
