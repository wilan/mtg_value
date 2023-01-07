import React, { useState } from "react";
import {
  Card,
  Collection,
  DataSources,
  SET_TYPE_MAGIC,
  SET_TYPE_VSTAR_UNIVERSE,
  SetType,
} from "./dataTypes";
import {
  importSet,
  getLibrary,
  saveData,
  LIBRARY_KEY,
  coerceNumber,
  getCardCollection,
  updateCardCollection,
  getCollection,
  numberCmp,
  SET_MAPPING_KEY,
  getSetMapping,
} from "./utility";

type SetData = { [number: string]: Card };
const CARDS_PER_ROW = 10;

const DataTable = ({
  collection,
  data,
  setCollection,
}: {
  data: SetData;
  collection: Collection;
  setCollection: (c: Collection) => void;
}) => {
  const [hideVariants, setHideVariants] = useState(false);
  const [hideUnowned, setHideUnowned] = useState(false);
  const [sortFn, setSortFn] = useState<(c1: Card, c2: Card) => number>(
    () => (c1: Card, c2: Card) => numberCmp(c1.number, c2.number)
  );
  const updateQtys = (card: Card, reg?: string, foil?: string) => {
    const currentCollection = getCardCollection(
      card.set,
      card.number,
      collection
    );
    if (reg) {
      currentCollection.regQty = coerceNumber(reg);
    }
    if (foil) {
      currentCollection.foilQty = coerceNumber(foil);
    }

    updateCardCollection(currentCollection, collection);
    setCollection(getCollection());
  };

  let allCards = Object.values(data).sort(sortFn);
  const totalVariants: Record<string, number> = {};

  if (hideVariants) {
    const nameMap: Record<string, string> = {};
    allCards.forEach((c: Card) => {
      let replace = true;
      if (nameMap[c.name]) {
        const cmp = numberCmp(nameMap[c.name], c.number);
        if (cmp <= 0) {
          replace = false;
        }
      }
      if (replace) {
        nameMap[c.name] = c.number;
      }
      totalVariants[c.name] ||= 0;
      totalVariants[c.name] +=
        getCardCollection(c.set, c.number, collection).regQty +
        getCardCollection(c.set, c.number, collection).foilQty;
    });
    const uniques = new Set(Object.values(nameMap));
    allCards = allCards.filter((c: Card) => uniques.has(c.number));
  }

  const tableRows: JSX.Element[] = [];
  for (
    let rowStart = 0;
    rowStart < allCards.length;
    rowStart += CARDS_PER_ROW
  ) {
    const cardsSlice = allCards
      .filter((c) => {
        if (hideUnowned) {
          return (
            totalVariants[c.name] ||
            getCardCollection(c.set, c.number, collection).regQty ||
            getCardCollection(c.set, c.number, collection).foilQty
          );
        }
        return true;
      })
      .slice(rowStart, rowStart + CARDS_PER_ROW);
    tableRows.push(
      <tr key={rowStart}>
        {cardsSlice.map((card) => (
          <td key={card.number}>
            <p>
              {card.number}) {card.name}
            </p>
            <img src={card.urlSmall} alt="card" />
            <table>
              <thead>
                <tr>
                  <th>Reg</th>
                  <th>Foil</th>
                  {hideVariants && <th>All</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${card.regPrice}</td>
                  <td>${card.foilPrice}</td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      style={{ width: "30px" }}
                      defaultValue={
                        getCardCollection(card.set, card.number, collection)
                          .regQty
                      }
                      onChange={(e) =>
                        updateQtys(card, e.target.value, undefined)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: "30px" }}
                      defaultValue={
                        getCardCollection(card.set, card.number, collection)
                          .foilQty
                      }
                      onChange={(e) =>
                        updateQtys(card, undefined, e.target.value)
                      }
                    />
                  </td>
                  {hideVariants && <td>{totalVariants[card.name] || 0}</td>}
                </tr>
              </tbody>
            </table>
          </td>
        ))}
      </tr>
    );
  }

  return (
    <>
      <button
        onClick={() =>
          setSortFn(
            () => (c1: Card, c2: Card) => numberCmp(c1.number, c2.number)
          )
        }
      >
        Sort Number
      </button>
      <button
        onClick={() =>
          setSortFn(
            () => (c1: Card, c2: Card) =>
              (c2.regPrice || c2.foilPrice) - (c1.regPrice || c1.foilPrice)
          )
        }
      >
        Sort Price
      </button>
      Hide Variants{" "}
      <input
        type="checkbox"
        checked={hideVariants}
        onChange={() => setHideVariants(!hideVariants)}
      />
      Only Show Owned
      <input
        type="checkbox"
        checked={hideUnowned}
        onChange={() => setHideUnowned(!hideUnowned)}
      />
      <table>
        <tbody>{tableRows}</tbody>
      </table>
    </>
  );
};

export const SetView = ({ dataSources }: { dataSources: DataSources }) => {
  const {
    library,
    setLibrary,
    collection,
    setCollection,
    setMapping,
    setSetMapping,
  } = dataSources;
  const [set, setSet] = useState("");
  const [setData, setSetData] = useState<SetData>();
  const [type, setType] = useState<SetType>("mtg");

  const downloadSet = async () => {
    const valid = await importSet(library, set);
    saveData(LIBRARY_KEY, library);
    setLibrary(getLibrary());
    if (valid) {
      setSetData(library[set].cards);
    }
  };

  const saveAndRefresh = () => {
    saveData(SET_MAPPING_KEY, setMapping);
    setSetMapping(getSetMapping());
  };

  const setSelectedSet = (selectedSet: string) => {
    setSet(selectedSet);
    setType(setMapping[selectedSet] || "mtg");
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>
              Set:{" "}
              <input
                type="text"
                list="sets"
                value={set}
                onChange={(e) => setSelectedSet(e.target.value)}

              />
              <datalist id="sets">
                {Object.keys(setMapping).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </datalist>
              {!(set in setMapping) && set && (
                <button
                  onClick={() => {
                    if (set in setMapping) {
                      return;
                    }
                    setMapping[set] = SET_TYPE_MAGIC;
                    saveAndRefresh();
                    setSelectedSet(set);
                  }}
                >
                  Add
                </button>
              )}{" "}
              {set in setMapping && (
                <button
                  onClick={() => {
                    delete setMapping[set];
                    saveAndRefresh();
                    setSelectedSet("");
                  }}
                >
                  Delete
                </button>
              )}
            </td>
            <td>
              {set && setMapping[set] && (
                <select
                  value={type}
                  onChange={(e) => {
                    const selectedSetType = e.target.value as SetType;
                    setType(selectedSetType);
                    setMapping[set] = selectedSetType;
                    saveAndRefresh();
                  }}
                >
                  <option value={SET_TYPE_MAGIC}>MTG</option>
                  <option value={SET_TYPE_VSTAR_UNIVERSE}>
                    VStar Universe
                  </option>
                </select>
              )}
            </td>
            <td></td>
            <td> </td>
            <td>
              <button onClick={async () => await downloadSet()}>View</button>
            </td>
          </tr>
        </tbody>
      </table>
      {setData && (
        <DataTable
          data={setData}
          collection={collection}
          setCollection={setCollection}
        />
      )}
    </>
  );
};

export default SetView;
