import libraryJson from "./json_data/library.json";
import collectionJson from "./json_data/collection.json";
import tagJson from "./json_data/tagged_collection.json";
import evJson from "./json_data/ev.json";
import setMappingJson from "./json_data/set_mapping.json";

import {
  Card,
  CardCollection,
  CardResponse,
  Collection,
  VERSION_MAP,
  EVData,
  Library,
  SetMapping,
  TaggedCollection,
  ViewCollectionData,
  SET_TYPE_MAGIC,
  SET_TYPE_POKEMON,
  SET_TYPE_VSTAR_UNIVERSE,
} from "./dataTypes";

export const fetch2 = (path: string, params: any = null) => {
  if (params) {
    path = path + "?" + new URLSearchParams(params);
  }
  return fetch(path, { method: "GET" }).then(async (response) => {
    const reader = response?.body?.getReader();
    if (!reader || response.status !== 200) {
      return Promise.resolve({ body: "", success: false });
    }
    let body = "";
    const readStream = async () => {
      await reader.read().then(async ({ done, value }) => {
        body += new TextDecoder().decode(value);
        if (!done) {
          await readStream();
        }
      });
    };
    await readStream();
    return Promise.resolve({ body, success: true });
  });
};

export const LIBRARY_KEY = "mtg_lib";
export const COLLECTION_KEY = "mtg_collection";
export const TAG_KEY = "mtg_tag";
export const EV_KEY = "mtg_ev";
export const SET_MAPPING_KEY = "ccg_sets";
const THROTTLE_MS = 100;
const LIBRARY_SAVE_BATCH = 100;
const MIN_FETCH_COOLDOWN = 1000 * 60 * 60 * 24; // 1000 ms * 60 sec * 60 min * 24 hour

export type DataKey =
  | typeof LIBRARY_KEY
  | typeof COLLECTION_KEY
  | typeof TAG_KEY
  | typeof EV_KEY
  | typeof SET_MAPPING_KEY;

export const getData = (key: DataKey) => {
  const localData = localStorage.getItem(key);
  if (localData) {
    return JSON.parse(localData);
  }
  if (key === LIBRARY_KEY) {
    return libraryJson;
  }
  if (key === COLLECTION_KEY) {
    return collectionJson;
  }
  if (key === TAG_KEY) {
    return tagJson;
  }
  if (key === SET_MAPPING_KEY) {
    return setMappingJson;
  }
  return {};
};

export const saveData = (key: string, data: Object | null) => {
  const jsonString = JSON.stringify(data);
  localStorage.setItem(key, jsonString);
};

export const copyData = (data: Object) => {
  const jsonString = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonString);
};

const addResultMtg = (result: CardResponse, data: Library) => {
  data[result.set] ||= { name: result.set_name, cards: {} };
  const urlSmall = result.image_uris
    ? result.image_uris.small
    : result.card_faces
    ? result.card_faces[0].image_uris.small
    : "";
  const urlNormal = result.image_uris
    ? result.image_uris.normal
    : result.card_faces
    ? result.card_faces[0].image_uris.normal
    : "";
  data[result.set].cards[result.collector_number] = {
    name: result.name,
    type: result.type_line,
    timestamp: Date.now(),
    urlSmall,
    urlNormal,
    regPrice: Number(result.prices.usd),
    foilPrice:
      Number(result.prices.usd_foil) || Number(result.prices.usd_etched),
    set: result.set,
    number: result.collector_number,
    rarity: result.rarity,
    version: VERSION_MAP[SET_TYPE_MAGIC],
  };
};

const addResultVstar = (result: Card, data: Library, set: string) => {
  data[set] ||= { name: "VStar Universe", cards: {} };
  const {
    name,
    type,
    urlSmall,
    urlNormal,
    regPrice,
    foilPrice,
    number,
    rarity,
  } = result;
  data[set].cards[result.number] = {
    name,
    type,
    urlSmall,
    urlNormal,
    regPrice,
    foilPrice,
    number,
    rarity,
    set,
    timestamp: Date.now(),
    version: VERSION_MAP[SET_TYPE_VSTAR_UNIVERSE],
  };
};

export const fetchCard = async (
  set: string,
  number: string,
  library: Library,
  forced = false,
  prevPrequestTime: number | null = null
): Promise<Card> => {
  const numberKey = String(number);
  const cardType = getSetMapping()[set];
  if (
    !forced &&
    library[set]?.cards?.[numberKey] &&
    library[set]?.cards?.[numberKey]?.version === VERSION_MAP[cardType]
  ) {
    return library[set].cards[numberKey];
  }

  if (prevPrequestTime) {
    // at least 100 ms between requests
    const throttle = prevPrequestTime + THROTTLE_MS - Date.now();
    if (throttle > 0) {
      await new Promise((r) => setTimeout(r, throttle));
    }
  }

  if (cardType === "mtg") {
    //https://api.scryfall.com/cards/nec/37
    const url = `https://api.scryfall.com/cards/${set}/${number}`;
    console.log("Fetching ", url);
    await fetch2(url).then((result) => {
      if (result.success) {
        addResultMtg(JSON.parse(result.body), library);
        if (!prevPrequestTime) {
          // caller saves the result for batch operations
          saveData(LIBRARY_KEY, library);
        }
      }
    });
  } else if (cardType === "vstar_universe") {
    console.log("Fetching vstar ", number);
    await fetch2("vstar", { id: number }).then((result) => {
      if (result.success) {
        addResultVstar(JSON.parse(result.body), library, set);
        if (!prevPrequestTime) {
          // caller saves the result for batch operations
          saveData(LIBRARY_KEY, library);
        }
      }
    });
  } else {
    throw new Error("Invalid card type " + cardType);
  }

  return library[set]?.cards?.[numberKey];
};

