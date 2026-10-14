const baseUrl = getRootLink();
const guidEmpty = "00000000-0000-0000-0000-000000000000";
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],
    3: [".mp3", ".wav", ".m4a"],
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]
};

let tempToChuc = [];
let allToChuc = [];
let allVaiTro = [];
let editingToChucIndex = null;
let daPhuongTienTranslations = [];

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(52, "#trangThai", ""); // Trạng thái
    initToChuc_NoAll(96, "#selectToChuc", "", "");
    initDanhMucChung_NoAll(90, "#vaiTroThamGia", ""); // Vai trò tham gia
    initSelect2();

    loadAllData();

    if (isEdit && chuongTrinhDuAnID) {
        //loadData(chuongTrinhDuAnID);
        setTimeout(() => loadData(chuongTrinhDuAnID), 500);
    }

    $("#formChuongTrinh").on("submit", function (e) {
        e.preventDefault();
        dataSave();
    });

    // Modal Tổ chức
    $("#btnAddToChuc").on("click", function () {
        editingToChucIndex = null;
        $("#selectToChuc").val('');
        $("#vaiTroThamGia").val('');
        $("#modalToChuc").modal("show");
    });

    $(document).on('click', '.edit-tochuc', function () {
        const index = $(this).data('index');
        const item = tempToChuc[index];
        if (item) {
            editingToChucIndex = index;
            console.log(item, "item");
            $("#selectToChuc").val(item.toChucID).trigger("change");
            $("#vaiTroThamGia").val(item.vaiTroID || '').trigger("change");
            $("#modalToChuc").modal("show");
        }
    });

    $(document).on('click', '.delete-tochuc', function () {
        const index = $(this).data('index');
        if (!confirm('Bạn chắc chắn muốn xoá tổ chức này?')) return;

        // Chế độ sửa: gọi API xoá trực tiếp
        if (isEdit && chuongTrinhDuAnID) {
            const item = tempToChuc[index];
            if (!item) return;
            deleteRelationApi(item.toChucID, index);
        } else {
            // Chế độ thêm mới: chỉ xoá trong mảng tạm
            tempToChuc.splice(index, 1);
            renderToChucTable();
        }
    });

    $("#btnSaveToChuc").on("click", function () {
        const toChucID = $("#selectToChuc").val();
        const vaiTroID = $("#vaiTroThamGia").val();
        const tenToChuc = $("#selectToChuc option:selected").text();

        if (!toChucID) {
            showNotification(0, 'Vui lòng chọn tổ chức');
            return;
        }

        // Kiểm tra tổ chức đã tồn tại (bỏ qua chính dòng đang sửa)
        const isDuplicate = tempToChuc.some((t, i) => t.toChucID === toChucID && i !== editingToChucIndex);
        if (isDuplicate) {
            showNotification(0, 'Tổ chức này đã được thêm');
            return;
        }

        // Chế độ sửa: gọi API thêm/sửa trực tiếp
        if (isEdit && chuongTrinhDuAnID) {
            if (editingToChucIndex !== null) {
                const oldToChucID = tempToChuc[editingToChucIndex].toChucID;
                if (oldToChucID === toChucID) {
                    // Chỉ thay đổi vai trò -> cập nhật quan hệ
                    updateRelationApi(toChucID, vaiTroID, tenToChuc, editingToChucIndex);
                } else {
                    // Đổi tổ chức -> xoá quan hệ cũ rồi thêm quan hệ mới
                    changeRelationApi(oldToChucID, toChucID, vaiTroID, tenToChuc, editingToChucIndex);
                }
            } else {
                addRelationApi(toChucID, vaiTroID, tenToChuc);
            }
            return;
        }

        // Chế độ thêm mới: lưu tạm vào mảng, lưu cùng form khi submit
        if (editingToChucIndex !== null) {
            // Sửa
            tempToChuc[editingToChucIndex].toChucID = toChucID;
            tempToChuc[editingToChucIndex].tenToChuc = tenToChuc;
            tempToChuc[editingToChucIndex].vaiTroID = vaiTroID;
        } else {
            // Thêm mới
            const toChucObj = allToChuc.find(t => t.toChucID === toChucID);
            tempToChuc.push({
                toChucID: toChucID,
                tenToChuc: toChucObj ? toChucObj.tenToChuc : tenToChuc,
                vaiTroID: vaiTroID
            });
        }

        renderToChucTable();
        $("#modalToChuc").modal("hide");
    });

    $("#modalToChuc").on("hidden.bs.modal", function () {
        editingToChucIndex = null;
        $("#selectToChuc").val('').trigger("change");
        $("#vaiTroThamGia").val('').trigger("change");
    });

});

