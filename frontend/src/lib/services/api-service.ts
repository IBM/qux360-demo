import type {
    EntityAnonymizationMap,
    EntityAnonymizationResponse,
    IdentifyParticipantResponse,
    SpeakerAnonymizationMap,
    SpeakerAnonymizationResponse,
    TranscriptFileI,
    TranscriptLineI,
    TranscriptTopicsResponse,
    UploadTranscriptFileErrorI,
    UploadTranscriptFilesResultI,
    UploadTranscriptFileSuccessI,
} from "$lib/models";
import { notificationsStore } from "$lib/stores";

enum APIMethodsType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

class ApiService {
    private BACKEND_API_URL: string = "";
    private transcriptLinesCache: Map<number, TranscriptLineI[]> = new Map();

    constructor() {
        if (typeof window !== "undefined") {
            this.BACKEND_API_URL = `${import.meta.env.VITE_BACKEND_URL}`;
        }
    }

    private getHeaders(): HeadersInit {
        return {
            "Content-Type": "application/json",
        };
    }

    public async uploadStudyFiles(
        studyName: string,
        transcriptFiles: TranscriptFileI[],
    ): Promise<UploadTranscriptFilesResultI> {
        let study_id: string = "";
        const successes: UploadTranscriptFileSuccessI[] = [];
        const errors: UploadTranscriptFileErrorI[] = [];

        try {
            const formData: FormData = new FormData();
            formData.append("study_name", studyName);
            transcriptFiles.forEach((t: TranscriptFileI) =>
                formData.append("files", t.file),
            );

            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/upload_study_interviews`,
                {
                    method: APIMethodsType.POST,
                    body: formData,
                },
            );

            const data = await response.json();

            if (response.ok && data.uploaded_files) {
                study_id = data.study_id;
                data.uploaded_files.forEach((f: any) => {
                    successes.push({ fileId: f.file_id, filename: f.filename });
                });
            } else {
                const errorMsg = data.error ?? "Unknown error";

                errors.push({
                    error: errorMsg,
                    filename: "Multiple files",
                });

                notificationsStore.addNotification({
                    kind: "error",
                    title: "Files upload failed",
                    subtitle: errorMsg,
                });
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";

            errors.push({ error: message, filename: "Multiple files" });

            notificationsStore.addNotification({
                kind: "error",
                title: "Network error",
                subtitle: `Could not upload files: ${message}`,
            });
        }

        if (successes.length > 0 && errors.length === 0) {
            notificationsStore.addNotification({
                kind: "success",
                title: "Files uploaded",
                subtitle: `${successes.length} file(s) uploaded successfully`,
            });
        }

        return { study_id, successes, errors };
    }

    public async identifyParticipant(
        fileId: number,
    ): Promise<IdentifyParticipantResponse> {
        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/identify_participant/${fileId}`,
                {
                    method: APIMethodsType.GET,
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Participant identification failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });
            }

            const data = await response.json();

