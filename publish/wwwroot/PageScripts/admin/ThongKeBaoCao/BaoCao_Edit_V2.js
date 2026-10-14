const baseUrl = getRootLink();
const baoCaoChinhThuc = CKEDITOR.replace('baoCaoChinhThuc');
const tinhHinhThucHien = CKEDITOR.replace('tinhHinhThucHien');
const danhGiaChung = CKEDITOR.replace('danhGiaChung');
const ketQuaThucHien = CKEDITOR.replace('ketQuaThucHien');
const hanCheNguyenNhan = CKEDITOR.replace('hanCheNguyenNhan');
const nhiemVuTrongTam = CKEDITOR.replace('nhiemVuTrongTam');
const deXuatKienNghi = CKEDITOR.replace('deXuatKienNghi');

$(document).ready(function () {
    initSelect2();
    initDatePicker();


    const params = new URLSearchParams(window.location.search);

    const YCID = params.get("YCID");

    let { resYC, resBaoCao, resBaoCaoKTXH } = loadDataYC(YCID)

    initBaoCaoKTXH(resBaoCaoKTXH);
    initMauBaoCaoKTXH(resBaoCao);

    $("#btnSaveAdd").on('click', function () {
        //Save and redirect
        handleAdd(resYC, resBaoCao, 1)
    })

    $("#btnSaveAddAndReset").on('click', function () {
        //Save and redirect
        handleAdd(resYC, resBaoCao, 0)
    })

    $("#btnModalBaoCaoKTXH").on("click", function () {
        resetBaoCaoKTXH();
        initMauBaoCaoKTXH(resBaoCao);
        $("#thongTinBaoCaoKTXH").show();
    })

    $("#btnCancelBaoCaoKTXH").on("click", function () {
        $("#thongTinBaoCaoKTXH").hide();
        resetBaoCaoKTXH();
    })

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

    $("#btnSaveBaoCaoKTXH").on("click", function () {
        let idBaoCao = $("#baoCaoKTXHIDEdit").val()
        if (!idBaoCao || idBaoCao == "") {
            dataAdd_BaoCaoKTXH(resBaoCao, YCID);
        } else {
            dataEdit_BaoCaoKTXH(resBaoCao, YCID);
        }
    })

    $("#buttonDelete").on("click", function () {
        let type = $("#idTypeDelete").val();
        if (type === 'media') {
            deleteDaPhuongTien();
        } else if (type === 'baocaoKTXH') {
            dataDelete_BaoCaoKTXH(YCID);
        }
    })
})

