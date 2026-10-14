const baseUrl = getRootLink();

$(document).ready(function () {
    if (coQuanId) {
        loadCoQuanData(coQuanId);
        initAnPhamTable(coQuanId);
    }

    async function loadCoQuanData(id) {
        try {
            const res = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 437, // Cơ quan báo chí
                    toChucID: id
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess && data.value) {
                    displayCoQuanInfo(data.value[0]);
                    updatePageTitle(data.value[0]);
                } else {
                    showNotification(0, 'Không tìm thấy thông tin cơ quan báo chí');
                }
            } else {
                showNotification(0, 'Lỗi khi tải dữ liệu');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu cơ quan:', error);
            showNotification(0, 'Có lỗi xảy ra khi tải dữ liệu');
        }
    }

    function displayCoQuanInfo(data) {
        // Hiển thị thông tin cơ bản
        $('#maCoQuan').text(data.maDinhDanh || '-');
        $('#loaiHinh').text(data.loaiHinh || '-');
        $('#coQuanChuQuan').text(data.coQuanChuQuan || '-');
        $('#phamViHoatDong').text(data.phamViHoatDong || '-');
        $('#soDienThoai').text(data.dienThoai || '-');
        $('#hopThu').text(data.hopThu || '-');
        
        // Hiển thị website với link nếu có
        if (data.website) {
            $('#website').html(`<a href="${data.website}" target="_blank" class="text-primary">${data.website}</a>`);
        } else {
            $('#website').text('-');
        }
    
        $('#soGiayPhep').text(data.soGiayPhepHoatDong || '-');
        $('#thuTu').text(data.thuTu || '-');
        
        // Hiển thị ngày thành lập
        if (data.ngayThanhLap) {
            const date = new Date(data.ngayThanhLap);
            $('#ngayThanhLap').text(date.toLocaleDateString('vi-VN'));
        } else {
            $('#ngayThanhLap').text('-');
        }

        // Hiển thị trạng thái
        if (data.trangThaiID == 1) {
            $('#trangThai').html('<span class="TrangThai green-text">Duyệt</span>');
        } else {
            $('#trangThai').html('<span class="TrangThai red-text">Chưa duyệt</span>');
        }

        // Hiển thị thông tin đa ngữ
        $('#ngonNguDich').text(data.ngonNguName || '-');
        $('#tenCoQuanDich').text(data.tenToChuc || '-');
        $('#diaChiDich').text(data.diaChi || '-');
        $('#gioiThieuDich').html(data.gioiThieu || '-');
        $('#ghiChuDich').html(data.ghiChu || '-');

        $('#nguoiTao').text(data.tenNguoiTao || '-');
        $('#ngayTao').text(data.ngayTao ? formatDateWithoutTime(data.ngayTao) : '-');
        $('#nguoiCapNhat').text(data.tenNguoiCapNhat || '-');
        $('#ngayCapNhat').text(data.ngayCapNhat ? formatDateWithoutTime(data.ngayCapNhat) : '-');
    }

    function updatePageTitle(data) {
        let title = `Chỉnh sửa ${data.tenToChuc}`;
        let htmlTitle = ``;
        if (data.tenToChuc) {
            htmlTitle = `<div class='mainTitle'>${data.tenToChuc}</div>`;
            if (data.maDinhDanh) {
                htmlTitle += `<div class='subTitle'>(${data.maDinhDanh})</div>`;
            }
        }
        $('#pageTitle').html(htmlTitle);
        document.title = title;
    }

    function initAnPhamTable(id) {
        const tableApi = {
            url: `${baseUrl}/api/BaoChiAnPhamApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    toChucID: id,
                    trangThai: null, // Load cả active và inactive
                    tuKhoa: null,
                    maNgonNgu: "vi"
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
                targets: 5, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.trangThai) {
                        return `<span class="TrangThai green-text">Đã phát hành</span>`;
                    } else {
                        return `<span class="TrangThai yellow-text">Chưa phát hành</span>`;
                    }
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenAnPham", "class": "left-align" },
            { "data": "tenTanSuat", "width": "12%", "class": "left-align" },
            { "data": "tenLinhVucChuyenSau", "width": "15%", "class": "left-align" },
            { "data": "luotTiepCan", "width": "12%", "class": "left-align" },
            { "data": "trangThai", "width": "10%", "class": "left-align" }
        ];

        initDataTableConfigNoSearch('tableAnPham', tableApi, tableDefs, tableCols);
    }
});
