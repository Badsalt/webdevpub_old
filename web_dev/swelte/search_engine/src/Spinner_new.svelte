<script>
    import { fly } from "svelte/transition";
    const amountOfQuestionMarks = 5;
    let isActive = true;
    let duration = 500;
    let y = -100;

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
    <div class="container">
        <span
        >
            <img height="200px" src="./pic/cloud-icon.png" alt="Cloud" /></span
        >
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
        text-align: center;
        position: relative;
        height: 275px;
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