const loadDataYC = (YCID) => {
    let resYC = null
    let resBaoCao = null
    let resBaoCaoKTXH = null
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Get?ID=${YCID}&MaNgonNgu=vi`,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log(data, "data yeucau bao cao 97")
            if (data.isSuccess) {
                resYC = data.value.yeuCauBaoCao
                resBaoCao = data.value.baoCaoKetQuaHoatDong
                resBaoCaoKTXH = data.value.baoCaoKinhTeKyThuat
                $("#tieuDeAdd").text(resYC.tieuDe)
                $("#toChucAdd").text(resYC.tenToChuc)
                resYC.tuNgay ? $("#batDauAdd").text(formatDateWithoutTime(resYC.tuNgay)) : $("#batDauAdd").text("")
                resYC.denNgay ? $("#ketThucAdd").text(formatDateWithoutTime(resYC.denNgay)) : $("#ketThucAdd").text("")
                resYC.noiDung ? $("#noiDungYeuCau").html(resYC.noiDung) : ""
                soKyHieu = $("#soKyHieu").val(resBaoCao.soKyHieu)
                trichYeu = $("#trichYeu").val(resBaoCao.trichYeu)
                baoCaoChinhThucReq = baoCaoChinhThuc.setData(resBaoCao.baoCaoChinhThuc)
                tinhHinhThucHienReq = tinhHinhThucHien.setData(resBaoCao.tinhHinhThucHien)
                danhGiaChungReq = danhGiaChung.setData(resBaoCao.danhGiaChung)
                ketQuaThucHienReq = ketQuaThucHien.setData(resBaoCao.ketQuaThucHien)
                hanCheNguyenNhanReq = hanCheNguyenNhan.setData(resBaoCao.hanCheNguyenNhan)
                nhiemVuTrongTamReq = nhiemVuTrongTam.setData(resBaoCao.nhiemVuTrongTam)
                deXuatKienNghiReq = deXuatKienNghi.setData(resBaoCao.deXuatKienNghi)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

    return { resYC, resBaoCao, resBaoCaoKTXH }
}

const handleAdd = (res, resBaoCao, typeSave) => {
    let soKyHieu = $("#soKyHieu").val()
    let trichYeu = $("#trichYeu").val()
    let baoCaoChinhThucReq = baoCaoChinhThuc.getData()
    let tinhHinhThucHienReq = tinhHinhThucHien.getData()
    let danhGiaChungReq = danhGiaChung.getData()
    let ketQuaThucHienReq = ketQuaThucHien.getData()
    let hanCheNguyenNhanReq = hanCheNguyenNhan.getData()
    let nhiemVuTrongTamReq = nhiemVuTrongTam.getData()
    let deXuatKienNghiReq = deXuatKienNghi.getData()

    let dataBuilder = {
        ID: resBaoCao.id,
        toChucID: res.toChucID,
        yeuCauBaoCaoID: res.id,
        ngayBanHanh: "2025-12-10",
        soKyHieu: soKyHieu,
        trichYeu: trichYeu,
        baoCaoChinhThuc: baoCaoChinhThucReq,
        tinhHinhThucHien: tinhHinhThucHienReq,
        danhGiaChung: danhGiaChungReq,
        ketQuaThucHien: ketQuaThucHienReq,
        hanCheNguyenNhan: hanCheNguyenNhanReq,
        nhiemVuTrongTam: nhiemVuTrongTamReq,
        deXuatKienNghi: deXuatKienNghiReq
    }

    $.ajax({
        type: "PUT",
        async: false,
        url: `${baseUrl}/api/RPT_BaoCao_KetQuaHoatDongApi/Update`,
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(dataBuilder),
        success: function (data) {
            if (data.isSuccess) {
                showNotification(1, "Cập nhật báo cáo hoạt động thành công")
                setTimeout(() => {
                    if (typeSave == 1) {
                        window.location.href = "/AdminTool/ThongKeBaoCao/BaoCao"
                    }
                    else {
                        window.location.href = `/AdminTool/ThongKeBaoCao/BaoCao_Edit?YCID=${res.id}`
                    }
                }, 2000)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

const initMauBaoCaoKTXH = (resBaoCao) => {
    getDataWithApi('GET', `/api/RPT_MauBaoCaoApi/GetsOption?BCKetQuaHoatDongID=${resBaoCao.id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            $("#mauBaoCaoAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tieuDe || 'Không rõ tên';
                $("#mauBaoCaoAdd").append(`<option value="${item.id}">${displayText}</option>`);
            });
        }
    })
}

const initBaoCaoKTXH = (resBaoCaoKTXH) => {
    let dataBaoCaoKTXH = []
    if (resBaoCaoKTXH && resBaoCaoKTXH.length > 0) {
        resBaoCaoKTXH.forEach((item, index) => {
            if (item.infoBaoCao) {
                item.infoBaoCao.stt = index + 1;
                dataBaoCaoKTXH.push(item.infoBaoCao)
            }
        })
    }

    // Hủy DataTable cũ nếu đã tồn tại
    if ($.fn.DataTable.isDataTable('#dataGridBaoCaoKTXH')) {
        $('#dataGridBaoCaoKTXH').DataTable().destroy();
    }

    if (dataBaoCaoKTXH && dataBaoCaoKTXH.length > 0) {
        const tableDefs = [
            {
                targets: 2, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = `<i data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2 edit-BaoCaoKTXH" data-index="${meta.row}" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </i>
                                <i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" data-index="${meta.row}" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </i>`;
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "text-center" },
            { "data": "tieuDe", "width": "", "class": "text-left name-text" },
            { "data": "", "width": "180px", "class": "text-center group-icon-action" }
        ];

        $('#dataGridBaoCaoKTXH').DataTable({
            data: dataBaoCaoKTXH.map((item, index) => ({ ...item, stt: index + 1 })),
            columns: tableCols,
            columnDefs: tableDefs,
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            autoWidth: false,
            responsive: true,
            language: {
                emptyTable: ""
            }
        });
    }

    $(document).on('click', '.edit-BaoCaoKTXH', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridBaoCaoKTXH').DataTable().row(id).data();
        initData_BaoCaoKTXH(data);

        $("#thongTinBaoCaoKTXH").show();
    });

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridBaoCaoKTXH').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#idTypeDelete').val('baocaoKTXH');
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });
}

