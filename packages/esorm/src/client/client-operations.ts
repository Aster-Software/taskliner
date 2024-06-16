import { makeAutoObservable, runInAction } from "mobx";
import { BaseSchema } from "./client-utils";
import { EsormBatchOperation, checkDoesBatchOperationRecordHaveChanges, createBatchOperationRecord } from "../batch";
import { ClientApiDriver } from "./client-api-driver";

export class ClientOperationsModule<FinalType extends BaseSchema> {
  operationsCommitting = createBatchOperationRecord(); // Operations that are local that are being committed
  operationsLocal = createBatchOperationRecord(); // Operations that are local that are not yet being committed
  options: ClientOperationsModuleOptions;

  constructor(options: ClientOperationsModuleOptions) {
    makeAutoObservable(this);

    this.options = options;
    this.update();
  }

  update = async () => {
    if (checkDoesBatchOperationRecordHaveChanges(this.operationsLocal)) {
      console.log("Pushing Updates...", this.operationsLocal);

      runInAction(() => {
        this.operationsCommitting = this.operationsLocal;
        this.operationsLocal = createBatchOperationRecord();
      });

      await this.options.apiDriver.reqEntity({
        action: "apply-operation",
        operations: this.operationsCommitting,
      });

      runInAction(() => {
        this.operationsCommitting = createBatchOperationRecord();
      });
    }

    setTimeout(() => this.update(), 1000);
  };
}

type ClientOperationsModuleOptions = {
  apiDriver: ClientApiDriver;
};
