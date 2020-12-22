jQuery(document).ready(function($){
	//Biến
	var hijacking= $('body').data('hijacking'),
		animationType = $('body').data('animation'),
		delta = 0,
        scrollThreshold = 5,
        actual = 1,
        animating = false;
    
    //Phần tử DOM
    var sectionsAvailable = $('.cd-section'),
    	verticalNav = $('.cd-vertical-nav'),
    	prevArrow = verticalNav.find('a.cd-prev'),
    	nextArrow = verticalNav.find('a.cd-next');

	
	//kiểm tra truy vấn media và ràng buộc các sự kiện tương ứng
	var MQ = deviceType(),
		bindToggle = false;
	bindEvents(MQ, true);
	
	$(window).on('resize', function(){
		MQ = deviceType();
		bindEvents(MQ, bindToggle);
		if( MQ == 'mobile' ) bindToggle = true;
		if( MQ == 'desktop' ) bindToggle = false;
	});

    function bindEvents(MQ, bool) {
    	
    	if( MQ == 'desktop' && bool) {   		
    		//liên kết animation với sự kiện window scroll, nhấp vào mũi tên và bàn phím
			if( hijacking == 'on' ) {
				initHijacking();
				$(window).on('DOMMouseScroll mousewheel', scrollHijacking);
			} else {
				scrollAnimation();
				$(window).on('scroll', scrollAnimation);
			}
			prevArrow.on('click', prevSection);
    		nextArrow.on('click', nextSection);
    		
    		$(document).on('keydown', function(event){
				if( event.which=='40' && !nextArrow.hasClass('inactive') ) {
					event.preventDefault();
					nextSection();
				} else if( event.which=='38' && (!prevArrow.hasClass('inactive') || (prevArrow.hasClass('inactive') && $(window).scrollTop() != sectionsAvailable.eq(0).offset().top) ) ) {
					event.preventDefault();
					prevSection();
				}
			});
			//set navigation arrows visibility
			checkNavigation();
		} else if( MQ == 'mobile' ) {
			//reset and unbind
			resetSectionStyle();
			$(window).off('DOMMouseScroll mousewheel', scrollHijacking);
			$(window).off('scroll', scrollAnimation);
			prevArrow.off('click', prevSection);
    		nextArrow.off('click', nextSection);
    		$(document).off('keydown');
		}
    }

	function scrollAnimation(){
		//normal scroll - sử dụng requestAnimationFrame để tối ưu (nếu xác định được)
		(!window.requestAnimationFrame) ? animateSection() : window.requestAnimationFrame(animateSection);
	}

	function animateSection() {
		var scrollTop = $(window).scrollTop(),
			windowHeight = $(window).height(),
			windowWidth = $(window).width();
		
		sectionsAvailable.each(function(){
			var actualBlock = $(this),
				offset = scrollTop - actualBlock.offset().top;

			//Theo loại animation và window scroll, xác định các thông số animation
			var animationValues = setSectionAnimation(offset, windowHeight, animationType);
			
			transformSection(actualBlock.children('div'), animationValues[0], animationValues[1], animationValues[2], animationValues[3], animationValues[4]);
			( offset >= 0 && offset < windowHeight ) ? actualBlock.addClass('visible') : actualBlock.removeClass('visible');		
		});
		
		checkNavigation();
	}

	function transformSection(element, translateY, scaleValue, rotateXValue, opacityValue, boxShadow) {
		//transform sections - normal scroll
		element.velocity({
			translateY: translateY+'vh',
			scale: scaleValue,
			rotateX: rotateXValue,
			opacity: opacityValue,
			boxShadowBlur: boxShadow+'px',
			translateZ: 0,
		}, 0);
	}

	function initHijacking() {
		// Khởi tạo section style - scrollhijacking
		var visibleSection = sectionsAvailable.filter('.visible'),
			topSection = visibleSection.prevAll('.cd-section'),
			bottomSection = visibleSection.nextAll('.cd-section'),
			animationParams = selectAnimation(animationType, false),
			animationVisible = animationParams[0],
			animationTop = animationParams[1],
			animationBottom = animationParams[2];

		visibleSection.children('div').velocity(animationVisible, 1, function(){
			visibleSection.css('opacity', 1);
	    	topSection.css('opacity', 1);
	    	bottomSection.css('opacity', 1);
		});
        topSection.children('div').velocity(animationTop, 0);
        bottomSection.children('div').velocity(animationBottom, 0);
	}

	function scrollHijacking (event) {
		//Cuộn chuột - kiểm tra animate section
        if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) { 
            delta--;
            ( Math.abs(delta) >= scrollThreshold) && prevSection();
        } else {
            delta++;
            (delta >= scrollThreshold) && nextSection();
        }
        return false;
    }

    function prevSection(event) {
    	//Nút lên
    	typeof event !== 'undefined' && event.preventDefault();
    	
    	var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll = ( hijacking == 'off' && $(window).scrollTop() != visibleSection.offset().top) ? true : false;
    	visibleSection = middleScroll ? visibleSection.next('.cd-section') : visibleSection;

    	var animationParams = selectAnimation(animationType, middleScroll, 'prev');
    	unbindScroll(visibleSection.prev('.cd-section'), animationParams[3]);

        if( !animating && !visibleSection.is(":first-child") ) {
        	animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[2], animationParams[3], animationParams[4])
            .end().prev('.cd-section').addClass('visible').children('div').velocity(animationParams[0] , animationParams[3], animationParams[4], function(){
            	animating = false;
            	if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });
            actual--;
        }
        resetScroll();
    }

    function nextSection(event) {
    	//Nút xuống
    	typeof event !== 'undefined' && event.preventDefault();

        var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll = ( hijacking == 'off' && $(window).scrollTop() != visibleSection.offset().top) ? true : false;

    	var animationParams = selectAnimation(animationType, middleScroll, 'next');
    	unbindScroll(visibleSection.next('.cd-section'), animationParams[3]);

        if(!animating && !visibleSection.is(":last-of-type") ) {
            animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[1], animationParams[3], animationParams[4] )
            .end().next('.cd-section').addClass('visible').children('div').velocity(animationParams[0], animationParams[3], animationParams[4], function(){
            	animating = false;
            	if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });
            actual++;
        }
        resetScroll();
    }

    function unbindScroll(section, time) {
    	//Nếu bấm từ menu - bỏ cuộn và hiệu ứng cuộn, sử dụng animation vận tốc tùy chỉnh
    	if( hijacking == 'off') {
    		$(window).off('scroll', scrollAnimation);
    		( animationType == 'catch') ? $('body, html').scrollTop(section.offset().top) : section.velocity("scroll", { duration: time });
    	}
    }

    function resetScroll() {
        delta = 0;
        checkNavigation();
    }

    function checkNavigation() {
    	//Cập nhật hiển thị menu mũi tên
		( sectionsAvailable.filter('.visible').is(':first-of-type') ) ? prevArrow.addClass('inactive') : prevArrow.removeClass('inactive');
		( sectionsAvailable.filter('.visible').is(':last-of-type')  ) ? nextArrow.addClass('inactive') : nextArrow.removeClass('inactive');
	}

	function resetSectionStyle() {
		//Trên mobile - loại bỏ style được áp dụng với jQuery
		sectionsAvailable.children('div').each(function(){
			$(this).attr('style', '');
		});
	}

	function deviceType() {
		//Bật thông báo nếu phát hiện màn hình nhỏ hơn 1050px
		return window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
	}

	function selectAnimation(animationName, middleScroll, direction) {
		//Chọn hiệu ứng section - scrollhijacking
		var animationVisible = 'translateNone',
			animationTop = 'translateUp',
			animationBottom = 'translateDown',
			easing = 'ease',
			animDuration = 800;

		switch(animationName) {
		    case 'catch':
		    	animationVisible = 'translateUp.delay';
		        break;
		}

		return [animationVisible, animationTop, animationBottom, animDuration, easing];
	}

	function setSectionAnimation(sectionOffset, windowHeight, animationName ) {
		//Chọn hiệu ứng section - normal scroll
		var scale = 1,
			translateY = 100,
			rotateX = '0deg',
			opacity = 1,
			boxShadowBlur = 0;
		
		if( sectionOffset >= -windowHeight && sectionOffset <= 0 ) {
			// section bước vào viewport
			translateY = (-sectionOffset)*100/windowHeight;
			
			switch(animationName) {
				case 'catch':
			        if( sectionOffset>= -windowHeight &&  sectionOffset< -0.75*windowHeight ) {
			        	translateY = 100;
			        	boxShadowBlur = (1 + sectionOffset/windowHeight)*160;
			        } else {
			        	translateY = -(10/7.5)*sectionOffset*100/windowHeight;
			        	boxShadowBlur = -160*sectionOffset/(3*windowHeight);
			        }
					break;
			}

		} else if( sectionOffset > 0 && sectionOffset <= windowHeight ) {
			//section rời khỏi viewport - vẫn còn class '.visible'
			translateY = (-sectionOffset)*100/windowHeight;
			
			switch(animationName) {
				case 'catch':
					if(sectionOffset>= 0 &&  sectionOffset< windowHeight/2) {
						boxShadowBlur = sectionOffset*80/windowHeight;
					} else {
						boxShadowBlur = 80*(1 - sectionOffset/windowHeight);
					} 
					break;

			}

		} else if( sectionOffset < -windowHeight ) {
			//section chưa cuộn tới
			translateY = 100;
		} else {
			//section đã cuộn qua
			translateY = -100;
		}

		return [translateY, scale, rotateX, opacity, boxShadowBlur]; 
	}
});

/* Tùy chỉnh hiệu ứng */
//none
$.Velocity
    .RegisterEffect("translateUp", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '-100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateDown", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateNone", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '0', opacity: '1', scale: '1', rotateX: '0', boxShadowBlur: '0'}, 1]
        ]
    });
//catch up
$.Velocity
    .RegisterEffect("translateUp.delay", {
    	defaultDuration: 1,
        calls: [ 
            [ { translateY: '0%'}, 0.8, { delay: 100 }],
        ]
	});