<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script>
    import { promise } from "./stores.js";
    import { IsHomePage } from "./stores.js";
    import {maxItemsPerPage} from "./stores.js";
    let question;
    let settingsActive;
    $IsHomePage = true;
    async function search() {

        try {
            const res = await fetch(
            `https://demo.dataverse.org/api/search?q=` + question + "&per_page=1000"
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
            return {error: "Search failed, please check your internet connection."}
        }
        

        
        
    }
</script>

<div class="settingsContainer" class:invisible={!settingsActive} >
    <span class="fa fa-times fa-2x" style="color: red; position: absolute; top: 10px; right: 10px;" on:click={() =>settingsActive = false}></span>
    <div style="color: white;">
        Set number of items per page
        <input type="number" min="1" name="" id="" bind:value={$maxItemsPerPage}>
        Set color
        <input type="color">
        Set Dark mode
        <input type="checkbox" name="" id="">
    </div>
</div>

    {#if $IsHomePage}
    <div class="container">
    <h1>CLOUD SEARCH</h1>
        <form
            on:submit|preventDefault={() => {
                $promise = search();
                $IsHomePage = false;
            }}
        >
            <input placeholder="Search Here" bind:value={question} /> 
            <span class="fa fa-search fa-lg searchIcon"></span>
            <span on:click={() => settingsActive = true} class="fa fa-gear fa-2x settingsIcon"></span>
        </form>
    </div> 
    {:else}
    
        <div class="header-search">
            <h1>CLOUD SEARCH</h1>
                <div class="flexContainer">
                    <div class="icon" on:click={() => $IsHomePage = true}><img style="height: 100%;" src="./pic/cloud-icon.png" alt="Go to Home Page" title="Go to Home Page"></div>
                    <form
                    on:submit|preventDefault={() => {
                        $promise = search();
                    }}
                >
                    <input placeholder="Search Here" bind:value={question} />
                    <span  class="fa fa-search fa-lg searchIcon"></span>
                    <span on:click={() => settingsActive = true} class="fa fa-gear fa-2x settingsIcon"></span>
                </form> 
            </div>
                </div>
                
    {/if}


<style>

    * {
        outline: 0 !important;
    }

    h1 {
        color: rgb(10, 23, 95);
    }

    .icon {
        background-color: transparent;
        margin-right: 10px;
        height: 50px;
        padding: 5px;
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
        color: rgb(10, 23, 95);       
    }

    .searchIcon {
        display:inline-block;
        position: absolute;
        left: 15px;
        top: 15px;
        color: rgb(10, 23, 95)
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
        width: 95%;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 50px;
    }
    .header-search {
        width: 100vw;
        height: 150px;
        text-align: center;  
        background-color: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        /*https://www.w3schools.com/css/css3_shadows_box.asp */
        box-shadow: 0 8px 8px 0 rgba(0, 0, 0, 0.2); 
    }

    .container:hover{
        /*https://www.w3schools.com/css/css3_shadows_box.asp */
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .header-search .flexContainer {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        margin: 5px 10px 10px 25px;
    }

    .header-search .flexContainer form {
        margin: initial;
    }
    
    form {
        width: 60%;
        position: relative;
        margin: 0 auto

    }
    form input {
        width: 100%;
        border-radius: 50px;
        padding: 15px;
        text-indent: 45px;
    }

    .settingsContainer {
        width: 100vw;
        height: 100vh; 
        background-color:black;
        opacity: 1; 
        position: fixed;
        z-index: 1000; 
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .settingsContainer input:focus {
        
    }

    .settingsContainer.invisible {
        display: none;
    }

</style>
