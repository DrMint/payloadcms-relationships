import { AfterChangeHook } from "payload/dist/collections/config/types";
export interface RelationshipRemoved {
    id: string;
    document: {
        relationTo: string;
        value: string | any;
    };
    removedRelationships: {
        relationTo: string;
        value: string | any;
    }[];
}
export type AfterChangeUpdateRelationshipsParams = Pick<Parameters<AfterChangeHook>["0"], "collection" | "doc"> & {
    onRelationshipRemoved?: (relations: RelationshipRemoved) => Promise<void>;
};
export declare const afterChangeUpdateRelationships: ({ collection, doc, onRelationshipRemoved, }: AfterChangeUpdateRelationshipsParams) => Promise<any>;
