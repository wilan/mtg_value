import React, { useState } from "react";
import {
  CardCollection,
  Collection,
  DataSources,
  ViewCollectionData
} from "./dataTypes";
import {
  batchFetch,
  coerceNumber,
  getLibrary,
  updateCardCollection,
} from "./utility";

const CARD_DISPLAY_LIMIT = 25;

const getTotalValue = (data: ViewCollectionData) => {
  return (
    ~~(
      data.collection.regQty * 100 * data.card.regPrice +
      data.collection.foilQty * 100 * data.card.foilPrice
    ) / 100
  );
};

type ColumnConfig = {
  header: string;
  render: (data: ViewCollectionData) => JSX.Element;
};

const useColumnConfigs = ({
  collection,
  updateCollection,
}: {
  collection: Collection;
  updateCollection: (c: Collection) => void;
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

    updateCardCollection(updatedCard, collection, false);
    updateCollection(collection);
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
        <img alt="card" src={data.card.urlSmall} style={{width: "145px"}}/>
      ),
    },
    {
      header: "Total Value",
      render: (data: ViewCollectionData) => (
        <label>${getTotalValue(data)}</label>
      ),
    },
  ];
};

const CollectionDisplay = ({
  collection, // This can be a tagged collection
  dataSources,
  initialViewData,
  updateCollection,
}: {
  collection: Collection;
  dataSources: DataSources;
  initialViewData: ViewCollectionData[];
  updateCollection: (c: Collection) => void;
}) => {
  const { library, setLibrary } = dataSources;
  const [valueFloor, setValueFloor] = useState(1.5);
  const [pageNum, setPageNum] = useState(0);
  const columnConfigs = useColumnConfigs({ updateCollection, collection });
  const viewData = initialViewData
    .filter((collectionData) => {
      const totalValue = getTotalValue(collectionData);
      return totalValue >= valueFloor;
    })
    .sort((x, y) => getTotalValue(y) - getTotalValue(x));

  const totalOwnedValue = viewData
    .map((x) => getTotalValue(x))
    .reduce((curr, prev) => curr + prev, 0)
    .toFixed(2);
  const prevPage = () => {
    setPageNum(Math.max(0, pageNum - 1));
  };

  const nextPage = () => {
    setPageNum(
      Math.min(pageNum + 1, Math.ceil(viewData.length / CARD_DISPLAY_LIMIT - 1))
    );
  };
  const displayedCollectionData = viewData.slice(
    CARD_DISPLAY_LIMIT * pageNum,
    CARD_DISPLAY_LIMIT * (pageNum + 1)
  );
  return (
    <>
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
              <button
                onClick={async () => {
                  const success = await batchFetch(
                    library,
                    viewData.map((x) => x.collection)
                  );
                  if (!success) {
                    window.alert(
                      "Only some cards refreshed, please issue another request"
                    );
                  }
                  setLibrary(getLibrary());
                }}
              >
                Refresh Prices
              </button>
            </td>
            <td>
              <span>Total Value: ${totalOwnedValue}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={prevPage}>&lt;</button>{" "}
      <button onClick={nextPage}>&gt;</button>(
      {CARD_DISPLAY_LIMIT * pageNum + 1} to{" "}
      {Math.min(viewData.length, CARD_DISPLAY_LIMIT * (pageNum + 1))}
      {" of "}
      {viewData.length})
      <table className={"collection-table"}>
        <thead>
          <tr>
            {columnConfigs.map((x) => (
              <th key={x.header}>{x.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedCollectionData.map((data) => (
            <tr key={data.card.urlSmall}>
              {columnConfigs.map((config) => (
                <td key={config.header}>{config.render(data)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={prevPage}>&lt;</button>{" "}
      <button onClick={nextPage}>&gt;</button>(
      {CARD_DISPLAY_LIMIT * pageNum + 1} to{" "}
      {Math.min(viewData.length, CARD_DISPLAY_LIMIT * (pageNum + 1))}
      {" of "}
      {viewData.length})
    </>
  );
};

export default CollectionDisplay;
