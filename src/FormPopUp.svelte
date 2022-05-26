<script>
    function closeFormPopUp() {
        document.querySelector(".form_popup").style.visibility = "hidden";
    }

    function changePopUp() {
        document.querySelector(".form_popup").style.visibility = "hidden";
        document.querySelector(".sub_popup").style.visibility = "visible";
    }
</script>

<div class="form_popup" style:visibility="hidden">
    <div>
        <div class="form_wrapper">
            <p>Заказать обратный звонок</p>
            <form action="api/call" method="post" on:submit|preventDefault={changePopUp}>
                <div class="form_group">
                    <label for="name">Имя</label>
                    <input type="text" name="name" required/>
                </div>
                <div class="form_group">
                    <label for="phone">Телефон</label>
                    <input type="text" name="phone" required/>
                </div>
                <input type="submit" value="Заказать"/>
            </form>
        </div>
        <button on:click={closeFormPopUp}></button>        
    </div>
</div>

<style>
    .form_popup {
        position: absolute;
        top: 60px;
        height: calc(100vh - 120px);
        max-height: calc(100vh - 120px);
        width: 100vw;
        background-color: white;
        z-index: 3;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .form_popup > div {
        width: calc(50% + 50px);
        height: 50%;
        display: flex;
        align-items: flex-start;
    }
    
    .form_wrapper {
        width: calc(100% - 50px);
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    form {
        width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 40%;
    }

    input[type=text] {
        width: 70%;
        border-radius: 10px;
    }

    input[type=submit] {
        height: 60px;
        width: 70%;
        font-size: 30px;
        border: none;
        border-radius: 10px;
        background-color: #314259;
        color: white;
        cursor: pointer;
    }

    label {
        font-size: 30px;
        color: #314259;
    }

    .form_wrapper > p {
        font-size: 40px;
        font-weight: 700;
        color: #314259;
    }

    .form_group {
        width: 70%;
        display: flex;
        justify-content: space-between;
    }

    button {
        background: url("photos/cross.svg") no-repeat;
        height: 50px;
        width: 50px;
        border: none;
        margin: 50px 50px 0 0;
        color: #314259;
    }

    @media screen and (max-width: 600px) {
        .form_popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
        }

        .form_popup > div {
            flex-direction: column;
            align-items: center;
            height: 100%;
            width: 100%;

        }

        .form_wrapper {
            padding: 0 30px;
        }

        form {
            height: 300px;
            width: 100%;
        }

        .form_group {
            flex-direction: column;
            width: 100%;
        }

        input[type=submit] {
            width: 100% !important;
        }
        
        input[type=text] {
            height: 50px;
            width: calc(100% - 10px);
        }

        button {
            margin: 0;
        }
    }
</style>