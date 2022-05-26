<!-- <svelte:options accessors={true}/> -->

<script>
    function closeServicePopUp() {
        document.querySelector(".service_popup").style.visibility = "hidden";
    }
</script>

<div class="service_popup" style:visibility="hidden">
    <div>
        <p style:font-size="60px" style:color="white" style:fontweight="700">name</p>
    </div>
    <div class="desc">
        <p style:font-size="40px">Описание услуги</p>
        <p style:font-size="30px"></p>
    </div>
    <button on:click={closeServicePopUp}></button>
</div>

<style>
    .service_popup {
        position: absolute;
        top: 60px;
        height: calc(100vh - 120px);
        max-height: calc(100vh - 120px);
        width: 100vw;
        background-color: white;
        z-index: 3;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    button {
        background: url("photos/cross.svg") no-repeat;
        height: 50px;
        width: 50px;
        border: none;
        margin: 50px 50px 0 0;
    }

    .service_popup > div:first-child {
        width: 40%;
        height: calc(100% - 40px);
        max-height: calc(100% - 40px);
        padding: 40px 50px 0 40px;
    }

    .desc {
        margin: 50px 20px;
        width: calc(60% - 100px);
        max-width: calc(60% - 100px);
        max-height: 100%;
        font-size: 30px;
    }

    @media screen and (max-width: 600px) {
        .service_popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            flex-direction: column;
            align-items: center;
        }

        .service_popup > div:first-child {
            width: 100%;
            height: 300px;
            max-height: 300px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .service_popup > div:first-child > p {
            font-size: 30px !important;
            text-align: center;
        }

        .desc {
            margin: 0;
            width: 100%;
            max-width: 100%;
            height: calc(100% - 300px - 60px);
        }

        .desc > p:first-child {
            font-size: 30px !important;
            margin: 20px;
            text-align: center;
        }

        .desc > p:last-child {
            font-size: 25px !important;
            margin: 0 20px;
            overflow-y: scroll;
            height: calc(100% - 80px);
        }

        button {
            margin: 0;
        }

    }
</style>