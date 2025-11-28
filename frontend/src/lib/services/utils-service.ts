import type { SerializableTranscriptFileI } from "$lib/models";
import { v7 as uuidv7 } from "uuid";

class UtilsService {
    constructor() {}

    public getUniqueId(): string {
        return uuidv7().toString();
    }

    public async fileToSerializable(
        file: File,
    ): Promise<SerializableTranscriptFileI> {
        const base64: string = await file
            .arrayBuffer()
            .then((buffer) =>
                btoa(String.fromCharCode(...new Uint8Array(buffer))),
            );

        return {
            name: file.name,
            content: base64,
            size: file.size,
            type: file.type,
        };
    }
}

export default new UtilsService();