const getCollectionKey = (set: string, number: string) => {
  return `${set},${number}`;
};

const getInitialCardCollection = (
  set: string,
  number: string
): CardCollection => ({
  set,
  number,
  foilQty: 0,
  regQty: 0,
});

export const getCardCollection = (
  set: string,
  number: string,
  collection: Collection
): CardCollection => {
  return (
    collection[getCollectionKey(set, number)] ||
    getInitialCardCollection(set, number)
  );
};

export const updateCardCollection = (
  card: CardCollection,
  collection: Collection,
  save: boolean = true
) => {
  const key = getCollectionKey(card.set, card.number);
  if (card.regQty === 0 && card.foilQty === 0) {
    delete collection[key];
  } else {
    collection[key] = card;
  }
  if (save) {
    saveData(COLLECTION_KEY, collection);
  }
};

export const updateTagCollection = (
  taggedCollection: TaggedCollection,
  tagName: string,
  card: CardCollection,
  save: boolean = true
) => {
  const collection = taggedCollection[tagName];
  const key = getCollectionKey(card.set, card.number);
  if (card.regQty === 0 && card.foilQty === 0) {
    delete collection[key];
  } else {
    collection[key] = card;
  }
  if (save) {
    saveData(TAG_KEY, taggedCollection);
  }
};

export const getViewCollection = (
  collection: Collection,
  library: Library
): ViewCollectionData[] => {
  const ret: ViewCollectionData[] = [];
  Object.keys(collection).forEach((col) => {
    const collectionData = collection[col];
    const cardData = library[collectionData.set]?.cards[collectionData.number];
    if (cardData) {
      ret.push({ collection: collectionData, card: cardData });
    }
  });
  return ret;
};

export const batchFetch = async (
  library: Library,
  cards: CardCollection[]
): Promise<boolean> => {
  let prevRequestTime: number = 1;
  let numRequests = 0;
  for (const card of cards) {
    const libCard = library[card.set]?.cards[String(card.number)];
    const currRequestTime = Date.now();
    if (
      numRequests < LIBRARY_SAVE_BATCH &&
      (!libCard || currRequestTime > libCard.timestamp + MIN_FETCH_COOLDOWN)
    ) {
      numRequests++;
      await fetchCard(card.set, card.number, library, true, prevRequestTime);
      prevRequestTime = currRequestTime;
    }
  }
  saveData(LIBRARY_KEY, library);
  return numRequests < LIBRARY_SAVE_BATCH;
};

export const importSet = async (
  library: Library,
  set: string
): Promise<boolean> => {
  let end = 0;
  let cardNum = 1;
  let prevRequestTime: number = 1;
  while (end < 2) {
    let currRequestTime = prevRequestTime;
    if (!library[set]?.cards[cardNum]) {
      currRequestTime = Date.now();
    }
    const result = await fetchCard(
      set,
      String(cardNum),
      library,
      false,
      prevRequestTime
    );
    prevRequestTime = currRequestTime;
    end = result ? 0 : end + 1;
    cardNum++;
    if (cardNum % LIBRARY_SAVE_BATCH === 0) {
      saveData(LIBRARY_KEY, library);
    }
  }
  saveData(LIBRARY_KEY, library);

  return Boolean(library[set]);
};

export const getLibrary = (): Library => getData(LIBRARY_KEY);
export const getCollection = (): Collection => getData(COLLECTION_KEY);
export const getTaggedCollection = (): TaggedCollection => getData(TAG_KEY);
export const getEv = (): EVData => getData(EV_KEY);
export const getSetMapping = (): SetMapping => getData(SET_MAPPING_KEY);

export const coerceNumber = (value: string): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const resetData = (key: DataKey) => {
  saveData(key, {});
};

export const importData = (key: DataKey) => {
  if (key === LIBRARY_KEY) {
    saveData(LIBRARY_KEY, libraryJson);
  }
  if (key === COLLECTION_KEY) {
    saveData(COLLECTION_KEY, collectionJson);
  }
  if (key === TAG_KEY) {
    saveData(TAG_KEY, tagJson);
  }
  if (key === EV_KEY) {
    saveData(EV_KEY, evJson);
  }
};

export const numberCmp = (n1: string, n2: string) => {
  const sn1 = String(n1);
  const sn2 = String(n2);
  const cmp1 = sn1.length - sn2.length;
  const cmp2 = sn1.localeCompare(sn2);
  const cmp = cmp1 !== 0 ? cmp1 : cmp2;
  return cmp;
};
