import React from "react";
import { DataSources } from "./dataTypes";
import {
  COLLECTION_KEY,
  DataKey,
  EV_KEY,
  LIBRARY_KEY,
  SET_MAPPING_KEY,
  TAG_KEY,
  copyData,
  getCollection,
  getEv,
  getLibrary,
  getSetMapping,
  getTaggedCollection,
  importData,
  resetData,
} from "./utility";

const DEBUG_ENABLED = false;

const ExportData = ({ dataSources }: { dataSources: DataSources }) => {
  const {
    library,
    collection,
    taggedCollection,
    ev,
    setLibrary,
    setCollection,
    setTaggedCollection,
    setEv,
  } = dataSources;
  const keys: DataKey[] = [COLLECTION_KEY, LIBRARY_KEY, TAG_KEY, EV_KEY, SET_MAPPING_KEY];
  const reload = () => {
    setLibrary(getLibrary());
    setCollection(getCollection());
    setTaggedCollection(getTaggedCollection());
    setEv(getEv());
  };
  return (
    <>
      <button onClick={() => copyData(library)}>Library</button>
      <button onClick={() => copyData(collection)}>Collection</button>
      <button onClick={() => copyData(taggedCollection)}>
        Tagged Collection
      </button>
      <button onClick={() => copyData(ev)}>EV Data</button>
      <button onClick={() => copyData(getSetMapping())}>Set Mapping</button>
      {DEBUG_ENABLED && (
        <table>
          <tbody>
            {keys.map((key) => (
              <tr key={key}>
                <td>
                  <button
                    onClick={() => {
                      resetData(key);
                      reload();
                    }}
                  >
                    Reset {key}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      importData(key);
                      reload();
                    }}
                  >
                    Import {key}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ExportData;
