import type { Component } from "solid-js"

export const Test: Component<{  }> = (props) => {
console.log("HELLO?!");

  return <div>
    <div>HELLO WORLD!!!</div>
    <button onClick={() => console.log("HELLO TEST")}>TEST!!!</button>
  </div>
}

export default Test