const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id")
    initDatePicker();
    initLinhVucCapCha_NoAll("#linhVuc", "")
    initDanhMucChung_NoAll(64, "#loaiGiaiThuong", "")
    initDanhMucChung_NoAll(65, "#capGiaiThuong", "")
    initDanhMucChung_NoAll(66, "#hangGiaiThuong", "")
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();
    setTimeout(() => {
        loadData(id);
    }, 300);

    // Khởi tạo bảng tổ chức đạt giải
    initToChucDatGiaiTable(id);
    //initCaNhanDatGiaiTable();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function () {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoLuuTru();
    })
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

function loadData(id) {
    getDataWithApi('GET', `/api/DM_ThanhTichApi/Get?MaNgonNgu=vi&ThanhTichID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value.thanhTich;
            initToChuc_NoAll("", "#toChucTraoThuong", "", item.linhVucID) // Tổ chức trao thưởng
            console.log('Dữ liệu giải thưởng:', item);
            let title = `Chỉnh sửa ${item.tenThanhTich}`;
            let htmlTitle = ``;
            if (item.tenThanhTich) {
                htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${item.tenThanhTich}</div>`;
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            $("#linhVuc").val(item.linhVucID || '').trigger('change');
            $("#maGiaiThuong").val(item.maDinhDanh || '');
            $("#loaiGiaiThuong").val(item.loaiID || '').trigger('change');
            $("#capGiaiThuong").val(item.capID || '').trigger('change');
            $("#hangGiaiThuong").val(item.hangID || '').trigger('change');
            setTimeout(() => {
                $("#toChucTraoThuong").val(item.toChucID || '').trigger('change');
            }, 200);
            $("#monTheThao").val(item.monTheThaoID || '').trigger('change');
            $("#ngayTraoGiai").val(formatDateWithoutTime(item.ngayTraoGiai) || '');
            $(`input[name='trangThai'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);
            $("#thuTu").val(item.thuTu);

            // Đa ngữ
            $("#ngonNguDich").val(item.maNgonNgu || '').trigger('change');
            $("#tenGiaiThuong").val(item.tenThanhTich || '');
            $("#doiTuongGiaiThuong").val(item.doiTuong || '');
            ckeditormoTa.setData(item.moTa || '');

            // // Load tổ chức đạt giải
            // if (item.listToChucDatGiaiID) {
            //     let listToChuc = item.listToChucDatGiaiID.split(',').map(x => x.trim().toLowerCase());
            //     initListToChucDatGiai(item.linhVucID, listToChuc);
            // }
            // // Load cá nhân đạt giải
            // if (item.listCaNhanDatGiaiID) {
            //     let listCaNhan = item.listCaNhanDatGiaiID.split(',').map(x => x.trim().toLowerCase());
            //     initListCaNhanDatGiai(item.linhVucID, listCaNhan);
            // }
        }
    })
}

function dataAddCoSoLuuTru() {
    // Thông tin chung
    // const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const linhVucID = $("#linhVuc").val();
    const maDinhDanh = $("#maGiaiThuong").val();
    const loaiGiaiThuongID = $("#loaiGiaiThuong").val();
    const capGiaiThuongID = $("#capGiaiThuong").val();
    const hangGiaiThuongID = $("#hangGiaiThuong").val();
    const toChucTraoThuongID = $("#toChucTraoThuong").val();
    const ngayTraoGiai = formatDateToSaveAsString($("#ngayTraoGiai").val());
    const monTheThaoID = $("#monTheThao").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTu").val();

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    const tenGiaiThuong = $("#tenGiaiThuong").val();
    const doiTuong = $("#doiTuongGiaiThuong").val();
    const moTa = ckeditormoTa.getData();
    // const ngayBatDau = $("#ngayBatDau").val();
    // const ngayKetThuc = $("#ngayKetThuc").val();

    // tổ chức và cá nhân đạt giải  
    const ToChucDatGiaiList = getToChucDatGiaiList();
    const CaNhanDatGiaiList = getCaNhanDatGiaiList();

    const dtGiaiThuong = {
        LinhVucID: linhVucID || null,
        MaDinhDanh: maDinhDanh || null,
        LoaiID: loaiGiaiThuongID || null,
        CapID: capGiaiThuongID || null,
        HangID: hangGiaiThuongID || null,
        ToChucID: toChucTraoThuongID || null,
        MonTheThaoID: monTheThaoID || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenThanhTich: tenGiaiThuong,
        DoiTuong: doiTuong,
        MoTa: moTa,
        NgayTraoGiai: ngayTraoGiai,
        ThuTu: thuTu,
    };

    // Tổ chức và cá nhân đạt giải
    const dtDoiTuongDatGiai = []
    if (ToChucDatGiaiList.length > 0) {
        ToChucDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    if (CaNhanDatGiaiList.length > 0) {
        CaNhanDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    // const requestVBTL = createRequestVBTLCoSo();

    if (!linhVucID) {
        showNotification(0, "Vui lòng chọn lĩnh vực");
        return;
    }



    let formData = new FormData();
    formData.append('EntityThanhTich', JSON.stringify(dtGiaiThuong));
    formData.append('EntityDoiTuong', JSON.stringify(dtDoiTuongDatGiai));
    // formData.append("File", fileAnhDaiDien);
    // formData.append('RequestVBTL', requestInfo.RequestVBTL);

    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    // Thêm văn bản tài liệu
    // for (let i = 0; i < requestVBTL.length; i++) {
    //     formData.append(`EntityVanBan[${i}].RequestVanBan`, JSON.stringify(requestVBTL[i].RequestVanBan));
    //     formData.append(`EntityVanBan[${i}].File`, requestVBTL[i].File[0]);
    // }   

    return

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DM_ThanhTichApi/Add`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Thêm mới giải thưởng thành công");
                setTimeout(function () {
                    window.location.href = `${baseUrl}/AdminTool/GiaiThuong/GiaiThuong`;
                }, 2000);
            } else {
                showNotification(0, "Thêm mới giải thưởng không thành công");
                console.log(data.error);
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
//#endregion Xử lý thông tin chung

//#region Xử lý tổ chức đạt giải
let listToChucDatGiai = [];

function initToChucDatGiaiTable(id) {
    listToChucDatGiai = initListToChucDatGiai(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsToChucDatGiai?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
        type: "GET",
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
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row) {
                if (row._isNew) {
                    return `<input type="checkbox" id="mienPhiEdit" name="mienPhi" ${row.MienPhi ? "checked" : ""}>`;
                } else {
                    return row.mienPhi ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row) {
                if (row._isNew) {
                    return `<input type="checkbox" id="trangThaiToChucDatGiaiEdit" name="trangThaiToChucDatGiai" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveToChucDatGiai hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelToChucDatGiai hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-to-chuc-dat-giai cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-to-chuc-dat-giai cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenToChucDatGiai", class: "left-align" },
        { data: "mienPhi", width: "100px", class: "center-align" },
        { data: "trangThai", width: "120px", class: "center-align" },
        { data: null, width: "120px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableToChucDatGiaiCoSoEdit').DataTable({
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
            emptyTable: "Chưa có tổ chức đạt giải nào"
        }
    });

    // Hàm sinh ra select tổ chức đạt giải (loại bỏ tổ chức đạt giải đã chọn rồi)
    function createSelectToChucDatGiai(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listToChucDatGiai.forEach(t => {
            options += `<option value="${t.danhMucID}">${t.ten}</option>`;
        });
        return `<select id="selectToChucDatGiaiEdit" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;
    $('#btnAddToChucDatGiaiCoSoEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenToChucDatGiai: createSelectToChucDatGiai(),
            mienPhi: `<input type="checkbox" id="mienPhiEdit" name="mienPhi">`,
            trangThai: `<input type="checkbox" id="trangThaiToChucDatGiaiEdit" name="trangThaiToChucDatGiai" checked>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tableToChucDatGiaiCoSoEdit').on('click', '.btnCancelToChucDatGiai', function () {
        if (originalRowData) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            listToChucDatGiai = listToChucDatGiai.filter(t => t.danhMucID !== originalRowData.ToChucDatGiaiID);
            originalRowData = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableToChucDatGiaiCoSoEdit').on('click', '.edit-tien-nghi', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần edit:', rowData);
        originalRowData = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listToChucDatGiai.push({ danhMucID: parseInt(rowData.ToChucDatGiaiID), ten: rowData.tenToChucDatGiai });
        console.log('Danh sách tổ chức đạt giải sau khi thêm lại:', listToChucDatGiai);

        const editRowData = {
            tenToChucDatGiai: createSelectToChucDatGiai(),
            mienPhi: `<input type="checkbox" id="mienPhiEdit" name="mienPhi" ${rowData.mienPhi ? "checked" : ""}>`,
            trangThai: `<input type="checkbox" id="trangThaiToChucDatGiaiEdit" name="trangThaiToChucDatGiai" ${rowData.trangThai ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableToChucDatGiaiCoSoEdit').on('click', '.btnSaveToChucDatGiai', function () {
        let danhMucID = $('#selectToChucDatGiaiEdit').val();
        let tenDanhMuc = $('#selectToChucDatGiaiEdit option:selected').text();
        let MienPhi = $('#mienPhiEdit').is(':checked');
        let TrangThai = $('#trangThaiToChucDatGiaiEdit').is(':checked');

        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn tổ chức đạt giải!");
            return;
        }

        const request = {
            CoSoLuuTruID: id,
            ToChucDatGiaiID: parseInt(danhMucID),
            TrangThai: TrangThai,
            MienPhi: MienPhi
        };

        const isEdit = originalRowData !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoLuuTruApi/UpdateToChucDatGiai`
            : `${baseUrl}/api/DL_CoSoLuuTruApi/AddToChucDatGiai`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật tổ chức đạt giải thành công!" : "Thêm tổ chức đạt giải thành công!");
                    table.ajax.reload();
                    // Remove từ list options
                    listToChucDatGiai = listToChucDatGiai.filter(t => t.danhMucID !== parseInt(danhMucID));
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });

        newRow = null;
        originalRowData = null;
    });

    // === Xóa dòng ===
    $('#tableToChucDatGiaiCoSoEdit').on('click', '.delete-tien-nghi', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        $('#idDelete').val(rowData.ToChucDatGiaiID);
        $('#nameDelete').text(`${rowData.tenToChucDatGiai}`);
        $('#idTypeDelete').val('ToChucDatGiai');
        $('#modalDelete').modal('show');
    });
}

function initListToChucDatGiai(id) {
    console.log(id)
    getDataWithApi('GET', `/api/DM_ThanhTichApi/Get?MaNgonNgu=vi&ThanhTichID=${id}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            const item = data.value.listToChuc;
            if (!item || item.length === 0) {
                getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
                    if (data && data.isSuccess && data.value.length > 0) {
                        listToChucDatGiai.push(...data.value);
                    }
                })
            } else {
                getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
                    if (data && data.isSuccess && data.value.length > 0) {
                        // Lọc bỏ những tổ chức đã chọn rồi
                        const selectedIds = item.map(x => x.toChucDatGiaiID);
                        data.value = data.value.filter(x => !selectedIds.includes(x.danhMucID));
                        listToChucDatGiai.push(...data.value);
                    }
                })
            }
            console.log('Danh sách tổ chức đạt giải khả dụng:', listToChucDatGiai);
        }
    })
    return listToChucDatGiai;
}

function dataDeleteToChucDatGiai() {
    let ToChucDatGiaiID = $('#idDelete').val();
    let tenToChucDatGiai = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/DeleteToChucDatGiai?CoSoLuuTruID=${CoSoLuuTruId}&ToChucDatGiaiID=${ToChucDatGiaiID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa tổ chức đạt giải thành công!");
                $('#tableToChucDatGiaiCoSoEdit').DataTable().ajax.reload();
                // Add lại vào list options
                listToChucDatGiai.push({ danhMucID: parseInt(ToChucDatGiaiID), tenDanhMuc: tenToChucDatGiai });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa tổ chức đạt giải!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý tổ chức đạt giải