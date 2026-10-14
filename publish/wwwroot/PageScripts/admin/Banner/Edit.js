const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    initDatePicker();
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();
    setTimeout(() => {
        console.log(ID_Object);
        dataLoadBanner(ID_Object);
    }, 100);

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function() {
        $('#tenBanner').val('');
        $('#moTa').val('');
    });

    $("#btnSaveEdit").on("click", function () {
        dataAddBanner();
    })
});

//#region Xử lý thông tin chung
function dataLoadBanner(BannerId) {
    getDataWithApi('GET', `${baseUrl}/api/DM_BannerApi/Get?MaNgonNgu=vi&id=${BannerId}`).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            const banner = data.value;
            $('#showAnhDaiDienDetail').val(banner.anhDaiDien);
            $('#linhVuc').val(banner.linhVucID).trigger('change');
            $('#ngonNguDich').val(banner.maNgonNgu).trigger('change');
            $('#tenBanner').val(banner.tenBanner);
            ckeditormoTa.setData(banner.moTa || '');
            if (banner.anhDaiDien && banner.anhDaiDien !== '') {
                $('#showAnhDaiDienAdd').attr('src', banner.anhDaiDien);
            }
        } else {
            showNotification(0, "Lấy thông tin banner không thành công");
            console.log(data.error);
        }
    })
}

function dataAddBanner() {
    // Thông tin chung
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const linhVuc = $("#linhVuc").val();
    const anhDaiDienPreview = $('#showAnhDaiDienDetail').val() || null;
    if (!linhVuc || linhVuc === "") {
        showNotification(0, "Vui lòng chọn lĩnh vực");
        return;
    }

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    const tenBanner = $("#tenBanner").val();
    const moTa = ckeditormoTa.getData();

    const dtBanner = {
        BannerID: BannerId,
        anhDaiDienPreview: anhDaiDienPreview,
        LinhVucID: linhVuc,
        MaNgonNgu: maNgonNgu,
        TenBanner: tenBanner,
        MoTa: moTa
    };

    let formData = new FormData();
    formData.append('RequestBanner', JSON.stringify(dtBanner));

    if (fileAnhDaiDien) {
        formData.append("File", fileAnhDaiDien);
    }

    $.ajax({
        type: 'PUT',
        url: `${baseUrl}/api/DM_BannerApi/Update`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Cập nhật banner thành công");
                setTimeout(function () {
                    window.location.href = `${baseUrl}/AdminTool/Banner/Banner`;
                }, 2000);
            } else {
                showNotification(0, "Cập nhật banner không thành công");
                console.log(data.error);
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
//#endregion Xử lý thông tin chung
