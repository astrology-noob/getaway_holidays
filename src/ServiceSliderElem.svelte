<script>
    export let name, file, id;
    
    function openServicePopUp(id) {
        fetch(`api/service/${id}`)
        .then(res => res.json())
        .then(json => {
            let servicePopUp = document.querySelector(".service_popup");
            servicePopUp.firstChild.firstChild.innerHTML = json.service.name;
            servicePopUp.children[1].lastChild.innerHTML = json.service.description;
            servicePopUp.firstChild.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(build/photos/${file}) center top`;
            servicePopUp.firstChild.style.backgroundSize = "cover";
            servicePopUp.firstChild.style.backgroundRepeat = "no-repeat";
            servicePopUp.style.visibility = "visible";
        })
        .catch((error) => console.log(error));
    }
</script>

<div class="slider-elem serv-elem" style="background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(build/photos/{file}) center top">
    <div class="serv-name">{name}</div>
    <button on:click={openServicePopUp(id)}>Подробнее</button>
</div>

<style>
    button {
        background-color: white;
        color: #314259;
        border: none;
        border-radius: 10px;
        height: 50px;
        font-family: 'Fira Sans Condensed', sans-serif;
        font-size: 25px;
        padding: 10px 30px;
        transition: 0.3s;
        margin-bottom: 60px;
    }
    
    button:hover {
        transition: 0.3s;
        color: #F2836B;
    }
    
    .serv-name {
        color: white;
        font-size: 30px;
        margin: 60px 75px 0 75px;
    }

    .serv-elem {
        max-height: 100%;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
    }

    @media screen and (max-width: 600px) {
        .serv-name {
            text-align: center;
        }
    }
</style>