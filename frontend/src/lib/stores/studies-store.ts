import type { StudyI } from "$lib/models";
import { studiesCacheService } from "$lib/services";
import { writable } from "svelte/store";

const createStudiesStore = () => {
    const { subscribe, set, update } = writable<StudyI[]>(
        studiesCacheService.getAllStudies(),
    );

    return {
        subscribe,
        refresh: () => set(studiesCacheService.getAllStudies()),
        add: async (study: StudyI): Promise<void> => {
            await studiesCacheService.add(study);
            update((studies: StudyI[]) => [...studies, study]);
        },
        update: async (updatedStudy: StudyI): Promise<void> => {
            await studiesCacheService.update(updatedStudy);
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
