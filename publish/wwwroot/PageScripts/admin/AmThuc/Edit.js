const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTaEdit');
const ckeditornguyenLieu = CKEDITOR.replace('nguyenLieuEdit');
const ckeditortraiNghiem = CKEDITOR.replace('traiNghiemEdit');
let translations = [];

$(document).ready(function () {
    $("#DiaDiemCoSanAdd").attr("multiple", "multiple")
    initDanhMucChung_NoAll(62, "#kieuMonEdit", "") // Kiểu món
    initDanhMucChung_NoAll(63, "#cheDoAnEdit", "") // Chế độ ăn
    initNgonNgu("#ngonNguDichEdit")
    initLeHoi()
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    if (isEdit && amThucId) {
        setTimeout(() => {
            loadAmThucData(amThucId);
        }, 100);
    }

    $(document).on('change', '#LeHoiCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        initTableLeHoi(listDiaDiem.map(item => item).join(','));
    });

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichEdit', function() {
        $('#tenMonEdit').val('');
        $('#moTaEdit').val('');
        $('#nguyenLieuEdit').val('');
        $('#traiNghiemEdit').val('');
    });

    $("#btnSaveEdit").on("click", function () {
        dataUpdateAmThuc();
    })

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/AdminTool/AmThuc`;
    })
});

// Load dữ liệu ẩm thực để edit
function loadAmThucData(id) {
    getDataWithApi('GET', `/api/VH_AmThucApi/Get?MonAnUongID=${id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;

            // Fill basic info
            $("#kieuMonEdit").val(item.kieuMonID).trigger('change');
            $("#cheDoAnEdit").val(item.cheDoAnID).trigger('change');
            $("#thuTuEdit").val(item.thuTu);
            $(`input[name='dacSanEdit'][value='${item.dacSan ? "1" : "0"}']`).prop('checked', true);
            $(`input[name='trangThaiEdit'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);
            $("#showAnhDaiDienDetail").val(item.anhDaiDien || '');

            // Fill đa ngữ
            $("#tenMonEdit").val(item.tenMon);
            ckeditormoTa.setData(item.moTa || '');
            ckeditornguyenLieu.setData(item.nguyenLieu || '');
            ckeditortraiNghiem.setData(item.traiNghiem || '');

            // Set ảnh đại diện
            if (item.anhDaiDien) {
                $("#showAnhDaiDienAdd").attr('src', item.anhDaiDien);
            }

            // Load tài liệu truyền thông
            initDaPhuongTienTable(id);

            // Load danh sách lễ hội
            if (item.listLeHoiID) {
                console.log(item.listLeHoiID, "Danh sách địa điểm đã chọn")
                let listDiaDiem = item.listLeHoiID.split(',').map(x => x.trim().toLowerCase());
                $("#LeHoiCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableLeHoi(listDiaDiem.map(item => item).join(','));
            }
        }
    });
}

//#region Xử lý thông tin chung
function dataUpdateAmThuc() {
    // Thông tin cơ bản
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val();
    const kieuMonID = $("#kieuMonEdit").val();
    const cheDoAnID = $("#cheDoAnEdit").val();
    const thuTu = $("#thuTuEdit").val();
    const dacSan = $("input[name='dacSanEdit']:checked").val() == "1" ? true : false;
    const trangThai = $("input[name='trangThaiEdit']:checked").val() == "1" ? true : false;
    const listLeHoiID = $("#LeHoiCoSanAdd").val() ? $("#LeHoiCoSanAdd").val().join(',') : '';

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichEdit").val();
    const tenMon = $("#tenMonEdit").val();
    const moTa = ckeditormoTa.getData();
    const nguyenLieu = ckeditornguyenLieu.getData();
    const traiNghiem = ckeditortraiNghiem.getData();

    const dtAmThuc = {
        MonAnUongID: amThucId,
        KieuMonID: kieuMonID || null,
        CheDoAnID: cheDoAnID || null,
        ThuTu: thuTu || 0,
        DacSan: dacSan,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenMon: tenMon,
        MoTa: moTa,
        NguyenLieu: nguyenLieu,
        TraiNghiem: traiNghiem,
        AnhDaiDienDetail: anhDaiDienDetail,
    };

    console.log(dtAmThuc);

    let formData = new FormData();
    formData.append('RequestAmThuc', JSON.stringify(dtAmThuc));
    if (fileAnhDaiDien) {
        formData.append('File', fileAnhDaiDien);
    }

    if (listLeHoiID) {
        console.log(listLeHoiID, "Danh sách lễ hội cập nhật")
        let dataLeHoi = {
            leHoiID: listLeHoiID,
            amThucID: amThucId
        }

        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VH_AmThucApi/AddRelationAmThuc`,
            data: JSON.stringify(dataLeHoi),
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                console.log(data, "Kết quả cập nhật ẩm thực thuộc lễ hội")
                if (!data.isSuccess && !data.value) {
                    showNotification(0, "Cập nhật ẩm thực thuộc lễ hội không thành công");
                    console.log(data.error);
                    return;
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(kieuMonID)) {
        showNotification(0, "Vui lòng chọn kiểu món")
    }
    else if (checkEmptyBlank(cheDoAnID)) {
        showNotification(0, "Vui lòng chọn chế độ ăn")
    }
    else if (checkEmptyBlank(tenMon)) {
        showNotification(0, "Vui lòng nhập tên món")
    }
    else if (checkTagHtmlSingle(tenMon)) {
        showNotification(0, "Tên món chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/VH_AmThucApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Cập nhật ẩm thực thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/AmThuc`;
                    }, 2000);
                } else {
                    showNotification(0, "Cập nhật ẩm thực không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

   
}

//#region Function Xử lý thông tin lễ hội
function initLeHoi() {
    getDataWithApi('GET', '/api/VH_LeHoiApi/Gets?MaNgonNgu=vi').then(data => {
        if (data && data.isSuccess && data.value) {
            console.log(data)
            $("#LeHoiCoSanAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tenLeHoiChild || item.tenLeHoiChild || 'Không rõ tên';
                $("#LeHoiCoSanAdd").append(`<option value="${item.leHoiID}">${displayText}</option>`);
            });
        }
    })
}

function initTableLeHoi(list) {
    const tableApi = {
        url: `${baseUrl}/api/VH_LeHoiApi/GetMulti?MaNgonNgu=vi&ListIDLeHoi=${list}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                console.log(data)
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                    <div class="info-main">
                        <a href="${baseUrl}/AdminTool/LeHoi/Details?id=${row.leHoiID}" class="text-primary text-decoration-none">
                            ${row.tenLeHoiChild || ''}
                        </a>
                    </div>
                    <div class="info-sub">${row.tenToChuc || ''}</div>
                </div>`;
            }
        },
        {
            targets: 2, 
            render: function (data, type, row, meta) {
                return row.theLoai || '';
            }
        },
        {
            targets: 3, 
            render: function (data, type, row, meta) {
                return row.capDo || '';
            }
        },
        {
            targets: 4, 
            render: function (data, type, row, meta) {
                return row.tanSuat || 0;
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return row.thoiGianDienRa || '';
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "tenLeHoiChild", "class": "left-align name-text" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "7%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align name-text" },
        { "data": "", "width": "8%", "class": "left-align" },
    ];

    initDataTableConfigNoSearch('dataGridLeHoi', tableApi, tableDefs, tableCols);
}
//#endregion Function Xử lý thông tin lễ hội

//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input);
}
//#endregion function validation
