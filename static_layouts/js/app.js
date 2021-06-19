/* eslint-disable no-console */
/* eslint-disable no-undef */

$(document).ready(function() {

	function preload() {
		let preload = $('.preload');
		let body = $('body');
		body.css('overflow', 'hidden');
		setTimeout(function() {
			preload.fadeOut(function() {
				preload.remove();
			});
			body.css('overflow', '');
		}, 2000);
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

	function shadow() {
		const img = document.querySelectorAll('.getShadow img');
		const colorThief = new ColorThief();
		
		for (let i = 0; i < img.length; i++) {
			img[i].addEventListener('load', function() {
				let shadow = colorThief.getColor(img[i]);
				img[i].style.boxShadow = '0px 0px 16px' + ' rgb(' + shadow + ')';
			});
		}
	}
	shadow();


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
