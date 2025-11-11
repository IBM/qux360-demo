<script>
  import { Button, FileUploaderButton, Loading, ProgressIndicator, ProgressStep } from "carbon-components-svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
 
  let step = 1;
  let steps = 3
  let speakers = [];
  let interviewee = "";
  let selected = "";
  let selectedFile = null;
  let loading = false;
  let errorMessage = "";
  let filePath = "";
  let uploading = false;
  let extractingSpeakers = false;
  let files = [];

  const nextStep = () => { if (step < steps) step += 1; };
  const prevStep = () => { if (step > 1) step -= 1; }; 
  
    // 🔁 Automatically run process when step changes to 2
  $: if (step === 2 && filePath) {
    extractSpeakers();
  }

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


  const extractSpeakers = async () => {
    if (!filePath) {
      errorMessage = "Please enter a file path.";
      return;
    }

    extractingSpeakers = true;
    errorMessage = "";
    speakers = [];

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/extract_speakers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      speakers = data.speakers || [];
      interviewee = data.interviewee || ""
    } catch (err) {
      console.error(err);
      errorMessage = err.message || "Processing failed";
    } finally {
      extractingSpeakers = false;
    }
  };


  async function handleExecute() {
    const formData = new FormData();
    formData.append("choice", selected);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/execute`, { method: "POST", body: formData });
    const data = await res.json();
    alert(`Result: ${data.result}`);
  }
</script>

<div class="wizard-container" transition:fade>
  <ProgressIndicator spaceEqually>
    <ProgressStep labelText="Select Transcript" completed={step > 1} current={step === 1}/>
    <ProgressStep labelText="Extract Speakers" completed={step > 2} current={step === 2}/>
    <ProgressStep labelText="Execute" current={step === 3}/>
  </ProgressIndicator>

  {#if step === 1}
    <div class="wizard-step">
      <h2>Step 1: Select your transcript file</h2>
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
    <p>Uploading...</p> <!-- simple text instead of spinner -->
  {/if}

  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}

  {#if filePath}
    <p style="color: green;">✅ File selected! Path: {filePath}</p>
  {/if}
    </div>
  {:else if step === 2}
    <h2 class="wizard-step-title">Step 2: Extract Speakers</h2>
    {#if extractingSpeakers}
      <Loading description="Extracting speakers..." withOverlay={false} small={false} />
      <p>Please wait while speakers are extracted.</p>
    {:else if speakers.length > 0}
      <h3>Speakers</h3>
      <ul>
        {#each speakers as speaker}
        {#if speaker == interviewee}
          <li>{speaker} - Interviewee</li>
        {:else}
          <li>{speaker}</li>
        {/if}
        {/each}
      </ul>
    {/if}
  {:else}
    <h2 class="wizard-step-title">Step 3: WORK IN PROGRESS</h2>
    <Button on:click={handleExecute}>Run Function</Button>
  {/if}

  <div class="wizard-nav">
    <Button kind="secondary" on:click={prevStep} disabled={step === 1}>Back</Button>
    <Button on:click={nextStep} disabled={step === steps}>Next</Button>
  </div>
</div>
