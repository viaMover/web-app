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

	function swapsPopup() {
		let popup = $('.swaps__popup'); 
		let close = $('.swaps__popup-close');
		let button = $('.general-desktop__menu-wrapper-item .swaps-item');
		let bg = $('.swaps__popup-bg');

		button.on('click', function() { 
			popup.addClass('swaps__popup-active'); 
			bg.addClass('swaps__popup-bg-active');
			close.addClass('swaps__popup-close-active');
		})
		close.on('click', function() { 
			popup.removeClass('swaps__popup-active'); 
			bg.removeClass('swaps__popup-bg-active');
			close.removeClass('swaps__popup-close-active');
		})
		bg.on('click', function() { 
			popup.removeClass('swaps__popup-active'); 
			bg.removeClass('swaps__popup-bg-active');
			close.removeClass('swaps__popup-close-active');
		})
	}
	swapsPopup();

	function toggleSwaps() {
		let next = $('.swaps__wrapper-info-items-item-right .currency'); 
		let back = $('.swaps__wrapper-search-items-item'); 
		let step1 = $('.swaps__wrapper-info'); 
		let step2 = $('.swaps__wrapper-search'); 
		let close = $('.swaps__popup-close'); 
	
		next.on('click', function() {
			step2.show();
			step1.hide();
		});
	
		back.on('click', function() {
			step2.hide();
			step1.show();
		});

		close.on('click', function() {
			setTimeout( function() {
				step2.hide();
				step1.show();
			}, 300)
		});
	}
	toggleSwaps();

	function hideByClickEscButton() {
		let popup = $('.swaps__popup');
		let bg = $('.swaps__popup-bg');
		let close = $('.swaps__popup-close');

		$(window).on('keydown', function(e) {
			if ( e.keyCode == 27 ) {
				popup.removeClass('swaps__popup-active'); 
				bg.removeClass('swaps__popup-bg-active');
				close.removeClass('swaps__popup-close-active');
			}
		});
	}
	hideByClickEscButton();

	function toggleSwapDetails() {
		let button = $('.swap-details-active');
		let container = $('.swap-details__content');
		button.on('click', () => {
			container.toggleClass('swap-details__content-active');
		});
	}
	toggleSwapDetails();

	function SwapsSlider() {
		new Swiper('.swaps__wrapper-info-footer-right', {
			grabCursor: true,
			allowTouchMove: true,
			slidesPerView: 1,
			pagination: {
				el: '.swaps__wrapper-info-footer-right .swiper-pagination',
				type: 'bullets',
				clickable: true,
			},
			navigation: {
				nextEl: '.swaps__wrapper-info-footer-right .swiper-slide',
			},
		});
	}
	SwapsSlider();
	
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

});