// Thành tích nhân sự thể thao (HLV/VĐV)
let editingThanhTich = null;
let danhMucHuyChuong = [];

function loadDanhMucHuyChuong() {
    if (danhMucHuyChuong.length > 0) return $.Deferred().resolve().promise();
    return $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DanhMucChungApi/DanhSach`,
        data: JSON.stringify({ loaiDanhMucID: 66, trangThai: true }),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json'
    }).then(function (response) {
        danhMucHuyChuong = response && response.isSuccess ? (response.value || []) : [];
    });
}

function getHuyChuongOptions(selectedId) {
    const options = ['<option value="">Chọn huy chương</option>'];
    danhMucHuyChuong.forEach(function (item) {
        const selected = String(item.danhMucID) === String(selectedId) ? ' selected' : '';
        options.push(`<option value="${item.danhMucID}"${selected}>${item.tenDanhMuc}</option>`);
    });
    return options.join('');
}

function addHuyChuongRow(item) {
    const row = $('<div class="row align-items-end mb-2 huy-chuong-row"></div>');
    row.html(`
        <div class="col-md-7">
            <label class="form-label">Loại huy chương</label>
            <select class="form-control huy-chuong-danh-muc">${getHuyChuongOptions(item && item.danhMucID)}</select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Số lượng</label>
            <input type="number" class="form-control huy-chuong-so-luong" min="1" step="1" value="${item && item.soLuong ? item.soLuong : 1}" />
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-remove-huy-chuong" title="Xóa">
                <i class="hgi-icon hgi-delete"></i>
            </button>
        </div>`);
    $('#huyChuongItems').append(row);
}

function renderHuyChuongRows(items) {
    $('#huyChuongItems').empty();
    (items || []).forEach(addHuyChuongRow);
}

function readHuyChuongItems() {
    const items = [];
    const selectedIds = new Set();
    let invalid = false;

    $('#huyChuongItems .huy-chuong-row').each(function () {
        const danhMucID = parseInt($(this).find('.huy-chuong-danh-muc').val(), 10);
        const soLuong = parseInt($(this).find('.huy-chuong-so-luong').val(), 10);
        if (!danhMucID) {
            if (!Number.isNaN(soLuong) && soLuong !== 1) invalid = true;
            return;
        }
        if (!Number.isInteger(soLuong) || soLuong < 1 || selectedIds.has(danhMucID)) {
            invalid = true;
            return;
        }
        selectedIds.add(danhMucID);
        items.push({ danhMucID: danhMucID, soLuong: soLuong });
    });

    if (invalid) {
        showNotification(0, 'Huy chương không hợp lệ, bị trùng hoặc số lượng chưa đúng');
        return null;
    }
    return items;
}

function initTableThanhTich(nhanSuId) {
    const table = $('#tableThanhTich').DataTable({
        ajax: {
            url: `${baseUrl}/api/VanDongVien_ThanhTichApi/GetByCaNhan`,
            type: 'GET',
            data: { caNhanID: nhanSuId, loaiNhanSu: LoaiNhanSuThanhTich },
            dataSrc: data => data && data.isSuccess ? (data.value || []) : []
        },
        columns: [
            { data: null, width: '50px', class: 'center-align', render: (data, type, row, meta) => meta.row + 1 },
            { data: 'capDo', width: '120px', class: 'left-align', render: data => data == '1' ? 'Quốc tế' : (data == '2' ? 'Trong nước' : data) },
            { data: 'namThang', width: '100px', class: 'center-align' },
            { data: 'tenGiai', class: 'left-align' },
            { data: 'noiDung', class: 'left-align' },
            { data: 'huyChuong', class: 'left-align' },
            { data: 'kyLuc', class: 'left-align' },
            {
                data: null,
                width: '100px',
                class: 'center-align group-icon-action',
                render: row => `<i class="edit-thanhtich cursor-pointer me-2" data-id="${row.thanhTichID}" title="Sửa"><i class="hgi-icon hgi-edit"></i></i><i class="delete-thanhtich cursor-pointer text-danger" data-id="${row.thanhTichID}" title="Xóa"><i class="hgi-icon hgi-delete"></i></i>`
            }
        ],
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: { emptyTable: 'Chưa có thành tích nào' },
        destroy: true
    });

    $('#btnAddThanhTich').off('click').on('click', function () {
        editingThanhTich = null;
        $('#modalThanhTichTitle').text('Thêm mới thành tích');
        clearThanhTichForm();
        loadDanhMucHuyChuong().then(function () {
            renderHuyChuongRows();
            $('#modalThanhTich').modal('show');
        });
    });

    $('#btnAddHuyChuong').off('click').on('click', function () { addHuyChuongRow(); });
    $(document).off('click', '.btn-remove-huy-chuong').on('click', '.btn-remove-huy-chuong', function () {
        $(this).closest('.huy-chuong-row').remove();
    });

    $(document).off('click', '.edit-thanhtich').on('click', '.edit-thanhtich', function () {
        const id = $(this).data('id');
        const item = table.rows().data().toArray().find(row => String(row.thanhTichID) === String(id));
        if (!item) return;

        editingThanhTich = item;
        $('#modalThanhTichTitle').text('Chỉnh sửa thành tích');
        $('#capDoThanhTich').val(item.capDo || '').trigger("change");
        $('#namThangThanhTich').val(item.namThang || '');
        $('#tenGiaiThanhTich').val(item.tenGiai || '');
        $('#noiDungThanhTich').val(item.noiDung || '');
        $('#kyLucThanhTich').val(item.kyLuc || '');
        $('#thuTuThanhTich').val(item.thuTu || '1');

        $.when(loadDanhMucHuyChuong(), $.get(`${baseUrl}/api/VanDongVien_ThanhTichApi/GetHuyChuongByThanhTich`, { thanhTichID: id }))
            .then(function (loadResult, detailResult) {
                const response = detailResult && detailResult[0] ? detailResult[0] : detailResult;
                renderHuyChuongRows(response && response.isSuccess ? response.value : []);
                $('#modalThanhTich').modal('show');
            });
    });

    $('#btnSaveThanhTich').off('click').on('click', function () {
        const capDo = $('#capDoThanhTich').val();
        const huyChuongItems = readHuyChuongItems();
        if (!capDo) return showNotification(0, 'Vui lòng chọn cấp độ');
        if (huyChuongItems === null) return;

        const data = {
            thanhTichID: editingThanhTich ? editingThanhTich.thanhTichID : null,
            caNhanID: NhanSuId,
            loaiNhanSu: LoaiNhanSuThanhTich,
            capDo: capDo,
            namThang: $('#namThangThanhTich').val().trim() || null,
            tenGiai: $('#tenGiaiThanhTich').val().trim() || null,
            noiDung: $('#noiDungThanhTich').val().trim() || null,
            kyLuc: $('#kyLucThanhTich').val().trim() || null,
            thuTu: parseInt($('#thuTuThanhTich').val(), 10) || 0,
            huyChuongItems: huyChuongItems
        };

        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VanDongVien_ThanhTichApi/Save`,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (response) {
                if (!response.isSuccess) return showNotification(0, response.error || 'Lỗi không xác định');
                showNotification(1, editingThanhTich ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                $('#modalThanhTich').modal('hide');
                table.ajax.reload();
            },
            error: function () { showNotification(0, 'Lỗi khi lưu dữ liệu'); }
        });
    });

    $(document).off('click', '.delete-thanhtich').on('click', '.delete-thanhtich', function () {
        const id = $(this).data('id');
        if (!confirm('Bạn chắc chắn muốn xóa thành tích này?')) return;
        $.ajax({
            type: 'DELETE',
            url: `${baseUrl}/api/VanDongVien_ThanhTichApi/Delete/${id}`,
            dataType: 'json',
            success: function (response) {
                if (response.isSuccess) { showNotification(1, 'Xóa thành công'); table.ajax.reload(); }
                else showNotification(0, response.error || 'Lỗi xóa');
            },
            error: function () { showNotification(0, 'Lỗi khi xóa'); }
        });
    });

    $('#modalThanhTich').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingThanhTich = null;
        clearThanhTichForm();
    });
}

function clearThanhTichForm() {
    $('#capDoThanhTich').val('');
    $('#namThangThanhTich').val('');
    $('#tenGiaiThanhTich').val('');
    $('#noiDungThanhTich').val('');
    $('#kyLucThanhTich').val('');
    $('#thuTuThanhTich').val('1');
    $('#huyChuongItems').empty();
}
