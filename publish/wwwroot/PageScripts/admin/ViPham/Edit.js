const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');
const ckeditormoTaTacPham = CKEDITOR.replace('moTa_AnPham');

console.log(ViPhamId)

$(document).ready(function () {
    initDatePicker();
    CheckDateMinMax("#ngayPhatHien", "#ngayXuPhat")
    initLinhVucCapCha_NoAll("#linhVuc", "") 
    initDanhMucChung_NoAll(67, "#hinhThucXuPhat", "") 
    initDanhMucChung_NoAll(68, "#tinhTrang", "")
    initDanhMucChung_NoAll(25, "#theLoaiID_AnPham", "")
    initDanhMucChung_NoAll(54, "#tinhTrangID_AnPham", "")
    setTimeout(() => {
        loadData(ViPhamId);
    }, 300);
    initNgonNgu("#ngonNguDich")
    initNgonNgu("#ngonNgu_AnPham")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Khởi tạo bảng tổ chức vi phạm
    initTableToChucViPham();
    initTableCaNhanViPham();
    initDanhSachTacPham();

    // Lọc danh mục từng phần
    // Lấy đường dẫn hiện tại, ví dụ: /AdminTool/HoatDongTheThao/ViPham
    let path = window.location.pathname;

    // Tách phần giữa, ví dụ: "HoatDongTheThao"
    let section = path.split("/")[2];
    console.log(section)
    setTimeout(() => {
        switch (section) {
            case "HoatDongTheThao":
                $("#linhVuc").val(3).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongDuLich":
                $("#linhVuc").val(4).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongVanHoa":
                $("#linhVuc").val(2).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "BaoChi":
                $("#linhVuc").val(5).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            default:
                break;
        }
    }, 500);

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function() {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddViPham();
    })

    $("#buttonDelete").on("click", function() {
        let type = $("#idTypeDelete").val();
        if (type === 'media') {
            deleteDaPhuongTien();
        } else if (type === 'tochuc') {
            dataDeleteToChucViPham();
        } else if (type === 'canhan') {
            dataDeleteCaNhanViPham();
        }
    })

    $("#btnSavedanhSachAnPham").on("click", function () {
        dataAddTacPham();
    })

    $("#ngonNgu_AnPham").on('change', function (e) {
        $("#tenTacPham_AnPham").val("");
        ckeditormoTaTacPham.setData("");
        $("#tacGia_AnPham").val("");
        $("#nhaXuatBan_AnPham").val("");
    });

    $("#modalTacPham").on('hidden.bs.modal', function () {
        resetFormTacPham()
    })

    $(document).on('change', '#TacPhamCoSanAdd', function () {
        console.log(123)
        let listTacPham = $(this).val();
        listTacPham = listTacPham.filter(item => item !="");
        console.log("Giá trị đã chọn:", listTacPham);
        if (listTacPham) {
            console.log(456)
            initTableTacPham(Array.isArray(listTacPham) ? listTacPham.join(',') : listTacPham);
        }
    });

    // Xử lý giao diện văn bản tài liệu
    $(".loaiVanBan_group").hide();
    $("#TaiLieuViPham .with-title h4").text("Danh sách văn bản tài liệu vi phạm");
});

//#region Xử lý thông tin chung
function initListTheThao() {
    getDataWithApi('GET', '/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi').then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            $("#monTheThao").empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", "Chọn...");
            data.value.forEach(item => {
                $("#monTheThao").append(`<option value="${item.monTheThaoID}">${item.tenMon}</option>`);
            });
        }
    })
}

