import React from "react";
import {
  getLibrary,
  getCollection,
  Card,
  CardCollection,
  fetchCard,
  getCardCollection,
  updateCardCollection,
  Library,
  Collection,
  coerceNumber,
} from "./utility";

const AddCard = ({
  library,
  setLibrary,
  collection,
  setCollection,
}: {
  library: Library;
  setLibrary: (val: Library) => void;
  collection: Collection;
  setCollection: (val: Collection) => void;
}) => {
  const [setSymbol, setSetSymbol] = React.useState("");
  const [number, setNumber] = React.useState(0);
  const [foil, setFoil] = React.useState(false);
  const [card, setCard] = React.useState<Card | null>(null);
  const [cardCollection, setCardCollection] =
    React.useState<CardCollection | null>(null);

  const addCard = async () => {
    const result = await fetchCard(setSymbol, number, library);
    if (result) {
      setCard(result);
      const currCollection = getCardCollection(setSymbol, number, collection);
      currCollection.foilQty += foil ? 1 : 0;
      currCollection.regQty += foil ? 0 : 1;
      setCardCollection(currCollection);
      updateCardCollection(currCollection, collection);
      setLibrary(getLibrary());
      setCollection(getCollection());
      //setFoil(false);
    }
  };

  const refreshCard = async () => {
    if (!card) {
      return;
    }
    await fetchCard(card.set, card.number, library, true);
    setLibrary(getLibrary());
  };

  const setAndUpdateCollection = (updatedCardCollection: CardCollection) => {
    setCardCollection(updatedCardCollection);
    updateCardCollection(updatedCardCollection, collection);
    setCollection(getCollection());
  };

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
              <input
                type="text"
                style={{ width: "45px" }}
                value={setSymbol}
                onChange={(e) => setSetSymbol(e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                style={{ width: "45px" }}
                value={number}
                onChange={(e) => setNumber(coerceNumber(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addCard();
                  }
                }}
                onFocus={(e) => e.target.select()}
              />
            </td>
            <td>
              <button onClick={() => addCard()}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
      {cardCollection && card && (
        <table>
          <tbody>
            <tr>
              <td>Regular Quantity </td>
              <td>
                <input
                  type="text"
                  value={cardCollection.regQty}
                  onChange={(e) =>
                    setAndUpdateCollection({
                      ...cardCollection,
                      regQty: coerceNumber(e.target.value),
                    })
                  }
                  style={{ width: "45px" }}
                />
              </td>
              <td>${card.regPrice}</td>
            </tr>
            <tr>
              <td>Foil Quantity</td>
              <td>
                <input
                  type="text"
                  onChange={(e) =>
                    setAndUpdateCollection({
                      ...cardCollection,
                      foilQty: coerceNumber(e.target.value),
                    })
                  }
                  value={cardCollection.foilQty}
                  style={{ width: "45px" }}
                />
              </td>
              <td>${card.foilPrice}</td>
            </tr>
          </tbody>
        </table>
      )}
      {card && (
        <table>
          <tbody>
            <tr>
              <td>
                <button onClick={() => refreshCard()}>Refresh Prices</button>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  alt="card"
                  src={card.urlNormal}
                  style={{ width: "300px" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

export default AddCard;
