import { Plugin } from "payload/config";
import { CollectionConfig } from "payload/types";
import { AfterChangeHook } from "payload/dist/collections/config/types";
import { afterChangeUpdateRelationships } from "./afterChangeUpdateRelationships";
import payload, { GeneratedTypes } from "payload";

export interface RelationshipsPluginParams {
  /**
   * Enable or disable plugin
   * @default true
   */
  enabled?: boolean;
  /**
   * If this option is enable, deletes and rebuilds the "relationships" collection on init.
   * This can be useful when adding or removing a collection in the param `managedCollections`.
   * By default, rebuilding will only be triggered if no document is present in the "relationships" collection.
   */
  rebuildOnInit?: boolean | undefined;
  /**
   * Configuration for the added "relationships" collection.
   */
  collectionConfig?: Omit<CollectionConfig, "fields" | "slug">;
  /**
   * Use this option to limit which collections are managed by this plugin.
   * By default, all collections are managed.
   */
  managedCollections?: string[];
}

/**
 * PayloadCMS Relationships plugin. This plugin adds a new "relationships" collection which holds all the relationships found in all your collections' documents.
 * This plugin makes it easier to list all incoming and outgoing relationships for a given document.
 */
export const relationshipsPlugin: (
  params: RelationshipsPluginParams
) => Plugin = (params) => (config) => {
  const { collectionConfig, enabled = true, rebuildOnInit } = params;

  if (!enabled) return config;

  const managedCollections =
    params.managedCollections ??
    config.collections?.map(({ slug }) => slug) ??
    [];

  const relationshipsCollection: CollectionConfig = {
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
              const result = await payload.find({
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
                        equals:
                          typeof document.value === "object"
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
        hasMany: true,
        minRows: 1,
        required: true,
        relationTo: managedCollections,
      },
    ],
  };

  const afterChangeHook: AfterChangeHook = ({ collection, doc }) =>
    afterChangeUpdateRelationships({ collection, doc });

  const collections =
    config.collections?.map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [
          ...(collection.hooks?.afterChange ?? []),
          ...(collection.slug in managedCollections ? [afterChangeHook] : []),
        ],
      },
    })) ?? [];

  return {
    ...config,
    collections: [...collections, relationshipsCollection],
    onInit: async (payload) => {
      await config.onInit?.(payload);

      if (rebuildOnInit === false) return;

      if (rebuildOnInit === undefined) {
        const firstRelationship = await payload.find({
          collection: "relationships",
          limit: 1,
        });

        if (firstRelationship.docs.length > 0) return;
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
        if (!config) return;

        const result = await payload.find({
          collection: collection as keyof GeneratedTypes["collections"],
          depth: 0,
          pagination: false,
        });

        // For each doc in that collection
        for (const doc of result.docs) {
          await afterChangeUpdateRelationships({
            collection: config,
            doc,
          });
        }
      });

      console.log("[payloadcms-relationships] Rebuilding on init completed!");
    },
  };
};
