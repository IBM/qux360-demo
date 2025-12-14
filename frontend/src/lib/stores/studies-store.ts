import { TRANSCRIPT_STATUS_MAP } from "$lib/common";
import {
    StudyStatus,
    TranscriptState,
    TranscriptStatus,
    ValidationStatus,
    ValidationStrategy,
    type EntityAnonymizationResponse,
    type IdentifiedTopicI,
    type IdentifyParticipantResponse,
    type SpeakerAnonymizationResponse,
    type StudyI,
    type TranscriptFileI,
    type UploadTranscriptFileSuccessI,
    type ValidationI,
} from "$lib/models";
import { apiService, studiesCacheService } from "$lib/services";
import { writable } from "svelte/store";
import { notificationsStore } from "./notifications-store";

const createStudiesStore = () => {
    const { subscribe, set, update } = writable<StudyI[]>(
        studiesCacheService.getAllStudies(),
    );

    const computeStudyStatus = (study: StudyI): StudyStatus => {
        const transcripts: TranscriptFileI[] = study.transcriptFiles;

        const needsReview = transcripts.some(
            (t: TranscriptFileI) =>
                TRANSCRIPT_STATUS_MAP[t.status].state ===
                TranscriptState.Review,
        );

        if (!needsReview) {
            return StudyStatus.Ready;
        }

        return StudyStatus.NeedsReview;
    };

    const runTranscriptAnonymization = async (
        study: StudyI,
        transcriptFileId: number,
        anonymizationFn: (
            transcriptFile: TranscriptFileI,
        ) => Promise<Partial<TranscriptFileI>>,
    ) => {
        const transcriptFileIndex: number = study.transcriptFiles.findIndex(
            (t: TranscriptFileI) => t.id === transcriptFileId,
        );
        if (transcriptFileIndex === -1) {
            return;
        }

        const transcriptFile: TranscriptFileI =
            study.transcriptFiles[transcriptFileIndex];

        if (
            [
                TranscriptStatus.ReadyToIdentifyParticipants,
                TranscriptStatus.RunningParticipantIdentification,
                TranscriptStatus.ParticipantNeedsReview,
            ].includes(transcriptFile.status)
        ) {
            return;
        }

        transcriptFile.status = TranscriptStatus.RunningAnonymization;
        study.transcriptFiles[transcriptFileIndex] = transcriptFile;
        study.status = computeStudyStatus(study);

        await studiesCacheService.update(study);
        update((studies: StudyI[]) =>
            studies.map((s: StudyI) => (s.id === study.id ? study : s)),
        );

        await new Promise((r) => setTimeout(r, 500));

        const anonymizationData: Partial<TranscriptFileI> =
            await anonymizationFn(transcriptFile);

        const updatedTranscriptFile: TranscriptFileI = {
            ...transcriptFile,
            ...anonymizationData,
            status: TranscriptStatus.ReadyForAnalysis,
        };

        study.transcriptFiles[transcriptFileIndex] = updatedTranscriptFile;
        study.status = computeStudyStatus(study);

        await studiesCacheService.update(study);
        update((studies: StudyI[]) =>
            studies.map((s: StudyI) => (s.id === study.id ? study : s)),
        );

        await new Promise((r) => setTimeout(r, 500));
    };

    const getParticipantExplanation = (
        participantName: string,
        validation: ValidationI | null,
    ): string => {
        if (!validation) {
            return "";
        } else {
            let participantExplanation: string = "";
            if (validation.status === ValidationStatus.Ok) {
                participantExplanation = `AI identified ${participantName} as the participant based on conversation patterns and content, and they have ≥60% of the words in the transcript.`;
            } else if (validation.status === ValidationStatus.Check) {
                participantExplanation = `AI identified ${participantName} as the participant based on conversation patterns and content, and they have 50-60% of the words in the transcript.`;
            } else if (validation.status === ValidationStatus.Iffy) {
                participantExplanation = `AI identified ${participantName} as the participant based on conversation patterns and content, and they have <50% of the words in the transcript.`;
            }
            return participantExplanation;
        }
    };

    return {
        subscribe,
        refresh: () => set(studiesCacheService.getAllStudies()),
        updateTranscriptFilesData: async (study: StudyI) => {
            for (let i = 0; i < study.transcriptFiles.length; i++) {
                const transcriptFile: TranscriptFileI =
                    study.transcriptFiles[i];

                if (
                    transcriptFile.status ===
                    TranscriptStatus.ReadyToIdentifyParticipants
                ) {
                    transcriptFile.status =
                        TranscriptStatus.RunningParticipantIdentification;

                    const data: IdentifyParticipantResponse =
                        await apiService.identifyParticipant(
                            transcriptFile.id!,
                        );

                    if (data.validation) {
                        if (data.validation.status !== ValidationStatus.Ok) {
                            transcriptFile.status =
                                TranscriptStatus.ParticipantNeedsReview;
                        } else if (
                            data.validation.status === ValidationStatus.Ok
                        ) {
                            transcriptFile.status =
                                TranscriptStatus.ReadyForAnonymization;
                        }
                    } else {
                        transcriptFile.status =
                            TranscriptStatus.ParticipantNeedsReview;
                    }

                    const updatedTranscriptFile: TranscriptFileI = {
                        ...transcriptFile,
                        participant: {
                            name: data.participant,
                            explanation: getParticipantExplanation(
                                data.participant,
                                data.validation,
                            ),
                            showExplanation: true,
                            validation: data.validation,
                        },
                        speakers: data.speakers,
                    };

                    study.transcriptFiles[i] = updatedTranscriptFile;
                    study.status = computeStudyStatus(study);

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
        updateTranscriptFiles: async (
            studyId: string,
            newTranscriptFiles: TranscriptFileI[],
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: newTranscriptFiles,
                    };
                    updatedStudy.status = computeStudyStatus(updatedStudy);

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
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
            study.status = computeStudyStatus(study);

            await studiesCacheService.add(study);
            update((studies: StudyI[]) => [...studies, study]);

            notificationsStore.addNotification({
                kind: "success",
                title: "Study added",
                subtitle: `Study '${study.name}' was added successfully.`,
            });
        },
        update: async (updatedStudy: StudyI): Promise<void> => {
            updatedStudy.status = computeStudyStatus(updatedStudy);

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
            await runTranscriptAnonymization(
                study,
                transcriptFileId,
                async (transcriptFile: TranscriptFileI) => {
                    const data: SpeakerAnonymizationResponse =
                        await apiService.getSpeakerAnonymizationMap(
                            transcriptFile.id!,
                        );

                    return {
                        speaker_anonymization_map:
                            data.speakers_anonymization_map,
                    };
                },
            );
        },
        runTranscriptEntityAnonymization: async (
            study: StudyI,
            transcriptFileId: number,
        ) => {
            await runTranscriptAnonymization(
                study,
                transcriptFileId,
                async (transcriptFile: TranscriptFileI) => {
                    const data: EntityAnonymizationResponse =
                        await apiService.getEntityAnonymizationMap(
                            transcriptFile.id!,
                        );

                    return {
                        entity_anonymization_map:
                            data.entities_anonymization_map || {},
                    };
                },
            );
        },
        runTranscriptSpeakerAndEntityAnonymization: async (
            study: StudyI,
            transcriptFileId: number,
        ) => {
            await runTranscriptAnonymization(
                study,
                transcriptFileId,
                async (transcriptFile: TranscriptFileI) => {
                    const [speakerData, entityData] = await Promise.all([
                        apiService.getSpeakerAnonymizationMap(
                            transcriptFile.id!,
                        ),
                        apiService.getEntityAnonymizationMap(
                            transcriptFile.id!,
                        ),
                    ]);

                    return {
                        speaker_anonymization_map:
                            speakerData.speakers_anonymization_map,
                        entity_anonymization_map:
                            entityData.entities_anonymization_map || {},
                    };
                },
            );
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
        updateParticipantExplanation: (
            studyId: string,
            transcriptFileId: number,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcriptFileId) return t;

                            if (!t.participant.validation) {
                                return t;
                            } else {
                                return {
                                    ...t,
                                    status: TranscriptStatus.ReadyForAnonymization,
                                    participant: {
                                        ...t.participant,
                                        showExplanation: false,
                                        validation: {
                                            ...t.participant.validation,
                                            isApprovedByUser: true,
                                        },
                                    },
                                };
                            }
                        });

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };

                    updatedStudy.status = computeStudyStatus(updatedStudy);
                    studiesCacheService.update(updatedStudy);

                    return updatedStudy;
                });
            });
        },
        approvedTopic: (
            studyId: string,
            transcriptFileId: number,
            identifiedTopic: IdentifiedTopicI,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcriptFileId) return t;

                            const updatedTopics: IdentifiedTopicI[] =
                                t.topics.map((tc: IdentifiedTopicI) => {
                                    if (tc.topic !== identifiedTopic.topic)
                                        return tc;
                                    if (!tc.validation) return tc;

                                    return {
                                        ...tc,
                                        validation: {
                                            ...tc.validation,
                                            isApprovedByUser: true,
                                        },
                                    };
                                });

                            return {
                                ...t,
                                topics: updatedTopics,
                            };
                        });

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };

                    updatedStudy.status = computeStudyStatus(updatedStudy);
                    studiesCacheService.update(updatedStudy);

                    return updatedStudy;
                });
            });
        },
        removeTopic: (
            studyId: string,
            transcriptFileId: number,
            topicToRemove: IdentifiedTopicI,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcriptFileId) return t;

                            const updatedTopics: IdentifiedTopicI[] =
                                t.topics.filter(
                                    (tc: IdentifiedTopicI) =>
                                        tc.topic !== topicToRemove.topic,
                                );

                            return {
                                ...t,
                                topics: updatedTopics,
                            };
                        });

                    const updatedStudy: StudyI = {
                        ...study,
                        transcriptFiles: updatedFiles,
                    };

                    updatedStudy.status = computeStudyStatus(updatedStudy);
                    studiesCacheService.update(updatedStudy);

                    return updatedStudy;
                });
            });
        },
        updateValidationStrategy: (
            studyId: string,
            validationStrategy: ValidationStrategy,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedStudy: StudyI = {
                        ...study,
                        validation_strategy: validationStrategy,
                    };

                    updatedStudy.status = computeStudyStatus(updatedStudy);
                    studiesCacheService.update(updatedStudy);

                    return updatedStudy;
                });
            });
        },
    };
};

export const studiesStore = createStudiesStore();
