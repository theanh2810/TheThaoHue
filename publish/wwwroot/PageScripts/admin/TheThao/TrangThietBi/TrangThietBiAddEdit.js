const baseUrl = getRootLink();
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const guidEmpty = "00000000-0000-0000-0000-000000000000";

let trangThietBiTranslations = [];
let daPhuongTientranslations = [];

$(document).ready(function () {
    initSelect2();
    let ckeMoTa = CKEDITOR.replace('moTa');

    previewPicture_WithSelector('anhDaiDien', 'previewAnhDaiDien')

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initToChuc(),
            initLoaiThietBi(),
            initTinhTrangThietBi(),
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(thietBiID)) {
            initTableDaPhuongTien(thietBiID)
        }
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        }
    });

    //#region THÔNG TIN CHUNG
    async function initThongTinChung() {
        if (checkEmptyBlank(thietBiID)) {
            return;
        }

        try {
            const res = await fetch(`/api/TrangThietBiApi/ChiTiet/${thietBiID}`, {
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
                $("#previewAnhDaiDien").attr("src", data.value.anhDaiDien || "/images/no-image.png");
                $("#urlAnhDaiDien").val(data.value.anhDaiDien || "");
                $("#loaiThietBiID").val(data.value.loaiThietBiID).trigger("change");
                $("#toChucID").val(data.value.toChucID).trigger("change");
                $("#tinhTrangID").val(data.value.tinhTrangID).trigger("change");
                $("#thuTu").val(data.value.thuTu || 1);
                $("#soLuong").val(data.value.soLuong || '');

                if (data.value.suDung === true || data.value.suDung === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                trangThietBiTranslations = data.value.banDich || [];
                $("#ngonNgu").val("vi").trigger("change");
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    
    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenThietBi").on("blur", function () {
        saveTempThietBiTranslation();
    });

    ckeMoTa.on('blur', function (evt) {
        saveTempThietBiTranslation()
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = trangThietBiTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenThietBi").val(exist.tenThietBi);
            ckeMoTa.setData(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenThietBi").val("");
            ckeMoTa.setData("");
        }
    });


    $("#btn-save").on("click", async function (e) {
        saveTempThietBiTranslation();
        trangThietBiTranslations = trangThietBiTranslations.filter(t => t.tenThietBi && t.tenThietBi.trim() !== "");
        dataAddThongTinChung()
        e.preventDefault();
    });

    $("#btn-save-and-close").on("click", async function (e) {
        saveTempThietBiTranslation();
        trangThietBiTranslations = trangThietBiTranslations.filter(t => t.tenThietBi && t.tenThietBi.trim() !== "");
        dataAddThongTinChung(true);
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;
        // Lấy dữ liệu từ input/select
        let loaiThietBiID = $('#loaiThietBiID').val() || null;
        let tinhTrangID = $('#tinhTrangID').val() || null;
        let toChucID = $('#toChucID').val() || null;
        let suDung = $('input[name="suDung"]:checked').val()
        let thuTu = $('#thuTu').val() || 1;
        let soLuong = $('#soLuong').val() || null;

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = trangThietBiTranslations.find(el => el.maNgonNgu === 'vi')?.tenThietBi || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !tinhTrangID || !loaiThietBiID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let entity = {
            ThietBiID: thietBiID || null,
            LoaiThietBiID: loaiThietBiID,
            ToChucID: toChucID,
            TinhTrangID: tinhTrangID,
            SuDung: suDung == '1' ? true : false,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SoLuong: soLuong != null ? Number(soLuong) : null,
            anhDaiDien: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("TrangThietBi", JSON.stringify(entity));
        formData.append("TrangThietBi_NoiDung", JSON.stringify(trangThietBiTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        const isAddNew = checkEmptyBlank(thietBiID);
        const url = isAddNew ? '/api/TrangThietBiApi/ThemMoi' : `/api/TrangThietBiApi/ChinhSua/${thietBiID}`;
        const method = isAddNew ? 'POST' : 'PUT';
        const successMessage = isAddNew ? 'Thêm mới thành công' : 'Chỉnh sửa thành công';
        const redirectUrl = '/AdminTool/TrangThietBi';

        try {
            const res = await fetch(url, { method, body: formData });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();

            if (data?.isSuccess && data.value) {
                showNotification(1, successMessage);
                if (isReturn) {
                    setTimeout(() => { window.location.href = redirectUrl; }, 2000);
                } else {
                    thietBiID = data.value.thietBiID;
                    initThongTinChung();
                    if (isAddNew) {
                        initTableDaPhuongTien(thietBiID);
                    }
                    reloadAccess();
                }
            } else {
                showNotification(0, data.error);
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    //#endregion THÔNG TIN CHUNG

    //#region ĐA PHƯƠNG TIỆN
    function saveTempTranslationDPT() {
        let maNgonNgu = $("#ngonNguDPT").val();
        let tieuDe = $("#tieuDeDPT").val().trim();
        let moTa = $("#moTaDPT").val().trim();

        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ và nhập tên

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let index = daPhuongTientranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

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
        $("#showhinhAnhDPT").attr("src", "/assets/images/vector/addImage.png");
        $("#fileNamePreviewDPT").text("");

        if (loaiMedia === "1") {
            // Hình ảnh
            $("#fileLabel").html('Hình ảnh <span class="text-danger">*</span>');
            $("#showhinhAnhDPT").removeClass("d-none");
            $("#fileDPT").addClass("d-none");
            $("#fileNamePreviewDPT").addClass("d-none");
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
            $("#fileNamePreviewDPT").text(file.name);
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
                    DoiTuongSoHuuID: id,
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
            { "data": "trangThai", "width": "15%", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];
        
        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
            $('#idDPT').val(data.daPhuongTienID);

            $("#modalAddDaPhuongTienTitle").text(`Chỉnh sửa tài liệu liên quan ${data.tieuDe}`);
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
            $(`input[name='trangThaiAdd'][value='${data.suDung == true ? "1" : "0"}'`).prop('checked', true);

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
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                daPhuongTientranslations = data.value
            } else {
                console.log(data.error)
            }

            var banDich_vi = daPhuongTientranslations.find(el => el.maNgonNgu === 'vi')
            $('#ngonNguDPT').val('vi').trigger('change');
            $('#tieuDeDPT').val(banDich_vi.tieuDe);
            $('#moTaDPT').val(banDich_vi.moTa);

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
        $('#typeDPT').val("daphuongtien");
        $('#modalAddDaPhuongTien').modal('show');
        $('#modalAddDaPhuongTienTitle').text('Thêm mới tài liệu liên quan');
    })

    $('#btnSaveDaPhuongTien').on('click', function () {
        dataAddDaPhuongTien();
    });

    async function dataAddDaPhuongTien() {
        if (thietBiID == null || thietBiID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước khi thêm tài liệu liên quan')
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
                return;
            }
        }

        //Kiểm tra đúng loại file và extension
        if (!checkEmptyBlank(duongDanFile) && fileDPT == null) {
            const fileExt = "." + duongDanFile.split(".").pop().toLowerCase();
            // Kiểm tra file extension có khớp loại media không
            if (!allowedExtensions[loaiMedia] || !allowedExtensions[loaiMedia].includes(fileExt)) {
                showNotification(0, "Tệp không hợp lệ với loại media đã chọn!");
                return;
            }
        }

        let thongTinChung = {
            DaPhuongTienID: daPhuongTienID,
            DoiTuongSoHuuID: thietBiID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "TT_TrangThietBi",
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
        $("#modalAddDaPhuongTienTitle").text('Thêm mới tài liệu liên quan');
        $('#thuTuDPT').val('1');
        $('#fileNamePreviewDPT').text("");
    });
    //#endregion ĐA PHƯƠNG TIỆN

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

    async function initLoaiThietBi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 78,
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
                    $("#loaiThietBiID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhTrangThietBi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 79,
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
                    $("#tinhTrangID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                    loaiToChucID: 96
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
    function reloadAccess() {
        if (checkEmptyBlank(thietBiID)) {
            $("#tab-da-phuong-tien").closest("li").hide();
        } else {
            $("#tab-da-phuong-tien").closest("li").show();
        }
        scrollTop();
    }
    
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})

function saveTempThietBiTranslation() {
    let maNgonNgu = $("#ngonNgu").val();
    let tenThietBi = $("#tenThietBi").val().trim();
    let moTa = CKEDITOR.instances["moTa"].getData().trim();

    if (!maNgonNgu) return; // phải chọn ngôn ngữ

    // tìm index ngôn ngữ trong mảng
    let index = trangThietBiTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

    if (!tenThietBi && !moTa) {
        // Nếu tất cả đều trống → xóa bản dịch
        if (index !== -1) {
            trangThietBiTranslations.splice(index, 1);
        }
    } else {
        if (index !== -1) {
            // cập nhật bản dịch đã có
            trangThietBiTranslations[index].tenThietBi = tenThietBi;
            trangThietBiTranslations[index].moTa = moTa;
        } else {
            // thêm mới
            trangThietBiTranslations.push({
                maNgonNgu: maNgonNgu,
                tenThietBi: tenThietBi,
                moTa: moTa,
            });
        }
    }
}