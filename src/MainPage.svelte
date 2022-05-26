<script>
	import TopMenu from './TopMenu.svelte';
	import Banner from './Banner.svelte';
	import Services from './Services.svelte';
	import Suites from './Suites.svelte';
	import IndSuite from './IndSuite.svelte';
	import Footer from './Footer.svelte';
	import ServicePopUp from './ServicePopUp.svelte';
	import FormPopUp from './FormPopUp.svelte';
	import SubFormPopUp from './SubmittedFormPopUp.svelte';
</script>

<div class="wrapper">
	<header>
		<TopMenu/>
	</header>
	<main>
		<Banner/>
		<Suites/>
		<IndSuite/>
		<Services/>
	</main>
	<Footer/>
	<ServicePopUp/>
	<FormPopUp/>
	<SubFormPopUp/>
</div>
