const baseUrl = getRootLink();

let tempToChuc = [];
let allToChuc = [];
let allVaiTro = [];
let editingToChucIndex = null;

$(document).ready(function () {
    // Bỏ init select2 và datepicker vì view này chỉ đọc
    loadAllData();

    console.log(chuongTrinhDuAnID, "chuongTrinhDuAnID");

    if (chuongTrinhDuAnID) {
        setTimeout(() => loadData(chuongTrinhDuAnID), 500);
    }


});

function loadAllData() {
    // Load tổ chức
    getDataWithApi('POST', `${baseUrl}/api/ToChucApi/DanhSach`, {
        loaiToChucID: 96
    }).then(data => {
        if (data && data.isSuccess && data.value) {
            allToChuc = data.value;
            console.log("allToChuc", allToChuc)
        }
    });
    
    // Load vai trò
    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DanhMucChungApi/DanhSach`,
        data: JSON.stringify({
            LoaiDanhMucID: 90,
            TrangThai: true
        }),
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                allVaiTro = data.value;
                console.log("allVaiTro", allVaiTro)
            }
        },
    });
}

function loadData(id) {
    console.log("bat dau load", id)
    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/GetsByChuongTrinhID`,
        data: {
            MaNgonNgu: 'vi',
            ChuongTrinhDuAnID: id
        },
        dataType: 'json',
        success: function (data) {
            console.log('Dữ liệu từ API:', data);
            if (data && data.isSuccess && data.value) {
                const item = data.value;
                console.log('Dữ liệu chương trình:', item);

                $("#tenChuongTrinh").text(item.tenChuongTrinh || '-');
                $("#trangThai").text(item.tenTrangThai || '-');
                
                const donViID = item.donVi || item.donViPhuTrachID;
                const toChucObj = donViID ? allToChuc.find(t => t.toChucID == donViID) : null;
                $("#donViPhuTrach").text(item.tenDonVi || item.tenDonViPhuTrach || (toChucObj ? toChucObj.tenToChuc : '-'));

                $("#ngayBatDau").text(formatDateWithoutTime(item.batDau || item.ngayBatDau) || '-');
                $("#ngayKetThuc").text(formatDateWithoutTime(item.ketThuc || item.ngayKetThuc) || '-');
                $("#quaTrinhTrienKhai").html(item.quaTrinhTrienKhai ? item.quaTrinhTrienKhai.replace(/\n/g, '<br>') : '-');
                $("#mucTieuDuAn").html((item.mucDich || item.mucTieuDuAn) ? (item.mucDich || item.mucTieuDuAn).replace(/\n/g, '<br>') : '-');
                $("#ketQuaDuKien").html((item.ketQua || item.ketQuaDuKien) ? (item.ketQua || item.ketQuaDuKien).replace(/\n/g, '<br>') : '-');

                // Load tổ chức tham gia
                if (item.danhSachToChuc && item.danhSachToChuc.length > 0) {
                    tempToChuc = item.danhSachToChuc.map(t => ({
                        chuongTrinhDuAnToChucID: t.chuongTrinhDuAnToChucID,
                        toChucID: t.toChucID,
                        tenToChuc: t.tenToChuc,
                        vaiTroID: t.vaiTroID
                    }));
                    renderToChucTable();
                }
            } else {
                showNotification(0, data.error || 'Không tìm thấy dữ liệu');
            }
        },
        error: function (err) {
            console.error('Lỗi khi load dữ liệu:', err);
            showNotification(0, 'Lỗi khi tải dữ liệu');
        }
    });
}

function renderToChucTable() {
    const tbody = $('#tableToChuc tbody');
    tbody.empty();

    tempToChuc.forEach((item, index) => {
        const row = `<tr>
            <td class="text-center">${index + 1}</td>
            <td>${item.tenToChuc}</td>
            <td>${item.vaiTroID ? allVaiTro.find(v => v.danhMucID == item.vaiTroID)?.tenDanhMuc || '' : ''}</td>
        </tr>`;
        tbody.append(row);
    });
}


