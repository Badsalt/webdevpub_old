<script>
    export let json;
    import { has_prop } from "svelte/internal";
    import { IsHomePage } from "./stores.js";
    import { fly, fade, slide, draw } from "svelte/transition";
    import App from "./App.svelte";

    function processUrl( url ){
        let split = url.split("/");
        let output = "";

        split.forEach((element, index) => {
            if ( index == 0 ){
                output +=  element + "//"

            } else if (index == 1){
                output += "";
            } else if (index + 1 == split.length){
                output += element;
            } else {
                output += element + " " + ">" + " ";
            }
        });
        return output;
    }
</script>

{#if json && "data" in json && "items" in json.data && json.data.items.length > 0 && !$IsHomePage}
    <div class="column">
        {#each json.data.items as item}
        <div class="searchResultsContainer">
            <div class="searchResults">
                <h2 class="title">{processUrl(item.url)}</h2>
                <a class="link" href="{item.url}">{item.name}</a>
                {#if item.description}
                    <h5 class="description">{item.description.length > 250 ? item.description.substring(0, 250 - 3) + "..." : item.description.substring(0, 250)}</h5>
                {:else}
                    <h5 class="description">No description is available.</h5>
                {/if}
                <h6 class="date">Published at: {item.published_at}</h6>    
            </div>
        </div>
        {/each}
    </div>
{:else if json && !$IsHomePage}
    {#if json.hasOwnProperty('error')}
        <div class="searchResultsContainer">
            <p style="color:red; font-size: 25px" transition:fade>{json.error}</p>
        </div>
    {:else if !$IsHomePage}
            <div class="searchResultsContainer">
                <p style="color:red; font-size: 30px" transition:fade>No Results Found</p>
            </div>
    {/if}
    
{/if}

<style>
    :global(body) {
        font-family: 'Courier New', Courier, monospace;
    }

    .searchResults{
        margin: 5px 10px;
        opacity: 1;
    }

    .searchResultsContainer {
        width: 75%; 
        margin: 0;
        border-style: inset;
        border-radius: 25px;
        border-color: blue;
        border-width: 10px;
        margin: 10px 0;
        background-color: black;
        opacity: 0.9;
    }

    .searchResults .title {
        color: red;
        font-size: 25px;
    }
    .searchResults .link {
        color: blue;
        background-color: rgba(255, 255, 255, 0.8);
        font-size: 20px;
        padding: 5px;
        display: inline-block;
        font-style: italic;
    } 
    .searchResults .description {
        font-size: 17px;
        letter-spacing: 0.05em;
        color: green;
    } 
    .searchResults .date{
        color: grey;
        font-size: 14px;
    }
    

    .column {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        overflow-y: scroll;
        box-sizing: border-box;
        padding-left: 1%;
        padding-right: 1%;
        max-width: 100%;
        width: 100%;
    }

    .column p {
        border-radius: 25px;
        background-color: whitesmoke;
        border: 2px solid whitesmoke;
        padding: 20px;
        width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
    }

    /** https://onaircode.com/html-css-custom-scrollbar-examples/ */
    ::-webkit-scrollbar {
        width: 15px;
        height: 15px;
    }
    ::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color: #ffffff33;
    }
    ::-webkit-scrollbar-thumb {
        background-image: linear-gradient(45deg, #2a4703, #95ec0a);
        border-radius: 10px;
        -webkit-box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
        box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
    }
</style>
