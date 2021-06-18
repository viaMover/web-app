/* eslint-disable no-console */
/* eslint-disable no-undef */

$(document).ready(function() {

	(function renderPage() {
		let render = $('.render');
		let tl = new TimelineLite();
		tl
			.fromTo(render, 0.5, {opacity: '1', zIndex: '99999'}, {opacity: '0', zIndex: '-1'})
			.delay(0.4)
			.call(hideRender);
		function hideRender(){
			$(render).remove();
		}
	})();

	function preload() {
		let preload = $('.preload');
		let body = $('body');
		body.css('overflow', 'hidden');
		setInterval(function() {
			preload.fadeOut(function() {
				preload.remove();
			});
			body.css('overflow', '');
		});
	}
	preload();

	function orderClose() {
		let order = $('.general-desktop__menu-wrapper-item .order'); 
		let button = $('.order__buttons .close-button');

		button.on('click', function() { 
			order.addClass('order-close'); 
		})
	}
	orderClose();

	function liveUpdatesSlider() {
		new Swiper('.live-updates', {
			grabCursor: true,
			spaceBetween: 40,
			allowTouchMove: true,
			slidesPerView: 4.43,
		});
	}
	liveUpdatesSlider();

	function ListsSlider() {
		new Swiper('.swiper-lists', {
			grabCursor: true,
			spaceBetween: 64,
			allowTouchMove: true,
			slidesPerView: 5.58,
		});
	}
	ListsSlider();

	function dataHref() {
		$('*[data-href]').on('click', function() {
			window.location = $(this).data("href");
		});
	}
	dataHref();
	// function tttt() {
	// 	new Swiper('.swiper-container', {
	// 		slidesPerView: 2,
	// 		loop: true,
	// 		navigation: {
	// 			nextEl: '.swiper-button-next',
	// 			prevEl: '.swiper-button-prev',
	// 		},
	// 		pagination: {
	// 			el: '.swiper-pagination',
	// 			type: 'bullets',
	// 			clickable: true,
	// 		},
	// 		breakpoints: {
	// 			640: {
	// 				slidesPerView: 1,
	// 				allowTouchMove: true,
	// 			},
	// 			991: {
	// 				slidesPerView: 2,
	// 				allowTouchMove: true,
	// 			}
	// 		},
	// 	});
	// }
	// 	tttt();

	// //close popup by "esc" button
	// function hideByClickEscButton() {
	// 	let selector = $('.selector'); // block selector
	// 	$(window).on('keydown', function(e) {
	// 		if ( e.keyCode == 27 ) {
	// 			selector.removeClass('active-class'); // remove active class
	// 			scrollLock.enablePageScroll();
	// 		}
	// 	});
	// }
	// hideByClickEscButton();

});
