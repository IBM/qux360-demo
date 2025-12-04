import type {
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
}

export default new ApiService();
