<script>
  import { Button, ProgressIndicator, ProgressStep } from "carbon-components-svelte";
  import { fade } from "svelte/transition";

  let step = 1;

  const nextStep = () => {
    if (step < 3) step += 1;
  };

  const prevStep = () => {
    if (step > 1) step -= 1;
  };
</script>

<div class="wizard-container" transition:fade>
  <ProgressIndicator spaceEqually>
    <ProgressStep labelText="User Info" completed={step > 1} current={step === 1} />
    <ProgressStep labelText="Details" completed={step > 2} current={step === 2} />
    <ProgressStep labelText="Result" current={step === 3} />
  </ProgressIndicator>

  {#if step === 1}
    <div class="wizard-step">
      <h2 class="wizard-step-title">Step 1: User Info</h2>
      <p>Enter some basic user information.</p>
    </div>
  {:else if step === 2}
    <div class="wizard-step">
      <h2 class="wizard-step-title">Step 2: Details</h2>
      <p>Provide additional details for the process.</p>
    </div>
  {:else}
    <div class="wizard-step">
      <h2 class="wizard-step-title">Step 3: Result</h2>
      <p>All steps completed! 🎉</p>
    </div>
  {/if}

  <div class="wizard-nav">
    <Button kind="secondary" on:click={prevStep} disabled={step === 1}>Back</Button>
    <Button on:click={nextStep} disabled={step === 3}>Next</Button>
  </div>
</div>