            if (data.error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Participant identification failed",
                    subtitle: data.error,
                });
            }

            return {
                ...data,
                validation: {
                    ...data.validation,
                    isApprovedByUser: false,
                },
            };
        } catch (error) {
            return {
                error: "An error occurred while identifying the participant",
                speakers: [],
                participant: "",
                validation: null,
            };
        }
    }

    public async getSpeakerAnonymizationMap(
        fileId: number,
    ): Promise<SpeakerAnonymizationResponse> {
        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/speakers_anonymization_map/${fileId}`,
                {
                    method: APIMethodsType.GET,
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Speaker anonymization failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });
            }

            const data: SpeakerAnonymizationResponse = await response.json();

            if (data.error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Speaker anonymization failed",
                    subtitle: data.error,
                });
            }

            return data;
        } catch (error) {
            return {
                error: "An error occurred while anonymizing the speakers",
                speakers_anonymization_map: null,
            };
        }
    }

    public async getEntityAnonymizationMap(
        fileId: number,
    ): Promise<EntityAnonymizationResponse> {
        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/entities_anonymization_map/${fileId}`,
                {
                    method: APIMethodsType.GET,
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Entity anonymization failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });
            }

            const data: EntityAnonymizationResponse = await response.json();

            if (data.error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Entity anonymization failed",
                    subtitle: data.error,
                });
            }

            return data;
        } catch (error) {
            return {
                error: "An error occurred while anonymizing the entities",
                entities_anonymization_map: null,
            };
        }
    }

    public async getTranscriptLines(
        fileId: number,
    ): Promise<TranscriptLineI[]> {
        if (this.transcriptLinesCache.has(fileId)) {
            return this.transcriptLinesCache.get(fileId)!;
        }

        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/transcript/${fileId}`,
                {
                    method: APIMethodsType.GET,
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Transcript fetch failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });

                return [];
            }

            const data = await response.json();

            if ((data as any).error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Transcript fetch failed",
                    subtitle: (data as any).error,
                });

                return [];
            }

            const transcriptLines: TranscriptLineI[] =
                data as TranscriptLineI[];
            this.transcriptLinesCache.set(fileId, transcriptLines);

            return transcriptLines;
        } catch (error) {
            notificationsStore.addNotification({
                kind: "error",
                title: "Transcript fetch failed",
                subtitle: "Unexpected network or server error",
            });

            return [];
        }
    }

    private applySpeakerAnonymization(
        lines: TranscriptLineI[],
        map: SpeakerAnonymizationMap | null,
    ): TranscriptLineI[] {
        if (!map) return lines;

        return lines.map((line: TranscriptLineI) => ({
            ...line,
            speaker: map[line.speaker] || line.speaker,
        }));
    }

    private applyEntityAnonymization(
        lines: TranscriptLineI[],
        map: EntityAnonymizationMap,
    ): TranscriptLineI[] {
        const entityNames = Object.keys(map);
        if (entityNames.length === 0) return lines;

        const escapedNames: string[] = entityNames.map((name: string) =>
            name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        );

        const regex: RegExp = new RegExp(
            `\\b(${escapedNames.join("|")})\\b`,
            "g",
        );

        return lines.map((line: TranscriptLineI) => ({
            ...line,
            statement: line.statement.replace(
                regex,
                (matched) => map[matched] || matched,
            ),
        }));
    }

    private async updateTranscript(transcript: TranscriptFileI): Promise<void> {
        if (!transcript.id) {
            return;
        }

        try {
            let transcriptLines: TranscriptLineI[] =
                await this.getTranscriptLines(transcript.id);
            transcriptLines = this.applySpeakerAnonymization(
                transcriptLines,
                transcript.speaker_anonymization_map,
            );
            transcriptLines = this.applyEntityAnonymization(
                transcriptLines,
                transcript.entity_anonymization_map,
            );
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/update_transcript`,
                {
                    method: APIMethodsType.POST,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file_id: transcript.id,
                        content: transcriptLines,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.detail ?? data?.error ?? "Unknown error";

                notificationsStore.addNotification({
                    kind: "error",
                    title: "Transcript update failed",
                    subtitle: errorMsg,
                });
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";

            notificationsStore.addNotification({
                kind: "error",
                title: "Network error",
                subtitle: `Could not update transcript: ${message}`,
            });
        }
    }

    public async getTranscriptTopics(
        transcript: TranscriptFileI,
    ): Promise<TranscriptTopicsResponse> {
        try {
            await this.updateTranscript(transcript);
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/interview_topics/${transcript.id}`,
                {
                    method: APIMethodsType.GET,
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Get transcript topics failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });
            }

            const data: TranscriptTopicsResponse = await response.json();

            if (data.error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Get transcript topics failed",
                    subtitle: data.error,
                });
            }

            return data;
        } catch (error) {
            return {
                error: "An error occurred while getting transcript topics",
                interview_topics_result: null,
            };
        }
    }
}

export default new ApiService();
