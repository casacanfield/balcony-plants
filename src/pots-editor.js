
// Pots view on the plant list: drag plants between pots (or tap a plant, then tap a pot), then Save.
// Saving writes pots.json to the repo through GitHub, using a key that lives only in this browser,
// so people scanning tags can look but not change anything.
const REPO_API = "https://api.github.com/repos/casacanfield/balcony-plants/contents/";
const TOKEN_KEY = "potEditorToken";
const SITE = new URL("./", location.href).href;
let potsDirty = false, picked = null, addingTo = null, showConnect = false, showSetup = false, potMsg = ["", ""];
// lock.json holds the GitHub key locked with crew's code (AES-GCM, key stretched from the code with PBKDF2),
// so any phone can unlock saving with just the code. null = no code set up yet.
let lockInfo;
fetch("lock.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null).then(l => { lockInfo = l; redrawPots(); });

const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } };
const setToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };
const potSide = id => id.split("-")[0];
const potNum = id => parseInt(id.split("-")[1], 10) || 0;
const potLabel = id => (potSide(id) === "west" ? "West " : "East ") + potNum(id);
const sortPots = p => Object.fromEntries(Object.entries(p).sort(([a], [b]) => potSide(a).localeCompare(potSide(b)) || potNum(a) - potNum(b)));
const potsJson = p => "{\n" + Object.entries(p).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n";
const b64encode = str => btoa(unescape(encodeURIComponent(str)));

function potChip(key, from, i) {
  const p = PLANTS[key];
  if (!p) return "";
  const on = picked && picked.from === from && picked.key === key && picked.i === i;
  return `<span class="chip ${p.kind === "food" ? "food" : ""}${on ? " picked" : ""}" data-key="${key}" data-from="${from}" data-i="${i}">${esc(p.common)}${from === "palette" ? "" : `<button type="button" class="x" aria-label="Take ${esc(p.common)} out of this pot">×</button>`}</span>`;
}

function potCard(id) {
  const list = POTS[id];
  return `<section class="pot" data-pot="${id}" aria-label="${potLabel(id)}">
    <header><h3>${potLabel(id)}</h3>${list.length ? "" : `<button type="button" class="del" data-del="${id}">Remove pot</button>`}</header>
    <div class="plants">${list.length ? list.map((k, i) => potChip(k, id, i)).join("") : `<span class="empty">Empty. Drop a plant here, or tap +.</span>`}<button type="button" class="plus" data-plus="${id}" aria-expanded="${addingTo === id}" aria-label="Add plants to ${potLabel(id)}">${addingTo === id ? "Done" : "+"}</button></div>
    ${addingTo === id ? addPicker(id) : ""}
    <a class="link" href="#${id}">Tag link: ${esc((SITE + "#" + id).replace(/^https?:\/\//, ""))}</a>
  </section>`;
}

// the + in a pot opens this list of every plant not already in it; tap one to add it
function addPicker(id) {
  const keys = Object.keys(PLANTS).filter(k => !POTS[id].includes(k)).sort((a, b) => PLANTS[a].common.localeCompare(PLANTS[b].common));
  return `<div class="picker" aria-label="Plants to add">${keys.length ? keys.map(k => `<button type="button" class="pick ${PLANTS[k].kind === "food" ? "food" : ""}" data-pick="${k}">+ ${esc(PLANTS[k].common)}</button>`).join("") : `<span class="empty">Every plant is already in this pot.</span>`}</div>`;
}

function potEditorInner() {
  const sides = [["east", "East balcony"], ["west", "West balcony"]].filter(([s]) => SIDE === "all" || SIDE === s);
  return `
  <p class="hint">Tap + on a pot to add plants, or drag a plant into a pot. Tap × to take a plant out. Then tap Save.</p>
  <div class="palette" aria-label="All plants">${Object.keys(PLANTS).sort((a, b) => PLANTS[a].common.localeCompare(PLANTS[b].common)).map(k => potChip(k, "palette", -1)).join("")}</div>
  ${sides.map(([side, title]) => `<section class="side" aria-label="${title}">
    <h2>${title}</h2>
    <div class="pots">${Object.keys(POTS).filter(id => potSide(id) === side).map(potCard).join("")}</div>
    <button type="button" class="addpot" data-add="${side}">+ New ${side} pot</button>
  </section>`).join("")}
  ${getToken() && !showConnect ? `<p class="small">Unlocked on this phone. <button type="button" id="disconnect">Lock</button></p>` : lockInfo && !showSetup ? unlockPanel() : connectPanel()}
  <div class="bar"><span class="msg ${potMsg[1]}" id="msg" role="status">${esc(potMsg[0])}</span><button type="button" class="save" id="save"${potsDirty ? "" : " disabled"}>Save changes</button></div>`;
}
function renderPotEditor() { return `<div class="poteditor" id="poteditor">${potEditorInner()}</div>`; }
function redrawPots() { const el = document.getElementById("poteditor"); if (el) el.innerHTML = potEditorInner(); }
function say(text, tone) { potMsg = [text, tone || ""]; const m = document.getElementById("msg"); if (m) { m.textContent = text; m.className = "msg " + (tone || ""); } }
function potsChanged() { potsDirty = true; potMsg = ["Not saved yet", ""]; redrawPots(); }

