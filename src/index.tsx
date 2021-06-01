import * as React from "react";
import * as ReactDOM from "react-dom";

import FontFaceObserver from "fontfaceobserver";

import "./main.css";

import App from "./app";

const MontserratObserver = new FontFaceObserver("Montserrat", {});
const openSansObserver = new FontFaceObserver("Open Sans", {});

// When Inter is loaded, add a font-family using Inter to the body

function promiseTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject("Timed out in " + ms + "ms.");
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]) as Promise<T>;
}

promiseTimeout(
  1000,
  Promise.all([MontserratObserver.load(), openSansObserver.load()])
)
  .then(() => {
    document.body.classList.add("fontLoaded");
  })
  .catch(() => {
    document.body.classList.add("fontLoadFailed");
  });

window.addEventListener("load", () => {
  const MOUNT_NODE = document.getElementById("root") as HTMLElement;

  ReactDOM.render(<App />, MOUNT_NODE);
});
