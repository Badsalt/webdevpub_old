<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script>
    import { promise } from "./stores.js";
    import { IsHomePage } from "./stores.js";
    let question;
    $IsHomePage = true;
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
    {#if $IsHomePage}
    <h1>Home Page</h1>
    <img src="./logga.png" alt="Logotype">
    <div class="row">
        <form
            on:submit|preventDefault={() => {
                $promise = search();
                $IsHomePage = false;
            }}
        >
            <input bind:value={question} /> 
            <button type="submit" class="searchButton"><i class="fa fa-search fa-lg"></i></button>
        </form>
        <div>
            <form on:submit|preventDefault={() => {
                $promise = search();
                $IsHomePage = false;
            }} >
                <button type="submit">Random Search</button>
            </form>
            
        </div>

    </div>
    {:else}
    
        <div class="header-search">
            
            <div class="row">
                <div class="icon" on:click={() => $IsHomePage = true}><img src="./logga.png" alt="Go to Home Page" title="Go to Home Page"></div>
                <form
                on:submit|preventDefault={() => {
                    $promise = search();
                }}
            >
                <input bind:value={question} />
                <button type="submit" class="searchButton"><i class="fa fa-search fa-lg"></i></button>
            </form>
            </div> 
        </div>
    {/if}



<style>

    .icon {
        background-color: transparent;
        display: inline-block;
        margin-left: 20px;
        margin-top: 10px;
    }

    .icon:hover,
    .searchButton:hover {
        cursor: pointer;
    }

    .searchButton {
        border-radius: 50%;
        padding: 15px;
    }

    .row {
        display: flex;
        gap: 10px;
        width: 75%;
        justify-self: center;
        align-items: center;
        justify-content: center;
    }
    .header-search {
        margin-top: 2px;
        width: 100%;
        text-align: center;
    }
    form,
    form input {
        width: 90%;
        border-radius: 50px;
        padding: 15px;
    }
</style>
