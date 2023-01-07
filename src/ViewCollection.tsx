import React, { useState } from "react";
import CollectionDisplay from "./CollectionDisplay";
import {
  DataSources,
  ViewCollectionData
} from "./dataTypes";
import {
  COLLECTION_KEY,
  getCollection,
  getViewCollection,
  saveData
} from "./utility";
import SetSelectorTable from "./SetSelectorTable";

const ViewCollection = ({ dataSources }: { dataSources: DataSources }) => {
  const { library, collection, setCollection } = dataSources;
  const allSets = Object.keys(library);
  const [showSets, setShowSets] = useState(true);
  const [selectedSets, setSelectedSets] = useState(new Set(allSets));
  const filterFn = (collectionData: ViewCollectionData) => {
    const set = collectionData.card.set;
    return selectedSets.has(set);
  };

  const viewCollectionData = getViewCollection(collection, library)
    .filter((x) => filterFn(x));

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
            setSelectedSets={setSelectedSets}
            selectedSets={selectedSets}
          />
        </>
      )}
      <CollectionDisplay
        collection={collection}
        dataSources={dataSources}
        initialViewData={viewCollectionData}
        updateCollection={(updatedCollection) => {
          saveData(COLLECTION_KEY, updatedCollection);
          setCollection(getCollection());
        }}
      />
    </>
  );
};

export default ViewCollection;
