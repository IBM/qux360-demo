<script>
  import Step1_LoadTranscript from "./Step1_LoadTranscript.svelte";
  import Step2_ExtractSpeakers from "./Step2_ExtractSpeakers.svelte";
  import Step3_Anonymize from "./Step3_Anonymize.svelte";
  import { Button, ProgressIndicator, ProgressStep } from "carbon-components-svelte";
  import { fade } from "svelte/transition";
 
  let step = 1;
  let steps = 3
  let filePath = "";
  let speakers = null;

  const nextStep = () => { if (step < steps) step += 1; };
  const prevStep = () => { if (step > 1) step -= 1; }; 
  
  function handleFileUploaded(event) {
    filePath = event.detail.filePath;
  }

  function handleSpeakersExtracted(event) {
    speakers = event.detail.result;
  }
</script>

<div class="wizard-container" transition:fade>
  <ProgressIndicator spaceEqually>
    <ProgressStep labelText="Select Transcript" completed={step > 1} current={step === 1}/>
    <ProgressStep labelText="Extract Speakers" completed={step > 2} current={step === 2}/>
    <ProgressStep labelText="Execute" current={step === 3}/>
  </ProgressIndicator>

  {#if step === 1}
    <Step1_LoadTranscript on:fileUploaded={handleFileUploaded} />
  {:else if step === 2}
    <Step2_ExtractSpeakers {filePath} on:speakersExtracted={handleSpeakersExtracted} on:back={prevStep} />
  {:else if step === 3}
    <Step3_Anonymize {speakers} on:restart={() => (step = 1)} />
  {/if}
  <div class="wizard-nav">
    <Button kind="secondary" on:click={prevStep} disabled={step === 1}>Back</Button>
    <Button on:click={nextStep} disabled={step === steps}>Next</Button>
  </div>
</div>

