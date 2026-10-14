const baseUrl = getRootLink();

$(document).ready(function () {
    if (suKienId) {
        loadData(suKienId);
    }
});

function loadData(suKienId) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Get?MaNgonNgu=vi&SuKienID=${suKienId}`).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            let suKien = data.value;
            let title = `Thông tin sự kiện ${suKien.tenSuKien}`;
            let htmlTitle = ``;
            if (suKien.tenSuKien) {
                htmlTitle = `<div class='mainTitle'>${suKien.tenSuKien}</div>`;
                if (suKien.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${suKien.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;

            $("#tensuKien").text(suKien.tenSuKien);
            $("#capDoSuKien").text(suKien.tenCapDo);
            $("#trangThaiSuKien").text(suKien.tenTrangThai);
            $("#ngayBatDau").text(formatDateWithoutTime(suKien.batDau));
            $("#ngayKetThuc").text(formatDateWithoutTime(suKien.ketThuc));
            $("#diaChiSuKien").text(suKien.diaChi);
            $("#ketQuaSuKien").text(suKien.ketQua);
            $("#moTaSuKien").html(suKien.moTa);
            $("#thuTu").val(suKien.thuTu);
            $("#anhDaiDien").attr("src", suKien.anhDaiDien || '/assets/images/vector/no-image.png');
            $("#ngayCapNhat").text(formatDateWithoutTime(suKien.ngayCapNhat))

            $('#nguoiTao').text(suKien.tenNguoiCapNhat || '-');
            $('#ngayTao').text(formatDateWithoutTime(suKien.ngayCapNhat) || '-');
            $('#nguoiCapNhat').text(suKien.tenNguoiHieuChinh || '-');
            $('#ngayCapNhat').text(formatDateWithoutTime(suKien.ngayHieuChinh) || '-');

            if (suKien.listIDDiaDiem) {
                console.log(suKien.listIDDiaDiem, "Danh sách địa điểm đã chọn")
                let listDiaDiem = suKien.listIDDiaDiem.split(',').map(x => x.trim().toLowerCase());
                $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableDiaDiem(listDiaDiem.map(item => item).join(','));
            } else {
                $("#ViTriBanDo-tab").hide();
            }
        }
    })
}