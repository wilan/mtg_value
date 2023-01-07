export interface CardResponse {
  name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  card_faces?: {
    image_uris: {
      small: string;
      normal: string;
    };
  }[];
  set_name: string;
  set: string;
  type_line: string;
  prices: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
  };
  collector_number: string;
  rarity: string;
}

export interface Card {
  name: string;
  type: string;
  timestamp: number;
  urlSmall: string;
  urlNormal: string;
  regPrice: number;
  foilPrice: number;
  set: string;
  number: string;
  rarity: string;
  version?: string;
}

export interface CardCollection {
  set: string;
  number: string;
  regQty: number;
  foilQty: number;
}

export type ViewCollectionData = {
  collection: CardCollection;
  card: Card;
};

export interface Collection {
  [key: string]: CardCollection;
}

export interface Library {
  [set: string]: {
    cards: {
      [number: string]: Card;
    };
    name: string;
  };
}

export interface TaggedCollection {
  [tagName: string]: Collection;
}

export interface DataSources {
  collection: Collection;
  setCollection: (x: Collection) => void;
  library: Library;
  setLibrary: (x: Library) => void;
  taggedCollection: TaggedCollection;
  setTaggedCollection: (x: TaggedCollection) => void;
  ev: EVData;
  setEv: (x: EVData) => void;
  setMapping: SetMapping;
  setSetMapping: (x: SetMapping) => void;
}

export interface EVCardData {
  rate: number;
  regularLabels: {
    [set: string]: { [number: string]: any };
  };
  foilLabels: {
    [set: string]: { [number: string]: any };
  };
}

export interface EVData {
  [set: string]: {
    description: string;
    types: {
      [cardType: string]: EVCardData; // mainset_rare -> xxx
    };
  };
}

export const SET_TYPE_MAGIC = "mtg";
export const SET_TYPE_VSTAR_UNIVERSE = "vstar_universe";
export const SET_TYPE_POKEMON = "pkmn";

export type SetType =
  | typeof SET_TYPE_MAGIC
  | typeof SET_TYPE_VSTAR_UNIVERSE
  | typeof SET_TYPE_POKEMON;

export interface SetMapping {
  [setName: string]: SetType;
}

export const VERSION_MAP = {
  [SET_TYPE_MAGIC]: "1",
  [SET_TYPE_VSTAR_UNIVERSE]: "2",
  [SET_TYPE_POKEMON]: "1",
};