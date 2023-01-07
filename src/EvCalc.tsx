import React, { useState } from "react";
import EvDisplay from "./EvDisplay";
import SetSelectorTable from "./SetSelectorTable";
import { Card, CardCollection, DataSources } from "./dataTypes";
import {
  EV_KEY,
  batchFetch,
  coerceNumber,
  getEv,
  getLibrary,
  numberCmp,
  saveData,
} from "./utility";

const ANY = "any";

const Checkbox = ({
  value,
  setValue,
  display,
}: {
  value: boolean;
  setValue: (b: boolean) => void;
  display: string;
}) => {
  return (
    <>
      <input
        type="checkbox"
        checked={value}
        onChange={() => setValue(!value)}
      />{" "}
      {display}
    </>
  );
};

const EvCalc = ({ dataSources }: { dataSources: DataSources }) => {
  const { library, ev, setEv, setLibrary } = dataSources;
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSets, setSelectedSets] = useState(new Set<string>());
  const [newCardType, setNewCardType] = useState("");
  const [selectedRarities, setSelectedRarities] = useState<Set<String>>(
    new Set<String>(["any"])
  );
  const [priceFloor, setPriceFloor] = useState(0);

  // filters
  const [showVariants, setShowVariants] = useState(false);
  const [showFoils, setShowFoils] = useState(false);
  const [showSets, setShowSets] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState(new Set([ANY]));
  const evData = ev[selectedProduct];

  const setLabels: { [set: string]: { [number: string]: string } } = {};
  if (evData) {
    Object.entries(evData.types).forEach(([cardType, cards]) => {
      const labels = showFoils ? cards.foilLabels : cards.regularLabels;
      Object.entries(labels).forEach(([set, numbers]) => {
        setLabels[set] ||= {};
        Object.keys(numbers).forEach(
          (number) => (setLabels[set][number] = cardType)
        );
      });
    });
  }
  const possibleRarities = new Set<string>();
  const getFilteredCards = (): Card[] => {
    let filteredCards: Card[] = [];

    if (!evData) {
      return filteredCards;
    }

    // set filter
    selectedSets.forEach((set) => {
      filteredCards = filteredCards.concat(
        Object.values(library[set]?.cards || {})
      );
    });

    if (!showVariants) {
      const uniqueCards: { [name: string]: Card } = {};
      filteredCards.forEach((c: Card) => {
        if (
          !uniqueCards[c.name] ||
          numberCmp(c.number, uniqueCards[c.name].number) < 0
        ) {
          uniqueCards[c.name] = c;
        }
      });
      filteredCards = Object.values(uniqueCards);
    }

    filteredCards = filteredCards.filter((c) => {
      const cardLabel = evData && setLabels[c.set]?.[c.number];
      const labelFilter =
        selectedLabels.size > 0
          ? cardLabel &&
            (selectedLabels.has(cardLabel) || selectedLabels.has(ANY))
          : !cardLabel;
      const rarityFilter =
        selectedRarities.has(ANY) || selectedRarities.has(c.rarity);
      const priceFilter = (showFoils ? c.foilPrice : c.regPrice) >= priceFloor;
      possibleRarities.add(c.rarity);
      return labelFilter && rarityFilter && priceFilter;
    });

    return filteredCards;
  };

  const cards = getFilteredCards();
  const rarityTable = evData && (
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <b>Rarity Filters: </b>
            </td>
            {[...Array.from(possibleRarities), ANY].map((type) => (
              <td key={type}>
                <input
                  type="checkbox"
                  checked={selectedRarities.has(type)}
                  onChange={() => {
                    const newSelection = new Set(selectedRarities);
                    !newSelection.delete(type) && newSelection.add(type);
                    setSelectedRarities(newSelection);
                  }}
                />{" "}
                {type}
              </td>
            ))}
          </tr>
          <tr>
            <td>
              <b>Label Filters: </b>
            </td>
            {[...Object.keys(evData.types), ANY].map((label) => (
              <td key={label}>
                <input
                  type="checkbox"
                  checked={selectedLabels.has(label)}
                  onChange={() => {
                    const newSelection = new Set(selectedLabels);
                    !newSelection.delete(label) && newSelection.add(label);
                    setSelectedLabels(newSelection);
                  }}
                />
                {label}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
  const persistAndRefresh = () => {
    saveData(EV_KEY, ev);
    setEv(getEv());
  };

  const setInferSelectedSet = (targetSelectedProduct: string) => {
    if (!ev[targetSelectedProduct]) {
      return;
    }
    const sets = Object.values(ev[targetSelectedProduct].types)
      .map((cardDatas) =>
        Object.keys(cardDatas.foilLabels)
          .filter((set) => Object.keys(cardDatas.foilLabels[set]).length > 0)
          .concat(
            Object.keys(cardDatas.regularLabels).filter(
              (set) => Object.keys(cardDatas.regularLabels[set]).length > 0
            )
          )
      )
      .flat();
    setSelectedSets(new Set(sets));
    if (sets.length > 0) {
      setShowSets(false);
      setSelectedLabels(new Set([ANY]));
    }
  };

  const addProduct = () => {
    if (!selectedProduct || selectedProduct in ev) {
      return;
    }

    const defaultDescription = `Default Draft Box:
rare = 36 packs * 6.5 / 7.5 * 1.0333 foil / 60 cards = .537
mythic = 36 packs * 1 / 7.5 * 1.0333 foil / 20 cards = .248`;

    ev[selectedProduct] = {
      description: defaultDescription,
      types: {
        mainset_rare: {
          rate: 0.537,
          regularLabels: {},
          foilLabels: {},
        },
        mainset_mythic: {
          rate: 0.248,
          regularLabels: {},
          foilLabels: {},
        },
      },
    };
    persistAndRefresh();
    setSelectedProduct(selectedProduct);
    setSelectedSets(new Set());
  };

  const deleteProduct = () => {
    if (selectedProduct && selectedProduct in ev) {
      delete ev[selectedProduct];
      persistAndRefresh();
      setSelectedProduct("");
    }
  };

  const addCardType = () => {
    if (!newCardType || newCardType in ev[selectedProduct]) {
      return;
    }
    ev[selectedProduct].types[newCardType] = {
      rate: 0,
      regularLabels: {},
      foilLabels: {},
    };
    persistAndRefresh();
  };

  const slotEvs: { [type: string]: number } = {};
  let totalEv = 0;
  if (evData) {
    Object.entries(evData.types).forEach(([type, cards]) => {
      slotEvs[type] = 0;
      Object.entries(cards.regularLabels).forEach(([set, numbers]) => {
        Object.keys(numbers).forEach((number) => {
          const card = library[set].cards[number];
          if (card) {
            const price = card.regPrice;
            if (price >= priceFloor) {
              totalEv += price * cards.rate;
              slotEvs[type] += price * cards.rate;
            }
          }
        });
      });
      Object.entries(cards.foilLabels).forEach(([set, numbers]) => {
        Object.keys(numbers).forEach((number) => {
          const card = library[set].cards[number];
          if (card) {
            const price = card.foilPrice;
            if (price >= priceFloor) {
              totalEv += price * cards.rate;
              slotEvs[type] += price * cards.rate;
            }
          }
        });
      });
    });
  }

  const refreshPrices = async () => {
    let cardsToFetch: CardCollection[] = [];
    Object.values(evData.types).forEach((cards) => {
      Object.entries(cards.regularLabels).forEach(([set, numbers]) => {
        Object.keys(numbers).forEach((number) => {
          if (cards.rate > 0) {
            cardsToFetch.push({ set, number, regQty: 0, foilQty: 0 });
          }
        });
      });
      Object.entries(cards.foilLabels).forEach(([set, numbers]) => {
        Object.keys(numbers).forEach((number) => {
          if (cards.rate > 0) {
            cardsToFetch.push({ set, number, regQty: 0, foilQty: 0 });
          }
        });
      });
    });
    const success = await batchFetch(library, cardsToFetch);
    if (!success) {
      window.alert("Only some cards refreshed, please issue another request");
    }
    setLibrary(getLibrary());
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Product:</td>
            <td>
              <input
                type="text"
                list="products"
                value={selectedProduct}
                onChange={(e) => {
                  const targetSelectedProduct = e.target.value;
                  setSelectedProduct(targetSelectedProduct);
                  if (targetSelectedProduct in ev) {
                    setInferSelectedSet(e.target.value);
                  }
                }}
              />
              <datalist id="products">
                {Object.keys(ev).map((product) => (
                  <option key={product}>{product}</option>
                ))}{" "}
              </datalist>
            </td>
            <td>
              {selectedProduct && !(selectedProduct in ev) && (
                <button onClick={addProduct}>Add</button>
              )}
              {selectedProduct in ev && (
                <button onClick={deleteProduct}>Delete</button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      {evData && (
        <>
          <label>Description:</label>
          <textarea
            defaultValue={evData.description}
            onBlur={(e) => {
              evData.description = e.target.value;
              persistAndRefresh();
            }}
            onFocus={(e) => (e.currentTarget.value = evData.description)}
            style={{ width: "500px", height: "75px" }}
          />
          <br />

          <div style={{ marginTop: "45px", marginBottom: "10px" }}>
            <label>Add Card Type:</label>
            <input
              type="text"
              value={newCardType}
              onChange={(e) => setNewCardType(e.target.value)}
            />
            <button onClick={addCardType}>Add</button>
          </div>

          <table className={"collection-table"}>
            <thead>
              <tr>
                <th>{selectedProduct}</th>
                <th>Rate Per Box</th>
                <th>Count</th>
                <th>Slot Average</th>
                <th>Slot EV</th>
                <th>Delete Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(evData.types).map((type) => {
                let count = 0;
                Object.values(evData.types[type].regularLabels).forEach(
                  (numbers) => (count += Object.keys(numbers).length)
                );
                Object.values(evData.types[type].foilLabels).forEach(
                  (numbers) => (count += Object.keys(numbers).length)
                );
                return (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>
                      <input
                        type="text"
                        defaultValue={evData.types[type].rate}
                        onBlur={(e) => {
                          const newRate = coerceNumber(e.target.value);
                          evData.types[type].rate = newRate;
                          persistAndRefresh();
                        }}
                      />
                    </td>
                    <td>{count}</td>
                    <td>
                      $
                      {evData.types[type].rate > 0
                        ? (
                            slotEvs[type] /
                            evData.types[type].rate /
                            count
                          ).toFixed(2)
                        : 0}
                    </td>
                    <td>${(slotEvs[type] || 0).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => {
                          delete evData.types[type];
                          persistAndRefresh();
                        }}
                      >
                        x
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td>
                  <b>Total EV</b>
                </td>
                <td colSpan={5}>
                  <b>${totalEv.toFixed(2)}</b>
                </td>
              </tr>
            </tbody>
          </table>

          {rarityTable}
          <div>
            <Checkbox
              value={showVariants}
              setValue={setShowVariants}
              display="Variants"
            />
            <Checkbox
              value={showFoils}
              setValue={setShowFoils}
              display="Foils"
            />
            <Checkbox
              value={showSets}
              setValue={setShowSets}
              display="Show Sets"
            />
            <br />
            Price Floor:{" "}
            <input
              type="text"
              defaultValue="0"
              onBlur={(e) => setPriceFloor(coerceNumber(e.target.value))}
            />
            <button onClick={async () => await refreshPrices()}>
              Refresh Prices
            </button>
          </div>
          {showSets && (
            <SetSelectorTable
              library={library}
              selectedSets={selectedSets}
              setSelectedSets={setSelectedSets}
            />
          )}
          <EvDisplay
            dataSources={dataSources}
            foil={showFoils}
            labels={Object.keys(evData.types)}
            onSelectTag={(card: Card, oldTag: string, newTag: string) => {
              if (oldTag === newTag) {
                return;
              }
              if (oldTag) {
                const oldCards = evData.types[oldTag];
                const oldLabels = showFoils
                  ? oldCards.foilLabels
                  : oldCards.regularLabels;
                delete oldLabels[card.set][card.number];
              }

              if (newTag) {
                const cards = evData.types[newTag];
                const labels = showFoils
                  ? cards.foilLabels
                  : cards.regularLabels;
                labels[card.set] ||= {};
                labels[card.set][card.number] = true;
              }
              persistAndRefresh();
            }}
            setLabels={setLabels}
            cards={cards}
          />
        </>
      )}
    </>
  );
};

export default EvCalc;
