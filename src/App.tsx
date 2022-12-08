import React, { useState } from "react";
import AddCard from "./AddCards";
import "./App.css";
import ExportData from "./ExportData";
import SetView from "./SetView";
import { getCollection, getLibrary } from "./utility";
import ViewCollection from "./ViewCollection";

const ADD_CARD = "Add Cards";
const COLLECTION = "View Collection";
const EXPORT = "Export Data";
const SET_VIEW = "Manage Sets";

const ALL_TABS = [ADD_CARD, SET_VIEW, COLLECTION, EXPORT] as const;
type TAB_KEY = typeof ALL_TABS;
type TAB = TAB_KEY[number];

const App = () => {
  const [library, setLibrary] = React.useState(getLibrary());
  const [collection, setCollection] = React.useState(getCollection());
  const [tab, setTab] = useState<TAB>(ADD_CARD);

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
      {tab === ADD_CARD && (
        <AddCard
          library={library}
          setLibrary={setLibrary}
          collection={collection}
          setCollection={setCollection}
        />
      )}
      {tab === SET_VIEW && (
        <SetView
          library={library}
          setLibrary={setLibrary}
          collection={collection}
          setCollection={setCollection}
        />
      )}
      {tab === EXPORT && (
        <ExportData library={library} collection={collection} />
      )}
      {tab === COLLECTION && (
        <ViewCollection
          library={library}
          setLibrary={setLibrary}
          collection={collection}
          setCollection={setCollection}
        />
      )}
    </>
  );
};

export default App;
