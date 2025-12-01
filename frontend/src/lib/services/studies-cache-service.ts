import type { SerializableStudyI, StudyI } from "$lib/models";
import utilsService from "./utils-service";

const CACHE_KEY: string = "studies-cache";

class StudiesCacheService {
    constructor() {}

    private getAllSerializableStudies(): SerializableStudyI[] {
        try {
            const raw: string | null = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Cache corrupted", e);
            return [];
        }
    }

    public getAllStudies(): StudyI[] {
        const serializableStudies: SerializableStudyI[] =
            this.getAllSerializableStudies();
        return serializableStudies.map(
            (serializableStudy: SerializableStudyI) => {
                return utilsService.convertToStudy(serializableStudy);
            },
        );
    }

    public async add(study: StudyI): Promise<void> {
        const serializableStudy: SerializableStudyI =
            await utilsService.convertToSerializableStudy(study);
        const studies: SerializableStudyI[] = this.getAllSerializableStudies();
        studies.push(serializableStudy);
        localStorage.setItem(CACHE_KEY, JSON.stringify(studies));
    }

    public async update(updatedStudy: StudyI): Promise<void> {
        const updatedSerializableStudy: SerializableStudyI =
            await utilsService.convertToSerializableStudy(updatedStudy);
        const studies: SerializableStudyI[] = this.getAllSerializableStudies();
        const updated: SerializableStudyI[] = studies.map(
            (s: SerializableStudyI) =>
                s.id === updatedSerializableStudy.id
                    ? updatedSerializableStudy
                    : s,
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }

    public delete(id: string): void {
        const studies: SerializableStudyI[] = this.getAllSerializableStudies();
        const updated: SerializableStudyI[] = studies.filter(
            (study: SerializableStudyI) => study.id !== id,
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }
}

export default new StudiesCacheService();
