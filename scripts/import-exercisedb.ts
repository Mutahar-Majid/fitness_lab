import { writeFile } from "node:fs/promises";
import { seededExercises } from "../lib/data/seed";
import type { Exercise } from "../lib/domain/types";

type ExerciseDbRecord = {
  id: string;
  name: string;
  gifUrl?: string;
  bodyPart?: string;
  target?: string;
  secondaryMuscles?: string[];
  equipment?: string;
  instructions?: string[];
};

const allowEquipment = new Set([
  "barbell",
  "dumbbell",
  "dumbbells",
  "cable",
  "machine",
  "smith machine",
  "kettlebell",
  "body weight",
  "weighted",
]);

const blockTerms = ["cardio", "run", "walk", "stretch", "mobility"];

export function normalizeExerciseDbRecord(record: ExerciseDbRecord): Exercise | null {
  const equipment = (record.equipment ?? "body weight").toLowerCase();
  const name = record.name.toLowerCase();

  if (!allowEquipment.has(equipment) || blockTerms.some((term) => name.includes(term))) {
    return null;
  }

  return {
    id: record.id,
    sourceExerciseId: record.id,
    name: titleCase(record.name),
    gifUrl: record.gifUrl ?? "",
    bodyParts: [],
    targetMuscles: record.target ? [record.target] : [],
    secondaryMuscles: record.secondaryMuscles ?? [],
    equipment: [equipment],
    instructions: record.instructions ?? [],
    source: "exercisedb",
    isStrength: true,
    aliases: [],
    movementType: "compound",
  };
}

async function main() {
  const endpoint = process.env.EXERCISEDB_ENDPOINT;
  if (!endpoint) {
    await writeFile(
      "work/exercisedb-import-preview.json",
      JSON.stringify(seededExercises, null, 2)
    );
    return;
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`ExerciseDB import failed: ${response.status}`);
  }

  const records = (await response.json()) as ExerciseDbRecord[];
  const exercises = records
    .map(normalizeExerciseDbRecord)
    .filter((item): item is Exercise => Boolean(item));

  await writeFile("work/exercisedb-import-preview.json", JSON.stringify(exercises, null, 2));
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

void main();
