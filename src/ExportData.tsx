import React from "react";
import { Collection, copyData, importData, Library, resetData } from "./utility";

const DEBUG_ENABLED = false;

const ExportData = ({library, collection}: {library: Library, collection: Collection}) => {
  return <>
    <button onClick={() => copyData(library)}>Library</button>
    <button onClick={() => copyData(collection)}>Collection</button>
    {DEBUG_ENABLED && <button onClick={() => importData()}>Import From JSON</button>}
    {DEBUG_ENABLED && <button onClick={() => resetData()}>Reset Data</button>}
  </>;
}

export default ExportData;