const baseUrl = getRootLink();
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const guidEmpty = "00000000-0000-0000-0000-000000000000";

let xucTienTranslations = [];
let daPhuongTientranslations = [];

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    let pondVB = initFilePond('fileVB');
    let ckeMoTa = CKEDITOR.replace('moTa');

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initCoQuanBanHanh(),
            initLinhVucXucTien(),
            initToChuc(),
            initDoiTuongHuongToi(),
            initPhuongThucTruyenThong(),
            initTrangThaiXucTien(),
            initHinhThucXucTien(),
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(xucTienID)) {
            initTableVanBanTaiLieu(xucTienID)
            initTableDaPhuongTien(xucTienID)
        }
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "vanban") {
            dataDeleteVanBanTaiLieu();
        } else if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        }
    });

    //#region THÔNG TIN CHUNG
    async function initThongTinChung() {
        if (checkEmptyBlank(xucTienID)) {
            return;
        }

        try {
            const res = await fetch(`/api/ThongTinXucTienApi/ChiTiet/${xucTienID}`, {
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
                $("#xucTienID").val(data.value.xucTienID || "");
                $("#linhVucID").val(data.value.linhVucID).trigger("change");
                $("#toChucID").val(data.value.toChucID).trigger("change");
                $("#doiTuongID").val(data.value.doiTuongID).trigger("change");
                $("#truyenThongID").val(data.value.truyenThongID).trigger("change");
                $("#trangThaiID").val(data.value.trangThaiID).trigger("change");
                $("#hinhThucID").val(data.value.hinhThucID).trigger("change");
                $("#ngayBatDau").val(data.value.ngayBatDau != "" ? formatShortDate(data.value.ngayBatDau) : "")
                $("#ngayKetThuc").val(data.value.ngayKetThuc != "" ? formatShortDate(data.value.ngayKetThuc) : "");
                $("#thuTu").val(data.value.thuTu || 1);

                if (data.value.suDung === true || data.value.suDung === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                xucTienTranslations = data.value.banDich || [];
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
    $("#tieuDe").on("blur", function () {
        saveTempXucTienTranslation();
    });

    ckeMoTa.on('blur', function (evt) {
        saveTempXucTienTranslation()
    });
    function saveTempXucTienTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tieuDe = $("#tieuDe").val().trim();
        let moTa = CKEDITOR.instances["moTa"].getData().trim();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = xucTienTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tieuDe && !moTa) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                xucTienTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                xucTienTranslations[index].tieuDe = tieuDe;
                xucTienTranslations[index].moTa = moTa;
            } else {
                // thêm mới
                xucTienTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tieuDe: tieuDe,
                    moTa: moTa,
                });
            }
        }
        console.log(xucTienTranslations);
    }

    

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = xucTienTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDe").val(exist.tieuDe);
            ckeMoTa.setData(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDe").val("");
            ckeMoTa.setData("");
        }
    });


    $("#btn-save").on("click", async function (e) {
        saveTempXucTienTranslation();
        xucTienTranslations = xucTienTranslations.filter(t => t.tieuDe && t.tieuDe.trim() !== "");
        dataAddThongTinChung()
        e.preventDefault();
    });

    $("#btn-save-and-close").on("click", async function (e) {
        saveTempXucTienTranslation();
        xucTienTranslations = xucTienTranslations.filter(t => t.tieuDe && t.tieuDe.trim() !== "");
        dataAddThongTinChung(true);
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy dữ liệu từ input/select
        let linhVucID = $('#linhVucID').val() || null;
        let toChucID = $('#toChucID').val() || null;
        let doiTuongID = $('#doiTuongID').val() || null;
        let truyenThongID = $('#truyenThongID').val() || null;
        let trangThaiID = $('#trangThaiID').val() || null;
        let hienThi = $('input[name="suDung"]:checked').val()
        let hinhThucID = $('#hinhThucID').val() || null;
        let ngayBatDau = $('#ngayBatDau').val()?.trim() || null;
        let ngayKetThuc = $('#ngayKetThuc').val()?.trim() || null;
        let thuTu = $('#thuTu').val() || 1;

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = xucTienTranslations.find(el => el.maNgonNgu === 'vi')?.tieuDe || null;

        // Validate các trường bắt buộc
        if (!tenTiengViet || !linhVucID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let checkDate = validateFromToDates(ngayBatDau, ngayKetThuc);
        if (!checkDate.valid) {
            showNotification(0, checkDate.message)
            return;
        }

        // Tạo đối tượng chung
        let thongTinXucTien = {
            XucTienID: xucTienID || null,
            LinhVucID: linhVucID,
            ToChucID: toChucID,
            DoiTuongID: doiTuongID,
            TruyenThongID: truyenThongID,
            TrangThaiID: trangThaiID,
            SuDung: hienThi == '1' ? true : false,
            HinhThucID: hinhThucID,
            NgayBatDau: formatDateToSearch(ngayBatDau),
            NgayKetThuc: formatDateToSearch(ngayKetThuc),
            ThuTu: thuTu != "" ? Number(thuTu) : 1
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("ThongTinXucTien", JSON.stringify(thongTinXucTien));
        formData.append("ThongTinXucTien_NoiDung", JSON.stringify(xucTienTranslations)); // mảng bản dịch
        
        const isAddNew = checkEmptyBlank(xucTienID);
        const url = isAddNew ? '/api/ThongTinXucTienApi/ThemMoi' : `/api/ThongTinXucTienApi/ChinhSua/${xucTienID}`;
        const method = isAddNew ? 'POST' : 'PUT';
        const successMessage = isAddNew ? 'Thêm mới thành công' : 'Chỉnh sửa thành công';
        const redirectUrl = isAddNew ? '/AdminTool/ThongTinXucTien' : '/AdminTool/ThongTinXucTien';

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
                    xucTienID = data.value.xucTienID;
                    initThongTinChung();
                    if (isAddNew) {
                        initTableVanBanTaiLieu(xucTienID);
                        initTableDaPhuongTien(xucTienID);
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
            { "data": "trangThai", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];
        
        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
            $('#idDPT').val(data.daPhuongTienID);

            $("#modalAddDaPhuongTienTitle").text(`Chỉnh sửa tài liệu truyền thông ${data.tieuDe}`);
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
        $('#modalAddDaPhuongTien').modal('show');
    })

    $('#btnSaveDaPhuongTien').on('click', function () {
        dataAddDaPhuongTien();
    });

    async function dataAddDaPhuongTien() {
        if (xucTienID == null || xucTienID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin di tích trước khi thêm tài liệu truyền thông')
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
            DoiTuongSoHuuID: xucTienID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "VH_ThongTinXucTien",
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
        $('#fileNamePreviewDPT').text("");
        $('#thuTuDPT').val('1');
    });
    //#endregion ĐA PHƯƠNG TIỆN

    //#region VĂN BẢN TÀI LIỆU
    async function initTableVanBanTaiLieu(id) {
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
                targets: 3,
                render: function (data, type, row, meta) {
                    let ngay = data ? formatShortDate(data) : '';
                    return `<span>${ngay}</span>`;
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
            { "data": "tenCoQuanBanHanh", "width": "320px", "class": "left-align" },
            { "data": "ngayBanHanh", "width": "150px", "class": "center-align" },
            { "data": "ngayHieuLuc", "width": "150px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        initDataTableConfigNoSearch('dataGridVanBanTaiLieu', tableApi, tableDefs, tableCols);

        $('#dataGridVanBanTaiLieu tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("id").match(/\d+/)[0];
            var data = $('#dataGridVanBanTaiLieu').DataTable().row(id).data();

            $('#idVanBan').val(data.vanBanID);
            $('#modalTitleVB').text(`Chỉnh sửa văn bản ${data.tieuDe}`)
            if (data.duongDanFile) {
                data.duongDanFile.split(";").forEach(url => {
                    pondVB.addFile(`${baseUrl}/${url}`);
                })
                $("#duongDanFileVB").val(data.duongDanFile);
            }

            $("#trichYeu").val(data.trichYeu || '');
            $("#soKyHieu").val(data.soKyHieu || '');
            $("#nguoiKy").val(data.nguoiKy || '');
            $("#noiDung").val(data.noiDung || '');
          
            $("#ngayBanHanh").val(data.ngayBanHanh != null ? formatShortDate(data.ngayBanHanh) : "");
            $("#ngayHieuLuc").val(data.ngayHieuLuc != null ? formatShortDate(data.ngayHieuLuc) : "");
            $("#ngayHetHan").val(data.ngayHetHan != null ? formatShortDate(data.ngayHetHan) : "");
            $("#coQuanBanHanhID").val(data.coQuanBanHanhID || '').trigger('change');

            $('#modalAddVanBanTaiLieu').modal('show');
        });

        $('#dataGridVanBanTaiLieu tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridVanBanTaiLieu').DataTable().row(id).data();

            $('#idDelete').val(data.vanBanID);
            $('#nameDelete').text(`${data.trichYeu}`);
            $('#idTypeDelete').val('vanban');

            $('#modalDelete').modal('show');
        });
    }

    $('#btnSaveVanBanTaiLieu').on('click', function () {
        dataAddVanBanTaiLieu()
    });

    async function dataAddVanBanTaiLieu() {
        if (xucTienID == null || xucTienID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước khi thêm văn bản tài liệu');
            return;
        }

        let id = $('#idVanBan').val();
        let duongDanFile = $('#duongDanFileVB').val()?.trim();
        let files = pondVB.getFiles()
        let soKyHieu = $('#soKyHieu').val()?.trim();
        let trichYeu = $('#trichYeu').val()?.trim();
        let nguoiKy = $('#nguoiKy').val()?.trim();
        let noiDung = $('#noiDung').val()?.trim()
        let coQuanBanHanh = $('#coQuanBanHanhID').val();
        let ngayBanHanh = $('#ngayBanHanh').val();
        let ngayHieuLuc = $('#ngayHieuLuc').val();
        let ngayHetHan = $('#ngayHetHan').val();

        if ((files.length < 0 && checkEmptyBlank(duongDanFile))
            || checkEmptyBlank(soKyHieu)
            || checkEmptyBlank(trichYeu)
            || checkEmptyBlank(ngayBanHanh)
            || checkEmptyBlank(coQuanBanHanh)) {
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
        formData.append("doiTuongSoHuuID", xucTienID);
        formData.append("duongDanFile", duongDanFile);
        formData.append("soKyHieu", soKyHieu);
        formData.append("trichYeu", trichYeu);
        formData.append("nguoiKy", nguoiKy);
        formData.append("noiDung", noiDung);
        formData.append("bangThamChieu", "DL_ThongTinXucTien");
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
                    $('#modalAddVanBanTaiLieu').modal('hide');
                    $('#dataGridVanBanTaiLieu').DataTable().ajax.reload();
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
                    $('#modalAddVanBanTaiLieu').modal('hide');
                    $('#dataGridVanBanTaiLieu').DataTable().ajax.reload();
                } else {
                    showNotification(0, data.error);
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    }

    async function dataDeleteVanBanTaiLieu() {
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
                $('#dataGridVanBanTaiLieu').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset modal
    $("#modalAddVanBanTaiLieu").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalTitleVB').text('Thêm mới văn bản')
        pondVB.removeFiles();
    });
    //#endregion VĂN BẢN TÀI LIỆU

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
                //data.value.push({ toChucID: '701C8CE6-49C3-4DD3-AC47-36F6938AE3C0', tenToChuc: '-- 1 --' },
                //    { toChucID: '89D5747A-E5C8-450A-8865-81F14416BA1D', tenToChuc: '-- 2 --' }
                //)

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

    async function initLinhVucXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 76,
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
                    $("#linhVucID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initDoiTuongHuongToi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 73,
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
                    $("#doiTuongID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initHinhThucXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 74,
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
                    $("#hinhThucID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initPhuongThucTruyenThong() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 75,
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
                    $("#truyenThongID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTrangThaiXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 77,
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
                    $("#trangThaiID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                    loaiToChucID: 310
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
        if (checkEmptyBlank(xucTienID)) {
            $("#tab-van-ban-tai-lieu").closest("li").hide();
            $("#tab-da-phuong-tien").closest("li").hide();
        } else {
            $("#tab-van-ban-tai-lieu").closest("li").show();
            $("#tab-da-phuong-tien").closest("li").show();
        }
        scrollTop();
    }
    
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})


