// Quan hệ gia đình VĐV (Mục VI)
let editingQuanHeGiaDinh = null;

function initTableQuanHeGiaDinh(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVien_QuanHeGiaDinhApi/GetByCaNhan`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            caNhanID: nhanSuId,
            loaiNhanSu: 2 // 2 = VĐV
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
            targets: 1,
            render: function (data, type, row) {
                const nhomMap = { '1': 'a) Bản thân', '2': 'b) Bên vợ/chồng' };
                return nhomMap[row.nhom] || row.nhom;
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                return `
                    <i class="edit-quanhe cursor-pointer me-2" data-id="${row.quanHeID}" title="Sửa">
                        <i class="hgi-icon hgi-edit"></i>
                    </i>
                    <i class="delete-quanhe cursor-pointer text-danger" data-id="${row.quanHeID}" title="Xoá">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>
                `;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "50px", class: "center-align" },
        { data: "nhom", width: "120px", class: "left-align" },
        { data: "quanHe", width: "100px", class: "left-align" },
        { data: "hoTen", class: "left-align" },
        { data: "namSinh", width: "80px", class: "center-align" },
        { data: "thongTin", class: "left-align" },
        { data: null, width: "100px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableQuanHeGiaDinh').DataTable({
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
            emptyTable: "Chưa có thông tin quan hệ gia đình nào"
        },
        destroy: true
    });

    // Sự kiện thêm mới
    $('#btnAddQuanHeGiaDinh').off('click').on('click', function () {
        editingQuanHeGiaDinh = null;
        $('#modalQuanHeGiaDinhTitle').text('Thêm mới quan hệ gia đình');
        clearQuanHeGiaDinhForm();
        $('#modalQuanHeGiaDinh').modal('show');
    });

    // Sự kiện chỉnh sửa
    $(document).off('click', '.edit-quanhe').on('click', '.edit-quanhe', function () {
        const id = $(this).data('id');
        const rows = table.rows().data();
        let item = null;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].quanHeID === id) {
                item = rows[i];
                break;
            }
        }
        if (item) {
            editingQuanHeGiaDinh = item;
            $('#modalQuanHeGiaDinhTitle').text('Chỉnh sửa quan hệ gia đình');
            $('#nhomQuanHe').val(item.nhom || '').trigger("change");
            $('#quanHeLoai').val(item.quanHe || '').trigger("change");
            $('#hoTenQuanHe').val(item.hoTen || '');
            $('#namSinhQuanHe').val(item.namSinh || '');
            $('#thongTinQuanHe').val(item.thongTin || '');
            $('#thuTuQuanHe').val(item.thuTu || '');
            $('#modalQuanHeGiaDinh').modal('show');
        }
    });

    // Sự kiện lưu
    $('#btnSaveQuanHeGiaDinh').off('click').on('click', function () {
        const nhom = $('#nhomQuanHe').val();
        const quanHe = $('#quanHeLoai').val();
        const hoTen = $('#hoTenQuanHe').val().trim();
        const namSinh = $('#namSinhQuanHe').val().trim();
        const thongTin = $('#thongTinQuanHe').val().trim();
        const thuTu = $('#thuTuQuanHe').val();

        if (!nhom) {
            showNotification(0, 'Vui lòng chọn nhóm quan hệ');
            return;
        }
        if (!quanHe) {
            showNotification(0, 'Vui lòng chọn quan hệ');
            return;
        }

        const data = {
            quanHeID: editingQuanHeGiaDinh ? editingQuanHeGiaDinh.quanHeID : null,
            caNhanID: NhanSuId,
            loaiNhanSu: 2, // VĐV
            nhom: nhom,
            quanHe: quanHe,
            hoTen: hoTen || null,
            namSinh: namSinh || null,
            thongTin: thongTin || null,
            thuTu: thuTu ? parseInt(thuTu) : 0
        };

        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VanDongVien_QuanHeGiaDinhApi/Save`,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (response) {
                if (response.isSuccess) {
                    showNotification(1, editingQuanHeGiaDinh ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                    $('#modalQuanHeGiaDinh').modal('hide');
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
    $(document).off('click', '.delete-quanhe').on('click', '.delete-quanhe', function () {
        const id = $(this).data('id');
        if (confirm('Bạn chắc chắn muốn xoá quan hệ này?')) {
            $.ajax({
                type: 'DELETE',
                url: `${baseUrl}/api/VanDongVien_QuanHeGiaDinhApi/Delete/${id}`,
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
    $('#modalQuanHeGiaDinh').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingQuanHeGiaDinh = null;
        clearQuanHeGiaDinhForm();
    });
}

function clearQuanHeGiaDinhForm() {
    $('#nhomQuanHe').val('').trigger("change");
    $('#quanHeLoai').val('').trigger("change");
    $('#hoTenQuanHe').val('');
    $('#namSinhQuanHe').val('');
    $('#thongTinQuanHe').val('');
    $('#thuTuQuanHe').val('1');
}
