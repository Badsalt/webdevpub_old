<script>
    import { fly } from "svelte/transition";
    const amountOfQuestionMarks = 1;
    let isActive = true;
    let i = 0;
    

    while (i <= amountOfQuestionMarks){
        
        console.log(isActive)
        console.log(i)
        i++;
    }
    
    function toggle() {
        if (isActive) {
            isActive = false;
        } else {
            isActive = true;
        }
    }

</script>

<main>
    <div class="container">
        <div class="search">
            <span
                ><img
                    height="200px"
                    src="./pic/cloud-icon.png"
                    alt="Cloud"
                /></span
            >

            {#if isActive}
                <span out:fly={{ y: -200, duration: 1000 }} class="questionMark"
                    >?</span
                >
            {/if}

            <button on:click={toggle} />
        </div>
    </div>
</main>

<style>
    .container {
        margin: 0 auto;
        width: 100%;
        text-align: center;
    }

    .search {
        width: 50%;
        position: relative;
    }

    .questionMark {
        display: inline-block;
        font-size: 5em;
    }
</style>
