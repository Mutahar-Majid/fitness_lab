import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import {
  normalizeExerciseDbRecord,
  type ExerciseDbRecord,
} from "../lib/data/exerciseDbNormalize";
import type { Exercise } from "../lib/domain/types";

const DEFAULT_ENDPOINT = "https://oss.exercisedb.dev/api/v1/exercises";
const GENERATED_PATH = "lib/data/exercisedb.generated.json";
const PREVIEW_PATH = "work/exercisedb-import-preview.json";
const PAGE_LIMIT = 25;
const PAGE_DELAY_MS = 300;
const MEDIA_CHECK_CONCURRENCY = 16;
const execFileAsync = promisify(execFile);

class ExerciseDbHttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

interface ExerciseDbPage {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
  data: ExerciseDbRecord[];
}

async function main() {
  const endpoint = process.env.EXERCISEDB_ENDPOINT ?? DEFAULT_ENDPOINT;
  const records = await fetchAllExerciseDbRecords(endpoint);
  const normalizedExercises = normalizeExerciseDbRecords(records);
  const exercises = await filterExercisesWithAvailableGifs(
    normalizedExercises
  );

  await mkdir("work", { recursive: true });
  await writeFile(PREVIEW_PATH, `${JSON.stringify(exercises, null, 2)}\n`);
  await writeFile(GENERATED_PATH, `${JSON.stringify(exercises, null, 2)}\n`);

  console.log(
    `Imported ${exercises.length} strength exercises with available GIFs from ${records.length} ExerciseDB records.`
  );
}

export async function fetchAllExerciseDbRecords(endpoint: string) {
  const records: ExerciseDbRecord[] = [];
  let after: string | undefined;

  while (true) {
    const url = new URL(endpoint);
    url.searchParams.set("limit", String(PAGE_LIMIT));
    if (after) {
      url.searchParams.set("after", after);
    }

    const page = await fetchExerciseDbPageWithRetry(url);
    if (!page.success) {
      throw new Error("ExerciseDB import failed: response success was false");
    }

    records.push(...page.data);

    if (!page.meta.hasNextPage || !page.meta.nextCursor) {
      return records;
    }

    after = page.meta.nextCursor;
    await delay(PAGE_DELAY_MS);
  }
}

export function normalizeExerciseDbRecords(records: ExerciseDbRecord[]) {
  return records
    .map(normalizeExerciseDbRecord)
    .filter((item): item is Exercise => Boolean(item))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function filterExercisesWithAvailableGifs(exercises: Exercise[]) {
  const availability = new Array<boolean>(exercises.length);
  let nextIndex = 0;

  async function checkNextExercise() {
    while (nextIndex < exercises.length) {
      const index = nextIndex;
      nextIndex += 1;
      availability[index] = await hasAvailableGif(exercises[index].gifUrl);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(MEDIA_CHECK_CONCURRENCY, exercises.length) },
      checkNextExercise
    )
  );

  return exercises.filter((_, index) => availability[index]);
}

export function isAvailableGifResponse(
  status: number,
  contentType: string | null
) {
  return status >= 200 &&
    status < 300 &&
    contentType?.toLowerCase().includes("image/gif") === true;
}

async function fetchExerciseDbPageWithRetry(url: URL) {
  const retryDelays = [1_500, 4_000, 8_000];

  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      return await fetchExerciseDbPage(url);
    } catch (error) {
      const shouldRetry =
        error instanceof ExerciseDbHttpError &&
        (error.status === 429 || error.status >= 500) &&
        attempt < retryDelays.length;

      if (!shouldRetry) {
        throw error;
      }

      await delay(retryDelays[attempt]);
    }
  }

  throw new Error("ExerciseDB import failed after retries");
}

async function fetchExerciseDbPage(url: URL) {
  try {
    return await fetchJsonWithNativeFetch(url);
  } catch (error) {
    if (!isCertificateError(error)) {
      throw error;
    }

    return fetchJsonWithCurl(url);
  }
}

async function fetchJsonWithNativeFetch(url: URL) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    throw new ExerciseDbHttpError(
      `ExerciseDB import failed: ${response.status}${
        retryAfter ? `; retry after ${retryAfter}s` : ""
      }`,
      response.status
    );
  }

  return (await response.json()) as ExerciseDbPage;
}

async function fetchJsonWithCurl(url: URL) {
  const { stdout } = await execFileAsync("curl", [
    "-L",
    "-s",
    "-H",
    "accept: application/json",
    "-w",
    "\n%{http_code}",
    url.toString(),
  ]);
  const statusBreak = stdout.lastIndexOf("\n");
  const body = stdout.slice(0, statusBreak);
  const status = Number(stdout.slice(statusBreak + 1));

  if (status >= 400) {
    throw new ExerciseDbHttpError(
      `ExerciseDB import failed: ${status}; ${body.slice(0, 160)}`,
      status
    );
  }

  return JSON.parse(body) as ExerciseDbPage;
}

async function hasAvailableGif(gifUrl: string) {
  try {
    const response = await fetch(gifUrl, {
      method: "HEAD",
    });
    return isAvailableGifResponse(
      response.status,
      response.headers.get("content-type")
    );
  } catch {
    return hasAvailableGifWithCurl(gifUrl);
  }
}

async function hasAvailableGifWithCurl(gifUrl: string) {
  const { stdout } = await execFileAsync("curl", [
    "-I",
    "-L",
    "-sS",
    "--max-time",
    "20",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}\n%{content_type}",
    gifUrl,
  ]);
  const [status, contentType = ""] = stdout.trim().split("\n");

  return isAvailableGifResponse(Number(status), contentType);
}

function isCertificateError(error: unknown) {
  if (!(error instanceof TypeError) || !(error.cause instanceof Error)) {
    return false;
  }

  const cause = error.cause as Error & { code?: unknown };
  return cause.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (process.argv[1]?.endsWith("import-exercisedb.ts")) {
  void main();
}
