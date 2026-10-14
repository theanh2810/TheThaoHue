const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();
    initSelect2();

    // Event handler cho thay đổi ngôn ngữ dịch
    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoLuuTru();
    })

    // Khởi tạo đa phương tiện
    //initTempDaPhuongTienTableCoSo();

    //#region Xử lý Đa phương tiện
    initTempDaPhuongTienTable();
    $('#btnAddDaPhuongTien').on('click', function () {
        currentEditingDaPhuongTienIndex = -1;
        tempDaPhuongTienTranslations = [];
        resetDaPhuongTienModal();
        $('#modalAddDaPhuongTien').modal('show');
    });

    $(document).on('click', '.edit-temp-DaPhuongTien', function () {
        const index = $(this).data('index');
        editTempDaPhuongTien(index);
    });

    $(document).on('click', '.delete-temp-DaPhuongTien', function () {
        const index = $(this).data('index');
        tempDaPhuongTiens.splice(index, 1);
        refreshTempDaPhuongTienTable();
    });

    $("#formAddDaPhuongTien").on("submit", function (e) {
        e.preventDefault();
        saveDaPhuongTienToTemp();
    });
    //#endregion Xử lý Đa phương tiện

    //#region Xử lý tọa độ, vị trí bản đồ
    $(document).on('change', '#DiaDiemCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        initTableDiaDiem(listDiaDiem);
    });

    $("#btnAddDiaDiem").on("click", function () {
        dataAddDiaDiem()
    })
    //#endregion Xử lý tọa độ, vị trí bản đồ
});

