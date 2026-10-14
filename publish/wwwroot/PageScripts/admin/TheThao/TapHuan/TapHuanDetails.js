const baseUrl = getRootLink();

$(document).ready(function () {
    (async function () {
        if (tapHuanID) {
            await Promise.all([loadChiTiet(), loadNguoiThamGia()]);
        }
    })();

    async function loadChiTiet() {
        try {
            const res = await fetch(`${baseUrl}/api/TapHuanApi/ChiTiet/${tapHuanID}/vi`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (!data || !data.isSuccess || !data.value) return;
            const v = data.value;

            console.log(v, "chi tiet")

            if (v.anhDaiDien) $('#anhDaiDien').attr('src', v.anhDaiDien);
            $('#pageTitle').text(v.tenLop || 'Chi tiết lớp tập huấn');
            $('#tenLop').text(v.tenLop || '-');
            $('#maDinhDanh').text(v.maDinhDanh || '-');
            $('#tenToChuc').text(v.tenToChuc || '-');
            $('#tenDiaDiem').text(v.tenDiaDiem || '-');
            $('#batDau').text(v.batDau ? new Date(v.batDau).toLocaleString('vi-VN') : '-');
            $('#ketThuc').text(v.ketThuc ? new Date(v.ketThuc).toLocaleString('vi-VN') : '-');
            $('#soLuongDuKien').text(v.soLuongDuKien ?? '-');
            $('#soLuongThucTe').text(v.soLuongThucTe ?? '-');
            $('#trangThai').text(v.tenTrangThai || '-');
            $('#suDung').html(v.suDung
                ? '<span class="badge badge-success">Hiển thị</span>'
                : '<span class="badge badge-secondary">Không hiển thị</span>');

            $('#noiDungBoiDuong').html(v.noiDungBoiDuong || '-');
            $('#ketQua').html(v.ketQua || '-');
            $('#ghiChu').text(v.ghiChu || '-');

            $('#nguoiTao').text(v.nguoiTao || '-');
            $('#ngayTao').text(v.ngayTao ? new Date(v.ngayTao).toLocaleDateString('vi-VN') : '-');
            $('#nguoiCapNhat').text(v.nguoiCapNhat || '-');
            $('#ngayCapNhat').text(v.ngayCapNhat ? new Date(v.ngayCapNhat).toLocaleDateString('vi-VN') : '-');
        } catch (err) {
            showNotification(0, err.message);
        }
    }

    async function loadNguoiThamGia() {
        try {
            const res = await fetch(`${baseUrl}/api/TapHuanApi/NguoiThamGia/${tapHuanID}`);
            if (!res.ok) return;
            const data = await res.json();
            const tbody = $('#bodyNguoiThamGia');
            tbody.empty();
            const list = (data && data.isSuccess) ? (data.value || []) : [];
            if (list.length === 0) {
                tbody.append('<tr><td colspan="5" class="text-center">Chưa có người tham gia</td></tr>');
                return;
            }
            list.forEach((ntg, i) => {
                tbody.append(`<tr>
                    <td>${i + 1}</td>
                    <td>${ntg.hoVaTen || ''}</td>
                    <td>${ntg.maDinhDanh || ''}</td>
                    <td>${ntg.tenVaiTro || ''}</td>
                    <td>${ntg.ketQua || ''}</td>
                </tr>`);
            });
        } catch (err) { }
    }
});
