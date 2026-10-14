const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initDatePicker();

    (async function () {
        await loadThongTinXucTienDetails();
        await Promise.all([
            initTableVanBanTaiLieu(xucTienID),
            initTableDaPhuongTien(xucTienID)
        ]);
    })();

    async function loadThongTinXucTienDetails() {
        try {
            const res = await fetch(`${baseUrl}/api/ThongTinXucTienApi/ChiTiet/${xucTienID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                const item = data.value;
                const viData = data.value.banDich.find(b => b.maNgonNgu === 'vi');
                let title = `Thông tin xúc tiến ${viData.tieuDe}`;
                let htmlTitle = ``;
                if (viData.tieuDe) {
                    htmlTitle = `<div class='mainTitle'>${viData.tieuDe}</div>`;
                }
                $('#pageTitle').html(htmlTitle);
                document.title = title;
                // Thông tin cơ bản
                $('#tenLinhVuc').text(item.tenLinhVuc || '-');
                $('#tenToChuc').text(item.tenToChuc || '-');
                $('#tenDoiTuong').text(item.tenDoiTuong || '-');
                $('#tenHinhThuc').text(item.tenHinhThuc || '-');
                $('#tenTruyenThong').text(item.tenTruyenThong || '-');
                $('#tenTrangThai').text(item.tenTrangThai || '-');
                $('#suDung').html(item.suDung ? `<span class="TrangThai green-text">Hiển thị</span>` : `<span class="TrangThai red-text">Không hiển thị</span>`);
                $('#tieuDe').text(viData.tieuDe || '-');
                $('#moTa').html(viData.moTa || '-');
                $('#noiDung').html(viData.noiDung || '-');
                $('#ghiChu').html(viData.ghiChu || '-');

                // Thông tin người tạo/cập nhật
                $('#nguoiTao').text(item.nguoiCapNhat || '-');
                $('#ngayTao').text(item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleDateString('vi-VN') : '-');
                $('#nguoiCapNhat').text(item.nguoiHieuChinh || '-');
                $('#ngayCapNhat').text(item.ngayHieuChinh ? new Date(item.ngayHieuChinh).toLocaleDateString('vi-VN') : '-');
            } else {
                showNotification(0, data.error || 'Không tìm thấy dữ liệu');
            }
        } catch (err) {
            showNotification(0, err.message);
        }
    }

    async function initTableVanBanTaiLieu(id) {
        const tableApi = {
            url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    doiTuongSoHuuID: id,
                    maNgonNgu: 'vi'
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
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
                targets: 1,
                render: function (data, type, row, meta) {
                    return `<div class="group-info">
                                <div class="info-main">
                                    <a class="text-primary text-decoration-none">
                                        ${row.trichYeu || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.soKyHieu || ''}</div>
                            </div>`;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    let ngay = data ? formatShortDate(data) : '';
                    return `<span>${ngay}</span>`;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    let ngay = data ? formatShortDate(data) : '';
                    return `<span>${ngay}</span>`;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (!data) return ""; // không có file thì để trống
                    return `<a hhref="${data}" download target="_blank" class="hgi-icon hgi-download"></a>`;
                }
            },
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "soKyHieu", "width": "", "class": "left-align" },
            { "data": "tenTheLoai", "width": "20%", "class": "left-align" },
            { "data": "tenCoQuanBanHanh", "width": "220px", "class": "left-align" },
            { "data": "ngayBanHanh", "width": "180px", "class": "center-align" },
            { "data": "ngayHieuLuc", "width": "180px", "class": "center-align" },
            { "data": "duongDanFile", "width": "120px", "class": "center-align" },
        ];

        initDataTableConfigNoSearch('dataGridVanBan', tableApi, tableDefs, tableCols);
    }

    async function initTableDaPhuongTien(id) {
        const tableApi = {
            url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    doiTuongSoHuuID: id,
                    maNgonNgu: 'vi'
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
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
                targets: 1,
                render: function (data, type, row, meta) {
                    return row.tieuDe || '';
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    let loai = '';
                    switch (row.loaiMedia) {
                        case 1: loai = 'Ảnh'; break;
                        case 2: loai = 'Video'; break;
                        case 3: loai = 'Audio'; break;
                        case 4: loai = 'File'; break;
                        default: loai = '-';
                    }
                    return loai;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return row.tacGia || '';
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "", "class": "left-align" },
            { "data": "", "width": "15%", "class": "center-align" },
            { "data": "", "width": "20%", "class": "left-align" }
        ];

        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);
    }
});