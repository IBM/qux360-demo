import type {
    StudyI,
    TranscriptFileI,
    UploadTranscriptFileSuccessI,
} from "$lib/models";
import { apiService, studiesCacheService } from "$lib/services";
import { writable } from "svelte/store";
import { notificationsStore } from "./notifications-store";

const createStudiesStore = () => {
    const { subscribe, set, update } = writable<StudyI[]>(
        studiesCacheService.getAllStudies(),
    );

    return {
        subscribe,
        refresh: () => set(studiesCacheService.getAllStudies()),
        add: async (study: StudyI): Promise<void> => {
            const { successes, errors } = await apiService.uploadFiles(
                study.transcriptFiles,
            );
            if (errors.length > 0) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Study upload failed",
                    subtitle: `${errors.length} file(s) failed to upload.`,
                });
                return;
            }

            study.transcriptFiles = study.transcriptFiles.map(
                (transcriptFile: TranscriptFileI) => {
                    // Find the corresponding success result for each transcriptFile
                    const success: UploadTranscriptFileSuccessI | undefined =
                        successes.find(
                            (s: UploadTranscriptFileSuccessI) =>
                                s.filename === transcriptFile.name,
                        );
                    if (success) {
                        // If the file was successfully uploaded, assign the fileId
                        return {
                            ...transcriptFile,
                            id: success.fileId,
                        };
                    }
                    return transcriptFile; // If not found, leave the file unchanged
                },
            );

            await studiesCacheService.add(study);
            update((studies: StudyI[]) => [...studies, study]);
            notificationsStore.addNotification({
                kind: "success",
                title: "Study added",
                subtitle: `Study '${study.name}' was added successfully.`,
            });
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
