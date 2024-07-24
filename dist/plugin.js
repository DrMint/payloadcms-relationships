"use strict";
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
    const { collectionConfig, enabled = true, rebuildOnInit } = params;
    if (!enabled)
        return config;
    const managedCollections = params.managedCollections ??
        config.collections?.map(({ slug }) => slug) ??
        [];
    const relationshipsCollection = {
        ...collectionConfig,
        slug: "relationships",
        timestamps: collectionConfig?.timestamps ?? false,
        admin: {
            ...collectionConfig?.admin,
            group: collectionConfig?.admin?.group ?? "Plugins",
        },
        fields: [
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
                        async ({ data, context }) => {
                            if (context.stopPropagation || data === undefined) {
                                return [];
                            }
                            const document = data.document;
                            const result = await payload_1.default.find({
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
                        },
                    ],
                },
            },
            {
                name: "outgoingRelations",
                type: "relationship",
                admin: { readOnly: true },
                hasMany: true,
                minRows: 1,
                required: true,
                relationTo: managedCollections,
            },
        ],
    };
    const afterChangeHook = ({ collection, doc }) => (0, afterChangeUpdateRelationships_1.afterChangeUpdateRelationships)({
        collection,
        doc,
        onOutgoingRelationRemoved: params.onOutgoingRelationRemoved,
    });
    const collections = config.collections?.map((collection) => ({
        ...collection,
        hooks: {
            ...collection.hooks,
            afterChange: [
                ...(managedCollections.includes(collection.slug)
                    ? [afterChangeHook]
                    : []),
                ...(collection.hooks?.afterChange ?? []),
            ],
        },
    })) ?? [];
    return {
        ...config,
        collections: [...collections, relationshipsCollection],
        onInit: async (payload) => {
            await config.onInit?.(payload);
            if (rebuildOnInit === false)
                return;
            if (rebuildOnInit === undefined) {
                const firstRelationship = await payload.find({
                    collection: "relationships",
                    limit: 1,
                });
                if (firstRelationship.docs.length > 0)
                    return;
            }
            console.log("[payloadcms-relationships] Rebuilding on init...");
            // Delete all existing relationships
            await payload.delete({
                collection: "relationships",
                where: { id: { exists: true } },
            });
            // For each collection
            managedCollections.forEach(async (collection) => {
                const config = payload.collections[collection]?.config;
                if (!config)
                    return;
                const result = await payload.find({
                    collection: collection,
                    depth: 0,
                    pagination: false,
                });
                // For each doc in that collection
                for (const doc of result.docs) {
                    await (0, afterChangeUpdateRelationships_1.afterChangeUpdateRelationships)({
                        collection: config,
                        doc,
                        onOutgoingRelationRemoved: params.onOutgoingRelationRemoved,
                    });
                }
            });
            console.log("[payloadcms-relationships] Rebuilding on init completed!");
        },
    };
};
exports.relationshipsPlugin = relationshipsPlugin;
