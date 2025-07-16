import type { AstroIntegration } from "astro";
import type { AstroIntegrationLogger } from "astro";
import { encryptWithPassword } from "./core";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

export interface Config {
  password: string;
}

function RandomString():string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
}

export default function encryptedIntegration(config:Config): AstroIntegration {
  return {
    name: "astro-encrypted-integration",
    hooks: {
      "astro:config:setup":({updateConfig,injectScript,logger})=>{
        injectScript("page", fs.readFileSync(new URL("./decrypt.js",import.meta.url), "utf-8"));
      },
      "astro:build:done": async ({ dir,logger }) => {
        const htmlFiles = findHtmlFiles(dir);
        for (const file of htmlFiles) {
          let html = fs.readFileSync(file, "utf-8");
          let hasEncrypted = false;
          
          // custom-ecnrypted クラスの div を暗号化（ネスト対応）
          while (true) {
            const startMatch = html.match(/<div class="custom-ecnrypted">/);
            if (!startMatch) break;
            
            const startIndex = startMatch.index! + startMatch[0].length;
            let depth = 1;
            let currentIndex = startIndex;
            
            // バランスの取れた div タグを見つける
            while (depth > 0 && currentIndex < html.length) {
              const nextDiv = html.substring(currentIndex).match(/<\/?div[^>]*>/);
              if (!nextDiv) break;
              
              const fullMatch = nextDiv[0];
              currentIndex += nextDiv.index! + fullMatch.length;
              
              if (fullMatch.startsWith('</div>')) {
                depth--;
              } else if (fullMatch.startsWith('<div')) {
                depth++;
              }
            }
            
            if (depth === 0) {
              const inner = html.substring(startIndex, currentIndex - 6); // 6 = '</div>'.length
              const fullMatch = html.substring(startMatch.index!, currentIndex);
              
              if (!inner.trim()) {
                // 空の内容の場合は削除
                html = html.replace(fullMatch, '');
                continue;
              }
              
              const text = await encryptWithPassword(inner, config.password);
              const replacement = `<div data-enc="${text}"></div>`;
              html = html.replace(fullMatch, replacement);
              hasEncrypted = true;
            } else {
              // 不完全なマッチの場合は終了
              break;
            }
          }
          
          // encrypted クラスの div も処理（既存の処理）
          while (true) {
            const match = html.match(/<div class="encrypted">([\s\S]*?)<\/div>/);
            if (!match) break;
            
            const inner = match[1];
            if (!inner!.trim()) {
              html = html.replace(match[0], '');
              continue;
            }
            
            const text = await encryptWithPassword(inner!, config.password);
            const replacement = `<div data-enc="${text}"></div>`;
            html = html.replace(match[0], replacement);
            hasEncrypted = true;
          }
          
          // 暗号化処理があった場合のみファイルを書き込み
          if (hasEncrypted) {
            fs.writeFileSync(file, html);
          }
        }
      }
    }
  };
}

function findHtmlFiles(dir: URL | string): string[] {
  const files: string[] = [];
  const dirPath = typeof dir === "string" ? dir : fileURLToPath(dir);
  for (const file of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, file);
    if (!fs.existsSync(full)) {
      continue;
    }
    if (fs.statSync(full).isDirectory()) {
      files.push(...findHtmlFiles(full));
    } else if (full.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}