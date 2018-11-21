;(function($, window, document, undefined) {
	var $win = $(window);
	var $doc = $(document);
	var $homeSlider = $('.slider-images .slides');
	var $membersContainer = $('.block.comite .grid-la-list');
	var $member = $('.block.comite .gla-item');
	var $feedsContainer = $('#feeds');
	var members = [];
	var animatedElements = '.block.edito, .section-tertiary, .block.news .caroufredsel_wrapper, .block.participants, .section-partners, .slider-feeds, .contacts-list, .members, .list-articles';
	var rhomboids = '.block.comite .gla-item > a';
	var wrappedRhomboids = '.article-title .at-illust';

	// Start videos
	function startVideos() {
		$('[id^="video"]').each(function(){
			var $video = $(this);
			var player = new YT.Player($video.get(0), {
				videoId: $video.data('video'),
				events: {
					onStateChange: function(state) {
						if (state.data == 0 && $video.data('autohide')) {
							updateSlider();
						}
					}
				}
			});
		});
	}

	// Start sliders
	function startSlider($slider, options) {
		$slider.carouFredSel(options);
	}

	// Equalize rhomboids width and height
	function fixRhomboids() {
		$(rhomboids).each(function(){
			var $this = $(this);

			$this.outerHeight($this.outerWidth());
		});
	}

	// Make images backgrounds
	function fixBG($item, bgSelector) {
		$item.each(function(){
			var $this = $(this);

			$this.css({
				'background-image': 'url(' + $this.find(bgSelector).attr('src') + ')'
			});
		});
	}

	// Move pg items into containers
	
	function fixPgItems($container) {
		var $items = $container.find('.pg-item');

		$items
			.each(function(){
				var $this = $(this);
				var $parent = $this.parent();
				var indx = $this.index();

				if (!(indx % 4) || indx == 0) {
					$parent.append('<div class="slide"></div>');
				}

				$this
					.clone()
					.appendTo($parent.find('.slide:last-child'));
			});

		$items.remove();
	}

	// Animate elements
	function animate(winST) {
		$(animatedElements).each(function(){
			var $this = $(this);

			if (winST + ($win.outerHeight() / 1.2) > $this.offset().top) {
				$this.addClass('animated');
			} else {
				$this.removeClass('animated');
			}

			if (winST + ($win.outerHeight() / 2) > $this.offset().top + $this.outerHeight()) {
				$this.addClass('animated-out');
			} else {
				$this.removeClass('animated-out');
			}
		});
	}

	// Function to fix height to fit in viewport
	function fixHeight($selector, visibleItems) {
		var delHeight = 0;

		if ($(visibleItems).length) {
			$(visibleItems).each(function(){
				delHeight += $(this).outerHeight();
			});
		}

		$selector.outerHeight($win.outerHeight() - delHeight);
	}

	// Start homepage sliders
	function prepareSlider($slider) {
		$slider = stopSlider($slider);
		$slider.before('<div class="slider-paging"/>');
		$slider
			.find('.la-item-img')
				.wrap('<div class="la-item-img-container"/>');

		startSlider($slider, {
			width: '100%',
			responsive: true,
			items: 1,
			swipe: {
				onTouch: true
			},
			scroll: { 
				fx: 'fade',
				duration: 600,
				onBefore: function() {
					$slider.find('.la-item').removeClass('active');
				},
				onAfter: function() {
					$slider.find('.la-item:first-child').addClass('active');
				}
			},
			pagination: {
				container: $slider.prev()
			},
			auto: false,
			infinite: true,
			onCreate: function() {
				$slider.find('.la-item:first-child').addClass('active');

				if( $('.play-btn-alt').length ) {
					// Open Video in Modal
					$('.play-btn-alt').magnificPopup({
						type: 'iframe',
						removalDelay: 400,
						mainClass: 'mfp-fade'
					});					
				}
			}
		});
	}

	// Stop default sliders
	function stopSlider($slider) {
		var $sliderClone = $slider.clone();
		var $sliderParent = $slider.parent();

		$sliderClone.attr('style', '');
		$slider.remove();
		$sliderParent
			.after($sliderClone)
			.remove();

		return $sliderClone;
	}

	// Randomize comite members
	function randomizeMembers() {
		for (var i = 0; i < $member.length; i++) {
			members.push($member.eq(i).clone());
		}

		for (var i = 0; i < 3; i++) {
			$membersContainer.prepend('<div class="gla-item-container"/>');

			$membersContainer.find('> .gla-item:last-child').prependTo($membersContainer.find('.gla-item-container:first-child'));
		}

		$membersContainer
			.find('.gla-item-container .gla-item')
			.addClass('is-shown');

		var i = 0;

		setInterval(function() {
			if (i >= 3) {
				i = 0;

				$membersContainer
					.find('.gla-item-container > :first-child')
					.remove();

				members.sort(function() {
					return 0.5 - Math.random();
				});
			}

			$membersContainer
				.find('.gla-item-container')
				.eq(i)
				.append(members[i].clone());
			$membersContainer
				.find('.gla-item-container')
				.eq(i)
				.removeClass('is-animated');

			setTimeout(function() {
				$membersContainer
					.find('.gla-item-container')
					.eq(i)
					.find('.gla-item:last-child')
					.addClass('is-shown');
				$membersContainer
					.find('.gla-item-container')
					.eq(i)
					.addClass('is-animated');
				i++;
			}, 10);
			
		}, 1200);
	}

	// Twitter feeds
	function fetchFeeds(id) {
		twitterFetcher.fetch({
			profile: {
				screenName: 'imediafrance'
			},
			domId: id,
			maxTweets: 3,
			enableLinks: true, 
			showUser: true,
			showTime: false,
			showImages: false,
			lang: 'fr',
			customCallback: handleFeeds,
			showInteraction: false
		});
	}

	// Twitter placement in HTML
	function handleFeeds(feeds) {
		var slides = '';

		for (var i = 0; i < feeds.length; i++) {
			slides += '<div class="feed">' + feeds[i] + '</div>'
		}

		$feedsContainer.append(slides);
	}

	$('header .sb-menu-trigger')
		 .detach()
		 .insertBefore('.navigation');

	// Twitter feeds
	if ($feedsContainer.length) {
		fetchFeeds($feedsContainer.attr('id'));
	}

	// Make slider images to backgrounds
	fixBG($('.slider-images .slide'), '> img');

	// Wrap rhomboids
	$(wrappedRhomboids).wrap('<div class="rhomboid-container" />');
	
	
	
	if ($('.front .list-articles.comite').length) {
				
		$('.event')
			.detach()
			.prependTo('.list-articles.comite .inside');
	}
	
	
	if ($('.front .list-articles.participants').length) {
			
		$('.la-item-video')
			.detach()
			.prependTo('.list-articles.participants');
	}
	

	// Dropdown navigation open/close
	$('.mn-item-has-submenu > a').on('click', function(e){
		e.preventDefault();

		var $this = $(this);

		$this
			.toggleClass('dropdown-visible')
			.next()
				.toggleClass('dropdown-visible');

		$('.dropdown-visible')
			.not($this)
			.not($this.next())
			.removeClass('dropdown-visible');
	});

	// Close dropdown when nav is closed
	$('.sb-menu-trigger').on('click', function(){
		$('.dropdown-visible').removeClass('dropdown-visible');
	});

	// Randomize members
	if ($membersContainer.length) {
		randomizeMembers();
	}

	$win.on('load', function(){
		// Start homepage main slider
		if ($homeSlider.length){
			fixHeight($homeSlider.find('.slide'), '.site-banner, .section, .slider-images .slider-actions');

			if (!$homeSlider.closest('.slider-images').hasClass('intro')) {
				startSlider($homeSlider, {
					width: '100%',
					circular: true,
					infinite: true,
					responsive: true,
					swipe: true,						
					auto: 7000,
					swipe: {
						onTouch: true
					},
					scroll: {
						duration: 1000,
						easing: 'linear',
						fx: 'crossfade'
					},
					items: 1,
					onCreate: function() {
						$homeSlider
							.closest('.slider-images')
								.addClass('loaded');
					}
				});
			} else {
				$homeSlider
					.closest('.slider-images')
						.addClass('loaded');
			}
		}

		// Start news slider
		if ($('.block.news .slider-content').length) {
			prepareSlider($('.block.news .slider-content'));
		}

		if ($('.partner.part').length) {
			fixPgItems($('.partner.part'));

			prepareSlider($('.partner.part .slider-content'));			
		}

		if ($('.partner.sponsor').length) {
			fixPgItems($('.partner.sponsor'));

			prepareSlider($('.partner.sponsor .slider-content'));
		}

		// Start participants slider
		if ($('.block.participants .slider-content').length) {
			prepareSlider($('.block.participants .slider-content'));
		}

		// Start partners slider
		if ($('.slider-partners .slides').length) {
			startSlider($('.slider-partners .slides'), {
				width: '100%',
				circular: true,
				infinite: true,
				responsive: true,
				swipe: true,						
				auto: 7000,
				swipe: {
					onTouch: true
				},
				pagination: {
					container: $('.slider-partners .slides').next()
				},
				scroll: {
					duration: 1000
				},
				items: 1
			});
		}

		if ($feedsContainer.length) {
			startSlider($feedsContainer, {
				width: '100%',
				circular: true,
				infinite: true,
				responsive: true,
				swipe: true,						
				auto: false,
				swipe: {
					onTouch: true
				},
				pagination: {
					container: $feedsContainer.next()
				},
				scroll: {
					duration: 1000,
					fx: 'fade'
				},
				prev: {
					button: $feedsContainer.parent().find('.slider-prev')
				},
				next: {
					button: $feedsContainer.parent().find('.slider-next')
				},
				items: 1
			});
		}

		// Check if videos exists and start them
		if ($('[id^="video"]')) {
			startVideos();
		}
	}).on('load resize', function(){
		// Fix slides in viewport
		fixHeight($homeSlider.find('.slide'), '.site-banner, .section, .slider-images .slider-actions');

		// Fix rhomboids width and height
		fixRhomboids();
	}).on('load scroll', function(){
		var winST = $win.scrollTop();

		animate(winST);
	});
})(jQuery, window, document);
