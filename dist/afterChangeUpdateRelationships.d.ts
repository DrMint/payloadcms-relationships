import { AfterChangeHook } from "payload/dist/collections/config/types";
type SimplifiedAfterChangeHookParams = Pick<Parameters<AfterChangeHook>["0"], "collection" | "doc">;
export declare const afterChangeUpdateRelationships: ({ collection, doc, }: SimplifiedAfterChangeHookParams) => Promise<any>;
export declare const isPayloadType: <T extends Object>(value: string | T) => value is T;
export {};
