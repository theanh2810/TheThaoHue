const baseUrl = getRootLink();
const ckeditormotaAdd = CKEDITOR.replace('moTaAdd');

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    initToChuc_NoAll(null, '#toChucAdd', null, null);
    initMauBaoCao();

    $("#mauBaoCaoAdd").on("change", function () {
        const mauBaoCaoID = $(this).val();
        if (mauBaoCaoID) {
            getDataWithApi('GET', `/api/RPT_ChiTieuApi/GetByMauBaoCao?MauBaoCaoID=${mauBaoCaoID}&MaNgonNgu=vi`).then(data => {
                if (data && data.isSuccess && data.value) {
                    const chiTieuList = data.value;
                    console.log("Danh sách chỉ tiêu:", chiTieuList);
                    
                    // Khởi tạo bảng chỉ tiêu
                    initTable_BaoCao(chiTieuList);
                    
                    $("#tableViewContainer").show();
                }
            }).catch(err => {
                console.error("Lỗi khi lấy chỉ tiêu:", err);
                showNotification(0, "Lỗi khi lấy dữ liệu chỉ tiêu!");
            })
        } else {
            $("#tableViewContainer").hide();
        }
    })

    $("#btnSaveAdd").on("click", function () {
        dataAdd();
    })
});

function initMauBaoCao() {
    getDataWithApi('GET', '/api/RPT_MauBaoCaoApi/Gets').then(data => {
        if (data && data.isSuccess && data.value) {
            $("#mauBaoCaoAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tieuDe || 'Không rõ tên';
                $("#mauBaoCaoAdd").append(`<option value="${item.id}">${displayText}</option>`);
            });
        }
    })
}

function dataAdd() {
    const toChucID = $("#toChucAdd").val();
    const mauBaoCaoID = $("#mauBaoCaoAdd").val();
    const ngayBaoCao_BatDau = $("#batDauAdd").val();
    const ngayBaoCao_KetThuc = $("#ketThucAdd").val();
    const tieuDe = $("#tieuDeAdd").val();
    const moTa = ckeditormotaAdd.getData();
    if (!toChucID) {
        showNotification(0, "Vui lòng chọn tổ chức!");
        return;
    }
    if (!mauBaoCaoID) {
        showNotification(0, "Vui lòng chọn mẫu báo cáo!");
        return;
    }
    if (!ngayBaoCao_BatDau) {
        showNotification(0, "Vui lòng chọn ngày báo cáo!");
        return;
    }
    // Lấy dữ liệu chỉ tiêu từ bảng
    const chiTieuData = [];
    document.querySelectorAll('#dataGrid .chi-tieu-row').forEach(row => {
        const chiTieuID = row.getAttribute('data-chi-tieu-id');
        const namTruoc = row.querySelector('.nam-truoc-input').value || 0;
        const keHoach = row.querySelector('.ke-hoach-input').value || 0;
        const thucHien = row.querySelector('.thuc-hien-input').value || 0;
        const ghiChu = row.querySelector('.ghi-chu-input').value || '';
        chiTieuData.push({
            chiTieuID: chiTieuID,
            namTruoc: parseFloat(namTruoc),
            keHoach: parseFloat(keHoach),
            thucHien: parseFloat(thucHien),
            ghiChu: ghiChu
        });
    });

    const postData = {
        requestInfo: {
            mauBaoCaoID: parseInt(mauBaoCaoID),
            toChucID: toChucID,
            tieuDe: tieuDe,
            moTa: moTa,
            batDau: formatDateToSaveAsString(ngayBaoCao_BatDau),
            ketThuc: formatDateToSaveAsString(ngayBaoCao_KetThuc),
        },
        requestContent: chiTieuData
    }

    console.log("Dữ liệu gửi đi:", postData);
    getDataWithApi('POST', '/api/RPT_BaoCaoApi/Add', JSON.stringify(postData)).then(data => {
        if (data && data.isSuccess) {
            showNotification(1, "Thêm báo cáo thành công!");
            setTimeout(() => {
                window.location.href = `${baseUrl}/AdminTool/ThongKeBaoCao/BaoCao`;
            }, 1500);
        } else {
            showNotification(0, data.message || "Lỗi khi thêm báo cáo!");
        }
    }).catch(err => {
        console.error("Lỗi khi thêm báo cáo:", err);
        showNotification(0, "Lỗi khi thêm báo cáo!");
    })
}

