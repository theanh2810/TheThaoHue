const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initDatePicker();

    (async function () {
        await loadTourDuLichDetails();
        await Promise.all([
            initTableLichTrinh(tourDuLichId),
            initTableDaPhuongTien(tourDuLichId)
        ]);
    })();

    async function loadTourDuLichDetails() {
        try {
            const res = await fetch(`${baseUrl}/api/TourDuLichApi/ChiTiet/${tourDuLichId}`, {
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
                let title = `Thông tin tour du lịch ${viData.tenTour}`;
                let htmlTitle = ``;
                if (viData.tenTour) {
                    htmlTitle = `<div class='mainTitle'>${viData.tenTour}</div>`;
                    if (viData.thoiGian) {
                        htmlTitle += `<div class='subTitle'>(${viData.thoiGian})</div>`;
                    }
                }
                $('#pageTitle').html(htmlTitle);
                document.title = title;
                // Thông tin cơ bản
                $('#maDinhDanh').text(item.maDinhDanh || '-');
                $('#tenLoaiHinh').text(item.tenLoaiHinh || '-');
                $('#tenTheLoai').text(item.tenTheLoai || '-');
                $('#tenToChuc').text(item.tenToChuc || '-');
                $('#tenPhuongTien').text(item.tenPhuongTien || '-');
                $('#tenPhanKhuc').text(item.tenPhanKhuc || '-');
                $('#tenDiemDi').text(item.tenDiemDi || '-');
                $('#tenDiemDen').text(item.tenDiemDen || '-');
                $('#giaTour').text(item.giaTour ? `${item.giaTour} VND` : '-');
                $('#giaNguoi').text(item.giaNguoi ? `${item.giaNguoi} VND` : '-');
                $('#soKhachToiThieu').text(item.soKhachToiThieu || '-');
                $('#soKhachToiDa').text(item.soKhachToiDa || '-');
                $('#ngayKhoiHanh').text(item.ngayKhoiHanh ? new Date(item.ngayKhoiHanh).toLocaleDateString('vi-VN') : '-');
                $('#ngayKetThuc').text(item.ngayKetThuc ? new Date(item.ngayKetThuc).toLocaleDateString('vi-VN') : '-');
                $('#thuTu').text(item.thuTu || '-');
                $('#trangThai').html(item.suDung ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
                $('#tenTour').text(viData.tenTour || '-');
                $('#thoiGian').text(viData.thoiGian || '-');
                $('#moTa').html(viData.moTa || '-');
                $('#traiNghiem').html(viData.traiNghiem || '-');
                $('#goiY').html(viData.goiY || '-');

                // Ảnh đại diện
                if (item.anhDaiDien) {
                    $('#anhDaiDien').attr('src', item.anhDaiDien);
                }

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

    async function initTableLichTrinh(id) {
        const tableApi = {
            url: `${baseUrl}/api/TourDuLichApi/LichTrinh/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    TourID: id,
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
                targets: 3,
                render: function (data, type, row) {
                    return formatDateWithoutTime(row.thoiDiem) || '-';
                }
            },
            {
                targets: 5,
                render: function (data, type, row) {
                    return row.suDung ? 'Hoạt động' : 'Không hoạt động';
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "hoatDong", "class": "left-align" },
            { "data": "tenDiaDiem", "width": "350px", "class": "center-align" },
            { "data": "", "width": "350px", "class": "center-align" },
            { "data": "thuTu", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align" }
        ];

        initDataTableConfigNoSearch('dataGridLichTrinh', tableApi, tableDefs, tableCols);
    }

    async function initTableDaPhuongTien(id) {
        const tableApi = {
            url: `${baseUrl}/api/TourDuLichApi/DaPhuongTien/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    TourID: id,
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