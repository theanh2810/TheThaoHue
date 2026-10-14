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


    let ckeTrangThietBi= CKEDITOR.replace('trangThietBi');
    let ckeMoTa = CKEDITOR.replace('moTa');

    let congTrinhTheThaoTranslations = [];
    let daPhuongTientranslations = [];
    let diaDiemTranslations = [];
    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initLoaiHinhCongTrinh(),
            initTinhTrangCongTrinh(),
            initToChuc(),
            initDiaDiem(),
            initTinhThanhPho()
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(congTrinhID)) {
            initTableDaPhuongTien(congTrinhID)
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
        if (checkEmptyBlank(congTrinhID)) {
            return;
        }

        try {
            const res = await fetch(`/api/CongTrinhTheThaoApi/ChiTiet/${congTrinhID}/vi`, {
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
                $("#loaiHinhID").val(data.value.loaiHinhID).trigger("change");
                $("#tinhTrangID").val(data.value.tinhTrangID).trigger("change");
                $("#toChucID").val(data.value.toChucID).trigger("change");
                $("#diaDiemID").val(data.value.diaDiemID).trigger("change");

                $("#maDinhDanh").val(data.value.maDinhDanh || "");
                $("#thuTu").val(data.value.thuTu || 1);
                $("#dienTich").val(data.value.dienTich || "");
                $("#sucChua").val(data.value.sucChua || "");

                if (data.value.suDung == true || data.value.suDung == 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                congTrinhTheThaoTranslations = data.value.banDich || [];
                $("#ngonNgu").val("vi").trigger("change");

            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    function saveTempCongTrinhTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenCongTrinh = $("#tenCongTrinh").val().trim();
        let trangThietBi = ckeTrangThietBi.getData();
        let moTa = ckeMoTa.getData();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = congTrinhTheThaoTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tenCongTrinh && !trangThietBi && !moTa) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                congTrinhTheThaoTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                congTrinhTheThaoTranslations[index].tenCongTrinh = tenCongTrinh;
                congTrinhTheThaoTranslations[index].moTa = moTa;
                congTrinhTheThaoTranslations[index].trangThietBi = trangThietBi;
            } else {
                // thêm mới
                congTrinhTheThaoTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenCongTrinh: tenCongTrinh,
                    moTa: moTa,
                    trangThietBi: trangThietBi,
                });
            }
        }
    }
    $(document).ready(function () {
        // Sự kiện blur trên input/textarea → tự động lưu
        $("#tenCongTrinh").on("blur", function () {
            saveTempCongTrinhTranslation();
        });

        ckeTrangThietBi.on("change", function () {
            saveTempCongTrinhTranslation()
        })

        ckeMoTa.on("change", function () {
            saveTempCongTrinhTranslation()
        })
        // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
        $("#ngonNgu").on("change", function () {
            let maNgonNgu = $(this).val();
            let exist = congTrinhTheThaoTranslations.find(t => t.maNgonNgu === maNgonNgu);

            if (exist) {
                $("#tenCongTrinh").val(exist.tenCongTrinh);
                ckeTrangThietBi.setData(exist.trangThietBi);
                ckeMoTa.setData(exist.moTa);
            } else {
                // reset nếu chưa có dữ liệu
                $("#tenCongTrinh").val("");
                ckeTrangThietBi.setData("");
                ckeMoTa.setData("");
            }
        });
    })


    $("#btn-save").on("click", async function (e) {
        saveTempCongTrinhTranslation();
        congTrinhTheThaoTranslations = congTrinhTheThaoTranslations.filter(t => t.tenCongTrinh && t.tenCongTrinh.trim() !== "");
        dataAddThongTinChung()
        e.preventDefault();
    });
    $("#btn-save-and-close").on("click", async function (e) {
        saveTempCongTrinhTranslation();
        congTrinhTheThaoTranslations = congTrinhTheThaoTranslations.filter(t => t.tenCongTrinh && t.tenCongTrinh.trim() !== "");
        dataAddThongTinChung(true);
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let loaiHinhID = $('#loaiHinhID').val() || null;
        let toChucID = $('#toChucID').val() || null;
        let tinhTrangID = $('#tinhTrangID').val() || null;
        let diaDiemID = $('#diaDiemID').val() || null;
        let thuTu = $('#thuTu').val() || 1;
        let suDung = $("input[name='suDung']:checked").val();
        let maDinhDanh = $("#maDinhDanh").val()?.trim() || null;

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = congTrinhTheThaoTranslations.find(el => el.maNgonNgu === 'vi')?.tenCongTrinh || null;

        // Validate các trường bắt buộc
        if (!tenTiengViet || !loaiHinhID) { //(anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) ||
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)');
            return null;
        }

        let entity = {
            congTrinhID: congTrinhID || null,
            LoaiHinhID: loaiHinhID,
            DiaDiemID: diaDiemID,
            maDinhDanh: maDinhDanh,
            ToChucID: toChucID,
            TinhTrangID: tinhTrangID,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: suDung == '1' ? true : false,
            AnhDaiDien: urlAnhDaiDien,
            DienTich: $('#dienTich').val() ? $('#dienTich').val() : null,
            SucChua: $('#sucChua').val() ? $('#sucChua').val() : null,
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("CongTrinhTheThao", JSON.stringify(entity));
        formData.append("CongTrinhTheThao_NoiDung", JSON.stringify(congTrinhTheThaoTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        const isNew = checkEmptyBlank(congTrinhID);
        const url = isNew ? '/api/CongTrinhTheThaoApi/ThemMoi' : `/api/CongTrinhTheThaoApi/ChinhSua/${congTrinhID}`;
        const method = isNew ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, { method, body: formData });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }
            const data = await res.json();

            if (data?.isSuccess && data.value) {
                const message = isNew ? 'Thêm mới thành công' : 'Chỉnh sửa thành công';
                showNotification(1, message);

                if (isReturn) {
                    setTimeout(() => window.location.href = '/AdminTool/CongTrinhTheThao', 2000);
                } else {
                    initThongTinChung();
                    $("#anhDaiDien").val(null);

                    if (isNew) {
                        initTableDaPhuongTien(data.value.congTrinhID);
                    }
                    reloadAccess();
                }
            } else {
                showNotification(0, data?.error || 'Lỗi không xác định');
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
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${tenFile}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
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

        //$('#dataGridDaPhuongTien tbody').on('click', '.detail-command-btn', function () {
        //    var id = $(this).attr("ID").match(/\d+/)[0];
        //    var data = $('#dataGrid').DataTable().row(id).data();

        //    $('#linhVucChuyenSauDetail').text(data.tenLinhVucChuyenSau || "");
        //    $('#tanSuatDetail').text(data.tenTanSuat || "");
        //    //$('#thuTuDetail').text(data.thuTu);
        //    $('#trangThaiDetail').text(data.trangThai == true ? "Đã phát hành" : "Chưa phát hành");

        //    $('#ngonNguDetail').text(data.tenNgonNgu || "");
        //    $('#tenAnPhamDetail').text(data.tenAnPham || "");
        //    $('#doiTuongDocGiaDetail').text(data.doiTuongDocGia || "");

        //    // Thông tin audit
        //    $('#ngayTaoDetail').text(formatDateTime(data.ngayCapNhat));
        //    $('#nguoiTaoDetail').text(data.tenNguoiCapNhat || "");
        //    $('#ngayCapNhatDetail').text(formatDateTime(data.ngayHieuChinh));
        //    $('#nguoiCapNhatDetail').text(data.tenNguoiHieuChinh || "");

        //    $('#modalDetail').modal('show');
        //});

    }
    $("#btnAddDaPhuongTien").on('click', function () {
        $('#typeDPT').val("dpt");
        $('#modalAddDaPhuongTien').modal('show');
        $('#modalAddDaPhuongTienTitle').text('Thêm mới tài liệu liên quan');
    })

    $('#btnSaveDaPhuongTien').on('click', function () {
        let type = $('#typeDPT').val();
        if (type == "dpt") {
            dataAddDaPhuongTien();
        }
    });

    async function dataAddDaPhuongTien() {
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
            DoiTuongSoHuuID: congTrinhID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "DL_CongTrinhTheThao",
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


    //#region ĐỊA ĐIỂM
    // Khi thêm địa điểm mới thành công từ modal dùng chung (DiaDiem.js phát sự kiện 'diaDiem:added'),
    // nạp lại danh sách địa điểm và tự chọn địa điểm vừa tạo cho công trình.
    $(document).on('diaDiem:added', function (e, newDiaDiemId) {
        initDiaDiem(newDiaDiemId);
    });

    //function saveTempDiaDiemTranslation() {
    //    let maNgonNgu = $("#ngonNguDiaDiem").val();
    //    let tenDiaDiem = $("#tenDiaDiem").val().trim();
    //    let diaChi = $("#diaChiDiaDiem").val().trim();
    //    let moTa = $("#moTaDiaDiem").val().trim();
    //    let thoiGianHoatDong = $("#thoiGianHoatDong").val().trim();
    //    let sucChua = $("#sucChua").val();

    //    if (!maNgonNgu) return; // phải chọn ngôn ngữ

    //    // tìm index ngôn ngữ trong mảng
    //    let index = diaDiemTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

    //    if (!tenDiaDiem && !diaChi && !moTa && !thoiGianHoatDong && !sucChua) {
    //        // Nếu tất cả đều trống → xóa bản dịch
    //        if (index !== -1) {
    //            diaDiemTranslations.splice(index, 1);
    //        }
    //    } else {
    //        if (index !== -1) {
    //            // cập nhật bản dịch đã có
    //            diaDiemTranslations[index].tenDiaDiem = tenDiaDiem;
    //            diaDiemTranslations[index].diaChi = diaChi;
    //            diaDiemTranslations[index].moTa = moTa;
    //            diaDiemTranslations[index].thoiGianHoatDong = thoiGianHoatDong;
    //            diaDiemTranslations[index].sucChua = sucChua;
    //        } else {
    //            // thêm mới
    //            diaDiemTranslations.push({
    //                maNgonNgu: maNgonNgu,
    //                tenDiaDiem: tenDiaDiem,
    //                diaChi: diaChi,
    //                moTa: moTa,
    //                thoiGianHoatDong: thoiGianHoatDong,
    //                sucChua: sucChua
    //            });
    //        }
    //    }
    //    console.log(diaDiemTranslations);
    //}

    //// Sự kiện blur trên input/textarea → tự động lưu
    //$("#tenDiaDiem, #diaChiDiaDiem, #moTaDiaDiem, #thoiGianHoatDong, #sucChua").off("blur").on("blur", function () {
    //    saveTempDiaDiemTranslation();
    //});

    //// Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    //$("#ngonNguDiaDiem").on("change", function () {
    //    let maNgonNgu = $(this).val();
    //    let exist = diaDiemTranslations.find(t => t.maNgonNgu === maNgonNgu);

    //    if (exist) {
    //        $("#tenDiaDiem").val(exist.tenDiaDiem);
    //        $("#diaChiDiaDiem").val(exist.diaChi);
    //        $("#moTaDiaDiem").val(exist.moTa);
    //        $("#thoiGianHoatDong").val(exist.thoiGianHoatDong);
    //        $("#sucChua").val(exist.sucChua);
    //    } else {
    //        // reset nếu chưa có dữ liệu
    //        $("#tenDiaDiem").val("");
    //        $("#diaChiDiaDiem").val("");
    //        $("#moTaDiaDiem").val("");
    //        $("#thoiGianHoatDong").val("");
    //        $("#sucChua").val("");
    //    }
    //});

    //$('#btnSaveDiaDiem').on('click', function () {
    //    dataAddDiaDiem()
    //})

    //async function dataAddDiaDiem() {
    //    // Lấy dữ liệu từ input/select
    //    let tinhThanhPho = $('#tinhThanhPho').val() || null;
    //    let phuongXa = $('#phuongXa').val() || null;
    //    let kinhDo = $('#kinhDo').val()?.trim() || null;
    //    let viDo = $('#viDo').val()?.trim() || null;
    //    let caoDo = $('#caoDo').val()?.trim() || null;

    //    let nguoiKhuyetTat = $("#nguoiKhuyetTat").is(":checked");
    //    let nhaVeSinh = $("#nhaVeSinh").is(":checked");
    //    let baiDoXe = $("#baiDoXe").is(":checked");

    //    // Lấy bản dịch tiếng Việt (bắt buộc phải có)
    //    let tenTiengViet = diaDiemTranslations.find(el => el.maNgonNgu === 'vi')?.tenDiaDiem || null;

    //    // Validate các trường bắt buộc
    //    if (!tenTiengViet || !tinhThanhPho || !phuongXa) {
    //        showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
    //        return null;
    //    }

    //    let diaDiem = {
    //        DiaDiemID: null,
    //        TinhThanhPho: tinhThanhPho,
    //        PhuongXa: phuongXa,
    //        KinhDo: kinhDo,
    //        ViDo: viDo,
    //        CaoDo: caoDo,
    //        NguoiKhuyetTat: nguoiKhuyetTat,
    //        NhaVeSinh: nhaVeSinh,
    //        BaiDoXe: baiDoXe,
    //        TrangThai: true
    //    };

    //    // Chuẩn bị formData để gửi lên server
    //    let formData = new FormData();
    //    formData.append("DiaDiem", JSON.stringify(diaDiem));
    //    formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiemTranslations)); // mảng bản dịch

    //    try {
    //        const res = await fetch('/api/DiaDiemApi/ThemMoi', {
    //            method: 'POST',
    //            body: formData
    //        });

    //        if (!res.ok) {
    //            var errText = await res.text();
    //            throw new Error(errText);
    //        }
    //        data = await res.json();

    //        if (data && data.isSuccess && data.value) {
    //            showNotification(1, 'Thêm mới địa điểm thành công')
    //            await initDiaDiem(data.value.diaDiemID)
    //            $('#modalAddDiaDiem').modal('hide');
    //        } else {
    //            showNotification(0, data.error);
    //        }
    //    }
    //    catch (err) {
    //        console.log(err.message);
    //    }
    //}

    // reset modal  
    //$("#modalAddDiaDiem").on('hidden.bs.modal', function () {
    //    diaDiemtranslations = []
    //    $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
    //    $(this).find('select').val('vi').trigger('change');
    //    $(this).find(".div_checkbox input[type='checkbox']").prop("checked", false);
    //});
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

            $("#diaDiemID").empty();
            $("#diaDiemID").append(`<option></option>`);
            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#diaDiemID").append(`<option value="${el.diaDiemID}">${el.tenDiaDiem}</option>`);
                });
                if (id) {
                    $("#diaDiemID").val(id).trigger('change');
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

    async function initLoaiHinhCongTrinh() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 15,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                console.log(data.value, "data công trình")
                data.value = data.value.filter(x => x.trangThai === true)
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

    async function initTinhTrangCongTrinh() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 52,
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
                    loaiToChucID: 96,
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
        if (checkEmptyBlank(congTrinhID)) {
            $("#tab-da-phuong-tien").closest("li").hide();
            $("#tab-mon-the-thao").closest("li").hide();
        } else {
            $("#tab-da-phuong-tien").closest("li").show();
            $("#tab-mon-the-thao").closest("li").show();
            $('#monTheThaoPicker').hide();
            $('#tableMonTheThao').show();
            loadMonTheThaoForCongTrinh();
            $('#btnLuuMonTheThao').prop('disabled', false);
        }
        scrollTop();
    }

    let allMonTheThao = [];
    let selectedMonTheThao = new Set();

    async function loadMonTheThaoForCongTrinh() {
        try {
            const [allRes, selectedRes] = await Promise.all([
                fetch(`${baseUrl}/api/TT_MonTheThaoApi/DanhSach`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ maNgonNgu: 'vi', trangThai: true })
                }),
                fetch(`${baseUrl}/api/MonTheThao_CongTrinhApi/GetByCongTrinh/${congTrinhID}?maNgonNgu=vi`)
            ]);

            if (allRes.ok) {
                const d = await allRes.json();
                allMonTheThao = (d && d.isSuccess) ? (d.value || []) : [];
            }
            if (selectedRes.ok) {
                const d = await selectedRes.json();
                const list = (d && d.isSuccess) ? (d.value || []) : [];
                selectedMonTheThao = new Set(list.map(m => m.monTheThaoID || m.MonTheThaoID));
            }
            renderMonTheThaoTable();
        } catch (e) { }
    }

    function renderMonTheThaoTable() {
        const tbody = $('#bodyMonTheThao');
        tbody.empty();
        allMonTheThao.forEach(mon => {
            const id = mon.monTheThaoID || mon.MonTheThaoID;
            const ten = mon.tenMon || mon.TenMon || id;
            const checked = selectedMonTheThao.has(id) ? 'checked' : '';
            tbody.append(`<tr>
                <td><input type="checkbox" class="check-mon" value="${id}" ${checked} /></td>
                <td>${ten}</td>
            </tr>`);
        });
    }

    $('#checkAllMon').on('change', function () {
        $('.check-mon').prop('checked', this.checked);
    });

    $('#btnLuuMonTheThao').on('click', async function () {
        const ids = $('.check-mon:checked').map(function () { return this.value; }).get();
        try {
            const res = await fetch(`${baseUrl}/api/MonTheThao_CongTrinhApi/Save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ congTrinhID: congTrinhID, danhSachID: ids })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data && data.isSuccess) {
                showNotification(1, 'Đã lưu danh sách môn thể thao');
                selectedMonTheThao = new Set(ids);
            } else {
                showNotification(0, data.error || 'Lưu thất bại');
            }
        } catch (e) {
            showNotification(0, e.message);
        }
    });

    $('#tinhThanhPho').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX

    

})