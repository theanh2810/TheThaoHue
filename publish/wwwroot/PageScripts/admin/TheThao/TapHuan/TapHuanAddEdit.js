const baseUrl = getRootLink();

$(document).ready(function () {
    let translations = [];
    let nguoiThamGia = [];

    initSelect2();
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initToChuc(),
            initDiaDiem(),
            initTrangThaiTapHuan(),
        ]);
        if (tapHuanID) {
            await loadChiTiet();
            await loadNguoiThamGia();
        }
    })();

    // ====== LOAD CHI TIẾT ======
    async function loadChiTiet() {
        try {
            const res = await fetch(`${baseUrl}/api/TapHuanApi/ChiTiet/${tapHuanID}/vi`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data && data.isSuccess && data.value) {
                const v = data.value;
                console.log(v, "v value")
                $('#previewAnhDaiDien').attr('src', v.anhDaiDien || '/assets/images/vector/addImage.png');
                $('#urlAnhDaiDien').val(v.anhDaiDien || '');
                $('#maDinhDanh').val(v.maDinhDanh || '');
                $('#toChucID').val(v.toChucID).trigger('change');
                $('#diaDiemID').val(v.diaDiemID).trigger('change');
                $('#trangThaiID').val(v.trangThaiID).trigger('change');
                $('#batDau').val(formatDateWithoutTime(v.batDau));
                $('#ketThuc').val(formatDateWithoutTime(v.ketThuc));
                $('#soLuongDuKien').val(v.soLuongDuKien || '');
                $('#soLuongThucTe').val(v.soLuongThucTe || '');
                $('#thuTu').val(v.thuTu || 1);
                $(`input[name="suDung"][value="${v.suDung ? 1 : 0}"]`).prop('checked', true);

                //ko có bản dịch - tạm tắt mở nếu có translate
                //translations = v.banDich || [];
                //$('#ngonNgu').val('vi').trigger('change');


                $('#tenLop').val(v.tenLop || '');
                $('#noiDungBoiDuong').val(v.noiDungBoiDuong || '');
                $('#ketQua').val(v.ketQua || '');
                $('#ghiChu').val(v.ghiChu || '');
            }
        } catch (err) {
            showNotification(0, err.message);
        }
    }

    // ====== ĐA NGỮ ======
    $('#ngonNgu').on('change', function () {
        const lang = $(this).val();
        const found = translations.find(t => t.maNgonNgu === lang);
        $('#tenLop').val(found ? found.tenLop : '');
        $('#noiDungBoiDuong').val(found ? found.noiDungBoiDuong : '');
        $('#ketQua').val(found ? found.ketQua : '');
        $('#ghiChu').val(found ? found.ghiChu : '');
    });

    function saveCurrentTranslation() {
        const lang = $('#ngonNgu').val();
        if (!lang) return;
        const idx = translations.findIndex(t => t.maNgonNgu === lang);
        const obj = {
            maNgonNgu:       lang,
            tenLop:          $('#tenLop').val().trim(),
            noiDungBoiDuong: $('#noiDungBoiDuong').val().trim(),
            ketQua:          $('#ketQua').val().trim(),
            ghiChu:          $('#ghiChu').val().trim(),
        };
        if (idx !== -1) translations[idx] = obj;
        else translations.push(obj);
    }

    // ====== LƯU ======
    async function doSave(closeAfter) {
        saveCurrentTranslation();

        const viTrans = translations.find(t => t.maNgonNgu === 'vi');
        if (!viTrans || !viTrans.tenLop) {
            showNotification(0, 'Vui lòng nhập tên lớp tập huấn (tiếng Việt)');
            return;
        }
        
        let batDau = $('#batDau').val();
        let ketThuc = $('#ketThuc').val();
        
        const entity = {
            tapHuanID:      tapHuanID || null,
            maDinhDanh:     $('#maDinhDanh').val().trim() || null,
            anhDaiDien:     $('#urlAnhDaiDien').val() || null,
            toChucID:       $('#toChucID').val() || null,
            diaDiemID:      $('#diaDiemID').val() || null,
            trangThaiID:    parseInt($('#trangThaiID').val()) || null,
            batDau:         formatDateToSendWithoutTime(batDau) || null,
            ketThuc:        formatDateToSendWithoutTime(ketThuc) || null,
            soLuongDuKien:  parseInt($('#soLuongDuKien').val()) || null,
            soLuongThucTe:  parseInt($('#soLuongThucTe').val()) || null,
            thuTu:          parseInt($('#thuTu').val()) || 1,
            suDung:         $('input[name="suDung"]:checked').val() === '1',
        };

        console.log(entity, "entity");
        //return;

        const formData = new FormData();
        formData.append('TapHuan', JSON.stringify(entity));
        formData.append('TapHuan_NoiDung', JSON.stringify(translations));
        const fileInput = document.getElementById('anhDaiDien');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('AnhDaiDien', fileInput.files[0]);
        }

        try {
            const method = tapHuanID ? 'PUT' : 'POST';
            const url = tapHuanID
                ? `${baseUrl}/api/TapHuanApi/ChinhSua/${tapHuanID}`
                : `${baseUrl}/api/TapHuanApi/ThemMoi`;

            const res = await fetch(url, { method, body: formData });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            if (data && data.isSuccess) {
                tapHuanID = tapHuanID || data.value.tapHuanID;
                showNotification(1, tapHuanID ? 'Cập nhật thành công' : 'Thêm mới thành công');
                if (closeAfter) {
                    window.location.href = `${baseUrl}/AdminTool/TapHuan`;
                }
            } else {
                showNotification(0, data.error || 'Lưu thất bại');
            }
        } catch (err) {
            showNotification(0, err.message);
        }
    }

    $('#btn-save').on('click', () => doSave(false));
    $('#btn-save-and-close').on('click', () => doSave(true));

    // ====== NGƯỜI THAM GIA ======
    async function loadNguoiThamGia() {
        if (!tapHuanID) return;
        try {
            const res = await fetch(`${baseUrl}/api/TapHuanApi/NguoiThamGia/${tapHuanID}`);
            const data = await res.json();
            if (data && data.isSuccess) {
                nguoiThamGia = data.value || [];
                renderNguoiThamGia();
            }
        } catch (err) { }
    }

    function renderNguoiThamGia() {
        const tbody = $('#bodyNguoiThamGia');
        tbody.empty();
        nguoiThamGia.forEach((ntg, i) => {
            tbody.append(`<tr>
                <td>${i + 1}</td>
                <td>${ntg.hoVaTen || ''}</td>
                <td>${ntg.maDinhDanh || ''}</td>
                <td>${ntg.tenVaiTro || ''}</td>
                <td>${ntg.ketQua || ''}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-xoa-ntg" data-idx="${i}">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>`);
        });
    }

    $(document).on('click', '.btn-xoa-ntg', function () {
        const idx = $(this).data('idx');
        nguoiThamGia.splice(idx, 1);
        renderNguoiThamGia();
    });

    async function initTrangThaiTapHuan() {
        await initDanhMucChung_NoAll(100, '#trangThaiID', 'Trạng thái');
    }

    async function initNgonNgu() {
        try {
            const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThai: true })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data && data.isSuccess && data.value) {
                $('#ngonNgu').empty();
                data.value.forEach(lang => {
                    const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';
                    $('#ngonNgu').append(`<option value="${lang.maNgonNgu?.toLowerCase()}" ${isSelected}>${lang.tenNgonNgu}</option>`);
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function initToChuc() {
        try {
            const res = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
               /* body: JSON.stringify({ maNgonNgu: 'vi', trangThai: true })*/
                body: JSON.stringify({
                    loaiToChucID: 96,
                })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data && data.isSuccess && data.value) {
                $('#toChucID').empty().append('<option value=""></option>');
                data.value.forEach(el => {
                    $('#toChucID').append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function initDiaDiem() {
        try {
            const res = await fetch(`${baseUrl}/api/DiaDiemApi/DanhSach`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maNgonNgu: 'vi', trangThai: true })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data && data.isSuccess && data.value) {
                $('#diaDiemID').empty().append('<option value=""></option>');
                data.value.forEach(el => {
                    $('#diaDiemID').append(`<option value="${el.diaDiemID}">${el.tenDiaDiem}</option>`);
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    }
});
