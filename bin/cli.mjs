#!/usr/bin/env node
/**
 * Terminal installer/launcher: checks the environment, installs
 * dependencies, builds the app and starts the dashboard, then prints
 * the localhost link. Pure Node, no dependencies.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TTY = process.stdout.isTTY;

/* ── ANSI helpers ── */
const ESC = "\x1b[";
const dim = (s) => `${ESC}2m${s}${ESC}0m`;
const bold = (s) => `${ESC}1m${s}${ESC}0m`;
const green = (s) => `${ESC}32m${s}${ESC}0m`;
const red = (s) => `${ESC}31m${s}${ESC}0m`;
const cyan = (s) => `${ESC}36m${s}${ESC}0m`;
const violet = (s) => `${ESC}38;5;141m${s}${ESC}0m`;
const shadow = (s) => `${ESC}38;5;61m${s}${ESC}0m`;

const BANNER = [
  "",
  "    ██████╗ ██████╗ ██╗  ██╗ ██████╗ ██████╗ ███████╗",
  "   ██╔════╝██╔═══██╗██║  ██║██╔═══██╗██╔══██╗██╔════╝",
  "   ██║     ██║   ██║███████║██║   ██║██████╔╝███████╗",
  "   ██║     ██║   ██║██╔══██║██║   ██║██╔══██╗╚════██║",
  "   ╚██████╗╚██████╔╝██║  ██║╚██████╔╝██║  ██║███████║",
  "    ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝",
  "",
];

function banner() {
  if (TTY) process.stdout.write(`${ESC}2J${ESC}H`); // clear screen
  // bright faces (█) + dim depth/shadow chars → a 3D embossed look
  const art = BANNER.map((l) =>
    l.replace(/█+/g, (m) => violet(m)).replace(/[╔╗╚╝║═]+/g, (m) => shadow(m)),
  ).join("\n");
  console.log(art);
  console.log(dim("   Cohors — twój zespół agentów AI · open source · MIT\n"));
}

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Runs `cmd` with a spinner line; resolves with elapsed seconds. */
function step(label, cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    let frame = 0;
    const draw = (head) =>
      TTY && process.stdout.write(`\r${ESC}2K   ${head} ${label}`);
    const timer = TTY
      ? setInterval(() => draw(cyan(SPIN[(frame += 1) % SPIN.length])), 90)
      : null;
    if (!TTY) console.log(`   … ${label}`);

    const child = spawn(cmd, args, { cwd: ROOT, shell: false, ...opts });
    let out = "";
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (out += d));
    child.on("close", (code) => {
      if (timer) clearInterval(timer);
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      if (code === 0) {
        draw(green("✓"));
        process.stdout.write(TTY ? `  ${dim(`${secs}s`)}\n` : "");
        if (!TTY) console.log(`   ✓ ${label}  ${secs}s`);
        resolve(secs);
      } else {
        draw(red("✗"));
        process.stdout.write("\n\n");
        console.error(dim(out.split("\n").slice(-20).join("\n")));
        reject(new Error(`${label} — kod wyjścia ${code}`));
      }
    });
    child.on("error", reject);
  });
}

function done(label, note = "") {
  console.log(`   ${green("✓")} ${label}${note ? `  ${dim(note)}` : ""}`);
}

/** Shows a spinner next to `label` until the promise settles. */
async function spinnerWhile(label, promise) {
  const started = Date.now();
  let frame = 0;
  const timer = TTY
    ? setInterval(() => {
        process.stdout.write(
          `\r${ESC}2K   ${cyan(SPIN[(frame += 1) % SPIN.length])} ${label}`,
        );
      }, 90)
    : null;
  if (!TTY) console.log(`   … ${label}`);
  try {
    await promise;
    if (timer) clearInterval(timer);
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    if (TTY) process.stdout.write(`\r${ESC}2K   ${green("✓")} ${label}  ${dim(`${secs}s`)}\n`);
    else console.log(`   ✓ ${label}  ${secs}s`);
  } catch (e) {
    if (timer) clearInterval(timer);
    if (TTY) process.stdout.write(`\r${ESC}2K   ${red("✗")} ${label}\n`);
    throw e;
  }
}

function freePort(start) {
  return new Promise((resolve) => {
    const probe = (port) => {
      const srv = net.createServer();
      srv.once("error", () => probe(port + 1));
      srv.once("listening", () => srv.close(() => resolve(port)));
      srv.listen(port, "127.0.0.1");
    };
    probe(start);
  });
}