//#region Xử lý thông tin chung
function dataAddCoSoLuuTru() {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const dienThoai = $("#dienThoaiCoSoAdd").val();
    const trangThai = $("input[name='trangThaiCoSoAdd']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTuCoSoAdd").val()

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        NhomDichVuID: 295,
        DienThoai: dienThoai || null,
        TrangThai: trangThai,
        ThuTu: thuTu
    };

    // Đa phương tiện
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    let formData = new FormData();
    formData.append('EntityDichVu', JSON.stringify(dtCoSo));

    // Thêm đa phương tiện
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    if (checkEmptyBlank(diaDiemID)) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || Number(thuTu) > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DL_DichVuTienIchApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới điểm vệ sinh công cộng thành công");
                    // Redirect hoặc reset form
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong`;
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới cơ sở dịch vụ hỗ trợ không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}
//#endregion Xử lý thông tin chung

//#region Function Xử lý đa phương tiện
//let tempDaPhuongTiens = [];
//let RequestDaPhuongTiens = [];
//let tempDaPhuongTienTranslations = [];
//let currentEditingDaPhuongTienIndex = -1;
function initTempDaPhuongTienTable() {
    // Khởi tạo DataTable cho bảng đa phương tiện tạm
    console.log(tempDaPhuongTiens)
    const tableApi = {
        data: tempDaPhuongTiens,
        dataSrc: function (data) {
            console.log(data)
            return data.map((item, index) => ({
                ...item,
                stt: index + 1
            }));
        }
    };

    const tableDefs = [
        {
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanHinhAnhBia || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.TacGia || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row.LoaiMedia == 1) {
                    return `Hình ảnh`;
                } else if (row.LoaiMedia == 2) {
                    return `Video`;
                } else if (row.LoaiMedia == 3) {
                    return `Audio`;
                } else if (row.LoaiMedia == 4) {
                    return `File khác`;
                }
                return ``;
            }
        },
        {
            targets: 4, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-temp-DaPhuongTien text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;

                const deleteIcon = row.isExisting
                    ? `<i data-toggle="tooltip" title="Xóa khỏi hệ thống" class="delete-existing-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}" data-id="${row.DaPhuongTienID}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`
                    : `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-temp-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}">
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
        { "data": "TacGia", "width": "15%", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    // Destroy existing DataTable if exists
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        $('#dataGridDaPhuongTien').DataTable().destroy();
    }

    $('#dataGridDaPhuongTien').DataTable({
        data: tempDaPhuongTiens.map((item, index) => ({ ...item, stt: index + 1 })),
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có đa phương tiện nào"
        }
    });
}

function refreshTempDaPhuongTienTable() {
    // Cập nhật dữ liệu cho DataTable
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        const table = $('#dataGridDaPhuongTien').DataTable();
        const dataWithStt = tempDaPhuongTiens.map((item, index) => ({ ...item, stt: index + 1 }));
        table.clear().rows.add(dataWithStt).draw();
    } else {
        initTempDaPhuongTienTable();
    }
}

function editTempDaPhuongTien(index) {
    currentEditingDaPhuongTienIndex = index;
    const item = tempDaPhuongTiens[index];

    // Populate form
    $('input[name="loaiMediaDPT"][value="' + item.loaiMedia + '"]').prop('checked', true);
    if (item.loaiMedia == 1) {
        $("#fileHinhAnh").removeClass("d-none");
        $("#fileVideo, #fileAmThanh, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".jpg,.jpeg,.png,.gif,.webp,.bmp");
    } else if (item.loaiMedia == 2) {
        $("#fileVideo").removeClass("d-none");
        $("#fileHinhAnh, #fileAmThanh, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".mp4,.mov,.avi,.mkv,.webm");
    } else if (item.loaiMedia == 3) {
        $("#fileAmThanh").removeClass("d-none");
        $("#fileHinhAnh, #fileVideo, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".mp3,.wav,.ogg,.flac");
    } else if (item.loaiMedia == 4) {
        $("#fileKhac").removeClass("d-none");
        $("#fileHinhAnh, #fileVideo, #fileAmThanh").addClass("d-none");
        $("#fileDPT").attr("accept", "*/*");
    }
    $("#fileDPT").val(''); // Reset input file

    $("#tacGiaDPT").val(item.TacGia);
    $("#thuTuDPT").val(item.ThuTuHienThi);
    $('input[name="trangThaiDPT"][value="' + (item.suDung ? "1" : "0") + '"]').prop('checked', true);

    // Hiển thị ảnh bìa nếu có
    if (item.duongDanHinhAnhBia) {
        $('#showhinhAnhAdd').attr('src', item.duongDanHinhAnhBia);
    }

    //Nội dung đa ngữ
    $('#ngonNguDPT').val('vi').trigger('change');
    $('#tieuDeDPT').val(item.tieuDe);
    $('#moTaDPT').val(item.moTa);

    $('#modalAddDaPhuongTien').modal('show');
}

function resetDaPhuongTienModal() {
    $("#hinhAnhAdd").val('');
    $('#showhinhAnhAdd').attr('src', '/assets/images/vector/addImage.png');
    $("#tacGiaAdd").val('');
    $("#thuTuAdd").val('');
    $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
    $('#ngonNguAdd').val('vi').trigger('change');
    $('#tenFileAdd').val('');
    $('#moTaFileAdd').val('');
}

function saveDaPhuongTienToTemp() {
    let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
    let fileDPT = $("#fileDPT")[0].files[0] || null;
    let tacGia = $("#tacGiaDPT").val();
    let thuTu = $("#thuTuDPT").val();
    let trangThai = $("input[name='trangThaiDPT']:checked").val();
    let duongDanFile = $("#duongDanFileDPT").val();
    let previewAnhBiaSrc = $('#showhinhAnhAdd').attr('src');

    let maNgonNgu = $("#ngonNguDPT").val();
    let tieuDe = $("#tieuDeDPT").val().trim();
    let moTa = $("#moTaDPT").val().trim();

    const DaPhuongTienData = {
        LoaiMedia: Number(loaiMedia),
        DuongDanFile: duongDanFile,
        duongDanHinhAnhBia: previewAnhBiaSrc !== '/assets/images/vector/addImage.png' ? previewAnhBiaSrc : null,
        TacGia: tacGia,
        ThuTuHienThi: thuTu || 1,
        SuDung: trangThai == "1" ? true : false,
        maNgonNgu: maNgonNgu,
        tieuDe: tieuDe,
        moTa: moTa
    };

    const DaPhuongTien = {
        LoaiMedia: Number(loaiMedia),
        LoaiDoiTuong: "DM_SuKien",
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


    try {
        if (currentEditingDaPhuongTienIndex >= 0) {
            // Nếu là đa phương tiện đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
            if (tempDaPhuongTiens[currentEditingDaPhuongTienIndex].isExisting) {
                updateExistingDaPhuongTien(DaPhuongTienData);
            }
            tempDaPhuongTiens[currentEditingDaPhuongTienIndex] = DaPhuongTienData;
        } else {
            tempDaPhuongTiens.push(DaPhuongTienData);
            RequestDaPhuongTiens.push({
                DaPhuongTien: DaPhuongTien,
                DaPhuongTien_NoiDung: DaPhuongTien_NoiDung,
                File: FileDinhKem
            });
        }

        refreshTempDaPhuongTienTable();
        $('#modalAddDaPhuongTien').modal('hide');
        showNotification(1, currentEditingDaPhuongTienIndex >= 0 ? 'Cập nhật thành công' : 'Thêm thành công');
    } catch (error) {
        // Lỗi đã được hiển thị trong updateExistingDaPhuongTien
        console.error('Lỗi khi lưu đa phương tiện:', error);
    }
}

function createTempDaPhuongTiens() {
    const newDaPhuongTiens = tempDaPhuongTiens.filter(ap => !ap.isExisting);
    const listDaPhuongTien = [];
    for (let i = 0; i < newDaPhuongTiens.length; i++) {
        console.log(newDaPhuongTiens[i])
        listDaPhuongTien.push(newDaPhuongTiens[i]);
    }
    return listDaPhuongTien;
}

function createRequestDaPhuongTiens() {
    const requestDaPhuongTiens = RequestDaPhuongTiens.filter(ap => !ap.isExisting);
    const listDaPhuongTien = [];
    for (let i = 0; i < requestDaPhuongTiens.length; i++) {
        console.log(requestDaPhuongTiens[i])
        listDaPhuongTien.push(requestDaPhuongTiens[i]);
    }
    return listDaPhuongTien;
}
//#endregion Function Xử lý đa phương tiện

//#region Function Xử lý thông tin tọa độ, vị trí bản đồ
function initDiaDiem() {
    let dt = JSON.stringify({
        "maNgonNgu": "vi",
        "trangThai": true
    })

    getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            console.log(data)
            $("#DiaDiemCoSanAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tenDiaDiem || item.noiDung || 'Không rõ tên';
                $("#DiaDiemCoSanAdd").append(`<option value="${item.diaDiemID || item.id}">${displayText}</option>`);
            });
        }
    })
}

function dataAddDiaDiem() {
    //Thông tin địa điểm
    const DiaDiemID = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaDiemCapChaID = null //Chưa có trường địa điểm trong form thêm sự kiện
    const LinhVucID = $("#linhVucAdd").val();
    const XaID = $("#phuongXaAdd").val();
    const TinhID = $("#tinhThanhPhoAdd").val();
    const KinhDo = $("#kinhDoAdd").val();
    const ViDo = $("#viDoAdd").val();
    const CaoDo = $("#caoDoAdd").val();
    const BanDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const HinhAnh = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const NguoiKhuyetTat = $("#nguoiKhuyetTatAdd").is(":checked");
    const NhaVeSinh = $("#nhaVeSinhAdd").is(":checked");
    const BaiDoXe = $("#baiDoXeAdd").is(":checked");

    //Thông tin địa điểm dịch
    const MaNgonNguDiaDiem = $("#ngonNguDichDiaDiemAdd").val();
    const ThoiGianHoatDong = $("#thoiGianHoatDongDichAdd").val();
    const TenDiaDiem = $("#tenDiaDiemDichAdd").val();
    const SucChua = $("#sucChuaDichAdd").val();
    const HeToaDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaChiDiaDiem = $("#diaChiDichAdd").val();
    const MoTaDiaDiem = $("#moTaDichAdd").val();

    let diaDiem = {
        DiaDiemID: DiaDiemID,
        DiaDiemCapChaID: DiaDiemCapChaID,
        LinhVucID: LinhVucID,
        XaID: XaID,
        TinhID: TinhID,
        KinhDo: KinhDo,
        ViDo: ViDo,
        CaoDo: CaoDo,
        BanDo: BanDo,
        HinhAnh: HinhAnh,
        NguoiKhuyetTat: NguoiKhuyetTat,
        NhaVeSinh: NhaVeSinh,
        BaiDoXe: BaiDoXe,
    }


    let diaDiem_NoiDung = [{
        //Nội dung đa ngữ
        DiaDiemID: DiaDiemID,
        MaNgonNgu: MaNgonNguDiaDiem,
        ThoiGianHoatDong: ThoiGianHoatDong,
        TenDiaDiem: TenDiaDiem,
        SucChua: SucChua,
        HeToaDo: HeToaDo,
        DiaChi: DiaChiDiaDiem,
        MoTa: MoTaDiaDiem
    }]

    let formData = new FormData()
    formData.append("DiaDiem", JSON.stringify(diaDiem))
    formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiem_NoiDung))

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DiaDiemApi/ThemMoi`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            console.log(data)
            if (data.isSuccess && data.value) {
                // Lưu lại id địa điểm vừa thêm mới
                var newDiaDiemId = data.value.diaDiemID || data.value.id || data.value;
                console.log("Địa điểm vừa thêm mới có ID:", newDiaDiemId);
                // Lưu lại các giá trị select đã chọn trước đó
                var prevDiaDiem = $('#DiaDiemCoSanAdd').val();
                console.log("Giá trị đã chọn trước đó:", prevDiaDiem);
                let dt = JSON.stringify({
                    "maNgonNgu": "vi",
                    "trangThai": true
                })
                console.log(dt)
                getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
                    console.log(data)
                    if (data && data.isSuccess && data.value) {
                        var $select = $('#DiaDiemCoSanAdd');
                        var prevValues = Array.isArray(prevDiaDiem) ? prevDiaDiem : [prevDiaDiem];
                        $select.empty();
                        $select.append('<option value="">Chọn</option>');
                        data.value.forEach(function (item) {
                            console.log(item, "Danh sách địa điểm")
                            var selected = '';
                            if (prevValues.includes(item.diaDiemID?.toString()) || prevValues.includes(item.id?.toString())) selected = 'selected';
                            if (item.diaDiemID == newDiaDiemId || item.id == newDiaDiemId) selected = 'selected';
                            $select.append(`<option value="${item.diaDiemID || item.id}" ${selected}>${item.tenDiaDiem || item.noiDung || 'Không rõ tên'}</option>`);
                        });
                        prevValues.push(newDiaDiemId)
                        $select.trigger('change.select2');
                        initTableDiaDiem(prevValues.map(item => item).join(','));
                    }
                })
                $('#modalAddDiaDiem').modal('hide');
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

function initTableDiaDiem(list) {
    if (list != undefined) {
        const tableApi = {
            url: `${baseUrl}/api/DiaDiemApi/GetMulti?ListID=${list}&MaNgonNgu=vi`,
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
                targets: 3, // Cột số lượng cán bộ
                render: function (data, type, row, meta) {
                    return `<div class="group-info">
                            <div class="">Kinh độ: ${row.kinhDo ? row.kinhDo : "-"}</div>
                            <div class="">Vĩ độ: ${row.viDo ? row.viDo : "-"}</div>
                        </div>`;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenDiaDiem", "class": "left-align name-text" },
            { "data": "diaChi", "width": "30%", "class": "left-align" },
            { "data": "", "width": "30%", "class": "left-align" }
        ];

        initDataTableConfigNoSearch('dataGridDiaDiem', tableApi, tableDefs, tableCols);
    }
    console.log(list)
   
}
//#endregion Function Xử lý thông tin tọa độ, vị trí bản đồ


//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input);
}

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}

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