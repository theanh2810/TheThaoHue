const baseUrl = getRootLink();
const ckeditormoTaCoSoAnUong = CKEDITOR.replace('moTaCoSoAnUongEdit');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(50, "#loaiDichVuAnUongEdit", "") // Loại dịch vụ ăn uống
    initNgonNgu("#ngonNguDichCoSoAnUongEdit")
    previewPicture()
    previewPictureSuKien()
    initSelect2();
    // Load dữ liệu khi trang load
    setTimeout(() => {
        loadDataCoSoAnUong(CoSoAnUongId);
        initTableLoaiAmThuc(CoSoAnUongId);
        initTableMonAn(CoSoAnUongId);
    }, 100);

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoAnUongEdit', function() {
        let maNgonNgu = $(this).val();
        if (CoSoAnUongId && maNgonNgu) {
            loadTranslation(CoSoAnUongId, maNgonNgu);
        } else {
            $('#tenCoSoAnUongEdit').val('');
            $('#moTaCoSoAnUongEdit').val('');
            $('#nguoiDaiDienCoSoAnUongEdit').val('');
            $('#diaChiCoSoAnUongEdit').val('');
        }
    });

    $("#btnSaveEdit").on("click", function () {
        dataEditCoSoAnUong();
    })

    $("#buttonDelete").on("click", function() {
        let type = $("#idTypeDelete").val();
        if (type === 'media') {
            deleteDaPhuongTien();
        } else if (type === 'LoaiAmThuc') {
            dataDeleteLoaiAmThuc();
        } else if (type === 'MonAn') {
            dataDeleteMonAn();
        } else if (type === 'vanban') {
            dataDeleteVBTL();
        }
    })
});

//#region Xử lý thông tin chung
function loadDataCoSoAnUong(CoSoAnUongId) {
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DL_CoSoAnUongApi/Get?CoSoAnUongId=${CoSoAnUongId}&MaNgonNgu=vi`,
        success: function (data) {
            if (data.isSuccess && data.value) {
                const item = data.value;
                let title = `Thông tin ${item.tenCoSo}`;
                let htmlTitle = ``;
                if (item.tenCoSo) {
                    htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${item.tenCoSo}</div>`;
                }
                $('.TieuDe h2').html(htmlTitle);
                document.title = title;
                // Thông tin chung
                $("#DiaDiemCoSanAdd").val(item.diaDiemID).trigger('change');
                $("#phongCachCoSoAnUongEdit").val(item.phongCachCoSoID);
                console.log(item.loaiDichVuAnUongID)
                $("#loaiDichVuAnUongEdit").val(item.loaiDichVuAnUongID).trigger('change');
                $("#sucChuaCoSoAnUongEdit").val(item.sucChua);
                $("#diemDanhGiaCoSoAnUongEdit").val(item.diemDanhGia);
                $("#soLuotDanhGiaCoSoAnUongEdit").val(item.soLuotDanhGia);
                $("#dienThoaiCoSoAnUongEdit").val(item.dienThoai);
                $("#hopThuCoSoAnUongEdit").val(item.hopThu);
                $("#lienKetCoSoAnUongEdit").val(item.lienKet);
                $("#gioMoCuaCoSoAnUongEdit").val(item.gioMoCua);
                $("#gioDongCuaCoSoAnUongEdit").val(item.gioDongCua);
                $("#thuTuEdit").val(item.thuTu);
                $("#ngayNghiHangTuanCoSoAnUongEdit").val(item.ngayNghiHangTuan);
                $("#tiecGiaDinhCoSoAnUongEdit").prop('checked', item.tiecGiaDinh);
                $("#tiecDongNguoiCoSoAnUongEdit").prop('checked', item.tiecDongNguoi);
                $("#coPhongRiengCoSoAnUongEdit").prop('checked', item.coPhongRieng);
                $("#coVuiChoiTreEmCoSoAnUongEdit").prop('checked', item.coVuiChoiTreEm);
                $("#chuanDuLichCoSoAnUongEdit").prop('checked', item.chuanDuLich);
                $("#showAnhDaiDienDetail").val(item.anhDaiDien || '');
                $(`input[name='trangThaiHoatDong'][value='${item.trangThai ? 1 : 0}']`).prop('checked', true);
                if (item.anhDaiDien) {
                    $("#showAnhDaiDienAdd").attr('src', item.anhDaiDien);
                }
                $("#ngayNghiHangTuan").val(item.ngayNghiHangTuan ? item.ngayNghiHangTuan.split("-").map(item => item) : "").trigger("change")
                // Đa ngữ
                $("#tenCoSoAnUongEdit").val(item.tenCoSo);
                ckeditormoTaCoSoAnUong.setData(item.moTa || '');
                $("#nguoiDaiDienCoSoAnUongEdit").val(item.nguoiDaiDien);
                $("#diaChiCoSoAnUongEdit").val(item.diaChi);
                //ckeditortraiNghiemCoSoAnUong.setData(item.traiNghiem || '');
                //ckeditorgoiYCoSoAnUong.setData(item.goiY || '');

                // Load loại ẩm thực
                //loadLoaiAmThucByCoSo(CoSoAnUongId);

                // Load tài liệu truyền thông
                initDaPhuongTienTable(CoSoAnUongId);
            } else {
                showNotification(0, "Không tìm thấy dữ liệu cơ sở ăn uống");
            }
        },
        error: function (err) {
            console.log(err);
            showNotification(0, "Lỗi khi tải dữ liệu");
        }
    });
}

