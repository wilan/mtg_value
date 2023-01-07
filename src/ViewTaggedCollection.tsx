import React, { useState } from "react";
import AddCardTable from "./AddCardTable";
import CollectionDisplay from "./CollectionDisplay";
import SelectTag from "./SelectTag";
import { DataSources } from "./dataTypes";
import {
  TAG_KEY,
  fetchCard,
  getCardCollection,
  getTaggedCollection,
  getViewCollection,
  saveData,
  updateTagCollection,
} from "./utility";

const ViewTaggedCollection = ({
  dataSources,
}: {
  dataSources: DataSources;
}) => {
  const { taggedCollection, setTaggedCollection, library } = dataSources;
  const [selectedTag, setSelectedTag] = useState<string>("");
  const addNewTag = () => {
    if (selectedTag && !(selectedTag in taggedCollection)) {
      taggedCollection[selectedTag] = {};
      saveData(TAG_KEY, taggedCollection);
      setTaggedCollection(getTaggedCollection());
    }
    setSelectedTag(selectedTag);
  };

  const deleteSelectedTag = () => {
    if (selectedTag && selectedTag in taggedCollection) {
      delete taggedCollection[selectedTag];
      saveData(TAG_KEY, taggedCollection);
      setTaggedCollection(getTaggedCollection());
    }
    setSelectedTag("");
  };

  const addCard = async (setSymbol: string, number: string, foil: boolean) => {
    if (!selectedTag) {
      return;
    }
    const result = await fetchCard(setSymbol, number, library);
    if (result) {
      const currCollection = getCardCollection(
        setSymbol,
        number,
        taggedCollection[selectedTag]
      );
      currCollection.foilQty += foil ? 1 : 0;
      currCollection.regQty += foil ? 0 : 1;
      updateTagCollection(taggedCollection, selectedTag, currCollection);
      setTaggedCollection(getTaggedCollection());
    }
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Tag</td>
            <td>
              <SelectTag
                taggedCollection={taggedCollection}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
              />
            </td>
            <td>
              {selectedTag && !(selectedTag in taggedCollection) && (
                <button onClick={addNewTag}>Add</button>
              )}
              {selectedTag in taggedCollection && (
                <button onClick={deleteSelectedTag}>Delete</button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      {selectedTag && selectedTag in taggedCollection && (
        <AddCardTable
          dataSources={dataSources}
          addCard={addCard}
          showTagSelector={false}
        />
      )}
      {selectedTag && selectedTag in taggedCollection && (
        <CollectionDisplay
          collection={taggedCollection[selectedTag]}
          dataSources={dataSources}
          initialViewData={getViewCollection(
            taggedCollection[selectedTag],
            library
          )}
          updateCollection={(updatedCollection) => {
            taggedCollection[selectedTag] = updatedCollection;
            saveData(TAG_KEY, taggedCollection);
            setTaggedCollection(getTaggedCollection());
          }}
        />
      )}
    </>
  );
};

export default ViewTaggedCollection;
