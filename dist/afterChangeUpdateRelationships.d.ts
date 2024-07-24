import { AfterChangeHook } from "payload/dist/collections/config/types";
import { RelationshipsPluginParams } from "./plugin";
type AfterChangeUpdateRelationshipsParams = Pick<Parameters<AfterChangeHook>["0"], "collection" | "doc"> & {
    onOutgoingRelationRemoved?: RelationshipsPluginParams["onOutgoingRelationRemoved"];
};
export declare const afterChangeUpdateRelationships: ({ collection, doc, onOutgoingRelationRemoved, }: AfterChangeUpdateRelationshipsParams) => Promise<any>;
export {};
