<script>
    import { fly, fade, slide, draw } from "svelte/transition";
    const amountOfQuestionMarks = 5;

    let isActive = true;
    let duration = 500;
    let y = -125;

    async function myLoop() {
        setTimeout(function () {
            toggle();
            myLoop();
        }, 500);
    }

    function toggle() {
        if (isActive) {
            isActive = false;
        } else {
            isActive = true;
        }
    }
    myLoop();
</script>

<main>
    <div class="container" out:fade>
        <img id="image" width="100%" src="./pic/cloud-black.svg" alt="Cloud" />
        {#if isActive}
            <div class="flexcontainer">
                <span
                    out:fly={{ y, duration }}
                    class="questionMark"
                    style="transform: rotate(40deg);">?</span
                >
                <span
                    out:fly={{ y, duration }}
                    class="questionMark"
                    style="transform: rotate(30deg);">?</span
                >
                <span out:fly={{ y, duration }} class="questionMark">?</span>
                <span
                    out:fly={{ y, duration }}
                    class="questionMark"
                    style="transform: rotate(-30deg);">?</span
                >
                <span
                    out:fly={{ y, duration }}
                    class="questionMark"
                    style="transform: rotate(-40deg);">?</span
                >
            </div>
        {/if}
        
    </div>
</main>

<style>
    main {
        width: 100%;
    }

    .container {
        margin: 0 auto;
        margin-top: 20px;
        width: 50%;
        max-width: 400px;
        text-align: center;
        position: relative;
        height: 2.75em;
    }

    .flexcontainer {
        display: flex;
        align-items: center;
        align-self: center;
        align-content: center;
        justify-content: center;
    }

    .questionMark {
        display: inline-block;
        font-size: 5em;
    }
</style>
