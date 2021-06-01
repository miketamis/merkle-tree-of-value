import React, { useReducer, useState } from "react";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";

type Leaf = {
  type: "fungible" | "numbered" | "nft";
  serialNumber: number;
  value: number;
  hash?: string;
  name: string;
};

type Node = {
  type: "node";
  value: number;
  childA: Node | Leaf;
  childB: Node | Leaf;
  hash: string;
};

function treeify(_leafs: (Leaf | Node)[]): Leaf | Node | null {
  const leafs = _leafs.map((leaf) => {
    return {
      ...leaf,
      hash:
        leaf.type !== "node"
          ? Base64.stringify(
              sha256(leaf.type + ":" + leaf.value + ":" + leaf.serialNumber)
            ).slice(0, 8)
          : leaf.hash,
    };
  });

  if (leafs.length === 0) {
    return null;
  }

  if (leafs.length === 1) {
    return leafs[0];
  }

  const res: (Leaf | Node)[] = [];
  for (let i = 0; i < leafs.length; i += 2) {
    if (i === leafs.length - 1) {
      res.push(leafs[i]);
    } else {
      res.push({
        type: "node",
        value: leafs[i].value + leafs[i + 1].value,
        childA: leafs[i],
        childB: leafs[i + 1],
        hash: Base64.stringify(sha256(leafs[i].hash + leafs[i + 1].hash)).slice(
          0,
          8
        ),
      });
    }
  }
  return treeify(res);
}

export default ({ bobLeafs }: { bobLeafs: Leaf[] }) => {
  //     const [state, dispatch] = useReducer((state: { leafs: Leaf[] }, action: any) => {
  //         return state;
  //     }, { leafs: [
  //        ]

  //  });

  const [amount, setAmount] = useState(0);

  const bobNew: Leaf[] = [];
  const alice: Leaf[] = [];

  const error = "";
  let transferedAmount = 0;

  for (let i = 0; i < bobLeafs.length; i++) {
    const leaf = bobLeafs[i];
    const amountRemain = amount - transferedAmount;
    if (amountRemain === 0) {
      bobNew.push({
        ...leaf,
      });
      continue;
    }
    switch (leaf.type) {
      case "fungible":
      case "numbered":
        if (amountRemain < leaf.value) {
          transferedAmount += amountRemain;
          bobNew.push({
            ...leaf,
            value: leaf.value - amountRemain,
          });
          alice.push({
            ...leaf,
            value: amountRemain,
            serialNumber:
              leaf.type === "numbered"
                ? leaf.serialNumber + leaf.value - amountRemain
                : leaf.serialNumber,
          });
          continue;
        }
        transferedAmount += leaf.value;
        alice.push({
          ...leaf,
        });
        continue;
      case "nft":
        if (amountRemain >= leaf.value) {
          transferedAmount += leaf.value;
          alice.push({
            ...leaf,
          });
        } else {
          bobNew.push({
            ...leaf,
          });
        }
        continue;
    }
  }

  const bobTree = treeify(bobNew);
  const aliceTree = treeify(alice);

  const total = bobLeafs.reduce((sum, leaf) => sum + leaf.value, 0);

  return (
    <div>
      <div className="label">Amount to transfer</div>
      {amount}
      <div className="error">
        <input
          type="range"
          min="0"
          max={total}
          value={amount}
          onChange={({ target }) => {
            setAmount(parseInt(target.value, 10));
          }}
        />
        {transferedAmount < amount && "Cannot Transfer Exact Amount"}
      </div>
      <div className="bobalice">
        <div className="bob">
          <h2>Bob</h2>
          <Node node={bobTree} />
        </div>
        <div className="alice">
          <h2>Alice</h2>
          <Node node={aliceTree} />
        </div>
      </div>
    </div>
  );
};

function Node({ node }: { node: Leaf | Node | null }) {
  if (!node) {
    return null;
  }
  if (node.type === "node") {
    return (
      <div>
        <div className="children">
          <div className="spacer">
            Node
            <div className="value-header">Value {node.value}</div>
            <div className="hash">{node.hash}</div>
          </div>
          <div>
            <div className="edge">
              <div className="arrow-right" />
              <div className="child">
                <Node node={node.childA} />
              </div>
            </div>
            <div className="edge">
              <div className="arrow-right" />

              <div className="child">
                <Node node={node.childB} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`leaf ${node.type}`}>
      <div className="name">{node.name}</div>
      {node.type}

      <div className="value-header">Value {node.value}</div>
      <div className="hash">{node.hash}</div>

      {
        <div>
          {" "}
          {node.type === "numbered" ? (
            <div>
              Range: {node.serialNumber} to {node.serialNumber + node.value - 1}
            </div>
          ) : (
            <div>S/N: {node.serialNumber}</div>
          )}
        </div>
      }
    </div>
  );
}
