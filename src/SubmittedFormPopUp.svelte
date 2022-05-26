<script>
    function closeSubPopUp() {
        document.querySelector(".sub_popup").style.visibility = "hidden";
    }
</script>

<div class="sub_popup" style:visibility="hidden">
    <p>Мы перезвоним вам в течение часа!</p>
    <button on:click={closeSubPopUp}></button>
</div>

<style>
    .sub_popup {
        position: absolute;
        top: 60px;
        height: calc(100vh - 120px);
        max-height: calc(100vh - 120px);
        width: 100vw;
        background-color: white;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    p {
        font-size: 30px;
    }

    button {
        background: url("photos/cross.svg") no-repeat;
        height: 50px;
        width: 50px;
        border: none;
        margin-left: 30px;
    }

    @media screen and (max-width: 600px) {
        .sub_popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100vh;
            max-height: 100vh;
            flex-direction: column;
            justify-content: space-between;
        }

        p {
            padding: 300px 30px 0 30px;
            text-align: center;
        }

        button {
            margin: 0;
        }
    }
</style>