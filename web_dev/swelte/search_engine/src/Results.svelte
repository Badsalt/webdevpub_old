<script>
    export let json;
    import { has_prop, null_to_empty, update_slot } from "svelte/internal";
    import { IsHomePage } from "./stores.js";
    import {maxItemsPerPage} from "./stores.js";
    import { fly, fade, slide, draw } from "svelte/transition";
    import App from "./App.svelte";

    let pages;
    let currentPage = 1;

    ($maxItemsPerPage) ? $maxItemsPerPage : $maxItemsPerPage = 15;
         
    function calculatePages(item_per_page){
        if ( json && "data" in json && "items" in json.data && json.data.items.length > 0 ){
            let jsonLength = json.data.items.length;
            (item_per_page > 0) ? "" : item_per_page = 1;
            pages = Math.ceil(jsonLength/item_per_page);
        }
        return "" ;
    }
    


    function processUrl( url ){
        let parts = url.split("/");
        let output = "";

        parts.forEach((element, index) => {
            if ( index == 0 ){
                output +=  element + "//"
            } else if (index == 1){
                output += "";
            } else if (index + 1 == parts.length){
                output += element;
            } else {
                output += element + " " + ">" + " ";
            }
        });
        return output;
    }

    

    function processDate(date) {
        let split = date.split("T");
        let output = "";

        split.forEach((element, index) => {
            if(index == 0) {
                output = element                
            }
        });
        return output;
    }


</script>
{#key $maxItemsPerPage }
{calculatePages($maxItemsPerPage)}
{#if json && "data" in json && "items" in json.data && json.data.items.length > 0 && !$IsHomePage}
<div>Results Found: {json.data.items.length} Page: {currentPage}</div>
<div class="column">
    {#each json.data.items as item, index}
    {#if (index < $maxItemsPerPage * currentPage) &&  (index >=  $maxItemsPerPage * (currentPage-1)) }
    <div in:fly="{{ y: 100, duration: 500 }}" class="searchResultsContainer">

        <div class="searchResults">
            <h2 class="title">{processUrl(item.url)}</h2>
            <div>
                <a class="link" href="{item.url}">{item.name}</a>
                {#if item.type == "file"}
                    <span class="fa fa-download"></span>
                {:else if item.type == "dataset"}
                    <span class="fa fa-database"></span> 
                {:else if item.type = "dataverse"}
                    <span class="fa fa-server"></span> 
                {/if}
            </div>
            {#if item.description}
                <h5 class="description">{item.description.length > 250 ? item.description.substring(0, 250 - 3) + "..." : item.description.substring(0, 250)}</h5>
            {:else}
                <h5 class="description">No description is available.</h5>
            {/if}
            <h6 class="date">Published: {processDate(item.published_at)}</h6>
            <!--<p style="color: white;">{JSON.stringify(item)}</p> -->
            </div>
    </div>
    {/if}
    {/each}

    <div class="pageNavigationContainer">
        <ul class="pageNavigation">
            {#if pages >= 1}
                {#each Array(pages) as _, i}
                    <li class:clicked={currentPage==i+1} on:click="{() => currentPage = i+1}">{i+1}</li>     
                {/each}
            {/if}               
        </ul>

    </div>
</div>
{:else if json && !$IsHomePage}
{#if json.hasOwnProperty('error')}
    <div class="searchResultsContainer">
        <p style="color: red; font-size: 2.5em" transition:fade>{json.error}</p>
    </div>
{:else if !$IsHomePage}
        <div class="searchResultsContainer">
            <p style="color: red; font-size: 3em" transition:fade>No Results Found. You may <a style="color: red;" target="_b" href="https://youtu.be/dQw4w9WgXcQ">like</a></p> 
        </div>
{/if}gi

{/if}
{/key}


<style>
    :global(body) {
        font-family: 'Courier New', Courier, monospace;
        font-size: 62.5%;
    }

    .searchResults {
        margin: 5px 10px;
        opacity: 1;
    }

    .searchResultsContainer {
        width: 85%; 
        /*border-style: inset; */
        border-radius: 25px;
        /*border-color: blue;
        border-width: 10px; */
        margin: 1em 0;
        padding: 1em;  
        background-color: rgba(22, 22, 22, 0.6);    
        backdrop-filter: blur(10px);

    }
    .searchResultsContainer:hover, .searchResultsContainer:active {
        background-color: rgb(10, 23, 95);
        backdrop-filter: blur(10px);
        /*https://www.w3schools.com/css/css3_shadows_box.asp */
        box-shadow: 0 8px 8px 0 rgba(0, 0, 0, 0.2), 0 12px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .searchResults .title {
        color: red;
        font-size: 1.5em;
    }
    .searchResults .link {
        color: #5D8BF4;
        /*background-color: rgba(255, 255, 255, 0.8);*/
        font-size: 2em;
        font-style: italic;
    } 
    .searchResults .description {
        font-size: 1.7em;
        letter-spacing: 0.05em;
        color: #F7AF1D;
    } 
    .searchResults .date {
        color: yellow;
        font-size: 1.4em;
    }
    
    @media screen and (max-width: 768px){
        :global(body) {
            font-size: 55%;
        }
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

    li {
        cursor: pointer;
    }

    .fa {
        color: #5D8BF4;
    }


    .pageNavigationContainer{
        margin-bottom: 1em;
        position: fixed;
        bottom: 0;
        background-color: #5D8BF4;
        border-radius: 25px;
    }

    .pageNavigation {
        display: flex; 
        flex-direction:row; 
        list-style:none;
        align-self: center;
        align-content: center;
        padding: 1em 1.5em;
        margin: 0;
    }
    .pageNavigation li {
        padding: 0.5em;
        margin: 0.25em;
        background-color: white;
    }

    .pageNavigation li:hover {
        text-decoration: underline;
        box-shadow: 0 8px 8px 0 rgba(0, 0, 0, 0.2), 0 12px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .pageNavigation li.clicked {
        font-weight: bold;
        
    }

    /** https://onaircode.com/html-css-custom-scrollbar-examples/ */
    ::-webkit-scrollbar {
        width: 1.5em;
        height: 1.5em;
    }
    ::-webkit-scrollbar-track {
        border-radius: 1em;
        background-color: #ffffff33;
    }
    ::-webkit-scrollbar-thumb {
        background-color: rgb(255, 255, 255);
        border-radius: 1em;
        -webkit-box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
        box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
    }
</style>
