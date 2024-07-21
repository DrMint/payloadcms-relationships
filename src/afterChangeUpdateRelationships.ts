import { RelationshipSet } from "./RelationshipSet";
import { AfterChangeHook } from "payload/dist/collections/config/types";
import payload from "payload";
import { findRelationByID, getRelationId, getRelationships } from "./utils";

type SimplifiedAfterChangeHookParams = Pick<
  Parameters<AfterChangeHook>["0"],
  "collection" | "doc"
>;

export const afterChangeUpdateRelationships = async ({
  collection,
  doc,
}: SimplifiedAfterChangeHookParams) => {
  if ("_status" in doc && doc._status === "draft") {
    return doc;
  }

  const relationships = new RelationshipSet(
    ...getRelationships(doc, collection)
  ).values;
  const id = getRelationId(collection.slug, doc.id);

  if (relationships.length === 0) return doc;

  try {
    const existingEntry = await findRelationByID(collection.slug, doc.id);
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