// Khởi tạo bảng chỉ tiêu khi chỉnh sửa (với giá trị sẵn có)
function initTable_BaoCao_Edit(chiTieuList) {
    if (!chiTieuList || chiTieuList.length === 0) {
        console.log("Không có dữ liệu chỉ tiêu");
        return;
    }

    console.log("Dữ liệu chỉ tiêu để khởi tạo bảng:", chiTieuList);

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
                    <td class="text-left" style="width:120px"><input type="number" class="form-control nam-truoc-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" value="${chiTieu.namTruoc || 0}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control ke-hoach-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" value="${chiTieu.keHoach || 0}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control thuc-hien-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" value="${chiTieu.thucHien || 0}"/></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control hoan-thanh-input percent" placeholder="0" data-chi-tieu-id="${chiTieu.id}" value="${parseFloat(chiTieu.hoanThanh.toFixed(2)) || 0}" disabled/></td>
                    <td class="text-left" style="width:25%"><input type="text" class="form-control ghi-chu-input" placeholder="Ghi chú" data-chi-tieu-id="${chiTieu.id}" value="${chiTieu.ghiChu || ''}" /></td>
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

    // Thêm event listeners để tính toán cột Hoàn thành
    document.querySelectorAll('#dataGrid .ke-hoach-input, #dataGrid .thuc-hien-input').forEach(input => {
        $(document).on('change', input, calculateHoanThanh);
    });

    console.log("Bảng chỉ tiêu được tạo thành công", groupedData);
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
            console.log("Thêm chỉ tiêu vào bảng:", chiTieu);
            tableHtml += `
                <tr class="chi-tieu-row" data-chi-tieu-id="${chiTieu.id}">
                    <td class="text-left" style="width:10px">${stt}</td>
                    <td class="text-left" style="width:25%">${chiTieu.chiTieu}</td>
                    <td class="text-left" style="width:100px">${chiTieu.tenDonViTinh || 'N/A'}</td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control nam-truoc-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control ke-hoach-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}" /></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control thuc-hien-input" placeholder="0" data-chi-tieu-id="${chiTieu.id}"/></td>
                    <td class="text-left" style="width:120px"><input type="number" class="form-control hoan-thanh-input percent" placeholder="0" data-chi-tieu-id="${chiTieu.id}" disabled/></td>
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

function dataAdd_BaoCaoKTXH(resBaoCao, YCID) {
    const bcKetQuaHoatDongID = resBaoCao.id;
    const tieuDe = $("#tieuDe_BaoCaoKTXHAdd").val();
    const mauBaoCaoID = $("#mauBaoCaoAdd").val();
    if (!tieuDe) {
        showNotification(0, "Vui lòng nhập tiêu đề!");
        return;
    }
    if (!mauBaoCaoID) {
        showNotification(0, "Vui lòng chọn mẫu báo cáo!");
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
            bcKetQuaHoatDongID: bcKetQuaHoatDongID,
            tieuDe: tieuDe,
        },
        requestContent: chiTieuData
    }

    console.log("Dữ liệu gửi đi:", postData);
    getDataWithApi('POST', '/api/RPT_BaoCaoApi/Add', JSON.stringify(postData)).then(data => {
        if (data && data.isSuccess) {
            showNotification(1, "Thêm báo cáo thành công!");
            resetBaoCaoKTXH();
            let { resYC, resBaoCao, resBaoCaoKTXH } = loadDataYC(YCID)
            initBaoCaoKTXH(resBaoCaoKTXH);
            $("#thongTinBaoCaoKTXH").hide();
        } else {
            showNotification(0, data.message || "Lỗi khi thêm báo cáo!");
        }
    }).catch(err => {
        console.error("Lỗi khi thêm báo cáo:", err);
        showNotification(0, "Lỗi khi thêm báo cáo!");
    })
}

function dataEdit_BaoCaoKTXH(resBaoCao, YCID) {
    // Validation
    const baoCaoID = $("#baoCaoKTXHIDEdit").val();
    const bcKetQuaHoatDongID = resBaoCao.id;
    const tieuDe = $("#tieuDe_BaoCaoKTXHAdd").val();
    const mauBaoCaoID = $('#mauBaoCaoKTXHIDEdit').val();
    if (!tieuDe) {
        showNotification(0, "Vui lòng nhập tiêu đề!");
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
            id: parseInt(chiTieuID),
            namTruoc: parseFloat(namTruoc),
            keHoach: parseFloat(keHoach),
            thucHien: parseFloat(thucHien),
            ghiChu: ghiChu
        });
    });

    // Chuẩn bị dữ liệu
    const putData = {
        id: parseInt(baoCaoID),
        mauBaoCaoID: parseInt(mauBaoCaoID),
        bcKetQuaHoatDongID: bcKetQuaHoatDongID,
        tieuDe: tieuDe,
    };

    console.log("Dữ liệu cập nhật báo cáo:", putData);
    console.log("Dữ liệu chỉ tiêu:", chiTieuData);

    // Call API Update báo cáo
    getDataWithApi('PUT', '/api/RPT_BaoCaoApi/Update', JSON.stringify(putData)).then(data => {
        if (data && data.isSuccess) {
            // Nếu có chỉ tiêu, cập nhật chỉ tiêu
            if (chiTieuData.length > 0) {
                updateChiTieu(chiTieuData, YCID);
            } else {
                showNotification(1, "Cập nhật báo cáo thành công!");
                resetBaoCaoKTXH();
                let { resYC, resBaoCao, resBaoCaoKTXH } = loadDataYC(YCID)
                initBaoCaoKTXH(resBaoCaoKTXH);
                $("#thongTinBaoCaoKTXH").hide();
            }
        } else {
            showNotification(0, data.message || "Lỗi khi cập nhật báo cáo!");
        }
    }).catch(err => {
        console.error("Lỗi khi cập nhật báo cáo!");
        showNotification(0, "Lỗi khi cập nhật báo cáo!");
    });
}

// Load dữ liệu báo cáo để chỉnh sửa
function initData_BaoCaoKTXH(data) {
    getDataWithApi('GET', `/api/RPT_BaoCaoApi/Get?ID=${data.id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const baoCao = data.value.infoBaoCao;
            const chiTieus = data.value.infoChiTieu; // API trả về với lowercase chữ cái đầu

            console.log("Báo cáo:", baoCao);
            console.log("Chỉ tiêu:", chiTieus);

            // Điền dữ liệu vào form
            $('#tieuDe_BaoCaoKTXHAdd').val(baoCao.tieuDe || '');
            $('#TenMauBaoCaoAdd').hide();
            $('#TenMauBaoCaoEdit').show();
            $('#mauBaoCaoEdit').val(baoCao.tieuDeMauBaoCao || '');
            $('#baoCaoKTXHIDEdit').val(baoCao.id);
            $('#mauBaoCaoKTXHIDEdit').val(baoCao.mauBaoCaoID);

            // Load bảng chỉ tiêu
            if (chiTieus && chiTieus.length > 0) {
                initTable_BaoCao_Edit(chiTieus);
                $("#tableViewContainer").show();
            }
        }
    }).catch(err => {
        console.error("Lỗi khi tải dữ liệu:", err);
        showNotification(0, "Lỗi khi tải dữ liệu báo cáo!");
    })
}

