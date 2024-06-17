export type EsormCreateEntityOperation = {
  operation: "create";
  type: string;
  id: string;
  data: any;
};

export type EsormDeleteEntityOperation = {
  operation: "delete";
  type: string;
  id: string;
};

export type EsormUpdateOperation = {
  operation: "update";
  type: string;
  id: string;
  column: string;
  value: any;
};

export type EsormOperation = EsormCreateEntityOperation | EsormDeleteEntityOperation | EsormUpdateOperation;