async function loadData(id) {
    try {
        const data = await getDataWithApi('GET', `/api/DM_XuPhatViPhamApi/Get?MaNgonNgu=vi&ViPhamID=${id}`);

        if (data && data.isSuccess && data.value) {
            const item = data.value.viPham;

            // Cập nhật tiêu đề trang
            const title = `Chỉnh sửa ${item.doiTuong}`;
            const htmlTitle = item.doiTuong
                ? `<div class='mainTitle'>Chỉnh sửa ${item.doiTuong}</div>`
                : '';
            $('#pageTitle').html(htmlTitle);
            document.title = title;

            const linhVucID = item.linhVucID;

            // Chờ tất cả danh sách load xong
            await Promise.all([
                initToChuc_NoAll(490, "#toChucXuPhat", "", linhVucID), // Tổ chức trao thưởng
                initListTheThao()
            ]);

            // Sau khi load xong tất cả
            if (linhVucID == 3) {
                $(".monTheThao").show();
            } else {
                $(".monTheThao").hide();
                $("#monTheThao").val(null).trigger('change');
            }

            if (linhVucID == 5) {
                $("#TacPhamViPham-tab").show();
            } else {
                $("#TacPhamViPham-tab").hide();
            }

            initListToChucViPham(linhVucID);
            initListCaNhanViPham(linhVucID);

            // Gán dữ liệu cho các field
            $("#linhVuc").val(linhVucID || '').trigger('change');
            $("#maDinhDanh").val(item.maDinhDanh || '');

            $("#hinhThucXuPhat").val(item.hinhThucXuPhatID || '').trigger('change');
            $("#tinhTrang").val(item.tinhTrangID || '').trigger('change');
            $("#ngayPhatHien").val(formatDateWithoutTime(item.ngayPhatHien) || '');
            $("#ngayXuPhat").val(formatDateWithoutTime(item.ngayXuPhat) || '');

            // Gán giá trị cho select phụ thuộc
            $("#toChucXuPhat").val(item.toChucID || '').trigger('change');

            // Gán môn thể thao
            // $("#monTheThao").val(item.monTheThaoID || '').trigger('change');

            // Gán tác phẩm có sẵn
            if (item.listIDTacPham) {
                console.log(item.listIDTacPham, "Danh sách tác phẩm đã chọn")
                let listTacPham = item.listIDTacPham.split(',').map(x => x.trim().toLowerCase());
                $("#TacPhamCoSanAdd").val(listTacPham.map(item => item)).trigger('change');
                initTableTacPham(listTacPham.map(item => item).join(','));
            }

            // Gán các field khác
            $("#thuTu").val(item.thuTu);
            $(`input[name='trangThai'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);
            $("#ngonNguDich").val(item.maNgonNgu || '').trigger('change');
            $("#tenViPham").val(item.tenViPham || '');
            $("#doiTuongViPham").val(item.doiTuong || '');
            ckeditormoTa.setData(item.moTa || '');
        }
    } catch (error) {
        console.error("Lỗi khi load dữ liệu vi phạm:", error);
    }
}

function dataAddViPham() {
    // Thông tin chung
    const linhVucID = $("#linhVuc").val();
    const maDinhDanh = $("#maDinhDanh").val();
    const ngayPhatHien = $("#ngayPhatHien").val();
    const ngayXuPhat = $("#ngayXuPhat").val();
    const toChucID = $("#toChucXuPhat").val();
    const hinhThucXuPhatID = $("#hinhThucXuPhat").val();
    const tinhTrangID = $("#tinhTrang").val();
    const thuTu = $("#thuTu").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const listTacPham = $("#TacPhamCoSanAdd").val() ? $("#TacPhamCoSanAdd").val().join(',') : null;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    // const tenViPham = $("#tenViPham").val();
    const doiTuong = $("#doiTuongViPham").val();
    const moTa = ckeditormoTa.getData();

    const dtViPham = {
        ViPhamID: ViPhamId,
        LinhVucID: linhVucID || null,
        MaDinhDanh: maDinhDanh || null,
        NgayPhatHien: ngayPhatHien ? formatDateToSaveAsString(ngayPhatHien) : null,
        NgayXuPhat: ngayXuPhat? formatDateToSaveAsString(ngayXuPhat) : null,
        ToChucID: toChucID || null,
        HinhThucXuPhatID: hinhThucXuPhatID || null,
        TinhTrangID: tinhTrangID || null,
        ThuTu: thuTu || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        // TenViPham: tenViPham,
        DoiTuong: doiTuong,
        MoTa: moTa,
        listIDTacPham: listTacPham || null
    };

    console.log('Dữ liệu vi phạm:', dtViPham);


    if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh) > 0) {
        showNotification(0, "Mã bảo tàng đã tồn tại")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(ngayPhatHien)) {
        showNotification(0, "Vui lòng chọn/nhập ngày phát hiện")
    }
    else if (isValidDateRange(ngayPhatHien, ngayXuPhat)) {
        showNotification(0, "Ngày xử phạt không hợp lệ")
    }
    else if (checkEmptyBlank(hinhThucXuPhatID)) {
        showNotification(0, "Vui lòng chọn hình thức xử phạt")
    }
    else if (checkEmptyBlank(toChucID)) {
        showNotification(0, "Vui lòng chọn tổ chức xử phạt")
    }
    else if (checkEmptyBlank(tinhTrangID)) {
        showNotification(0, "Vui lòng chọn tình trạng")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(doiTuong)) {
        showNotification(0, "Đối tượng vi phạm chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DM_XuPhatViPhamApi/Update`,
            contentType: 'application/json',
            data: JSON.stringify(dtViPham),
            success: function (data) {
                console.log(data)
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa vi phạm thành công");
                    setTimeout(function () {
                        let path = window.location.pathname;
                        // Tách phần giữa, ví dụ: "HoatDongTheThao"
                        let section = path.split("/")[2];
                        console.log(section)
                        switch (section) {
                            case "HoatDongTheThao":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongTheThao/ViPham`;
                                break;

                            case "HoatDongDuLich":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongDuLich/ViPham`;
                                break;

                            case "HoatDongVanHoa":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongVanHoa/ViPham`;
                                break;

                            case "BaoChi":
                                window.location.href = `${baseUrl}/AdminTool/BaoChi/ViPham`;
                                break;

                            default:
                                window.location.href = `${baseUrl}/AdminTool/ViPham/ViPham`;
                                break;
                        }
                    }, 2000);
                }
                else {
                    showNotification(0, "Chỉnh sửa vi phạm không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    
}
//#endregion Xử lý thông tin chung

//#region Xử lý tổ chức vi phạm 
let allToChucViPham = [];
let editingRowNodeToChuc = null;
let editingOldIDToChuc = null;
let originalRowDataToChuc = null;
let tableToChuc = null;

async function initListToChucViPham(IDLinhVuc) {
    allToChucViPham = []; // reset
    let data = JSON.stringify({ trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc });
    try {
        // Lấy tất cả tổ chức
        const res = await getDataWithApi('POST', '/api/ToChucApi/DanhSach', data);
        let allList = [];
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allList = res.value;
        }
        // Lấy danh sách đã có trong giải thưởng
        const thanhTichRes = await getDataWithApi('GET', `/api/DM_XuPhatViPhamApi/Get?MaNgonNgu=vi&ViPhamID=${ViPhamId}`);
        let usedIds = [];
        if (thanhTichRes && thanhTichRes.isSuccess && thanhTichRes.value && Array.isArray(thanhTichRes.value.listToChuc)) {
            usedIds = thanhTichRes.value.listToChuc.map(x => x.doiTuongID?.toString()).filter(Boolean);
        }
        // Lọc ra các tổ chức chưa có trong listToChuc
        allToChucViPham = allList.filter(t => !usedIds.includes((t.doiTuongID || t.toChucID || '').toString()));
    } catch (err) {
        console.error('Lỗi khi lấy danh sách tổ chức vi phạm:', err);
    }
}

function initTableToChucViPham() {
    // Nếu tableToChuc đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableToChucViPham')) {
        $('#tableToChucViPham').DataTable().clear().destroy();
    }

    const tableApi = {
        url: `/api/DM_XuPhatViPhamApi/Get?MaNgonNgu=vi&ViPhamID=${ViPhamId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value) {
                let listToChuc = [];
                data.value.listToChuc ? listToChuc = data.value.listToChuc : []
                if (listToChuc) {
                    listToChuc.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    console.log('Danh sách tổ chức vi phạm từ API:', listToChuc);
                    return listToChuc;
                }
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveToChucViPham hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelToChucViPham hgi-icon hgi-cancel"></button>
                    `;
                }

                const deleteIcon = `<i class="delete-to-chuc-dat-giai cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenDoiTuongViPham", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];
    
    tableToChuc = $('#tableToChucViPham').DataTable({
        ajax: tableApi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tổ chức vi phạm nào"
        }
    });

    // Thêm dòng mới
    let newRow = null;
    $('#btnAddToChucViPham').off('click').on('click', function () {
        if (editingRowNodeToChuc) return;
        const rowData = {
            tenDoiTuongViPham: createSelectToChucViPham(),
            _isNew: true
        };
        newRow = tableToChuc.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        editingRowNodeToChuc = $(newRow);
        editingOldIDToChuc = null;
        originalRowDataToChuc = null;
        initSelect2();
    });

    // Lưu dòng mới hoặc chỉnh sửa
    $('#tableToChucViPham').off('click', '.btnSaveToChucViPham').on('click', '.btnSaveToChucViPham', function () {
        let $select = editingRowNodeToChuc ? editingRowNodeToChuc.find('#selectToChucViPham') : $('#selectToChucViPham');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }
        let toChucID = $select.val();
        let tenToChuc = $select.find('option:selected').text();
        if (!toChucID) {
            showNotification(0, "Vui lòng chọn tổ chức vi phạm!");
            return;
        }
        const request = {
            viPhamID: ViPhamId,
            loaiDoiTuong: false,
            doiTuongID: toChucID
        };

        $.ajax({
            url: `${baseUrl}/api/DM_XuPhatViPhamApi/AddRelation`,
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Thêm tổ chức vi phạm thành công!");
                    // Reload danh sách tổ chức để loại bỏ tổ chức vừa thêm khỏi select
                    const linhVucID = $("#linhVuc").val();
                    initListToChucViPham(linhVucID).then(() => {
                        initTableToChucViPham(ViPhamId);
                    });
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });
        editingRowNodeToChuc = null;
        editingOldIDToChuc = null;
        originalRowDataToChuc = null;
        newRow = null;
    });

    // Hủy thêm/chỉnh sửa
    $('#tableToChucViPham').off('click', '.btnCancelToChucViPham').on('click', '.btnCancelToChucViPham', function () {
        if (!editingRowNodeToChuc) {
            editingRowNodeToChuc = $('#tableToChucViPham').find('tr.adding');
        }
        if (originalRowDataToChuc && editingRowNodeToChuc) {
            // Nếu đang edit, restore lại dữ liệu gốc
            tableToChuc.row(editingRowNodeToChuc).data(originalRowDataToChuc).draw(false);
        } else {
            // Nếu là add mới, chỉ remove trạng thái editing
            tableToChuc.row('.adding').remove().draw(false);
        }
        editingRowNodeToChuc = null;
        editingOldIDToChuc = null;
        originalRowDataToChuc = null;
        newRow = null;
    });

    // Xóa dòng
    $('#tableToChucViPham').off('click', '.delete-to-chuc-dat-giai').on('click', '.delete-to-chuc-dat-giai', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableToChuc.row(rowNode).data();

        $('#idDelete').val(rowData.doiTuongID);
        $('#nameDelete').text(`${rowData.tenDoiTuongViPham}`);
        $('#idTypeDelete').val('tochuc');
        $('#modalDelete').modal('show');
    });
}

// Hàm sinh select tổ chức vi phạm
function createSelectToChucViPham(selectedId = "") {
    let options = `<option value="">Chọn</option>`;
    allToChucViPham.forEach(t => {
        options += `<option value="${t.toChucID}" ${t.toChucID === selectedId ? "selected" : ""}>${t.tenToChuc}</option>`;
    });
    return `<select id="selectToChucViPham" class="form-control">${options}</select>`;
}

function dataDeleteToChucViPham() {
    let ToChucViPhamID = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DM_XuPhatViPhamApi/DeleteRelation?ViPhamID=${ViPhamId}&DoiTuongID=${ToChucViPhamID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa tổ chức vi phạm thành công!");
                // Reload danh sách tổ chức để thêm tổ chức vừa xóa trở lại select
                const linhVucID = $("#linhVuc").val();
                initListToChucViPham(linhVucID).then(() => {
                    initTableToChucViPham(ViPhamId);
                });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý tổ chức vi phạm

//#region Xử lý cá nhân vi phạm 
let allCaNhanViPham = [];
let editingRowNodeCaNhan = null;
let editingOldIDCaNhan = null;
let originalRowDataCaNhan = null;
let tableCaNhan = null;

async function initListCaNhanViPham(IDLinhVuc) {
    allCaNhanViPham = []; // reset

    try {
        // --- Lấy danh sách cá nhân đã có trong giải thưởng ---
        const thanhTichRes = await getDataWithApi('GET', `/api/DM_XuPhatViPhamApi/Get?MaNgonNgu=vi&ViPhamID=${ViPhamId}`);
        let usedIds = [];
        if (thanhTichRes?.isSuccess && Array.isArray(thanhTichRes.value?.listCaNhan)) {
            usedIds = thanhTichRes.value.listCaNhan
                .map(x => x.doiTuongID?.toString())
                .filter(Boolean);
        }

        let allList = [];

        switch (parseInt(IDLinhVuc)) {
            case 2: // Văn hóa
                {
                    const res = await getDataWithApi('GET', '/api/DM_CaNhan_NgheSiApi/Gets?MaNgonNgu=vi');
                    if (res?.isSuccess && Array.isArray(res.value)) {
                        allList = res.value;
                    }
                }
                break;

            case 3: // Thể thao
                {
                    const apiList = [
                        { url: '/api/DM_CaNhan_CanBoTheThaoApi/Gets?MaNgonNgu=vi', loai: 'Cán bộ thể thao' },
                        { url: '/api/DM_CaNhan_HuanLuyenVienApi/Gets?MaNgonNgu=vi', loai: 'Huấn luyện viên' },
                        { url: '/api/DM_CaNhan_TrongTaiApi/Gets?MaNgonNgu=vi', loai: 'Trọng tài' },
                        { url: '/api/DM_CaNhan_VanDongVienApi/Gets?MaNgonNgu=vi', loai: 'Vận động viên' }
                    ];

                    const results = await Promise.all(
                        apiList.map(async api => {
                            const res = await getDataWithApi('GET', api.url);
                            if (res?.isSuccess && Array.isArray(res.value)) {
                                return res.value.map(item => ({
                                    ...item,
                                    loaiCaNhan: api.loai
                                }));
                            }
                            return [];
                        })
                    );

                    allList = results.flat();
                }
                break;

            case 4: // Du lịch
                {
                    const res = await getDataWithApi('GET', '/api/DM_CaNhan_HuongDanVienApi/Gets?MaNgonNgu=vi');
                    if (res?.isSuccess && Array.isArray(res.value)) {
                        allList = res.value;
                    }
                }
                break;

            case 5: // Báo chí - xuất bản
                {
                    const res = await getDataWithApi('GET', '/api/DM_CaNhan_BaoChiApi/Gets?MaNgonNgu=vi');
                    if (res?.isSuccess && Array.isArray(res.value)) {
                        allList = res.value;
                    }
                }
                break;

            default:
                {
                    // Trường hợp mặc định vẫn dùng API gốc
                    const data = JSON.stringify({ trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc });
                    const res = await getDataWithApi('POST', '/api/CaNhanApi/DanhSach', data);
                    if (res?.isSuccess && Array.isArray(res.value)) {
                        allList = res.value;
                    }
                }
                break;
        }

        // --- Lọc ra các cá nhân chưa có trong danh sách đã vi phạm ---
        allCaNhanViPham = allList.filter(t => {
            const id = (t.doiTuongID || t.caNhanID || t.caNhanID || '').toString();
            return id && !usedIds.includes(id);
        });

        console.log("Danh sách cá nhân sau khi lọc:", allCaNhanViPham);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách cá nhân vi phạm:', err);
    }
}


function initTableCaNhanViPham() {
    // Nếu tableCaNhan đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableCaNhanViPham')) {
        $('#tableCaNhanViPham').DataTable().clear().destroy();
    }

    const tableApi = {
        url: `/api/DM_XuPhatViPhamApi/Get?MaNgonNgu=vi&ViPhamID=${ViPhamId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value) {
                let listCaNhan = []
                data.value.listCaNhan ? listCaNhan = data.value.listCaNhan : []
                if (listCaNhan) {
                    listCaNhan.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    return listCaNhan;
                }
                
                console.log('Danh sách cá nhân vi phạm từ API:', listCaNhan);
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveCaNhanViPham hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelCaNhanViPham hgi-icon hgi-cancel"></button>
                    `;
                }

                const deleteIcon = `<i class="delete-ca-nhan cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenDoiTuongViPham", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];
    
    tableCaNhan = $('#tableCaNhanViPham').DataTable({
        ajax: tableApi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có cá nhân vi phạm nào"
        }
    });

    // Thêm dòng mới
    let newRow = null;
    $('#btnAddCaNhanViPham').off('click').on('click', function () {
        if (editingRowNodeCaNhan) return;
        const rowData = {
            tenDoiTuongViPham: createSelectCaNhanViPham(),
            _isNew: true
        };
        newRow = tableCaNhan.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        editingRowNodeCaNhan = $(newRow);
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        initSelect2();
    });

    // Lưu dòng mới hoặc chỉnh sửa
    $('#tableCaNhanViPham').off('click', '.btnSaveCaNhanViPham').on('click', '.btnSaveCaNhanViPham', function () {
        let $select = editingRowNodeCaNhan ? editingRowNodeCaNhan.find('#selectCaNhanViPham') : $('#selectCaNhanViPham');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }
        let caNhanID = $select.val();
        let tenCaNhan = $select.find('option:selected').text();
        if (!caNhanID) {
            showNotification(0, "Vui lòng chọn cá nhân vi phạm!");
            return;
        }
        const request = {
            viPhamID: ViPhamId,
            loaiDoiTuong: true,
            doiTuongID: caNhanID
        };

        $.ajax({
            url: `${baseUrl}/api/DM_XuPhatViPhamApi/AddRelation`,
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Thêm cá nhân vi phạm thành công!");
                    // Reload danh sách cá nhân để loại bỏ cá nhân vừa thêm khỏi select
                    const linhVucID = $("#linhVuc").val();
                    initListCaNhanViPham(linhVucID).then(() => {
                        initTableCaNhanViPham(ViPhamId);
                    });
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });
        editingRowNodeCaNhan = null;
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        newRow = null;
    });

    // Hủy thêm/chỉnh sửa
    $('#tableCaNhanViPham').off('click', '.btnCancelCaNhanViPham').on('click', '.btnCancelCaNhanViPham', function () {
        if (!editingRowNodeCaNhan) {
            editingRowNodeCaNhan = $('#tableCaNhanViPham').find('tr.adding');
        }
        if (originalRowDataCaNhan && editingRowNodeCaNhan) {
            // Nếu đang edit, restore lại dữ liệu gốc
            tableCaNhan.row(editingRowNodeCaNhan).data(originalRowDataCaNhan).draw(false);
        } else {
            // Nếu là add mới, chỉ remove trạng thái editing
            tableCaNhan.row('.adding').remove().draw(false);
        }
        editingRowNodeCaNhan = null;
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        newRow = null;
    });

    // Xóa dòng
    $('#tableCaNhanViPham').off('click', '.delete-ca-nhan').on('click', '.delete-ca-nhan', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableCaNhan.row(rowNode).data();

        $('#idDelete').val(rowData.doiTuongID);
        $('#nameDelete').text(`${rowData.tenDoiTuongViPham}`);
        $('#idTypeDelete').val('canhan');
        $('#modalDelete').modal('show');
    });
}

// Hàm sinh select cá nhân vi phạm
function createSelectCaNhanViPham(selectedId = "") {
    let options = `<option value="">Chọn</option>`;
    allCaNhanViPham.forEach(t => {
        options += `<option value="${t.caNhanID}" ${t.caNhanID === selectedId ? "selected" : ""}>${t.hoTen}</option>`;
    });
    return `<select id="selectCaNhanViPham" class="form-control">${options}</select>`;
}

function dataDeleteCaNhanViPham() {
    let CaNhanViPhamID = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DM_XuPhatViPhamApi/DeleteRelation?ViPhamID=${ViPhamId}&DoiTuongID=${CaNhanViPhamID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa cá nhân vi phạm thành công!");
                // Reload danh sách cá nhân để thêm cá nhân vừa xóa trở lại select
                const linhVucID = $("#linhVuc").val();
                initListCaNhanViPham(linhVucID).then(() => {
                    initTableCaNhanViPham(ViPhamId);
                });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý cá nhân vi phạm

//#region Xử lý tác phẩm vi phạm
async function initTableTacPham(listTacPham) {
    console.log('Danh sách tác phẩm:', listTacPham);
    const tableApi = {
        url: `${baseUrl}/api/DM_ThanhTichApi/GetMultiTacPham?ListIDTacPham=${listTacPham}&MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
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
                            <img src="${row.hinhAnh || '/images/no-image.png'}" alt="${row.tenTacPham || ''}" onerror="this.onerror=null;this.src='/images/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenTacPham || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div>`;
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (data) {
                    return `<i class="hgi-icon hgi-check"></i>`;
                }
                else {
                    return `<i class="hgi-icon hgi-cancel"></i>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenTacPham", "width": "", "class": "left-align" },
        { "data": "tenTheLoai", "width": "220px", "class": "left-align" },
        { "data": "tacGia", "width": "220px", "class": "center-align" },
        { "data": "suDung", "width": "120px", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('dataGridTacPham', tableApi, tableDefs, tableCols);
}

function initDanhSachTacPham() {
    let options = ``;
    getDataWithApi('POST', '/api/TacPhamApi/DanhSach', JSON.stringify({ maNgonNgu: 'vi', linhVucID: 5})).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            data.value.forEach(item => {
                options += `<option value="${item.tacPhamID}">${item.tenTacPham}</option>`;
            });
        }
        $('#TacPhamCoSanAdd').html(options).val('').trigger('change');
    })
}

async function dataAddTacPham() {
    let tacPhamTranslations = [];
    let tacPhamID = $('#tacPhamID').val();
    let anhDaiDien = $('#fileAnhDaiDienPrev')[0]?.files[0] || null;
    let urlAnhDaiDien = $('#urlfileAnhDaiDienPrev').val() || null;

    let theLoaiID = $('#theLoaiID_AnPham').val() || null;
    let tinhTrangID = $('#tinhTrangID_AnPham').val() || null;
    let maDinhDanh = $('#maDinhDanh_AnPham').val()?.trim() || null;
    let namCongBo = $('#namCongBo_AnPham').val() || null;
    let suDung = $('input[name="trangThai_AnPham"]:checked').val() === "1";
    let thuTu = $('#thuTu_AnPham').val() || 1;

    let maNgonNgu = $("#ngonNguDich_AnPham").val() || 'vi';
    let tenTacPham = $("#tenTacPham_AnPham").val()?.trim() || null;
    let moTa = ckeditormoTaTacPham.getData() || null;
    let tacGia = $("#tacGia_AnPham").val()?.trim() || null;
    let nhaXuatBan = $("#nhaXuatBan_AnPham").val()?.trim() || null;


    // Gom object thông tin chung
    let TacPham = {
        TacPhamID: tacPhamID || null,
        TheLoaiID: theLoaiID,
        TinhTrangID: tinhTrangID || null,
        linhVucID: 5,
        MaDinhDanh: maDinhDanh,
        NamCongBo: namCongBo,
        ThuTu: thuTu != "" ? Number(thuTu) : 1,
        SuDung: suDung == '1' ? true : false,
        HinhAnh: urlAnhDaiDien
    };

    tacPhamTranslations.push({
        maNgonNgu: maNgonNgu,
        tenTacPham: tenTacPham,
        moTa: moTa,
        tacGia: tacGia,
        nhaXuatBan: nhaXuatBan
    });

    // Chuẩn bị formData để gửi lên server
    let formData = new FormData();
    formData.append("TacPham", JSON.stringify(TacPham));
    formData.append("TacPham_NoiDung", JSON.stringify(tacPhamTranslations)); // mảng bản dịch
    if (anhDaiDien) {
        formData.append("HinhAnh", anhDaiDien);
    }

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/TacPhamApi/ThemMoi`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            console.log(data)
            if (data.isSuccess && data.value) {
                // Lưu lại id địa điểm vừa thêm mới
                var newtacPhamID = data.value.tacPhamID || data.value.id || data.value;
                console.log("Địa điểm vừa thêm mới có ID:", newtacPhamID);
                // Lưu lại các giá trị select đã chọn trước đó
                var prevTacPham = $('#TacPhamCoSanAdd').val();
                console.log("Giá trị đã chọn trước đó:", prevTacPham);
                let dt = JSON.stringify({
                    maNgonNgu: "vi",
                    linhVucID: 5
                })
                console.log(dt)
                getDataWithApi('POST', '/api/TacPhamApi/DanhSach', dt).then(data => {
                    console.log(data)
                    if (data && data.isSuccess && data.value) {
                        var $select = $('#TacPhamCoSanAdd');
                        var prevValues = Array.isArray(prevTacPham) ? prevTacPham : [prevTacPham];
                        $select.empty();
                        $select.append('<option value="">Chọn</option>');
                        data.value.forEach(function (item) {
                            console.log(item, "Danh sách địa điểm")
                            var selected = '';
                            if (prevValues.includes(item.tacPhamID?.toString()) || prevValues.includes(item.id?.toString())) selected = 'selected';
                            if (item.tacPhamID == newtacPhamID || item.id == newtacPhamID) selected = 'selected';
                            $select.append(`<option value="${item.tacPhamID || item.id}" ${selected}>${item.tenTacPham || item.noiDung || 'Không rõ tên'}</option>`);
                        });
                        prevValues.push(newtacPhamID)
                        $select.trigger('change.select2');
                        if (prevValues) {
                            initTableTacPham(Array.isArray(prevValues) ? prevValues.join(',') : prevValues);
                        }
                    }
                })
                showNotification(1, "Thêm mới tác phẩm thành công");
                $('#modalTacPham').modal('hide');
            }
        },
        error: function (err) {
            showNotification(0, "Thêm mới tác phẩm không thành công");
            console.log(err)
        }
    })
}

function resetFormTacPham() {
    $('#tacPhamID').val('');
    $('#theLoaiID_AnPham').val('').trigger('change');
    $('#tinhTrangID_AnPham').val('').trigger('change');
    $('#maDinhDanh_AnPham').val('');
    $('#namCongBo_AnPham').val('');
    $('#thuTu_AnPham').val('1');
    $('#urlfileAnhDaiDienPrev').val('');
    $('#fileAnhDaiDienPrev').val(null);
    $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/addImage.png');
    $('input[name="trangThai_AnPham"][value="1"]').prop('checked', true);
    $("#tenTacPham_AnPham").val("");
    ckeditormoTaTacPham.setData("");
    $("#tacGia_AnPham").val("");
    $("#nhaXuatBan_AnPham").val("");
}
//#endregion Xử lý tác phẩm vi phạm

//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input);
}

const isValidEmailAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return !regex.test(input.trim());
};

const isValidUrlAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return !regex.test(input.trim());
};

