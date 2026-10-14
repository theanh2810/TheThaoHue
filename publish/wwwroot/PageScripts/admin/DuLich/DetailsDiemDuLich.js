const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initDatePicker();

    (async function () {
        await loadDiemDuLichDetails();
        await Promise.all([
            initTableTienNghi(diemDuLichId),
            initTableDichVuTraiNghiem(diemDuLichId),
            initTableGiayChungNhan(diemDuLichId)
        ]);
    })();

    async function loadDiemDuLichDetails() {
        try {
            const res = await fetch(`${baseUrl}/api/KhuDuLichApi/ChiTiet/${diemDuLichId}`, {
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
                let title = `Thông tin khu du lịch ${viData.tenKhuDuLich}`; 
                let htmlTitle = ``;
                if (viData.tenKhuDuLich) {
                    htmlTitle = `<div class='mainTitle'>${viData.tenKhuDuLich}</div>`;
                    if (viData.diaChi) {
                        htmlTitle += `<div class='subTitle'>(${viData.diaChi})</div>`;
                    }
                }
                $('#pageTitle').html(htmlTitle);
                document.title = title;
                // Thông tin cơ bản
                $('#tenKhuDuLich').text(viData.tenKhuDuLich || '-');
                $('#tenLoaiHinh').text(item.tenLoaiHinh || '-');
                $('#tenCap').text(item.tenCap || '-');
                $('#namCongNhan').text(item.namCongNhan || '-');
                $('#dienTich').text(item.dienTich || '-');
                $('#dienThoai').text(item.dienThoai || '-');
                $('#tenToChuc').text(item.tenToChuc || '-');
                $('#thuTu').text(item.thuTu || '-');
                $('#trangThai').html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
                $('#tenDiaDiem').text(item.tenDiaDiem || '-');
                $('#hopThu').text(item.hopThu || '-');
                $('#lienKet').text(item.lienKet || '-');
                $('#diaChi').text(viData.diaChi || '-');
                $('#moTa').html(viData.moTa || '-');
                $('#traiNghiem').html(viData.traiNghiem || '-');
                $('#goiY').html(viData.goiY || '-');

                // Ảnh đại diện
                if (item.hinhAnh) {
                    $('#anhDaiDien').attr('src', item.hinhAnh);
                }

                // Địa điểm
                initTableDiaDiem(item.diaDiemID),

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

    async function initTableTienNghi(id) {
        const tableApi = {
            url: `${baseUrl}/api/KhuDuLichApi/TienNghi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    KhuDuLichID: id,
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
                targets: 2,
                render: function (data, type, row) {
                    return row.mienPhi ? 'Có' : 'Không';
                }
            },
            {
                targets: 3,
                render: function (data, type, row) {
                    return row.trangThai ? 'Hoạt động' : 'Không hoạt động';
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenTienNghi", "class": "left-align" },
            { "data": "", "width": "15%", "class": "center-align" },
            { "data": "", "width": "15%", "class": "center-align" }
        ];

        initDataTableConfigNoSearch('dataGridTienNghi', tableApi, tableDefs, tableCols);
    }

    async function initTableDichVuTraiNghiem(id) {
        const tableApi = {
            url: `${baseUrl}/api/KhuDuLichApi/DichVu/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    KhuDuLichID: id,
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
                targets: 0,
                render: function (data, type, row, meta) {
                    return parseInt(meta.row) + 1;
                }
            }
        ];

        const tableCols = [
            { data: null, width: "40px", class: "center-align" },
            { data: "tenCoSo", class: "left-align" },
            { data: "moTa", width: "600px", class: "left-align" },
        ];

        initDataTableConfigNoSearch('dataGridDichVuTraiNghiem', tableApi, tableDefs, tableCols);
    }

    async function initTableGiayChungNhan(id) {
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
});