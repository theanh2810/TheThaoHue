const baseUrl = getRootLink();

$(document).ready(function () {
    loadCongTrinhTheThaoDetails();
});

function loadCongTrinhTheThaoDetails() {
    if (!congTrinhID) return;

    // Load thông tin chung
    getDataWithApi('GET', `/api/CongTrinhTheThaoApi/ChiTiet/${congTrinhID}/vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            let title = `Chi tiết công trình thể thao: ${item.tenCongTrinh || ''}`;
            let htmlTitle = ``;
            if (item.tenCongTrinh) {
                htmlTitle = `<div class='mainTitle'>${item.tenCongTrinh}</div>`;
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;

            if (item.anhDaiDien) {
                $('#anhDaiDien').attr('src', baseUrl + item.anhDaiDien);
            }

            $('#maDinhDanh').text(item.maDinhDanh || '-');
            $('#tenLoaiHinh').text(item.tenLoaiHinh || '-');
            $('#tenToChuc').text(item.tenToChuc || '-');
            $('#tenTinhTrang').text(item.tenTinhTrang || '-');
            $('#tenDiaDiem').text(item.tenDiaDiem || '-');
            $('#dienTich').text(item.dienTich ? `${item.dienTich} m²` : '-');
            $('#sucChua').text(item.sucChua ? `${item.sucChua} người` : '-');
            $('#thuTu').text(item.thuTu || 1);
            $('#suDung').html(item.suDung ? `<span class="TrangThai green-text">Hiển thị</span>` : `<span class="TrangThai red-text">Không hiển thị</span>`);
            
            $('#tenCongTrinh').text(item.tenCongTrinh || '-');
            $('#moTa').html(item.moTa || '-');
            $('#trangThietBi').html(item.trangThietBi || '-');

            // Load Đa phương tiện
            if (typeof initTableDaPhuongTien === 'function') {
                initTableDaPhuongTien(congTrinhID);
            }

            // Load Môn thể thao
            loadMonTheThao(congTrinhID);
        }
    });
}

function loadMonTheThao(id) {
    const tableApi = {
        url: `${baseUrl}/api/MonTheThao_CongTrinhApi/GetByCongTrinh/${id}?maNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
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
                return row.tenMon || row.TenMon || '-';
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('tableMonTheThao', tableApi, tableDefs, tableCols);
}
