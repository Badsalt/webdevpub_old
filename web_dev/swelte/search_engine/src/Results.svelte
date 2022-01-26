<script>
    export let json;
    import { fly, fade, slide, draw } from "svelte/transition";
import App from "./App.svelte";

    function processUrl( url ){
        let split = url.split("/");
        let output = "";
        console.log(split)
        console.log(url)
        split.forEach((element, index) => {
            if ( index == 0 ){
                output +=  element + "//"
                console.log(output)
            } else if (index == 1){
                output += "";
            } else if (index + 1 == split.length){
                output += element;
            } else {
                output += element + " " + ">" + " ";
            }
        });
        console.log(output)
        console.log("-------")
        return output;
    }
</script>

{#if json && "data" in json && "items" in json.data && json.data.items.length > 0}
    <div class="column">
        {#each json.data.items as item}
            <div class="searchResults">
                <h2>{processUrl(item.url)}</h2>
                <a href="{item.url}">{item.name}</a>
                {#if item.description}
                    <h5>{item.description.length > 250 ? item.description.substring(0, 250 - 3) + "..." : item.description.substring(0, 250)}</h5>
                {:else}
                    <h5>No description is available</h5>
                {/if}
                <h6>{item.published_at}</h6>
                
            </div>   
        {/each}
    </div>
{:else if json}
    <div class="column">
        <p transition:fade>{JSON.stringify(json)}</p>
    </div>
{/if}

<style>
    .column {
        display: flex;
        justify-content: start;
        align-items: start;
        flex-direction: column;
        overflow-y: scroll;
        box-sizing: border-box;
        padding-left: 10%;
        padding-right: 10%;
        max-width: 100%;
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
        background-color: rgba(255, 255, 255, 0.1);
    }
    ::-webkit-scrollbar-thumb {
        background-image: linear-gradient(45deg, #00aeff, #a68eff);
        border-radius: 10px;
        -webkit-box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
    }
</style>
