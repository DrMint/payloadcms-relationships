import { AfterChangeHook } from "payload/dist/collections/config/types";
import payload from "payload";
import {
  findRelationByID,
  getRelationId,
  getRelationships,
  isPayloadType,
  uniqueBy,
} from "./utils";
import { RelationshipsPluginParams } from "./plugin";

type AfterChangeUpdateRelationshipsParams = Pick<
  Parameters<AfterChangeHook>["0"],
  "collection" | "doc"
> & {
  onOutgoingRelationRemoved?: RelationshipsPluginParams["onOutgoingRelationRemoved"];
};

export const afterChangeUpdateRelationships = async ({
  collection,
  doc,
  onOutgoingRelationRemoved,
}: AfterChangeUpdateRelationshipsParams) => {
  if ("_status" in doc && doc._status === "draft") {
    return doc;
  }

  const relationships = uniqueBy(
    getRelationships(doc, collection),
    ({ value }) => value
  );

  const id = getRelationId(collection.slug, doc.id);

  try {
    const existingEntry = await findRelationByID(collection.slug, doc.id);

    const removedOutgoingRelations = (
      existingEntry.outgoingRelations ?? []
    ).filter(
      ({ relationTo, value }) =>
        !relationships.some((newRelation) => {
          if (newRelation.relationTo !== relationTo) return false;
          const id = isPayloadType(value) ? value.id : value;
          const newId = isPayloadType(newRelation.value)
            ? newRelation.value.id
            : newRelation.value;
          return id === newId;
        })
    );

    if (removedOutgoingRelations.length > 0) {
      await onOutgoingRelationRemoved?.({
        id: existingEntry.id,
        document: existingEntry.document,
        removedOutgoingRelations,
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
