// Quá trình VĐV - Updated from SP
//console.log("chay voa day", nhanSuId)
let editingQuaTrinh = null;
let allToChuc = [];
let allSuKien = [];
let allMonTheThao = [];
let allCoaches = [];

function initTableQuaTrinh(nhanSuId) {
    loadQuaTrinhDropdownData();

    const tableApi = {
        url: `${baseUrl}/api/VanDongVienQuaTrinhApi/GetByCaNhan/${nhanSuId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            loaiNhanSu: 2
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
                const loaiMap = { '1': 'Tuyển chọn', '2': 'Đào tạo', '3': 'Thi đấu' };
                return loaiMap[row.loaiID] || row.loaiID;
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return `
                    <i class="edit-quatrinh cursor-pointer me-2" data-id="${row.quaTrinhID}" title="Sửa">
                        <i class="hgi-icon hgi-edit"></i>
                    </i>
                    <i class="delete-quatrinh cursor-pointer text-danger" data-id="${row.quaTrinhID}" title="Xoá">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>
                `;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "50px", class: "center-align" },
        { data: "loaiID", width: "120px", class: "left-align" },
        { data: "tuNgay", width: "300px", class: "center-align" },
        { data: "tenMonTheThao", class: "left-align" },
        { data: "ketQua", class: "left-align" },
        { data: null, width: "100px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableQuaTrinh').DataTable({
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
            emptyTable: "Chưa có quá trình nào"
        },
        destroy: true
    });

    // Sự kiện thêm mới
    $('#btnAddQuaTrinh').off('click').on('click', function () {
        editingQuaTrinh = null;
        $('#modalQuaTrinhTitle').text('Thêm mới quá trình');
        clearQuaTrinhForm();
        $('#modalQuaTrinh').modal('show');
        initDatePicker();
    });

    // Sự kiện chỉnh sửa
    $(document).off('click', '.edit-quatrinh').on('click', '.edit-quatrinh', function () {
        const id = $(this).data('id');
        const row = table.rows().data();
        let item = null;
        for (let i = 0; i < row.length; i++) {
            if (row[i].quaTrinhID === id) {
                item = row[i];
                break;
            }
        }
        if (item) {
            editingQuaTrinh = item;
            console.log(item, "item edit quá trình")
            $('#modalQuaTrinhTitle').text('Chỉnh sửa quá trình');
            $('#loaiQuaTrinh').val(item.loaiID || '').trigger("change");
            $('#tuNgay').val((item.tuNgay) || '');
            $('#denNgay').val(formatDateWithoutTime(item.denNgay) || '');
            $('#toChucQt').val(item.toChucID || '').trigger("change");
            $('#suKienQt').val(item.suKienID || '');
            $('#monTheThaoQt').val(item.monTheThaoID || '').trigger("change");
            $('#moTaQt').val(getDescriptionText(item.moTa || ''));
            applyManagedItemsSelection(item.danhSachLienQuan || item.moTa || '', '#danhSachHlvQt');
            $('#ketQuaQt').val(item.ketQua || '');
            $('#thuTuQt').val(item.thuTu || '');
            $('#modalQuaTrinh').modal('show');
            setTimeout(() => {
                initDatePicker();
            }, 200);
        }
    });

    // Sự kiện lưu
    $('#btnSaveQuaTrinh').off('click').on('click', function () {
        const loaiID = $('#loaiQuaTrinh').val();
        const tuNgay = $('#tuNgay').val();
        const denNgay = $('#denNgay').val();
        const toChucID = $('#toChucQt').val();
        const suKienID = $('#suKienQt').val();
        const monTheThaoID = $('#monTheThaoQt').val();
        const moTa = $('#moTaQt').val().trim();
        const selectedCoaches = getSelectedManagedItems('#danhSachHlvQt');
        const danhSachLienQuan = buildManagedItemsPayload(selectedCoaches, 'HLV');
        const ketQua = $('#ketQuaQt').val().trim();
        const thuTu = $('#thuTuQt').val();

        if (!loaiID) {
            showNotification(0, 'Vui lòng chọn loại quá trình');
            return;
        }

        const data = {
            quaTrinhID: editingQuaTrinh ? editingQuaTrinh.quaTrinhID : null,
            caNhanID: NhanSuId,
            loaiID: parseInt(loaiID),
            tuNgay: tuNgay ? (tuNgay) : null,
            denNgay: denNgay ? formatDateToSaveAsString(denNgay) : null,
            toChucID: toChucID || null,
            suKienID: suKienID || null,
            monTheThaoID: monTheThaoID || null,
            moTa: moTa || null,
            danhSachLienQuan: danhSachLienQuan || null,
            ketQua: ketQua || null,
            thuTu: thuTu ? parseInt(thuTu) : 0,
            loaiNhanSu: 2
        };

        const url = editingQuaTrinh
            ? `${baseUrl}/api/VanDongVienQuaTrinhApi/Update`
            : `${baseUrl}/api/VanDongVienQuaTrinhApi/Add`;
        const method = editingQuaTrinh ? 'PUT' : 'POST';

        $.ajax({
            type: method,
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (response) {
                if (response.isSuccess) {
                    showNotification(1, editingQuaTrinh ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                    $('#modalQuaTrinh').modal('hide');
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
    $(document).off('click', '.delete-quatrinh').on('click', '.delete-quatrinh', function () {
        const id = $(this).data('id');
        if (confirm('Bạn chắc chắn muốn xoá quá trình này?')) {
            $.ajax({
                type: 'DELETE',
                url: `${baseUrl}/api/VanDongVienQuaTrinhApi/Delete/${id}`,
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
    $('#modalQuaTrinh').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        editingQuaTrinh = null;
        clearQuaTrinhForm();
    });
}

function loadQuaTrinhDropdownData() {
    loadManagedItemsDropdownData('#danhSachHlvQt', '/api/DM_CaNhan_HuanLuyenVienApi/Gets?MaNgonNgu=vi', 'caNhanID', 'hoTen');

    // Load tổ chức
    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/ToChucApi/DanhSach`,
        data: JSON.stringify({ loaiToChucID: 96 }),
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                allToChuc = data.value;
                const select = $('#toChucQt');
                select.empty().append('<option value="">Chọn tổ chức</option>');
                data.value.forEach(item => {
                    select.append(`<option value="${item.toChucID}">${item.tenToChuc}</option>`);
                });
            }
        }
    });

    // Load sự kiện
    // $.ajax({
    //     type: 'GET',
    //     url: `${baseUrl}/api/SuKienTheThaoApi/Gets?maNgonNgu=vi`,
    //     success: function (data) {
    //         if (data && data.isSuccess && data.value) {
    //             allSuKien = data.value;
    //             const select = $('#suKienQt');
    //             select.empty().append('<option value="">Chọn sự kiện</option>');
    //             data.value.forEach(item => {
    //                 select.append(`<option value="${item.suKienID}">${item.tenSuKien}</option>`);
    //             });
    //         }
    //     }
    // });

    // Load môn thể thao
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi`,
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                allMonTheThao = data.value;
                const select = $('#monTheThaoQt');
                select.empty().append('<option value="">Chọn môn thể thao</option>');
                data.value.forEach(item => {
                    select.append(`<option value="${item.monTheThaoID}">${item.tenMon}</option>`);
                });
            }
        }
    });
}

function loadManagedItemsDropdownData(selectSelector, apiUrl, valueKey, textKey) {
    $.ajax({
        type: 'GET',
        url: `${baseUrl}${apiUrl}`,
        contentType: 'application/json',
        success: function (data) {
            const list = data && data.isSuccess && data.value ? data.value : [];
            const select = $(selectSelector);
            select.empty();
            list.forEach(item => {
                const value = item[valueKey] ?? '';
                const text = item[textKey] || item.hoTen || item.HoTen || item.ten || 'Không rõ tên';
                select.append(`<option value="${value}">${text}</option>`);
            });
            if ($.fn.select2) {
                select.select2({ width: '100%', placeholder: 'Chọn ...' });
            }
        }
    });
}

function getSelectedManagedItems(selectSelector) {
    const selectedValues = $(selectSelector).val() || [];
    const selectedNames = [];
    $(selectSelector).find('option:selected').each(function () {
        selectedNames.push($(this).text());
    });
    return { ids: selectedValues, names: selectedNames };
}

function buildManagedItemsPayload(selectedItems, typeLabel) {
    if (!selectedItems || !selectedItems.ids || selectedItems.ids.length === 0) {
        return null;
    }

    return JSON.stringify({ label: typeLabel, ids: selectedItems.ids, names: selectedItems.names });
}

function getDescriptionText(textValue) {
    if (!textValue) {
        return '';
    }

    const legacyMatch = textValue.match(/##MANAGED_ITEMS##(.*)$/);
    if (legacyMatch) {
        return textValue.replace(/##MANAGED_ITEMS##.*$/g, '').trim();
    }

    return textValue;
}

function applyManagedItemsSelection(textValue, selectSelector) {
    const select = $(selectSelector);
    select.val([]).trigger('change');
    if (!textValue) {
        return;
    }

    try {
        const parsed = JSON.parse(textValue);
        if (parsed && Array.isArray(parsed.ids) && parsed.ids.length > 0) {
            select.val(parsed.ids).trigger('change');
            return;
        }
    } catch (e) {
        // ignore and try legacy format
    }

    const legacyMatch = textValue.match(/##MANAGED_ITEMS##(.*)$/);
    if (!legacyMatch) {
        return;
    }

    try {
        const parsed = JSON.parse(legacyMatch[1]);
        if (parsed && Array.isArray(parsed.ids) && parsed.ids.length > 0) {
            select.val(parsed.ids).trigger('change');
        }
    } catch (e) {
        console.log(e);
    }
}

function clearQuaTrinhForm() {
    $('#loaiQuaTrinh').val('').trigger("change");
    $('#tuNgay').val('');
    $('#denNgay').val('');
    $('#toChucQt').val('').trigger("change");
    $('#suKienQt').val('');
    $('#monTheThaoQt').val('').trigger("change");
    $('#danhSachHlvQt').val([]).trigger('change');
    $('#moTaQt').val('');
    $('#ketQuaQt').val('');
    $('#thuTuQt').val('1');
}
