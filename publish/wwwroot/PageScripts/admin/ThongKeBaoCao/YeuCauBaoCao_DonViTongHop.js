const baseUrl = getRootLink();

$(document).ready(function () {
    if (!ycidTongHop || Number(ycidTongHop) <= 0) {
        showNotification(0, "Không tìm thấy mã yêu cầu báo cáo!");
        return;
    }

    loadDonViBaoCao();

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr('href');
        if (target === '#tab-thong-ke') {
            loadThongKeSoLieu();
        }
    });

    $(document).on('click', '.btn-huy-phe-duyet', function () {
        const toChucID = $(this).data('tochucid');
        const tenToChuc = $(this).data('tentochuc');

        $('#huyPheDuyetToChucID').val(toChucID);
        $('#huyPheDuyetTenToChuc').text(tenToChuc || '');
        $('#huyPheDuyetLyDo').val('');
        $('#modalHuyPheDuyetDonVi').modal('show');
    });

    $('#btnExportThongKeSoLieu').on('click', function () {
        const btn = $(this);
        btn.prop('disabled', true).html('<i class="hgi-icon hgi-export"></i> Đang xuất...');

        const exportUrl = `${baseUrl}/api/ExportApi/ThongKeSoLieu?ycid=${ycidTongHop}`;
        const link = document.createElement('a');
        link.href = exportUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            btn.prop('disabled', false).html('<i class="hgi-icon hgi-export"></i> Xuất danh sách');
        }, 2000);
    });

    $('#btnXacNhanHuyPheDuyet').on('click', function () {
        const toChucID = $('#huyPheDuyetToChucID').val();
        const lyDoThuHoi = $('#huyPheDuyetLyDo').val().trim();

        if (!toChucID) {
            showNotification(0, 'Không xác định được đơn vị cần hủy phê duyệt!');
            return;
        }

        if (!lyDoThuHoi) {
            showNotification(0, 'Vui lòng nhập lý do thu hồi!');
            return;
        }

        const btn = $(this);
        btn.prop('disabled', true).text('Đang xử lý...');

        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/HuyPheDuyetDonVi`,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                yeuCauBaoCaoID: Number(ycidTongHop),
                toChucID: toChucID,
                lyDoThuHoi: lyDoThuHoi
            }),
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, 'Hủy phê duyệt thành công!');
                    $('#modalHuyPheDuyetDonVi').modal('hide');
                    loadDonViBaoCao();
                    if ($('#tab-thong-ke').hasClass('active')) {
                        loadThongKeSoLieu();
                    }
                } else {
                    showNotification(0, (res && res.error) || 'Hủy phê duyệt thất bại!');
                }
            },
            error: function () {
                showNotification(0, 'Có lỗi xảy ra khi hủy phê duyệt!');
            },
            complete: function () {
                btn.prop('disabled', false).html('<i class="hgi-icon hgi-undo"></i> Hủy phê duyệt');
            }
        });
    });
});

function loadDonViBaoCao() {
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/GetDonViBaoCaoByYCID?YCID=${ycidTongHop}`,
        contentType: 'application/json; charset=utf-8',
        success: function (res) {
            if (res && res.isSuccess) {
                renderDonViBaoCao(res.value || []);
            } else {
                renderDonViBaoCao([]);
                showNotification(0, (res && res.error) || 'Không tải được danh sách đơn vị báo cáo!');
            }
        },
        error: function () {
            renderDonViBaoCao([]);
            showNotification(0, 'Có lỗi xảy ra khi tải danh sách đơn vị!');
        }
    });
}

