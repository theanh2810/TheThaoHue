// Thông tin kỷ luật VĐV
let editingKyLuat = null;

function formatKyLuatDate(value) {
    return value ? formatDateWithoutTime(value) : '';
}

function saveKyLuatDate(selector) {
    const value = $(selector).val().trim();
    return value ? formatDateToSaveAsString(value) : null;
}

function initTableKyLuat(nhanSuId) {
    initDanhMucChung_NoAll(67, '#hinhThucKyLuat', '');

    const table = $('#tableKyLuat').DataTable({
        ajax: {
            url: `${baseUrl}/api/VanDongVien_KyLuatApi/GetByCaNhan`,
            type: 'GET',
            data: { caNhanID: nhanSuId },
            dataSrc: function (data) {
                return data && data.isSuccess ? (data.value || []) : [];
            }
        },
        columns: [
            { data: null, width: '45px', class: 'center-align', render: (data, type, row, meta) => meta.row + 1 },
            { data: 'ngayViPham', width: '100px', class: 'center-align', render: formatKyLuatDate },
            { data: 'noiDungViPham', class: 'left-align' },
            { data: 'tenHinhThucKyLuat', class: 'left-align' },
            { data: 'quyetDinhKyLuat', class: 'left-align' },
            {
                data: null,
                class: 'center-align',
                render: row => {
                    const start = formatKyLuatDate(row.ngayBatDauKyLuat);
                    const end = formatKyLuatDate(row.ngayKetThucKyLuat);
                    return [start, end].filter(Boolean).join(' - ');
                }
            },
            { data: 'thoiHan', class: 'left-align' },
            {
                data: null,
                width: '100px',
                class: 'center-align group-icon-action',
                render: row => `<i class="edit-kyluat cursor-pointer me-2" data-id="${row.kyLuatID}" title="Sửa"><i class="hgi-icon hgi-edit"></i></i><i class="delete-kyluat cursor-pointer text-danger" data-id="${row.kyLuatID}" title="Xóa"><i class="hgi-icon hgi-delete"></i></i>`
            }
        ],
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: { emptyTable: 'Chưa có thông tin kỷ luật nào' },
        destroy: true
    });

    $('#btnAddKyLuat').off('click').on('click', function () {
        editingKyLuat = null;
        $('#modalKyLuatTitle').text('Thêm mới kỷ luật');
        clearKyLuatForm();
        $('#modalKyLuat').modal('show');
    });

    $(document).off('click', '.edit-kyluat').on('click', '.edit-kyluat', function () {
        const id = $(this).data('id');
        const item = table.rows().data().toArray().find(row => String(row.kyLuatID) === String(id));
        if (!item) return;

        editingKyLuat = item;
        $('#modalKyLuatTitle').text('Chỉnh sửa kỷ luật');
        $('#ngayViPhamKyLuat').val(formatKyLuatDate(item.ngayViPham));
        $('#noiDungViPhamKyLuat').val(item.noiDungViPham || '');
        $('#hinhThucKyLuat').val(item.hinhThucKyLuatID || '').trigger('change');
        $('#quyetDinhKyLuat').val(item.quyetDinhKyLuat || '');
        $('#ngayQuyetDinhKyLuat').val(formatKyLuatDate(item.ngayQuyetDinh));
        $('#ngayBatDauKyLuat').val(formatKyLuatDate(item.ngayBatDauKyLuat));
        $('#ngayKetThucKyLuat').val(formatKyLuatDate(item.ngayKetThucKyLuat));
        $('#thoiHanKyLuat').val(item.thoiHan || '');
        $('#moTaKyLuat').val(item.moTa || '');
        $('#thuTuKyLuat').val(item.thuTu || '');
        $('#modalKyLuat').modal('show');
    });

    $('#btnSaveKyLuat').off('click').on('click', function () {
        const ngayBatDau = saveKyLuatDate('#ngayBatDauKyLuat');
        const ngayKetThuc = saveKyLuatDate('#ngayKetThucKyLuat');

        if (ngayBatDau && ngayKetThuc && new Date(ngayKetThuc) < new Date(ngayBatDau)) {
            showNotification(0, 'Ngày kết thúc không được trước ngày bắt đầu');
            return;
        }

        const data = {
            kyLuatID: editingKyLuat ? editingKyLuat.kyLuatID : null,
            caNhanID: NhanSuId,
            ngayViPham: saveKyLuatDate('#ngayViPhamKyLuat'),
            noiDungViPham: $('#noiDungViPhamKyLuat').val().trim() || null,
            hinhThucKyLuatID: $('#hinhThucKyLuat').val() ? parseInt($('#hinhThucKyLuat').val(), 10) : null,
            quyetDinhKyLuat: $('#quyetDinhKyLuat').val().trim() || null,
            ngayQuyetDinh: saveKyLuatDate('#ngayQuyetDinhKyLuat'),
            ngayBatDauKyLuat: ngayBatDau,
            ngayKetThucKyLuat: ngayKetThuc,
            thoiHan: $('#thoiHanKyLuat').val().trim() || null,
            moTa: $('#moTaKyLuat').val().trim() || null,
            thuTu: parseInt($('#thuTuKyLuat').val(), 10) || 0
        };

        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VanDongVien_KyLuatApi/Save`,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (response) {
                if (!response.isSuccess) {
                    showNotification(0, response.error || 'Lỗi không xác định');
                    return;
                }
                showNotification(1, editingKyLuat ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                $('#modalKyLuat').modal('hide');
                table.ajax.reload();
            },
            error: function () { showNotification(0, 'Lỗi khi lưu thông tin kỷ luật'); }
        });
    });

    $(document).off('click', '.delete-kyluat').on('click', '.delete-kyluat', function () {
        const id = $(this).data('id');
        if (!confirm('Bạn chắc chắn muốn xóa thông tin kỷ luật này?')) return;

        $.ajax({
            type: 'DELETE',
            url: `${baseUrl}/api/VanDongVien_KyLuatApi/Delete/${id}`,
            dataType: 'json',
            success: function (response) {
                if (response.isSuccess) {
                    showNotification(1, 'Xóa thành công');
                    table.ajax.reload();
                } else {
                    showNotification(0, response.error || 'Lỗi xóa');
                }
            },
            error: function () { showNotification(0, 'Lỗi khi xóa thông tin kỷ luật'); }
        });
    });

    $('#modalKyLuat').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingKyLuat = null;
        clearKyLuatForm();
    });
}

function clearKyLuatForm() {
    $('#ngayViPhamKyLuat').val('');
    $('#noiDungViPhamKyLuat').val('');
    $('#hinhThucKyLuat').val('').trigger('change');
    $('#quyetDinhKyLuat').val('');
    $('#ngayQuyetDinhKyLuat').val('');
    $('#ngayBatDauKyLuat').val('');
    $('#ngayKetThucKyLuat').val('');
    $('#thoiHanKyLuat').val('');
    $('#moTaKyLuat').val('');
    $('#thuTuKyLuat').val('1');
}
