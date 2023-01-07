import React from "react";
import SelectTag from "./SelectTag";
import { DataSources } from "./dataTypes";

const AddCardTable = ({
  dataSources,
  addCard,
  showTagSelector,
}: {
  dataSources: DataSources;
  addCard: (
    setSymbol: string,
    number: string,
    foil: boolean,
    selectedTag?: string
  ) => Promise<void>;
  showTagSelector: boolean;
}) => {
  const { taggedCollection, setMapping } = dataSources;
  const [foil, setFoil] = React.useState(false);
  const [setSymbol, setSetSymbol] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("");

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>
              <label style={{ marginRight: "15px" }}>Foil</label>
            </td>
            <td>
              <label style={{ marginRight: "15px" }}>Set Symbol</label>
            </td>
            <td>
              <label style={{ marginRight: "15px" }}>Number</label>
            </td>
            {showTagSelector && (
              <td>
                <label style={{ marginRight: "15px" }}>Tag</label>
              </td>
            )}
            <td></td>
          </tr>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={foil}
                onChange={() => setFoil(!foil)}
              />
            </td>
            <td>
              <select
                onChange={(e) => {
                  setSetSymbol(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" disabled hidden></option>
                {Object.keys(setMapping).map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="text"
                style={{ width: "45px" }}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addCard(setSymbol, number, foil, selectedTag);
                  }
                }}
                onFocus={(e) => e.target.select()}
              />
            </td>
            {showTagSelector && (
              <td>
                <SelectTag
                  taggedCollection={taggedCollection}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                />
              </td>
            )}
            <td>
              <button
                onClick={async () =>
                  await addCard(setSymbol, number, foil, selectedTag)
                }
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default AddCardTable;
