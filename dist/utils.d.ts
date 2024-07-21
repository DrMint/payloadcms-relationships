export declare const getRelationId: (collection: string, id: string) => string;
export declare const findRelationByID: (collection: string, id: string) => Promise<import("payload/types").TypeWithID & Record<string, unknown>>;
export declare const findIncomingRelationships: (collection: string, id: string) => Promise<unknown>;
export declare const findOutcomingRelationships: (collection: string, id: string) => Promise<unknown>;
export interface Relationship {
    id: string;
    document: {
        relationTo: string;
        value: string | any;
    };
    incomingRelations?: {
        relationTo: string;
        value: string | any;
    }[] | null;
    outgoingRelations: {
        relationTo: string;
        value: string | any;
    }[];
}
