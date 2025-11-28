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
}

export default new StudiesCacheService();
