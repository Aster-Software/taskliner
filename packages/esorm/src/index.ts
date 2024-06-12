console.log("Hello ESORM");

export const TestFunction = () => {
  console.log("ESORM TEST");
};

export { EsormDatabase, EsormTable as EsormObject, EsormColumn } from "./object";
export { EsormRouter, EsormRoute } from "./router";
export { Esorm } from "./esorm";

console.log("Arg 0", process.argv[0]);
console.log("Arg 1", process.argv[1]);
console.log("Arg 2", process.argv[2]);
