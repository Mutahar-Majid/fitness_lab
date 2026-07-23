import type { BodyPart, Exercise } from "../domain/types";

export interface ExerciseDbRecord {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

const unsupportedBodyParts = new Set(["cardio", "neck", "lower arms"]);
const cardioEquipment = new Set([
  "elliptical machine",
  "skierg machine",
  "stationary bike",
  "stepmill machine",
  "upper body ergometer",
]);
const blockNameTerms = [
  "cycling",
  "elliptical",
  "run",
  "running",
  "skierg",
  "stepmill",
  "walk",
  "walking",
];
const isolationNameTerms = [
  "calf raise",
  "curl",
  "crunch",
  "extension",
  "fly",
  "flyes",
  "lateral raise",
  "pressdown",
  "raise",
];
const tricepsTerms = ["triceps", "tricep"];
const bicepsTerms = ["biceps", "bicep", "brachialis"];
const quadTerms = ["quad", "quadriceps", "vastus"];
const hamstringTerms = ["hamstring", "glute", "gluteus", "hip", "posterior"];

export function normalizeExerciseDbRecord(record: ExerciseDbRecord): Exercise | null {
  const name = normalizeText(record.name);
  const rawBodyParts = record.bodyParts.map(normalizeText);
  const equipment = normalizeList(record.equipments);

  if (
    !record.exerciseId ||
    !name ||
    !record.gifUrl ||
    rawBodyParts.some((part) => unsupportedBodyParts.has(part)) ||
    equipment.some((item) => cardioEquipment.has(item)) ||
    hasBlockedNameTerm(name)
  ) {
    return null;
  }

  const targetMuscles = normalizeList(record.targetMuscles);
  const secondaryMuscles = normalizeList(record.secondaryMuscles);
  const muscleText = [...targetMuscles, ...secondaryMuscles].join(" ");
  const bodyParts = mapBodyParts(rawBodyParts, muscleText);

  if (bodyParts.length === 0) {
    return null;
  }

  return {
    id: record.exerciseId,
    sourceExerciseId: record.exerciseId,
    name: titleCase(name),
    gifUrl: record.gifUrl,
    bodyParts,
    targetMuscles,
    secondaryMuscles,
    equipment,
    instructions: record.instructions.map(cleanInstruction).filter(Boolean),
    source: "exercisedb_oss",
    isStrength: true,
    aliases: buildAliases(name, record.exerciseId),
    movementType: inferMovementType(name, targetMuscles),
  };
}

function mapBodyParts(rawBodyParts: string[], muscleText: string): BodyPart[] {
  const mapped = new Set<BodyPart>();

  for (const part of rawBodyParts) {
    if (part === "chest") {
      mapped.add("chest");
    } else if (part === "back") {
      mapped.add("back");
    } else if (part === "shoulders") {
      mapped.add("shoulders");
    } else if (part === "lower legs") {
      mapped.add("calves");
    } else if (part === "waist") {
      mapped.add("core");
    } else if (part === "upper arms") {
      if (containsAny(muscleText, tricepsTerms)) {
        mapped.add("triceps");
      }
      if (containsAny(muscleText, bicepsTerms)) {
        mapped.add("biceps");
      }
    } else if (part === "upper legs") {
      if (containsAny(muscleText, hamstringTerms)) {
        mapped.add("hamstrings_glutes");
      }
      if (containsAny(muscleText, quadTerms) || !mapped.has("hamstrings_glutes")) {
        mapped.add("quads");
      }
    }
  }

  return Array.from(mapped);
}

function inferMovementType(
  name: string,
  targetMuscles: string[]
): Exercise["movementType"] {
  const hasNarrowTarget = targetMuscles.length <= 1;
  const looksIsolation = isolationNameTerms.some((term) => name.includes(term));

  return hasNarrowTarget && looksIsolation ? "isolation" : "compound";
}

function buildAliases(name: string, exerciseId: string) {
  const aliases = new Set<string>([exerciseId]);

  if (name.includes("dumbbell")) {
    aliases.add(name.replaceAll("dumbbell", "db"));
  }
  if (name.includes("barbell")) {
    aliases.add(name.replaceAll("barbell", "bb"));
  }
  if (name.includes("bench press")) {
    aliases.add("bench");
  }

  return Array.from(aliases);
}

function cleanInstruction(instruction: string) {
  return instruction.replace(/^step:\s*\d+\s*/i, "").trim();
}

function normalizeList(values: string[]) {
  return values.map(normalizeText).filter(Boolean);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function containsAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function hasBlockedNameTerm(name: string) {
  const terms = name.split(/[^a-z0-9]+/).filter(Boolean);
  return blockNameTerms.some((term) => terms.includes(term));
}
