const baseUrl = getRootLink();

const guidEmpty = "00000000-0000-0000-0000-000000000000";
let congTrinhNghienCuuTranslations = [];

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    let listCaNhan = [];
    let listToChuc = [];

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initCapXepHang(),
            initCaNhan(),
            initToChucNgheThuat(),
            initToChucThuVien(),
            initToChucBaoTang(),
            initDonViQuanLyVanHoa()
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(congTrinhNghienCuuID)) {
            initTableCaNhan(congTrinhNghienCuuID)
            initTableToChuc(congTrinhNghienCuuID)
        }
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "tochuc") {
            dataDeleteThanhVien();
        } else if (type == "canhan") {
            dataDeleteThanhVien("caNhan")
        } 
    });

    //#region THÔNG TIN CHUNG

    async function initThongTinChung() {
        if (checkEmptyBlank(congTrinhNghienCuuID)) {
            return;
        }

        try {
            const res = await fetch(`/api/CongTrinhNghienCuuApi/ChiTiet/${congTrinhNghienCuuID}`, {
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
                $("#congTrinhNghienCuuID").val(data.value.congTrinhNghienCuuID || "");
                $("#capID").val(data.value.capID || "").trigger("change");
                $("#trangThaiID").val(data.value.trangThaiID?.toString() || "").trigger("change");
                $("#batDau").val(formatShortDate(data.value.batDau) || "").trigger("change");
                $("#ketThuc").val(formatShortDate(data.value.ketThuc) || "").trigger("change");
                $("#thuTu").val(data.value.thuTu || 1);

                if (data.value.suDung === true || data.value.suDung === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                congTrinhNghienCuuTranslations = data.value.banDich || [];

                let tiengViet = congTrinhNghienCuuTranslations.find(el => el.maNgonNgu === "vi") || null;
                if (tiengViet) {
                    $("#ngonNgu").val("vi").trigger("change");
                }
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Gắn sự kiện blur cho input thường
    $("#tenCongTrinh, #tacGia, #donVi").off("blur").on("blur", function () {
        saveTempCongTrinhNghienCuuTranslation();
    });

    ["mucDich", "ketQua"].forEach(key => {
        CKEDITOR.replace(key).on("instanceReady", function (evt) {
            evt.editor.on("blur", function () {
                saveTempCongTrinhNghienCuuTranslation();
            });
        });
    });
    function saveTempCongTrinhNghienCuuTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenCongTrinh = $("#tenCongTrinh").val().trim();

        let mucDich = CKEDITOR.instances["mucDich"].getData().trim();
        let ketQua = CKEDITOR.instances["ketQua"].getData().trim();
        let tacGia = $("#tacGia").val().trim();
        let donVi = $("#donVi").val().trim();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = congTrinhNghienCuuTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (index !== -1) {
            // cập nhật bản dịch đã có
            congTrinhNghienCuuTranslations[index].tenCongTrinh = tenCongTrinh;
            congTrinhNghienCuuTranslations[index].mucDich = mucDich;
            congTrinhNghienCuuTranslations[index].ketQua = ketQua;
            congTrinhNghienCuuTranslations[index].tacGia = tacGia;
            congTrinhNghienCuuTranslations[index].donVi = donVi;
        } else {
            // thêm mới
            congTrinhNghienCuuTranslations.push({
                maNgonNgu: maNgonNgu,
                tenCongTrinh: tenCongTrinh,
                mucDich: mucDich,
                ketQua: ketQua,
                tacGia: tacGia,
                donVi: donVi
            });
        }
    }
    // Khi đổi ngôn ngữ → bind lại dữ liệu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = congTrinhNghienCuuTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenCongTrinh").val(exist.tenCongTrinh);
            CKEDITOR.instances["mucDich"].setData(exist.mucDich || "");
            CKEDITOR.instances["ketQua"].setData(exist.ketQua || "");
            $("#tacGia").val(exist.tacGia);
            $("#donVi").val(exist.donVi);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenCongTrinh").val("");
            CKEDITOR.instances["mucDich"].setData("");
            CKEDITOR.instances["ketQua"].setData("");
            $("#tacGia").val("");
            $("#donVi").val("");
        }
    });
    
    $("#btn-save").on("click", async function (e) {
        saveTempCongTrinhNghienCuuTranslation();
        congTrinhNghienCuuTranslations = congTrinhNghienCuuTranslations.filter(t => t.tenCongTrinh && t.tenCongTrinh.trim() !== "");
        if ($("#thong-tin-chung").hasClass("active")) {
            await dataAddThongTinChung();
        }
        e.preventDefault();
    });
    $("#btn-save-and-close").on("click", async function (e) {
        saveTempCongTrinhNghienCuuTranslation();
        congTrinhNghienCuuTranslations = congTrinhNghienCuuTranslations.filter(t => t.tenCongTrinh && t.tenCongTrinh.trim() !== "");
        dataAddThongTinChung(true);
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy dữ liệu từ input/select
        let capID = $('#capID').val() || null;
        let batDau = $('#batDau').val()?.trim() || null;
        let ketThuc = $('#ketThuc').val()?.trim() || null;
        let trangThaiID = $('#trangThaiID').val() || null;
        let thuTu = $('#thuTu').val() || 1;
        let suDung = $("input[name='SuDung']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = congTrinhNghienCuuTranslations.find(el => el.maNgonNgu === 'vi')?.tenCongTrinh || null;

        // Validate các trường bắt buộc
        if (!tenTiengViet || !capID || !trangThaiID || !batDau || !suDung) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let checkDate = validateFromToDates(batDau, ketThuc, "Ngày bắt đầu phải nhỏ hơn ngày kết thúc")
        if (!checkDate.valid) {
            showNotification(0, checkDate.message)
            return;
        }

        let congTrinh = {
            LinhVucID: 2, // Văn hóa
            CongTrinhNghienCuuID: congTrinhNghienCuuID || null,
            CapID: capID,
            BatDau: batDau ? formatDateToSearch(batDau) : batDau,
            KetThuc: ketThuc ? formatDateToSearch(ketThuc): ketThuc,
            TrangThaiID: trangThaiID,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: suDung === 'true' ? true : false
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("CongTrinhNghienCuu", JSON.stringify(congTrinh));
        formData.append("CongTrinhNghienCuu_NoiDung", JSON.stringify(congTrinhNghienCuuTranslations)); // mảng bản dịch

        if (checkEmptyBlank(congTrinhNghienCuuID)) {
            try {
                const res = await fetch('/api/CongTrinhNghienCuuApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                let data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công');
                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/CongTrinhNghienCuu';
                        }, 2000);
                    } else {
                        congTrinhNghienCuuID = data.value.congTrinhNghienCuuID;
                        initThongTinChung();
                        initTableCaNhan(congTrinhNghienCuuID)
                        initTableToChuc(congTrinhNghienCuuID)
                        reloadAccess()
                    }
                } else {
                    showNotification(0, data.error);
                }
            }
            catch (err) {
                console.log(err.message);
            }
        } else {
            try {
                const res = await fetch(`/api/CongTrinhNghienCuuApi/ChinhSua/${congTrinhNghienCuuID}`, {
                    method: 'PUT',
                    body: formData
                });

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                let data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công');
                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/CongTrinhNghienCuu';
                        }, 2000);
                    } else {
                        congTrinhNghienCuuID = data.value.congTrinhNghienCuuID;
                        initThongTinChung();
                    }
                } else {
                    showNotification(0, data.error);
                }
            }
            catch (err) {
                console.log(err.message);
            }
        }
    }

    //#endregion THÔNG TIN CHUNG

    //#region THÀNH VIÊN - CÁ NHÂN
    function initTableCaNhan(id) {

        const tableApi = {
            url: `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    congTrinhNghienCuuID: id,
                    loaiDoiTuong: true // cá nhân
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                       
                        if (item.vaiTroID == 0) {
                            item.tenVaiTro = "Chủ trì";
                        } else if (item.vaiTroID == 1) {
                            item.tenVaiTro = "Đồng chủ trì";
                        } else if (item.vaiTroID == 2) {
                            item.tenVaiTro = "Phối hợp";
                        } 
                    });
                    return data.value;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `
                        <button type="button" class="btn-save-command hgi-icon hgi-check"></button>
                        <button type="button" class="btn-cancel-command hgi-icon hgi-cancel"></button>
                    `;
                    }

                    const editIcon = `<i class="btn-edit-command cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                    const deleteIcon = `<i class="btn-delete-command cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                    return editIcon + deleteIcon;
                }
            }
        ];

        const tableCols = [
            { data: 'stt', width: "40px", class: "center-align" },
            { data: "tenDoiTuong", class: "left-align" },
            { data: "tenVaiTro", width: "250px", class: "center-align" },
            { data: null, width: "120px", class: "center-align group-icon-action" }
        ];

        const table = $('#dataGridCaNhan').DataTable({
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

        // Hàm sinh ra select tiện nghi (loại bỏ tiện nghi đã chọn rồi)
        function createSelectCaNhan(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            listCaNhan.forEach(t => {
                options += `<option value="${t.caNhanID}" ${t.caNhanID === selectedId ? "selected" : ""}>${t.hoTen}</option>`;
            });
            return `<select id="selectCaNhan" class="form-control">${options}</select>`;
        }

        // Hàm sinh ra select vai trò
        function createSelectVaiTro(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            let listVaiTro = [
                { vaiTroID: 0, ten: "Chủ trì" },
                { vaiTroID: 1, ten: "Đồng chủ trì" },
                { vaiTroID: 2, ten: "Phối hợp" }
            ]
            listVaiTro.forEach(t => {
                options += `<option value="${t.vaiTroID}" ${t.vaiTroID === selectedId ? "selected" : ""}>${t.ten}</option>`;
            });
            return `<select id="selectVaiTro" class="form-control">${options}</select>`;
        }

        // === Thêm dòng mới ===
        let newRow = null;
        let originalRowData = null;
        $('#btnAddCaNhan').on('click', function () {
            if (newRow) return;

            const rowData = {
                stt: table.rows().count() + 1,
                tenDoiTuong: createSelectCaNhan(),
                tenVaiTro: createSelectVaiTro(),
                _isNew: true
            };
            console.log(rowData);
            newRow = table.row.add(rowData).draw(false).node();
            $(newRow).addClass('adding');
            initSelect2();
        });

        // === Hủy thêm dòng ===
        $('#dataGridCaNhan').on('click', '.btn-cancel-command', function () {
            if (originalRowData) {
                table.row(newRow).data(originalRowData).draw(false);
                $(newRow).removeClass('adding');
                originalRowData = null;
            } else {
                table.row('.adding').remove().draw(false);
            }
            newRow = null;
            $('#dataGridCaNhan').DataTable().ajax.reload();
        });

        // === Chỉnh sửa dòng ===
        $('#dataGridCaNhan').on('click', '.btn-edit-command', function () {
            if (newRow) return;

            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            originalRowData = { ...rowData };

            const editRowData = {
                stt: rowData.stt,
                tenDoiTuong: createSelectCaNhan(rowData.doiTuongID),
                tenVaiTro: createSelectVaiTro(rowData.vaiTroID),
                oldDoiTuongID: rowData.doiTuongID,
                _isNew: true
            };
            console.log(originalRowData)
            table.row(rowNode).data(editRowData).draw(false);
            $(rowNode).addClass('adding');
            initSelect2();
            newRow = rowNode;
        });

        // === Lưu dòng mới hoặc chỉnh sửa ===
        $('#dataGridCaNhan').on('click', '.btn-save-command', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            let oldDoiTuongID = rowData.oldDoiTuongID;
            let doiTuongID = $('#selectCaNhan').val();
            let vaiTroID = $('#selectVaiTro').val();

            if (!doiTuongID || !vaiTroID) {
                showNotification(0, "Vui lòng chọn cá nhân và vai trò tham gia!");
                return;
            }

            const request = {
                CongTrinhNghienCuuID: id,
                DoiTuongID: doiTuongID,
                VaiTroID: vaiTroID,
                LoaiDoiTuong: true, // Cá nhân
                OldDoiTuongID: oldDoiTuongID || null
            };

            const isEdit = originalRowData !== null;
            const apiUrl = isEdit
                ? `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/ChinhSua/${doiTuongID}`
                : `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/ThemMoi`;
            const method = isEdit ? "PUT" : "POST";

            $.ajax({
                url: apiUrl,
                type: method,
                data: JSON.stringify(request),
                contentType: "application/json",
                success: function (res) {
                    if (res && res.isSuccess) {
                        showNotification(1, isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
                        table.ajax.reload();
                    } else {
                        showNotification(0, res.error);
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
        $('#dataGridCaNhan').on('click', '.btn-delete-command', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            $('#idDelete').val(rowData.doiTuongID);
            $('#nameDelete').text(`${rowData.tenDoiTuong}`);
            $('#idTypeDelete').val('canhan');
            $('#modalDelete').modal('show');
        });

    }

    //#endregion THÀNH VIÊN - CÁ NHÂN

    //#region THÀNH VIÊN - TỔ CHỨC
    function initTableToChuc(id) {

        const tableApi = {
            url: `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    congTrinhNghienCuuID: id,
                    loaiDoiTuong: false // tổ chức
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;

                        if (item.vaiTroID == 0) {
                            item.tenVaiTro = "Chủ trì";
                        } else if (item.vaiTroID == 1) {
                            item.tenVaiTro = "Đồng chủ trì";
                        } else if (item.vaiTroID == 2) {
                            item.tenVaiTro = "Phối hợp";
                        }
                    });
                    return data.value;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `
                        <button type="button" class="btn-save-command hgi-icon hgi-check"></button>
                        <button type="button" class="btn-cancel-command hgi-icon hgi-cancel"></button>
                    `;
                    }

                    const editIcon = `<i class="btn-edit-command cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                    const deleteIcon = `<i class="btn-delete-command cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                    return editIcon + deleteIcon;
                }
            }
        ];

        const tableCols = [
            { data: 'stt', width: "40px", class: "center-align" },
            { data: "tenDoiTuong", class: "left-align" },
            { data: "tenVaiTro", width: "250px", class: "center-align" },
            { data: null, width: "120px", class: "center-align group-icon-action" }
        ];

        const table = $('#dataGridToChuc').DataTable({
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

        // Hàm sinh ra select tiện nghi (loại bỏ tiện nghi đã chọn rồi)
        function createSelectToChuc(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            listToChuc.forEach(t => {
                options += `<option value="${t.toChucID}" ${t.toChucID === selectedId ? "selected" : ""}>${t.tenToChuc}</option>`;
            });
            return `<select id="selectCaNhan" class="form-control">${options}</select>`;
        }

        // Hàm sinh ra select vai trò
        function createSelectVaiTroToChuc(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            let listVaiTro = [
                { vaiTroID: 0, ten: "Chủ trì" },
                { vaiTroID: 1, ten: "Đồng chủ trì" },
                { vaiTroID: 2, ten: "Phối hợp" }
            ]
            listVaiTro.forEach(t => {
                options += `<option value="${t.vaiTroID}" ${t.vaiTroID === selectedId ? "selected" : ""}>${t.ten}</option>`;
            });
            return `<select id="selectVaiTro" class="form-control">${options}</select>`;
        }

        // === Thêm dòng mới ===
        let newRow = null;
        let originalRowData = null;
        $('#btnAddToChuc').on('click', function () {
            if (newRow) return;

            const rowData = {
                stt: table.rows().count() + 1,
                tenDoiTuong: createSelectToChuc(),
                tenVaiTro: createSelectVaiTroToChuc(),
                _isNew: true
            };
            console.log(rowData);
            newRow = table.row.add(rowData).draw(false).node();
            $(newRow).addClass('adding');
            initSelect2();
        });

        // === Hủy thêm dòng ===
        $('#dataGridToChuc').on('click', '.btn-cancel-command', function () {
            if (originalRowData) {
                table.row(newRow).data(originalRowData).draw(false);
                $(newRow).removeClass('adding');
                originalRowData = null;
            } else {
                table.row('.adding').remove().draw(false);
            }
            newRow = null;
            $('#dataGridToChuc').DataTable().ajax.reload();
        });

        // === Chỉnh sửa dòng ===
        $('#dataGridToChuc').on('click', '.btn-edit-command', function () {
            if (newRow) return;

            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            originalRowData = { ...rowData };

            const editRowData = {
                stt: rowData.stt,
                tenDoiTuong: createSelectCaNhan(rowData.doiTuongID),
                tenVaiTro: createSelectVaiTro(rowData.vaiTroID),
                oldDoiTuongID: rowData.doiTuongID,
                _isNew: true
            };
            console.log(originalRowData)
            table.row(rowNode).data(editRowData).draw(false);
            $(rowNode).addClass('adding');
            initSelect2();
            newRow = rowNode;
        });

        // === Lưu dòng mới hoặc chỉnh sửa ===
        $('#dataGridToChuc').on('click', '.btn-save-command', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            let oldDoiTuongID = rowData.oldDoiTuongID;
            let doiTuongID = $('#selectCaNhan').val();
            let vaiTroID = $('#selectVaiTro').val();

            if (!doiTuongID || !vaiTroID) {
                showNotification(0, "Vui lòng chọn cá nhân và vai trò tham gia!");
                return;
            }

            const request = {
                CongTrinhNghienCuuID: id,
                DoiTuongID: doiTuongID,
                VaiTroID: vaiTroID,
                LoaiDoiTuong: false, // Tổ chức
                OldDoiTuongID: oldDoiTuongID || null
            };

            const isEdit = originalRowData !== null;
            const apiUrl = isEdit
                ? `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/ChinhSua/${doiTuongID}`
                : `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/ThemMoi`;
            const method = isEdit ? "PUT" : "POST";

            $.ajax({
                url: apiUrl,
                type: method,
                data: JSON.stringify(request),
                contentType: "application/json",
                success: function (res) {
                    if (res && res.isSuccess) {
                        showNotification(1, isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
                        table.ajax.reload();
                    } else {
                        showNotification(0, res.error);
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
        $('#dataGridToChuc').on('click', '.btn-delete-command', function () {
            const rowNode = $(this).closest('tr');
            const rowData = table.row(rowNode).data();

            $('#idDelete').val(rowData.doiTuongID);
            $('#nameDelete').text(`${rowData.tenDoiTuong}`);
            $('#idTypeDelete').val('tochuc');
            $('#modalDelete').modal('show');
        });

    }

  
   
    //#endregion THÀNH VIÊN - TỔ CHỨC

    // Dùng chung cho cả cá nhân và tổ chức
    function dataDeleteThanhVien(caNhan) {
        let doiTuongID = $('#idDelete').val();
        $.ajax({
            url: `${baseUrl}/api/CongTrinhNghienCuuApi/ThanhVien/Xoa/${doiTuongID}/${congTrinhNghienCuuID}`,
            type: "DELETE",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Xóa thành công!");
                    if (caNhan) {
                        $('#dataGridCaNhan').DataTable().ajax.reload();
                    } else {
                        $('#dataGridToChuc').DataTable().ajax.reload();
                    }
                    $('#modalDelete').modal('hide');
                } else {
                    showNotification(0, res.error);
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
            }
        });
    }
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
                });
                $("#ngonNgu").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
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

    async function initToChucNgheThuat() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 93,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                listToChuc.push(...data.value);
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initToChucThuVien() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 94,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                listToChuc.push(...data.value);
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initToChucBaoTang() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 95,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                listToChuc.push(...data.value);
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initDonViQuanLyVanHoa() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 122,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                listToChuc.push(...data.value);
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initCaNhan() {
        try {
            const res = await fetch('/api/CaNhanApi/DanhSachPaging', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageIndex: 1,
                    pageSize: 1000,
                    tuKhoa: null,
                    isDeleted: false

                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                listCaNhan = data.value;
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    function reloadAccess() {
        if (checkEmptyBlank(congTrinhNghienCuuID)) {
            $("#tab-thanh-vien-thuc-hien").closest("li").hide();
        } else {
            $("#tab-thanh-vien-thuc-hien").closest("li").show();
        }
        scrollTop();
    }

    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
   
})
