import type { StudyI } from "$lib/models";
import { derived, writable, type Readable, type Writable } from "svelte/store";
import { studiesStore } from "./studies-store";

export const selectedStudyIdStore: Writable<string | null> = writable<
    string | null
>(null);

export const selectedStudyStore: Readable<StudyI | null> = derived(
    [studiesStore, selectedStudyIdStore],
    ([$studies, $selectedId]) =>
        $studies.find((study: StudyI) => study.id === $selectedId) || null,
);
