import { api } from "../../../../api/convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { Router, type RouteDefinition } from "@solidjs/router";
import { Tabs } from "@ark-ui/solid";
import { AppHeader } from "./AppHeader";
import { AppWorkspacePage } from "./AppWorkspacePage";
import { AppProjectPage } from "./AppProjectPage";
import { ToasterController, ToasterManager } from "../components/Toaster";
import { Container, HStack, VStack } from "@style/jsx";
import { Button } from "~/parkui/button";
import * as Accordion from "~/parkui/accordion";
import { HeaderLayout } from "../components/HeaderLayout";

const routes: RouteDefinition[] = [
  {
    path: "/",
    component: (props) => (
      <div>
        <HeaderLayout.Root>
          <HeaderLayout.Header>
            <AppHeader />
          </HeaderLayout.Header>
          <HeaderLayout.Content>{props.children}</HeaderLayout.Content>
        </HeaderLayout.Root>
      </div>
    ),
    children: [
      { path: "/app", component: () => "Hello Home" },
      {
        path: "/app/workspace/:workspace_id",
        component: () => <AppWorkspacePage />,
      },
      {
        path: "/app/workspace/:workspace_id/project/:project_id",
        component: () => <AppProjectPage />,
      },
      { path: "/app/user", component: () => "Hello User" },
    ],
  },
];

export const AppRoot = () => {
  return <Router>{routes}</Router>;
};
