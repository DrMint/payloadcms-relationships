import payload, { GeneratedTypes } from "payload";
import { Block, Field } from "payload/types";

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
): Promise<NonNullable<Relationship["incomingRelations"]>> => {
  try {
    const { incomingRelations } = await findRelationByID(collection, id);
    return incomingRelations ?? [];
  } catch {
    return [];
  }
};

export const findOutgoingRelationships = async (
  collection: string,
  id: string
): Promise<NonNullable<Relationship["outgoingRelations"]>> => {
  try {
    const { outgoingRelations } = await findRelationByID(collection, id);
    return outgoingRelations;
  } catch {
    return [];
  }
};

export const getRelationships = (
  doc: any,
  collection: { fields: Field[] }
): Relationship["outgoingRelations"] => {
  const relationships: Relationship["outgoingRelations"] = [];

  collection.fields.forEach((field) => {
    switch (field.type) {
      case "upload": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;
        relationships.push({
          relationTo: field.relationTo,
          value: isPayloadType(fieldValue) ? fieldValue.id : fieldValue,
        });
        break;
      }

      case "relationship": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;

        // Relation to only one collection
        if (typeof field.relationTo === "string") {
          const relationTo = field.relationTo;
          if (field.hasMany) {
            fieldValue.forEach((value) =>
              relationships.push({
                relationTo,
                value: isPayloadType(value) ? value.id : value,
              })
            );
          } else {
            relationships.push({
              relationTo,
              value: fieldValue,
            });
          }
          // Polymorphic relational field
        } else {
          if (field.hasMany) {
            fieldValue.forEach(({ relationTo, value }) =>
              relationships.push({
                relationTo,
                value: isPayloadType(value) ? value.id : value,
              })
            );
          } else {
            relationships.push(fieldValue);
          }
        }
        break;
      }

      case "array": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;
        fieldValue.forEach((value) => {
          relationships.push(...getRelationships(value, field));
        });
        break;
      }

      case "collapsible":
      case "row": {
        relationships.push(...getRelationships(doc, field));
        break;
      }

      case "group": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;
        relationships.push(...getRelationships(fieldValue, field));
        break;
      }

      case "blocks": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;
        fieldValue.forEach((block) => {
          const blockConfig = field.blocks.find(
            ({ slug }) => slug === block.blockType
          );
          if (!blockConfig) {
            return;
          }
          relationships.push(
            ...(0, exports.getRelationships)(block, blockConfig)
          );
        });
        break;
      }

      case "tabs": {
        field.tabs.forEach((tab) => {
          relationships.push(...getRelationships(doc, tab));
        });
        break;
      }

      case "richText": {
        const fieldValue = doc[field.name];
        if (!fieldValue) return;
        relationships.push(...getRichTextRelationships(fieldValue, field));
        break;
      }

      // These fields can't hold relationships.
      case "checkbox":
      case "point":
      case "number":
      case "code":
      case "date":
      case "email":
      case "json":
      case "radio":
      case "select":
      case "textarea":
      case "text":
      case "ui":
        break;
    }
  });

  return relationships;
};

const getRichTextRelationships = (
  content: any,
  config: any
): Relationship["outgoingRelations"] => {
  const getNodeRelationships = (
    node: any
  ): Relationship["outgoingRelations"] => {
    switch (node.type) {
      case "upload":
      case "relationship":
        return [
          {
            relationTo: node.relationTo,
            value: isPayloadType(node.value) ? node.value.id : node.value,
          },
        ];

      case "list":
      case "listitem":
      case "paragraph":
        return node.children.flatMap(getNodeRelationships);

      case "link": {
        if (node.fields.linkType === "internal") {
          return [
            {
              relationTo: node.fields.doc.relationTo,
              value: isPayloadType(node.fields.doc.value)
                ? node.fields.doc.value.id
                : node.fields.doc.value,
            },
          ];
        }
        break;
      }

      case "block": {
        const blocksConfig =
          config.editor.editorConfig.resolvedFeatureMap.get("blocks");
        if (!blocksConfig) return [];
        const blocks = blocksConfig.props.blocks;
        const block = blocks.find(
          (block: Block) => block.slug === node.fields.blockType
        );
        if (!block) return [];
        return getRelationships(node.fields, block);
      }

      case "text":
      case "autolink":
      case "tab":
      case "linebreak":
      default:
        break;
    }
    return [];
  };

  return content.root.children.flatMap(getNodeRelationships);
};

const isPayloadType = <T extends Object>(value: string | T): value is T =>
  typeof value === "object";

export const uniqueBy = <T, K extends string | number>(
  array: T[],
  getKey: (item: T) => K
) => {
  const alreadyFoundKeys: K[] = [];
  return array.filter((item) => {
    var currentItemKey = getKey(item);
    if (alreadyFoundKeys.includes(currentItemKey)) return false;
    alreadyFoundKeys.push(currentItemKey);
    return true;
  });
};
