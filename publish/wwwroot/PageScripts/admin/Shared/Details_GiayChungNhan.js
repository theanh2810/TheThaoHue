$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    initTableVanBan(ID_Object)
})

function initTableVanBan(ID_Object) {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsVanBan?MaNgonNgu=vi&CoSoLuuTruID=${ID_Object}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                return data.value.map((item, index) => ({ ...item, stt: index + 1 }));
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
        },
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
            targets: 2,
            render: function (data, type, row, meta) {
                return row.tenLoaiVanBan || row.tenTheLoai || '';
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                return row.tenToChuc || '';
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                return row.ngayBanHanh ? formatDateWithoutTime(row.ngayBanHanh) : '';
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return row.ngayHieuLuc ? formatDateWithoutTime(row.ngayHieuLuc) : '';
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                if (row.duongDanFile) {
                    return `<a href="${baseUrl}${row.duongDanFile}" target="_blank" class="hgi-icon hgi-download"></a>`;
                }
                return '';
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "TenCoQuanBanHanh", "width": "15%", "class": "left-align" },
        { "data": "NgayBanHanh", "width": "10%", "class": "center-align" },
        { "data": "NgayHieuLuc", "width": "10%", "class": "center-align" },
        { "data": "", "width": "8%", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('dataGridVanBan', tableApi, tableDefs, tableCols);
}