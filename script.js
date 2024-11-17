let data = [];
// Lexicon for categorizing tags
const lexicon = {
	languages: ['C++', 'Dart', 'Python', 'Ruby on Rails', 'VBA', 'JavaScript', 'Node.js', 'PostgreSQL', 'CSS3', 'HTML5'],
	technologies: [
		'3D Printer',
		'3D Printing',
		'3D Scanner',
		'3D Scanning',
		'CAN bus',
		'Microcontrollers',
		'PCBs',
		'Data Acquisiton Module',
	],
	software: [
		'API Gateway',
		'AWS Lambda',
		'CATIA',
		'Catia V5',
		'Control X',
		'DOOKIE',
		'Design X',
		'Dewesoft X',
		'EasyEDA',
		'Firebase',
		'Flutter',
		'Heroku',
		'PlatformIO',
		'Solidworks',
		'WebSocket',
		'Excel',
	],
};

document.addEventListener('DOMContentLoaded', () => {
	const sidebar = document.getElementById('sidebar');
	const top = document.getElementById('top');
	const bottom = document.getElementById('bottom');
	const filter = document.getElementById('filter');
	const ui_button = document.getElementById('ui_button');
	const dark_toggle = document.getElementById('dark_toggle');
	const html = document.querySelector('html');
	const moonIcon = dark_toggle.querySelector('.fa-moon');
	const sunIcon = dark_toggle.querySelector('.fa-sun');
	const filterIcon = filter.querySelector('.fa-bars-filter');
	const collapseIcon = filter.querySelector('.fa-left-from-bracket');
	const scrollable = document.querySelector('#cards');
	const fadeOverlayRight = document.querySelector('.fade-overlay.right');
	const fadeOverlayLeft = document.querySelector('.fade-overlay.left');
	const sidebar_hw = document.querySelector('#sidebar .hw');
	const sidebar_sw = document.querySelector('#sidebar .sw');
	const sidebar_languages = document.querySelector('#sidebar .languages');
	const contact = document.querySelector('#contact_button');
	const resume = document.querySelector('#resume_button');
	let carouselTimer = null;
	let color_scheme = '';
	let pageVisible = true;
	const json_file = 'stuff.json';
	const sserddaLiamE = 'bXlsZXMua2VsbGVyQGdtYWlsLmNvbQ==';
	const rebmuNenohP = 'ODEzLTQ1OS0xNzM5';
	// const rebmuNenohP = '8J2ftPCdn63wnZ+vLfCdn7DwnZ+x8J2ftS3wnZ+t8J2fs/Cdn6/wnZ+1';
	const xiffuSetiSlanoisseforP = 'bXlsZXNrZWxsZXI=';
	const chars = `0x12_3z456e7~89!@r#$-%A^&*(q)`.split('').sort((b, a) => (Math.random() > 0.5 ? 1 : -1));
	const tag_animation_delay = 100;
	const slideshowImageInterval = 3000;
	let keyPressed = false;
	let debounceTimeout = '';

	// TODO: ensure everything is responsive :')

	async function setCardInitialState() {
		await populateDataWithJSON(json_file);
		populateSidebar(); //moved here because of async issue with data being empty
		const quantity = data.positions.length; // determine position quantity
		// create cards
		for (let i = 0; i < quantity; i++) {
			const card = document.createElement('div');
			card.classList.add('flip-card', 'box');
			card.innerHTML = `
                    <div class="card-face card-front">
                        <div class="container">
                            <h1 class="title is-1 position dynamic-width"></h1>
                            <h2 class="subtitle employer"></h2>
                        </div>
                    </div>
                    <div class="card-face card-back" >
					  	<button class="expand button is-hidden" aria-label="Expand"></button>
                        <div class="container">
                            <h1 class="title name dynamic-width"></h1>
                        </div>
                    </div>
                    `;
			// declare position and employer
			card.querySelector('.position').textContent = data.positions[i].position;
			card.querySelector('.employer').textContent = data.positions[i].employer;
			// add event listeners
			card.addEventListener('click', () => {
				if (clickedIsInactivePosition(card)) {
					// if card is (inactive) position
					inactivePositionCardClicked(card);
				} else if (clickedIsActiveProject(card)) {
					// if card is active project (already clicked)
					// console.log('active project card clicked');
				} else if (clickedIsInactiveProject(card)) {
					// if card is project (with back facing)
					inactiveProjectCardClicked(card);
				} else if (clickedIsActive(card)) {
					// if card is active
					activePositionCardClicked(card);
				} else {
					console.log('clicked card with unknown state');
				}
				checkScrolls();
			});
			document.getElementById('cards').appendChild(card); //add card to #cards
			requestAnimationFrame(() => resizeCard(card)); //wait one frame and resize card
		}
	}

	function inactivePositionCardClicked(card) {
		card.classList.add('active');
		card.classList.remove('back');
		card.classList.remove('project');
		sidebar.classList.remove('hidden');
		ui_button.classList.remove('hidden');
		top.classList.add('hidden');
		bottom.classList.remove('hidden');
		fadeOverlayRight.classList.add('top');
		fadeOverlayLeft.classList.add('top');
		reorderCards(getPositionFrom(card));
		fetchPositionsAndAssignProjects(getPositionFrom(card));
		identifyPositionSkills(getPositionFrom(card));
		updateBottomWithPosition(data, card);
		resetActiveTagsToLight();
		setTagsToLightFromPositionAndProjects(getPositionFrom(card));
		setTagsToActiveFromPosition(getPositionFrom(card));
	}

	function activePositionCardClicked(card) {
		handleExistingCarousel(carouselTimer);
		document.querySelectorAll('.flip-card').forEach((_card) => {
			_card.classList.remove('current_project');
			_card.querySelector('.card-back').classList.add('card-overlay');
		});
		updateBottomWithPosition(data, card);
		resetActiveTagsToLight();
		setTagsToActiveFromPosition(getPositionFrom(card));
		identifyPositionSkills(getPositionFrom(card));
		scrollActivePositionCardIntoView();
	}

	function inactiveProjectCardClicked(card) {
		handleExistingCarousel(carouselTimer);
		identifyPositionSkills(getPositionFrom(card)); //? testing
		updateBottomWithProject(getProjectFrom(card));
		resetActiveTagsToLight();
		setTagsToActiveFromProject(getProjectFrom(card));
		scrollCurrentProjectCardIntoView();
		document.querySelectorAll('.flip-card').forEach((_card) => {
			_card.classList.remove('current_project');
			_card.querySelector('.card-back').classList.add('card-overlay');
			_card.querySelector('.card-back').querySelector('.expand').classList.add('is-hidden');
		});
		card.classList.add('current_project');
		card.querySelector('.card-back').querySelector('.expand').classList.remove('is-hidden');
		const activeCard = document.querySelector(`.current_project .card-back`);
		if (cardMissingBackgroundImage(activeCard)) return;
		carouselTimer = initializeCarousel(activeCard, card);
		initializeModal(card);
	}

	function initializeModal(card) {
		const projectsList = data.positions.map((position) => position.projects).flat();
		let project = projectsList.find((project) => project.name === getProjectFrom(card));

		const activeCard = document.querySelector(`.current_project .card-back`);
		if (!activeCard.getAttribute('data-modalIndex')) {
			// console.log('initializeCarousel: modalIndex 0');
			activeCard.setAttribute('data-modalIndex', 0);
		}

		const mediaUrlsAndDescriptions = project.media
			.filter(
				(item) =>
					(item?.image?.full && item?.image?.description) || // Filter for items with full and description in image objects
					(item?.youtube?.url && item?.youtube?.description) // Filter for items with url and description in youtube objects
			)
			.map((item) => ({
				url: item.image?.full || item.youtube?.url, // Get full-size image URL or YouTube URL
				description: item.image?.description || item.youtube?.description, // Get image or YouTube description
				title: item.image?.title || item.youtube?.title,
			}));

		// console.log(mediaUrlsAndDescriptions);

		const modalImagesDiv = document.querySelector('.modal-images');
		// remove child elements from modalImagesDiv
		while (modalImagesDiv.firstChild) {
			modalImagesDiv.removeChild(modalImagesDiv.firstChild);
		}

		mediaUrlsAndDescriptions.forEach((item, index) => {
			const modalImageDiv = document.createElement('div');
			modalImageDiv.innerHTML = `
			<div class="card">
					<div class="card-image">
						<figure class="image"></figure>
					</div>
					<div class="card-content">
						<p class="image-title title"></p>
						<div class="content image-description"></div>
					</div>
				</div>
			</div>`;
			modalImageDiv.className = 'column image modal-image';
			if (item.url.includes('youtube')) {
				const modalImage = document.createElement('iframe');
				modalImage.width = '640';
				modalImage.height = '360';
				modalImage.title = 'YouTube video player';
				modalImage.frameBorder = '0';
				modalImage.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
				modalImage.referrerPolicy = 'strict-origin-when-cross-origin';
				modalImage.allowFullscreen = true;
				modalImage.src = item.url;
				modalImageDiv.querySelector('.card .card-image .image').appendChild(modalImage);
				modalImageDiv.querySelector('.card .card-image .image').classList.add('is-16by9');
			} else {
				const modalImage = document.createElement('img');
				modalImage.src = item.url;
				modalImageDiv.querySelector('.card .card-image .image').appendChild(modalImage);
			}
			// Set the description text (if applicable)
			if (modalImageDiv.querySelector('.card .card-content .content')) {
				modalImageDiv.querySelector('.card .card-content .image-description').textContent = item.description;
				modalImageDiv.querySelector('.card .card-content .image-title').textContent = item.title;
			}
			modalImagesDiv.appendChild(modalImageDiv);
		});

		// modalImagesDiv.addEventListener('scroll', () => {
		// 	const imageWidth = modalImagesDiv.clientWidth;
		// 	const scrollLeft = modalImagesDiv.scrollLeft;

		// 	// Calculate the active index based on the scroll position
		// 	const activeIndex = Math.round(scrollLeft / imageWidth);
		// 	updateModalPaginationDots(activeIndex);
		// });

		modalImagesDiv.addEventListener('scroll', () => {
			try {
				clearTimeout(debounceTimeout);
			} catch (error) {}
			debounceTimeout = setTimeout(() => {
				const imageWidth = modalImagesDiv.clientWidth;
				const scrollLeft = modalImagesDiv.scrollLeft;

				// Calculate the active index based on the scroll position
				const activeIndex = Math.round(scrollLeft / imageWidth);
				updateModalPaginationDots(activeIndex);
			}, 100); // Adjust debounce delay as needed
		});
	}

	function initializeCarousel(activeCard, card) {
		let previouslyActive = false;
		activeCard.classList.remove('card-overlay');
		if (!activeCard.getAttribute('data-carouselIndex')) {
			// console.log('initializeCarousel: carouselIndex 0');
			activeCard.setAttribute('data-carouselIndex', 0);
		} else {
			previouslyActive = true;
		}
		let carouselIndex = parseInt(activeCard.getAttribute('data-carouselIndex'));

		const projectsList = data.positions.map((position) => position.projects).flat();
		let project = projectsList.find((project) => project.name === getProjectFrom(card));

		const imageUrls = project.media.filter((item) => item?.image?.full).map((item) => item.image.full);
		// console.log(imageUrls);
		const mediaUrlsAndDescriptions = project.media
			.filter(
				(item) =>
					(item?.image?.full && item?.image?.description) || // Filter for items with full and description in image objects
					(item?.youtube?.url && item?.youtube?.description) // Filter for items with url and description in youtube objects
			)
			.map((item) => ({
				url: item.image?.full || item.youtube?.url, // Get full-size image URL or YouTube URL
				description: item.image?.description || item.youtube?.description, // Get image or YouTube description
			}));
		activeCard.id = 'carousel';
		const carouselDiv = document.getElementById('carousel');
		const modalDiv = document.querySelector('.modal-background');
		// add class "js-modal-trigger" to carouselDiv
		// carouselDiv.classList.add('js-modal-trigger');
		let expandButton = carouselDiv.querySelector('.expand');
		expandButton.classList.add('js-modal-trigger');
		// add data-target "modal-js-example" to carouselDiv
		expandButton.dataset.target = 'media-carousel-modal';
		initializeBulmaModalController();

		// Create pagination dots container
		const paginationDotsContainer = document.createElement('div');
		const paginationDotsModalContainer = document.createElement('div');
		paginationDotsContainer.id = 'pagination-dots';
		paginationDotsModalContainer.id = 'pagination-dots-modal';
		paginationDotsContainer.className = 'pagination-dots';
		paginationDotsModalContainer.className = 'pagination-dots';
		carouselDiv.appendChild(paginationDotsContainer);
		modalDiv.appendChild(paginationDotsModalContainer);

		// Create pagination dots
		function createPaginationDots() {
			imageUrls.forEach((_, index) => {
				const dot = document.createElement('div');
				dot.classList.add('dot');
				// dot.addEventListener('click', () => goToImage(index));
				paginationDotsContainer.appendChild(dot);
			});
			mediaUrlsAndDescriptions.forEach((_, index) => {
				const dot_modal = document.createElement('div');
				dot_modal.classList.add('dot');
				dot_modal.addEventListener('click', () => {
					activeCard.setAttribute('data-modalIndex', index);
					document.querySelector('.modal-images').style.transform = `translateX(-${index * 100}%)`;
				});
				paginationDotsModalContainer.appendChild(dot_modal);
			});
		}

		// Update pagination dots
		function updatePaginationDots() {
			const dots = paginationDotsContainer.children;
			for (let i = 0; i < dots.length; i++) {
				dots[i].classList.toggle('is-active', i === carouselIndex);
			}
			// const dots_modal = paginationDotsModalContainer.children;
			// for (let i = 0; i < dots.length; i++) {
			// 	dots_modal[i].classList.toggle('is-active', i === carouselIndex);
			// 	// console.log(dots_modal[i].classList);
			// }
		}

		// Go to specific image
		function goToImage(index) {
			carouselIndex = index;
			updateBackgroundImage();
		}

		function modalNotVisible() {
			return !document.querySelector('#media-carousel-modal').classList.contains('is-active');
		}

		// Update background image
		function updateBackgroundImage() {
			if (modalNotVisible() && pageVisible) {
				carouselIndex = incrementIndex(carouselIndex, imageUrls);
				activeCard.setAttribute('data-carouselIndex', carouselIndex);
				carouselDiv.style.backgroundImage = `url(${imageUrls[carouselIndex]})`;
				updatePaginationDots();
			}
		}

		// Initialize pagination
		createPaginationDots();
		if (!previouslyActive) updateBackgroundImage(); //prevents short-showing of 1st image

		// Change image every 3 seconds
		carouselTimer = setInterval(updateBackgroundImage, slideshowImageInterval);
		return carouselTimer;
	}

	function handleExistingCarousel(carouselTimer) {
		// console.log('handleExistingCarousel', carouselTimer);
		if (!carouselTimer) return;
		if (document.querySelector('#carousel')) {
			// console.log('resetting carousel');
			document.querySelector('#carousel').classList.remove('js-modal-trigger');
			document.querySelector('#carousel').dataset.target = '';
			document.querySelector('#carousel').id = '';
		}
		if (carouselTimer) clearInterval(carouselTimer);
		// if (document.querySelector('#pagination-dots')) document.querySelector('#pagination-dots').remove();
		removePagionationDots();
		// if (document.querySelector('#pagination-dots-modal')) document.querySelector('#pagination-dots-modal').remove();
	}

	function updateModalPaginationDots(modalIndex) {
		const paginationDotsModalContainer = document.getElementById('pagination-dots-modal');
		const dots_modal = paginationDotsModalContainer.children;
		for (let i = 0; i < dots_modal.length; i++) {
			dots_modal[i].classList.toggle('is-active', i === modalIndex);
		}
	}

	function scrollToImage(index) {
		const modalImagesContainer = document.querySelector('.modal-images');
		const activeCard = document.querySelector(`.current_project .card-back`);
		// let imageUrls = document.querySelectorAll('.modal-image');
		// let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));

		const imageWidth = modalImagesContainer.clientWidth; // Width of the container (one image)
		modalImagesContainer.scrollLeft = index * imageWidth; // Scroll to the correct position
		// modalIndex = index;
		activeCard.setAttribute('data-modalIndex', index);
		updateModalPaginationDots(index);
	}

	function incrementSlide() {
		// const modalImagesContainer = document.querySelector('.modal-images');
		const activeCard = document.querySelector(`.current_project .card-back`);
		// let imageUrls = document.querySelectorAll('.modal-image');
		let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));
		const totalImages = document.querySelectorAll('.modal-image').length;
		modalIndex = (modalIndex + 1) % totalImages;
		scrollToImage(modalIndex);
	}

	function decrementSlide() {
		const activeCard = document.querySelector(`.current_project .card-back`);
		let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));
		const totalImages = document.querySelectorAll('.modal-image').length;
		modalIndex = (modalIndex - 1 + totalImages) % totalImages;
		scrollToImage(modalIndex);
	}

	function incrementModal() {
		const activeCard = document.querySelector(`.current_project .card-back`);
		let imageUrls = document.querySelectorAll('.modal-image');
		let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));

		modalIndex = incrementIndex(modalIndex, imageUrls);
		activeCard.setAttribute('data-modalIndex', modalIndex);
		// console.log('incrementModal:modalIndex', modalIndex);
		document.querySelector('.modal-images').style.transform = `translateX(-${modalIndex * 100}%)`;

		updateModalPaginationDots(modalIndex);
	}

	function decrementModal() {
		const activeCard = document.querySelector(`.current_project .card-back`);
		let imageUrls = document.querySelectorAll('.modal-image');
		let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));

		// decrement modalIndex by looping back to last image when going below zero
		modalIndex = decrementIndex(modalIndex, imageUrls);
		activeCard.setAttribute('data-modalIndex', modalIndex);
		// console.log('decrementModal:modalIndex', modalIndex);
		document.querySelector('.modal-images').style.transform = `translateX(-${modalIndex * 100}%)`;

		updateModalPaginationDots(modalIndex);
	}

	function openModal($el) {
		const activeCard = document.querySelector(`.current_project .card-back`);
		const modalImages = document.querySelector('.modal-images');
		// Retrieve the externally defined modalIndex
		let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex')) || 0;
		// console.log('openModal: modalIndex', modalIndex);
		// Set initial transform based on the current carouselIndex
		// modalImages.style.transform = `translateX(-${modalIndex * 100}%)`;
		const modalImagesContainer = document.querySelector('.modal-images');
		// let imageUrls = document.querySelectorAll('.modal-image');
		// let modalIndex = parseInt(activeCard.getAttribute('data-modalIndex'));

		const imageWidth = modalImagesContainer.clientWidth; // Width of the container (one image)
		modalImagesContainer.scrollLeft = modalIndex * imageWidth; // Scroll to the correct position

		$el.classList.add('is-active');
		updateModalPaginationDots(modalIndex);
	}

	function closeModal($el) {
		$el.classList.remove('is-active');
	}

	function closeAllModals() {
		(document.querySelectorAll('.modal') || []).forEach(($modal) => {
			closeModal($modal);
		});
	}

	function decrementIndex(carouselIndex, imageUrls) {
		carouselIndex = (carouselIndex + imageUrls.length - 1) % imageUrls.length;
		return carouselIndex;
	}

	function incrementIndex(carouselIndex, imageUrls) {
		carouselIndex = (carouselIndex + 1) % imageUrls.length;
		return carouselIndex;
	}

	function isModalOpen() {
		return document.querySelector('.modal.is-active') ? true : false;
	}
	function initializeBulmaModalController() {
		// Add a click event on buttons to open a specific modal
		(document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
			const modal = $trigger.dataset.target;
			const $target = document.getElementById(modal);

			$trigger.addEventListener('click', () => {
				if ($trigger.classList.contains('js-modal-trigger')) openModal($target);
			});
		});

		// Add a click event on various child elements to close the parent modal
		(
			document.querySelectorAll(
				'.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button'
			) || []
		).forEach(($close) => {
			const $target = $close.closest('.modal');

			$close.addEventListener('click', () => {
				closeModal($target);
			});
		});

		// Add a keyboard event to close all modals
		document.addEventListener('keydown', (event) => {
			if (!keyPressed) {
				// prevents horizontal scrolling of other elements outside modal
				if (isModalOpen) {
					if (['ArrowRight', 'ArrowLeft'].includes(event.key)) {
						event.preventDefault();
					}
				}
				if (event.key === 'ArrowRight') {
					incrementSlide();
					keyPressed = true;
				} else if (event.key === 'ArrowLeft') {
					decrementSlide();
					keyPressed = true;
				} else if (event.key === 'Escape') {
					closeAllModals();
					keyPressed = true;
				}
			}
		});

		document.addEventListener('keyup', (event) => {
			if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Escape') {
				keyPressed = false; // Reset flag when any key is released
			}
		});
	}

	function setBackgroundImageOf(card) {
		const projectsList = data.positions.map((position) => position.projects).flat();
		let project = projectsList.find((project) => project.name === card.querySelector('.name').textContent);
		if (!project.media) return;
		if (project.media.length === 0) return;
		if (project.media.some((item) => item.image && 'background' in item.image)) {
			card.querySelector('.card-back').style.backgroundImage = `url(${
				project.media.find((item) => item.image && 'background' in item.image)?.image?.full
			})`; //TODO change this to thumbnail image resolution
		}
	}

	function cardMissingBackgroundImage(card) {
		const projectsList = data.positions.map((position) => position.projects).flat();
		let project = projectsList.find((project) => project.name === card.querySelector('.name').textContent);
		if (project.media.find((item) => item.image && 'background' in item.image)?.image?.full) {
			return false;
		}
		console.error(card.querySelector('.name').textContent + " doesn't have background image");
		return true;
	}

	function projectNotMissingBackgroundImage(projectName) {
		// console.log(projectName);
		const projectsList = data.positions.map((position) => position.projects).flat();
		let _project = projectsList.find((project) => project.name === projectName);
		// console.log(_project);
		if (_project.media)
			if (_project.media.filter((item) => 'image' in item).length >= 1)
				if (!_project.media.some((item) => 'background' in item)) return true;
		return false;
	}

	function resizeCard(card) {
		const dynamicWidthElement = card.querySelector('.dynamic-width');
		const textContent = dynamicWidthElement.textContent.split(' ');

		let longestWord = '';

		textContent.forEach((word) => {
			if (word.length > longestWord.length) {
				longestWord = word;
			}
		});

		const measureElement = document.createElement('span');
		measureElement.className = 'hidden-measure';
		measureElement.textContent = longestWord;

		// Copy font styles from the dynamicWidthElement to the measureElement
		const computedStyles = window.getComputedStyle(dynamicWidthElement);
		measureElement.style.font = computedStyles.font;
		measureElement.style.fontSize = computedStyles.fontSize;
		measureElement.style.fontWeight = computedStyles.fontWeight;
		measureElement.style.fontFamily = computedStyles.fontFamily;
		measureElement.style.letterSpacing = computedStyles.letterSpacing;
		measureElement.style.textTransform = computedStyles.textTransform;

		document.body.appendChild(measureElement);

		const longestWordWidth = measureElement.offsetWidth;
		// dynamicWidthElement.style.width = longestWordWidth + 'px';

		card.style.width = 'calc(' + longestWordWidth + 'px + 4px + var(--bulma-block-spacing) * 4 * 2)';
		// console.log(longestWord, longestWordWidth, card.style.width);
		document.body.removeChild(measureElement);
	}

	// determines wether active system color scheme is light or dark
	function checkSystemColorScheme(moonIcon, sunIcon, color_scheme) {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme == 'light') {
			// console.log('stored theme is light');
			html.setAttribute('data-theme', 'light');
			moonIcon.classList.remove('active');
			sunIcon.classList.add('active');
			color_scheme = 'light';
		} else if (storedTheme == 'dark') {
			// console.log('stored theme is dark');
			html.setAttribute('data-theme', 'dark');
			moonIcon.classList.add('active');
			sunIcon.classList.remove('active');
			color_scheme = 'dark';
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			// console.log('The system is in dark mode');
			moonIcon.classList.add('active');
			sunIcon.classList.remove('active');
			color_scheme = 'dark';
		} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
			// console.log('The system is in light mode');
			moonIcon.classList.remove('active');
			sunIcon.classList.add('active');
			color_scheme = 'light';
		}
		return color_scheme;
	}
	// makes sidebar hide/unhide with hamburger
	filter.addEventListener('click', () => {
		sidebar.classList.toggle('hidden');
		// changeFilterIcon();
		checkScrolls();
	});

	function decodeText(base64EncodedPhrase, mode, elementID, hrefElementID) {
		const getRandomChar = (c) => {
			const n = chars.length;
			const x = chars[Math.round(Math.random() * n * 10) % n];
			return x === c ? getRandomChar(c) : x;
		};

		const getRandomName = (name) => {
			let str = '';
			for (let i = 0; i < name.length; ++i) {
				const c = name.charAt(i);
				str = str + (c === ' ' ? ' ' : getRandomChar(c));
			}
			return str;
		};

		const h = document.getElementById(elementID);
		const a = document.getElementById(hrefElementID);

		let currentIndex = 0;
		let intervalId = null;

		const handleDecrypt = (originalName) => {
			intervalId = setInterval(() => {
				if (currentIndex > originalName.length) {
					clearInterval(intervalId);
					intervalId = null;
					return;
				}
				const c = originalName.charAt(currentIndex);
				const n = currentIndex + 1;
				const decoded = originalName.slice(0, n);
				const encoded = getRandomName(originalName.slice(n));
				const completeText = decoded + encoded;
				h.innerText = completeText;
				if (mode === 'e') a.href = decodeBase64('bWFpbHRvOg==') + decoded;
				else if (mode === 'p') a.href = decodeBase64('dGVsOisx') + decoded.replace(/-/g, '');
				else if (mode === 'l') a.href = decodeBase64('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luLw==') + decoded;
				else if (mode === 'g') a.href = decodeBase64('aHR0cHM6Ly93d3cuZ2l0aHViLmNvbS8=') + decoded;
				currentIndex++;
			}, 60);
		};

		//. this only works on ASCII
		const decodeBase64 = (base64) => {
			return atob(base64);
		};

		//. this works on UTF-8
		// const decodeBase64 = (base64) => {
		// 	// Decode base64 to a binary string
		// 	let binaryString = atob(base64);

		// 	// Convert binary string to an array of char codes
		// 	let charCodes = new Uint8Array(binaryString.length);
		// 	for (let i = 0; i < binaryString.length; i++) {
		// 		charCodes[i] = binaryString.charCodeAt(i);
		// 	}

		// 	// Decode UTF-8 encoded array back into a proper string
		// 	let decodedString = new TextDecoder('utf-8').decode(charCodes);

		// 	return decodedString;
		// };

		// Start decrypting the single phrase
		const originalName = decodeBase64(base64EncodedPhrase);
		h.innerText = getRandomName(originalName);
		if (mode === 'e') a.href = decodeBase64('bWFpbHRvOg==');
		else if (mode === 'p') a.href = decodeBase64('dGVsOisx');
		else if (mode === 'l') a.href = decodeBase64('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luLw==');
		else if (mode === 'g') a.href = decodeBase64('aHR0cHM6Ly93d3cuZ2l0aHViLmNvbS8=');
		handleDecrypt(originalName);
	}

	function emptyContactInfo(elementID, HrefElementID) {
		document.getElementById(elementID).innerText = '';
		document.getElementById(HrefElementID).href = '';
	}

	contact.addEventListener('click', () => {
		const contact_dropdown = document.getElementById('contact_dropdown');
		contact_dropdown.classList.toggle('is-active');
		if (contact_dropdown.classList.contains('is-active')) {
			decodeText(sserddaLiamE, 'e', 'sserddaLiamE', 'ferHsserddaLiamE');
			decodeText(rebmuNenohP, 'p', 'rebmuNenohP', 'ferHrebmuNenohP');
			decodeText(xiffuSetiSlanoisseforP, 'l', 'nIdekniL', 'ferHnIdekniL');
			decodeText(xiffuSetiSlanoisseforP, 'g', 'buHtiG', 'ferHbuHtiG');
		} else {
			emptyContactInfo('sserddaLiamE', 'ferHsserddaLiamE');
			emptyContactInfo('rebmuNenohP', 'ferHrebmuNenohP');
			emptyContactInfo('nIdekniL', 'ferHnIdekniL');
			emptyContactInfo('buHtiG', 'ferHbuHtiG');
		}
	});

	resume.addEventListener('click', () => {
		const resume_dropdown = document.getElementById('resume_dropdown');
		resume_dropdown.classList.toggle('is-active');
	});

	// makes ui_button have same effect as clicking active card
	ui_button.addEventListener('click', () => {
		returnToMainPage();
	});
	// toggles light/dark mode
	dark_toggle.addEventListener('click', () => {
		if (color_scheme === 'dark') {
			html.setAttribute('data-theme', 'light');
			color_scheme = 'light';
		} else {
			html.setAttribute('data-theme', 'dark');
			color_scheme = 'dark';
		}
		localStorage.setItem('theme', color_scheme);
		moonIcon.classList.toggle('active');
		sunIcon.classList.toggle('active');
	});

	if (document.getElementById('bg_toggle')) {
		document.getElementById('bg_toggle').addEventListener('click', () => {
			// toggle display (from none to block) of bg_toggle
			if (document.getElementById('animated_bg').style.display == 'none') {
				document.getElementById('animated_bg').style.display = 'block';
				document.getElementById('bg_toggle').classList.add('is-primary');
			} else {
				document.getElementById('animated_bg').style.display = 'none';
				document.getElementById('bg_toggle').classList.remove('is-primary');
			}
		});
	}

	async function populateDataWithJSON(json_file) {
		const response = await fetch(json_file);
		const _data = await response.json();
		data = _data;
		// console.log(_data);
	}

	function categorizeSkills(skills) {
		// Output lists for each category
		const languages = [];
		const technologies = [];
		const software = [];

		// Categorize items based on the lexicon
		skills.forEach((item) => {
			if (lexicon.languages.includes(item)) {
				languages.push(item);
			} else if (lexicon.technologies.includes(item)) {
				technologies.push(item);
			} else if (lexicon.software.includes(item)) {
				software.push(item);
			} else {
				console.error(item, 'not present in skill lexicon');
			}
		});

		// Return the three categorized lists
		return [languages, technologies, software];
	}

	function populateSidebar() {
		let all_skills = getAllTags();
		// console.log('all_skills', all_skills);

		const [languages, technology, software] = categorizeSkills(all_skills);

		languages.forEach(function (language) {
			if (language !== undefined) {
				var languageTag = document.createElement('span');
				languageTag.className = 'tag';
				languageTag.textContent = language;
				sidebar_languages.appendChild(languageTag);
			}
		});

		technology.forEach(function (hardware) {
			if (hardware !== undefined) {
				var hardwareTag = document.createElement('span');
				hardwareTag.className = 'tag';
				hardwareTag.textContent = hardware;
				sidebar_hw.appendChild(hardwareTag);
			}
		});

		software.forEach(function (software) {
			if (software !== undefined) {
				var softwareTag = document.createElement('span');
				softwareTag.className = 'tag';
				softwareTag.textContent = software;
				sidebar_sw.appendChild(softwareTag);
			}
		});
	}

	// checks scroll position to control fade overlay
	function checkRightScroll() {
		if (Math.round(scrollable.scrollWidth - scrollable.scrollLeft) === scrollable.clientWidth) {
			fadeOverlayRight.classList.add('hidden');
		} else {
			fadeOverlayRight.classList.remove('hidden');
		}
	}
	// checks scroll position to control fade overlay for left side
	function checkLeftScroll() {
		if (scrollable.scrollLeft === 0) {
			fadeOverlayLeft.classList.add('hidden');
		} else {
			fadeOverlayLeft.classList.remove('hidden');
		}
	}

	function checkScrolls() {
		checkRightScroll();
		checkLeftScroll();
	}
	// updates filter icon status based off of statusbar visibility
	function changeFilterIcon() {
		if (sidebar.classList.contains('hidden')) {
			filterIcon.classList.add('active');
			collapseIcon.classList.remove('active');
		} else {
			filterIcon.classList.remove('active');
			collapseIcon.classList.add('active');
		}
	}
	// debounces scroll position for improved performance
	function debounce(func, wait, immediate) {
		let timeout;
		return function () {
			const context = this,
				args = arguments;
			const later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	function reorderCards(firstCard) {
		const cards = getUpdatedCardsElement();
		// Find the .flip-card within cards that has a child element with class .position where textContent == firstCard
		const childToMove = Array.from(cards.children).find((card) => getPositionFrom(card).trim() === firstCard);
		if (childToMove) {
			// Remove the element from its current position
			cards.removeChild(childToMove);
			// Append the element to the new position (at the beginning)
			cards.insertBefore(childToMove, cards.firstChild);
		}
	}
	// resets cards order to initial JSON order
	function resetCardOrder() {
		// Get cards container
		const cards = getUpdatedCardsElement();
		// Map positions to card elements
		data.positions.forEach((pos, index) => {
			// Find the corresponding card element
			const card = Array.from(cards.children).find((card) => getPositionFrom(card).trim() === pos.position);
			if (card) {
				// Remove the card from its current position
				cards.removeChild(card);
				// Insert the card at the correct position according to JSON order
				cards.insertBefore(card, cards.children[index]);
			}
		});
	}

	function scrollCurrentProjectCardIntoView() {
		const activeCard = scrollable.querySelector('.current_project');

		if (activeCard) {
			const activeCardRect = activeCard.getBoundingClientRect();
			const cardsRect = scrollable.getBoundingClientRect();

			// Check if the active div is partially or fully outside the viewport within the parent (considering horizontal scroll)
			const isPartiallyVisible = activeCardRect.left < cardsRect.left || activeCardRect.right > cardsRect.right;

			if (isPartiallyVisible) {
				// Calculate the scroll position needed to bring the active div fully into view
				const scrollLeft = activeCardRect.left - cardsRect.left;
				scrollable.scrollLeft = scrollLeft;
			}
		}
	}

	function scrollActivePositionCardIntoView() {
		const activeCard = scrollable.querySelector('.active');
		if (activeCard) {
			const activeCardRect = activeCard.getBoundingClientRect();
			const cardsRect = scrollable.getBoundingClientRect();
			// Check if the active div is partially or fully outside the viewport within the parent (considering horizontal scroll)
			const isPartiallyVisible = activeCardRect.left < cardsRect.left || activeCardRect.right > cardsRect.right;

			if (isPartiallyVisible) {
				// Calculate the scroll position needed to bring the active div fully into view
				const scrollLeft = activeCardRect.left - cardsRect.left;
				scrollable.scrollLeft = scrollLeft;
			}
		}
	}

	function resetSkills() {
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			tag.classList.remove('is-primary', 'has-background-primary-soft', 'has-text-primary-soft-invert');
		});
	}

	// gets projects from active position
	function fetchPositionsAndAssignProjects(positionTitle) {
		const positions = data.positions;
		const position = positions.find((p) => p.position === positionTitle);
		const projects = position.projects;

		if (!(position && projects)) return console.error("position and projects can't both be empty");

		getNonActiveCards().forEach((card, index) => {
			if (projects[index]) {
				// Check if there is a corresponding project
				const project = projects[index];
				var projectName = card.querySelector('.name');
				if (projectName) {
					projectName.textContent = project.name;
				}
				var projectsummary = card.querySelector('.summary');
				if (projectsummary) {
					projectsummary.textContent = project.summary;
				}
				setBackgroundImageOf(card);
				card.querySelector('.card-back').classList.add('card-overlay');
				var projectTechnologies = card.querySelector('.languages');
				if (projectTechnologies) {
					projectTechnologies.innerHTML = '';
					project.languages.forEach((technology) => {
						const technologyTag = document.createElement('span');
						technologyTag.className = 'tag';
						technologyTag.textContent = technology;
						projectTechnologies.appendChild(technologyTag);
					});
				}
				card.classList.add('back');
				card.classList.add('project');
			}
		});
	}

	function identifyPositionSkills(position) {
		const position_data = data.positions.find((p) => p.position === position);

		if (!position_data || !position_data.projects) {
			console.error('No position data or projects found');
			return;
		}
		const position_tags = getTagsFromPositionAndProjects(position);
		// add class.has-background-primary-soft has-text-primary-soft-invert to all tags in sidebar
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			if (position_tags.includes(tag.innerText)) {
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted (softly): ', tag.innerText);
			}
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			if (position_tags.includes(tag.innerText)) {
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted (softly): ', tag.innerText);
			}
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			if (position_tags.includes(tag.innerText)) {
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted (softly): ', tag.innerText);
			}
		});
	}

	function updateBottomWithProject(projectTitle) {
		// iterate through data.positions and create a list of all position.projects
		const projectsList = data.positions.map((position) => position.projects).flat();
		// console.log(projectsList);
		if (!projectsList) return;
		if (!projectsList) console.error('projects not found for position "', position.position, '"');

		const project_data = projectsList.find((project_data) => project_data.name === projectTitle);
		if (!project_data) console.error('data not found for project "', projectTitle, '"');
		// add html to bottom
		bottom.innerHTML = `
            <div class="container scrollable scrollbar">
				<h2 class=" is-narrow name"></h2>
				<div class="">
                    <div class="tags project_skills"></div>
                </div>
			<div class="description"></div>
            </div>
            `;

		// add title
		var projectName = bottom.querySelector('.name');
		if (!projectName) console.error('project has no name');
		if (project_data.long_name) {
			projectName.textContent = project_data.long_name;
		} else {
			projectName.textContent = project_data.name;
		}
		// add description
		var projectdescription = bottom.querySelector('.description');
		if (!projectdescription) console.error('project has no description');
		projectdescription.innerHTML = project_data.description;
		// add tags
		var projectSkills = bottom.querySelector('.project_skills');
		projectSkills.innerHTML = '';
		if (project_data.project_tags) {
			project_data.project_tags.forEach((tag, index) => {
				const tags = document.createElement('span');
				tags.className = 'tag';
				tags.textContent = tag;
				setTimeout(() => {
					projectSkills.appendChild(tags);
				}, index * tag_animation_delay); // 100ms delay between each tag
			});
		}
	}

	function updateBottomWithPosition(data, card) {
		bottom.innerHTML = `
                  <div class="container scrollable scrollbar">
						<h2 class=" is-narrow">Roles</h2>
							<div class="">
								<div class="tags role_tags"></div>
							</div>
                    <ul class="roles"></ul>
						<h2 class=" is-narrow">Achievements</h2>
							<div class="">
								<div class="tags achievement_tags"></div>
							</div>
					<ul class="achievements"></ul>
                  </div>
				  <div class="gradient gradient-top"></div>
  				  <div class="gradient gradient-bottom"></div>
                `;
		data.positions.forEach((position) => {
			if (position.position === getPositionFrom(card)) {
				var role_tags = position.role_tags;
				var achievement_tags = position.achievement_tags;

				// console.log(role_tags);
				role_tags.forEach((skill, index) => {
					const tag = document.createElement('span');
					tag.classList.add('tag');
					tag.textContent = skill;
					setTimeout(() => {
						if (bottom.querySelector('.role_tags')) bottom.querySelector('.role_tags').appendChild(tag);
					}, index * tag_animation_delay); // 100ms delay between each tag
				});

				// console.log(achievement_tags);
				achievement_tags.forEach((skill, index) => {
					const tag = document.createElement('span');
					tag.classList.add('tag');
					tag.textContent = skill;
					setTimeout(() => {
						if (bottom.querySelector('.achievement_tags')) bottom.querySelector('.achievement_tags').appendChild(tag);
					}, index * tag_animation_delay); // 100ms delay between each tag
				});
				// add roles from current position to .roles
				position.roles.forEach((role, index) => {
					const li = document.createElement('li');
					li.textContent = role;
					bottom.querySelector('.roles').appendChild(li);
				});
				// add achievements from current position to .achievements
				position.achievements.forEach((achievement, index) => {
					const li = document.createElement('li');
					li.textContent = achievement;
					bottom.querySelector('.achievements').appendChild(li);
				});
			}
		});

		getNonActiveCards().forEach((card, index) => {
			card.querySelector('.card-back').classList.add('card-overlay');
		});
	}

	function getTagsFromPositionAndProjects(position) {
		const position_data = data.positions.find((p) => p.position === position);

		if (!position_data) {
			console.error('No position data or projects found');
			return;
		}

		var project_tags = position_data.projects
			.reduce(function (acc, project) {
				return acc.concat(project.project_tags || []);
			}, [])
			.filter(function (tag, index, self) {
				return self.indexOf(tag) === index;
			});

		// console.log('project_tags', project_tags);

		const all_tags = [].concat(position_data.role_tags || [], position_data.achievement_tags || [], project_tags || []);

		// console.log('all_tags', all_tags);

		return all_tags;
	}

	function getTagsFromPosition(position) {
		const position_data = data.positions.find((p) => p.position === position);

		if (!position_data) {
			console.error('No position data or projects found');
			return;
		}

		// var project_tags = position_data.projects
		// 	.reduce(function (acc, project) {
		// 		return acc.concat(project.project_tags || []);
		// 	}, [])
		// 	.filter(function (tag, index, self) {
		// 		return self.indexOf(tag) === index;
		// 	});

		// console.log('project_tags', project_tags);

		const all_tags = [].concat(position_data.role_tags || [], position_data.achievement_tags || []);

		// console.log('all_tags', all_tags);

		return all_tags;
	}

	function getTagsFromProject(project, position) {
		// console.log(position, project);
		let project_title = '';
		if (typeof project === 'string') {
			project_title = project;
		} else {
			project_title = project.querySelector('.name').textContent;
		}
		let project_data = [];
		let position_data = [];

		if (!position) {
			const projectsList = data.positions.map((position) => position.projects).flat();
			// console.log(projectsList);
			project_data = projectsList.find((project_data) => project_data.name === project_title);
			// console.log(project_data);
		} else {
			position_data = data.positions.find((p) => p.position === position);
			project_data = position_data.projects.find((project_data) => project_data.name === project_title);
		}
		var project_tags = project_data.project_tags || [];
		// console.log('project_tags', project_tags);
		return project_tags;
	}

	function getAllTags() {
		let all_tags = [];
		// iterate through each position in data.positions
		data.positions.forEach((position) => {
			all_tags = all_tags.concat(position.role_tags || [], position.achievement_tags || []);
			// iterate through each project in position.projects
			position.projects.forEach((project) => {
				all_tags = all_tags.concat(project.project_tags || []);
			});
		});
		// remove redundant values
		return Array.from(new Set(all_tags));
	}

	function getEmployerFrom(card) {
		return card.querySelector('.employer').textContent;
	}

	function getPositionFrom(card) {
		return card.querySelector('.position').textContent;
	}

	function getProjectFrom(card) {
		if (clickedIsInactiveProject(card)) {
			return card.querySelector('.name').textContent;
		}
		console.error('card', card.querySelector('.name').textContent, 'is not project');
	}

	function clickedIsInactive(card) {
		return !card.classList.contains('active');
	}

	function clickedIsActive(card) {
		return card.classList.contains('active');
	}

	function clickedIsInactivePosition(card) {
		return clickedIsInactive(card) && !card.classList.contains('project');
	}

	function clickedIsActiveProject(card) {
		return clickedIsInactive(card) && card.classList.contains('project') && card.classList.contains('current_project');
	}

	function clickedIsInactiveProject(card) {
		return clickedIsInactive(card) && card.classList.contains('project');
	}

	function getUpdatedCardsElement() {
		return document.getElementById('cards');
	}

	function getNonActiveCards() {
		return document.querySelectorAll('.flip-card:not(.active)');
	}

	function resetActiveTagsToLight() {
		// console.log('reset tags from primary to light');
		sidebar_languages.querySelectorAll('.is-primary').forEach((tag) => {
			tag.classList.remove('is-primary');
			tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
			// console.log('highlighted (softly): ', tag.innerText);
		});
		sidebar_sw.querySelectorAll('.is-primary').forEach((tag) => {
			tag.classList.remove('is-primary');
			tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
			// console.log('highlighted (softly): ', tag.innerText);
		});
		sidebar_hw.querySelectorAll('.is-primary').forEach((tag) => {
			tag.classList.remove('is-primary');
			tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
			// console.log('highlighted (softly): ', tag.innerText);
		});
	}

	function setTagsToActiveFromProject(projectTitle) {
		// console.log('set active project tags from light to primary');
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromProject(projectTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromProject(projectTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromProject(projectTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
	}

	function setTagsToActiveFromPosition(positionTitle) {
		// console.log('set active position tags from light to primary');
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPosition(positionTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPosition(positionTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPosition(positionTitle).includes(tag.innerText)) {
				tag.classList.add('is-primary');
				tag.classList.remove('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
	}

	function setTagsToLightFromPositionAndProjects(positionTitle) {
		// console.log('set active position tags from light to primary');
		sidebar_languages.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPositionAndProjects(positionTitle).includes(tag.innerText)) {
				tag.classList.remove('is-primary');
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_hw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPositionAndProjects(positionTitle).includes(tag.innerText)) {
				tag.classList.remove('is-primary');
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
		sidebar_sw.querySelectorAll('.tag').forEach((tag) => {
			if (getTagsFromPositionAndProjects(positionTitle).includes(tag.innerText)) {
				tag.classList.remove('is-primary');
				tag.classList.add('has-background-primary-soft', 'has-text-primary-soft-invert');
				// console.log('highlighted: ', tag.innerText);
			}
		});
	}

	function returnToMainPage() {
		document.querySelectorAll('.flip-card').forEach((_card) => {
			_card.classList.remove('active');
			_card.classList.remove('back');
			_card.classList.remove('project');
			_card.classList.remove('current_project');
		});

		sidebar.classList.add('hidden');
		ui_button.classList.add('hidden');
		top.classList.remove('hidden');
		bottom.classList.add('hidden');
		fadeOverlayRight.classList.remove('top');
		fadeOverlayLeft.classList.remove('top');
		removeExpandButtons();
		removePagionationDots();
		resetCardOrder();
		resetSkills();
		checkScrolls();
		closeAllModals();
		clearInterval(carouselTimer);
		handleExistingCarousel(carouselTimer);
	}

	function removeExpandButtons() {
		// add catch if nothing is found
		try {
			let expandButtons = document.querySelectorAll('.expand');
			expandButtons.forEach((button) => {
				button.classList.add('is-hidden');
			});
		} catch (error) {
			// console.error('No expand buttons found:', error);
		}
	}

	function removePagionationDots() {
		let paginationDotsContainer = document.getElementById('pagination-dots');
		let paginationDotsModalContainer = document.getElementById('pagination-dots-modal');
		// delete both
		if (paginationDotsContainer) paginationDotsContainer.parentNode.removeChild(paginationDotsContainer);
		if (paginationDotsModalContainer) paginationDotsModalContainer.parentNode.removeChild(paginationDotsModalContainer);
	}

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			pageVisible = false;
		} else {
			pageVisible = true;
		}
	});

	// runonce stuff
	color_scheme = checkSystemColorScheme(moonIcon, sunIcon, color_scheme);
	scrollable.addEventListener('scroll', checkScrolls);
	checkScrolls();
	setCardInitialState();
	// resizeCards();
});
