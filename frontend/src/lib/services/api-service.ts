import type {
    IdentifyParticipantResponse,
    TranscriptFileI,
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
        const body: string = JSON.stringify({ id: fileId });

        try {
            const response: Response = await fetch(
                `${this.BACKEND_API_URL}/identify_participant`,
                {
                    method: APIMethodsType.POST,
                    headers: this.getHeaders(),
                    body: body,
                },
            );

            if (!response.ok) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Participant identification failed",
                    subtitle: `HTTP error! Status: ${response.status}`,
                });
            }

            const data: IdentifyParticipantResponse = await response.json();

            if (data.error) {
                notificationsStore.addNotification({
                    kind: "error",
                    title: "Participant identification failed",
                    subtitle: data.error,
                });
            }

            return data;
        } catch (error) {
            return {
                error: "An error occurred while identifying the participant",
                speakers: [],
                participant: "",
                validation: null,
            };
        }
    }
}

export default new ApiService();