function unlockPanel() {
  return `<section class="connect" id="connect" aria-label="Unlock saving">
    <h2>Unlock to save</h2>
    <p>Type your pot code. This phone stays unlocked until you tap Lock.</p>
    <div class="row"><input id="code" type="password" autocomplete="current-password" placeholder="Your pot code" aria-label="Pot code"><button type="button" id="unlock">Unlock</button></div>
    <p class="small">Forgot the code? <button type="button" id="resetup">Set up a new one</button></p>
  </section>`;
}

function connectPanel() {
  return `<section class="connect" id="connect" aria-label="Set up a pot code">
    <h2>Set up your pot code (one time)</h2>
    <p>Saving needs a key from your GitHub account, so only you can change the pots. You make it once, lock it with a code, and after that any phone just needs the code.</p>
    <ol>
      <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub's new key page</a> and sign in.</li>
      <li>Name it "pot editor" and set the expiry as long as it allows.</li>
      <li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick <b>balcony-plants</b>.</li>
      <li>Under <b>Permissions</b>, find <b>Contents</b> and set it to <b>Read and write</b>.</li>
      <li>Tap <b>Generate token</b>, copy it, and paste it below.</li>
      <li>Choose a code you'll remember, at least 16 letters. Three or four random words with spaces works well. Pick your own, not ones from this page.</li>
    </ol>
    <input id="token" type="password" autocomplete="off" placeholder="Paste the key here" aria-label="GitHub key">
    <div class="row"><input id="newcode" type="text" autocomplete="new-password" placeholder="Choose your pot code" aria-label="New pot code"><button type="button" id="savetoken">Done</button></div>
    <p class="small">The code locks the key, so it's safe to keep with the site. The key can only change this plant site.</p>
  </section>`;
}

// ---- the code lock ----
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function codeKey(code, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function lockToken(token, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await codeKey(code, salt), new TextEncoder().encode(token));
  return { v: 1, salt: b64(salt), iv: b64(iv), data: b64(data) };
}
async function unlockToken(lock, code) {
  const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(lock.iv) }, await codeKey(code, unb64(lock.salt)), unb64(lock.data));
  return new TextDecoder().decode(data);
}

function dropPlant(from, key, i, to) {
  if (from === to || !POTS[to]) return;
  if (from !== "palette") POTS[from].splice(i, 1);
  if (!POTS[to].includes(key)) POTS[to].push(key);
  picked = null;
  document.body.classList.remove("wantsdrop");
  potsChanged();
}

let drag = null;
document.addEventListener("pointerdown", e => {
  const c = e.target.closest(".poteditor .chip");
  if (!c || e.target.closest(".x") || e.button > 0) return;
  drag = { c, x: e.clientX, y: e.clientY, on: false, ghost: null, over: null };
});
document.addEventListener("pointermove", e => {
  if (!drag) return;
  if (!drag.on) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
    drag.on = true;
    const r = drag.c.getBoundingClientRect();
    drag.dx = drag.x - r.left; drag.dy = drag.y - r.top;
    drag.ghost = drag.c.cloneNode(true);
    drag.ghost.classList.add("ghost");
    document.body.appendChild(drag.ghost);
  }
  e.preventDefault();
  drag.ghost.style.left = e.clientX - drag.dx + "px";
  drag.ghost.style.top = e.clientY - drag.dy + "px";
  const pot = document.elementFromPoint(e.clientX, e.clientY)?.closest(".pot");
  if (pot !== drag.over) { drag.over?.classList.remove("over"); pot?.classList.add("over"); drag.over = pot; }
  // scroll the page when dragging near the top or bottom edge
  if (e.clientY < 70) scrollBy(0, -12); else if (e.clientY > innerHeight - 140) scrollBy(0, 12);
}, { passive: false });
document.addEventListener("pointerup", () => {
  if (!drag) return;
  const d = drag; drag = null;
  const { key, from, i } = d.c.dataset;
  if (d.on) {
    d.ghost.remove(); d.over?.classList.remove("over");
    if (d.over) dropPlant(from, key, +i, d.over.dataset.pot);
    return;
  }
  // a tap: pick this plant up, or put it down again
  picked = picked && picked.from === from && picked.key === key && picked.i === +i ? null : { from, key, i: +i };
  document.body.classList.toggle("wantsdrop", !!picked);
  potMsg = picked ? [`Now tap the pot to put ${PLANTS[key].common} in`, ""] : [potsDirty ? "Not saved yet" : "", ""];
  redrawPots();
});
document.addEventListener("pointercancel", () => { if (drag?.ghost) drag.ghost.remove(); drag?.over?.classList.remove("over"); drag = null; });

