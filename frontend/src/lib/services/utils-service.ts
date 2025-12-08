import {
    READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS,
    SERIALIZABLE_STUDY_STATUS_TO_ICON_MAP,
    SERIALIZABLE_TRANSCRIPT_STATUS_TO_ICON_MAP,
} from "$lib/common";
import type {
    SerializableStudyI,
    SerializableStudyStatusI,
    SerializableStudyStatusIcon,
    SerializableTranscriptFileI,
    SerializableTranscriptStatusI,
    SerializableTranscriptStatusIcon,
    StudyI,
    StudyStatusI,
    TranscriptFileI,
    TranscriptStatusI,
} from "$lib/models";
import type { CarbonIconProps } from "carbon-icons-svelte";
import type { Component } from "svelte";
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

    private getSerializableTranscriptIcon(
        icon: Component<CarbonIconProps>,
    ): SerializableTranscriptStatusIcon | undefined {
        return Object.entries(SERIALIZABLE_TRANSCRIPT_STATUS_TO_ICON_MAP).find(
            ([, value]) => value === icon,
        )?.[0] as SerializableTranscriptStatusIcon;
    }

    private getSerializableTranscriptStatus(
        status: TranscriptStatusI,
    ): SerializableTranscriptStatusI {
        const serializableIcon: SerializableTranscriptStatusIcon | undefined =
            this.getSerializableTranscriptIcon(status.icon);

        if (!serializableIcon) {
            throw new Error("Icon not found");
        }

        return {
            icon: serializableIcon,
            iconColor: status.iconColor,
            state: status.state,
            status: status.status,
            description: status.description,
        };
    }

    public async convertToSerializableTranscriptFile(
        transcriptFile: TranscriptFileI,
    ): Promise<SerializableTranscriptFileI> {
        const base64: string = await this.fileToBase64(transcriptFile.file);

        return {
            id: transcriptFile.id,
            name: transcriptFile.name,
            file: base64,
            size: transcriptFile.size,
            type: transcriptFile.type,
            status: this.getSerializableTranscriptStatus(transcriptFile.status),
            speakers: transcriptFile.speakers,
            participant: transcriptFile.participant,
            validation: transcriptFile.validation,
            speaker_anonymization_map: transcriptFile.speaker_anonymization_map,
        };
    }

    public getTranscriptFile(file: File): TranscriptFileI {
        return {
            name: file.name,
            file: file,
            size: file.size,
            type: file.type,
            status: READY_TO_IDENTIFY_PARTICIPANTS_TRANSCRIPT_STATUS,
            speakers: [],
            participant: "",
            validation: null,
            speaker_anonymization_map: null,
        };
    }

    private getSerializableStudyIcon(
        icon: Component<CarbonIconProps>,
    ): SerializableStudyStatusIcon | undefined {
        return Object.entries(SERIALIZABLE_STUDY_STATUS_TO_ICON_MAP).find(
            ([, value]) => value === icon,
        )?.[0] as SerializableStudyStatusIcon;
    }

    private getSerializableStudyStatus(
        status: StudyStatusI,
    ): SerializableStudyStatusI {
        const serializableIcon: SerializableStudyStatusIcon | undefined =
            this.getSerializableStudyIcon(status.icon);

        if (!serializableIcon) {
            throw new Error("Icon not found");
        }

        return {
            icon: serializableIcon,
            iconColor: status.iconColor,
            state: status.state,
            status: status.status,
            description: status.description,
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
            id: study.id,
            name: study.name,
            description: study.description,
            transcriptFiles: serializedTranscriptFiles,
            status: this.getSerializableStudyStatus(study.status),
        };
    }

    private getTranscriptStatus(
        serializableStatus: SerializableTranscriptStatusI,
    ): TranscriptStatusI {
        return {
            icon: SERIALIZABLE_TRANSCRIPT_STATUS_TO_ICON_MAP[
                serializableStatus.icon
            ],
            iconColor: serializableStatus.iconColor,
            state: serializableStatus.state,
            status: serializableStatus.status,
            description: serializableStatus.description,
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
            id: serializableTranscriptFile.id,
            name: serializableTranscriptFile.name,
            file: file,
            size: serializableTranscriptFile.size,
            type: serializableTranscriptFile.type,
            status: this.getTranscriptStatus(serializableTranscriptFile.status),
            speakers: serializableTranscriptFile.speakers,
            participant: serializableTranscriptFile.participant,
            validation: serializableTranscriptFile.validation,
            speaker_anonymization_map:
                serializableTranscriptFile.speaker_anonymization_map,
        };
    }

    private getStudyStatus(
        serializableStatus: SerializableStudyStatusI,
    ): StudyStatusI {
        return {
            icon: SERIALIZABLE_STUDY_STATUS_TO_ICON_MAP[
                serializableStatus.icon
            ],
            iconColor: serializableStatus.iconColor,
            state: serializableStatus.state,
            status: serializableStatus.status,
            description: serializableStatus.description,
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
            id: serializableStudy.id,
            name: serializableStudy.name,
            description: serializableStudy.description,
            transcriptFiles: transcriptFiles,
            status: this.getStudyStatus(serializableStudy.status),
        };
    }
}

export default new UtilsService();
