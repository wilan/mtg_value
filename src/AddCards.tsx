import React from "react";
import { Card, CardCollection, DataSources } from "./dataTypes";
import {
  coerceNumber,
  fetchCard,
  getCardCollection,
  getCollection,
  getLibrary,
  getTaggedCollection,
  updateCardCollection,
  updateTagCollection,
} from "./utility";
import AddCardTable from "./AddCardTable";

const AddCard = ({ dataSources }: { dataSources: DataSources }) => {
  const { library, setLibrary, collection, setCollection, taggedCollection, setTaggedCollection } =
    dataSources;
  const [card, setCard] = React.useState<Card | null>(null);
  const [cardCollection, setCardCollection] =
    React.useState<CardCollection | null>(null);

  const addCard = async (setSymbol: string, number: string, foil: boolean, selectedTag?: string) => {
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
    }
    if (selectedTag) {
      const currCollection = getCardCollection(setSymbol, number, taggedCollection[selectedTag]);
      currCollection.foilQty += foil ? 1 : 0;
      currCollection.regQty += foil ? 0 : 1;
      updateTagCollection(taggedCollection, selectedTag, currCollection);
      setTaggedCollection(getTaggedCollection());
    }
    setLibrary(getLibrary());
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
      <AddCardTable dataSources={dataSources} addCard={addCard} showTagSelector/>
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
