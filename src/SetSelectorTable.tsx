import React from "react";
import { Library } from "./dataTypes";

const NUM_SET_PER_ROW = 4;

export const SetSelectorTable = ({
  library,
  selectedSets,
  setSelectedSets,
}: {
  selectedSets: Set<string>;
  setSelectedSets: (newSet: Set<string>) => void;
  library: Library;
}) => {
  const allSets = Object.keys(library);
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

export default SetSelectorTable;