import React, { useState } from "react";
import {
  CardCollection,
  coerceNumber,
  Collection,
  getCollection,
  getViewCollection,
  Library,
  updateCardCollection,
  ViewCollectionData,
} from "./utility";

const NUM_SET_PER_ROW = 4;
const CARD_DISPLAY_LIMIT = 100;

const SetSelectorTable = ({
  allSets,
  library,
  selectedSets,
  setSelectedSets,
}: {
  allSets: Array<string>;
  selectedSets: Set<string>;
  setSelectedSets: (newSet: Set<string>) => void;
  library: Library;
}) => {
  const rows: any[] = [];
  for (let i = 0; i < allSets.length; i += NUM_SET_PER_ROW) {
    rows.push(
      <tr key={i}>
        {allSets.slice(i, i + NUM_SET_PER_ROW).map((set) => (
          <td key={set}>
            <input
              type="checkbox"
              checked={selectedSets.has(set)}
              onChange={() => {
                const newSelectedSet = new Set(selectedSets);
                if (selectedSets.has(set)) {
                  newSelectedSet.delete(set);
                } else {
                  newSelectedSet.add(set);
                }
                setSelectedSets(newSelectedSet);
              }}
            />
            {set.toLocaleUpperCase()} - {library[set].name}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
};

type ColumnConfig = {
  header: string;
  render: (data: ViewCollectionData) => JSX.Element;
};

const getTotalValue = (data: ViewCollectionData, showUnowned: boolean) => {
  const ownedValue =
    ~~(
      data.collection.regQty * 100 * data.card.regPrice +
      data.collection.foilQty * 100 * data.card.foilPrice
    ) / 100;

  const unownedValue = showUnowned ? data.card.regPrice : 0;
  return Math.max(ownedValue, unownedValue);
};

const useColumnConfigs = ({
  showUnowned,
  collection,
  setCollection,
}: {
  showUnowned: boolean;
  collection: Collection;
  setCollection: (c: Collection) => void;
}): ColumnConfig[] => {
  const updateCounts = (
    card: CardCollection,
    updatedQuantity: string,
    isFoil: boolean
  ) => {
    if (isNaN(Number(updatedQuantity))) {
      return;
    }

    const quantity = coerceNumber(updatedQuantity);
    const updatedCard = { ...card };
    if (isFoil) {
      updatedCard.foilQty = quantity;
    } else {
      updatedCard.regQty = quantity;
    }

    updateCardCollection(updatedCard, collection);
    setCollection(getCollection());
  };

  return [
    {
      header: "Name",
      render: (data: ViewCollectionData) => <label>{data.card.name}</label>,
    },
    {
      header: "Quantity",
      render: (data: ViewCollectionData) => (
        <>
          REG:{" "}
          <input
            type="text"
            defaultValue={data.collection.regQty}
            onBlur={(e) => updateCounts(data.collection, e.target.value, false)}
            style={{ width: "20px" }}
          />
          <br />
          FOIL:{" "}
          <input
            type="text"
            defaultValue={data.collection.foilQty}
            style={{ width: "20px" }}
            onBlur={(e) => updateCounts(data.collection, e.target.value, true)}
          />
        </>
      ),
    },
    {
      header: "Prices",
      render: (data: ViewCollectionData) => (
        <>
          REG: ${data.card.regPrice} <br />
          FOIL: ${data.card.foilPrice}
        </>
      ),
    },
    {
      header: "Card Image",
      render: (data: ViewCollectionData) => (
        <img alt="card" src={data.card.urlSmall} />
      ),
    },
    {
      header: "Total Value",
      render: (data: ViewCollectionData) => (
        <label>${getTotalValue(data, showUnowned)}</label>
      ),
    },
  ];
};

const ViewCollection = ({
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
  const allSets = Object.keys(library);
  const [showSets, setShowSets] = useState(true);
  const [selectedSets, setSelectedSets] = useState(new Set(allSets));
  const [valueFloor, setValueFloor] = useState(1.5);
  const [showUnowned, setShowUnowned] = useState(false);
  const columnConfigs = useColumnConfigs({
    showUnowned,
    collection,
    setCollection,
  });

  const filterFn = (collectionData: ViewCollectionData) => {
    const totalValue = getTotalValue(collectionData, showUnowned);
    const set = collectionData.card.set;
    return totalValue >= valueFloor && selectedSets.has(set);
  };

  const viewCollectionData = getViewCollection(collection, library)
    .filter((x) => filterFn(x))
    .sort(
      (x, y) => getTotalValue(y, showUnowned) - getTotalValue(x, showUnowned)
    )
    .slice(0, CARD_DISPLAY_LIMIT);

  const totalOwnedValue = viewCollectionData
    .map((x) => getTotalValue(x, false))
    .reduce((curr, prev) => curr + prev, 0)
    .toFixed(2);

  return (
    <>
      <button onClick={() => setShowSets(!showSets)}>Show Set Selectors</button>
      {showSets && (
        <>
          <button onClick={() => setSelectedSets(new Set(allSets))}>
            Select All
          </button>
          <button onClick={() => setSelectedSets(new Set())}>
            Unselect All
          </button>
          <SetSelectorTable
            library={library}
            allSets={allSets}
            setSelectedSets={setSelectedSets}
            selectedSets={selectedSets}
          />
        </>
      )}
      <table>
        <tbody>
          <tr>
            <td>
              Total Value Floor:{" "}
              <input
                type="text"
                defaultValue={valueFloor}
                onBlur={(e) => setValueFloor(coerceNumber(e.target.value))}
                style={{ width: "30px" }}
              />
            </td>
            <td>
              Show unowned:{" "}
              <input
                type="checkbox"
                checked={showUnowned}
                onChange={(e) => setShowUnowned(!showUnowned)}
              />
            </td>
            <td>
              <span>Total Value: ${totalOwnedValue} </span>
            </td>
          </tr>
        </tbody>
      </table>
      <table className={"collection-table"}>
        <thead>
          <tr>
            {columnConfigs.map((x) => (
              <th key={x.header}>{x.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {viewCollectionData.map((data) => (
            <tr key={data.card.urlSmall}>
              {columnConfigs.map((config) => (
                <td key={config.header}>{config.render(data)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ViewCollection;