function loadTranslation(CoSoAnUongId, maNgonNgu) {
    getDataWithApi('GET', `/api/DL_CoSoAnUongApi/Get?CoSoAnUongId=${CoSoAnUongId}&MaNgonNgu=${maNgonNgu}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            $("#tenCoSoAnUongEdit").val(item.tenCoSo || '');
            if (typeof ckeditormoTaCoSoAnUong !== 'undefined') ckeditormoTaCoSoAnUong.setData(item.moTa || '');
            $("#nguoiDaiDienCoSoAnUongEdit").val(item.nguoiDaiDien || '');
            $("#diaChiCoSoAnUongEdit").val(item.diaChi || '');
        } else {
            $('#tenCoSoAnUongEdit').val('');
            if (typeof ckeditormoTaCoSoAnUong !== 'undefined') ckeditormoTaCoSoAnUong.setData('');
            $('#nguoiDaiDienCoSoAnUongEdit').val('');
            $('#diaChiCoSoAnUongEdit').val('');
        }
    })
}

function dataEditCoSoAnUong() {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiCoSoID = $("#loaiCoSoAnUongEdit").val();
    const phongCachCoSoID = $("#phongCachCoSoAnUongEdit").val();
    const loaiDichVuAnUongID = $("#loaiDichVuAnUongEdit").val();
    const hangSao = $("#hangSaoCoSoAnUongEdit").val();
    const sucChua = $("#sucChuaCoSoAnUongEdit").val();
    const diemDanhGia = $("#diemDanhGiaCoSoAnUongEdit").val();
    const soLuotDanhGia = $("#soLuotDanhGiaCoSoAnUongEdit").val();
    const dienThoai = $("#dienThoaiCoSoAnUongEdit").val();
    const hopThu = $("#hopThuCoSoAnUongEdit").val();
    const lienKet = $("#lienKetCoSoAnUongEdit").val();
    const gioMoCua = $("#gioMoCuaCoSoAnUongEdit").val();
    const gioDongCua = $("#gioDongCuaCoSoAnUongEdit").val();
    let ngayNghiHangTuanOption = $("#ngayNghiHangTuan").val()
    let ngayNghiHangTuan = null
    if (ngayNghiHangTuanOption.length > 0) {
        ngayNghiHangTuan = ngayNghiHangTuanOption.join("-")
    }
    const thuTu = $("#thuTuEdit").val();
    const tiecGiaDinh = $("#tiecGiaDinhCoSoAnUongEdit").is(':checked');
    const tiecDongNguoi = $("#tiecDongNguoiCoSoAnUongEdit").is(':checked');
    const coPhongRieng = $("#coPhongRiengCoSoAnUongEdit").is(':checked');
    const coVuiChoiTreEm = $("#coVuiChoiTreEmCoSoAnUongEdit").is(':checked');
    const chuanDuLich = $("#chuanDuLichCoSoAnUongEdit").is(':checked');
    const trangThai = $("input[name='trangThaiHoatDong']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoAnUongEdit").val();
    const tenCoSo = $("#tenCoSoAnUongEdit").val();
    const moTa = ckeditormoTaCoSoAnUong.getData();
    const nguoiDaiDien = $("#nguoiDaiDienCoSoAnUongEdit").val();
    const diaChi = $("#diaChiCoSoAnUongEdit").val();
    //const traiNghiem = ckeditortraiNghiemCoSoAnUong.getData();
    //const goiY = ckeditorgoiYCoSoAnUong.getData();
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val() || null;
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    const dtCoSo = {
        CoSoAnUongId: CoSoAnUongId,
        DiaDiemID: diaDiemID || null,
        LoaiCoSoID: loaiCoSoID || null,
        PhongCachCoSoID: phongCachCoSoID || null,
        LoaiDichVuAnUongID: loaiDichVuAnUongID || null,
        HangSao: hangSao || null,
        SucChua: sucChua || null,
        DiemDanhGia: diemDanhGia || null,
        SoLuotDanhGia: soLuotDanhGia || 0,
        DienThoai: dienThoai || null,
        HopThu: hopThu || null,
        LienKet: lienKet || null,
        GioMoCua: gioMoCua || null,
        GioDongCua: gioDongCua || null,
        ngayNghiHangTuan: ngayNghiHangTuan,
        TiecGiaDinh: tiecGiaDinh,
        TiecDongNguoi: tiecDongNguoi,
        CoPhongRieng: coPhongRieng,
        CoVuiChoiTreEm: coVuiChoiTreEm,
        ChuanDuLich: chuanDuLich,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenCoSo: tenCoSo,
        MoTa: moTa,
        NguoiDaiDien: nguoiDaiDien,
        DiaChi: diaChi,
        thuTu: thuTu || null,
        //TraiNghiem: traiNghiem,
        //GoiY: goiY,
        AnhDaiDienDetail: anhDaiDienDetail ? anhDaiDienDetail : null
    };

    let formData = new FormData();
    formData.append("RequestCoSoAnUong", JSON.stringify(dtCoSo));
    formData.append("File", fileAnhDaiDien);


    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (isValidPositiveIntegerAllowEmpty(sucChua) || sucChua >= 2147483647) {
        showNotification(0, "Sức chứa không hợp lệ")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkTagHtmlSingle(lienKet)) {
        showNotification(0, "Liên kết chứa ký tự không hợp lệ")
    }
    else if (isValidUrlAllowEmpty(lienKet)) {
        showNotification(0, "Liên kết không hợp lệ")
    }
    else if (checkEmptyBlank(loaiDichVuAnUongID)) {
        showNotification(0, "Vui lòng chọn loại dịch vụ ăn uống")
    }
    else if (checkEmptyBlank(tenCoSo)) {
        showNotification(0, "Vui lòng nhập tên cơ sở ăn uống")
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        showNotification(0, "Tên cơ sở ăn uống chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(nguoiDaiDien)) {
        showNotification(0, "Người đại diện chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (diaDiemID == null || diaDiemID == "") {
        showNotification(0, "Vui lòng chọn địa điểm");
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DL_CoSoAnUongApi/Update`,
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Cập nhật cơ sở ăn uống thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoAnUong`;
                    }, 2000);
                } else {
                    showNotification(0, "Cập nhật cơ sở ăn uống không thành công");
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

//#region Xử lý loại ẩm thực
let listLoaiAmThuc = [];
function initTableLoaiAmThuc(id) {
    listLoaiAmThuc = initListLoaiAmThuc(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoAnUongApi/GetByCoSo?MaNgonNgu=vi&CoSoAnUongId=${id}`,
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
                    return `<input type="checkbox" id="trangThaiLoaiAmThucEdit" name="trangThaiLoaiAmThuc" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveLoaiAmThuc hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelLoaiAmThuc hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-tien-nghi cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-tien-nghi cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenLoaiAmThuc", class: "left-align" },
        { data: "trangThai", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableLoaiAmThucCoSoAnUongEdit').DataTable({
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
            emptyTable: "Chưa có loại ẩm thực nào"
        }
    });

    // Hàm sinh ra select loại ẩm thực (loại bỏ loại ẩm thực đã chọn rồi)
    function createSelectLoaiAmThuc(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listLoaiAmThuc.forEach(t => {
            options += `<option value="${t.danhMucID}">${t.ten}</option>`;
        });
        return `<select id="selectLoaiAmThucEdit" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;
    $('#btnAddLoaiAmThucCoSoAnUongEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenLoaiAmThuc: createSelectLoaiAmThuc(),
            trangThai: `<input type="checkbox" id="trangThaiLoaiAmThucEdit" name="trangThaiLoaiAmThuc" checked>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tableLoaiAmThucCoSoAnUongEdit').on('click', '.btnCancelLoaiAmThuc', function () {
        if (originalRowData) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            listLoaiAmThuc = listLoaiAmThuc.filter(t => t.danhMucID !== originalRowData.LoaiAmThucID);
            originalRowData = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableLoaiAmThucCoSoAnUongEdit').on('click', '.edit-tien-nghi', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần edit:', rowData);
        originalRowData = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listLoaiAmThuc.push({ danhMucID: parseInt(rowData.LoaiAmThucID), ten: rowData.tenLoaiAmThuc });
        console.log('Danh sách loại ẩm thực sau khi thêm lại:', listLoaiAmThuc);

        const editRowData = {
            tenLoaiAmThuc: createSelectLoaiAmThuc(),
            trangThai: `<input type="checkbox" id="trangThaiLoaiAmThucEdit" name="trangThaiLoaiAmThuc" ${rowData.trangThai ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableLoaiAmThucCoSoAnUongEdit').on('click', '.btnSaveLoaiAmThuc', function () {
        let loaiAmThucID = $('#selectLoaiAmThucEdit').val();
        let tenDanhMuc = $('#selectLoaiAmThucEdit option:selected').text();
        let TrangThai = $('#trangThaiLoaiAmThucEdit').is(':checked');

        if (!loaiAmThucID) {
            showNotification(0, "Vui lòng chọn tiện nghi!");
            return;
        }

        const request = {
            CoSoAnUongId: id,
            LoaiAmThucID: parseInt(loaiAmThucID),
            TrangThai: TrangThai,
        };

        const isEdit = originalRowData !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoAnUongApi/UpdateRelation`
            : `${baseUrl}/api/DL_CoSoAnUongApi/AddRelation`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật loại ẩm thực thành công!" : "Thêm loại ẩm thực thành công!");
                    table.ajax.reload();
                    // Remove từ list options
                    listLoaiAmThuc = listLoaiAmThuc.filter(t => t.danhMucID !== parseInt(loaiAmThucID));
                    console.log('Danh sách loại ẩm thực sau khi xóa:', listLoaiAmThuc);
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
    $('#tableLoaiAmThucCoSoAnUongEdit').on('click', '.delete-tien-nghi', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần xóa:', rowData);
        $('#idDelete').val(rowData.loaiAmThucID);
        $('#nameDelete').text(`${rowData.tenLoaiAmThuc}`);
        $('#idTypeDelete').val('LoaiAmThuc');
        $('#modalDelete').modal('show');
    });
}

function initListLoaiAmThuc(id) {
    let listLoaiAmThuc = [];
    getDataWithApi('GET', `/api/DL_CoSoAnUongApi/GetsOption?CoSoAnUongId=${id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listLoaiAmThuc.push(...data.value);
            console.log('Danh sách loại ẩm thực khả dụng:', listLoaiAmThuc);
        }
    })
    return listLoaiAmThuc;
}

function dataDeleteLoaiAmThuc() {
    let LoaiAmThucID = $('#idDelete').val();
    let tenLoaiAmThuc = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoAnUongApi/DeleteRelation?CoSoAnUongId=${CoSoAnUongId}&LoaiAmThucID=${LoaiAmThucID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa loại ẩm thực thành công!");
                $('#tableLoaiAmThucCoSoAnUongEdit').DataTable().ajax.reload();
                // Add lại vào list options
                listLoaiAmThuc.push({ danhMucID: parseInt(LoaiAmThucID), ten: tenLoaiAmThuc });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa tiện nghi!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý loại ẩm thực

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

//#endregion function validation

//#region Xử lý Món ăn
let listMonAn = [];
function initTableMonAn(id) {
    listMonAn = initListMonAn(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoAnUong_AmThucApi/GetByCoSoAnUong?MaNgonNgu=vi&CoSoAnUongID=${id}`,
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
                    return `<input type="checkbox" id="trangThaiMonAnEdit" name="trangThaiMonAn" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveMonAn hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelMonAn hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-monan cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-monan cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenMon", class: "left-align" },
        { data: "trangThai", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableMonAnCoSoAnUongEdit').DataTable({
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
            emptyTable: "Chưa có món ăn nào"
        }
    });

    // Hàm sinh ra select Món ăn (loại bỏ món ăn đã chọn rồi)
    function createSelectMonAn(selectedId = "", isDisabled = false) {
        let options = `<option value="">Chọn</option>`;
        listMonAn.forEach(m => {
            options += `<option value="${m.monAnUongID}">${m.tenMon}</option>`;
        });
        const disabledAttr = isDisabled ? "disabled" : "";
        return `<select id="selectMonAnEdit" class="form-control" ${disabledAttr}>${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;
    $('#btnAddMonAnCoSoAnUongEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenMon: createSelectMonAn(),
            trangThai: `<input type="checkbox" id="trangThaiMonAnEdit" name="trangThaiMonAn" checked>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tableMonAnCoSoAnUongEdit').on('click', '.btnCancelMonAn', function () {
        if (originalRowData) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            listMonAn = listMonAn.filter(m => m.monAnUongID !== originalRowData.MonAnUongID);
            originalRowData = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableMonAnCoSoAnUongEdit').on('click', '.edit-monan', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần edit:', rowData);
        originalRowData = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listMonAn.push({ monAnUongID: rowData.monAnUongID || rowData.MonAnUongID, tenMon: rowData.tenMon });
        console.log('Danh sách món ăn sau khi thêm lại:', listMonAn);

        const editRowData = {
            tenMon: createSelectMonAn(rowData.monAnUongID || rowData.MonAnUongID, true),
            trangThai: `<input type="checkbox" id="trangThaiMonAnEdit" name="trangThaiMonAn" ${rowData.trangThai ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        // Set giá trị select sẽ được chọn sau khi draw
        setTimeout(() => {
            $('#selectMonAnEdit').val(rowData.monAnUongID || rowData.MonAnUongID).trigger('change');
            initSelect2();
        }, 100);
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableMonAnCoSoAnUongEdit').on('click', '.btnSaveMonAn', function () {
        let monAnUongID = $('#selectMonAnEdit').val();
        let tenMon = $('#selectMonAnEdit option:selected').text();
        let TrangThai = $('#trangThaiMonAnEdit').is(':checked');

        if (!monAnUongID) {
            showNotification(0, "Vui lòng chọn món ăn!");
            return;
        }

        const isEdit = originalRowData !== null;
        // Khi edit, dùng monAnUongID từ originalRowData, khi add thì dùng từ select
        const finalMonAnUongID = isEdit ? (originalRowData.monAnUongID || originalRowData.MonAnUongID) : monAnUongID;

        const request = {
            monAnUongID: finalMonAnUongID,
            coSoAnUongID: id,
            trangThai: TrangThai
        };

        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoAnUong_AmThucApi/Update`
            : `${baseUrl}/api/DL_CoSoAnUong_AmThucApi/Add`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!");
                    table.ajax.reload();
                    // Reload danh sách khả dụng sau khi thêm/update
                    reloadListMonAn(id);
                    // Remove từ list options
                    listMonAn = listMonAn.filter(m => m.monAnUongID !== monAnUongID);
                    console.log('Danh sách món ăn sau khi xóa:', listMonAn);
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
    $('#tableMonAnCoSoAnUongEdit').on('click', '.delete-monan', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần xóa:', rowData);
        $('#idDelete').val(rowData.monAnUongID);
        $('#nameDelete').text(`${rowData.tenMon}`);
        $('#idTypeDelete').val('MonAn');
        $('#modalDelete').modal('show');
    });
}

function initListMonAn(id) {
    let listMonAn = [];
    getDataWithApi('GET', `/api/DL_CoSoAnUong_AmThucApi/GetsAmThuc?MaNgonNgu=vi&CoSoAnUongID=${id}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listMonAn.push(...data.value);
            console.log('Danh sách món ăn khả dụng:', listMonAn);
        }
    })
    return listMonAn;
}

function reloadListMonAn(id) {
    getDataWithApi('GET', `/api/DL_CoSoAnUong_AmThucApi/GetsAmThuc?MaNgonNgu=vi&CoSoAnUongID=${id}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listMonAn = data.value;
            console.log('Danh sách món ăn đã reload:', listMonAn);
        } else {
            listMonAn = [];
        }
    })
}

function dataDeleteMonAn() {
    let MonAnUongID = $('#idDelete').val();
    let tenMon = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoAnUong_AmThucApi/Delete?CoSoAnUongID=${CoSoAnUongId}&MonAnUongID=${MonAnUongID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa món ăn thành công!");
                $('#tableMonAnCoSoAnUongEdit').DataTable().ajax.reload();
                // Reload danh sách khả dụng sau khi xóa
                reloadListMonAn(CoSoAnUongId);
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa món ăn!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý Món ăn
