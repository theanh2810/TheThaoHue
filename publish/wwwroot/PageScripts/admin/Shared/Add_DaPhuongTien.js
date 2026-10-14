let tempDaPhuongTiens = [];
let RequestDaPhuongTiens = [];
let tempDaPhuongTienTranslations = [];
let currentEditingDaPhuongTienIndex = -1;

$(document).ready(function () {
    initTempDaPhuongTienTable();
    previewPicture()
    initNgonNgu("#ngonNguDPT")
    switchMediaData()

    //#region Xử lý Tài liệu truyền thông
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
        // Cũng cần xóa khỏi RequestDaPhuongTiens nếu item này đã được thêm vào
        if (index < RequestDaPhuongTiens.length) {
            RequestDaPhuongTiens.splice(index, 1);
        }
        refreshTempDaPhuongTienTable();
    });

    $("#formAddDaPhuongTien").on("submit", function (e) {
        e.preventDefault();
        saveDaPhuongTienToTemp(LoaiDoiTuong);
    });
    //endregion Xử lý Tài liệu truyền thông
});

//#region Function Xử lý tài liệu truyền thông
function initTempDaPhuongTienTable() {
    // Khởi tạo DataTable cho bảng tài liệu truyền thông tạm
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
            emptyTable: "Chưa có tài liệu truyền thông nào"
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
    console.log(item);
    // Populate form
    $('input[name="loaiMediaDPT"][value="' + item.LoaiMedia + '"]').prop('checked', true);
    //$("#duongDanFileDPT").val(item.duongDanHinhAnhBia);
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
    $("#fileDPT").val('');
    $("#duongDanFileDPT").val('');
    $('#showhinhAnhAdd').attr('src', '/assets/images/vector/addImage.png');
    $("#tacGiaDPT").val('');
    $("#thuTuDPT").val('');
    $('input[name="trangThaiDPT"][value="1"]').prop('checked', true);
    $('#ngonNguAdd').val('vi').trigger('change');
    $('#tieuDeDPT').val('');
    $('#moTaDPT').val('');
}

function saveDaPhuongTienToTemp(LoaiDoiTuong) {
    let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
    let fileDPT = $("#fileDPT")[0].files[0] || null;
    //let fileDPTTemp = $("#duongDanFileDPT").val();
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
        LoaiDoiTuong: LoaiDoiTuong,
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
            // Nếu là tài liệu truyền thông đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
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
        console.error('Lỗi khi lưu tài liệu truyền thông:', error);
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
//#endregion Function Xử lý tài liệu truyền thông