const baseUrl = getRootLink();
const guidEmpty = '00000000-0000-0000-0000-000000000000';
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};


$(document).ready(function () {
    initSelect2();
    initDatePicker();
    previewPicture()
    previewPictureSuKien()

    let hienVatTranslations = [];
    let daPhuongTientranslations = [];
    const ckeditornguonGoc = CKEDITOR.replace('nguonGoc');
    const ckeditorkhaoTa = CKEDITOR.replace('khaoTa');

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initChatLieu(),
            initBaoTang(),
            initLoaiHienVat(),
            initTinhTrangHienVat()
        ]);
        initThongTinChung();
        initTableDaPhuongTien();
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
        if (checkEmptyBlank(hienVatId)) {
            return;
        }

        try {
            const res = await fetch(`/api/HienVatApi/ChiTiet/${hienVatId}`, {
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
                if (data.value.anhDaiDien) {
                    $("#previewAnhDaiDien").attr("src", data.value.anhDaiDien);
                    $("#urlAnhDaiDien").val(data.value.anhDaiDien);
                }

                $("#maHienVat").val(data.value.maHienVat || "");

                $("#loaiHienVatID").val(data.value.loaiHienVatID).trigger("change");
                $("#chatLieuID").val(data.value.chatLieuID).trigger("change");
                $("#phuongThucTangMuaID").val(data.value.phuongThucTangMuaID).trigger("change");
                $("#baoTangID").val(data.value.baoTangID).trigger("change");
                $("#tinhTrangID").val(data.value.tinhTrangID).trigger("change");

                $("#thuTu").val(data.value.thuTu || 1);

                if (data.value.suDung == 1) {
                    $("#trangThaiDuyet").prop("checked", true);
                } else {
                    $("#trangThaiChuaDuyet").prop("checked", true);
                }

                hienVatTranslations = data.value.banDich || [];
                $("#ngonNgu").val("vi").trigger("change");
            } else {
                showNotification(0, data.error);
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempHienVatTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ

        let tenHienVat = $("#tenHienVat").val().trim();
        let tenGoiKhac = $("#tenGoiKhac").val().trim();
        let soLuong = $("#soLuong").val().trim();
        let mauSac = $("#mauSac").val().trim();
        let kichThuoc = $("#kichThuoc").val().trim();
        let nienDai = $("#nienDai").val().trim();
        let tinhTrangSuuTam = $("#tinhTrangSuuTam").val().trim();
        let hoanCanhSuuTam = $("#hoanCanhSuuTam").val().trim();
        let chuHienVat = $("#chuHienVat").val().trim();
        let nguoiSuuTam = $("#nguoiSuuTam").val().trim();

        let nguonGoc = ckeditornguonGoc.getData();
        let khaoTa = ckeditorkhaoTa.getData();

        // tìm index ngôn ngữ trong mảng
        let index = hienVatTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        // nếu tất cả đều trống → xóa bản dịch
        if (!tenHienVat && !tenGoiKhac && !soLuong && !mauSac && !kichThuoc &&
            !nienDai && !nguonGoc && !khaoTa && !tinhTrangSuuTam &&
            !hoanCanhSuuTam && !chuHienVat && !nguoiSuuTam
        ) {
            if (index !== -1) {
                hienVatTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật
                hienVatTranslations[index].tenHienVat = tenHienVat;
                hienVatTranslations[index].tenGoiKhac = tenGoiKhac;
                hienVatTranslations[index].soLuong = soLuong;
                hienVatTranslations[index].mauSac = mauSac;
                hienVatTranslations[index].kichThuoc = kichThuoc;
                hienVatTranslations[index].nienDai = nienDai;
                hienVatTranslations[index].nguonGoc = nguonGoc;
                hienVatTranslations[index].khaoTa = khaoTa;
                hienVatTranslations[index].tinhTrangSuuTam = tinhTrangSuuTam;
                hienVatTranslations[index].hoanCanhSuuTam = hoanCanhSuuTam;
                hienVatTranslations[index].chuHienVat = chuHienVat;
                hienVatTranslations[index].nguoiSuuTam = nguoiSuuTam;
            } else {
                // thêm mới
                hienVatTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenHienVat: tenHienVat,
                    tenGoiKhac: tenGoiKhac,
                    soLuong: soLuong,
                    mauSac: mauSac,
                    kichThuoc: kichThuoc,
                    nienDai: nienDai,
                    nguonGoc: nguonGoc,
                    khaoTa: khaoTa,
                    tinhTrangSuuTam: tinhTrangSuuTam,
                    hoanCanhSuuTam: hoanCanhSuuTam,
                    chuHienVat: chuHienVat,
                    nguoiSuuTam: nguoiSuuTam
                });
            }
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenHienVat, #tenGoiKhac, #soLuong, #mauSac, #kichThuoc, #nienDai, #tinhTrangSuuTam, #hoanCanhSuuTam, #chuHienVat, #nguoiSuuTam")
        .on("blur", function () {
            saveTempHienVatTranslation();
        });
    // Sau khi khởi tạo các CKEditor instances
    ckeditornguonGoc.on('blur', function () {
        saveTempHienVatTranslation();
    });
    ckeditorkhaoTa.on('blur', function() {
        saveTempHienVatTranslation();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = hienVatTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenHienVat").val(exist.tenHienVat);
            $("#tenGoiKhac").val(exist.tenGoiKhac);
            $("#soLuong").val(exist.soLuong);
            $("#mauSac").val(exist.mauSac);
            $("#kichThuoc").val(exist.kichThuoc);
            $("#nienDai").val(exist.nienDai);
            $("#tinhTrangSuuTam").val(exist.tinhTrangSuuTam);
            $("#hoanCanhSuuTam").val(exist.hoanCanhSuuTam);
            $("#chuHienVat").val(exist.chuHienVat);
            $("#nguoiSuuTam").val(exist.nguoiSuuTam);
            if (typeof ckeditornguonGoc !== 'undefined') ckeditornguonGoc.setData(exist.nguonGoc || '');
            if (typeof ckeditorkhaoTa !== 'undefined') ckeditorkhaoTa.setData(exist.khaoTa || '');
           
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenHienVat").val("");
            $("#tenGoiKhac").val("");
            $("#soLuong").val("");
            $("#mauSac").val("");
            $("#kichThuoc").val("");
            $("#nienDai").val("");
            $("#tinhTrangSuuTam").val("");
            $("#hoanCanhSuuTam").val("");
            $("#chuHienVat").val("");
            $("#nguoiSuuTam").val("");
            if (typeof ckeditornguonGoc !== 'undefined') ckeditornguonGoc.setData('');
            if (typeof ckeditorkhaoTa !== 'undefined') ckeditorkhaoTa.setData('');
        }
    });


    $("#btn-save").on("click", function (e) {
        e.preventDefault();

        saveTempHienVatTranslation();
        let flagName = hienVatTranslations.some(t => checkEmptyBlank(t.tenHienVat)); // Tên bắt buộc phải có
        if (flagName) {
            showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
            return;
        }
        dataAddHienVat();
    });

    $("#btn-save-and-close").on("click", function (e) {
        e.preventDefault();

        saveTempHienVatTranslation();
        let flagName = hienVatTranslations.some(t => checkEmptyBlank(t.tenHienVat)); // Tên bắt buộc phải có
        if (flagName) {
            showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
            return;
        }
        dataAddHienVat(1);
    });
   
    async function dataAddHienVat(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let loaiHienVatID = $('#loaiHienVatID').val() || null;
        let maHienVat = $('#maHienVat').val()?.trim() || null;
        let chatLieuID = $('#chatLieuID').val() || null;
        let phuongThucTangMuaID = $('#phuongThucTangMuaID').val() || null;
        let baoTangID = $('#baoTangID').val() || null;
        let tinhTrangID = $('#tinhTrangID').val() || null;
        let thuTu = $('#thuTu').val() || 1;
        let trangThai = $("input[name='trangThai']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = hienVatTranslations.find(el => el.maNgonNgu === 'vi')?.tenHienVat || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !maHienVat || !chatLieuID || !loaiHienVatID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        // Gom object thông tin chung
        let hienVat = {
            LoaiHienVatID: loaiHienVatID,
            MaHienVat: maHienVat,
            ChatLieuID: chatLieuID,
            PhuongThucTangMuaID: phuongThucTangMuaID,
            BaoTangID: baoTangID,
            tinhTrangID: tinhTrangID,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: trangThai == '1' ? true : false,
            AnhDaiDien: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("HienVat", JSON.stringify(hienVat));
        formData.append("HienVat_NoiDung", JSON.stringify(hienVatTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        if (checkEmptyBlank(hienVatId)) {
            try {
                const res = await fetch('/api/HienVatApi/ThemMoi', {
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
                    hienVatId = data.value.hienVatID
                    reloadAccess()
                    
                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/DiSanVanHoaVatThe#hien-vat';
                        }, 2000)
                    } else {
                        scrollTop();
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
                const res = await fetch(`/api/HienVatApi/ChinhSua/${hienVatId}`, {
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
                    hienVatId = data.value.hienVatID
                    reloadAccess()

                    if (isReturn) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/DiSanVanHoaVatThe#hien-vat';
                        }, 2000)
                    } else {
                        scrollTop();
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

        if (!maNgonNgu || !tieuDe) return; // bắt buộc chọn ngôn ngữ và nhập tên di tích

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let exist = daPhuongTientranslations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.tieuDe = tieuDe;
            exist.moTa = moTa;
        } else {
            daPhuongTientranslations.push({
                maNgonNgu: maNgonNgu,
                tieuDe: tieuDe,
                moTa: moTa
            });
        }
        console.log("Lưu tạm:", daPhuongTientranslations);
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tieuDeDPT, #moTaDPT").on("blur", function () {
            saveTempTranslationDPT();
        });

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
    $("#fileDPT").attr("accept", allowedExtensions[loaiInit] || "");

    async function initTableDaPhuongTien() {
        const tableApi = {
            url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    DoiTuongSoHuuID: hienVatId || guidEmpty,
                    maNgonNgu: 'vi'
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                console.log(data)
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

    $('#btnSaveDaPhuongTien').on('click', function () {
        dataAddDaPhuongTien();
    });

    $('#deleteFileDPT').on('click', function () {
        $('#showFileEdit').text("");
        $('#duongDanFile').val("");
    });

    async function dataAddDaPhuongTien() {
        if (hienVatId == null || hienVatId == guidEmpty) {
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
            DoiTuongSoHuuID: hienVatId,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "VH_HienVat",
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

        if (daPhuongTienID === guidEmpty) {
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

    async function initChatLieu() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 35,
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
                    $("#chatLieuID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initBaoTang() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 95
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#baoTangID").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initLoaiHienVat() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 45,
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
                    $("#loaiHienVatID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhTrangHienVat() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 87,
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
    function reloadAccess() {
        if (checkEmptyBlank(hienVatId)) {
            $("#thong-tin-da-phuong-tien-tab").closest("li").hide();
        } else {
            $("#thong-tin-da-phuong-tien-tab").closest("li").show();
        }
    }
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    
})