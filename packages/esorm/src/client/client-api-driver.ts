import { EsormClientOptions } from "./client";

export class ClientApiDriver {
  options: ClientApiDriverOptions;

  constructor(options: ClientApiDriverOptions) {
    this.options = options;
  }

  req = async (options: { url: string; body: any }) => {
    const response = await fetch(options.url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
    });

    if (response.ok) {
      const json = await response.json();

      return (json as any).data as unknown;
    }
  };

  reqEntity = async (body: any) => this.req({ url: "/api/entity", body });
}

type ClientApiDriverOptions = {
  clientOptions: EsormClientOptions;
};