function loadAllData() {
    // Load tổ chức
    getDataWithApi('POST', `${baseUrl}/api/ToChucApi/DanhSach`, {
        loaiToChucID: 96
    }).then(data => {
        if (data && data.isSuccess && data.value) {
            allToChuc = data.value;
            console.log("allToChuc", allToChuc)
        }
    });
    
    // Load vai trò
    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DanhMucChungApi/DanhSach`,
        data: JSON.stringify({
            LoaiDanhMucID: 90,
            TrangThai: true
        }),
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                allVaiTro = data.value;
                console.log("allVaiTro", allVaiTro)
            }
        },
    });
}

function loadData(id) {
    console.log("bat dau load", id)
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/GetsByChuongTrinhID`,
        data: {
            MaNgonNgu: 'vi',
            ChuongTrinhDuAnID: id
        },
        dataType: 'json',
        success: function (data) {
            console.log('Dữ liệu từ API:', data);
            if (data && data.isSuccess && data.value) {
                const item = data.value;
                console.log('Dữ liệu chương trình:', item);

                $("#tenChuongTrinh").val(item.tenChuongTrinh || '');
                $("#trangThai").val(item.trangThaiID || item.trangThai || '').trigger('change');
                $("#donViPhuTrachID").val(item.donVi || item.donViPhuTrachID || '');
                $("#ngayBatDau").val(formatDateWithoutTime(item.batDau || item.ngayBatDau) || '');
                $("#ngayKetThuc").val(formatDateWithoutTime(item.ketThuc || item.ngayKetThuc) || '');
                $("#quaTrinhTrienKhai").val(item.quaTrinhTrienKhai || '');
                $("#mucTieuDuAn").val(item.mucDich || item.mucTieuDuAn || '');
                $("#ketQuaDuKien").val(item.ketQua || item.ketQuaDuKien || '');
                $("#kinhPhi").val(item.kinhPhi || item.kinhPhi || '');

                // Load tổ chức tham gia
                if (item.danhSachToChuc && item.danhSachToChuc.length > 0) {
                    tempToChuc = item.danhSachToChuc.map(t => ({
                        chuongTrinhDuAnToChucID: t.chuongTrinhDuAnToChucID,
                        toChucID: t.toChucID,
                        tenToChuc: t.tenToChuc,
                        vaiTroID: t.vaiTroID
                    }));
                    renderToChucTable();
                }
            } else {
                showNotification(0, data.error || 'Không tìm thấy dữ liệu');
            }
        },
        error: function (err) {
            console.error('Lỗi khi load dữ liệu:', err);
            showNotification(0, 'Lỗi khi tải dữ liệu');
        }
    });
}

function renderToChucTable() {
    const tbody = $('#tableToChuc tbody');
    tbody.empty();

    tempToChuc.forEach((item, index) => {
        const row = `<tr>
            <td class="text-center">${index + 1}</td>
            <td>${item.tenToChuc}</td>
            <td>${item.vaiTroID ? allVaiTro.find(v => v.danhMucID == item.vaiTroID)?.tenDanhMuc || '' : ''}</td>
            <td class="text-center">
                <i class="edit-tochuc cursor-pointer me-2" data-index="${index}" title="Sửa">
                    <i class="hgi-icon hgi-edit"></i>
                </i>
                <i class="delete-tochuc cursor-pointer text-danger" data-index="${index}" title="Xoá">
                    <i class="hgi-icon hgi-delete"></i>
                </i>
            </td>
        </tr>`;
        tbody.append(row);
    });
}

// ===== Các hàm gọi API thao tác tổ chức tham gia (dùng khi sửa) =====
function addRelationApi(toChucID, vaiTroID, tenToChuc) {
    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/AddRelation`,
        data: JSON.stringify({
            ChuongTrinhDuAnID: chuongTrinhDuAnID,
            ToChucID: toChucID,
            VaiTroID: vaiTroID ? parseInt(vaiTroID) : null
        }),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (res) {
            if (res && res.isSuccess) {
                const toChucObj = allToChuc.find(t => t.toChucID === toChucID);
                tempToChuc.push({
                    toChucID: toChucID,
                    tenToChuc: toChucObj ? toChucObj.tenToChuc : tenToChuc,
                    vaiTroID: vaiTroID
                });
                renderToChucTable();
                showNotification(1, 'Thêm tổ chức thành công');
                $("#modalToChuc").modal("hide");
            } else {
                showNotification(0, res.error || 'Không thể thêm tổ chức');
            }
        },
        error: function () {
            showNotification(0, 'Lỗi khi thêm tổ chức');
        }
    });
}

function updateRelationApi(toChucID, vaiTroID, tenToChuc, index) {
    $.ajax({
        type: 'PUT',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/UpdateRelation`,
        data: JSON.stringify({
            ChuongTrinhDuAnID: chuongTrinhDuAnID,
            ToChucID: toChucID,
            VaiTroID: vaiTroID ? parseInt(vaiTroID) : null
        }),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (res) {
            if (res && res.isSuccess) {
                tempToChuc[index].toChucID = toChucID;
                tempToChuc[index].tenToChuc = tenToChuc;
                tempToChuc[index].vaiTroID = vaiTroID;
                renderToChucTable();
                showNotification(1, 'Cập nhật tổ chức thành công');
                $("#modalToChuc").modal("hide");
            } else {
                showNotification(0, res.error || 'Không thể cập nhật tổ chức');
            }
        },
        error: function () {
            showNotification(0, 'Lỗi khi cập nhật tổ chức');
        }
    });
}

