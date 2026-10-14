let translationsDaPhuongTien = [];

$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    initNgonNgu("#ngonNguDPT")
    initDaPhuongTienTable(ID_Object);
    previewPicture()
    switchMediaData()

    //#region Xử lý Tài liệu truyền thông
    $("#modalAddDaPhuongTien").on('hidden.bs.modal', function () {
        translationsDaPhuongTien = []
        resetModal(this)
    })

    $('#btnAddDaPhuongTien').on('click', function () {
        $('#modalAddDaPhuongTien').modal('show');
        resetModal(this)
    });

    $("#formAddDaPhuongTien").on("submit", function (e) {
        e.preventDefault();
        dataAddDaPhuongTien(LoaiDoiTuong, ID_Object);
    });

    $("#ngonNguDPT").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = translationsDaPhuongTien.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDeDPT").val(exist.tieuDe);
            $("#moTaDPT").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDeDPT").val("");
            $("#moTaDPT").val("");
        }
        console.log("Sau khi đổi ngôn ngữ:", translationsDaPhuongTien);
    });

    $(document).on('click', '.edit-DaPhuongTien', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
        loadDataDaPhuongTien_FromTable(data);

        $("#modalAddDaPhuongTien").modal("show");
    });

    $(document).on('click', '.delete-DaPhuongTien', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
        $('#idDelete').val(data.daPhuongTienID);
        $('#nameDelete').text(`${data.tieuDe}`);
        $('#idTypeDelete').val('media');
        $('#modalDelete').modal('show');
    });

    $("#buttonDelete").on("click", function (e) {
        e.preventDefault(); // ⛔ Ngăn form submit & reload trang
        let type = $("#idTypeDelete").val();
        if (type === 'media') {
            deleteDaPhuongTien();
        }
    });
    //endregion Xử lý Tài liệu truyền thông
});

//#region Function Xử lý tài liệu truyền thông
function initDaPhuongTienTable(ID) {
    // Khởi tạo DataTable cho bảng tài liệu truyền thông tạm
    const tableApi = {
        url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                "doiTuongSoHuuID": ID,
            });
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
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
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.tacGia || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row.loaiMedia == 1) {
                    return `Hình ảnh`;
                } else if (row.loaiMedia == 2) {
                    return `Video`;
                } else if (row.loaiMedia == 3) {
                    return `Audio`;
                } else if (row.loaiMedia == 4) {
                    return `File khác`;
                }
                return ``;
            }
        },
        {
            targets: 4, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-DaPhuongTien text-yellow cursor-pointer me-2" data-index="${meta.row}" id="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;

                const deleteIcon = `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}" id="${meta.row}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`;

                return editIcon + deleteIcon;;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "width": "", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "tacGia", "width": "15%", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    // Destroy existing DataTable if exists
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        $('#dataGridDaPhuongTien').DataTable().destroy();
    }

    initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);
}

function dataAddDaPhuongTien(LoaiDoiTuong, ID_Object) {
    let daPhuongTienID = $('#idDPT').val() || null
    let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
    let fileDPT = $("#fileDPT")[0].files[0] || null;
    let tacGia = $("#tacGiaDPT").val();
    let thuTu = $("#thuTuDPT").val();
    let trangThai = $("input[name='trangThaiDPT']:checked").val();
    let duongDanFile = $("#duongDanFileDPT").val();

    let maNgonNgu = $("#ngonNguDPT").val();
    let tieuDe = $("#tieuDeDPT").val().trim();
    let moTa = $("#moTaDPT").val().trim();

    const DaPhuongTien = {
        LoaiMedia: Number(loaiMedia),
        LoaiDoiTuong: LoaiDoiTuong,
        doiTuongSoHuuID: ID_Object,
        DuongDanFile: duongDanFile,
        TacGia: tacGia,
        ThuTuHienThi: thuTu || 1,
        SuDung: trangThai == "1" ? true : false
    };

    const DaPhuongTien_NoiDung = [{
        maNgonNgu: maNgonNgu,
        tieuDe: tieuDe,
        moTa: moTa
    }]

    const FileDinhKem = [];
    if (fileDPT) {
        FileDinhKem.push(fileDPT);
    }

    console.log(DaPhuongTien, DaPhuongTien_NoiDung, FileDinhKem)

    let formData = new FormData();
    formData.append('DaPhuongTien', JSON.stringify(DaPhuongTien));
    formData.append('DaPhuongTien_NoiDung', JSON.stringify(DaPhuongTien_NoiDung));
    if (fileDPT) formData.append('File', fileDPT);

    if (daPhuongTienID != null) {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DaPhuongTienApi/ChinhSua/${daPhuongTienID}`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa tài liệu truyền thông thành công");
                    $('#modalAddDaPhuongTien').modal('hide');
                    initDaPhuongTienTable(ID_Object);
                } else {
                    showNotification(0, "Chỉnh sửa tài liệu truyền thông không thành công");
                    console.log(data.error) 
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    } else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DaPhuongTienApi/ThemMoi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới tài liệu truyền thông thành công");
                    $('#modalAddDaPhuongTien').modal('hide');
                    initDaPhuongTienTable(ID_Object);
                } else {
                    showNotification(0, "Thêm mới tài liệu truyền thông không thành công");
                    console.log(data.error) 
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
}

function loadDataDaPhuongTien_FromTable(data) {
    console.log(data, "data tài liệu truyền thông")
    $('#idDPT').val(data.daPhuongTienID);
    // Các input text
    $("input[name='loaiMediaDPT'][value='" + data.loaiMedia + "']").prop("checked", true);
    if (data.duongDanFile) {
        $("#showFileEdit").text(data.duongDanFile);
        $("#duongDanFileDPT").val(data.duongDanFile);
        $("#showhinhAnhAdd").attr("src", data.duongDanFile);
    } else {
        $("#showFileEdit").text("");
    }
    $("#tacGiaDPT").val(data.tacGia);
    $("#thuTuDPT").val(data.thuTuHienThi);
    $(`input[name='trangThaiAdd'][value='${data.suDung ? 1 : 0}']`).prop('checked', true);

    // Radio trạng thái
    $(`input[name='trangThaiAdd'][value='${data.suDung ? 1 : 0}']`).prop('checked', true);

    $('#ngonNguDPT').val('vi').trigger('change');
    loadTranslationDaPhuongTien(data.daPhuongTienID, 'vi');
}

function loadTranslationDaPhuongTien(daPhuongTienID, maNgonNgu) {
    getDataWithApi('GET', `/api/DaPhuongTienApi/BanDich/${daPhuongTienID}/${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch tài liệu truyền thông")
        if (data && data.isSuccess && data.value) {
            translationsDaPhuongTien = data.value;
            var banDich = translationsDaPhuongTien.find(el => el.maNgonNgu === maNgonNgu)
            // Populate các trường dịch với dữ liệu đa ngữ
            $('#tieuDeDPT').val(banDich.tieuDe);
            $('#moTaDPT').val(banDich.moTa);
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#tieuDeDPT").val('');
            $("#moTaDPT").val('');
        }  
    })
}

function deleteDaPhuongTien() {
    let id = $('#idDelete').val();
    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DaPhuongTienApi/Xoa/${id}`,
        async: false,
        contentType: "application/json, charset=utf-8",
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Xoá tài liệu truyền thông thành công");
                $('#modalDelete').modal('hide');
                $('#dataGridDaPhuongTien').DataTable().ajax.reload();
            } else {
                showNotification(0, "Xoá tài liệu truyền thông không thành công");
                console.log(data.error)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}
//#endregion Function Xử lý tài liệu truyền thông