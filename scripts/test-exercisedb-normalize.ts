import assert from "node:assert/strict";
import { normalizeExerciseDbRecord } from "../lib/data/exerciseDbNormalize";
import type { ExerciseDbRecord } from "../lib/data/exerciseDbNormalize";
import { isAvailableGifResponse } from "./import-exercisedb";

function record(overrides: Partial<ExerciseDbRecord>): ExerciseDbRecord {
  return {
    exerciseId: "test-id",
    name: "barbell bench press",
    gifUrl: "https://static.exercisedb.dev/media/test-id.gif",
    bodyParts: ["chest"],
    equipments: ["barbell"],
    targetMuscles: ["pectorals"],
    secondaryMuscles: ["triceps", "shoulders"],
    instructions: ["Step:1 Lie flat on a bench."],
    ...overrides,
  };
}

const bench = normalizeExerciseDbRecord(record({}));
assert.ok(bench);
assert.equal(bench.id, "test-id");
assert.deepEqual(bench.bodyParts, ["chest"]);
assert.deepEqual(bench.equipment, ["barbell"]);
assert.deepEqual(bench.instructions, ["Lie flat on a bench."]);
assert.equal(bench.movementType, "compound");

const curl = normalizeExerciseDbRecord(
  record({
    exerciseId: "curl-id",
    name: "dumbbell curl",
    bodyParts: ["upper arms"],
    equipments: ["dumbbell"],
    targetMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
  })
);
assert.ok(curl);
assert.deepEqual(curl.bodyParts, ["biceps"]);
assert.equal(curl.movementType, "isolation");

const pressdown = normalizeExerciseDbRecord(
  record({
    exerciseId: "pressdown-id",
    name: "triceps pressdown",
    bodyParts: ["upper arms"],
    equipments: ["cable"],
    targetMuscles: ["triceps"],
    secondaryMuscles: [],
  })
);
assert.ok(pressdown);
assert.deepEqual(pressdown.bodyParts, ["triceps"]);

const legCurl = normalizeExerciseDbRecord(
  record({
    exerciseId: "leg-curl-id",
    name: "lever lying leg curl",
    bodyParts: ["upper legs"],
    equipments: ["leverage machine"],
    targetMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes"],
  })
);
assert.ok(legCurl);
assert.deepEqual(legCurl.bodyParts, ["hamstrings_glutes"]);

const squat = normalizeExerciseDbRecord(
  record({
    exerciseId: "squat-id",
    name: "barbell squat",
    bodyParts: ["upper legs"],
    equipments: ["barbell"],
    targetMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes"],
  })
);
assert.ok(squat);
assert.deepEqual(squat.bodyParts, ["hamstrings_glutes", "quads"]);

const crunch = normalizeExerciseDbRecord(
  record({
    exerciseId: "crunch-id",
    name: "weighted crunch",
    bodyParts: ["waist"],
    equipments: ["weighted"],
    targetMuscles: ["abs"],
    secondaryMuscles: [],
  })
);
assert.ok(crunch);
assert.deepEqual(crunch.bodyParts, ["core"]);

assert.equal(
  normalizeExerciseDbRecord(
    record({
      exerciseId: "cardio-id",
      name: "stationary bike run",
      bodyParts: ["cardio"],
      equipments: ["stationary bike"],
      targetMuscles: ["cardiovascular system"],
      secondaryMuscles: [],
    })
  ),
  null
);

assert.equal(normalizeExerciseDbRecord(record({ gifUrl: "" })), null);
assert.equal(isAvailableGifResponse(200, "image/gif"), true);
assert.equal(isAvailableGifResponse(200, "image/jpeg"), false);
assert.equal(isAvailableGifResponse(404, "image/gif"), false);

console.log("ExerciseDB normalization tests passed.");
