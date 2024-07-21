"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipSet = void 0;
class RelationshipSet {
    constructor(...relationships) {
        this._values = [];
        this.add(...relationships);
    }
    add(...relationships) {
        relationships.forEach((newRelationship) => {
            if (this.has(newRelationship))
                return;
            this.values.push(newRelationship);
        });
    }
    has(newRelationship) {
        return (this._values.find((existingRelationship) => existingRelationship.relationTo === newRelationship.relationTo &&
            existingRelationship.value === newRelationship.value) !== undefined);
    }
    get values() {
        return this._values;
    }
}
exports.RelationshipSet = RelationshipSet;
