export type RelationalValue = {
    relationTo: string;
    value: string;
};
export declare class RelationshipsHandler {
    private _values;
    constructor(...relationships: RelationalValue[]);
    add(...relationships: RelationalValue[]): void;
    has(newRelationship: RelationalValue): boolean;
    get values(): RelationalValue[];
}
