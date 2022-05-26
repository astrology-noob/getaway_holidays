<footer>
    <div class="logo">Getaway Holidays</div>
    <div class="social_nets">
        <p>Контакты:</p>
        <a href="https://vk.com/" target="_blank"><div class="vk"></div></a>
        <a href="https://t.me/astrology_noob" target="_blank"><div class="tg"></div></a>
        <a href="https://youtu.be/dQw4w9WgXcQ" target="_blank"><div class="yt"></div></a>
        <a href="https://wa.me/79258850827" target="_blank"><div class="wa"></div></a>
    </div>
</footer>

<style>
    .vk {
        background: url("photos/vk.svg") no-repeat;
    }

    .tg {
        background: url("photos/telegram.svg") no-repeat;
    }
    
    .yt {
        background: url("photos/youtube.svg") no-repeat;
    }

    .wa {
        background: url("photos/whatsapp.svg") no-repeat;
    }

    .social_nets > a > div {
        cursor: pointer;
        background-size: contain;
        width: 45px;
        height: 45px;
        /* filter: invert(100%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%); */
        filter: invert(100%);
    }

    .social_nets {
        width: 350px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .social_nets > p {
        margin: 0;
        margin-right: 10px;
        font-size: 20px;
    }

    footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #314259;
        color: white;
        padding: 0 100px;
    }

    @media screen and (max-width: 600px) {
        footer {
            padding: 0 20px;
        }

        .social_nets {
            width: 200px;
        }

        .social_nets > a > div {
            height: 30px;
            width: 30px;
        }

        p {
            display: none;
        }
    }
</style>