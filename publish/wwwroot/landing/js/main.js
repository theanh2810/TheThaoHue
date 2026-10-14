
/* Go to top */

var toTop = document.getElementById("goTop")

window.onscroll = function () {
    scrollFunction()
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        toTop.style.display = "block"
        document.getElementById("header-menu").style.background = "linear-gradient(85deg, #5F9FFF -3.78%, #5D34EC 103.8%)"
    } else {
        toTop.style.display = "none"
        document.getElementById("header-menu").style.background = "none"
    }
}


toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
/* function goTop(){
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
} */

/* Di chuyen den muc tieu thanh phan */
/* document.querySelectorAll('#menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollTo({
            behavior: 'smooth'
        });
    });
});

document.querySelectorAll('#hide-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); */

/* Nut menu-mobile */
// var menuIcon = document.querySelector(".hide-menu")
// var menuList = document.querySelector(".menu-items");

// menuIcon.addEventListener("click", function (event) {
//     if (menuIcon.contains(event.currentTarget)) {
//         menuList.classList.toggle("show-menu");
//     } else {
//         menuList.classList.remove("show-menu");
//     }
// });

/* slide show function */

//khai báo biến slideIndex đại diện cho slide hiện tại
var slideIndex;
// KHai bào hàm hiển thị slide
function showSlides() {
    var i;
    var slides = document.getElementsByClassName("myslide");
    var dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    if (slides) {
        slides[slideIndex].style.display = "block";
    }
    dots[slideIndex].className += " active";
    //chuyển đến slide tiếp theo
    slideIndex++;
    //nếu đang ở slide cuối cùng thì chuyển về slide đầu
    if (slideIndex > slides.length - 1) {
        slideIndex = 0
    }
    //tự động chuyển đổi slide sau 5s
    // setTimeout(showSlides, 5000);
}
//mặc định hiển thị slide đầu tiên 
showSlides(slideIndex = 0);


function currentSlide(n) {
    showSlides(slideIndex = n);
}

// loop slide show
setInterval(() => {
    showSlides(slideIndex);
}, 4000);

/* slide-show application */
//khai báo biến slideIndex đại diện cho slide hiện tại
var slideIndex2;
// KHai bào hàm hiển thị slide
function showSlides2() {
    var i;
    var slides = document.getElementsByClassName("text-myslide");
    var dots = document.getElementsByClassName("text-dot");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }


    slides[slideIndex2].style.display = "block";
    dots[slideIndex2].className += " active";
    //chuyển đến slide tiếp theo
    slideIndex2++;
    //nếu đang ở slide cuối cùng thì chuyển về slide đầu
    if (slideIndex2 > slides.length - 1) {
        slideIndex2 = 0
    }
    //tự động chuyển đổi slide sau 5s
    // setTimeout(showSlides2, 5000);
}
//mặc định hiển thị slide đầu tiên 
showSlides2(slideIndex2 = 0);


function currentSlide2(n) {
    showSlides2(slideIndex2 = n);
}

// loop slide show
setInterval(() => {
    showSlides2(slideIndex2);
}, 5000);


// SmartMenus init
$(function () {
    $('#main-menu').smartmenus({
        subMenusSubOffsetX: 1,
        subMenusSubOffsetY: -8
    });
});

// SmartMenus mobile menu toggle button
$(function () {
    var $mainMenuState = $('#main-menu-state');
    if ($mainMenuState.length) {
        // animate mobile menu
        $mainMenuState.change(function (e) {
            var $menu = $('#main-menu');
            if (this.checked) {
                $menu.hide().slideDown(250, function () { $menu.css('display', ''); });
            } else {
                $menu.show().slideUp(250, function () { $menu.css('display', ''); });
            }
        });
        // hide mobile menu beforeunload
        $(window).bind('beforeunload unload', function () {
            if ($mainMenuState[0].checked) {
                $mainMenuState[0].click();
            }
        });
    }
});

// get event click to .main-menu-btn to toggle class .showMenu to .menu-section by pure js
document.querySelector('.main-menu-btn').addEventListener('click', function () {
    document.querySelector('.menu-section').classList.toggle('showMenu');
});

// get event click to .menu-wrapper li a to remove class active to all .menu-wrapper li a and add class active to event target
document.querySelectorAll('.menu-wrapper li a').forEach(function (item) {
    item.addEventListener('click', function () {
        document.querySelectorAll('.menu-wrapper li a').forEach(function (item) {
            item.classList.remove('active');
        });
        item.classList.add('active');

        // remove class .showMenu to .menu-section
        document.querySelector('.menu-section').classList.remove('showMenu');

        // if main-menu-state id checked then click to remove checked
        if (document.querySelector('#main-menu-state').checked) {
            document.querySelector('#main-menu-state').click();
        }
    });
});