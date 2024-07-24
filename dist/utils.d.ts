import { Field } from "payload/types";
import { Relationship } from "./plugin";
export declare const getRelationId: (collection: string, id: string) => string;
export declare const findRelationByID: (collection: string, id: string) => Promise<Relationship>;
export declare const findIncomingRelationships: (collection: string, id: string) => Promise<NonNullable<Relationship["incomingRelations"]>>;
export declare const findOutgoingRelationships: (collection: string, id: string) => Promise<NonNullable<Relationship["outgoingRelations"]>>;
export declare const getRelationships: (doc: any, collection: {
    fields: Field[];
}) => Relationship["outgoingRelations"];
export declare const isPayloadType: <T extends Object>(value: string | T) => value is T;
export declare const uniqueBy: <T, K extends string | number>(array: T[], getKey: (item: T) => K) => T[];
