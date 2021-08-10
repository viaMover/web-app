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

	function orderClose() {
		let block = $('.general-desktop-new__menu-wrapper-save'); 
		let button = $('.order__buttons .close-button');

		button.on('click', function() { 
			block.addClass('general-desktop__menu-wrapper-order-active');
		})
	}
	orderClose();

	function saveClose() {
		let block = $('.general-desktop-new__menu-wrapper-save'); 
		let button = $('.save__buttons .close-button');

		button.on('click', function() { 
			block.addClass('general-desktop-new__menu-wrapper-save-active');
		})
	}
	saveClose();

	function swapsPopup() {
		let popup = $('.swaps__popup'); 
		let close = $('.swaps__popup-close');
		let button = $('.general-desktop__menu-wrapper-item .swaps-item');
		let bg = $('.swaps__popup-bg');

		button.on('click', function() { 
			popup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
		})
		close.on('click', function() { 
			popup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			popup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
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

	function toggleDetails() {
		let button = $('.details');
		let container = $('.details__content');
		button.on('click', () => {
			container.toggleClass('details__content-active');
		});
	}
	toggleDetails();

	function SwapsSlider() {
		new Swiper('.popup-slider', {
			grabCursor: true,
			allowTouchMove: true,
			slidesPerView: 1,
			pagination: {
				el: '.popup-slider .swiper-pagination',
				type: 'bullets',
				clickable: true,
			},
			navigation: {
				nextEl: '.popup-slider .swiper-slide',
			},
		});
	}
	SwapsSlider();

	function transactionWaitingPopup() {
		let transactionPopup = $('.transaction-result__popup'); 
		let close = $('.transaction__popup-close');
		let button = $('.swaps__wrapper-info-button .choose');
		let swapsPopup = $('.transaction__popup');
		let bg = $('.popup-bg');

		button.on('click', function() { 
			transactionPopup.addClass('transaction-result__popup-active');
			close.addClass('transaction__popup-close-active');
			swapsPopup.removeClass('transaction__popup-active');
		})
		close.on('click', function() { 
			transactionPopup.removeClass('transaction-result__popup-active');
			close.removeClass('transaction__popup-close-active');
			bg.removeClass('popup-bg-active');
			swapsPopup.removeClass('transaction__popup-active');
		})
		bg.on('click', function() { 
			transactionPopup.removeClass('transaction-result__popup-active');
			close.removeClass('transaction__popup-close-active');
			bg.removeClass('popup-bg-active');
		})
	}
	transactionWaitingPopup();

	function burderMenu() {
		let popup = $('.burger-menu__popup'); 
		let button = $('.burger-menu');
		let bg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			popup.addClass('burger-menu__popup-active'); 
			bg.addClass('burger-menu__popup-bg-active');
		})
		bg.on('click', function() { 
			popup.removeClass('burger-menu__popup-active'); 
			bg.removeClass('burger-menu__popup-bg-active');
		})
	}
	burderMenu();

	function depositPopup() {
		let depositPopup = $('.deposit__popup'); 
		let close = $('.transaction__popup-close');
		let button = $('.savings-deposit');
		let bg = $('.deposit__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			depositPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			depositPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			depositPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	depositPopup();
	
	function withdrawPopup() {
		let withdrawPopup = $('.withdraw__popup'); 
		let close = $('.transaction__popup-close');
		let button = $('.savings-withdraw');
		let bg = $('.withdraw__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			withdrawPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			withdrawPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			withdrawPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	withdrawPopup();

	function increaseBoostPopup() {
		let increasePopup = $('.increase-boost__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.increase-boost');
		let bg = $('.increase-boost__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			increasePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			increasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			increasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	increaseBoostPopup();

	function decreaseBoostPopup() {
		let decreasePopup = $('.decrease-boost__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.decrease-boost');
		let bg = $('.decrease-boost__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			decreasePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			decreasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			decreasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	decreaseBoostPopup();

	function stakePopup() {
		let stakePopup = $('.test__popup'); 
		let close = $('.test__popup-close');
		let button = $('.stake');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			stakePopup.addClass('test__popup-active');
			close.addClass('test__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			stakePopup.removeClass('test__popup-active'); 
			close.removeClass('test__popup-close-active');
		})
	}
	stakePopup();

	function unstakePopup() {
		let unstakePopup = $('.unstake__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.unstake');
		let bg = $('.unstake__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			unstakePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			unstakePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			unstakePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	unstakePopup();

	function claimAndBurnPopup() {
		let claimAndBurnPopup = $('.claim-and-burn__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.claim-and-burn');
		let bg = $('.claim-and-burn__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			claimAndBurnPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			claimAndBurnPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			claimAndBurnPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	claimAndBurnPopup();

	function managePowercardPopup() {
		let managePowercardPopup = $('.manage-powercard__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.manage-powercard');
		let bg = $('.manage-powercard__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			managePowercardPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			managePowercardPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			managePowercardPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	managePowercardPopup();

	function votePopup() {
		let votePopup = $('.vote__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.vote-button');
		let bg = $('.vote__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			votePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			votePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			votePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	votePopup();


	function delegateVotingPowerPopup() {
		let delegatePopup = $('.delegate-voting-power__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.delegate-voting-power');
		let bg = $('.delegate-voting-power__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			delegatePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			delegatePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			delegatePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	delegateVotingPowerPopup();

	function NFTDropsPopup() {
		let NFTDropsPopup = $('.nft-drops__popup'); 
		let close = $('.nft-drops__popup-close');
		let button = $('.general-desktop__menu-wrapper-item .nft-drops');

		button.on('click', function() { 
			NFTDropsPopup.addClass('nft-drops__popup-active');
			close.addClass('transaction__popup-close-active');
		})
		close.on('click', function() { 
			NFTDropsPopup.removeClass('nft-drops__popup-active'); 
			close.removeClass('transaction__popup-close-active');
		})
	}
	NFTDropsPopup();

	function nibbleShopPopup() {
		let nibbleShopPopup = $('.nibble-shop__popup'); 
		let close = $('.nibble-shop__popup-close');
		let button = $('.general-desktop__menu-wrapper-item .nibble-shop');

		button.on('click', function() { 
			nibbleShopPopup.addClass('nibble-shop__popup-active');
			close.addClass('transaction__popup-close-active');
		})
		close.on('click', function() { 
			nibbleShopPopup.removeClass('nibble-shop__popup-active'); 
			close.removeClass('transaction__popup-close-active');
		})
	}
	nibbleShopPopup();

	function noAccessPopup() {
		let popup = $('.no-access__popup'); 
		let close = $('.no-access__popup-close');
		let button = $('.general-desktop__menu-wrapper-item .shop__items .shop__items-item');
		let bg = $('.no-access__popup-bg');

		button.on('click', function() { 
			popup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
		})
		close.on('click', function() { 
			popup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			popup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	noAccessPopup();

	function buyPopup() {
		let buyPopup = $('.product-item-buy__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.product-item-buy');
		let bg = $('.product-item-buy__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			buyPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			buyPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			buyPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	buyPopup();

	function sellPopup() {
		let sellPopup = $('.product-item-sell__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.product-item-sell');
		let bg = $('.product-item-sell__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			sellPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			sellPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			sellPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	sellPopup();

	function redeemPopup() {
		let redeemPopup = $('.product-item-redeem__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.product-item-redeem');
		let bg = $('.product-item-redeem__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			redeemPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			redeemPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			redeemPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	redeemPopup();

	function purchaseBondsPopup() {
		let increasePopup = $('.purchase-bonds__popup'); 
		let close = $('.purchase-bonds__popup-close');
		let button = $('.purchase-bonds');
		let bg = $('.purchase-bonds__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			increasePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			increasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			increasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	purchaseBondsPopup();

	function claimBondsPopup() {
		let claimBondsPopup = $('.claim-bonds__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.claim-bonds');
		let bg = $('.claim-bonds__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');
		let balance = $('.balance__popup'); 
		let balanceBg = $('.balance__popup-bg');

		button.on('click', function() { 
			claimBondsPopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
			balance.removeClass('balance__popup-active'); 
			balanceBg.removeClass('balance__popup-bg-active');
		})
		close.on('click', function() { 
			claimBondsPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			claimBondsPopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	claimBondsPopup();

	function claimAndRepurchasePopup() {
		let claimAndRepurchasePopup = $('.claim-and-repurchase__popup'); 
		let close = $('.burger__popup-close');
		let button = $('.claim-and-repurchase');
		let bg = $('.claim-and-repurchase__popup-bg');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			claimAndRepurchasePopup.addClass('transaction__popup-active'); 
			bg.addClass('popup-bg-active');
			close.addClass('transaction__popup-close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			claimAndRepurchasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
		bg.on('click', function() { 
			claimAndRepurchasePopup.removeClass('transaction__popup-active'); 
			bg.removeClass('popup-bg-active');
			close.removeClass('transaction__popup-close-active');
		})
	}
	claimAndRepurchasePopup();

	function balancePopup() {
		let popup = $('.balance__popup'); 
		let button = $('.button-balance');
		let bg = $('.balance__popup-bg');

		button.on('click', function() { 
			popup.addClass('balance__popup-active'); 
			bg.addClass('balance__popup-bg-active');
		})
		bg.on('click', function() { 
			popup.removeClass('balance__popup-active'); 
			bg.removeClass('balance__popup-bg-active');
		})
	}
	balancePopup();

	function hideByClickEscButton() {
		let transactionPopup = $('.test__popup');
		let transactionResultPopup = $('.transaction-result__popup'); 
		let burgerPopup = $('.burger-menu__popup');
		let NFTDropsPopup = $('.nft-drops__popup');
		let nibbleShopPopup = $('.nibble-shop__popup');
		let bg = $('.popup-bg');
		let burgerBg = $('.burger-menu__popup-bg');
		let transactionClose = $('.test__popup-close');

		$(window).on('keydown', function(e) {
			if ( e.keyCode == 27 ) {
				transactionPopup.removeClass('test__popup-active'); 
				transactionResultPopup.removeClass('transaction-result__popup-active'); 
				burgerPopup.removeClass('burger-menu__popup-active');
				NFTDropsPopup.removeClass('nft-drops__popup-active');
				nibbleShopPopup.removeClass('nibble-shop__popup-active');
				bg.removeClass('popup-bg-active');
				burgerBg.removeClass('burger-menu__popup-bg-active');
				transactionClose.removeClass('test__popup-close-active');
			}
		});
	}
	hideByClickEscButton();

	function textareaSize() {
		$('.create-a-proposal-wrapper-statements form textarea').on('keyup change drop paste focusin focusout',function(){
			$(this)
			.attr('rows','1')
			.css('height','auto')
			.css('height',$(this)[0].scrollHeight+'px');
		}).focus();
	}
	textareaSize();
});