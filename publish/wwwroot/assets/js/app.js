$(window).on('load', function () {  
  $(".page-loaders").fadeOut("slow"); 
  $("body").removeClass("page-loading");
});



$(document).ready(function ($) {
    "use strict";

    $('.btn-sidebar-close').click(function(){
        $("#sidebar").toggleClass("show")

        if ($('#sidebar').hasClass('show')) {
            $('body').addClass('sidebar-show')
        } else {
            $('body').removeClass('sidebar-show')
        }
    });

    // click outisde sidebar
		$(document).mouseup(function(e) {
	    var container = $("#sidebar");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	      if ( $('body').hasClass('sidebar-show') ) {
					$('body').removeClass('sidebar-show');
				}

        if ( $('#sidebar').hasClass('show') ) {
					$('#sidebar').removeClass('show');
				}
	    }
		});

   // Lazy Load Images using Intersection Observer
   (function () {
        var observer = new IntersectionObserver(onIntersect);

        document.querySelectorAll("[data-lazy]").forEach((img) => {
            observer.observe(img);
        });

        function onIntersect(entries) {
            entries.forEach((entry) => {
                if (entry.target.getAttribute("data-processed") || !entry.isIntersecting)
                    return true;
                entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
                entry.target.setAttribute("data-processed", true);
            });
        }
    })();


  /*----------------------------------------------------*/
  /*	Active menu
	/*----------------------------------------------------*/
  var activeMenu = '';
  var breadcrumbText = "";
  var breadcrumbLength = $('.breadcrumb-wrapper .breadcrumb li').length;

  if (breadcrumbLength >= 3 ) {
    breadcrumbText = $('.breadcrumb-wrapper .breadcrumb li').eq(1).text();
    if (breadcrumbText.toLowerCase() == "tổ chức" || breadcrumbText.toLowerCase() == "chủ đề") {
      activeMenu = "Dữ liệu mở";
      $('.site-menu > li').each(function () {
        if ($(this).children('a').text() == activeMenu) {
          $(this).addClass('active');
        }
      })
    } else {
      activeMenu = $('.breadcrumb-wrapper .breadcrumb li').eq(2).text();
      $('.site-menu li a').filter(function() {
          return $(this).text() == activeMenu;
      }).parent().addClass('active').parent().parent('li').addClass('active');
    }
  } else if (breadcrumbLength <=2 && breadcrumbLength > 0) {
    breadcrumbText = $('.breadcrumb-wrapper .breadcrumb li').last().text();
    if (breadcrumbText.toLowerCase() == "tổ chức" || breadcrumbText.toLowerCase() == "chủ đề") { 
      activeMenu = "Dữ liệu mở";
    } else {
      activeMenu = $('.breadcrumb-wrapper .breadcrumb li').last().text();
    }
    $('.site-menu li a').filter(function() {
      return $(this).text() == activeMenu;
    }).parent().addClass('active');
  } else {
    $('.site-menu > li').each(function () {
      if ($(this).children('a').text() == 'Trang chủ') {
        $(this).addClass('active');
      }
    })
  }

  /*----------------------------------------------------*/
  /*	Back Top Link
	/*----------------------------------------------------*/

    var offset = 200;
    var duration = 500;
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50 && $(this).width() < 600 && $('body').find('.detail__panel-mobile').length > 0) {
          $('.detail__panel-mobile').addClass('show');
          $('footer').css('padding-bottom', 80);
          if ($('.popup-font').hasClass('d-none')) {
            $('.back-to-top').css('bottom', 74);
          } else {
            $('.back-to-top').css('bottom', 164);
          }
        } else {
          $('footer').css('padding-bottom', 24);
          $('.detail__panel-mobile').removeClass('show');
        }

        if ($(this).scrollTop() > offset) {
            $('.back-to-top').fadeIn(400);
        } else {
            $('.back-to-top').fadeOut(400);
        }
    });

    const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

    if (!!isReduced) {
        $('.back-to-top').click(function (event) {
            event.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 600);
            return false;
        })
    } else {
        $('.back-to-top').click(function (event) {
            event.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 0);
            return false;
        })
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var lazyloadImages;    
  
    if ("IntersectionObserver" in window) {
      lazyloadImages = document.querySelectorAll(".lazy");
      var imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var image = entry.target;
            image.classList.remove("lazy");
            imageObserver.unobserve(image);
          }
        });
      });
  
      lazyloadImages.forEach(function(image) {
        imageObserver.observe(image);
      });
    } else {  
      var lazyloadThrottleTimeout;
      lazyloadImages = document.querySelectorAll(".lazy");
      
      function lazyload () {
        if(lazyloadThrottleTimeout) {
          clearTimeout(lazyloadThrottleTimeout);
        }    
  
        lazyloadThrottleTimeout = setTimeout(function() {
          var scrollTop = window.pageYOffset;
          lazyloadImages.forEach(function(img) {
              if(img.offsetTop < (window.innerHeight + scrollTop)) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
              }
          });
          if(lazyloadImages.length == 0) { 
            document.removeEventListener("scroll", lazyload);
            window.removeEventListener("resize", lazyload);
            window.removeEventListener("orientationChange", lazyload);
          }
        }, 20);
      }
  
      document.addEventListener("scroll", lazyload);
      window.addEventListener("resize", lazyload);
      window.addEventListener("orientationChange", lazyload);
    }
})

$(function() {

	var siteMenuClone = function() {
    $('.site-mobile-menu .site-mobile-menu-body').css('opacity', 0)
		$('.js-clone-nav').each(function() {
			var $this = $(this);
			$this.clone().attr('class', 'site-nav-wrap').appendTo('.site-mobile-menu-body');
		});

		setTimeout(function() {
			
			var counter = 0;
            $('.site-mobile-menu .has-children').each(function(){
                var $this = $(this);
  
                $this.prepend('<span class="arrow-collapse">');
                
                if (!$this.hasClass('active')) {
                  $this.addClass('collapsed');
                }
                
                $this.find('.arrow-collapse').parent().attr({
                'data-toggle' : 'collapse',
                'data-target' : '#collapseItem' + counter,
                });

                $this.find('> ul').attr({
                'class' : `collapse ${$this.hasClass('active') ? 'show' : ''}`,
                'id' : 'collapseItem' + counter,
                });

                counter++;

            });

            $('.site-mobile-menu .site-mobile-menu-body').css('opacity', 1)

        }, 1000);

		$('body').on('click', '.arrow-collapse', function(e) {
            var $this = $(this);
            if ( $this.closest('li').find('.collapse').hasClass('show') ) {
                $this.removeClass('active');
            } else {
                $this.addClass('active');
            }
            e.preventDefault();  
            
        });

		$(window).resize(function() {
			var $this = $(this),
				w = $this.width();

			if ( w > 768 ) {
				if ( $('body').hasClass('offcanvas-menu') ) {
					$('body').removeClass('offcanvas-menu');
				}
			}
		})

		$('body').on('click', '.js-menu-toggle', function(e) {
			var $this = $(this);
			//e.preventDefault();

			if ( $('body').hasClass('offcanvas-menu') ) {
				$('body').removeClass('offcanvas-menu');
				$this.removeClass('active');
			} else {
				$('body').addClass('offcanvas-menu');
				$this.addClass('active');
			}
		}) 

		// click outisde offcanvas
		$(document).mouseup(function(e) {
	    var container = $(".site-mobile-menu");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	      if ( $('body').hasClass('offcanvas-menu') ) {
					$('body').removeClass('offcanvas-menu');
				}
	    }
		});
	}; 

	siteMenuClone();

});