function renderDonViBaoCao(items) {
    const body = $('#donViBaoCaoBody');
    body.empty();

    if (!items || items.length === 0) {
        body.append('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
        return;
    }

    items.forEach((item, index) => {
        const daBaoCao = item.daBaoCao === true;
        const trangThaiHtml = daBaoCao
            ? '<span class="TrangThai green-text">Đã báo cáo</span>'
            : '<span class="TrangThai red-text">Chưa báo cáo</span>';

        const ngayBaoCao = item.ngayBaoCao ? formatDateWithoutTime(item.ngayBaoCao) : '';

        let thaoTac = '<span class="text-muted"></span>';
        if (daBaoCao) {
            thaoTac = `<button class="btn btn-sm btn-warning btn-huy-phe-duyet" data-tochucid="${item.toChucID || ''}" data-tentochuc="${item.tenToChuc || ''}">
                        <i class="hgi-icon hgi-undo"></i> Hủy phê duyệt
                      </button>`;
        }

        body.append(`
            <tr>
                <td class="text-left">${index + 1}</td>
                <td>${item.tenToChuc || ''}</td>
                <td class="text-left">${trangThaiHtml}</td>
                <td class="text-left">${ngayBaoCao}</td>
                <td class="text-left">${thaoTac}</td>
            </tr>
        `);
    });
}

function loadThongKeSoLieu() {
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/GetThongKeSoLieuByYCID?YCID=${ycidTongHop}`,
        contentType: 'application/json; charset=utf-8',
        success: function (res) {
            console.log(res, "res thong ke so lieu")
            if (res && res.isSuccess) {
                renderThongKeSoLieu(res.value || []);
            } else {
                renderThongKeSoLieu([]);
                showNotification(0, (res && res.error) || 'Không tải được thống kê số liệu!');
            }
        },
        error: function () {
            renderThongKeSoLieu([]);
            showNotification(0, 'Có lỗi xảy ra khi tải thống kê số liệu!');
        }
    });
}

function renderThongKeSoLieu(items) {
    const head = $('#thongKeSoLieuHead');
    const body = $('#thongKeSoLieuBody');
    const foot = $('#thongKeSoLieuFoot');

    head.empty();
    body.empty();
    foot.empty();

    if (!items || items.length === 0) {
        head.html('<tr><th>STT</th><th>Tên đơn vị</th><th>Số liệu</th></tr>');
        body.html('<tr><td colspan="3" class="text-center">Không có dữ liệu</td></tr>');
        return;
    }

    // Tách dòng đơn vị (isTongSo = 0) và dòng tổng (isTongSo = 1)
    const donViItems = items.filter(x => x.isTongSo === 0);
    const tongSoItems = items.filter(x => x.isTongSo === 1);

    // Lấy danh sách ChiTieu duy nhất, sắp xếp theo thuTuChiTieu
    const chiTieuMap = {};
    items.forEach(item => {
        const key = item.id;
        if (!chiTieuMap[key]) {
            chiTieuMap[key] = {
                id: item.id,
                chiTieu: item.chiTieu || '',
                thuTu: item.thuTuChiTieu || 0
            };
        }
    });
    const chiTieuList = Object.values(chiTieuMap);//.sort((a, b) => a.thuTu - b.thuTu);

    // Lấy danh sách đơn vị duy nhất, sắp xếp theo STT
    const donViMap = {};
    donViItems.forEach(item => {
        const key = item.stt;
        if (!donViMap[key]) {
            donViMap[key] = {
                stt: item.stt,
                tenDonVi: item.tenDonVi || '',
                values: {}
            };
        }
        donViMap[key].values[item.id] = Number(item.giaTri || 0);
    });
    const donViList = Object.values(donViMap);//.sort((a, b) => a.stt - b.stt);

    // Lấy giá trị tổng số theo ChiTieuID
    const tongSoMap = {};
    tongSoItems.forEach(item => {
        tongSoMap[item.id] = Number(item.giaTri || 0);
    });

    // === Render Header ===
    let headHtml = '<tr><th class="text-center" style="width:50px">STT</th><th>Tên đơn vị</th>';
    chiTieuList.forEach(ct => {
        headHtml += `<th class="text-center">${ct.chiTieu}</th>`;
    });
    headHtml += '</tr>';
    head.html(headHtml);

    console.log(donViList, "donViList");
    console.log(chiTieuList, "chiTieuList");
    // === Render Body ===
    donViList.forEach(row => {
        let tr = `<tr>
            <td class="text-center">${row.stt}</td>
            <td>${row.tenDonVi}</td>`;
        chiTieuList.forEach(ct => {
            const v = Number(row.values[ct.id] || 0);
            tr += `<td class="text-center">${v.toLocaleString('vi-VN')}</td>`;
        });
        tr += '</tr>';
        body.append(tr);
    });

    console.log(tongSoMap, "tongSoMap");

    // === Render Footer (Tổng số lấy từ API) ===
    let footHtml = '<tr><th colspan="2" class="text-center">Tổng số</th>';
    chiTieuList.forEach(ct => {
        const v = Number(tongSoMap[ct.id] || 0);
        footHtml += `<th class="text-center">${v.toLocaleString('vi-VN')}</th>`;
    });
    footHtml += '</tr>';
    foot.html(footHtml);
}

