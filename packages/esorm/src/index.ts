console.log("Hello ESORM");

export const TestFunction = () => {
  console.log("ESORM TEST");
};

console.log("Arg 0", process.argv[0]);
console.log("Arg 1", process.argv[1]);
console.log("Arg 2", process.argv[2]);

export * from "./v2";
export * from "./client";