document.addEventListener("click", e => {
  if (!e.target.closest("#poteditor")) return;
  const x = e.target.closest(".x");
  if (x) { const c = x.closest(".chip"); POTS[c.dataset.from].splice(+c.dataset.i, 1); picked = null; potsChanged(); return; }
  const plus = e.target.closest("[data-plus]");
  if (plus) { addingTo = addingTo === plus.dataset.plus ? null : plus.dataset.plus; picked = null; document.body.classList.remove("wantsdrop"); redrawPots(); return; }
  const pick = e.target.closest("[data-pick]");
  if (pick) { POTS[addingTo].push(pick.dataset.pick); potsChanged(); return; }
  const del = e.target.closest("[data-del]");
  if (del) { delete POTS[del.dataset.del]; potsChanged(); return; }
  const add = e.target.closest("[data-add]");
  if (add) {
    const side = add.dataset.add;
    const n = Math.max(0, ...Object.keys(POTS).filter(id => potSide(id) === side).map(potNum)) + 1;
    POTS = sortPots({ ...POTS, [`${side}-${n}`]: [] });
    potsChanged(); return;
  }
  const pot = e.target.closest(".pot");
  if (pot && picked && !e.target.closest(".chip, a, button")) { dropPlant(picked.from, picked.key, picked.i, pot.dataset.pot); return; }
  if (e.target.id === "save") { savePots(); return; }
  if (e.target.id === "savetoken") { setUpCode(); return; }
  if (e.target.id === "unlock") { unlock(); return; }
  if (e.target.id === "resetup") { showSetup = true; redrawPots(); return; }
  if (e.target.id === "disconnect") { setToken(""); potMsg = ["Locked", ""]; redrawPots(); }
});

async function unlock() {
  const code = document.getElementById("code").value;
  if (!code) return;
  say("Unlocking…");
  try {
    setToken(await unlockToken(lockInfo, code));
    showConnect = false; potMsg = ["Unlocked", "good"]; redrawPots();
    if (potsDirty) savePots();
  } catch (e) { say("That code didn't work. Try again.", "bad"); }
}

async function setUpCode() {
  const token = document.getElementById("token").value.trim(), code = document.getElementById("newcode").value;
  if (!token) return say("Paste the GitHub key first.", "bad");
  if (code.length < 16) return say("Make the code at least 16 letters long. Three or four words works well.", "bad");
  say("Setting up…");
  setToken(token);
  try {
    const lock = await lockToken(token, code);
    let sha;
    try { sha = (await github("GET", null, "lock.json")).sha; } catch (e) { if (e.status !== 404) throw e; }
    await github("PUT", { message: "Update the pot code lock", content: b64encode(JSON.stringify(lock) + "\n"), sha, branch: "main" }, "lock.json");
    lockInfo = lock; showConnect = showSetup = false;
    potMsg = ["Your code is set. Other phones just type it to unlock.", "good"]; redrawPots();
    if (potsDirty) savePots();
  } catch (e) {
    setToken("");
    say(e.status === 401 || e.status === 403 || e.status === 404 ? "GitHub didn't accept that key. Check it has Contents: Read and write for balcony-plants." : "Couldn't save. Check your connection and try again.", "bad");
  }
}

async function github(method, body, file = "pots.json") {
  const headers = { Accept: "application/vnd.github+json", Authorization: "Bearer " + getToken() };
  if (body) headers["Content-Type"] = "application/json";
  const r = await fetch(REPO_API + file + (method === "GET" ? "?ref=main&t=" + Date.now() : ""), { method, headers, body: body && JSON.stringify(body), cache: "no-store" });
  if (!r.ok) throw Object.assign(new Error("GitHub " + r.status), { status: r.status });
  return r.json();
}

async function savePots() {
  if (!getToken()) {
    showConnect = true; potMsg = [lockInfo ? "Type your pot code just below to save." : "Saving needs a one-time setup, just below.", ""]; redrawPots();
    document.getElementById("connect").scrollIntoView({ behavior: "smooth" });
    return;
  }
  document.getElementById("save").disabled = true; say("Saving…");
  try {
    const { sha } = await github("GET");
    await github("PUT", { message: "Update pots from the plant list", content: b64encode(potsJson(POTS)), sha, branch: "main" });
    potsDirty = false;
    say("Saved. The tags show the change in about a minute.", "good");
  } catch (e) {
    document.getElementById("save").disabled = false;
    if (e.status === 401 || e.status === 403 || e.status === 404) {
      setToken(""); showConnect = true; showSetup = true; potMsg = ["GitHub didn't accept the key. It may have expired. Set it up again below.", "bad"]; redrawPots();
    } else say("Couldn't save. Check your connection and try again.", "bad");
  }
}
addEventListener("beforeunload", e => { if (potsDirty) { e.preventDefault(); e.returnValue = ""; } });
