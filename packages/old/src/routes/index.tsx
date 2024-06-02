import { createAsync, useAction, type RouteDefinition } from "@solidjs/router";
import { getWorkspaces, logout } from "~/lib";
import { getUser } from "~/lib/User";
import { createWorkspace } from "~/lib/Workspace";
import { clientOnly } from "@solidjs/start"

export const route = {
  load: () => getUser()
} satisfies RouteDefinition;

// const Home = clientOnly(async () => ({
//   default: () => {
//     const user = createAsync(() => getUser(), { deferStream: true });
  
//     const workspaces = createAsync(() => getWorkspaces(), { deferStream: true });
  
//    const projects = createAsync(async () => {
//     "use server";
  
//     const user = await getUser();
  
//     console.log("Hello Projects", (user).id);
  
//     return [];
//    });
  
//    const newWorkspaceAction = useAction(createWorkspace);
  
//    console.log("HELLO WORLD")
    
//     return (
//       <main class="w-full p-4 space-y-2">
//         <h2 class="font-bold text-3xl">Hello {user()?.username}</h2>
//         <div>
//           <div>Workspaces: {workspaces()?.length}</div>
//           <div>Projects: {projects()?.length}</div>
//         </div>
//         <div>
//           <button type="button" onClick={() => {
//             console.log("CLICK");
//           }}>Create Workspace</button>
//           <div onClick={() => console.log("CLICKKK")}>
//             HELLO?
//           </div>
//         </div>
//         <form action={logout} method="post">
//           <button name="logout" type="submit">
//             Logout
//           </button>
//         </form>
//       </main>
//     );
//   }
// }))

const Test = clientOnly(() => import("~/components/Test"))

export default function Home() {
  const user = createAsync(() => getUser(), { deferStream: true });

  const workspaces = createAsync(() => getWorkspaces(), { deferStream: true });

 const projects = createAsync(async () => {
  "use server";

  const user = await getUser();

  console.log("Hello Projects", (user).id);

  return [];
 });

 const newWorkspaceAction = useAction(createWorkspace);

 console.log("HELLO WORLD")
  
  return (
    <main class="w-full p-4 space-y-2">
      <h2 class="font-bold text-3xl">Hello {user()?.username}</h2>
      <div>
        <div>Workspaces: {workspaces()?.length}</div>
        <div>Projects: {projects()?.length}</div>
        <Test />
      </div>
      <div>
        <button type="button" onClick={() => {
          console.log("CLICK");
        }}>Create Workspace</button>
        <div onClick={() => console.log("CLICKKK")}>
          HELLO?
        </div>
      </div>
      <form action={logout} method="post">
        <button name="logout" type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}