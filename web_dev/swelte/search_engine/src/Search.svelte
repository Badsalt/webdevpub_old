<script>
    import { promise } from "./stores.js";
    let question;
    let IsHomePage = true;
    async function search() {

        try {
            const res = await fetch(
            `https://demo.dataverse.org/api/search?q=` + question
        );
            const json = await res.json();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (res.ok) {
                return json;
            } else {
                throw new Error(json);
            }
        } catch {
            return {error: "Search failed, please check your internet connection"}
        }
        

        // delay to show spinner. is this a good idea lol ?
        
    }
</script>
    {#if IsHomePage}
    <h1>Home Page</h1>
    <img src="./logga.png" alt="Logotype">
    <div class="row">
        <form
            on:submit|preventDefault={() => {
                $promise = search();
                IsHomePage = false;
            }}
        >
            <input bind:value={question} />
        </form>
    </div>
    {:else}
    
        <div class="header-search">
            
            <div class="row">
                <button style="display: inline-block;" on:click={() => IsHomePage = true}><img src="./logga.png" alt="Go to Home Page"></button>
                <form
                on:submit|preventDefault={() => {
                    $promise = search();
                }}
            >
                <input bind:value={question} />
            </form>
            </div>
        </div>
    {/if}



<style>
    .row {
        display: flex;
        gap: 10px;
        width: 50%;
        justify-self: center;
        align-items: center;
    }
    .header-search {
        margin-top: 2px;
        width: 100%;
        text-align: center;
    }
    form,
    form input {
        width: 100%;
        border-radius: 50px;
        padding: 15px;
    }
</style>
