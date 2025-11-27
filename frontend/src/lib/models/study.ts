export enum StudyFileStatus {
    Success = "success",
    Error = "error",
}

export interface StudyFileI {
    id: string;
    file: File;
    status: StudyFileStatus;
    message?: string;
}
