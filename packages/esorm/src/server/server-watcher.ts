import { Db } from "mongodb";

export class ServerWatcherModule {
  options: ServerWatcherModuleOptions;
  listeners = new Set<ServerWatcherModuleListener>();

  constructor(options: ServerWatcherModuleOptions) {
    this.options = options;

    this.options.db.watch([], { fullDocument: "updateLookup" }).on("change", (e) => {
      const ee = e as any; // Be free, little birdy (event)
      const payload = { db: ee.ns.db, collection: ee.ns.coll, document: ee.fullDocument };

      if (e.operationType === "create") this.listeners.forEach((l) => l("create", payload));
      if (e.operationType === "update") this.listeners.forEach((l) => l("update", payload));
      if (e.operationType === "delete") this.listeners.forEach((l) => l("delete", payload));
    });
  }

  subscribe(listener: ServerWatcherModuleListener) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }
}

type ServerWatcherModuleOptions = {
  db: Db;
};

type ServerWatcherModuleListener = (action: "create" | "update" | "delete", change: { db: string; collection: string; document: any }) => void;
