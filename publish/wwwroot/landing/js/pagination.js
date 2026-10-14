/* pagination */
let thisPage = 1
let limit = 10
let list = document.querySelectorAll(".relate-container .item")
let first = document.querySelector('.first')
let prev = document.querySelector('.prev')
let next = document.querySelector('.next')
let last = document.querySelector('.last')

function loadItem() {
    let beginGet = limit * (thisPage - 1)
    let endGet = limit * thisPage - 1
    list.forEach((item, key) => {
        if (key >= beginGet && key <= endGet) {
            item.style.display = 'block'
        } else {
            item.style.display = 'none'
        }
    })
    listPage()
}
loadItem()

function listPage() {
    let count = Math.ceil(list.length / limit)
    document.querySelector('.listPage').innerHTML = ''

    if (thisPage != 1) {
        let first = document.createElement('li')
        first.innerText = '<<'
        first.setAttribute('onclick', "changePage(" + 1 + ")")
        document.querySelector('.listPage').appendChild(first)
    }

    if (thisPage != 1) {
        let prev = document.createElement('li')
        prev.innerText = '<'
        prev.setAttribute('onclick', "changePage(" + (thisPage - 1) + ")")
        document.querySelector('.listPage').appendChild(prev)
    }

    for (let i = 1; i <= count; i++) {
        let newPage = document.createElement('li')
        newPage.innerText = i
        if (i == thisPage) {
            newPage.classList.add('pagination-active')
        }
        newPage.setAttribute('onclick', "changePage(" + i + ")")
        document.querySelector('.listPage').appendChild(newPage)
    }

    if (thisPage != count) {
        let next = document.createElement('li')
        next.innerText = '>'
        next.setAttribute('onclick', "changePage(" + (thisPage + 1) + ")")
        document.querySelector('.listPage').appendChild(next)
    }

    if (thisPage != count) {
        let last = document.createElement('li')
        last.innerText = '>>'
        last.setAttribute('onclick', "changePage(" + count + ")")
        document.querySelector('.listPage').appendChild(last)
    }

}

function changePage(i) {
    thisPage = i
    loadItem()
}


/* Go to top */

var toTop = document.getElementById("goTop")

window.onscroll = function () {
    scrollFunction()
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        toTop.style.display = "block"
    } else {
        toTop.style.display = "none"
    }
}

/* function goTop(){
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
} */

toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});