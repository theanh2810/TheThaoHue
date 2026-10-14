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
    previewPicture()
    previewPictureSuKien()

    let pondVBTL = initFilePond('fileVBTL');
    let phiVatTheTranslations = [];
    let translationsDPT = [];
    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initTinhTrangPhiVatThe(),
            initLoaiHinhPhiVatThe(),
            initCoQuanBanHanhVanBan()
        ]);
        if (!checkEmptyBlank(diSanID)) {
            initTableDaPhuongTien(diSanID);
            initTableVanBanTaiLieu(diSanID);
        }
        initThongTinChung();
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        } else if (type == "2") {
            dataDeleteVanBanTaiLieu()
        }
    });

    //#region THÔNG TIN CHUNG

    document.getElementById('anhDaiDien').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewAnhDaiDien').setAttribute('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    async function initThongTinChung() {
        if (checkEmptyBlank(diSanID)) {
            return;
        }

        try {
            const res = await fetch(`/api/DiSanPhiVatTheApi/ChiTiet/${diSanID}`, {
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
                $("#diSanID").val(data.value.diSanID || "");
                $("#previewAnhDaiDien").attr("src", data.value.anhDaiDien || "/images/no-image.png");
                $("#urlAnhDaiDien").val(data.value.anhDaiDien || "");
                $("#maDinhDanh").val(data.value.maDinhDanh || "");
                $("#loaiHinhID").val(data.value.loaiHinhID || "").trigger("change");
                $("#tinhTrangID").val(data.value.tinhTrangID || "").trigger("change");
                $("#thuTu").val(data.value.thuTu || 1);

                if (data.value.suDung === true || data.value.suDung === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                phiVatTheTranslations = data.value.banDich || [];

                let tiengViet = phiVatTheTranslations.find(el => el.maNgonNgu === "vi") || null;
                if (tiengViet) {
                    $("#ngonNgu").val("vi").trigger("change");
                    $("#tenDiSan").val(tiengViet.tenDiSan || "");
                    $("#congDong").val(tiengViet.congDong || "");
                    $("#tinhTrang").val(tiengViet.tinhTrang || "");
                    $("#moTa").val(tiengViet.moTa || "");
                } else {
                    $("#tenDiSan, #congDong, #tinhTrang, #moTa").val("");
                }
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    function saveTempPhiVatTheTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenDiSan = $("#tenDiSan").val().trim();
        let congDong = $("#congDong").val().trim();
        let tinhTrang = $("#tinhTrang").val().trim();
        let moTa = $("#moTa").val().trim();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = phiVatTheTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (index !== -1) {
            // cập nhật bản dịch đã có
            phiVatTheTranslations[index].tenDiSan = tenDiSan;
            phiVatTheTranslations[index].congDong = congDong;
            phiVatTheTranslations[index].tinhTrang = tinhTrang;
            phiVatTheTranslations[index].moTa = moTa;
        } else {
            // thêm mới
            phiVatTheTranslations.push({
                maNgonNgu: maNgonNgu,
                tenDiSan: tenDiSan,
                congDong: congDong,
                tinhTrang: tinhTrang,
                moTa: moTa
            });
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenDiSan, #congDong, #tinhTrang, #moTa")
        .on("blur", function () {
            saveTempPhiVatTheTranslation();
        });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = phiVatTheTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenDiSan").val(exist.tenDiSan);
            $("#congDong").val(exist.congDong);
            $("#tinhTrang").val(exist.tinhTrang);
            $("#moTa").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenDiSan").val("");
            $("#congDong").val("");
            $("#tinhTrang").val("");
            $("#moTa").val("");
        }
    });


    $("#btn-save").on("click", function (e) {
        e.preventDefault();

        saveTempPhiVatTheTranslation();
        //phiVatTheTranslations = phiVatTheTranslations.filter(t => t.tenDiSan && t.tenDiSan.trim() !== "");
        //let flagName = phiVatTheTranslations.some(t => checkEmptyBlank(t.tenDiSan)); // Tên bắt buộc phải có
        //if (flagName) {
        //    showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
        //    return;
        //}
        dataAddPhiVatThe();
    });
    $("#btn-save-and-close").on("click", async function (e) {
        e.preventDefault();

        saveTempPhiVatTheTranslation();
        //phiVatTheTranslations = phiVatTheTranslations.filter(t => t.tenDiSan && t.tenDiSan.trim() !== "");
        //let flagName = phiVatTheTranslations.some(t => checkEmptyBlank(t.tenDiSan) && t.maNgonNgu == 'vi'); // Tên bắt buộc phải có
        //if (flagName) {
        //    showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
        //    return;
        //}
        dataAddPhiVatThe(true);
    });
   
    async function dataAddPhiVatThe(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let maDinhDanh = $('#maDinhDanh').val()?.trim() || null;
        let loaiHinhID = $('#loaiHinhID').val() || null;  
        let tinhTrangID = $('#tinhTrangID').val() || null;
        let thuTu = $('#thuTu').val() || 1;
        let trangThai = $("input[name='suDung']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = phiVatTheTranslations.find(el => el.maNgonNgu === 'vi')?.tenDiSan || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !maDinhDanh || !loaiHinhID || !tinhTrangID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let diSan = {
            DiSanID: diSanID || null,
            maDinhDanh: maDinhDanh,
            LoaiHinhID: loaiHinhID,
            tinhTrangID: tinhTrangID,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: trangThai == '1' ? true : false,
            AnhDaiDien: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("PhiVatThe", JSON.stringify(diSan));
        formData.append("PhiVatThe_NoiDung", JSON.stringify(phiVatTheTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        if (checkEmptyBlank(diSanID)) {
            try {
                const res = await fetch('/api/DiSanPhiVatTheApi/ThemMoi', {
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
                            window.location.href = '/AdminTool/DiSanVanHoaPhiVatThe';
                        }, 2000);
                    } else {
                        diSanID = data.value.diSanID
                        initThongTinChung();

                        initTableDaPhuongTien(diSanID);
                        initTableVanBanTaiLieu(diSanID);

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
                const res = await fetch(`/api/DiSanPhiVatTheApi/ChinhSua/${diSanID}`, {
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
                            window.location.href = '/AdminTool/DiSanVanHoaPhiVatThe';
                        }, 2000);
                    } else {
                        diSanID = data.value.diSanID
                        initThongTinChung();
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


    //#region ĐA PHƯƠNG TIỆN

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslationDPT() {
        let maNgonNgu = $("#ngonNguDPT").val();
        let tieuDe = $("#tieuDeDPT").val().trim();
        let moTa = $("#moTaDPT").val().trim();

        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ và nhập tên

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let index = translationsDPT.findIndex(t => t.maNgonNgu === maNgonNgu);
        if (tieuDe === "" && moTa === "") {
            // Nếu trống cả tiêu đề và mô tả -> xóa bản dịch khỏi mảng
            if (index !== -1) {
                translationsDPT.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                translationsDPT[index].tieuDe = tieuDe;
                translationsDPT[index].moTa = moTa;
            } else {
                translationsDPT.push({
                    maNgonNgu: maNgonNgu,
                    tieuDe: tieuDe,
                    moTa: moTa
                });
            }
        }
        console.log(translationsDPT)
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tieuDeDPT, #moTaDPT").on("blur", saveTempTranslationDPT);

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDPT").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = translationsDPT.find(t => t.maNgonNgu === maNgonNgu);

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
            $("#showhinhAnhDPT").attr("src", "");
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
    $("#fileDPT").attr("accept", allowedExtensions[loaiInit] || "");

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
            { "data": "trangThai", "width": "15%", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        //if (!permitedEdit && !permitedDelete) {
        //    tableCols.pop();
        //    tableDefs.pop();
        //}

        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
            $('#idDPT').val(data.daPhuongTienID);

            $("#modalAddDaPhuongTienTitle").text(`Chỉnh sửa tài liệu truyền thông ${data.tieuDe}`);
            $("#typeDPT").val("dpt");
            // Các input text
            $("input[name='loaiMediaDPT'][value='" + String(data.loaiMedia) + "']").prop("checked", true).trigger("change");

            if (data.duongDanFile) {
                $("#fileNamePreviewDPT").text(data.duongDanFile.split('/').pop());
                $("#duongDanFileDPT").val(data.duongDanFile);

                if (String(data.loaiMedia) === "1") {
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
                translationsDPT = data.value
                $('#ngonNguDPT').val('vi').trigger('change');
            } else {
                console.log(data.error)
            }

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

    $('#btnAddDaPhuongTien').on('click', function () {
        $('#modalAddDaPhuongTien').modal('show');
    })

    $('#btnSaveDaPhuongTien').on('click', async function (e) {
        e.preventDefault();

        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
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
    });

    async function dataAddDaPhuongTien() {
        if (diSanID == null || diSanID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước khi thêm tài liệu truyền thông')
            return;
        }
        let daPhuongTienID = $('#idDPT').val() || guidEmpty
        let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
        let fileDPT = $("#fileDPT")[0].files[0] || null;
        let tacGia = $("#tacGiaDPT").val();
        let thuTu = $("#thuTuDPT").val();
        let trangThai = $("input[name='trangThaiDPT']:checked").val();
        let duongDanFile = $("#duongDanFileDPT").val();

        let tenTiengViet = translationsDPT.find(el => el.maNgonNgu === 'vi')?.tieuDe || null

        if (!fileDPT && checkEmptyBlank(duongDanFile) || !tenTiengViet) {
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
            DoiTuongSoHuuID: diSanID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "VH_DiSanPhiVatThe",
            DuongDanFile: duongDanFile,
            TacGia: tacGia,
            ThuTuHienThi: thuTu || 1,
            SuDung: trangThai == "1" ? true : false
        };

        let formData = new FormData();
        formData.append("DaPhuongTien", JSON.stringify(thongTinChung));
        formData.append("DaPhuongTien_NoiDung", JSON.stringify(translationsDPT));

        if (fileDPT) {
            formData.append("File", fileDPT);
        }

        if (daPhuongTienID != null || daPhuongTienID != guidEmpty) {
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
                    translationsDPT = []
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
                    translationsDPT = []

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
        translationsDPT = []
        $(this).find('input[type=text], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true).trigger('change');
        $("#showhinhAnhDPT").attr("src", '/assets/images/vector/Addimage.png');
        $("#modalAddDaPhuongTienTitle").text('Thêm mới tài liệu truyền thông');
        $('#thuTuDPT').val('1');
        $('#fileNamePreviewDPT').text("");
    });
    //#endregion

    //#region VĂN BẢN TÀI LIỆU
    async function initTableVanBanTaiLieu(id) {
        const tableApi = {
            url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    doiTuongSoHuuID: id || guidEmpty,
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
                    return row.tenCoQuanBanHanh || '';
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
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "", "class": "left-align" },
            { "data": "tenCoQuanBanHanh", "width": "15%", "class": "left-align" },
            { "data": "ngayBanHanh", "width": "10%", "class": "center-align" },
            { "data": "ngayHieuLuc", "width": "10%", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGridVanBanTaiLieu', tableApi, tableDefs, tableCols);

        $('#dataGridVanBanTaiLieu tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridVanBanTaiLieu').DataTable().row(id).data();
            $('#idVBTL').val(data.vanBanID);

            if (data.duongDanFile) {
                data.duongDanFile.split(";").forEach(url => {
                    pondVBTL.addFile(`${baseUrl}/${url}`);
                })
                $("#duongDanFileVBTL").val(data.duongDanFile);
            }


            $("#trichYeuVBTL").val(data.trichYeu || '');
            $("#soKyHieuVBTL").val(data.soKyHieu || '');
            $("#nguoiKyVBTL").val(data.nguoiKy || '');
            $("#noiDungVBTL").val(data.noiDung || '');
            $("#ngayBanHanhVBTL").val(data.ngayBanHanh != null ? formatShortDate(data.ngayBanHanh) : "");
            $("#ngayHieuLucVBTL").val(data.ngayHieuLuc != null ? formatShortDate(data.ngayHieuLuc) : "");
            $("#coQuanBanHanhVBTL").val(data.coQuanBanHanhID || '').trigger('change');

            $('#modalAddVanBanTaiLieu').modal('show');
        });
        $('#dataGridVanBanTaiLieu tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridVanBanTaiLieu').DataTable().row(id).data();

            $('#idDelete').val(data.vanBanID);
            $('#nameDelete').text(`${data.trichYeu}`);
            $('#idTypeDelete').val(3);

            $('#modalDelete').modal('show');
        });
    }

    $('#btnSaveVBTL').on('click', async function (e) {
        e.preventDefault();

        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
            await dataAddVanBanTaiLieu()
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
    async function dataAddVanBanTaiLieu() {
        if (diSanID == null || diSanID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin di tích trước khi thêm văn bản tài liệu')
            return;
        }

        let idVBTL = $('#idVBTL').val()?.trim();
        let duongDanFileVBTL = $('#duongDanFileVBTL').val()?.trim();
        let fileVBTL = pondVBTL.getFiles();
        let soKyHieuVBTL = $('#soKyHieuVBTL').val()?.trim();
        let trichYeuVBTL = $('#trichYeuVBTL').val()?.trim();
        let nguoiKyVBTL = $('#nguoiKyVBTL').val()?.trim();
        let noiDungVBTL = $('#noiDungVBTL').val()?.trim();
        let coQuanBanHanhVBTL = $('#coQuanBanHanhVBTL').val();
        let ngayBanHanhVBTL = $('#ngayBanHanhVBTL').val();
        let ngayHieuLucVBTL = $('#ngayHieuLucVBTL').val();

        if ((fileVBTL.length <= 0 && checkEmptyBlank(duongDanFileVBTL))
            || checkEmptyBlank(soKyHieuVBTL)
            || checkEmptyBlank(trichYeuVBTL)
            || checkEmptyBlank(coQuanBanHanhVBTL)
            || checkEmptyBlank(ngayHieuLucVBTL)
            || checkEmptyBlank(ngayBanHanhVBTL)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)')
            return;
        }

        if (fileVBTL.length > 0) {
            const invalidFiles = fileVBTL.some(f => {
                const fileExt = "." + f.file.name.split(".").pop().toLowerCase();
                return !allowedExtensions[4].includes(fileExt);
            });
            if (invalidFiles) {
                showNotification(0, `Có file không đúng định dạng!`);
                return false;
            }
        }

        let urls = duongDanFileVBTL?.split(";")
        // lọc lại đường dẫn loại bỏ những file không còn tồn tại trong fileTLTT
        duongDanFileVBTL = urls.filter(url => {
            return fileVBTL.some(f => url.endsWith(f.file.name))
        })?.join(";");

        let checkDate = validateFromToDates(ngayBanHanhVBTL, ngayHieuLucVBTL, "Ngày ban hành phải nhỏ hơn ngày có hiệu lực")
        if (!checkDate.valid) {
            showNotification(0, checkDate.message)
            return;
        }

        let formData = new FormData()

        formData.append("vanBanID", idVBTL);
        formData.append("doiTuongSoHuuID", diSanID);
        formData.append("duongDanFile", duongDanFileVBTL);
        formData.append("soKyHieu", soKyHieuVBTL);
        formData.append("trichYeu", trichYeuVBTL);
        formData.append("nguoiKy", nguoiKyVBTL);
        formData.append("noiDung", noiDungVBTL);
        formData.append("coQuanBanHanhID", coQuanBanHanhVBTL);
        formData.append("ngayBanHanh", formatDateToSearch(ngayBanHanhVBTL));
        formData.append("ngayHieuLuc", formatDateToSearch(ngayHieuLucVBTL));

        fileVBTL.forEach(fileItem => {
            if (!duongDanFileVBTL?.includes(fileItem.file.name)) {
                formData.append("File", fileItem.file); // append từng file
            }
        });

        if (checkEmptyBlank(idVBTL)) {
            try {
                const res = await fetch('/api/VanBanTaiLieuApi/ThemMoi', {
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
                    translations = []
                    $('#modalAddVanBanTaiLieu').modal('hide');
                    $('#dataGridVanBanTaiLieu').DataTable().ajax.reload();
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/VanBanTaiLieuApi/ChinhSua/${idVBTL}`, {
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
                    $('#modalAddVanBanTaiLieu').modal('hide');
                    $('#dataGridVanBanTaiLieu').DataTable().ajax.reload();
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
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

    $('#btnAddVanBanTaiLieu').on('click', function () {
        $('#modalAddVanBanTaiLieu').modal('show');
    })
    // reset modal
    $("#modalAddVanBanTaiLieu").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=number], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAddTitleVBTL').text('Thêm mới văn bản tài liệu')
        pondVBTL.removeFiles();
    });
    //#endregion

    // reset modal
    $("#modalAddVanBanTaiLieu").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAddTitle').text('Thêm mới văn bản tài liệu')
        $('#showFileVBTL').text('')

    });
    //#endregion

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
                    $("#ngonNguTT").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngonNgu").val('vi').trigger('change');
                $("#ngonNguDPT").val('vi').trigger('change');
                $("#ngonNguTT").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initLoaiHinhPhiVatThe() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 16,
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

    async function initTinhTrangPhiVatThe() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 43,
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

    async function initCoQuanBanHanhVanBan() {
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
                    $("#coQuanBanHanhVBTL").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
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
        if (checkEmptyBlank(diSanID)) {
            $("#thong-tin-da-phuong-tien-tab").closest("li").hide();
            $("#van-ban-tai-lieu-tab").closest("li").hide();
        } else {
            $("#thong-tin-da-phuong-tien-tab").closest("li").show();
            $("#van-ban-tai-lieu-tab").closest("li").show();
        }
        scrollTop();
    }
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    
})