import {
    PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS,
    READY_FOR_ANALYSIS_TRANSCRIPT_STATUS,
    READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS,
    READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS,
    RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS,
    RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS,
} from "$lib/common";
import {
    ValidationStatus,
    type IdentifyParticipantResponse,
    type SpeakerAnonymizationResponse,
    type StudyI,
    type TranscriptFileI,
    type UploadTranscriptFileSuccessI,
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
        updateTranscriptFilesData: async (study: StudyI) => {
            for (let i = 0; i < study.transcriptFiles.length; i++) {
                const transcriptFile: TranscriptFileI =
                    study.transcriptFiles[i];

                if (
                    transcriptFile.status ===
                    READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS
                ) {
                    transcriptFile.status =
                        RUNNING_PARTICIPANT_IDENTIFICATION_TRANSCRIPT_STATUS;

                    const data: IdentifyParticipantResponse =
                        await apiService.identifyParticipant(
                            transcriptFile.id!,
                        );

                    if (data.validation) {
                        if (data.validation.status !== ValidationStatus.Ok) {
                            transcriptFile.status =
                                PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS;
                        } else if (
                            data.validation.status === ValidationStatus.Ok
                        ) {
                            transcriptFile.status =
                                READY_FOR_ANONYMIZATION_TRANSCRIPT_STATUS;
                        }
                    } else {
                        transcriptFile.status =
                            PARTICIPANT_NEEDS_REVIEW_TRANSCRIPT_STATUS;
                    }

                    const updatedTranscriptFile: TranscriptFileI = {
                        ...transcriptFile,
                        participant: data.participant,
                        speakers: data.speakers,
                        validation: data.validation,
                    };

                    study.transcriptFiles[i] = updatedTranscriptFile;

                    await studiesCacheService.update(study);
                    update((studies: StudyI[]) =>
                        studies.map((s: StudyI) =>
                            s.id === study.id ? study : s,
                        ),
                    );

                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
        },
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
        runTranscriptSpeakerAnonymization: async (
            study: StudyI,
            transcriptFileId: number,
        ) => {
            const transcriptFileIndex: number = study.transcriptFiles.findIndex(
                (transcriptFile: TranscriptFileI) =>
                    transcriptFile.id === transcriptFileId,
            );
            if (transcriptFileIndex === -1) {
                return;
            }
            const transcriptFile: TranscriptFileI =
                study.transcriptFiles[transcriptFileIndex];

            transcriptFile.status = RUNNING_ANONYMIZATION_TRANSCRIPT_STATUS;

            const data: SpeakerAnonymizationResponse =
                await apiService.getSpeakerAnonymizationMap(transcriptFile.id!);

            transcriptFile.status = READY_FOR_ANALYSIS_TRANSCRIPT_STATUS;

            const updatedTranscriptFile: TranscriptFileI = {
                ...transcriptFile,
                speaker_anonymization_map: data.anonymization_map,
            };

            study.transcriptFiles[transcriptFileIndex] = updatedTranscriptFile;

            await studiesCacheService.update(study);
            update((studies: StudyI[]) =>
                studies.map((s: StudyI) => (s.id === study.id ? study : s)),
            );

            await new Promise((resolve) => setTimeout(resolve, 500));
        },
        updateSpeakerAnonymizationAlias: (
            studyId: string,
            transcriptFileId: number,
            speaker: string,
            newAlias: string,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map(
                            (transcriptFile: TranscriptFileI) => {
                                if (transcriptFile.id !== transcriptFileId)
                                    return transcriptFile;

                                return {
                                    ...transcriptFile,
                                    speaker_anonymization_map: {
                                        ...transcriptFile.speaker_anonymization_map,
                                        [speaker]: newAlias,
                                    },
                                };
                            },
                        );

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };
                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
        addEntityAnonymizationAlias: (
            studyId: string,
            transcriptFileId: number,
            entity: string,
            alias: string,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map(
                            (transcriptFile: TranscriptFileI) => {
                                if (transcriptFile.id !== transcriptFileId)
                                    return transcriptFile;

                                return {
                                    ...transcriptFile,
                                    entity_anonymization_map: {
                                        ...transcriptFile.entity_anonymization_map,
                                        [entity]: alias,
                                    },
                                };
                            },
                        );

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };
                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
        updateEntityAnonymizationAlias: (
            studyId: string,
            transcriptFileId: number,
            entity: string,
            newAlias: string,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map(
                            (transcriptFile: TranscriptFileI) => {
                                if (transcriptFile.id !== transcriptFileId)
                                    return transcriptFile;

                                return {
                                    ...transcriptFile,
                                    entity_anonymization_map: {
                                        ...transcriptFile.entity_anonymization_map,
                                        [entity]: newAlias,
                                    },
                                };
                            },
                        );

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };
                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
        removeEntityAnonymizationAlias: (
            studyId: string,
            transcriptFileId: number,
            entity: string,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map(
                            (transcriptFile: TranscriptFileI) => {
                                if (transcriptFile.id !== transcriptFileId)
                                    return transcriptFile;

                                const { [entity]: _, ...remainingEntities } =
                                    transcriptFile.entity_anonymization_map;

                                return {
                                    ...transcriptFile,
                                    entity_anonymization_map: remainingEntities,
                                };
                            },
                        );

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };
                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
    };
};

export const studiesStore = createStudiesStore();
