import { AfterChangeHook } from "payload/dist/collections/config/types";
import payload from "payload";
import {
  findRelationByID,
  getRelationId,
  getRelationships,
  uniqueBy,
} from "./utils";

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

export type AfterChangeUpdateRelationshipsParams = Pick<
  Parameters<AfterChangeHook>["0"],
  "collection" | "doc"
> & {
  onRelationshipRemoved?: (relations: RelationshipRemoved) => Promise<void>;
};

export const afterChangeUpdateRelationships = async ({
  collection,
  doc,
  onRelationshipRemoved,
}: AfterChangeUpdateRelationshipsParams) => {
  if ("_status" in doc && doc._status === "draft") {
    return doc;
  }

  const relationships = uniqueBy(
    getRelationships(doc, collection),
    ({ value }) => value
  );

  const id = getRelationId(collection.slug, doc.id);

  if (relationships.length === 0) return doc;

  try {
    const existingEntry = await findRelationByID(collection.slug, doc.id);

    const removedRelationships = existingEntry.outgoingRelations.filter(
      ({ relationTo, value }) =>
        !relationships.some(
          (newRelation) =>
            newRelation.relationTo === relationTo && newRelation.value === value
        )
    );

    if (removedRelationships.length > 0) {
      await onRelationshipRemoved?.({
        id: existingEntry.id,
        document: existingEntry.document,
        removedRelationships: removedRelationships,
      });
    }

    await payload.update({
      collection: "relationships",
      id: existingEntry.id,
      data: { outgoingRelations: relationships },
    });
  } catch {
    await payload.create({
      collection: "relationships",
      data: {
        id,
        document: {
          relationTo: collection.slug,
          value: doc.id,
        },
        outgoingRelations: relationships,
      },
    });
  }
};
