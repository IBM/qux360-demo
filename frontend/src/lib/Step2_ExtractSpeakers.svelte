<script>
  import { Loading } from "carbon-components-svelte";
  import { onMount, createEventDispatcher } from "svelte";

  let speakers = [];
  let interviewee = "";
  let errorMessage = "";
  let extractingSpeakers = false;
  export let filePath;
  const dispatch = createEventDispatcher();

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
      result = {
        "speakers": speakers,
        "interviewee": interviewee
      }
      dispatch("speakersExtracted", { result });
    } catch (err) {
      console.error(err);
      errorMessage = err.message || "Processing failed";
    } finally {
      extractingSpeakers = false;
    }
  };

  // 🚀 Automatically start when step is loaded
  onMount(() => {
    if (filePath) extractSpeakers();
  });
</script>

    <h2 class="wizard-step-title">Step 2: Extract Speakers</h2>
    {#if extractingSpeakers}
      <Loading description="Extracting speakers..." withOverlay={false} small={true} />
      <p>Please wait while speakers are extracted and the interviewee is identified.</p>
    {:else if speakers.length > 0}
      <h3 class="wizard-step-subtitle">Speakers</h3>
      <ul>
        {#each speakers as speaker}
        {#if speaker == interviewee}
          <li><strong>{speaker} - Interviewee</strong></li>
        {:else}
          <li>{speaker}</li>
        {/if}
        {/each}
      </ul>
  {/if}

