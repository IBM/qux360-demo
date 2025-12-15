import type {
    EntityAnonymizationResponse,
    IdentifyParticipantResponse,
    SpeakerAnonymizationResponse,
    TranscriptFileI,
    TranscriptLineI,
    TranscriptTopicsResponse,
    UploadTranscriptFileErrorI,
    UploadTranscriptFileResultI,
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

    public async uploadFiles(
        transcriptFiles: TranscriptFileI[],
    ): Promise<UploadTranscriptFileResultI> {
        const successes: UploadTranscriptFileSuccessI[] = [];
        const errors: UploadTranscriptFileErrorI[] = [];

        for (const transcriptFile of transcriptFiles) {
            const file: File = transcriptFile.file;
            try {
                const formData: FormData = new FormData();
                formData.append("file", file);

                const response: Response = await fetch(
                    `${this.BACKEND_API_URL}/upload`,
                    {
                        method: APIMethodsType.POST,
                        body: formData,
                    },
                );

                const data = await response.json();

                if (response.ok && data.file_id) {
                    successes.push({
                        fileId: data.file_id,
                        filename: file.name,
                    });
                } else {
                    const errorMsg = data.error ?? "Unknown error";

                    errors.push({
                        error: errorMsg,
                        filename: file.name,
                    });

                    notificationsStore.addNotification({
                        kind: "error",
                        title: "File upload failed",
                        subtitle: `${file.name}: ${errorMsg}`,
                    });
                }
            } catch (e: unknown) {
                const message =
                    e instanceof Error ? e.message : "Unknown error";

                errors.push({
                    error: message,
                    filename: file.name,
                });

                notificationsStore.addNotification({
                    kind: "error",
                    title: "Network error",
                    subtitle: `Could not upload ${file.name}: ${message}`,
                });
            }
        }

        if (successes.length > 0 && errors.length === 0) {
            notificationsStore.addNotification({
                kind: "success",
                title: "Files uploaded",
                subtitle: `${successes.length} file(s) uploaded successfully`,
            });
        }

        return { successes, errors };
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

    public async getTranscriptTopics(
        fileId: number,
    ): Promise<TranscriptTopicsResponse> {
        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/interview_topics/${fileId}`,
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
