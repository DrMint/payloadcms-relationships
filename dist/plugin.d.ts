import { Plugin } from "payload/config";
import { CollectionConfig } from "payload/types";
import { AfterChangeUpdateRelationshipsParams } from "./afterChangeUpdateRelationships";
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
    /**
     * Provide a callback when relationships are removed from a document.
     */
    onRelationshipRemoved?: AfterChangeUpdateRelationshipsParams["onRelationshipRemoved"];
}
/**
 * PayloadCMS Relationships plugin. This plugin adds a new "relationships" collection which holds all the relationships found in all your collections' documents.
 * This plugin makes it easier to list all incoming and outgoing relationships for a given document.
 */
export declare const relationshipsPlugin: (params: RelationshipsPluginParams) => Plugin;
