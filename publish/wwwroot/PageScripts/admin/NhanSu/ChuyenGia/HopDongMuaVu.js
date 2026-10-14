// Hợp đồng theo mùa vụ - Chuyên gia
let editingHopDong = null;
let allToChucHopDong = [];

function initTableHopDong(nhanSuId) {
    loadToChucHopDong();

    const tableApi = {
        url: `${baseUrl}/api/CaNhanHopDongMuaVuApi/GetByCaNhan/${nhanSuId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
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
            targets: 4, // Từ ngày
            render: function (data) {
                return data ? formatDateWithoutTime(data) : '';
            }
        },
        {
            targets: 5, // Đến ngày
            render: function (data) {
                return data ? formatDateWithoutTime(data) : '';
            }
        },
        {
            targets: 6, // Giá trị
            render: function (data) {
                return (data !== null && data !== undefined && data !== '')
                    ? Number(data).toLocaleString('vi-VN')
                    : '';
            }
        },
        {
            targets: 7, // Trạng thái
            render: function (data, type, row) {
                return row.tenTrangThai || '';
            }
        },
        {
            targets: 8, // File
            render: function (data, type, row) {
                return row.fileDinhKem
                    ? `<a href="${row.fileDinhKem}" target="_blank" title="Tải file"><i class="hgi-icon hgi-file-attachment"></i></a>`
                    : '';
            }
        },
        {
            targets: 9, // Chức năng
            render: function (data, type, row) {
                return `
                    <i class="edit-hopdong cursor-pointer me-2" data-id="${row.hopDongID}" title="Sửa">
                        <i class="hgi-icon hgi-edit"></i>
                    </i>
                    <i class="delete-hopdong cursor-pointer text-danger" data-id="${row.hopDongID}" title="Xoá">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>
                `;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "50px", class: "center-align" },
        { data: "soHopDong", class: "left-align" },
        { data: "tenMuaVu", class: "left-align" },
        { data: "tenToChuc", class: "left-align" },
        { data: "tuNgay", width: "100px", class: "center-align" },
        { data: "denNgay", width: "100px", class: "center-align" },
        { data: "giaTri", width: "120px", class: "right-align" },
        { data: "trangThai", width: "110px", class: "center-align" },
        { data: null, width: "60px", class: "center-align" },
        { data: null, width: "100px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableHopDong').DataTable({
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
            emptyTable: "Chưa có hợp đồng nào"
        },
        destroy: true
    });

    // Thêm mới
    $('#btnAddHopDong').off('click').on('click', function () {
        editingHopDong = null;
        $('#modalHopDongTitle').text('Thêm mới hợp đồng');
        clearHopDongForm();
        $('#modalHopDong').modal('show');
        initDatePicker();
    });

    // Chỉnh sửa
    $(document).off('click', '.edit-hopdong').on('click', '.edit-hopdong', function () {
        const id = $(this).data('id');
        const rows = table.rows().data();
        let item = null;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].hopDongID === id) {
                item = rows[i];
                break;
            }
        }
        if (item) {
            editingHopDong = item;
            $('#modalHopDongTitle').text('Chỉnh sửa hợp đồng');
            $('#soHopDong').val(item.soHopDong || '');
            $('#tenMuaVu').val(item.tenMuaVu || '');
            $('#toChucHd').val(item.toChucID || '').trigger('change');
            $('#tuNgayHd').val(formatDateWithoutTime(item.tuNgay) || '');
            $('#denNgayHd').val(formatDateWithoutTime(item.denNgay) || '');
            $('#giaTriHd').val(item.giaTri != null ? item.giaTri : '');
            $('#viTriHd').val(item.viTri || '');
            $('#trangThaiHd').val(item.trangThai || '');
            $('#thuTuHd').val(item.thuTu != null ? item.thuTu : '');
            $('#ghiChuHd').val(item.ghiChu || '');
            $('#fileHopDong').val('');
            $('#fileHopDongCu').val(item.fileDinhKem || '');
            $('#fileHopDongHienTai').html(item.fileDinhKem
                ? `File hiện tại: <a href="${item.fileDinhKem}" target="_blank">Xem file</a>`
                : '');
            $('#modalHopDong').modal('show');
            setTimeout(() => { initDatePicker(); }, 200);
        }
    });

    // Lưu
    $('#btnSaveHopDong').off('click').on('click', function () {
        const tenMuaVu = $('#tenMuaVu').val().trim();
        if (!tenMuaVu) {
            showNotification(0, 'Vui lòng nhập mùa vụ / mùa giải');
            return;
        }

        const tuNgay = $('#tuNgayHd').val();
        const denNgay = $('#denNgayHd').val();
        if (tuNgay && denNgay && isValidDateRange(tuNgay, denNgay)) {
            showNotification(0, 'Đến ngày phải sau hoặc bằng Từ ngày');
            return;
        }

        const giaTriRaw = $('#giaTriHd').val();
        const thuTuRaw = $('#thuTuHd').val();
        const trangThaiRaw = $('#trangThaiHd').val();

        const data = {
            hopDongID: editingHopDong ? editingHopDong.hopDongID : null,
            caNhanID: NhanSuId,
            soHopDong: $('#soHopDong').val().trim() || null,
            tenMuaVu: tenMuaVu,
            toChucID: $('#toChucHd').val() || null,
            tuNgay: tuNgay ? formatDateToSaveAsString(tuNgay) : null,
            denNgay: denNgay ? formatDateToSaveAsString(denNgay) : null,
            giaTri: giaTriRaw !== '' ? parseFloat(giaTriRaw) : null,
            viTri: $('#viTriHd').val().trim() || null,
            trangThai: trangThaiRaw !== '' ? parseInt(trangThaiRaw) : null,
            ghiChu: $('#ghiChuHd').val().trim() || null,
            thuTu: thuTuRaw !== '' ? parseInt(thuTuRaw) : null,
            fileDinhKemDetail: $('#fileHopDongCu').val() || null
        };

        const file = $('#fileHopDong')[0].files[0] || null;
        const formData = new FormData();
        formData.append('RequestHopDong', JSON.stringify(data));
        if (file) formData.append('File', file);

        const url = editingHopDong
            ? `${baseUrl}/api/CaNhanHopDongMuaVuApi/Update`
            : `${baseUrl}/api/CaNhanHopDongMuaVuApi/Add`;
        const method = editingHopDong ? 'PUT' : 'POST';

        $.ajax({
            type: method,
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response && response.isSuccess) {
                    showNotification(1, editingHopDong ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                    $('#modalHopDong').modal('hide');
                    table.ajax.reload();
                } else {
                    showNotification(0, (response && response.error) || 'Lỗi không xác định');
                }
            },
            error: function (err) {
                showNotification(0, 'Lỗi khi lưu dữ liệu');
                console.log(err);
            }
        });
    });

    // Xoá
    $(document).off('click', '.delete-hopdong').on('click', '.delete-hopdong', function () {
        const id = $(this).data('id');
        if (confirm('Bạn chắc chắn muốn xoá hợp đồng này?')) {
            $.ajax({
                type: 'DELETE',
                url: `${baseUrl}/api/CaNhanHopDongMuaVuApi/Delete/${id}`,
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    if (response && response.isSuccess) {
                        showNotification(1, 'Xoá thành công');
                        table.ajax.reload();
                    } else {
                        showNotification(0, (response && response.error) || 'Lỗi xoá');
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
    $('#modalHopDong').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingHopDong = null;
        clearHopDongForm();
    });
}

function loadToChucHopDong() {
    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/ToChucApi/DanhSach`,
        data: JSON.stringify({ loaiToChucID: 96 }),
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                allToChucHopDong = data.value;
                const select = $('#toChucHd');
                select.empty().append('<option value="">Chọn tổ chức</option>');
                data.value.forEach(item => {
                    select.append(`<option value="${item.toChucID}">${item.tenToChuc}</option>`);
                });
            }
        }
    });
}

function clearHopDongForm() {
    $('#soHopDong').val('');
    $('#tenMuaVu').val('');
    $('#toChucHd').val('');
    $('#tuNgayHd').val('');
    $('#denNgayHd').val('');
    $('#giaTriHd').val('');
    $('#viTriHd').val('');
    $('#trangThaiHd').val('');
    $('#thuTuHd').val('');
    $('#ghiChuHd').val('');
    $('#fileHopDong').val('');
    $('#fileHopDongCu').val('');
    $('#fileHopDongHienTai').html('');
}
