import React, { useState } from "react";
import {
  Library,
  Collection,
  importSet,
  getLibrary,
  saveData,
  LIBRARY_KEY,
  Card,
  coerceNumber,
  getCardCollection,
  updateCardCollection,
  getCollection,
} from "./utility";

type SetData = { [number: string]: Card };
const CARDS_PER_ROW = 10;

const DataTable = ({
  library,
  collection,
  data,
  setCollection,
}: {
  data: SetData;
  collection: Collection;
  setCollection: (c: Collection) => void;
  library: Library;
}) => {
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

  const allCards = Object.values(data).sort((c1, c2) => c1.number - c2.number);
  const tableRows: JSX.Element[] = [];
  for (
    let rowStart = 0;
    rowStart < allCards.length;
    rowStart += CARDS_PER_ROW
  ) {
    const cardsSlice = allCards.slice(rowStart, rowStart + CARDS_PER_ROW);
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
                </tr>
              </tbody>
            </table>
          </td>
        ))}
      </tr>
    );
  }

  return (
    <table>
      <tbody>{tableRows}</tbody>
    </table>
  );
};

export const SetView = ({
  library,
  setLibrary,
  collection,
  setCollection,
}: {
  library: Library;
  setLibrary: (val: Library) => void;
  collection: Collection;
  setCollection: (val: Collection) => void;
}) => {
  const [set, setSet] = useState("");
  const [setData, setSetData] = useState<SetData>();

  const downloadSet = async () => {
    const valid = await importSet(library, set);
    saveData(LIBRARY_KEY, library);
    setLibrary(getLibrary());
    if (valid) {
      setSetData(library[set].cards);
    }
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
                value={set}
                onChange={(e) => setSet(e.target.value)}
                style={{ width: "30px" }}
              />
            </td>
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
          library={library}
        />
      )}
    </>
  );
};

export default SetView;
