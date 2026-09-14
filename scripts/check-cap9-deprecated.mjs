#!/usr/bin/env node
/**
 * Capacitor 9 removed / deprecated native API guard for plugin packages.
 *
 * Fails CI when plugin native sources still call APIs removed in Capacitor 9.
 * See https://capacitorjs.com/docs/next/updating/plugins/9-0
 *
 * Cap-go: Package.swift may keep the Cordova SPM product for Cap 8 consumers — not scanned here.
 *
 * Usage:
 *   node scripts/check-cap9-deprecated.mjs
 *   node scripts/check-cap9-deprecated.mjs --dir path
 *   node scripts/check-cap9-deprecated.mjs --self-test
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".build",
  ".gradle",
  "Pods",
  "DerivedData",
  ".swiftpm",
  ".git",
  "fixtures",
]);

/** @type {{ id: string; pattern: RegExp; hint: string }[]} */
export const RULES = [
  {
    id: "ios-getConfigValue",
    pattern: /\bgetConfigValue\s*\(/,
    hint: "use getConfig() and PluginConfig typed accessors (e.g. getString)",
  },
  {
    id: "objc-getConfigValue",
    pattern: /\bgetConfigValue\s*:/,
    hint: "use getConfig() and PluginConfig typed accessors",
  },
  {
    id: "plugin-call-hasOption",
    pattern: /\.hasOption\s*\(/,
    hint: "use typed PluginCall accessors (getString, getInt, …)",
  },
  {
    id: "ios-CAPNotifications",
    pattern: /\bCAPNotifications\b/,
    hint: "use Notification.Name.capacitor* constants",
  },
  {
    id: "ios-getPluginConfigValue",
    pattern: /\bgetPluginConfigValue\s*\(/,
    hint: "use getPluginConfig(_:)",
  },
  {
    id: "ios-legacy-result-types",
    pattern: /\b(PluginCallErrorData|PluginResultData|JSResultBody)\b/,
    hint: "use PluginCallResultData",
  },
  {
    id: "ios-JSDate-toString",
    pattern: /\bJSDate\.toString\s*\(/,
    hint: "removed in Capacitor 9",
  },
  {
    id: "ios-getPortablePath",
    pattern: /\bgetPortablePath\s*\(/,
    hint: "use portablePath(fromLocalURL:) on the bridge",
  },
  {
    id: "ios-CAPBridge-shim",
    pattern: /\bCAPBridge\./,
    hint: "CAPBridge compatibility class removed — see Capacitor 9 plugin migration",
  },
  {
    id: "ios-httpsInterceptorStartIdentifier",
    pattern: /\bhttpsInterceptorStartIdentifier\b/,
    hint: "use httpInterceptorStartIdentifier",
  },
  {
    id: "ios-cordovaConfiguration-bridge-init",
    pattern: /\bcordovaConfiguration\b/,
    hint: "use CapacitorBridge initializer without cordovaConfiguration",
  },
  {
    id: "ios-bridge-getWebView",
    pattern: /\bgetWebView\s*\(\s*\)/,
    hint: "use bridge.webView",
  },
  {
    id: "ios-bridge-isSimulator",
    pattern: /\bisSimulator\s*\(\s*\)/,
    hint: "use bridge.isSimEnvironment",
  },
  {
    id: "ios-bridge-isDevMode",
    pattern: /\bisDevMode\s*\(\s*\)/,
    hint: "use bridge.isDevEnvironment",
  },
  {
    id: "ios-bridge-getStatusBarVisible",
    pattern: /\bgetStatusBarVisible\s*\(\s*\)/,
    hint: "use bridge.statusBarVisible",
  },
  {
    id: "ios-bridge-setStatusBarVisible",
    pattern: /\bsetStatusBarVisible\s*\(/,
    hint: "use bridge.statusBarVisible",
  },
  {
    id: "ios-bridge-getStatusBarStyle",
    pattern: /\bgetStatusBarStyle\s*\(\s*\)/,
    hint: "use bridge.statusBarStyle",
  },
  {
    id: "ios-bridge-setStatusBarStyle",
    pattern: /\bsetStatusBarStyle\s*\(/,
    hint: "use bridge.statusBarStyle",
  },
  {
    id: "ios-bridge-setStatusBarAnimation",
    pattern: /\bsetStatusBarAnimation\s*\(/,
    hint: "use bridge.statusBarAnimation",
  },
  {
    id: "ios-bridge-getUserInterfaceStyle",
    pattern: /\bgetUserInterfaceStyle\s*\(\s*\)/,
    hint: "use bridge.userInterfaceStyle",
  },
  {
    id: "ios-bridge-getLocalUrl",
    pattern: /\bgetLocalUrl\s*\(\s*\)/,
    hint: "use bridge.config.localURL",
  },
  {
    id: "ios-bridge-getSavedCall",
    pattern: /\bgetSavedCall\s*\(/,
    hint: "use bridge.savedCall(withID:)",
  },
  {
    id: "ios-bridge-releaseCall-callbackId",
    pattern: /\breleaseCall\s*\(\s*callbackId\s*:/,
    hint: "use bridge.releaseCall(withID:)",
  },
  {
    id: "ios-bridge-presentVC",
    pattern: /\bpresentVC\s*\(/,
    hint: "use bridge.viewController?.present(...)",
  },
  {
    id: "ios-bridge-dismissVC",
    pattern: /\bdismissVC\s*\(/,
    hint: "use bridge.viewController?.dismiss(...)",
  },
  {
    id: "ios-bridge-modulePrint",
    pattern: /\bmodulePrint\s*\(/,
    hint: "use CAPLog.print(...)",
  },
  {
    id: "android-getConfigValue",
    pattern: /\bgetConfigValue\s*\(/,
    hint: "use getConfig() and PluginConfig typed accessors",
  },
  {
    id: "android-NativePlugin",
    pattern: /@NativePlugin\b/,
    hint: "use @CapacitorPlugin",
  },
  {
    id: "android-pluginCall-save",
    pattern: /\b(?:PluginCall|pluginCall|call)\.save\s*\(\s*\)/,
    hint: "use setKeepAlive(true)",
  },
  {
    id: "android-pluginCall-isSaved",
    pattern: /\b(?:PluginCall|pluginCall|call)\.isSaved\s*\(\s*\)/,
    hint: "use isKeptAlive()",
  },
  {
    id: "android-pluginCall-isReleased",
    pattern: /\b(?:PluginCall|pluginCall|call)\.isReleased\s*\(\s*\)/,
    hint: "removed in Capacitor 9",
  },
  {
    id: "android-CAPACITOR_HTTPS_INTERCEPTOR",
    pattern: /\bCAPACITOR_HTTPS_INTERCEPTOR_START\b/,
    hint: "use CAPACITOR_HTTP_INTERCEPTOR_START",
  },
  {
    id: "android-CapConfig-AssetManager",
    pattern: /\bnew CapConfig\s*\(/,
    hint: "use CapConfig.loadDefault(Context) or CapConfig.Builder",
  },
  {
    id: "android-CapConfig-getters",
    pattern: /\b(?:CapConfig|capConfig)\w*\.(getObject|getString|getBoolean|getInt|getArray)\s*\(/,
    hint: "use typed CapConfig / PluginConfig accessors per Capacitor 9",
  },
  {
    id: "android-Plugin-saveCall",
    pattern: /(?<![\w.])saveCall\s*\(/,
    hint: "use Bridge.saveCall(PluginCall) or PluginCall.setKeepAlive(true)",
  },
  {
    id: "android-Plugin-freeSavedCall",
    pattern: /\bfreeSavedCall\s*\(\s*\)/,
    hint: "use PluginCall.release(Bridge)",
  },
  {
    id: "android-Plugin-getSavedCall-no-arg",
    pattern: /\bgetSavedCall\s*\(\s*\)/,
    hint: "use Bridge.getSavedCall(String)",
  },
  {
    id: "android-Plugin-hasDefinedPermissions",
    pattern: /\bhasDefinedPermissions\s*\(/,
    hint: "use isPermissionDeclared(String)",
  },
  {
    id: "android-Plugin-hasPermission",
    pattern: /\bhasPermission\s*\(\s*[^)]+\)/,
    hint: "use getPermissionState(String) or ActivityCompat.checkSelfPermission",
  },
  {
    id: "android-pluginRequestPermission-int",
    pattern: /\bpluginRequestPermission\s*\(/,
    hint: "use requestPermissionForAlias with @PermissionCallback",
  },
  {
    id: "android-pluginRequestPermissions-int",
    pattern: /\bpluginRequestPermissions\s*\(/,
    hint: "use requestPermissionForAliases with @PermissionCallback",
  },
  {
    id: "android-pluginRequestAllPermissions",
    pattern: /\bpluginRequestAllPermissions\s*\(\s*\)/,
    hint: "use requestAllPermissions(PluginCall, String) with @PermissionCallback",
  },
  {
    id: "android-startActivityForResult-int",
    pattern: /\bstartActivityForResult\s*\(.+,\s*\d+\s*\)/,
    hint: "use startActivityForResult(PluginCall, Intent, String) with @ActivityCallback",
  },
  {
    id: "android-startActivityForPluginWithResult-int",
    pattern: /\bstartActivityForPluginWithResult\s*\(/,
    hint: "use Plugin.startActivityForResult with String callback id",
  },
  {
    id: "android-MessageHandler-3arg",
    pattern: /\bnew MessageHandler\s*\([^)]*,[^)]*,[^)]*\)/,
    hint: "use MessageHandler(Bridge, WebView)",
  },
  {
    id: "android-getResponseHeaders",
    pattern: /\.getResponseHeaders\s*\(\s*\)/,
    hint: "use buildDefaultResponseHeaders()",
  },
];

/**
 * Mask comments and string literals so migration notes do not false-positive.
 * @param {string} source
 * @returns {string}
 */
export function maskCommentsAndStrings(source) {
  let out = "";
  let i = 0;
  let inBlock = false;
  let inLine = false;
  /** @type {string | null} */
  let inStr = null;
  let escape = false;

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];

    if (inBlock) {
      if (c === "*" && next === "/") {
        inBlock = false;
        out += "  ";
        i += 2;
        continue;
      }
      if (c === "\n") {
        out += "\n";
      } else {
        out += " ";
      }
      i++;
      continue;
    }

    if (inLine) {
      if (c === "\n") {
        inLine = false;
        out += "\n";
      } else {
        out += " ";
      }
      i++;
      continue;
    }

    if (inStr) {
      if (escape) {
        escape = false;
        out += " ";
        i++;
        continue;
      }
      if (c === "\\") {
        escape = true;
        out += " ";
        i++;
        continue;
      }
      if (c === inStr) {
        inStr = null;
        out += " ";
        i++;
        continue;
      }
      out += c === "\n" ? "\n" : " ";
      i++;
      continue;
    }

    if (c === "/" && next === "*") {
      inBlock = true;
      out += "  ";
      i += 2;
      continue;
    }
    if (c === "/" && next === "/") {
      inLine = true;
      out += "  ";
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      out += " ";
      i++;
      continue;
    }

    out += c;
    i++;
  }

  return out;
}

function readText(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function walkFiles(rootDir, exts) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        stack.push(path.join(dir, e.name));
        continue;
      }
      if (!e.isFile()) continue;
      for (const ext of exts) {
        if (e.name.endsWith(ext)) {
          out.push(path.join(dir, e.name));
          break;
        }
      }
    }
  }
  out.sort();
  return out;
}

function parseArgs(argv) {
  const out = { dir: process.cwd(), selfTest: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" || a === "--pluginDir") {
      out.dir = path.resolve(argv[++i] || ".");
      continue;
    }
    if (a === "--self-test") {
      out.selfTest = true;
      continue;
    }
  }
  return out;
}

/**
 * @param {string} relPath
 * @param {string} text
 * @returns {{ rule: string; line: number; hint: string; snippet: string }[]}
 */
export function scanFile(relPath, text) {
  const masked = maskCommentsAndStrings(text);
  const hits = [];
  const lines = masked.split("\n");
  const rawLines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        hits.push({
          rule: rule.id,
          line: i + 1,
          hint: rule.hint,
          snippet: (rawLines[i] || line).trim(),
        });
      }
    }
  }
  return hits;
}

/**
 * @param {string} pluginDir
 * @returns {{ file: string; rule: string; line: number; hint: string; snippet: string }[]}
 */
export function scanPluginDir(pluginDir) {
  const pkgPath = path.join(pluginDir, "package.json");
  if (!exists(pkgPath)) {
    throw new Error(`missing package.json in ${pluginDir}`);
  }

  let pkg;
  try {
    pkg = JSON.parse(readText(pkgPath));
  } catch (e) {
    throw new Error(`invalid package.json (${pkgPath}): ${e?.message || e}`);
  }

  const cap = typeof pkg.capacitor === "object" && pkg.capacitor ? pkg.capacitor : {};
  const supportsAndroid = typeof cap.android === "object" && cap.android;
  const supportsIos = typeof cap.ios === "object" && cap.ios;

  if (!supportsAndroid && !supportsIos) {
    return [];
  }

  const nativeExts = [".swift", ".m", ".mm", ".h", ".java", ".kt"];
  const filesToScan = [];

  if (supportsAndroid) {
    const androidRoot = path.resolve(pluginDir, cap.android?.src || "android");
    const androidMain = path.join(androidRoot, "src", "main");
    if (exists(androidMain)) {
      filesToScan.push(...walkFiles(androidMain, nativeExts));
    }
  }

  if (supportsIos) {
    const iosDir = path.resolve(pluginDir, cap.ios?.src || "ios");
    const scanRoot = exists(path.join(iosDir, "Sources")) ? path.join(iosDir, "Sources") : iosDir;
    if (exists(scanRoot)) {
      filesToScan.push(...walkFiles(scanRoot, nativeExts));
    }
  }

  const violations = [];
  for (const abs of filesToScan) {
    const rel = path.relative(pluginDir, abs);
    const text = readText(abs);
    if (!text) continue;
    for (const hit of scanFile(rel, text)) {
      violations.push({ file: rel, ...hit });
    }
  }

  return violations;
}

function runSelfTest() {
  const fixtureDir = path.join(__dirname, "fixtures", "cap9-deprecated");
  const positiveFiles = [
    "positive-android.java",
    "positive-ios.swift",
    "positive-objc.m",
  ];
  const negativeFiles = ["negative-masked.java", "negative-masked.swift"];

  const matchedRules = new Set();
  for (const name of positiveFiles) {
    const p = path.join(fixtureDir, name);
    const text = readText(p);
    if (!text) {
      console.error(`[cap9-deprecated] self-test missing fixture ${name}`);
      process.exit(1);
    }
    for (const hit of scanFile(name, text)) {
      matchedRules.add(hit.rule);
    }
  }

  const missingRules = RULES.map((r) => r.id).filter((id) => !matchedRules.has(id));
  if (missingRules.length) {
    console.error("[cap9-deprecated] self-test FAIL: no fixture hit for rules:");
    for (const id of missingRules) {
      console.error(`- ${id}`);
    }
    process.exit(1);
  }

  for (const name of negativeFiles) {
    const p = path.join(fixtureDir, name);
    const hits = scanFile(name, readText(p));
    if (hits.length) {
      console.error(`[cap9-deprecated] self-test FAIL: ${name} should not match (${hits.length} hits)`);
      for (const h of hits) {
        console.error(`- line ${h.line} [${h.rule}]`);
      }
      process.exit(1);
    }
  }

  console.error(`[cap9-deprecated] self-test OK (${RULES.length} rules, ${positiveFiles.length} positive fixtures)`);
}

const args = parseArgs(process.argv);

if (args.selfTest) {
  runSelfTest();
  process.exit(0);
}

const pluginDir = args.dir;

try {
  const violations = scanPluginDir(pluginDir);
  if (violations.length) {
    const relDir = path.relative(process.cwd(), pluginDir) || ".";
    console.error(`[cap9-deprecated] FAIL in ${relDir}`);
    for (const v of violations) {
      console.error(`- ${v.file}:${v.line} [${v.rule}] ${v.snippet}`);
      console.error(`  → ${v.hint}`);
    }
    process.exit(1);
  }
} catch (e) {
  console.error(`[cap9-deprecated] ERROR: ${e?.message || e}`);
  process.exit(2);
}

process.exit(0);
