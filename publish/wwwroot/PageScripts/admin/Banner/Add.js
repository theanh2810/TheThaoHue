const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {
    initDatePicker();
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function() {
        $('#tenBanner').val('');
        $('#moTa').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddBanner();
    })

    // Xử lý giao diện văn bản tài liệu
    $(".loaiVanBan_group").hide();
    $("#TaiLieuBanner .with-title h4").text("Danh sách văn bản tài liệu banner");
});

//#region Xử lý thông tin chung
function dataAddBanner() {
    // Thông tin chung
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const linhVuc = $("#linhVuc").val();
    if (!linhVuc || linhVuc === "") {
        showNotification(0, "Vui lòng chọn lĩnh vực");
        return;
    }

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    const tenBanner = $("#tenBanner").val();
    const moTa = ckeditormoTa.getData();

    const dtBanner = {
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
        type: 'POST',
        url: `${baseUrl}/api/DM_BannerApi/Add`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Thêm mới banner thành công");
                setTimeout(function () {
                    window.location.href = `${baseUrl}/AdminTool/Banner/Banner`;
                }, 2000);
            } else {
                showNotification(0, "Thêm mới banner không thành công");
                console.log(data.error);
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
//#endregion Xử lý thông tin chung
