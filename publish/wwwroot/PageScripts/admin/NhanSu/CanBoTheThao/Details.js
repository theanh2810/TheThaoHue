const baseUrl = getRootLink();

$(document).ready(function () {
    if (nhanSuId) {
        loadData(nhanSuId);
    }
});

function loadData(nhanSuId) {
    // Load thông tin cán bộ thể thao
    getDataWithApi('GET', `/api/DM_CaNhan_CanBoTheThaoApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            let nhanSu = data.value;
            let title = `Thông tin cán bộ thể thao ${nhanSu.hoTen}`;
            let htmlTitle = ``;
            if (nhanSu.hoTen) {
                htmlTitle = `<div class='mainTitle'>${nhanSu.hoTen}</div>`;
                if (nhanSu.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${nhanSu.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            $("#maDinhDanh").text(nhanSu.maDinhDanh || '-');
            $("#anhDaiDien").attr('src', nhanSu.anhChanDung || '/assets/images/vector/no-image.png');
            $("#gioiTinh").text(nhanSu.gioiTinh || '-')
            $("#ngaySinh").text(formatDateWithoutTime(nhanSu.ngaySinh) || '-');
            $("#danToc").text(nhanSu.danToc || '-')
            $("#soDienThoai").text(nhanSu.dienThoai || '-');
            $("#hopThu").text(nhanSu.hopThu || '-');
            $("#donViCongTac").text(nhanSu.listTenToChuc || '-');
            $("#trangThai").html(nhanSu.trangThai ? `<div class="TrangThai green-text">Duyệt</div>` : `<div class="TrangThai red-text">Chưa duyệt</div>`);
            $("#donViCongTac").text(nhanSu.listTenToChuc || '-');
            //$("#soThe").text(nhanSu.soThe || '-');
            //$("#ngayCap").text(formatDateWithoutTime(nhanSu.ngayCap) || '-');
            //$("#coQuanCap").text(nhanSu.coQuanCap || '-');
            $("#thuTu").text(nhanSu.thuTu || '-');
            if (nhanSu.trangThai) {
                $("input[name='trangThai'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThai'][value='0']").prop('checked', true);
            }
            $("#diaChi").text(nhanSu.diaChi || '-');
            $("#noiLamViec").text(nhanSu.noiLamViec || '-');
            $("#moTanhanSu").html(decodeCkeditorHtml(nhanSu.moTa || '-'));
            $("#ghiChu").html(decodeCkeditorHtml(nhanSu.ghiChu || '-'));

            //Thông tin cập nhật
            $("#nguoiTao").text(nhanSu.tenNguoiTao || '-');
            $("#ngayTao").text(formatDateWithoutTime(nhanSu.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(nhanSu.tenNguoiCapNhat || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(nhanSu.ngayHieuChinh) || '-');  
        }
    });

    // Load môn thể thao
    initTableTheThao(nhanSuId);
}

function initTableTheThao(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_CanBoTheThaoApi/GetListMon?CaNhanID=${nhanSuId}&maNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                data.value.forEach((nhanSu, index) => {
                    nhanSu.stt = index + 1;
                    nhanSu.tenMonTheThao = nhanSu.tenMonTheThao || '-';
                    nhanSu.laMonChinh = nhanSu.laMonChinh ? 'Có' : 'Không';
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
                return row.MonTheThaoChinh ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenMon", "class": "left-align" },
        { "data": "laMonChinh", "width": "20%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('tableTheThao', tableApi, tableDefs, tableCols);
}