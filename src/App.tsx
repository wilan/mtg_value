import React, { useState } from "react";
import AddCard from "./AddCards";
import "./App.css";
import BulkUpload from "./BulkUpload";
import EvCalc from "./EvCalc";
import ExportData from "./ExportData";
import SetView from "./SetView";
import ViewCollection from "./ViewCollection";
import ViewTaggedCollection from "./ViewTaggedCollection";
import { DataSources } from "./dataTypes";
import {
  getCollection,
  getEv,
  getLibrary,
  getSetMapping,
  getTaggedCollection
} from "./utility";

const ADD_CARD = "Add Cards";
const BULK_UPLOAD = "Bulk Upload";
const COLLECTION = "View Collection";
const TAGGED_COLLECTION = "View Tagged Collection";
const SET_VIEW = "Manage Sets";
const EV_CALC = "Set EV";
const EXPORT = "Export Data";

const ALL_TABS = [
  ADD_CARD,
  BULK_UPLOAD,
  SET_VIEW,
  COLLECTION,
  TAGGED_COLLECTION,
  EV_CALC,
  EXPORT,
] as const;
type TAB_KEY = typeof ALL_TABS;
type TAB = TAB_KEY[number];

// for pokemon https://docs.pokemontcg.io/api-reference/cards/get-card
const App = () => {
  const [library, setLibrary] = React.useState(getLibrary());
  const [collection, setCollection] = React.useState(getCollection());
  const [taggedCollection, setTaggedCollection] = React.useState(
    getTaggedCollection()
  );
  const [ev, setEv] = React.useState(getEv());
  const [setMapping, setSetMapping] = useState(getSetMapping());
  const [tab, setTab] = useState<TAB>(ADD_CARD);
  const dataSources: DataSources = {
    library,
    setLibrary,
    collection,
    setCollection,
    taggedCollection,
    setTaggedCollection,
    ev,
    setEv,
    setMapping,
    setSetMapping,
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            {ALL_TABS.map((tab) => (
              <td key={tab}>
                <button onClick={() => setTab(tab)}>{tab}</button>
              </td>
            ))}
          </tr>
        </thead>
      </table>
      {tab === ADD_CARD && <AddCard dataSources={dataSources} />}
      {tab === BULK_UPLOAD && <BulkUpload dataSources={dataSources} />}
      {tab === SET_VIEW && <SetView dataSources={dataSources} />}
      {tab === EXPORT && <ExportData dataSources={dataSources} />}
      {tab === COLLECTION && <ViewCollection dataSources={dataSources} />}
      {tab === TAGGED_COLLECTION && (
        <ViewTaggedCollection dataSources={dataSources} />
      )}
      {tab === EV_CALC && <EvCalc dataSources={dataSources} />}
    </>
  );
};

export default App;
