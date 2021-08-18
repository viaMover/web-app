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
		let block = $('.general-desktop__menu-wrapper-save'); 
		let button = $('.order__buttons .close-button');

		button.on('click', function() { 
			block.addClass('general-desktop__menu-wrapper-order-active');
		})
	}
	orderClose();

	function saveClose() {
		let block = $('.general-desktop__menu-wrapper-save'); 
		let button = $('.save__buttons .close-button');

		button.on('click', function() { 
			block.addClass('general-desktop__menu-wrapper-save-active');
		})
	}
	saveClose();

	function toggleSwaps() {
		let next = $('.popup-swaps .info__form .currency'); 
		let back = $('.popup-swaps .popup__content-search .items__item'); 
		let step1 = $('.popup-swaps .popup__content-swaps'); 
		let step2 = $('.popup-swaps .popup__content-search'); 
		let close = $('.popup__close'); 
	
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
	
	function burgerMenu() {
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
	burgerMenu();

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

	function stakePopup() {
		let stakePopup = $('.popup-stake'); 
		let close = $('.popup__close');
		let button = $('.stake');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			stakePopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			stakePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	stakePopup();

	function unstakePopup() {
		let unstakePopup = $('.popup-unstake'); 
		let close = $('.popup__close');
		let button = $('.unstake');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			unstakePopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			unstakePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	unstakePopup();

	function claimAndBurnPopup() {
		let claimAndBurnPopup = $('.popup-claim-and-burn'); 
		let close = $('.popup__close');
		let button = $('.claim-and-burn');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			claimAndBurnPopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			claimAndBurnPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	claimAndBurnPopup();

	function increaseBoostPopup() {
		let increasePopup = $('.popup-increase-boost'); 
		let close = $('.popup__close');
		let button = $('.increase-boost');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			increasePopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			increasePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	increaseBoostPopup();

	function decreaseBoostPopup() {
		let decreasePopup = $('.popup-decrease-boost'); 
		let close = $('.popup__close');
		let button = $('.decrease-boost');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			decreasePopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			decreasePopup.removeClass('popup-active');
			close.removeClass('popup__close-active');
		})
	}
	decreaseBoostPopup();

	function managePowercardPopup() {
		let managePowercardPopup = $('.popup-manage-powercard'); 
		let close = $('.popup__close');
		let button = $('.manage-powercard');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			managePowercardPopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			managePowercardPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	managePowercardPopup();

	function depositPopup() {
		let depositPopup = $('.popup-deposit'); 
		let close = $('.popup__close');
		let button = $('.savings-deposit');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			depositPopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			depositPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	depositPopup();

	function withdrawPopup() {
		let withdrawPopup = $('.popup-withdraw'); 
		let close = $('.popup__close');
		let button = $('.savings-withdraw');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			withdrawPopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			withdrawPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	withdrawPopup();

	function delegateVotingPowerPopup() {
		let delegatePopup = $('.popup-delegate-voting-power'); 
		let close = $('.popup__close');
		let button = $('.delegate-voting-power');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			delegatePopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			delegatePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	delegateVotingPowerPopup();

	function votePopup() {
		let votePopup = $('.popup-vote'); 
		let close = $('.popup__close');
		let button = $('.vote-button');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			votePopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			votePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	votePopup();

	function buyPopup() {
		let buyPopup = $('.popup-product-item-buy'); 
		let close = $('.popup__close');
		let button = $('.product-item-buy');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			buyPopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			buyPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	buyPopup();

	function sellPopup() {
		let sellPopup = $('.popup-product-item-sell'); 
		let close = $('.popup__close');
		let button = $('.product-item-sell');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			sellPopup.addClass('popup-active'); 
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			sellPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	sellPopup();

	function redeemPopup() {
		let redeemPopup = $('.popup-product-item-redeem'); 
		let close = $('.popup__close');
		let button = $('.product-item-redeem');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			redeemPopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			redeemPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	redeemPopup();

	function purchaseBondsPopup() {
		let increasePopup = $('.popup-purchase-bonds'); 
		let close = $('.popup__close');
		let button = $('.purchase-bonds');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			increasePopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			increasePopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	purchaseBondsPopup();

	function claimBondsPopup() {
		let claimBondsPopup = $('.popup-claim-bonds'); 
		let close = $('.popup__close');
		let button = $('.claim-bonds');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');
		let balance = $('.balance__popup'); 
		let balanceBg = $('.balance__popup-bg');

		button.on('click', function() { 
			claimBondsPopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
			balance.removeClass('balance__popup-active'); 
			balanceBg.removeClass('balance__popup-bg-active');
		})
		close.on('click', function() { 
			claimBondsPopup.removeClass('popup-active');
			close.removeClass('popup__close-active');
		})
	}
	claimBondsPopup();

	function claimAndRepurchasePopup() {
		let claimAndRepurchasePopup = $('.popup-claim-and-repurchase'); 
		let close = $('.popup__close');
		let button = $('.claim-and-repurchase');
		let burger = $('.burger-menu__popup'); 
		let burgerBg = $('.burger-menu__popup-bg');

		button.on('click', function() { 
			claimAndRepurchasePopup.addClass('popup-active');
			close.addClass('popup__close-active');
			burger.removeClass('burger-menu__popup-active'); 
			burgerBg.removeClass('burger-menu__popup-bg-active');
		})
		close.on('click', function() { 
			claimAndRepurchasePopup.removeClass('popup-active');
			close.removeClass('popup__close-active');
		})
	}
	claimAndRepurchasePopup();

	function swapsPopup() {
		let popup = $('.popup-swaps'); 
		let close = $('.popup__close');
		let button = $('.general-desktop__menu .swaps-item');

		button.on('click', function() { 
			popup.addClass('popup-active'); 
			close.addClass('popup__close-active');
		})
		close.on('click', function() { 
			popup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	swapsPopup();

	function provideLiquidityPopup() {
		let provideLiquidityPopup = $('.popup-provide-liquidity'); 
		let close = $('.popup__close');
		let button = $('.general-desktop__menu .provide-liquidity');

		button.on('click', function() { 
			provideLiquidityPopup.addClass('popup-active');
			close.addClass('popup__close-active');
		})
		close.on('click', function() { 
			provideLiquidityPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	provideLiquidityPopup();

	function transactionWaitingPopup() {
		let transactionPopup = $('.popup-transaction-result'); 
		let close = $('.popup__close');
		let button = $('.popup-swaps .choose');
		let swapsPopup = $('.popup-swaps');

		button.on('click', function() { 
			transactionPopup.addClass('popup-active');
			close.addClass('popup__close-active');
			swapsPopup.removeClass('popup-active');
		})
		close.on('click', function() { 
			transactionPopup.removeClass('popup-active');
			close.removeClass('popup__close-active');
			swapsPopup.removeClass('popup-active');
		})
	}
	transactionWaitingPopup();

	function languageMenu() {
		let popup = $('.language__popup'); 
		let button = $('.language-menu');
		let bg = $('.language__popup-bg');

		button.on('click', function() { 
			popup.addClass('language__popup-active'); 
			bg.addClass('language__popup-bg-active');
		})
		bg.on('click', function() { 
			popup.removeClass('language__popup-active'); 
			bg.removeClass('language__popup-bg-active');
		})
	}
	languageMenu();

	function currencyPopup() {
		let currencyPopup = $('.popup-currency'); 
		let close = $('.popup__close');
		let button = $('.currency-menu');

		button.on('click', function() { 
			currencyPopup.addClass('popup-active');
			close.addClass('popup__close-active');
		})
		close.on('click', function() { 
			currencyPopup.removeClass('popup-active'); 
			close.removeClass('popup__close-active');
		})
	}
	currencyPopup();

	function hideByClickEscButton() {
		let popup = $('.popup');
		let transactionResultPopup = $('.transaction-result__popup'); 
		let burgerPopup = $('.burger-menu__popup');
		let NFTDropsPopup = $('.nft-drops__popup');
		let languagePopup = $('.language__popup');
		let nibbleShopPopup = $('.nibble-shop__popup');
		let burgerBg = $('.burger-menu__popup-bg');
		let languageBg = $('.language__popup-bg');
		$(window).on('keydown', function(e) {
			if ( e.keyCode == 27 ) {
				popup.removeClass('popup-active'); 
				transactionResultPopup.removeClass('transaction-result__popup-active'); 
				burgerPopup.removeClass('burger-menu__popup-active');
				languagePopup.removeClass('language__popup-active');
				NFTDropsPopup.removeClass('nft-drops__popup-active');
				nibbleShopPopup.removeClass('nibble-shop__popup-active');
				burgerBg.removeClass('burger-menu__popup-bg-active');
				languageBg.removeClass('language__popup-bg-active');
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