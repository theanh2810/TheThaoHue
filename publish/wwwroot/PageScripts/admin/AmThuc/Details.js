const baseUrl = getRootLink();

$(document).ready(function () {
    loadAmThucDetails();
});

function loadAmThucDetails() {
    getDataWithApi('GET', `/api/VH_AmThucApi/Get?MonAnUongID=${amThucId}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            let title = `Thông tin ẩm thực ${item.tenMon}`;
            let htmlTitle = ``;
            if (item.tenMon) {
                htmlTitle = `<div class='mainTitle'>${item.tenMon}</div>`;
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            $('#tenKieuMon').text(item.tenKieuMon || '');
            $('#tenCheDoAn').text(item.tenCheDoAn || '');
            $('#thuTu').text(item.thuTu || 0);
            $('#dacSan').text(item.dacSan ? 'Có' : 'Không');
            $('#trangThai').html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
            $('#tenMon').text(item.tenMon || '');
            $('#moTa').html(item.moTa || '-');
            $('#nguyenLieu').html(item.nguyenLieu || '-');
            $('#traiNghiem').html(item.traiNghiem || '-');
            $('#nguoiTao').text(item.tenNguoiTao || '-');
            $('#ngayTao').text(item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '-');
            $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
            $('#ngayCapNhat').text(item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleDateString('vi-VN') : '-');
            if (item.anhDaiDien) {
                $('#anhDaiDien').attr('src', baseUrl + item.anhDaiDien);
            }
            // Load danh sách lễ hội
            if (item.listLeHoiID) {
                console.log(item.listLeHoiID, "Danh sách địa điểm đã chọn")
                let listLeHoi = item.listLeHoiID.split(',').map(x => x.trim().toLowerCase());
                $("#LeHoiCoSanAdd").val(listLeHoi.map(item => item)).trigger('change');
                initTableLeHoi(listLeHoi.map(item => item).join(','));
            }
        }
    });
}

function initTableLeHoi(list) {
    const tableApi = {
        url: `${baseUrl}/api/VH_LeHoiApi/GetMulti?MaNgonNgu=vi&ListIDLeHoi=${list}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                console.log(data)
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
                        <a href="${baseUrl}/AdminTool/LeHoi/Details?id=${row.leHoiID}" class="text-primary text-decoration-none">
                            ${row.tenLeHoiChild || ''}
                        </a>
                    </div>
                    <div class="info-sub">${row.tenToChuc || ''}</div>
                </div>`;
            }
        },
        {
            targets: 2, 
            render: function (data, type, row, meta) {
                return row.theLoai || '';
            }
        },
        {
            targets: 3, 
            render: function (data, type, row, meta) {
                return row.capDo || '';
            }
        },
        {
            targets: 4, 
            render: function (data, type, row, meta) {
                return row.tanSuat || 0;
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return row.thoiGianDienRa || '';
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "tenLeHoiChild", "class": "left-align name-text" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "7%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align name-text" },
        { "data": "", "width": "8%", "class": "left-align" },
    ];

    initDataTableConfigNoSearch('dataGridLeHoi', tableApi, tableDefs, tableCols);
}