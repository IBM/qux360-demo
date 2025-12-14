import {
    TranscriptStatus,
    type SerializableStudyI,
    type SerializableTranscriptFileI,
    type StudyI,
    type TranscriptFileI,
} from "$lib/models";
import { v7 as uuidv7 } from "uuid";

class UtilsService {
    constructor() {}

    public getUniqueId(): string {
        return uuidv7().toString();
    }

    private async fileToBase64(file: File): Promise<string> {
        const base64: string = await file
            .arrayBuffer()
            .then((buffer: ArrayBuffer) =>
                btoa(String.fromCharCode(...new Uint8Array(buffer))),
            );
        return base64;
    }

    public getTranscriptFile(file: File): TranscriptFileI {
        return {
            name: file.name,
            file: file,
            size: file.size,
            type: file.type,
            status: TranscriptStatus.ReadyToIdentifyParticipants,
            speakers: [],
            participant: {
                name: "",
                explanation: "",
                showExplanation: false,
                validation: null,
            },
            speaker_anonymization_map: null,
            entity_anonymization_map: {},
            topics: [],
        };
    }

    private convertToTranscriptFile(
        serializableTranscriptFile: SerializableTranscriptFileI,
    ): TranscriptFileI {
        const bytes: Uint8Array<ArrayBuffer> = Uint8Array.from(
            atob(serializableTranscriptFile.file),
            (c) => c.charCodeAt(0),
        );
        const file: File = new File([bytes], serializableTranscriptFile.name, {
            type: serializableTranscriptFile.type,
        });

        return {
            ...serializableTranscriptFile,
            file: file,
        };
    }

    private async convertToSerializableTranscriptFile(
        transcriptFile: TranscriptFileI,
    ): Promise<SerializableTranscriptFileI> {
        const base64: string = await this.fileToBase64(transcriptFile.file);

        return {
            ...transcriptFile,
            file: base64,
        };
    }

    public convertToStudy(serializableStudy: SerializableStudyI): StudyI {
        const transcriptFiles: TranscriptFileI[] =
            serializableStudy.transcriptFiles.map(
                (serializableTranscriptFileI: SerializableTranscriptFileI) => {
                    return this.convertToTranscriptFile(
                        serializableTranscriptFileI,
                    );
                },
            );

        return {
            ...serializableStudy,
            transcriptFiles: transcriptFiles,
        };
    }

    public async convertToSerializableStudy(
        study: StudyI,
    ): Promise<SerializableStudyI> {
        const serializedTranscriptFiles: SerializableTranscriptFileI[] =
            await Promise.all(
                study.transcriptFiles.map((transcriptFile: TranscriptFileI) => {
                    return this.convertToSerializableTranscriptFile(
                        transcriptFile,
                    );
                }),
            );

        return {
            ...study,
            transcriptFiles: serializedTranscriptFiles,
        };
    }
}

export default new UtilsService();
