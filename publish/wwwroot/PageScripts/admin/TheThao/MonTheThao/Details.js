const baseUrl = getRootLink();

$(document).ready(function () {
    if (monTheThaoID) {
        initData();
    }

    // Xử lý nút thêm vận động viên mới
    $('#btnThemVanDongVien').on('click', function () {
        // Điều hướng đến trang thêm vận động viên với môn thể thao được gán sẵn
        window.location.href = `${baseUrl}/AdminTool/NhanSu/VanDongVien/Add?monTheThaoID=${monTheThaoID}`;
    });

    // Xử lý nút thêm huấn luyện viên mới
    $('#btnThemHuanLuyenVien').on('click', function () {
        // Điều hướng đến trang thêm huấn luyện viên với môn thể thao được gán sẵn
        window.location.href = `${baseUrl}/AdminTool/NhanSu/HuanLuyenVien/Add?monTheThaoID=${monTheThaoID}`;
    });
});

function initData() {
    // 1. Fetch Môn thể thao chi tiết
    $.ajax({
        url: `${baseUrl}/api/TT_MonTheThaoApi/Get?MonTheThaoID=${monTheThaoID}&MaNgonNgu=vi`,
        type: "GET",
        success: function (res) {
            if (res && res.isSuccess && res.value) {
                const data = res.value;
                $('#maDinhDanh').text(data.maDinhDanh || '-');
                $('#tenMon').text(data.tenMon || data.ten || '-');
                $('#cachThiDau').text(data.cachThiDau || '-');
                
                let trangThaiText = (data.trangThai === true || data.trangThaiID == 1) ? '<span class="green-text">Hoạt động</span>' : '<span class="red-text">Không hoạt động</span>';
                $('#trangThai').html(trangThaiText);

                $('#luatChoi').text(data.luatChoi || '-');
                $('#thanhTichNoiBat').text(data.thanhTichNoiBat || '-');
                $('#moTa').text(data.moTa || '-');

                $('#lichSuHinhThanh').text(data.lichSuHinhThanh || '-');
                $('#coCauToChuc').text(data.coCauToChuc || '-');
                
                if (data.tepKemTheo) {
                    $('#tepKemTheo').html(`<a href="${baseUrl}${data.tepKemTheo}" target="_blank">Tải file đính kèm</a>`);
                } else {
                    $('#tepKemTheo').text('-');
                }
            } else {
                showNotification(0, res.error || "Không thể lấy thông tin môn thể thao");
            }
        },
        error: function (err) {
            showNotification(0, "Lỗi kết nối khi lấy thông tin môn thể thao");
        }
    });

    // 2. Fetch Vận động viên tiêu biểu
    $.ajax({
        url: `${baseUrl}/api/TT_MonTheThaoApi/GetVanDongVienByMon?MonTheThaoID=${monTheThaoID}&MaNgonNgu=vi`,
        type: "GET",
        success: function (res) {
            let htmlVDV = '';
            const countVDV = res && res.isSuccess && Array.isArray(res.value) ? res.value.length : 0;
            $('#countVanDongVien').text(countVDV);
            if (res && res.isSuccess && res.value && res.value.length > 0) {
                res.value.forEach((item, index) => {
                    let imgHtml = item.anhChanDung ? `<img src="${baseUrl}${item.anhChanDung}" alt="${item.hoTen}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" class="rounded-circle mr-2" style="width:40px; height:40px; object-fit:cover;">` : `<img src="/assets/images/vector/no-image.png" class="rounded-circle mr-2" style="width:40px; height:40px; object-fit:cover;">`;
                    htmlVDV += `<tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            ${imgHtml}
                                            <div>
                                                <div class="fw-bold">${item.hoTen || ''}</div>
                                                <div class="text-muted small">${item.maDinhDanh || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.moTa || ''}</td>
                                </tr>`;
                });
            } else {
                htmlVDV = `<tr><td colspan="3" class="text-center text-muted">Không có vận động viên tiêu biểu</td></tr>`;
            }
            $('#tbodyVanDongVienTieubieu').html(htmlVDV);
        },
        error: function () {
            $('#countVanDongVien').text(0);
            $('#tbodyVanDongVienTieubieu').html(`<tr><td colspan="3" class="text-center text-muted">Lỗi khi tải dữ liệu</td></tr>`);
        }
    });

    // 3. Fetch Huấn luyện viên tiêu biểu
    $.ajax({
        url: `${baseUrl}/api/TT_MonTheThaoApi/GetHuanLuyenVienByMon?MonTheThaoID=${monTheThaoID}&MaNgonNgu=vi`,
        type: "GET",
        success: function (res) {
            let htmlHLV = '';
            const countHLV = res && res.isSuccess && Array.isArray(res.value) ? res.value.length : 0;
            $('#countHuanLuyenVien').text(countHLV);
            if (res && res.isSuccess && res.value && res.value.length > 0) {
                res.value.forEach((item, index) => {
                    let imgHtml = item.anhChanDung ? `<img src="${baseUrl}${item.anhChanDung}" alt="${item.hoTen}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" class="rounded-circle mr-2" style="width:40px; height:40px; object-fit:cover;">` : `<img src="/assets/images/vector/no-image.png" class="rounded-circle mr-2" style="width:40px; height:40px; object-fit:cover;">`;
                    htmlHLV += `<tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            ${imgHtml}
                                            <div>
                                                <div class="fw-bold">${item.hoTen || ''}</div>
                                                <div class="text-muted small">${item.maDinhDanh || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.moTa || ''}</td>
                                </tr>`;
                });
            } else {
                htmlHLV = `<tr><td colspan="3" class="text-center text-muted">Không có huấn luyện viên tiêu biểu</td></tr>`;
            }
            $('#tbodyHuanLuyenVienTieubieu').html(htmlHLV);
        },
        error: function () {
            $('#countHuanLuyenVien').text(0);
            $('#tbodyHuanLuyenVienTieubieu').html(`<tr><td colspan="3" class="text-center text-muted">Lỗi khi tải dữ liệu</td></tr>`);
        }
    });
}