// Function cập nhật chỉ tiêu
function updateChiTieu(chiTieuData, YCID) {
    // Hiển thị thông báo đang cập nhật
    showNotification(2, "Đang cập nhật các chỉ tiêu...");

    // Cập nhật từng chỉ tiêu
    Promise.all(chiTieuData.map(item => {
        return getDataWithApi('PUT', '/api/RPT_BaoCao_NoiDungApi/Update', JSON.stringify(item));
    })).then(results => {
        const allSuccess = results.every(result => result && result.isSuccess);
        if (allSuccess) {
            showNotification(1, "Cập nhật báo cáo thành công!");
            resetBaoCaoKTXH();
            let { resYC, resBaoCao, resBaoCaoKTXH } = loadDataYC(YCID)
            initBaoCaoKTXH(resBaoCaoKTXH);
            $("#thongTinBaoCaoKTXH").hide();
        } else {
            showNotification(0, "Một số chỉ tiêu cập nhật thất bại!");
        }
    }).catch(err => {
        console.error("Lỗi khi cập nhật chỉ tiêu:", err);
        showNotification(0, "Lỗi khi cập nhật chỉ tiêu!");
    });
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

function resetBaoCaoKTXH() {
    $('#tieuDe_BaoCaoKTXHAdd').val('');
    $('#mauBaoCaoAdd').val('');
    $('#TenMauBaoCaoAdd').show();
    $('#TenMauBaoCaoEdit').hide();
    $('#baoCaoKTXHIDEdit').val('');
    $('#mauBaoCaoKTXHIDEdit').val('');
    $('#dataGrid tbody').empty();
    $("#tableViewContainer").hide();
}

async function dataDelete_BaoCaoKTXH(YCID) {
    const baoCaoID = $('#idDelete').val();
    if (!baoCaoID) {
        showNotification(0, 'Không xác định được báo cáo cần xóa!');
        return;
    }
    try {
        const res = await fetch(`${baseUrl}/api/RPT_BaoCaoApi/Delete?ID=${baoCaoID}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const errText = await res.text();
            showNotification(0, errText || 'Xóa thất bại!');
            return;
        }
        const result = await res.json();
        if (result && result.isSuccess) {
            showNotification(1, 'Xóa thành công!');
            $('#modalDelete').modal('hide');
            let { resYC, resBaoCao, resBaoCaoKTXH } = loadDataYC(YCID)
            initBaoCaoKTXH(resBaoCaoKTXH);
        } else {
            showNotification(0, result.error || 'Xóa thất bại!');
        }
    } catch (err) {
        showNotification(0, err.message || 'Xóa thất bại!');
    }
}