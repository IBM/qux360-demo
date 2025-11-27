<script lang="ts">
    import {
        StudyFileStatus,
        type ProgressStepI,
        type StudyFileI,
    } from "$lib/models";
    import { utilsService } from "$lib/services";
    import { Button, FileUploaderItem, Link } from "carbon-components-svelte";
    import { Upload } from "carbon-icons-svelte";

    export let currentStepIndex: number;
    export let steps: ProgressStepI[];
    export let studyName: string;
    export let studyDescription: string;

    const MAX_FILE_SIZE: number = 500 * 1024; // 500KB en bytes
    const FILE_SUPPORTED_TYPES: string[] = [".docx", ".xlsx", ".csv"];

    let studyFiles: StudyFileI[] = [];
    let isDragging: boolean = false;
    let inputRef: HTMLInputElement;

    const validateFile = (file: File): { valid: boolean; message?: string } => {
        const fileName: string = file.name;
        const fileExtension: string =
            "." + fileName.split(".").pop()?.toLowerCase();

        if (!FILE_SUPPORTED_TYPES.includes(fileExtension)) {
            return {
                valid: false,
                message: `Unsupported file type. Only the following types are allowed: ${FILE_SUPPORTED_TYPES.join(", ")}`,
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                message: `The file exceeds the maximum size of ${MAX_FILE_SIZE}KB. Current size: ${(file.size / 1024).toFixed(2)}KB`,
            };
        }

        return { valid: true };
    };

    const handleFiles = (fileList: FileList | null | undefined): void => {
        if (!fileList) return;

        const newFiles: StudyFileI[] = [];

        Array.from(fileList).forEach((file: File) => {
            const validation: {
                valid: boolean;
                message?: string;
            } = validateFile(file);

            if (validation.valid) {
                newFiles.push({
                    id: utilsService.getUniqueId(),
                    file,
                    status: StudyFileStatus.Success,
                });
            } else {
                newFiles.push({
                    id: utilsService.getUniqueId(),
                    file,
                    status: StudyFileStatus.Error,
                    message: validation.message,
                });
            }
        });

        studyFiles = [...studyFiles, ...newFiles];
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
        studyFiles = studyFiles.filter((_, i) => i !== index);
    };

    const cancelButtonClick = () => {
        currentStepIndex--;
        steps[currentStepIndex].isComplete = false;
    };

    const createButtonClick = () => {
        steps[currentStepIndex].isComplete = true;
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

{#if studyFiles.length > 0}
    <div class="file-uploader-items-container">
        {#each studyFiles as item, index (item.id)}
            <FileUploaderItem
                class="file-uploader-item"
                id={item.id}
                name={item.file.name}
                invalid={item.status === StudyFileStatus.Error}
                errorSubject={item.message}
                status="edit"
                on:delete={() => removeFile(index)}
            />
        {/each}
    </div>
{/if}

<div class="buttons-container">
    <Button kind="secondary" on:click={cancelButtonClick}>Cancel</Button>
    <Button kind="primary" on:click={createButtonClick}>Create</Button>
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
        border: 1px solid var(--cds-border-strong);
        border-style: dashed;
        border-radius: 4px;
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