// Đổi tổ chức khi sửa: xoá quan hệ cũ rồi thêm quan hệ mới
function changeRelationApi(oldToChucID, newToChucID, vaiTroID, tenToChuc, index) {
    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/DeleteRelation?ChuongTrinhDuAnID=${chuongTrinhDuAnID}&ToChucID=${oldToChucID}`,
        dataType: 'json',
        success: function (resDel) {
            if (resDel && resDel.isSuccess) {
                $.ajax({
                    type: 'POST',
                    url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/AddRelation`,
                    data: JSON.stringify({
                        ChuongTrinhDuAnID: chuongTrinhDuAnID,
                        ToChucID: newToChucID,
                        VaiTroID: vaiTroID ? parseInt(vaiTroID) : null
                    }),
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json',
                    success: function (resAdd) {
                        if (resAdd && resAdd.isSuccess) {
                            tempToChuc[index].toChucID = newToChucID;
                            tempToChuc[index].tenToChuc = tenToChuc;
                            tempToChuc[index].vaiTroID = vaiTroID;
                            renderToChucTable();
                            showNotification(1, 'Cập nhật tổ chức thành công');
                            $("#modalToChuc").modal("hide");
                        } else {
                            showNotification(0, resAdd.error || 'Không thể cập nhật tổ chức');
                        }
                    },
                    error: function () {
                        showNotification(0, 'Lỗi khi cập nhật tổ chức');
                    }
                });
            } else {
                showNotification(0, resDel.error || 'Không thể cập nhật tổ chức');
            }
        },
        error: function () {
            showNotification(0, 'Lỗi khi cập nhật tổ chức');
        }
    });
}

function deleteRelationApi(toChucID, index) {
    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/DeleteRelation?ChuongTrinhDuAnID=${chuongTrinhDuAnID}&ToChucID=${toChucID}`,
        dataType: 'json',
        success: function (res) {
            if (res && res.isSuccess) {
                tempToChuc.splice(index, 1);
                renderToChucTable();
                showNotification(1, 'Xoá tổ chức thành công');
            } else {
                showNotification(0, res.error || 'Không thể xoá tổ chức');
            }
        },
        error: function () {
            showNotification(0, 'Lỗi khi xoá tổ chức');
        }
    });
}

function dataSave() {
    const tenChuongTrinh = $("#tenChuongTrinh").val().trim();
    //const nam = $("#nam").val();
    const trangThai = $("#trangThai").val();
    const donViPhuTrachID = $("#donViPhuTrachID").val();
    const ngayBatDau = $("#ngayBatDau").val();
    const ngayKetThuc = $("#ngayKetThuc").val();
    //const moTa = $("#moTa").val();
    const quaTrinhTrienKhai = $("#quaTrinhTrienKhai").val();
    const mucTieuDuAn = $("#mucTieuDuAn").val();
    const ketQuaDuKien = $("#ketQuaDuKien").val();
    const kinhPhi = $("#kinhPhi").val();

    // Validation
    if (!tenChuongTrinh) {
        showNotification(0, 'Vui lòng nhập tên chương trình');
        return;
    }
    // if (!nam) {
    //     showNotification(0, 'Vui lòng nhập năm');
    //     return;
    // }
    if (!trangThai) {
        showNotification(0, 'Vui lòng chọn trạng thái');
        return;
    }

    const entity = {
        ChuongTrinhDuAnID: chuongTrinhDuAnID || null,
        LinhVucID: 3,
        TenChuongTrinh: tenChuongTrinh,
        //Nam: parseInt(nam),
        TrangThaiID: parseInt(trangThai),
        DonVi: donViPhuTrachID || null,
        BatDau: ngayBatDau ? formatDateToSaveAsString(ngayBatDau) : null,
        KetThuc: ngayKetThuc ? formatDateToSaveAsString(ngayKetThuc) : null,
        QuaTrinhTrienKhai: quaTrinhTrienKhai,
        MucDich: mucTieuDuAn,
        KetQua: ketQuaDuKien,
        MaNgonNgu: "vi",
        KinhPhi : kinhPhi
    };

    const requestData = {
        EntityDuAn: JSON.stringify(entity),
        EntityToChuc: JSON.stringify(tempToChuc),
        EntityDaPhuongTien: null
    };

    const url = isEdit
        ? `${baseUrl}/api/DM_ChuongTrinhDuAnApi/Update`
        : `${baseUrl}/api/DM_ChuongTrinhDuAnApi/Add`;
    const method = isEdit ? 'PUT' : 'POST';

    let data = isEdit
        ? JSON.stringify(entity)
        : JSON.stringify(requestData);

    $.ajax({
        type: method,
        url: url,
        data: data,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (response) {
            if (response.isSuccess) {
                showNotification(1, isEdit ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                setTimeout(() => {
                    window.location.href = `${baseUrl}/AdminTool/ChuongTrinhDuAn`;
                }, 1500);
            } else {
                showNotification(0, response.error || 'Lỗi không xác định');
            }
        },
        error: function (err) {
            showNotification(0, 'Lỗi khi lưu dữ liệu');
            console.log(err);
        }
    });
}
