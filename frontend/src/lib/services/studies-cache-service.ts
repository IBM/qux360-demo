import type { StudyI } from "$lib/models";

const CACHE_KEY: string = "studies-cache";

class StudiesCacheService {
    constructor() {}

    public getAll(): StudyI[] {
        const raw: string | null = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    public save(study: StudyI): void {
        const studies: StudyI[] = this.getAll();
        studies.push(study);
        localStorage.setItem(CACHE_KEY, JSON.stringify(studies));
    }

    public update(updatedStudy: StudyI): void {
        const studies: StudyI[] = this.getAll();
        const updated: StudyI[] = studies.map((s: StudyI) =>
            s.id === updatedStudy.id ? updatedStudy : s,
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }

    public delete(id: string): void {
        const studies: StudyI[] = this.getAll();
        const updated: StudyI[] = studies.filter(
            (study: StudyI) => study.id !== id,
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }
}

export default new StudiesCacheService();
