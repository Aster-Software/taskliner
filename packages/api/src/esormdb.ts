import { Esorm, EsormTypes } from "esorm";
import { config } from "dotenv";
import { clerkClient } from "@clerk/clerk-sdk-node";

config();

const password = process.env.ATLAS_PASSWORD;
const mongodb_db = "test";
const mongodb_url = `mongodb+srv://jaekwak02:${password}@taskliner-test.rknmnru.mongodb.net/?retryWrites=true&w=majority&appName=taskliner-test`;

export const esorm = await Esorm({
  port: 4000,
  mongodb_db,
  mongodb_url,
  schema: {
    access_to_workspace: {
      relations: {},
      properties: {
        workspace_id: EsormTypes.string,
        user_id: EsormTypes.string,
        role: EsormTypes.string,
      },
    },
    workspace: {
      relations: {},
      properties: {
        name: EsormTypes.string,
        description: EsormTypes.string,
        status: EsormTypes.string,
      },
    },
    task: {
      relations: {},
      properties: {
        workspace_id: EsormTypes.string,
        name: EsormTypes.string,
        description: EsormTypes.string,
        status: EsormTypes.string,
      },
    },
  },
  authenticate: async (token) => await clerkClient.verifyToken(token),
  authorize: async (session, api) => {
    const workspaceAccess = await api.getMany({ type: "access_to_workspace", query: { column: "user_id", operator: "=", value: session.sub } });
    const workspaceControl = await api.getMany({
      type: "access_to_workspace",
      query: {
        operator: "and",
        conditions: [
          { column: "user_id", operator: "=", value: session.sub },
          { column: "role", operator: "=", value: "owner" },
        ],
      },
    });

    const workspaceIdsWithAdmin = workspaceControl.map((x) => x.workspace_id);
    const workspaceIdsReadable = workspaceAccess.map((x) => x.workspace_id);

    return {
      // access_to_workspace: workspaceIdsWithAdmin.map((x) => ({ action: "all", scope: { workspace_id: x } })),
      // workspace: workspaceIdsReadable.map((x) => ({ action: "all", scope: { _id: x } })),
      // task: workspaceIdsReadable.map((x) => ({ action: "all", scope: { workspace_id: x } })),

      access_to_workspace: { action: "all", scope: {} },
      workspace: [
        { action: "read", scope: {} },
        { action: "update", scope: {} },
      ],
      task: { action: "all", scope: {} },
    };
  },
});

export type EsormType = typeof esorm;
