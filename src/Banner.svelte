<div id="banner">
    <div>
        <p>Getaway Holidays</p>
        <p>Навстречу новым впечатлениям!</p>
    </div>
    <!-- <button>Подать заявку</button> -->
</div>

<script>
    
</script>

<style>
    #banner {
        grid-column-start: 1;
        grid-column-end: 1;
        grid-row-start: 1;
        grid-row-end: 3;
        background: url(photos/ski_banner.png);
        background-position: top;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    #banner > div {
        margin: 50px 100px;
    }
    
    p {
        font-size: 50px;
        margin: 0 0 15px 0;
        color: #314259;
    }

    p:first-child {
        font-weight: 700;
    }

    @media screen and (max-width: 600px) {
        #banner {
            height: 500px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #banner > div {
            margin: 20px 10px;
        }

        #banner > div > p {
            text-align: center;
        }

        
        #banner > div > p:first-child {
            font-size: 30px;
        }

        #banner > div > p:last-child {
            font-size: 30px;
        }
    }
</style>