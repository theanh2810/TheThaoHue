// Lịch sử chấn thương HLV (Mục V)
let editingChanThuong = null;

function initTableChanThuong(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVien_ChanThuongApi/GetByCaNhan`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            caNhanID: nhanSuId,
            loaiNhanSu: 1 // 1 = HLV
        },
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
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
                return meta.row + 1;
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return `
                    <i class="edit-chanthuong cursor-pointer me-2" data-id="${row.chanThuongID}" title="Sửa">
                        <i class="hgi-icon hgi-edit"></i>
                    </i>
                    <i class="delete-chanthuong cursor-pointer text-danger" data-id="${row.chanThuongID}" title="Xoá">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>
                `;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "50px", class: "center-align" },
        { data: "namThang", width: "120px", class: "center-align",
            render: function (data, type, row) {
                return data ? data.substring(0, 7).split('-').reverse().join('/') : '';
            }
        },
        { data: "moTaChanThuong", class: "left-align" },
        { data: "thoiGianPhucHoi", class: "left-align" },
        { data: "hienTrang", class: "left-align" },
        { data: null, width: "100px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableChanThuong').DataTable({
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
            emptyTable: "Chưa có lịch sử chấn thương nào"
        },
        destroy: true
    });

    // Sự kiện thêm mới
    $('#btnAddChanThuong').off('click').on('click', function () {
        editingChanThuong = null;
        $('#modalChanThuongTitle').text('Thêm mới chấn thương');
        clearChanThuongForm();
        $('#modalChanThuong').modal('show');
    });

    // Sự kiện chỉnh sửa
    $(document).off('click', '.edit-chanthuong').on('click', '.edit-chanthuong', function () {
        const id = $(this).data('id');
        const rows = table.rows().data();
        let item = null;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].chanThuongID === id) {
                item = rows[i];
                break;
            }
        }
        if (item) {
            editingChanThuong = item;
            $('#modalChanThuongTitle').text('Chỉnh sửa chấn thương');
            
            $('#tuNgayChanThuong').val(item.namThang || '');
            $('#moTaChanThuong').val(item.moTaChanThuong || '');
            $('#thoiGianPhucHoi').val(item.thoiGianPhucHoi || '');
            $('#hienTrangChanThuong').val(item.hienTrang || '');
            $('#thuTuChanThuong').val(item.thuTu || '');
            $('#modalChanThuong').modal('show');
        }
    });

    // Sự kiện lưu
    $('#btnSaveChanThuong').off('click').on('click', function () {
        const tuNgayRaw = $('#tuNgayChanThuong').val().trim();
        const moTaChanThuong = $('#moTaChanThuong').val().trim();
        const thoiGianPhucHoi = $('#thoiGianPhucHoi').val().trim();
        const hienTrang = $('#hienTrangChanThuong').val().trim();
        const thuTu = $('#thuTuChanThuong').val();

        if (!tuNgayRaw) {
            showNotification(0, 'Vui lòng nhập tháng/năm chấn thương');
            return;
        }

        //let parsedDate = null;
        //const dateParts = tuNgayRaw.split('/');
        //if (dateParts.length === 2) {
        //    parsedDate = `${dateParts[1]}-${dateParts[0]}-01`;
        //} else if (dateParts.length === 3) {
        //    parsedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        //} else {
        //    showNotification(0, 'Tháng/năm không hợp lệ (định dạng đúng: MM/yyyy)');
        //    return;
        //}

        const data = {
            chanThuongID: editingChanThuong ? editingChanThuong.chanThuongID : null,
            caNhanID: NhanSuId,
            loaiNhanSu: 1, // HLV
            namThang: tuNgayRaw, //parsedDate,
            moTaChanThuong: moTaChanThuong || null,
            thoiGianPhucHoi: thoiGianPhucHoi || null,
            hienTrang: hienTrang || null,
            thuTu: thuTu ? parseInt(thuTu) : 0
        };

        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VanDongVien_ChanThuongApi/Save`,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (response) {
                if (response.isSuccess) {
                    showNotification(1, editingChanThuong ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                    $('#modalChanThuong').modal('hide');
                    table.ajax.reload();
                } else {
                    showNotification(0, response.error || 'Lỗi không xác định');
                }
            },
            error: function (err) {
                showNotification(0, 'Lỗi khi lưu dữ liệu');
                console.log(err);
            }
        });
    });

    // Sự kiện xoá
    $(document).off('click', '.delete-chanthuong').on('click', '.delete-chanthuong', function () {
        const id = $(this).data('id');
        if (confirm('Bạn chắc chắn muốn xoá chấn thương này?')) {
            $.ajax({
                type: 'DELETE',
                url: `${baseUrl}/api/VanDongVien_ChanThuongApi/Delete/${id}`,
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    if (response.isSuccess) {
                        showNotification(1, 'Xoá thành công');
                        table.ajax.reload();
                    } else {
                        showNotification(0, response.error || 'Lỗi xoá');
                    }
                },
                error: function (err) {
                    showNotification(0, 'Lỗi khi xoá');
                    console.log(err);
                }
            });
        }
    });

    // Reset modal khi đóng
    $('#modalChanThuong').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingChanThuong = null;
        clearChanThuongForm();
    });
}

function clearChanThuongForm() {
    $('#tuNgayChanThuong').val('');
    $('#moTaChanThuong').val('');
    $('#thoiGianPhucHoi').val('');
    $('#hienTrangChanThuong').val('');
    $('#thuTuChanThuong').val('1');
}
