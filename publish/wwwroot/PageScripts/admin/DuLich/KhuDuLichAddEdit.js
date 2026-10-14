const baseUrl = getRootLink();
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const guidEmpty = "00000000-0000-0000-0000-000000000000";

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    previewPicture_WithSelector('anhDaiDien', 'previewAnhDaiDien')
    let pondGCN = initFilePond('fileGCN');
    let ckeGoiY = CKEDITOR.replace('goiY');
    let ckeTraiNghiem = CKEDITOR.replace('traiNghiem');
    let ckeMoTa = CKEDITOR.replace('moTa');

    let khuDuLichTranslations = [];
    let daPhuongTientranslations = [];
    let diaDiemTranslations = [];
    let listTienNghi = [];
    let listDichVuTraiNghiem = [];
    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initLoaiHinhKhuDuLich(),
            initCapXepHang(),
            initToChuc(),
            initNamCongNhan(),
            initLoaiGiayChungNhan(),
            initCoQuanBanHanh(),
            initDiaDiem(),
            initTinhThanhPho()
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(khuDuLichID)) {
            initTableTienNghi(khuDuLichID)
            initTableGiayChungNhan(khuDuLichID)
            initTableDaPhuongTien(khuDuLichID)
            initTableDichVuTraiNghiem(khuDuLichID)
        }
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "1") {
            // tọa độ
        } else if (type == "tiennghi") {
            dataDeleteTienNghi();
        } else if (type == "giaychungnhan") {
            dataDeleteGiayChungNhan()
        } else if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        } else if (type == "dichvutrainghiem") {
            dataDeleteDichVuTraiNghiem();
        }
    });

    //#region THÔNG TIN CHUNG

    async function initThongTinChung() {
        if (checkEmptyBlank(khuDuLichID)) {
            return;
        }

        try {
            const res = await fetch(`/api/KhuDuLichApi/ChiTiet/${khuDuLichID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();
            if (data && data.isSuccess && data.value) {
                $("#khuDuLichID").val(data.value.khuDuLichID || "");
                $("#previewAnhDaiDien").attr("src", data.value.hinhAnh || "/images/no-image.png");
                $("#urlAnhDaiDien").val(data.value.hinhAnh || "");
                $("#loaiHinhID").val(data.value.loaiHinhID || "").trigger("change");
                $("#capID").val(data.value.capID || "").trigger("change");
                $("#toChucID").val(data.value.toChucID || "").trigger("change");
                $("#namCongNhan").val(data.value.namCongNhan || "").trigger("change");
                $("#DiaDiemCoSanAdd").val(data.value.diaDiemID || "").trigger("change");

                $("#dienThoai").val(data.value.dienThoai || "");
                $("#hopThu").val(data.value.hopThu || "");
                $("#lienKet").val(data.value.lienKet || "");
                $("#dienTich").val(data.value.dienTich || "");
                $("#thuTu").val(data.value.thuTu || 1);

                if (data.value.trangThai === true || data.value.trangThai === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                khuDuLichTranslations = data.value.banDich || [];

                let tiengViet = khuDuLichTranslations.find(el => el.maNgonNgu === "vi") || null;
                if (tiengViet) {
                    $(".TieuDe #pageTitle").text(`Chỉnh sửa khu du lịch ${tiengViet.tenKhuDuLich}`);

                    $("#ngonNgu").val("vi").trigger("change");
                    $("#tenKhuDuLich").val(tiengViet.tenKhuDuLich || "");
                    $("#diaChi").val(tiengViet.diaChi || "");
                    $("#moTa").val(tiengViet.moTa || "");
                    $("#traiNghiem").val(tiengViet.traiNghiem || "");
                    $("#goiY").val(tiengViet.goiY || "");
                } else {
                    $("#tenKhuDuLich, #diaChi, #moTa, #traiNghiem, #goiY").val("");
                }
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    function saveTempKhuDuLichTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenKhuDuLich = $("#tenKhuDuLich").val().trim();
        let diaChi = $("#diaChi").val().trim();
        let moTa = ckeGoiY.getData();
        let traiNghiem = ckeTraiNghiem.getData();
        let goiY = ckeMoTa.getData();
        let nguoiDaiDien = $("#nguoiDaiDien").val().trim();
        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = khuDuLichTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tenKhuDuLich && !diaChi && !moTa && !traiNghiem && !goiY && !nguoiDaiDien) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                khuDuLichTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                khuDuLichTranslations[index].tenKhuDuLich = tenKhuDuLich;
                khuDuLichTranslations[index].diaChi = diaChi;
                khuDuLichTranslations[index].moTa = moTa;
                khuDuLichTranslations[index].traiNghiem = traiNghiem;
                khuDuLichTranslations[index].goiY = goiY;
                khuDuLichTranslations[index].nguoiDaiDien = nguoiDaiDien;
            } else {
                // thêm mới
                khuDuLichTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenKhuDuLich: tenKhuDuLich,
                    diaChi: diaChi,
                    moTa: moTa,
                    traiNghiem: traiNghiem,
                    goiY: goiY,
                    nguoiDaiDien: nguoiDaiDien
                });
            }
        }
    }
    $(document).ready(function () {
        // Sự kiện blur trên input/textarea → tự động lưu
        $("#tenKhuDuLich, #diaChi, #nguoiDaiDien").on("blur", function () {
            saveTempKhuDuLichTranslation();
        });

        ckeGoiY.on("change", function () {
            saveTempKhuDuLichTranslation()
        })

        ckeTraiNghiem.on("change", function () {
            saveTempKhuDuLichTranslation()
        })

        ckeMoTa.on("change", function () {
            saveTempKhuDuLichTranslation()
        })
        // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
        $("#ngonNgu").on("change", function () {
            let maNgonNgu = $(this).val();
            let exist = khuDuLichTranslations.find(t => t.maNgonNgu === maNgonNgu);

            if (exist) {
                $("#tenKhuDuLich").val(exist.tenKhuDuLich);
                $("#diaChi").val(exist.diaChi);
                ckeGoiY.setData(exist.moTa);
                ckeTraiNghiem.setData(exist.traiNghiem);
                ckeMoTa.setData(exist.goiY);
                $('#nguoiDaiDien').val(exist.nguoiDaiDien);
            } else {
                // reset nếu chưa có dữ liệu
                $("#tenKhuDuLich").val("");
                $("#diaChi").val("");
                ckeGoiY.setData("");
                ckeTraiNghiem.setData("");
                ckeMoTa.setData("");
                $('#nguoiDaiDien').val("");
            }
        });
    })


    $("#btn-save").on("click", async function (e) {
        saveTempKhuDuLichTranslation();
        khuDuLichTranslations = khuDuLichTranslations.filter(t => t.tenKhuDuLich && t.tenKhuDuLich.trim() !== "");

        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        $("#btn-save-and-close").prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
            await dataAddThongTinChung();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            // Enable lại button sau 1 giây
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                $("#btn-save-and-close").prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
       
        e.preventDefault();
    });
    $("#btn-save-and-close").on("click", async function (e) {
        saveTempKhuDuLichTranslation();
        khuDuLichTranslations = khuDuLichTranslations.filter(t => t.tenKhuDuLich && t.tenKhuDuLich.trim() !== "");

        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        $("#btn-save").prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
            await dataAddThongTinChung(true);
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            // Enable lại button sau 1 giây
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                $("#btn-save").prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let loaiHinhID = $('#loaiHinhID').val() || null;
        let toChucID = $('#toChucID').val() || null;
        let capID = $('#capID').val() || null;
        let namCongNhan = $('#namCongNhan').val()?.trim() || null;
        let dienTich = $('#dienTich').val()?.trim() || null;
        let dienThoai = $('#dienThoai').val()?.trim() || null;
        let hopThu = $('#hopThu').val()?.trim() || null;
        let lienKet = $('#lienKet').val()?.trim() || null;
        let diaDiemID = $('#DiaDiemCoSanAdd').val() || null;

        let thuTu = $('#thuTu').val() || 1;
        let trangThai = $("input[name='suDung']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = khuDuLichTranslations.find(el => el.maNgonNgu === 'vi')?.tenKhuDuLich || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !loaiHinhID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let khuDuLich = {
            KhuDuLichID: khuDuLichID || null,
            LoaiHinhID: loaiHinhID,
            DiaDiemID: diaDiemID,
            ToChucID: toChucID,
            CapID: capID,
            NamCongNhan: namCongNhan,
            DienTich: dienTich,
            DienThoai: dienThoai,
            HopThu: hopThu,
            LienKet: lienKet,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            TrangThai: trangThai == '1' ? true : false,
            HinhAnh: urlAnhDaiDien,
            DiemDuLich: 0
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("KhuDuLich", JSON.stringify(khuDuLich));
        formData.append("KhuDuLich_NoiDung", JSON.stringify(khuDuLichTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("HinhAnh", anhDaiDien);
        }

        if (checkEmptyBlank(khuDuLichID)) {
            try {
                const res = await fetch('/api/KhuDuLichApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công')
                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/KhuDuLich';
                        }, 2000);
                    } else {
                        khuDuLichID = data.value.khuDuLichID
                        initThongTinChung();
                        //reset lại file ảnh đại diện
                        $("#anhDaiDien").val(null);
                        initTableTienNghi(data.value.khuDuLichID)
                        initTableGiayChungNhan(data.value.khuDuLichID)
                        initTableDaPhuongTien(data.value.khuDuLichID)
                        initTableDichVuTraiNghiem(data.value.khuDuLichID)
                        reloadAccess()
                    }

                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/KhuDuLichApi/ChinhSua/${khuDuLichID}`, {
                    method: 'PUT',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công')
                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/KhuDuLich';
                        }, 2000);
                    } else {
                        khuDuLichID = data.value.khuDuLichID
                        initThongTinChung();
                        //reset lại file ảnh đại diện
                        $("#anhDaiDien").val(null);
                        reloadAccess()
                    }
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    //#endregion THÔNG TIN CHUNG

    //#region TIỆN NGHI
    function initTableTienNghi(id) {
        listTienNghi = initListTienNghi();

        const tableApi = {
            url: `${baseUrl}/api/KhuDuLichApi/TienNghi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    KhuDuLichID: id,
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
                targets: 0,
                render: function (data, type, row, meta) {
                    return Number(meta.row) + 1;
                }
            },
            {
                targets: 2,
                render: function (data, type, row) {
                    if (row._isNew) {
                        return `<input type="checkbox" id="mienPhiEdit" name="mienPhi" ${row.mienPhi ? "checked" : ""}>`;
                    } else {
                        return row.mienPhi ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
                    }
                }
            },
            {
                targets: 3,
                render: function (data, type, row) {
                    if (row._isNew) {
                        return `<input type="checkbox" id="trangThaiTienNghiEdit" name="trangThaiTienNghi" ${row.trangThai ? "checked" : ""}>`;
                    } else {
                        return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                    }
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `
                        <button type="button" class="btnSaveTienNghi hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelTienNghi hgi-icon hgi-cancel"></button>
                    `;
                    }

                    const editIcon = `<i class="edit-tien-nghi cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                    const deleteIcon = `<i class="delete-tien-nghi cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                    return editIcon + deleteIcon;
                }
            }
        ];

        const tableCols = [
            { data: null, width: "40px", class: "center-align" },
            { data: "tenTienNghi", class: "left-align" },
            { data: "mienPhi", width: "100px", class: "center-align" },
            { data: "trangThai", width: "120px", class: "center-align" },
            { data: null, width: "120px", class: "center-align group-icon-action" }
        ];

        const table = $('#tableTienNghiCoSo').DataTable({
            ajax: tableApi,
            columns: tableCols,
            columnDefs: tableDefs,
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            autoWidth: false,
            responsive: true,
            language: {
                emptyTable: "Chưa có tiện nghi nào"
            }
        });

        // Hàm sinh ra select tiện nghi (loại bỏ tiện nghi đã chọn rồi)
        function createSelectTienNghi(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            listTienNghi.forEach(t => {
                options += `<option value="${t.danhMucID}" ${t.danhMucID === selectedId ? "selected" : ""}>${t.tenDanhMuc}</option>`;
            });
            return `<select id="selectTienNghiEdit" class="form-control">${options}</select>`;
        }

        // === Thêm dòng mới ===
        let newRow = null;
        let originalRowData = null;
        $('#btnAddTienNghiCoSoEdit').on('click', function () {
            if (newRow) return;

            const rowData = {
                stt: table.rows().count() + 1,
                tenTienNghi: createSelectTienNghi(),
                mienPhi: false,
                trangThai: false,
                _isNew: true
            };
            newRow = table.row.add(rowData).draw(false).node();
            $(newRow).addClass('adding');
            initSelect2();
        });

        // === Hủy thêm dòng ===
        $('#tableTienNghiCoSo').on('click', '.btnCancelTienNghi', function () {
            if (originalRowData) {
                table.row(newRow).data(originalRowData).draw(false);
                $(newRow).removeClass('adding');
                originalRowData = null;
            } else {
                table.row('.adding').remove().draw(false);
            }
            newRow = null;
        });

        // === Chỉnh sửa dòng ===
        $('#tableTienNghiCoSo').on('click', '.edit-tien-nghi', function () {
            if (newRow) return;

            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();
            originalRowData = { ...rowData };
            const editRowData = {
                tenTienNghi: createSelectTienNghi(rowData.tienNghiID),
                mienPhi: rowData.mienPhi,
                trangThai: rowData.trangThai,
                oldTienNghiID: rowData.tienNghiID,
                _isNew: true
            };
            table.row(rowNode).data(editRowData).draw(false);
            $(rowNode).addClass('adding');
            initSelect2();
            newRow = rowNode;
        });

        // === Lưu dòng mới hoặc chỉnh sửa ===
        $('#tableTienNghiCoSo').on('click', '.btnSaveTienNghi', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            let oldTienNghiID = rowData.oldTienNghiID;
            let danhMucID = $('#selectTienNghiEdit').val();
            let MienPhi = $('#mienPhiEdit').is(':checked');
            let TrangThai = $('#trangThaiTienNghiEdit').is(':checked');

            if (!danhMucID) {
                showNotification(0, "Vui lòng chọn tiện nghi!");
                return;
            }
           
            let isDuplicate = table.rows().data().toArray().find(e => e.tienNghiID == Number(danhMucID));
            if (isDuplicate) {
                showNotification(0, "Tiện nghi đã được thêm, vui lòng chọn tiện nghi khác!");
                return;
            }

            const request = {
                KhuDuLichID: id,
                TienNghiID: parseInt(danhMucID),
                TrangThai: TrangThai,
                MienPhi: MienPhi,
                OldTienNghiID: oldTienNghiID != "" ? parseInt(oldTienNghiID) : null
            };

            const isEdit = originalRowData !== null;
            const apiUrl = isEdit
                ? `${baseUrl}/api/KhuDuLichApi/TienNghi/ChinhSua/${khuDuLichID}`
                : `${baseUrl}/api/KhuDuLichApi/TienNghi/ThemMoi`;
            const method = isEdit ? "PUT" : "POST";

            $.ajax({
                url: apiUrl,
                type: method,
                data: JSON.stringify(request),
                contentType: "application/json",
                success: function (res) {
                    if (res && res.isSuccess) {
                        showNotification(1, isEdit ? "Cập nhật tiện nghi thành công!" : "Thêm tiện nghi thành công!");
                        table.ajax.reload();
                    } else {
                        showNotification(0, res.message || "Không thể lưu dữ liệu!");
                    }
                },
                error: function () {
                    showNotification(0, "Có lỗi xảy ra khi gọi API!");
                }
            });

            newRow = null;
            originalRowData = null;
        });

        // === Xóa dòng ===
        $('#tableTienNghiCoSo').on('click', '.delete-tien-nghi', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            $('#idDelete').val(rowData.tienNghiID);
            $('#nameDelete').text(`${rowData.tenTienNghi}`);
            $('#idTypeDelete').val('tiennghi');
            $('#modalDelete').modal('show');
        });

    }

    function initListTienNghi() {
        let data = JSON.stringify({ loaiDanhMucID: 46, trangThai: true })
        getDataWithApi('POST', '/api/DanhMucChungApi/DanhSach', data).then(data => {
            if (data && data.isSuccess && data.value.length > 0) {
                listTienNghi = data.value || []
            }
        })
        return listTienNghi;
    }
    function dataDeleteTienNghi() {
        let tienNghiID = $('#idDelete').val();
        $.ajax({
            url: `${baseUrl}/api/KhuDuLichApi/TienNghi/Xoa/${khuDuLichID}/${tienNghiID}`,
            type: "DELETE",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Xóa tiện nghi thành công!");
                    $('#tableTienNghiCoSo').DataTable().ajax.reload();
                    $('#modalDelete').modal('hide');
                } else {
                    showNotification(0, res.message || "Không thể xóa tiện nghi!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
            }
        });
    }
    //#endregion TIỆN NGHI

    //#region ĐA PHƯƠNG TIỆN

    function saveTempTranslationDPT() {
        let maNgonNgu = $("#ngonNguDPT").val();
        let tieuDe = $("#tieuDeDPT").val().trim();
        let moTa = $("#moTaDPT").val().trim();

        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ và nhập tên

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let index = daPhuongTientranslations.findIndex(t => t.maNgonNgu === maNgonNgu);
        if (tieuDe === "" && moTa === "") {
            // Nếu trống cả tiêu đề và mô tả -> xóa bản dịch khỏi mảng
            if (index !== -1) {
                daPhuongTientranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                daPhuongTientranslations[index].tieuDe = tieuDe;
                daPhuongTientranslations[index].moTa = moTa;
            } else {
                daPhuongTientranslations.push({
                    maNgonNgu: maNgonNgu,
                    tieuDe: tieuDe,
                    moTa: moTa
                });
            }
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tieuDeDPT, #moTaDPT").on("blur", saveTempTranslationDPT);

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDPT").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = daPhuongTientranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDeDPT").val(exist.tieuDe);
            $("#moTaDPT").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDeDPT").val("");
            $("#moTaDPT").val("");
        }
    });

    $("input[name='loaiMediaDPT']").on("change", function () {
        const loaiMedia = $(this).val();
        $("#fileDPT").val(null).attr("accept", (allowedExtensions[loaiMedia] || "").join(","));

        if (loaiMedia === "1") {
            // Hình ảnh
            $("#fileLabel").html('Hình ảnh <span class="text-danger">*</span>');
            $("#showhinhAnhDPT").removeClass("d-none");
            $("#fileDPT").addClass("d-none");
            $("#fileNamePreviewDPT").addClass("d-none");

            // Nếu chưa có src hoặc src rỗng thì set mặc định addImage
            const currentSrc = $("#showhinhAnhDPT").attr("src");
            if (!currentSrc || currentSrc.trim() === "" || currentSrc.includes("no-image.png")) {
                $("#showhinhAnhDPT").attr("src", "/assets/images/vector/addImage.png");
            }
        } else {
            // Các loại khác
            $("#fileLabel").text("Tệp đã chọn");
            $("#showhinhAnhDPT").addClass("d-none");
            $("#fileDPT").removeClass("d-none");
            $("#fileNamePreviewDPT").removeClass("d-none");
        }
    });

    $("#fileDPT").on("change", function () {
        const loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
        const file = this.files[0];
        if (!file) return;

        if (loaiMedia === "1") {
            // Preview ảnh
            const reader = new FileReader();
            reader.onload = e => $("#showhinhAnhDPT").attr("src", e.target.result);
            reader.readAsDataURL(file);
        } else {
            // Hiện tên file
            $("#fileNamePreview").text(file.name);
        }
    });

    // Khởi tạo theo radio được chọn mặc định
    const loaiInit = $("input[name='loaiMediaDPT']:checked").val();
    $("#fileDPT").attr("accept", (allowedExtensions[loaiInit] || "").join(","));

    async function initTableDaPhuongTien(id) {
        const tableApi = {
            url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    DoiTuongSoHuuID: id || guidEmpty,
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
                    let tenFile = data ? data.split('/').pop() : '';
                    return `<div class="group-info have-image detail-command-btn" id=n-"${meta.row}">
                    <div class="have-image">
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.tacGia || ''}</div></div>
                </div>`;
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    if (row.loaiMedia == 1) {
                        return `Hình ảnh`;
                    } else if (row.loaiMedia == 2) {
                        return `Video`;
                    } else if (row.loaiMedia == 3) {
                        return `Audio`;
                    } else if (row.loaiMedia == 4) {
                        return `File khác`;
                    }
                    return ``;
                }
            },
             {
                targets: 4,
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            }, 
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    let html = ""
                    html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "", "width": "", "class": "left-align" },
            { "data": "", "width": "15%", "class": "left-align" },
            { "data": "tacGia", "width": "15%", "class": "left-align" },
            { "data": "trangThai", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
            $('#idDPT').val(data.daPhuongTienID);

            $("#modalAddDaPhuongTienTitle").text(`Chỉnh sửa tài liệu truyền thông ${data.tieuDe}`);
            $("#typeDPT").val("dpt");
            // Các input text
            $("input[name='loaiMediaDPT'][value='" + data.loaiMedia + "']").prop("checked", true).trigger("change");

            if (data.duongDanFile) {
                $("#fileNamePreviewDPT").text(data.duongDanFile.split('/').pop());
                $("#duongDanFileDPT").val(data.duongDanFile);

                if (data.loaiMedia == "1") {
                    $("#showhinhAnhDPT").attr("src", data.duongDanFile);
                }
            } else {
                $("#fileNamePreviewDPT").text("");
                $("#duongDanFileDPT").val("");
            }

            $("#tacGiaDPT").val(data.tacGia);
            $("#thuTuDPT").val(data.thuTuHienThi);

            // Radio trạng thái
            $("input[name='trangThaiDPT'][value='" + (data.suDung ? "1" : "0") + "']").prop("checked", true);

            daPhuongTientranslations = []
            const res = await fetch(`/api/DaPhuongTienApi/BanDich/${data.daPhuongTienID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            let dataBanDich = await res.json();

            if (dataBanDich && dataBanDich.isSuccess && dataBanDich.value) {
                daPhuongTientranslations = dataBanDich.value
            } else {
                console.log(dataBanDich.error)
            }

            $('#ngonNguDPT').val('vi').trigger('change');

        
            $('#modalAddDaPhuongTien').modal('show');
        });
        $('#dataGridDaPhuongTien tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();

            $('#idDelete').val(data.daPhuongTienID);
            $('#nameDelete').text(`${data.tieuDe}`);
            $('#idTypeDelete').val('daphuongtien');

            $('#modalDelete').modal('show');
        });

    }
    $("#btnAddDaPhuongTien").on('click', function () {
        $('#typeDPT').val("dpt");
        $('#modalAddDaPhuongTien').modal('show');
    })

    $('#btnSaveDaPhuongTien').on('click', async function () {
        let type = $('#typeDPT').val();
        if (type == "dpt") {
            const submitBtn = $(this)
            if (submitBtn.prop('disabled')) {
                return; // Disable submit button để tránh spam
            }

            submitBtn.prop('disabled', true);
            const originalText = submitBtn.text();
            submitBtn.text('Đang xử lý...');

            try {
                // Gọi function xử lý
                await dataAddDaPhuongTien();
            } catch (error) {
                console.error('Lỗi khi xử lý form:', error);
            } finally {
                // Enable lại button sau 1 giây
                setTimeout(() => {
                    submitBtn.prop('disabled', false);
                    submitBtn.text(originalText);
                }, 1000);
            }
        }
    });

    async function dataAddDaPhuongTien() {
        if (khuDuLichID == null || khuDuLichID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước khi thêm đa phương tiện')
            return;
        }
        let daPhuongTienID = $('#idDPT').val() || guidEmpty
        let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
        let fileDPT = $("#fileDPT")[0].files[0] || null;
        let tacGia = $("#tacGiaDPT").val();
        let thuTu = $("#thuTuDPT").val();
        let trangThai = $("input[name='trangThaiDPT']:checked").val();
        let duongDanFile = $("#duongDanFileDPT").val();

        if (!fileDPT && checkEmptyBlank(duongDanFile)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        //Kiểm tra đúng loại file và extension
        if (fileDPT != null) {
            const fileExt = "." + fileDPT.name.split(".").pop().toLowerCase();
            // Kiểm tra file extension có khớp loại media không
            if (!allowedExtensions[loaiMedia] || !allowedExtensions[loaiMedia].includes(fileExt)) {
                showNotification(0, "Tệp không hợp lệ với loại media đã chọn!");
                return; // Dừng luôn, không xử lý tiếp
            }
        }

        //Kiểm tra đúng loại file và extension
        if (!checkEmptyBlank(duongDanFile) && fileDPT == null) {
            const fileExt = "." + duongDanFile.split(".").pop().toLowerCase();
            // Kiểm tra file extension có khớp loại media không
            if (!allowedExtensions[loaiMedia] || !allowedExtensions[loaiMedia].includes(fileExt)) {
                showNotification(0, "Tệp không hợp lệ với loại media đã chọn!");
                return; // Dừng luôn, không xử lý tiếp
            }
        }

        let thongTinChung = {
            DaPhuongTienID: daPhuongTienID,
            DoiTuongSoHuuID: khuDuLichID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "DL_KhuDuLich",
            DuongDanFile: duongDanFile,
            TacGia: tacGia,
            ThuTuHienThi: thuTu || 1,
            SuDung: trangThai == "1" ? true : false
        };

        let formData = new FormData();
        formData.append("DaPhuongTien", JSON.stringify(thongTinChung));
        formData.append("DaPhuongTien_NoiDung", JSON.stringify(daPhuongTientranslations));

        if (fileDPT) {
            formData.append("File", fileDPT);
        }

        if (daPhuongTienID == null || daPhuongTienID == guidEmpty) {
            try {
                const res = await fetch('/api/DaPhuongTienApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công')
                    daPhuongTientranslations = []
                    $('#dataGridDaPhuongTien').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/DaPhuongTienApi/ChinhSua/${daPhuongTienID}`, {
                    method: 'PUT',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công')
                    daPhuongTientranslations = []

                    $('#dataGridDaPhuongTien').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }

    async function dataDeleteDaPhuongTien() {
        let id = $('#idDelete').val();
        try {
            const res = await fetch(`/api/DaPhuongTienApi/Xoa/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridDaPhuongTien').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset modal
    $("#modalAddDaPhuongTien").on('hidden.bs.modal', function () {
        daPhuongTientranslations = []
        $(this).find('input[type=text], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true).trigger('change');
        $("#showhinhAnhDPT").attr("src", '/assets/images/vector/Addimage.png');
        $("#modalAddDaPhuongTienTitle").text('Thêm mới tài liệu truyền thông');
        $('#thuTuDPT').val('1');
        $('#fileNamePreviewDPT').text("");
    });
    //#endregion ĐA PHƯƠNG TIỆN

    //#region GIẤY CHỨNG NHẬN
    async function initTableGiayChungNhan(id) {
        const tableApi = {
            url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    doiTuongSoHuuID: id,
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
                targets: 4,
                render: function (data, type, row, meta) {
                    let ngay = data ? formatShortDate(data) : '';
                    return `<span>${ngay}</span>`;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    let ngay = data ? formatShortDate(data) : '';
                    return `<span>${ngay}</span>`;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    let html = ""
                    html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "soKyHieu", "width": "", "class": "left-align" },
            { "data": "tenTheLoai", "width": "250px", "class": "left-align" },
            { "data": "tenCoQuanBanHanh", "width": "220px", "class": "left-align" },
            { "data": "ngayBanHanh", "width": "120px", "class": "center-align" },
            { "data": "ngayHieuLuc", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        initDataTableConfigNoSearch('dataGridGiayChungNhan', tableApi, tableDefs, tableCols);

        $('#dataGridGiayChungNhan tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("id").match(/\d+/)[0];
            var data = $('#dataGridGiayChungNhan').DataTable().row(id).data();
            $('#idGCN').val(data.vanBanID);
            $('#modalTitleGCN').text(`Chỉnh sửa giấy chứng nhận ${data.tenTheLoai}`)
            if (data.duongDanFile) {
                data.duongDanFile.split(";").forEach(url => {
                    pondGCN.addFile(`${baseUrl}/${url}`);
                })
                $("#duongDanFileGCN").val(data.duongDanFile);
            }

            $("#trichYeu").val(data.trichYeu || '');
            $("#soKyHieu").val(data.soKyHieu || '');
            $("#nguoiKy").val(data.nguoiKy || '');
            $("#noiDung").val(data.noiDung || '');
            $("#ngayBanHanh").val(data.ngayBanHanh != null ? formatShortDate(data.ngayBanHanh) : "");
            $("#ngayHieuLuc").val(data.ngayHieuLuc != null ? formatShortDate(data.ngayHieuLuc) : "");
            $("#ngayHetHan").val(data.ngayHetHan != null ? formatShortDate(data.ngayHetHan) : "");
            $("#coQuanBanHanhID").val(data.coQuanBanHanhID || '').trigger('change');
            $("#theLoaiID").val(data.theLoaiID || '').trigger('change');

            $('#modalAddGiayChungNhan').modal('show');
        });

        $('#dataGridGiayChungNhan tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridGiayChungNhan').DataTable().row(id).data();

            $('#idDelete').val(data.vanBanID);
            $('#nameDelete').text(`${data.trichYeu}`);
            $('#idTypeDelete').val('giaychungnhan');

            $('#modalDelete').modal('show');
        });
    }

    $('#btnSaveGiayChungNhan').on('click', async function () {
        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
           await dataAddGiayChungNhan()
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            // Enable lại button sau 1 giây
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }

    });

    async function dataAddGiayChungNhan() {
        if (khuDuLichID == null || khuDuLichID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước khi thêm văn bản tài liệu');
            return;
        }

        let id = $('#idGCN').val();
        let duongDanFile = $('#duongDanFileGCN').val()?.trim();
        let files = pondGCN.getFiles();
        let soKyHieu = $('#soKyHieu').val()?.trim();
        let trichYeu = $('#trichYeu').val()?.trim();
        let nguoiKy = $('#nguoiKy').val()?.trim();
        let noiDung = $('#noiDung').val()?.trim();
        let coQuanBanHanh = $('#coQuanBanHanhID').val();
        let theLoai = $('#theLoaiID').val();
        let ngayBanHanh = $('#ngayBanHanh').val();
        let ngayHieuLuc = $('#ngayHieuLuc').val();
        let ngayHetHan = $('#ngayHetHan').val();

        if ((files.length <= 0 && checkEmptyBlank(duongDanFile))
            || checkEmptyBlank(soKyHieu)
            || checkEmptyBlank(trichYeu)
            || checkEmptyBlank(ngayBanHanh)
            || checkEmptyBlank(coQuanBanHanh)
            || checkEmptyBlank(theLoai)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)');
            return;
        }

        if (files.length > 0) {
            const invalidFiles = files.some(f => {
                const fileExt = "." + f.file.name.split(".").pop().toLowerCase();
                return !allowedExtensions[4].includes(fileExt);
            });
            if (invalidFiles) {
                showNotification(0, `Có file không đúng định dạng!`);
                return false;
            }
        }

        let urls = duongDanFile?.split(";")
        // lọc lại đường dẫn loại bỏ những file không còn tồn tại trong filePond
        duongDanFile = urls.filter(url => {
            return files.some(f => url.endsWith(f.file.name))
        })?.join(";");

        let checkDates = validateDocumentDates(ngayBanHanh, ngayHieuLuc, ngayHetHan)
        if (!checkDates.valid) {
            showNotification(0, checkDates.message);
            return;
        }

        let formData = new FormData();
        formData.append("vanBanID", id || "");
        formData.append("doiTuongSoHuuID", khuDuLichID);
        formData.append("duongDanFile", duongDanFile);
        formData.append("theLoaiID", theLoai);
        formData.append("soKyHieu", soKyHieu);
        formData.append("trichYeu", trichYeu);
        formData.append("nguoiKy", nguoiKy);
        formData.append("noiDung", noiDung);
        formData.append("bangThamChieu", "DL_KhuDuLich");
        formData.append("coQuanBanHanhID", coQuanBanHanh);
        formData.append("ngayBanHanh", ngayBanHanh != "" ? formatDateToSearch(ngayBanHanh) : ""),
        formData.append("ngayHetHan", ngayHetHan != "" ? formatDateToSearch(ngayHetHan) : ""),
        formData.append("ngayHieuLuc", ngayHieuLuc != "" ? formatDateToSearch(ngayHieuLuc) : "");
        files.forEach(fileItem => {
            if (!duongDanFile?.includes(fileItem.file.name)) {
                formData.append("File", fileItem.file); // append từng file
            }
        });

        if (checkEmptyBlank(id)) {
            // === Thêm mới ===
            try {
                const res = await fetch('/api/VanBanTaiLieuApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText);
                }

                const data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công');
                    translations = [];
                    $('#modalAddGiayChungNhan').modal('hide');
                    $('#dataGridGiayChungNhan').DataTable().ajax.reload();
                } else {
                    showNotification(0, data.error);
                }
            } catch (err) {
                console.log(err.message);
            }
        } else {
            // === Chỉnh sửa ===
            try {
                const res = await fetch(`/api/VanBanTaiLieuApi/ChinhSua/${id}`, {
                    method: 'PUT',
                    body: formData
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText);
                }

                const data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công');
                    $('#modalAddGiayChungNhan').modal('hide');
                    $('#dataGridGiayChungNhan').DataTable().ajax.reload();
                } else {
                    showNotification(0, data.error);
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    }

    async function dataDeleteGiayChungNhan() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/VanBanTaiLieuApi/Xoa/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridGiayChungNhan').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset modal
    $("#modalAddGiayChungNhan").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalTitleGCN').text('Thêm mới giấy chứng nhận')
        pondGCN.removeFiles();
    });
    //#endregion GIẤY CHỨNG NHẬN

    //#region DỊCH VỤ TRẢI NGHIỆM
    function initTableDichVuTraiNghiem(id) {
        listDichVuTraiNghiem = initListDichVuTraiNghiem();

        const tableApi = {
            url: `${baseUrl}/api/KhuDuLichApi/DichVu/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    KhuDuLichID: id,
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
                targets: 0,
                render: function (data, type, row, meta) {
                    return parseInt(meta.row) + 1;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `
                        <button type="button" class="btnSaveDichVuTraiNghiem hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelDichVuTraiNghiem hgi-icon hgi-cancel"></button>
                    `;
                    }

                    const editIcon = `<i class="edit-dich-vu-trai-nghiem cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                    const deleteIcon = `<i class="delete-dich-vu-trai-nghiem cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                    return editIcon + deleteIcon;
                }
            }
        ];

        const tableCols = [
            { data: null, width: "40px", class: "center-align" },
            { data: "tenCoSo", class: "left-align" },
            { data: "diaChi", class: "left-align" },
            { data: "moTa", width: "600px", class: "left-align" },
            { data: null, width: "120px", class: "center-align group-icon-action" }
        ];

        const table = $('#dataGridDichVuTraiNghiem').DataTable({
            ajax: tableApi,
            columns: tableCols,
            columnDefs: tableDefs,
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            autoWidth: false,
            responsive: true,
            language: {
                emptyTable: "Bảng trống"
            }
        });

        // Hàm sinh ra select
        function createSelectDichVuTraiNghiem(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            listDichVuTraiNghiem.forEach(t => {
                options += `<option value="${t.coSoDichVuID}" ${t.coSoDichVuID === selectedId ? "selected" : ""}>${t.tenCoSo}</option>`;
            });
            return `<select id="selectDichVuTraiNghiem" class="form-control">${options}</select>`;
        }

        // === Thêm dòng mới ===
        let newRow = null;
        let originalRowData = null;
        $('#btnAddDichVuTraiNghiem').on('click', function () {
            if (newRow) return;

            const rowData = {
                stt: table.rows().count() + 1,
                tenCoSo: createSelectDichVuTraiNghiem(),
                moTa: '',
                diaChi: '',
                _isNew: true
            };

            newRow = table.row.add(rowData).draw(false).node();
            $(newRow).addClass('adding');
            initSelect2();
        });

        // === Hủy thêm dòng ===
        $('#dataGridDichVuTraiNghiem').on('click', '.btnCancelDichVuTraiNghiem', function () {
            if (originalRowData) {
                table.row(newRow).data(originalRowData).draw(false);
                $(newRow).removeClass('adding');
                originalRowData = null;
            } else {
                table.row('.adding').remove().draw(false);
            }
            newRow = null;
        });

        // === Chỉnh sửa dòng ===
        $('#dataGridDichVuTraiNghiem').on('click', '.edit-dich-vu-trai-nghiem', function () {
            if (newRow) return;

            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            originalRowData = { ...rowData };


            const editRowData = {
                tenCoSo: createSelectDichVuTraiNghiem(rowData.coSoDichVuID),
                moTa: rowData.moTa,
                diaChi: rowData.diaChi,
                oldCoSoDichVuID: rowData.coSoDichVuID,
                _isNew: true
            };

            table.row(rowNode).data(editRowData).draw(false);
            $(rowNode).addClass('adding');
            initSelect2();
            newRow = rowNode;
        });

        // === Lưu dòng mới hoặc chỉnh sửa ===
        $('#dataGridDichVuTraiNghiem').on('click', '.btnSaveDichVuTraiNghiem', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            let oldCoSoDichVuID = rowData.coSoDichVuID;
            let coSoDichVuID = $('#selectDichVuTraiNghiem').val();

            if (!coSoDichVuID) {
                showNotification(0, "Vui lòng chọn cơ sở dịch vụ!");
                return;
            }

            let isDuplicate = table.rows().data().toArray().find(e =>  e.coSoDichVuID == coSoDichVuID )
            if (isDuplicate) {
                showNotification(0, "Cơ sở dịch vụ đã tồn tại!");
                return;
            }

            const request = {
                KhuDuLichID: id,
                CoSoDichVuID: coSoDichVuID,
                OldCoSoDichVuID: oldCoSoDichVuID != "" ? oldCoSoDichVuID : null
            };

            const isEdit = originalRowData !== null;
            const apiUrl = isEdit
                ? `${baseUrl}/api/KhuDuLichApi/DichVu/ChinhSua/${khuDuLichID}`
                : `${baseUrl}/api/KhuDuLichApi/DichVu/ThemMoi`;
            const method = isEdit ? "PUT" : "POST";

            $.ajax({
                url: apiUrl,
                type: method,
                data: JSON.stringify(request),
                contentType: "application/json",
                success: function (res) {
                    if (res && res.isSuccess) {
                        showNotification(1, isEdit ? "Cập nhật dịch vụ trải nghiệm thành công!" : "Thêm dịch vụ trải nghiệm thành công!");
                        table.ajax.reload();
                    } else {
                        console.log(res.message)
                    }
                },
                error: function () {
                    console.log("Có lỗi xảy ra khi gọi API!");
                }
            });

            newRow = null;
            originalRowData = null;
        });

        // === Xóa dòng ===
        $('#dataGridDichVuTraiNghiem').on('click', '.delete-dich-vu-trai-nghiem', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            $('#idDelete').val(rowData.coSoDichVuID);
            $('#nameDelete').text(`${rowData.tenCoSo}`);
            $('#idTypeDelete').val('dichvutrainghiem');
            $('#modalDelete').modal('show');
        });

    }

    function initListDichVuTraiNghiem() {
        getDataWithApi('GET', '/api/DL_CoSoDichVuTraiNghiemApi/Gets?maNgonNgu=vi&loaiHinhCoSoID=193').then(data => {
            if (data && data.isSuccess && data.value.length > 0) {
                listDichVuTraiNghiem = data.value || [];
            }
        })
        return listDichVuTraiNghiem;
    }
    function dataDeleteDichVuTraiNghiem() {
        let dichVuTraiNghiemID = $('#idDelete').val();
        $.ajax({
            url: `${baseUrl}/api/KhuDuLichApi/DichVu/Xoa/${khuDuLichID}/${dichVuTraiNghiemID}`,
            type: "DELETE",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Xóa dịch vụ trải nghiệm thành công!");
                    $('#dataGridDichVuTraiNghiem').DataTable().ajax.reload();
                    $('#modalDelete').modal('hide');
                } else {
                    console(res.message)
                }
            },
            error: function (err) {
                console(err.message)
            }
        });
    }
    //#endregion DỊCH VỤ TRẢI NGHIỆM

    //#region ĐỊA ĐIỂM
    function saveTempDiaDiemTranslation() {
        let maNgonNgu = $("#ngonNguDiaDiem").val();
        let tenDiaDiem = $("#tenDiaDiem").val().trim();
        let diaChi = $("#diaChiDiaDiem").val().trim();
        let moTa = $("#moTaDiaDiem").val().trim();
        let thoiGianHoatDong = $("#thoiGianHoatDong").val().trim();
        let sucChua = $("#sucChua").val();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = diaDiemTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tenDiaDiem && !diaChi && !moTa && !thoiGianHoatDong && !sucChua) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                diaDiemTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                diaDiemTranslations[index].tenDiaDiem = tenDiaDiem;
                diaDiemTranslations[index].diaChi = diaChi;
                diaDiemTranslations[index].moTa = moTa;
                diaDiemTranslations[index].thoiGianHoatDong = thoiGianHoatDong;
                diaDiemTranslations[index].sucChua = sucChua;
            } else {
                // thêm mới
                diaDiemTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenDiaDiem: tenDiaDiem,
                    diaChi: diaChi,
                    moTa: moTa,
                    thoiGianHoatDong: thoiGianHoatDong,
                    sucChua: sucChua
                });
            }
        }
        console.log(diaDiemTranslations);
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenDiaDiem, #diaChiDiaDiem, #moTaDiaDiem, #thoiGianHoatDong, #sucChua").off("blur").on("blur", function () {
        saveTempDiaDiemTranslation();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDiaDiem").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = diaDiemTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenDiaDiem").val(exist.tenDiaDiem);
            $("#diaChiDiaDiem").val(exist.diaChi);
            $("#moTaDiaDiem").val(exist.moTa);
            $("#thoiGianHoatDong").val(exist.thoiGianHoatDong);
            $("#sucChua").val(exist.sucChua);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenDiaDiem").val("");
            $("#diaChiDiaDiem").val("");
            $("#moTaDiaDiem").val("");
            $("#thoiGianHoatDong").val("");
            $("#sucChua").val("");
        }
    });

    $('#btnSaveDiaDiem').on('click', function () {
        dataAddDiaDiem()
    })

    async function dataAddDiaDiem() {
        // Lấy dữ liệu từ input/select
        let tinhThanhPho = $('#tinhThanhPho').val() || null;
        let phuongXa = $('#phuongXa').val() || null;
        let kinhDo = $('#kinhDo').val()?.trim() || null;
        let viDo = $('#viDo').val()?.trim() || null;
        let caoDo = $('#caoDo').val()?.trim() || null;

        let nguoiKhuyetTat = $("#nguoiKhuyetTat").is(":checked");
        let nhaVeSinh = $("#nhaVeSinh").is(":checked");
        let baiDoXe = $("#baiDoXe").is(":checked");

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = diaDiemTranslations.find(el => el.maNgonNgu === 'vi')?.tenDiaDiem || null;

        // Validate các trường bắt buộc
        if (!tenTiengViet || !tinhThanhPho || !phuongXa) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let diaDiem = {
            DiaDiemID: null,
            TinhThanhPho: tinhThanhPho,
            PhuongXa: phuongXa,
            KinhDo: kinhDo,
            ViDo: viDo,
            CaoDo: caoDo,
            NguoiKhuyetTat: nguoiKhuyetTat,
            NhaVeSinh: nhaVeSinh,
            BaiDoXe: baiDoXe,
            TrangThai: true
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("DiaDiem", JSON.stringify(diaDiem));
        formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiemTranslations)); // mảng bản dịch

        try {
            const res = await fetch('/api/DiaDiemApi/ThemMoi', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Thêm mới địa điểm thành công')
                await initDiaDiem(data.value.diaDiemID)
                $('#modalAddDiaDiem').modal('hide');
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }

    // reset modal  
    $("#modalAddDiaDiem").on('hidden.bs.modal', function () {
        diaDiemtranslations = []
        $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find(".div_checkbox input[type='checkbox']").prop("checked", false);
    });
    //#endregion ĐỊA ĐIỂM

    //#region HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    async function initNgonNgu() {
        try {
            const res = await fetch('/api/NgonNguApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: null,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(lang => {
                    $("#ngonNgu").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguDPT").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguDiaDiem").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngonNgu").val('vi').trigger('change');
                $("#ngonNguDPT").val('vi').trigger('change');
                $("#ngonNguDiaDiem").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initDiaDiem(id) {
        try {
            const res = await fetch('/api/DiaDiemApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maNgonNgu: 'vi',
                    trangThai: true
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            $("#DiaDiemCoSanAdd").empty();
            $("#DiaDiemCoSanAdd").append(`<option></option>`);
            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#DiaDiemCoSanAdd").append(`<option value="${el.diaDiemID}">${el.tenDiaDiem}</option>`);
                });
                if (id) {
                    $("#DiaDiemCoSanAdd").val(id).trigger('change');
                }
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhThanhPho() {
        try {
            getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
                if (data && data.isSuccessed && data.resultObj) {
                    $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
                    data.resultObj.forEach(item => {
                        const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                        $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
                    });
                }
            })
        }
        catch (err) {
            console.log(err.message)
        }
    };
    function initPhuongXa(tinhID = null) {
        if (tinhID == null) {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
            return;
        }
        getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
            if (data && data.isSuccess && data.value) {
                data.value.forEach(item => {
                    const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                    $("#phuongXa").append(`<option value="${item.xaID}">${displayText}</option>`);
                });
            }
        })
    }

    async function initCoQuanBanHanh() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 170
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#coQuanBanHanhID").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initLoaiHinhKhuDuLich() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 61,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                data.value.forEach(el => {
                    $("#loaiHinhID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initCapXepHang() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 17,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                data.value.forEach(el => {
                    $("#capID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initLoaiGiayChungNhan() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 53,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                data.value.forEach(el => {
                    $("#theLoaiID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initToChuc() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 310,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                data.value.forEach(el => {
                    $("#toChucID").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initNamCongNhan() {
        try {
            const currentYear = new Date().getFullYear();
            for (let year = currentYear; year >= 1900; year--) {
                $("#namCongNhan").append(`<option value="${year}">${year}</option>`);
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    function reloadAccess() {
        if (checkEmptyBlank(khuDuLichID)) {
            $("#tab-dich-vu-trai-nghiem").closest("li").hide();
            $("#ViTriBanDo-tab").closest("li").hide();
            $("#tab-giay-chung-nhan").closest("li").hide();
            $("#tab-tien-nghi").closest("li").hide();
            $("#tab-da-phuong-tien").closest("li").hide();
        } else {
            $("#tab-dich-vu-trai-nghiem").closest("li").show();
            $("#ViTriBanDo-tab").closest("li").show();
            $("#tab-giay-chung-nhan").closest("li").show();
            $("#tab-tien-nghi").closest("li").show();
            $("#tab-da-phuong-tien").closest("li").show();
        }
        scrollTop();
    }

    $('#tinhThanhPho').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})