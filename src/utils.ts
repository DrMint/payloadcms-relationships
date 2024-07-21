import payload from "payload";

export const getRelationId = (collection: string, id: string) =>
  `${collection}_${id}`;

export const findRelationByID = (collection: string, id: string) => {
  return payload.findByID({
    collection: "relationships",
    id: getRelationId(collection, id),
  });
};

export const findIncomingRelationships = async (
  collection: string,
  id: string
) => {
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
) => {
  try {
    const { outgoingRelations } = await findRelationByID(collection, id);
    return outgoingRelations;
  } catch {
    return [];
  }
};

export interface Relationship {
  id: string;
  document: {
    relationTo: string;
    value: string | any;
  };
  incomingRelations?:
    | {
        relationTo: string;
        value: string | any;
      }[]
    | null;
  outgoingRelations: {
    relationTo: string;
    value: string | any;
  }[];
}
