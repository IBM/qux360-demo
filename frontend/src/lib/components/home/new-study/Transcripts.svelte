<script lang="ts">
    import { READY_STUDY_STATUS } from "$lib/common";
    import {
        UploadedTranscriptFileStatus,
        type ProgressStepI,
        type StudyI,
        type TranscriptFileI,
        type UploadedTranscriptFileI,
    } from "$lib/models";
    import { utilsService } from "$lib/services";
    import { loadingRequestStore, studiesStore } from "$lib/stores";
    import { Button, FileUploaderItem, Link } from "carbon-components-svelte";
    import { Upload } from "carbon-icons-svelte";

    export let isCreatingStudy: boolean;
    export let currentStepIndex: number;
    export let steps: ProgressStepI[];
    export let studyName: string;
    export let studyDescription: string;

    interface ValidationI {
        valid: boolean;
        message?: string;
    }

    const MAX_FILE_SIZE_KB: number = 500;
    const MAX_FILE_SIZE: number = MAX_FILE_SIZE_KB * 1024; // 500KB en bytes
    const FILE_SUPPORTED_TYPES: string[] = [".docx", ".xlsx", ".csv"];

    let uploadedTranscriptFiles: UploadedTranscriptFileI[] = [];
    let isDragging: boolean = false;
    let inputRef: HTMLInputElement;

    let hasValidFiles: boolean = false;

    $: hasValidFiles = uploadedTranscriptFiles.some(
        (uploadedTranscriptFile) =>
            uploadedTranscriptFile.status ===
            UploadedTranscriptFileStatus.Success,
    );

    const validateFile = (
        file: File,
        existingFiles: UploadedTranscriptFileI[] = [],
    ): ValidationI => {
        const fileName: string = file.name;
        const fileExtension: string =
            "." + fileName.split(".").pop()?.toLowerCase();

        const fileAlreadyUploaded: boolean = existingFiles.some(
            (uploadedTranscriptFile) =>
                uploadedTranscriptFile.file.name === fileName &&
                uploadedTranscriptFile.file.size === file.size,
        );

        if (fileAlreadyUploaded) {
            return {
                valid: false,
                message: `The file "${file.name}" has already been uploaded.`,
            };
        }

        if (!FILE_SUPPORTED_TYPES.includes(fileExtension)) {
            return {
                valid: false,
                message: `Unsupported file type. Only the following types are allowed: ${FILE_SUPPORTED_TYPES.join(", ")}`,
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                message: `The file exceeds the maximum size of ${MAX_FILE_SIZE_KB}KB. Current size: ${(file.size / 1024).toFixed(2)}KB`,
            };
        }

        return { valid: true };
    };

    const revalidateFiles = (): void => {
        uploadedTranscriptFiles = uploadedTranscriptFiles.map(
            (uploadedTranscriptFile) => {
                const validation: ValidationI = validateFile(
                    uploadedTranscriptFile.file,
                    uploadedTranscriptFiles.filter(
                        (f) => f.id !== uploadedTranscriptFile.id,
                    ),
                );

                const newStatus: UploadedTranscriptFileStatus = validation.valid
                    ? UploadedTranscriptFileStatus.Success
                    : UploadedTranscriptFileStatus.Error;

                if (
                    uploadedTranscriptFile.status !== newStatus ||
                    uploadedTranscriptFile.message !== validation.message
                ) {
                    return {
                        ...uploadedTranscriptFile,
                        status: newStatus,
                        message: validation.message,
                    };
                }

                return uploadedTranscriptFile;
            },
        );
    };

    const handleFiles = (fileList: FileList | null | undefined): void => {
        if (!fileList) return;

        const newFiles: UploadedTranscriptFileI[] = [];

        Array.from(fileList).forEach((file: File) => {
            const validation: ValidationI = validateFile(
                file,
                uploadedTranscriptFiles,
            );

            newFiles.push({
                id: utilsService.getUniqueId(),
                file,
                status: validation.valid
                    ? UploadedTranscriptFileStatus.Success
                    : UploadedTranscriptFileStatus.Error,
                message: validation.message,
            });
        });

        uploadedTranscriptFiles = [...uploadedTranscriptFiles, ...newFiles];

        revalidateFiles();

        if (inputRef) {
            inputRef.value = "";
        }
    };

    const handleDragOver = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
    };

    const handleDragLeave = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
    };

    const handleDrop = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        handleFiles(e.dataTransfer?.files);
    };

    const handleInputChange = (e: Event) => {
        const input: HTMLInputElement = e.target as HTMLInputElement;
        handleFiles(input.files);
    };

    const handleSelectFilesClick = (event: MouseEvent) => {
        event.preventDefault();
        inputRef?.click();
    };

    const removeFile = (index: number): void => {
        uploadedTranscriptFiles = uploadedTranscriptFiles.filter(
            (_, i) => i !== index,
        );

        revalidateFiles();
    };

    const cancelButtonClick = (): void => {
        currentStepIndex--;
        steps[currentStepIndex].isComplete = false;
    };

    const createButtonClick = async (): Promise<void> => {
        const successfulFiles: File[] = uploadedTranscriptFiles
            .filter(
                (uploadedTranscriptFile) =>
                    uploadedTranscriptFile.status ===
                    UploadedTranscriptFileStatus.Success,
            )
            .map((uploadedTranscriptFile) => uploadedTranscriptFile.file);

        const transcriptFiles: TranscriptFileI[] = successfulFiles.map(
            (file: File) => {
                return utilsService.getTranscriptFile(file);
            },
        );

        const newStudy: StudyI = {
            id: utilsService.getUniqueId(),
            name: studyName,
            description: studyDescription,
            transcriptFiles: transcriptFiles,
            status: READY_STUDY_STATUS,
        };
        loadingRequestStore.startLoadingRequest();
        await studiesStore.add(newStudy);
        loadingRequestStore.stopLoadingRequest();

        steps[currentStepIndex].isComplete = true;
        isCreatingStudy = false;
    };
