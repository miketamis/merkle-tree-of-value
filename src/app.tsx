import React, { useEffect, useState } from "react";
import { Api } from "@cennznet/api";

import Simulator from "./Simulator";

const COLLECTION_ID = 1;

const CURRENT_VERSION = "0.0.5";

export default () => {
  const [api, setApi] = useState(undefined);
  const [versions, setVersions] = useState([]);
  useEffect(() => {
    if (!api) {
      const provider = "wss://cennznet.unfrastructure.io/public/ws";
      Api.create({ provider }).then((_api: any) => {
        setApi(_api);
      });
    }
  }, []);

  async function thing() {
    if (!api) {
      return;
    }
    const nextSeriesId = await api.query.nft.nextSeriesId(COLLECTION_ID);
    const versionsPromise = [];
    for (let i = 0; i < nextSeriesId; i++) {
      versionsPromise.push(api.query.nft.seriesAttributes(COLLECTION_ID, i));
    }
    const _versions = await Promise.all(versionsPromise);
    setVersions(_versions.map((version) => version.toJSON()));
  }
  useEffect(() => {
    thing();
  }, [api]);

  function goToLink(url: string) {
    window.location.href = url;

    const timeout = setTimeout(() => {
      window.location.href = url.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
    }, 300);
    window.onblur = function () {
      clearTimeout(timeout);
    };
  }

  const [showVersions, setShowVersions] = useState(false);

  return (
    <div>
      <div className="header">
        <h1> Merkle Tree of Value</h1>
        <h3>by Mike Tamis</h3>
        <h2>
          Version: {CURRENT_VERSION}{" "}
          {!!versions.length &&
            versions[versions.length - 1][0].Text !== CURRENT_VERSION && (
              <button
                onClick={() => goToLink(versions[versions.length - 1][1].Url)}
                type="button"
                className="secondary"
              >
                New Version Avaliable
              </button>
            )}
        </h2>

        {showVersions ? (
          <div>
            <h2>Versions</h2>
            {versions.map((vers) => {
              const version = vers[0].Text;
              const url = vers[1].Url || vers[1].Text;
              const changes = vers[2] ? vers[2].Text : "First";
              return (
                <div className="version">
                  <h3>Version: {version}</h3>
                  <p> {changes}</p>
                  <br></br>
                  <button
                    onClick={() => {
                      goToLink(url);
                    }}
                  >
                    open
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <button type="button" onClick={() => setShowVersions(true)}>
            Show Versions
          </button>
        )}
      </div>
      <div className="content">
        <p>
          The Merkle Tree of Value is a new way to store token balances, it an
          efficient at doing fungible and non-fungible tokens, as well as let
          you mix. This leads to a new category of token semi-fungible tokens,
          because with the Merkle tree of values you can make NFT behave like
          FT. This leads to a whole new world of assests, that to some are
          fungible but others non-fungible, think about how some real life
          physical coins and stamps have more value to some.
        </p>
        <h2>But what is it?</h2>
        <p>
          The Merkle tree of value, is like the name suggests a Merkle Tree. The
          tree has three different types of leaf nodes Fungible, Non-Fungible,
          Numbered. A tree could have any number of these leaf nodes and mix and
          match, to create whatever assest you want.
        </p>
        <h3>Fungible Leaf - Fungible Token Example</h3>
        <p>
          A 100% FT would just have 1 leaf and that would be single Fungible
          Token. Theses demo have 1 slider, this is to demostrate a naive
          transfer algorithms, you could of course implement whatever transfer
          algorithms you would like, enabling you to transfer indivual tokens,
          you could also shape your tree in particular ways to optimise movement
          of particular sub-trees.
        </p>
        <Simulator
          bobLeafs={[
            {
              type: "fungible",
              serialNumber: 1,
              value: 100,
              name: "Fungible Token",
            },
          ]}
        />
        <h3>NFT Leaf - NFT Collection Example</h3>
        <p>
          A collection of NFTs would just be a bunch of Non-Fungible leafs. But
          here’s the cool part, not only can you use the collection of NFTs like
          there a fungible token, this is because each NFT has a value. When we
          transfer like its a Fungible token we can optimise by take whole sub
          trees of certain values and moving them over, the algorithms used in
          this example is quite naive, but this will be an area of research as
          different tokens will have different requirements about how to
          transfer and shape their Merkle trees of value.
        </p>
        <Simulator
          bobLeafs={[
            {
              type: "nft",
              serialNumber: 1,
              value: 10,
              name: "Medium Rare NFT",
            },
            {
              type: "nft",
              serialNumber: 2,
              value: 5,
              name: "Common NFT",
            },
            {
              type: "nft",
              serialNumber: 3,
              value: 10,
              name: "Another Medium Rare NFT",
            },
            {
              type: "nft",
              serialNumber: 4,
              value: 15,
              name: "Super Rare NFT",
            },
          ]}
        />
        <h3>Numbered Leaf - Trading Card Example</h3>
        Now the final leaf node, this is like NFT as each unit is unique because
        its numbered, however it shares the same property as all other in its
        set. A good example of this would be trading cards.
        <Simulator
          bobLeafs={[
            {
              type: "numbered",
              serialNumber: 1,
              value: 100,
              name: "Charizard",
            },
            {
              type: "numbered",
              serialNumber: 101,
              value: 100,
              name: "Bulbasaur",
            },
            {
              type: "numbered",
              serialNumber: 201,
              value: 100,
              name: "Squirtle",
            },
          ]}
        />
        <h3>Mix and Match - Anniversaries Coin Example</h3>
        you can use all of theses techniques work together, for example you
        could have some anniversary edition coin for you FT. A real world
        example of this is how there is special coins minted by the New Zealand
        goverment, that are still legal tender, and will work in vending
        machines, but are worth a lot more than their list value.
        <a href="https://www.rbnz.govt.nz/notes-and-coins/coins/armistice-day-coin">
          Armistice Day Coin
        </a>
        <Simulator
          bobLeafs={[
            {
              type: "fungible",
              serialNumber: 1,
              value: 10000,
              name: "Normal Token",
            },
            {
              type: "nft",
              serialNumber: 2,
              value: 5,
              name: "Super Rare 5 token NFT",
            },
            {
              type: "numbered",
              serialNumber: 3,
              value: 100,
              name: "Aniversary Coins",
            },
          ]}
        />
        <h3>Coffee Example</h3>A great use of tokenisation is for price
        discovery,
        <a href="https://medium.com/affogato-network/cafe-dynamically-priced-coffee-fc1d0a5ec98d">
          CAFE — Dynamically Priced Coffee
        </a>
        However they are selling each batch indivually, imagine instead if we
        could continuious sell the tokens with the units representing the
        batches.
        <Simulator
          bobLeafs={[
            {
              type: "fungible",
              serialNumber: 1,
              value: 100,
              name: "Batch 1, January",
            },
            {
              type: "fungible",
              serialNumber: 101,
              value: 100,
              name: "Batch 2, Febuary",
            },
            {
              type: "fungible",
              serialNumber: 201,
              value: 100,
              name: "Batch 3, March",
            },
          ]}
        />
        <MakeYourOwn />
      </div>
    </div>
  );
};

function MakeYourOwn() {
  const [bobsLeafs, setBobsLeafs] = useState([]);

  const [nodeType, setNodeType] = useState("nft");
  const [name, setName] = useState("");
  const [value, setValue] = useState("1");

  const nextSerial = bobsLeafs.length
    ? bobsLeafs[bobsLeafs.length - 1].serialNumber +
      1 +
      (bobsLeafs[bobsLeafs.length - 1].type === "numbered"
        ? bobsLeafs[bobsLeafs.length - 1].value
        : 0)
    : 1;
  return (
    <>
      <h3>Make your own</h3>
      Here you can make your own, add your own leafs, mike and match, come up
      with your own new Assest.
      <Simulator bobLeafs={bobsLeafs} />
      <form>
        <label>
          Node Type
          <select
            name="nodetype"
            value={nodeType}
            onChange={({ target }) => setNodeType(target.value)}
          >
            <option value="nft">NFT</option>
            <option value="numbered">numbered</option>
            <option value="fungible">Fungible</option>
          </select>
        </label>
        <label>
          Name
          <input
            type="text"
            onChange={({ target }) => setName(target.value)}
          ></input>
        </label>
        <label>
          Value
          <input
            type="text"
            onChange={({ target }) => setValue(target.value)}
          ></input>
        </label>
        <button
          type="button"
          onClick={() => {
            setBobsLeafs([
              ...bobsLeafs,
              {
                type: nodeType,
                serialNumber: nextSerial,
                value: parseInt(value),
                name,
              },
            ]);
          }}
        >
          Add Leaf
        </button>
      </form>
    </>
  );
}
