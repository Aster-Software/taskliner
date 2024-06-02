import { action, cache, redirect } from "@solidjs/router";
import { db } from "./db";
import { getSession, login, logout as logoutSession, register, validatePassword, validateUsername } from "./server";
import { database } from "../../../api/src/core/database";

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(username, password)
      : login(username, password));
    const session = await getSession();
    await session.update(d => (d.userId = user!.id));
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
});

export const getWorkspaces = (async () => {
    "use-server";

    try {
      console.log("Fetching workspaces")

      const workspaces = await database.selectFrom("workspace").execute();

      console.log("Workspaces: ", workspaces);

      return workspaces
    } catch (e) {
      console.error(e)
    }
})