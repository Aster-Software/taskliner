import merge from "merge";

export const createBatchOperationRecord = () => {
  const operation: EsormBatchOperation = {
    types: {},
  };

  return operation;
};

export const appendBatchOperationRecord = (target: EsormBatchOperation, update: EsormBatchOperation) => {
  merge.recursive(target, update);
};

export const checkDoesBatchOperationRecordHaveChanges = (operation: EsormBatchOperation) => {
  return Object.keys(operation.types).length > 0;
};

export type EsormBatchOperation = {
  types: Record<
    string,
    Record<
      string,
      {
        action: "create" | "update" | "delete";
        data: any;
      }
    >
  >;
};
