import type { StudyI } from "$lib/models";
import { studiesCacheService } from "$lib/services";
import { writable } from "svelte/store";

const createStudiesStore = () => {
    const { subscribe, set, update } = writable<StudyI[]>(
        studiesCacheService.getAll(),
    );

    return {
        subscribe,
        refresh: () => set(studiesCacheService.getAll()),
        add: (study: StudyI) => {
            studiesCacheService.add(study);
            update((studies: StudyI[]) => [...studies, study]);
        },
        update: (updatedStudy: StudyI) => {
            studiesCacheService.update(updatedStudy);
            update((studies: StudyI[]) =>
                studies.map((s: StudyI) =>
                    s.id === updatedStudy.id ? updatedStudy : s,
                ),
            );
        },
        delete: (id: string) => {
            studiesCacheService.delete(id);
            update((studies: StudyI[]) =>
                studies.filter((s: StudyI) => s.id !== id),
            );
        },
    };
};

export const studiesStore = createStudiesStore();
