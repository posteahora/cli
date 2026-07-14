import { readFileSync, statSync } from "node:fs";
import { basename, extname } from "node:path";
import type { ParsedArgs } from "../args.js";
import { bool } from "../args.js";
import { ApiClient } from "../api.js";
import { ok, fail, info, printJson, c } from "../output.js";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4",
  ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/x-m4v",
};

interface Presigned {
  uploadUrl: string;
  publicUrl: string;
}

export async function upload(args: ParsedArgs): Promise<void> {
  const file = args._[0];
  if (!file) fail("Usage: posteahora upload <file>");

  let bytes: Buffer;
  let size: number;
  try {
    bytes = readFileSync(file);
    size = statSync(file).size;
  } catch {
    return fail(`Can't read file: ${file}`);
  }

  const contentType = CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";

  // 1. Ask the API for a presigned upload URL.
  const presigned = await new ApiClient().post<Presigned>("/media/upload-url", {
    filename: basename(file),
    contentType,
    sizeBytes: size,
  });

  // 2. PUT the raw bytes straight to storage.
  let putRes: Response;
  try {
    // Exact file bytes as a plain ArrayBuffer (a first-class fetch BodyInit —
    // avoids the Uint8Array<ArrayBufferLike> vs BlobPart generic friction).
    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    putRes = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
    });
  } catch (e) {
    return fail(`Upload failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!putRes.ok) fail(`Upload failed: HTTP ${putRes.status}`);

  if (bool(args, "json")) return printJson({ publicUrl: presigned.publicUrl });

  ok("Uploaded.");
  info(c.dim("Use this in a post with --media:"));
  info(presigned.publicUrl);
}
