import React from "react";
import { TaggedCollection } from "./dataTypes";

export const SelectTag = ({
  selectedTag,
  setSelectedTag,
  taggedCollection,
}: {
  selectedTag?: string;
  setSelectedTag: (s: string) => void;
  taggedCollection: TaggedCollection;
}) => {
  return (
    <>
      <input
        type="text"
        list="tags"
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
      />
      <datalist id="tags">
        {Object.keys(taggedCollection).map((s) => (
          <option key={s}>{s}</option>
        ))}{" "}
      </datalist>
    </>
  );
};

export default SelectTag;
