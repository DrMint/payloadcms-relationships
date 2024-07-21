import { GeneratedTypes } from "payload";
type Relationship = GeneratedTypes["collections"]["relationships"];
export declare const getRelationId: (collection: string, id: string) => string;
export declare const findRelationByID: (collection: string, id: string) => Promise<Relationship>;
export declare const findIncomingRelationships: (collection: string, id: string) => Promise<Required<Relationship["incomingRelations"]>>;
export declare const findOutcomingRelationships: (collection: string, id: string) => Promise<Required<Relationship["outgoingRelations"]>>;
export {};