</script>

<div class="drop-files-external-container">
    <p class="bx--file--label">Upload study transcripts</p>
    <p class="bx--label-description">
        Max file size is 500kb. Supported file types are .docx, .xlsx, and .csv.
    </p>

    <input
        bind:this={inputRef}
        class="hidden"
        aria-label="Select files"
        type="file"
        multiple
        accept={FILE_SUPPORTED_TYPES.join(",")}
        on:change={handleInputChange}
    />

    <div
        role="button"
        tabindex="0"
        aria-label="Drop files here"
        class="drop-files-container"
        class:drop-files-container-dragging={isDragging}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
    >
        <div class="drop-files-internal-container">
            <Upload />
            <span class="drop-files-message">
                Drop files here or
                <Link
                    class="select-files-link"
                    on:click={handleSelectFilesClick}
                >
                    select files
                </Link>
            </span>
        </div>
    </div>
</div>

{#if uploadedTranscriptFiles.length > 0}
    <div class="file-uploader-items-container">
        {#each uploadedTranscriptFiles as item, index (item.id)}
            <FileUploaderItem
                class="file-uploader-item"
                id={item.id}
                name={item.file.name}
                invalid={item.status === UploadedTranscriptFileStatus.Error}
                errorSubject={item.message}
                status="edit"
                on:delete={() => removeFile(index)}
            />
        {/each}
    </div>
{/if}

<div class="buttons-container">
    <Button kind="secondary" on:click={cancelButtonClick}>Cancel</Button>
    <Button
        kind="primary"
        disabled={!hasValidFiles}
        on:click={async () => {
            await createButtonClick();
        }}
    >
        Create
    </Button>
</div>

<style lang="scss">
    @use "@carbon/type";

    .hidden {
        display: none;
    }

    .drop-files-external-container {
        display: flex;
        flex-direction: column;
    }

    .drop-files-container {
        border-width: 1px;
        border-color: var(--cds-border-strong);
        border-style: dashed;
        border-radius: 4px;
    }

    .drop-files-container-dragging {
        outline: 2px solid var(--cds-border-interactive);
        outline-offset: -2px;
    }

    .drop-files-internal-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 2.25rem 0;
    }

    .drop-files-message {
        @include type.type-style("body-01");
        line-height: 1.125rem;
    }

    .file-uploader-items-container {
        display: flex;
        flex-direction: column;
        max-height: 272px;
        overflow-y: scroll;
    }

    :global(.select-files-link) {
        cursor: pointer;
        font-weight: 700;
        line-height: 1.125rem;
    }

    :global(.file-uploader-item) {
        max-width: 100%;
    }
</style>