function waitFor(url, tries = 120) {
  return new Promise((resolve, reject) => {
    const hit = async (left) => {
      try {
        await fetch(url);
        resolve();
      } catch {
        if (left <= 0) return reject(new Error("serwer nie wystartował"));
        setTimeout(() => hit(left - 1), 500);
      }
    };
    hit(tries);
  });
}

function finalBox(url) {
  const lines = [
    "",
    `${bold("Gotowe. Zespół czeka na szefa.")}`,
    "",
    "Twój dashboard:",
    `${bold(cyan(`→ ${url}`))}`,
    "",
    dim("Zatrzymanie: Ctrl+C"),
    "",
  ];
  const width = 44;
  console.log(`\n   ╭${"─".repeat(width)}╮`);
  for (const l of lines) {
    // eslint-disable-next-line no-control-regex
    const visible = l.replace(/\x1b\[[0-9;]*m/g, "");
    console.log(`   │  ${l}${" ".repeat(Math.max(0, width - 2 - visible.length))}│`);
  }
  console.log(`   ╰${"─".repeat(width)}╯\n`);
}

/** If this is a git checkout, quietly check whether a newer version exists. */
function checkForUpdate() {
  if (!existsSync(path.join(ROOT, ".git"))) return;
  const git = (args) =>
    spawnSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: 6000 });
  try {
    if (git(["fetch", "--quiet"]).status !== 0) return; // offline — skip silently
    const behind = git(["rev-list", "--count", "HEAD..@{u}"]).stdout.trim();
    const n = Number(behind);
    if (Number.isFinite(n) && n > 0) {
      done(
        "Dostępna aktualizacja",
        `${n} ${n === 1 ? "nowość" : "nowości"} — zaktualizuj: git pull && npm run app`,
      );
    } else {
      done("Masz najnowszą wersję");
    }
  } catch {
    /* network/git hiccup — never block startup on this */
  }
}

async function main() {
  banner();

  /* 1 — environment */
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 20) {
    console.error(red(`   ✗ Potrzebny Node 20+, masz v${process.versions.node}`));
    process.exit(1);
  }
  const npm = spawnSync("npm", ["--version"], { encoding: "utf8" });
  if (npm.status !== 0) {
    console.error(red("   ✗ Nie znalazłem npm w PATH"));
    process.exit(1);
  }
  done("Środowisko sprawdzone", `node v${process.versions.node} · npm ${npm.stdout.trim()}`);

  /* 1b — update check (non-blocking, git only) */
  checkForUpdate();

  /* 2 — dependencies */
  if (existsSync(path.join(ROOT, "node_modules"))) {
    done("Zależności zainstalowane", "node_modules już jest");
  } else {
    await step("Instaluję zależności", "npm", ["install", "--no-fund", "--no-audit"]);
  }

  /* 3 — build */
  if (existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    done("Aplikacja zbudowana", "użyję poprzedniego builda — wymuszenie: --rebuild");
  } else {
    await step("Buduję aplikację", "npx", ["next", "build"]);
  }

  /* 4 — start */
  const port = process.env.PORT ? Number(process.env.PORT) : await freePort(3000);
  const url = `http://localhost:${port}`;
  const server = spawn("npx", ["next", "start", "-p", String(port)], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let errTail = "";
  server.stderr.on("data", (d) => (errTail = String(d)));
  server.on("close", (code) => {
    if (code !== 0 && code !== null) {
      console.error(red(`\n   ✗ Serwer zakończył pracę (kod ${code})`));
      if (errTail) console.error(dim(errTail));
      process.exit(code);
    }
    process.exit(0);
  });
  ["SIGINT", "SIGTERM"].forEach((sig) =>
    process.on(sig, () => {
      server.kill(sig);
      console.log(dim("\n   Do zobaczenia, szefie.\n"));
      process.exit(0);
    }),
  );

  await spinnerWhile("Uruchamiam serwer", waitFor(url));
  finalBox(`${url}/pulpit`);
}

if (process.argv.includes("--rebuild")) {
  spawnSync("rm", ["-rf", path.join(ROOT, ".next")]);
}

main().catch((e) => {
  console.error(red(`\n   ✗ ${e.message}\n`));
  process.exit(1);
});
