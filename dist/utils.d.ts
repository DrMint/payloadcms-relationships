import { Field } from "payload/types";
import { Relationship } from "./plugin";
type IncomingRelation = NonNullable<Relationship["incomingRelations"]>[number];
type OutgoingRelation = NonNullable<Relationship["outgoingRelations"]>[number];
export declare const getRelationId: (collection: string, id: string) => string;
export declare const findRelationByID: (collection: string, id: string) => Promise<Relationship>;
export declare const findIncomingRelationships: (collection: string, id: string) => Promise<IncomingRelation[]>;
export declare const findOutgoingRelationships: (collection: string, id: string) => Promise<OutgoingRelation[]>;
export declare const getRelationships: (doc: any, collection: {
    fields: Field[];
}) => OutgoingRelation[];
export declare const isPayloadType: <T extends Object>(value: string | T) => value is T;
export declare const uniqueBy: <T, K extends string | number>(array: T[], getKey: (item: T) => K) => T[];
export {};
