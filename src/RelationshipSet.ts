export type RelationalValue = {
  relationTo: string;
  value: string;
};

export class RelationshipSet {
  private _values: RelationalValue[] = [];

  constructor(...relationships: RelationalValue[]) {
    this.add(...relationships);
  }

  add(...relationships: RelationalValue[]) {
    relationships.forEach((newRelationship) => {
      if (this.has(newRelationship)) return;
      this.values.push(newRelationship);
    });
  }

  has(newRelationship: RelationalValue) {
    return (
      this._values.find(
        (existingRelationship) =>
          existingRelationship.relationTo === newRelationship.relationTo &&
          existingRelationship.value === newRelationship.value
      ) !== undefined
    );
  }

  get values() {
    return this._values;
  }
}
