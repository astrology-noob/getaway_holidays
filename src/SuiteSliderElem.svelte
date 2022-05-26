<script>
    export let name, price, morn_text, sup_text, spa_text, ski_text;
</script>

<div class="slider-elem">
    <div class="elem_wrapper">
        <div class="elem_head">
            <p>{name}</p>
            <p>{price}</p>
        </div>
        <div class="elem_content">
            <div>
                <div class="icon morn"></div>
                <p>{morn_text}</p>
            </div>
            <div>
                <div class="icon sup"></div>
                <p>{sup_text}</p>
            </div>
            <div>
                <div class="icon spa"></div>
                <p>{spa_text}</p>
            </div>
            <div>
                <div class="icon ski"></div>
                <p>{ski_text}</p>
            </div>
        </div>
        <button class="form_button">Заказать обратный звонок</button>
    </div>
</div>

<style>
    .icon {
        height: 80px;
    }
    
    .morn {
        background: url(photos/morn.png) no-repeat center top;
        background-size: contain;
    }
    
    .sup {
        background: url(photos/sup.png) no-repeat center top;
        background-size: contain;
    }
    
    .spa {
        background: url(photos/spa.png) no-repeat center top;
        background-size: contain;
    }
    
    .ski {
        background: url(photos/ski.png) no-repeat center top;
        background-size: contain;
    }

    .elem_wrapper {
        height: calc(100% - 40px);
        width: 1000px;
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .elem_head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 35px;
    }
    
    .elem_head > p {
        font-weight: 700;
        color: white;
    }
    
    .elem_head > p:last-child {
        /* margin-left: 100px; */
        font-size: 35px;
    }

    .elem_content {
        height: 275px;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    .elem_content > div {
        display: flex;
        flex-direction: column;
        width: calc(870px / 4);
    }

    .elem_content > div > p {
        font-size: 15px;
        text-align: center;
        color: white;
    }

    button {
        background-color: white;
        color: #314259;
        border: none;
        border-radius: 10px;
        height: 50px;
        font-family: 'Comfortaa', sans-serif;
        font-size: 25px;
        padding: 10px 30px;
        transition: 0.3s;
    }

    button:hover {
        transition: 0.3s;
        color: #F2836B;
    }

    @media screen and (max-width: 600px) {
        .elem_wrapper {
            height: 100%;
        }

        .elem_content {
            flex-direction: column;
            align-items: center;
            height: 100%;
            height: calc(100% - 300px);
        }

        .elem_content > div {
            display: flex;
            flex-direction: column;
            width: calc(100% - 150px);
        }

        .elem_head {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: calc(100% - 150px);
            height: 150px;
        }

        .elem_head > p {
            text-align: center;
            margin: 0;
        }

        .elem_head > p:last-child {
            font-size: 30px;
        }

        .elem_head > p:first-child {
            font-size: 25px;
            margin-bottom: 10px;
        }

        button {
            margin: auto;
            width: calc(100% - 150px);
            font-size: 15px;
        }
    }

</style>