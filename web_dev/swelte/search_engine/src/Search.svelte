<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script>
    import { promise } from "./stores.js";
    import { IsHomePage } from "./stores.js";
    import {maxItemsPerPage} from "./stores.js";
    let question;
    let settingsActive;
    $IsHomePage = true;
    $maxItemsPerPage = 15;
    async function search() {

        try {
            const res = await fetch(
            `https://demo.dataverse.org/api/search?q=` + question + "&per_page=100"
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
    <span class="fa fa-times fa-4x" style="color: red; position: absolute; top: 1em; right: 1em;" on:click={() => settingsActive = false}></span>
    <div style="color: white; font-size: 3em;">
        Set number of items per page
        <hr>
        <input type="number" min="5" max="40" bind:value={$maxItemsPerPage}>
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
            <input  bind:value={question} /> 
            <span class="fa fa-search fa-2x searchIcon"></span>
            <span on:click={() => settingsActive = true} class="fa fa-gear fa-3x settingsIcon"></span>
        </form>
    </div> 
    {:else}
    
        <div class="header-search">
            <h1>CLOUD SEARCH</h1>
                <div class="flexContainer">
                    <div class="icon" on:click={() => $IsHomePage = true}><img style="height: 100%" src="./pic/cloud-black.svg" alt="Go to Home Page" title="Go to Home Page"></div>
                    <form
                    on:submit|preventDefault={() => {
                        $promise = search();
                    }}
                >
                    <input  bind:value={question} />
                    <span class="fa fa-search fa-2x searchIcon"></span>
                    <span on:click={() => settingsActive = true} class="fa fa-gear fa-3x settingsIcon"></span>
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
        left: 20px;
        top: 12px;
        color: rgb(10, 23, 95)
    }

    .settingsIcon {
        right: 12px;
        top: 10px;
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
        width: 70%;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 30px;     
    }

    .container form {
        margin-bottom: 10px;
        width: 80%;
    }

    .header-search {
        width: 100vw;
        height: 120px;
        text-align: center;  
        background-color: rgba(255, 255, 255, 0.5);
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
        font-size: 15px;
        border-radius: 30px;
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

    .settingsContainer.invisible {
        display: none;
    }

    @media screen and (min-width: 1400px ){
        .container {
            width: 1000px;
        }

    }

    @media screen and (max-width: 768px){
        .container {
            width: 95%
        }
        .container form {
            width: 80%;
        }

        .header-search form {
            width: 80%;
        }

        .header-search .flexContainer {
            margin-left: 5px;
        }

        .settingsIcon {
            top: 12px;
            right: 12px;
        }

        form input {
            text-indent: 35px;
        }

        .searchIcon {
            top: 12px;
        }

        .settingsContainer div {
            font-size: 2em !important;
        }

    }

</style>
