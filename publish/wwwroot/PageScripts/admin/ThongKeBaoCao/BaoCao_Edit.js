//const baseUrl = getRootLink();
//const ckeditormotaAdd = CKEDITOR.replace('moTaAdd');

$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")

    // Kiểm tra xem có phải chỉnh sửa không
    setTimeout(() => {
        if (ID_Object && ID_Object !== "") {
            initData(ID_Object);
        }
    }, 500);
});



