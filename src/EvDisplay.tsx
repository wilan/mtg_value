import React, { useState } from "react";
import { Card, DataSources } from "./dataTypes";

const CARD_DISPLAY_LIMIT = 25;

type EvColumnConfig = {
  header: string;
  render: (data: Card) => JSX.Element;
};

const useEvColumnConfigs = ({
  foil,
  labels,
  onSelectTag,
  setLabels,
}: {
  foil: boolean;
  labels: string[];
  onSelectTag: (card: Card, oldTag: string, newTag: string) => void;
  setLabels: { [set: string]: { [number: string]: string } };
}): EvColumnConfig[] => {
  return [
    {
      header: "Name",
      render: (card: Card) => <label>{card.name}</label>,
    },
    {
      header: "Price",
      render: (card: Card) => (
        <label>${foil ? card.foilPrice : card.regPrice}</label>
      ),
    },
    {
      header: "Number",
      render: (card: Card) => (
        <label>{card.number}</label>
      ),
    },
    {
      header: "Rarity",
      render: (card: Card) => <label>{card.rarity}</label>,
    },
    {
      header: "Card Image",
      render: (data: Card) => <img alt="card" src={data.urlSmall} />,
    },
    {
      header: "Type",
      render: (card: Card) => {
        const cardLabel = setLabels[card.set]?.[card.number] ?? "";
        return (
          <select
            value={cardLabel}
            onChange={(e) => onSelectTag(card, cardLabel, e.target.value)}
          >
            <option value={""}> -- select a type -- </option>
            {labels.map((tagName) => (
              <option value={tagName} key={tagName}>
                {tagName}
              </option>
            ))}
          </select>
        );
      },
    },
  ];
};

export const EvDisplay = ({
  cards,
  foil,
  labels,
  onSelectTag,
  setLabels,
}: {
  dataSources: DataSources;
  foil: boolean;
  labels: string[];
  onSelectTag: (card: Card, oldTag: string, newTag: string) => void;
  setLabels: { [set: string]: { [number: string]: string } };
  cards: Card[];
}) => {
  const columnConfigs = useEvColumnConfigs({
    foil,
    labels,
    onSelectTag,
    setLabels,
  });
  const [pageNum, setPageNum] = useState(0);
  const priceFn = (c: Card) => (foil ? c.foilPrice : c.regPrice);
  const viewData = cards.sort((x, y) => priceFn(y) - priceFn(x));
  const prevPage = () => {
    setPageNum(Math.max(0, pageNum - 1));
  };

  const nextPage = () => {
    setPageNum(
      Math.min(pageNum + 1, Math.ceil(viewData.length / CARD_DISPLAY_LIMIT - 1))
    );
  };
  const displayedCollectionData = viewData.slice(
    CARD_DISPLAY_LIMIT * pageNum,
    CARD_DISPLAY_LIMIT * (pageNum + 1)
  );
  return (
    <>
      <button onClick={prevPage}>&lt;</button>{" "}
      <button onClick={nextPage}>&gt;</button>(
      {CARD_DISPLAY_LIMIT * pageNum + 1} to{" "}
      {Math.min(viewData.length, CARD_DISPLAY_LIMIT * (pageNum + 1))}
      {" of "}
      {viewData.length})
      <br />
      <label>Tag All</label>
      <select
        onChange={(e) => {
          cards.forEach((card) => {
            const cardLabel = setLabels[card.set]?.[card.number] ?? "";
            onSelectTag(card, cardLabel, e.target.value);
          });
        }}
      >
        <option value={""}> -- select a type -- </option>
        {labels.map((tagName) => (
          <option value={tagName} key={tagName}>
            {tagName}
          </option>
        ))}
      </select>
      <table className={"collection-table"}>
        <thead>
          <tr>
            {columnConfigs.map((x) => (
              <th key={x.header}>{x.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedCollectionData.map((card) => (
            <tr key={card.urlSmall}>
              {columnConfigs.map((config) => (
                <td key={config.header}>{config.render(card)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={prevPage}>&lt;</button>{" "}
      <button onClick={nextPage}>&gt;</button>(
      {CARD_DISPLAY_LIMIT * pageNum + 1} to{" "}
      {Math.min(viewData.length, CARD_DISPLAY_LIMIT * (pageNum + 1))}
      {" of "}
      {viewData.length})
    </>
  );
};

export default EvDisplay;