function initTable_BaoCao(chiTieuList) {
    if (!chiTieuList || chiTieuList.length === 0) {
        console.log("Không có dữ liệu chỉ tiêu");
        return;
    }

    // Nhóm dữ liệu theo nhomChiTieuID
    const groupedData = {};
    chiTieuList.forEach(item => {
        if (!groupedData[item.nhomChiTieuID]) {
            groupedData[item.nhomChiTieuID] = {
                tenNhom: item.nhomChiTieu,
                chiTieus: []
            };
        }
        groupedData[item.nhomChiTieuID].chiTieus.push(item);
    });

    // Build HTML table
    let tableHtml = `
        <thead>
            <tr>
                <th>Stt</th>
                <th>Tên tiêu chí</th>
                <th>Đơn vị tính</th>
                <th>Năm trước</th>
                <th>Kế hoạch</th>
                <th>Thực hiện</th>
                <th>Hoàn thành</th>
                <th>Ghi chú</th>
            </tr>
        </thead>
        <tbody>
    `;

    let stt = 1;
    let nhomIndex = 1;
    
    // Duyệt từng nhóm
    Object.keys(groupedData).forEach(nhomID => {
        const nhom = groupedData[nhomID];
        
        // Hàng nhóm tiêu chí
        tableHtml += `
            <tr class="nhom-chiti-header" style="background-color: #f0f0f0;">
                <td colspan="8" style="font-weight: 700; padding: 16px;">
                    ${toRomanNumeral(nhomIndex)}. ${nhom.tenNhom}
                </td>
            </tr>
        `;
        nhomIndex++;

        // Các hàng chỉ tiêu trong nhóm
        nhom.chiTieus.forEach(chiTieu => {
            tableHtml += `
                <tr class="chi-tieu-row" data-chi-tieu-id="${chiTieu.id}">
                    <td class="text-left" style="width:10px">${stt}</td>
                    <td class="text-left" style="width:25%">${chiTieu.chiTieu}</td>
                    <td class="text-left" style="width:100px">${chiTieu.tenDonViTinh || 'N/A'}</td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control nam-truoc-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control ke-hoach-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control thuc-hien-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control hoan-thanh-input percent" placeholder="0" data-chi-tieu-id="${chiTieu.id}" disabled /></td>
                    <td class="text-left" style="width:25%"><input type="text" class="form-control ghi-chu-input" placeholder="Ghi chú" data-chi-tieu-id="${chiTieu.id}" /></td>
                </tr>
            `;
            stt++;
        });
    });

    tableHtml += `</tbody>`;

    // Cập nhật table
    const tableElement = document.querySelector('#dataGrid');
    if (tableElement) {
        // Xóa tbody/thead cũ nếu có
        const oldTbody = tableElement.querySelector('tbody');
        const oldThead = tableElement.querySelector('thead');
        if (oldTbody) oldTbody.remove();
        if (oldThead) oldThead.remove();

        // Thêm HTML mới
        tableElement.insertAdjacentHTML('afterbegin', tableHtml);
    }

    console.log("Bảng chỉ tiêu được tạo thành công", groupedData);

    // Thêm event listeners để tính toán cột Hoàn thành
    document.querySelectorAll('#dataGrid .ke-hoach-input, #dataGrid .thuc-hien-input').forEach(input => {
        $(document).on('change', input, calculateHoanThanh);
    });
}

// Hàm tính toán cột Hoàn thành: (ThucHien * 100) / KeHoach
function calculateHoanThanh(event) {
    const inputRow = event.target.closest('tr.chi-tieu-row');
    if (!inputRow) return;

    const keHoachInput = inputRow.querySelector('.ke-hoach-input');
    const thucHienInput = inputRow.querySelector('.thuc-hien-input');
    const hoanThanhInput = inputRow.querySelector('.hoan-thanh-input');

    const keHoach = parseFloat(keHoachInput.value) || 0;
    const thucHien = parseFloat(thucHienInput.value) || 0;

    // Công thức: (ThucHien * 100) / KeHoach, nếu KeHoach = 0 thì = 0
    let hoanThanh = 0;
    if (keHoach !== 0) {
        hoanThanh = (thucHien * 100) / keHoach;
    }

    // Làm tròn đến 2 chữ số thập phân
    const hoanThanhValue = hoanThanh > 0 ? parseFloat(hoanThanh.toFixed(2)) : 0;
    hoanThanhInput.value = hoanThanhValue;
    
    // Set placeholder để hiển thị %
    hoanThanhInput.setAttribute('placeholder', hoanThanhValue + '%');
}


// Hàm chuyển số thành số La Mã
function toRomanNumeral(num) {
    const romanNumerals = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    for (let i = 0; i < romanNumerals.length; i++) {
        while (num >= romanNumerals[i].value) {
            result += romanNumerals[i].numeral;
            num -= romanNumerals[i].value;
        }
    }
    return result;
}