#!/usr/bin/env node
/**
 * Capacitor 9 removed / deprecated native API guard for plugin packages.
 *
 * Fails CI when plugin native sources still call APIs removed in Capacitor 9.
 * See https://capacitorjs.com/docs/next/updating/plugins/9-0
 *
 * Cap-go: Package.swift may keep the Cordova SPM product for Cap 8 consumers — do not fail on it.
 *
 * Usage:
 *   node scripts/check-cap9-deprecated.mjs
 *   node scripts/check-cap9-deprecated.mjs --dir path
 */

import fs from "node:fs";
import path from "node:path";

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
]);

/** @type {{ id: string; pattern: RegExp; hint: string }[]} */
const RULES = [
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
    pattern: /\bCapConfig\s*\(\s*[^,)]+AssetManager/,
    hint: "use CapConfig.loadDefault(Context) or CapConfig.Builder",
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
];

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
  const out = { dir: process.cwd() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" || a === "--pluginDir") {
      out.dir = path.resolve(argv[++i] || ".");
      continue;
    }
  }
  return out;
}

function scanFile(_relPath, text) {
  const hits = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        hits.push({
          rule: rule.id,
          line: i + 1,
          hint: rule.hint,
          snippet: line.trim(),
        });
      }
    }
  }
  return hits;
}

const args = parseArgs(process.argv);
const pluginDir = args.dir;
const pkgPath = path.join(pluginDir, "package.json");

if (!exists(pkgPath)) {
  console.error(`[cap9-deprecated] ERROR: missing package.json in ${pluginDir}`);
  process.exit(2);
}

let pkg;
try {
  pkg = JSON.parse(readText(pkgPath));
} catch (e) {
  console.error(`[cap9-deprecated] ERROR: invalid package.json (${pkgPath}): ${e?.message || e}`);
  process.exit(2);
}

const cap = typeof pkg.capacitor === "object" && pkg.capacitor ? pkg.capacitor : {};
const supportsAndroid = typeof cap.android === "object" && cap.android;
const supportsIos = typeof cap.ios === "object" && cap.ios;

if (!supportsAndroid && !supportsIos) {
  process.exit(0);
}

const nativeExts = [".swift", ".m", ".mm", ".h", ".java", ".kt"];
const filesToScan = [];

if (supportsAndroid) {
  const androidMain = path.join(pluginDir, "android", "src", "main");
  if (exists(androidMain)) {
    filesToScan.push(...walkFiles(androidMain, nativeExts));
  }
}

if (supportsIos) {
  const iosDir = path.join(pluginDir, "ios");
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

if (violations.length) {
  const relDir = path.relative(process.cwd(), pluginDir) || ".";
  console.error(`[cap9-deprecated] FAIL in ${relDir}`);
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} [${v.rule}] ${v.snippet}`);
    console.error(`  → ${v.hint}`);
  }
  process.exit(1);
}

process.exit(0);
