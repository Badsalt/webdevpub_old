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
            // delay to show spinner. is this a good idea lol ?
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (res.ok) {
                return json;
            } else {
                throw new Error(json);
            }
        } catch {
            return {error: "Search failed, please check your internet connection"}
        }
        

        
        
    }
</script>
    
    {#if $IsHomePage}
    <div class="container">
    <h1>Cloud Search</h1>
        <form
            on:submit|preventDefault={() => {
                $promise = search();
                $IsHomePage = false;
            }}
        >
            <input placeholder="Search Here" bind:value={question} /> 
            <span class="fa fa-search fa-lg searchIcon"></span>
            <span class="fa fa-gear fa-2x settingsIcon"></span>
        </form>
    </div> 
    {:else}
    
        <div class="header-search">
            <h1>Cloud Search</h1>
            <div class="row">
                <div class="icon" on:click={() => $IsHomePage = true}><img style="height: 80px;" src="./pic/cloud-icon.png" alt="Go to Home Page" title="Go to Home Page"></div>
                <form
                on:submit|preventDefault={() => {
                    $promise = search();
                }}
            >
                <input placeholder="Search Here" bind:value={question} />
                <span class="fa fa-search fa-lg searchIcon"></span>
                <span class="fa fa-gear fa-2x settingsIcon"></span>
            </form>
            </div> 
        </div>
    {/if}



<style>

    * {
        outline: 0 !important;
    }

    .icon {
        background-color: transparent;
        display: inline-block;
        margin-left: 20px;
        margin-top: 10px;
    }

    .icon:hover,
    input:hover{
        cursor: pointer;
        background-color: lightblue;
    }

    /*.searchButton:hover i {
        font-size: 1.5em;
    } */

    .settingsIcon{
        display:inline-block;
        position: absolute;       
    }

    .searchIcon {
        display:inline-block;
        position: absolute;
        left: 15px;
        top: 15px;
    }

    .settingsIcon {
        right: 17px;
        top: 8px;
    }

    .settingsIcon {
        transform: rotate(20deg);
    }
    .settingsIcon:hover{
        transform: rotate(180deg);
        cursor: pointer;
    }

    .container {
        margin-top: 30vh;
        width: 100%;
        text-align: center;
    }
    .header-search {
        margin-top: 2px;
        width: 100%;
        text-align: center
    }
    form {
        width: 80%;
        position: relative;
        margin: 0 auto;
    }
    form input {
        width: 100%;
        border-radius: 50px;
        padding: 15px;
        text-indent: 45px;
    }
</style>
