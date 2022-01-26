<script>
    import { promise } from "./stores.js";
    let question;
    async function search() {
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
    }
</script>

<div class="row">
    <form
        on:submit|preventDefault={() => {
            $promise = search();
        }}
    >
        <input bind:value={question} />
    </form>
</div>

<style>
    .row {
        display: flex;
        gap: 10px;
        width: 50%;
        justify-self: center;
        align-items: center;
    }

    form,
    form input {
        width: 100%;
    }
</style>
