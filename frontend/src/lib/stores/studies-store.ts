import { TRANSCRIPT_STATUS_MAP } from "$lib/common";
import {
    StudyStatus,
    TranscriptState,
    TranscriptStatus,
    ValidationStatus,
    ValidationStrategy,
    type EntityAnonymizationResponse,
    type IdentifiedThemeI,
    type IdentifiedThemeMapI,
    type IdentifiedTopicI,
    type IdentifyParticipantResponse,
    type QuoteI,
    type SpeakerAnonymizationResponse,
    type StudyI,
    type StudyThemeResult,
    type StudyThemesResponse,
    type StudyTopicsResultMap,
    type TranscriptFileI,
    type TranscriptTopicsResponse,
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
        add: async (study: StudyI): Promise<void> => {
            const { study_id, successes, errors } =
                await apiService.uploadStudyFiles(
                    study.name,
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

            study.id = study_id;
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
        delete: (id: string) => {
            studiesCacheService.delete(id);
            update((studies: StudyI[]) =>
                studies.filter((s: StudyI) => s.id !== id),
            );
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
        runTranscriptFilesParticipantIdentification: async (study: StudyI) => {
            const transcriptsToIdentify: TranscriptFileI[] =
                study.transcriptFiles.filter(
                    (t: TranscriptFileI) =>
                        t.status ===
                        TranscriptStatus.ReadyToIdentifyParticipants,
                );

            const identificationPromises: Promise<TranscriptFileI>[] =
                transcriptsToIdentify.map(
                    async (transcriptFile: TranscriptFileI) => {
                        transcriptFile.status =
                            TranscriptStatus.RunningParticipantIdentification;

                        const data: IdentifyParticipantResponse =
                            await apiService.identifyParticipant(
                                transcriptFile.id!,
                            );

                        if (data.validation) {
                            if (
                                data.validation.status !== ValidationStatus.Ok
                            ) {
                                transcriptFile.status =
                                    TranscriptStatus.ParticipantNeedsReview;
                            } else {
                                transcriptFile.status =
                                    TranscriptStatus.ReadyForAnonymization;
                            }
                        } else {
                            transcriptFile.status =
                                TranscriptStatus.ParticipantNeedsReview;
                        }

                        return {
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
                    },
                );

            const updatedTranscripts: TranscriptFileI[] = await Promise.all(
                identificationPromises,
            );

            study.transcriptFiles = study.transcriptFiles.map(
                (t: TranscriptFileI) => {
                    const updated: TranscriptFileI | undefined =
                        updatedTranscripts.find(
                            (ut: TranscriptFileI) => ut.id === t.id,
                        );
                    return updated || t;
                },
            );

            study.status = computeStudyStatus(study);

            await studiesCacheService.update(study);
            update((studies: StudyI[]) =>
                studies.map((s: StudyI) => (s.id === study.id ? study : s)),
            );
        },
        runParticipantIdentification: async (
            study: StudyI,
            transcriptFileId: number,
        ) => {
            const transcriptFileIndex: number = study.transcriptFiles.findIndex(
                (t: TranscriptFileI) => t.id === transcriptFileId,
            );
            if (transcriptFileIndex === -1) {
                return;
            }

            const transcriptFile: TranscriptFileI =
                study.transcriptFiles[transcriptFileIndex];

            transcriptFile.status =
                TranscriptStatus.RunningParticipantIdentification;
            study.transcriptFiles[transcriptFileIndex] = transcriptFile;
            study.status = computeStudyStatus(study);

            await studiesCacheService.update(study);
            update((studies: StudyI[]) =>
                studies.map((s: StudyI) => (s.id === study.id ? study : s)),
            );

            await new Promise((r) => setTimeout(r, 500));

            const data: IdentifyParticipantResponse =
                await apiService.identifyParticipant(transcriptFile.id!);

            if (data.validation) {
                if (data.validation.status !== ValidationStatus.Ok) {
                    transcriptFile.status =
                        TranscriptStatus.ParticipantNeedsReview;
                } else if (data.validation.status === ValidationStatus.Ok) {
                    transcriptFile.status =
                        TranscriptStatus.ReadyForAnonymization;
                }
            } else {
                transcriptFile.status = TranscriptStatus.ParticipantNeedsReview;
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

            study.transcriptFiles[transcriptFileIndex] = updatedTranscriptFile;
            study.status = computeStudyStatus(study);

            await studiesCacheService.update(study);
            update((studies: StudyI[]) =>
                studies.map((s: StudyI) => (s.id === study.id ? study : s)),
            );

            await new Promise((r) => setTimeout(r, 500));
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
        runSuggestTopics: async (
            studyId: string,
            transcript: TranscriptFileI,
        ) => {
            if (!transcript.id) {
                return;
            }

            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map(
                            (transcriptFile: TranscriptFileI) => {
                                if (transcriptFile.id !== transcript.id)
                                    return transcriptFile;

                                return {
                                    ...transcriptFile,
                                    status: TranscriptStatus.RunningTopicSuggestion,
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

            const transcriptTopicsData: TranscriptTopicsResponse =
                await apiService.getTranscriptTopics(transcript);

            if (!transcriptTopicsData.interview_topics_result) {
                update((studies: StudyI[]) => {
                    return studies.map((study: StudyI) => {
                        if (study.id !== studyId) return study;

                        const updatedFiles: TranscriptFileI[] =
                            study.transcriptFiles.map(
                                (transcriptFile: TranscriptFileI) => {
                                    if (transcriptFile.id !== transcript.id)
                                        return transcriptFile;

                                    return {
                                        ...transcriptFile,
                                        status: TranscriptStatus.ReadyForAnalysis,
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
                return;
            }

            const topics: IdentifiedTopicI[] =
                transcriptTopicsData.interview_topics_result.result.map(
                    (topic: IdentifiedTopicI, index: number) => ({
                        ...topic,
                        validation: {
                            ...transcriptTopicsData.interview_topics_result!
                                .item_validations[index],
                            isApprovedByUser: false,
                        },
                    }),
                );

            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcript.id) return t;

                            return {
                                ...t,
                                status: topics.every(
                                    (topic: IdentifiedTopicI) =>
                                        topic.validation?.status ===
                                        ValidationStatus.Ok,
                                )
                                    ? TranscriptStatus.Ready
                                    : TranscriptStatus.TopicsNeedReview,
                                topics,
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
        approveTopic: (
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
                                status: updatedTopics.every(
                                    (topic: IdentifiedTopicI) =>
                                        topic.validation?.status ===
                                            ValidationStatus.Ok ||
                                        topic.validation?.isApprovedByUser,
                                )
                                    ? TranscriptStatus.Ready
                                    : TranscriptStatus.TopicsNeedReview,
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
        addTopic: (
            studyId: string,
            transcriptFileId: number,
            newTopic: IdentifiedTopicI,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcriptFileId) return t;

                            return {
                                ...t,
                                topics: [...t.topics, newTopic],
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
        updateTopic: (
            studyId: string,
            transcriptFileId: number,
            originalTopicName: string,
            topicName: string,
            topicDescription: string,
            quotes: QuoteI[],
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedFiles: TranscriptFileI[] =
                        study.transcriptFiles.map((t: TranscriptFileI) => {
                            if (t.id !== transcriptFileId) return t;

                            const updatedTopics: IdentifiedTopicI[] =
                                t.topics.map((tc: IdentifiedTopicI) => {
                                    if (tc.topic !== originalTopicName)
                                        return tc;
                                    if (!tc.validation) return tc;

                                    return {
                                        ...tc,
                                        topic: topicName,
                                        explanation: topicDescription,
                                        quotes: quotes,
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
                                status: updatedTopics.every(
                                    (topic: IdentifiedTopicI) =>
                                        topic.validation?.status ===
                                            ValidationStatus.Ok ||
                                        topic.validation?.isApprovedByUser,
                                )
                                    ? TranscriptStatus.Ready
                                    : TranscriptStatus.TopicsNeedReview,
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
        runSuggestStudyThemes: async (studyId: string) => {
            update((studies: StudyI[]) =>
                studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedStudy: StudyI = {
                        ...study,
                        status: StudyStatus.Running,
                    };

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                }),
            );

            let currentStudy: StudyI | undefined;
            update((studies: StudyI[]) => {
                currentStudy = studies.find((s) => s.id === studyId);
                return studies;
            });

            if (!currentStudy) return;

            const studyThemesResponse: StudyThemesResponse =
                await apiService.getStudyThemes(currentStudy);

            if (!studyThemesResponse.study_topics_result) {
                update((studies: StudyI[]) =>
                    studies.map((study: StudyI) => {
                        if (study.id !== studyId) return study;

                        const updatedStudy: StudyI = {
                            ...study,
                            status: StudyStatus.Ready,
                        };

                        studiesCacheService.update(updatedStudy);
                        return updatedStudy;
                    }),
                );
                return;
            }

            const resultMap: StudyTopicsResultMap =
                studyThemesResponse.study_topics_result;

            const themes: IdentifiedThemeMapI = {};

            Object.entries(resultMap).forEach(
                ([interviewId, themeResult]: [string, StudyThemeResult]) => {
                    themes[interviewId] = themeResult.result.map(
                        (theme: IdentifiedThemeI, index: number) => ({
                            ...theme,
                            validation: {
                                ...themeResult.item_validations[index],
                                isApprovedByUser: false,
                            },
                        }),
                    );
                },
            );

            update((studies: StudyI[]) =>
                studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedStudy: StudyI = {
                        ...study,
                        themes,
                        status: StudyStatus.Ready,
                    };

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                }),
            );
        },
        approveTheme: (
            studyId: string,
            interviewId: string,
            identifiedTheme: IdentifiedThemeI,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedThemes: IdentifiedThemeMapI = {
                        ...study.themes,
                        [interviewId]: study.themes[interviewId].map(
                            (theme) => {
                                if (theme.topic !== identifiedTheme.topic)
                                    return theme;
                                if (!theme.validation) return theme;

                                return {
                                    ...theme,
                                    validation: {
                                        ...theme.validation,
                                        isApprovedByUser: true,
                                    },
                                };
                            },
                        ),
                    };

                    const updatedStudy: StudyI = {
                        ...study,
                        themes: updatedThemes,
                    };

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
        updateTheme: (
            studyId: string,
            interviewId: string,
            originalTopic: string,
            updatedThemeData: Partial<Omit<IdentifiedThemeI, "validation">>,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedThemes: IdentifiedThemeMapI = {
                        ...study.themes,
                        [interviewId]: study.themes[interviewId].map(
                            (theme) => {
                                if (theme.topic !== originalTopic) return theme;
                                return { ...theme, ...updatedThemeData };
                            },
                        ),
                    };

                    const updatedStudy: StudyI = {
                        ...study,
                        themes: updatedThemes,
                    };

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
        removeTheme: (
            studyId: string,
            interviewId: string,
            themeTopicToRemove: string,
        ) => {
            update((studies: StudyI[]) => {
                return studies.map((study: StudyI) => {
                    if (study.id !== studyId) return study;

                    const updatedThemes: IdentifiedThemeMapI = {
                        ...study.themes,
                        [interviewId]: study.themes[interviewId].filter(
                            (theme) => theme.topic !== themeTopicToRemove,
                        ),
                    };

                    const updatedStudy: StudyI = {
                        ...study,
                        themes: updatedThemes,
                    };

                    studiesCacheService.update(updatedStudy);
                    return updatedStudy;
                });
            });
        },
    };
};

export const studiesStore = createStudiesStore();
