import payload, { GeneratedTypes } from "payload";

type Relationship = GeneratedTypes["collections"]["relationships"];

export const getRelationId = (collection: string, id: string): string =>
  `${collection}_${id}`;

export const findRelationByID = (
  collection: string,
  id: string
): Promise<Relationship> => {
  return payload.findByID({
    collection: "relationships",
    id: getRelationId(collection, id),
  });
};

export const findIncomingRelationships = async (
  collection: string,
  id: string
): Promise<Required<Relationship["incomingRelations"]>> => {
  try {
    const { incomingRelations } = await findRelationByID(collection, id);
    return incomingRelations;
  } catch {
    return [];
  }
};

export const findOutcomingRelationships = async (
  collection: string,
  id: string
): Promise<Required<Relationship["outgoingRelations"]>> => {
  try {
    const { outgoingRelations } = await findRelationByID(collection, id);
    return outgoingRelations;
  } catch {
    return [];
  }
};
