export interface Relationship {
    id: string;
    document: {
        relationTo: string;
        value: string | any;
    };
    incomingRelations?: {
        relationTo: string;
        value: string | any;
    }[] | null;
    outgoingRelations?: {
        relationTo: string;
        value: string | any;
    }[] | null;
}
interface Config {
    collections: {
        relationships: Relationship;
    };
}
declare module "payload" {
    interface GeneratedTypes extends Config {
    }
}
export {};
