/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Logger } from "@utils/Logger";
import { webFrame } from "electron";
import { readFileSync } from "fs";
import { join } from "path";

const logger = new Logger("SnippetLoader");

// Load snippets from preferences file
const prefs = JSON.parse(readFileSync(join(process.env.DISCORD_APP_USER_DATA!, "Preferences"), "utf-8"));
const raw: {
    name: string;
    content: string
}[] = JSON.parse(prefs.electron.devtools.preferences.scriptSnippets);

export const snippets: Record<string, string> = Object.fromEntries(
    raw.map(snip => [snip.name, snip.content])
);

logger.debug("Loaded prefs file:", raw.length, "total snippets");

// Run the snippets when the window loads
window.addEventListener("load", async function () {
    await webFrame.executeJavaScript(`window.snippets = ${JSON.stringify(snippets)};`);

    // if there's no boot snippet, we don't want to error since this is an opt-in feature
    if (!snippets.vencord_boot) return;

    await webFrame.executeJavaScript(snippets.vencord_boot);

    logger.info("Launched boot snippet 🚀");
});
