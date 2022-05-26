import MainPage from './MainPage.svelte';
import SuiteSliderElem from './SuiteSliderElem.svelte';
import ServiceSliderElem from './ServiceSliderElem.svelte';

// let db = require("../public/database");

new MainPage({
	target: document.body
})

new SuiteSliderElem({
	target: document.querySelector("#suites>.slider"),
	props: {
		name: "Базовый пакет",
		price: "4000 р/день",
		morn_text: "1 утренний перекус (горячий напиток и закуска)",
		sup_text: "1 ужин, который подается в ресторане на территории отеля",
		spa_text: "1 х 1 час санаторно-курортных процедур",
		ski_text: "Бесплатный пропуск на подъёмник на 1 день"
	}
})

new SuiteSliderElem({
	target: document.querySelector("#suites>.slider"),
	props: {
		name: "Стандартный пакет",
		price: "5000 р/день",
		morn_text: "3 утренних перекуса (горячие напитки и закуски) ",
		sup_text: "3 ужина, которые подаются в ресторане на территории отеля",
		spa_text: "3 спа-процедуры по 1 часу",
		ski_text: "Бесплатный пропуск на подъёмник на 3 дня"
	}
})

new SuiteSliderElem({
	target: document.querySelector("#suites>.slider"),
	props: {
		name: "Пакет Люкс",
		price: "6500 р/день",
		morn_text: "Ежедневные утренние перекусы (горячие напитки и закуски) ",
		sup_text: "5 ужинов, которые подаются в ресторане на территории отеля",
		spa_text: "5 спа-процедур по 1 часу",
		ski_text: "Бесплатный абонемент на подъёмник на 1 неделю"
	}
})

fetch("api/services")
.then(res => res.json())
.then(json => {
	for (let i = 0; i < Object.keys(json).length; i++) {
		new ServiceSliderElem({
			target: document.querySelector("#services>.slider"),
			props: {
				id: i,
				name: json[i].name,
				file: json[i].file
			}
		})
	}
	
	$(document).ready(function(){
		$('.slider').slick({
			infinite: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			// dots: true
		});
	});
})