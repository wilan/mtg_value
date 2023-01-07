import React, { useState } from "react";
import SelectTag from "./SelectTag";
import { DataSources } from "./dataTypes";
import {
  COLLECTION_KEY,
  LIBRARY_KEY,
  TAG_KEY,
  fetchCard,
  getCardCollection,
  getCollection,
  getLibrary,
  getTaggedCollection,
  saveData,
  updateCardCollection,
  updateTagCollection,
} from "./utility";

interface ParsedInput {
  [set: string]: {
    [number: string]: {
      reg?: number;
      foil?: number;
    };
  };
}

const parseInput = (text: string) => {
  const result: ParsedInput = {};
  let set = "";
  text.split("\n").forEach((line) => {
    // is a set if not a number and matches regex
    const tokens = line.split(/\s+/);
    if (line.length === 0) {
      // empty line
    } else if (
      tokens.length === 1 &&
      isNaN(Number(tokens[0])) &&
      tokens[0].match(/^[A-Z0-9]+$/) &&
      tokens[0].match(/[A-Z]/)
    ) {
      set = tokens[0].toLocaleLowerCase();
    } else {
      const number = tokens[0].replace("*", "");
      const type = number.length === tokens[0].length ? "reg" : "foil";
      const quantity = Number(tokens[1]) || 1;
      result[set] ||= {};
      result[set][number] ||= {};
      result[set][number][type] = (result[set][number][type] || 0) + quantity;
    }
  });
  return result;
};

const BulkUpload = ({ dataSources }: { dataSources: DataSources }) => {
  const {
    collection,
    setCollection,
    library,
    setLibrary,
    taggedCollection,
    setTaggedCollection,
  } = dataSources;
  const [override, setOverride] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  //const [errors, setErrors] = useState("");
  const helpText = `Format:
(
  [A-Z0-9]{3}
  ({number}\\*? {quantity}?\\n)*
)*

Example:
NEO
123*
123 4
DMU
154
31*

Translation:
4x NEO#123
1x NEO#123(foil)
1x DMU#153
1x DMU#31(foil)
`;

  const upload = async () => {
    const json: ParsedInput = JSON.parse(jsonInput);
    // validate first

    console.log(json);
    const isValid = await (async () => {
      let previousRequestTime = 1;
      for (let [set, cards] of Object.entries(json)) {
        for (let [number] of Object.entries(cards)) {
          const currRequestTime = Date.now();
          const card = await fetchCard(
            set,
            number,
            library,
            false,
            previousRequestTime
          );
          previousRequestTime = currRequestTime;
          if (!card) {
            window.alert(`Invalid card set: ${set}, number: ${number}`);
            return false;
          }
        }
      }
      return true;
    })();

    saveData(LIBRARY_KEY, library);
    setLibrary(getLibrary());

    if (!isValid) {
      return;
    }

    for (let [set, cards] of Object.entries(json)) {
      for (let [number] of Object.entries(cards)) {
        const cardCollection = getCardCollection(set, number, collection);
        const addReg = json[set][number].reg;
        const addFoil = json[set][number].foil;
        if (addReg) {
          cardCollection.regQty =
            (override ? 0 : cardCollection.regQty) + addReg;
        }
        if (addFoil) {
          cardCollection.foilQty =
            (override ? 0 : cardCollection.foilQty) + addFoil;
        }
        updateCardCollection(cardCollection, collection, false);

        if (selectedTag) {
          const currCollection = getCardCollection(set, number, taggedCollection[selectedTag]);
          currCollection.foilQty += (addFoil || 0);
          currCollection.regQty += (addReg || 0);
          updateTagCollection(taggedCollection, selectedTag, currCollection, false);
        }
      }
    }

    saveData(COLLECTION_KEY, collection);
    setCollection(getCollection());
    if (selectedTag) {
      saveData(TAG_KEY, taggedCollection);
      setTaggedCollection(getTaggedCollection());
    }

    window.alert("Upload successful");
  };
  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>
              <label title="By default quantities are added, quantities corresponding to imported cards will be reset to 0 before importing.">
                Override Existing Quantities
              </label>
              <input
                type="checkbox"
                checked={override}
                onChange={() => setOverride(!override)}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label>Select Tag</label>
              <SelectTag
                taggedCollection={taggedCollection}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>
              <textarea
                placeholder={helpText}
                style={{ width: "300px", height: "500px" }}
                defaultValue={uploadText}
                onBlur={(e) => setUploadText(e.target.value)}
              />
            </td>
            <td>
              <textarea
                placeholder={"Parsed JSON"}
                style={{ width: "300px", height: "500px" }}
                value={jsonInput}
                disabled
              />
            </td>
          </tr>
          <tr>
            <td>
              <button
                onClick={() =>
                  setJsonInput(JSON.stringify(parseInput(uploadText), null, 2))
                }
              >
                Parse
              </button>
            </td>
            <td>
              <button onClick={upload} disabled={jsonInput.length === 0}>
                Import
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default BulkUpload;