const isInvalidPriceRange = (minValue, maxValue) => {
    // Cho phép rỗng (nếu 1 trong 2 trống thì không tính là lỗi)
    if (
        minValue === undefined || maxValue === undefined ||
        minValue === null || maxValue === null ||
        minValue === "" || maxValue === ""
    ) {
        return false;
    }

    // Nếu có ký tự không hợp lệ (chỉ cho phép số và dấu chấm)
    const validFormat = /^[0-9.]+$/;
    if (!validFormat.test(minValue) || !validFormat.test(maxValue)) {
        return true; // lỗi vì chứa text hoặc ký tự lạ
    }

    // Loại bỏ dấu chấm ngăn cách nghìn (VD: "1.000.000" → "1000000")
    const cleanMin = String(minValue).replace(/\./g, "");
    const cleanMax = String(maxValue).replace(/\./g, "");

    const min = parseFloat(cleanMin);
    const max = parseFloat(cleanMax);

    // Nếu không phải số hợp lệ thì lỗi
    if (isNaN(min) || isNaN(max)) return true;

    // Trả về true nếu giá cao nhất nhỏ hơn giá thấp nhất
    return max < min;
};

const isValidPositiveIntegerAllowEmpty = (value) => {
    // Cho phép rỗng
    if (value === undefined || value === null || value === "") {
        return false;
    }

    // Ép về string để xử lý
    const str = String(value);

    // Phải là chuỗi toàn ký tự số
    if (!/^\d+$/.test(str)) return true;

    // Ép về số
    const num = parseInt(str, 10);

    // Phải là số nguyên dương > 0
    return num <= 0;
};

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=95`
    if (toChucID) {
        url = `${url}&ToChucID=${toChucID}`
    }
    $.ajax({
        type: "GET",
        async: false,
        url: url,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log(data)
            if (data.isSuccess) {
                result = data.value
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

    return result
}

// const isValidDateRange = (start, end) => {

//     // Nếu thiếu 1 trong 2 → không lỗi
//     if (!start || !end) return false;


//     // Nếu ngày không hợp lệ
//     // if (isNaN(start) || isNaN(end)) return true;

//     return end < start;
// };

//#endregion function validation
