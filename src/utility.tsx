import libraryJson from "./library.json";
import collectionJson from "./collection.json";

export const fetch2 = (path: string, params = null) => {
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
const THROTTLE_MS = 100;

type DataKey = typeof LIBRARY_KEY | typeof COLLECTION_KEY;

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

interface CardResponse {
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
  }[],
  set_name: string;
  set: string;
  type_line: string;
  prices: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
  };
  collector_number: string;
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
  number: number;
}

export interface CardCollection {
  set: string;
  number: number;
  regQty: number;
  foilQty: number;
}

export type ViewCollectionData = {
  collection: CardCollection;
  card: Card;
}

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

export const addResult = (result: CardResponse, data: Library) => {
  data[result.set] ||= { name: result.set_name, cards: {} };
  const urlSmall = result.image_uris ? result.image_uris.small : (result.card_faces ? result.card_faces[0].image_uris.small : "");
  const urlNormal = result.image_uris ? result.image_uris.normal : (result.card_faces ? result.card_faces[0].image_uris.normal : "");
  data[result.set].cards[result.collector_number] = {
    name: result.name,
    type: result.type_line,
    timestamp: Date.now(),
    urlSmall,
    urlNormal,
    regPrice: Number(result.prices.usd),
    foilPrice: Number(result.prices.usd_foil) || Number(result.prices.usd_etched),
    set: result.set,
    number: Number(result.collector_number),
  };
  saveData(LIBRARY_KEY, data);
};

export const fetchCard = async (
  set: string,
  number: number,
  library: Library,
  forced = false,
  prevPrequestTime: number | null = null,
): Promise<Card> => {
  const numberKey = String(number);
  if (!forced && library[set]?.cards?.[numberKey]) {
    return library[set].cards[numberKey];
  }

  if (prevPrequestTime) {
    // at least 100 ms between requests
    const throttle = prevPrequestTime + THROTTLE_MS - Date.now();
    if (throttle > 0) {
      await new Promise(r => setTimeout(r, throttle)); 
    }
  }

  //https://api.scryfall.com/cards/nec/37
  const url = `https://api.scryfall.com/cards/${set}/${number}`;
  console.log("Fetching ", url);
  await fetch2(url).then((result) => {
    if (result.success) {
      addResult(JSON.parse(result.body), library);
    }
  });
  return library[set]?.cards?.[numberKey];
};

const getCollectionKey = (set: string, number: Number) => {
  return `${set},${number}`;
};

const getInitialCardCollection = (
  set: string,
  number: number
): CardCollection => ({
  set,
  number,
  foilQty: 0,
  regQty: 0,
});

export const getCardCollection = (
  set: string,
  number: number,
  collection: Collection
): CardCollection => {
  return (
    collection[getCollectionKey(set, number)] ||
    getInitialCardCollection(set, number)
  );
};

export const updateCardCollection = (
  card: CardCollection,
  collection: Collection
) => {
  const key = getCollectionKey(card.set, card.number);
  if (card.regQty === 0 && card.foilQty === 0) {
    delete(collection[key]);
  } else {
    collection[key] = card;
  }
  saveData(COLLECTION_KEY, collection);
};

export const getViewCollection = (collection: Collection, library: Library): ViewCollectionData[] => {
  const ret: ViewCollectionData[] = [];
  Object.keys(collection).forEach((col) => {
    const collectionData = collection[col];
    const cardData = library[collectionData.set]?.cards[collectionData.number];
    if (cardData) {
      ret.push({collection: collectionData, card: cardData});
    }
  });
  return ret;
}

export const importSet = async (library: Library, set: string): Promise<boolean> => {
  let end = false;
  let cardNum = 1;
  let prevRequestTime: number | null = null;
  while (!end) {
    //if (!library[set]?.cards[cardNum]) {
      const currRequestTime = Date.now();
      const result = await fetchCard(set, cardNum, library, true, prevRequestTime);
      prevRequestTime = currRequestTime;
      end = !result;
      await new Promise(r => setTimeout(r, 100)); // at least 100 ms between requests
    //}
    cardNum++;
  }

  return Boolean(library[set]);
}

export const getLibrary = (): Library => getData(LIBRARY_KEY);
export const getCollection = (): Collection => getData(COLLECTION_KEY);

export const coerceNumber = (value: string): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const resetData = () => {
  saveData(COLLECTION_KEY, {});
  saveData(LIBRARY_KEY, {});
};

export const importData = () => {
  saveData(LIBRARY_KEY, libraryJson);
  saveData(COLLECTION_KEY, collectionJson);
};
