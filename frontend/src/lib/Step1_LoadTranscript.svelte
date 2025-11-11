<script>
  import { FileUploaderButton } from "carbon-components-svelte";
  import { createEventDispatcher } from "svelte";
  let selectedFile = null;
  let errorMessage = "";
  let filePath = "";
  let uploading = false;
  let files = [];

  const dispatch = createEventDispatcher();
  
  const selectFile = async () => {
    if (!files) {
      errorMessage = "Please select a file first.";
      return;
    }

    selectedFile = files[0];

    uploading = true;
    errorMessage = "";
    filePath = "";

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Selection failed");

      const data = await response.json();
      if (data.file_path) {
        filePath = data.file_path;
        dispatch("fileUploaded", { filePath });
        console.log("✅ Selected file path:", filePath);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      errorMessage = err.message || "Selection failed";
    } finally {
      uploading = false;
    }
  };
</script>

  <div class="wizard-step">
    <h2 class="wizard-step-title">Step 1: Select your transcript file</h2>
    <FileUploaderButton
      labelTitle="Select a file"
      labelDescription="Only .csv, .xlsx or .docx files are supported"
      buttonLabel="Browse"
      multiple={false}
      accept={[".csv", ".xlsx", ".docx"]}
      bind:files
      on:change={selectFile}
    />
  {#if uploading}
    <p>Uploading...</p>
  {/if}

  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}

  {#if filePath}
    <p style="color: green;">✅ File selected! Path: {filePath}</p>
  {/if}
  </div>

