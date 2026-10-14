const baseUrl = getRootLink();
const guidEmpty = '00000000-0000-0000-0000-000000000000';
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const ckeditormoTaDiTich = CKEDITOR.replace('moTaDiTich');
$(document).ready(function () {
    initSelect2();
    initDatePicker();
    initDiaDiem();
    previewPicture_WithSelector('anhDaiDien', 'previewAnhDaiDien')
    initTinhThanhPho()

    let pondVBTL= initFilePond('fileVBTL');
    let pondTLTT = initFilePond('fileTLTT');
    let translations = [];
    let translationsDPT = [];
    let translationsTT = [];
    let banDichTT = [];
    let objTLTT = [];
    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initCapXepHang(),
            initLoaiHinhDiTich(),
            initDonViQuanLy(),
            initCoQuanBanHanhVanBan(),
            initTinhTrangDiTich()
        ]);
        if (!checkEmptyBlank(diTichId)) {
            initTableDaPhuongTien(diTichId);
            initTableTrungTu(diTichId);
            initTableVanBanTaiLieu(diTichId);
            initTableTLTT()
        }
        initThongTinChung();
        reloadAccess()
    })();

    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        } else if (type == "2") {
            dataDeleteTrungTu();
        } else if (type == "3") {
            dataDeleteVanBanTaiLieu();
        } else if (type == "4") {
            dataDeleteTLTT();
        }
    });

    //#region Xử lý tọa độ, vị trí bản đồ
    $("#modalAddDiaDiem").on('hidden.bs.modal', function () {
        translationsDiaDiem = []
        resetModal(this)
    })

    $(document).on('change', '#DiaDiemCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        console.log(listDiaDiem)
        initTableDiaDiem(listDiaDiem);
    });

    $("#btnAddDiaDiem").on("click", function () {
        dataAddDiaDiem()
    })
    //#endregion Xử lý tọa độ, vị trí bản đồ

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
        if (checkEmptyBlank(diTichId)) {
            return;
        }

        try {
            const res = await fetch(`/api/DiTichApi/ChiTiet/${diTichId}`, {
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
                let v = data.value;
                // Ảnh đại diện
                if (v.anhDaiDien) {
                    $("#previewAnhDaiDien").attr("src", v.anhDaiDien);
                }

                $('#urlAnhDaiDien').val(v.anhDaiDien || "");

                // Mã di tích
                $("#maDiTich").val(v.maDinhDanh || "");
                // Cấp xếp hạng
                $("#capXepHang").val(v.xepHangID).trigger("change");
                // Ngày công nhận
                $("#ngayCongNhan").val(v.ngayCongNhan ? formatShortDate(v.ngayCongNhan) : '');
                // Tình trạng
                $("#tinhTrang").val(v.trangThaiID).trigger("change");
                // Đơn vị quản lý
                $("#donViQuanLy").val(v.toChucQuanLyID).trigger("change");
                // Loại hình di tích
                $("#loaiHinhDiTich").val(v.loaiHinhID).trigger("change");
                // Thứ tự
                $("#thuTu").val(v.thuTu || 1);

                // Trạng thái (radio)
                if (v.suDung == 1) {
                    $("#trangThaiDuyet").prop("checked", true);
                } else {
                    $("#trangThaiChuaDuyet").prop("checked", true);
                }
                translations = v.banDich
                var tiengViet = translations.find(el => el.maNgonNgu === 'vi') || null
                if(tiengViet != null)
                $("#ngonNgu").val('vi').trigger('change');
                $("#tenDiTich").val(tiengViet.tenDiTich);
                $("#tenGoiKhac").val(tiengViet.tenGoiKhac);
                $("#nienDai").val(tiengViet.nienDai);
                ckeditormoTaDiTich.setData(tiengViet.moTaDiTich || '');

                // Địa điểm
                if (v.diaDiemID) {
                    let listDiaDiem = v.diaDiemID.split(',').map(x => x.trim().toLowerCase());
                    $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                    initTableDiaDiem(listDiaDiem);
                }

            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenDiTich = $("#tenDiTich").val().trim();
        let tenGoiKhac = $("#tenGoiKhac").val().trim();
        let nienDai = $("#nienDai").val().trim();
        let moTaDiTich = ckeditormoTaDiTich.getData().trim();

        if (!maNgonNgu || !tenDiTich) return; // bắt buộc chọn ngôn ngữ và nhập tên di tích

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.tenDiTich = tenDiTich;
            exist.tenGoiKhac = tenGoiKhac;
            exist.nienDai = nienDai;
            exist.moTaDiTich = moTaDiTich;
        } else {
            translations.push({
                maNgonNgu: maNgonNgu,
                tenDiTich: tenDiTich,
                tenGoiKhac: tenGoiKhac,
                nienDai: nienDai,
                moTaDiTich: moTaDiTich
            });
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenDiTich, #tenGoiKhac, #nienDai, #coSoVatChatChinh, #coSoVatChatKhac, #chuongTrinhTraiNghiem")
        .on("blur", function () {
            saveTempTranslation();
        });

    // Sự kiện blur cho CKEditor
    ckeditormoTaDiTich.on('blur', function () {
        saveTempTranslation();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenDiTich").val(exist.tenDiTich);
            $("#tenGoiKhac").val(exist.tenGoiKhac);
            $("#nienDai").val(exist.nienDai);
            ckeditormoTaDiTich.setData(exist.moTaDiTich || '');
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenDiTich").val("");
            $("#tenGoiKhac").val("");
            $("#nienDai").val("");
            ckeditormoTaDiTich.setData('');
        }
    });


    $("#btn-save").on("click", function (e) {
        e.preventDefault();

        saveTempTranslation();
        if ($("#formTrungTu").is(":visible")) {
            dataAddTrungTu()
        }
        let flagName = translations.some(t => checkEmptyBlank(t.tenDiTich)); // Tên bắt buộc phải có
        if (flagName) {
            showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
            return;
        }
        dataAdd();
    });

    $("#btn-save-and-close").on("click", function (e) {
        e.preventDefault();
        saveTempTranslation();
        let flagName = translations.some(t => checkEmptyBlank(t.tenDiTich)); // Tên bắt buộc phải có
        if (flagName) {
            showNotification(0, "Vui lòng nhập đầy đủ thông tin bắt buộc cho các bản dịch đã nhập")
            return;
        }
        //translations = translations.filter(t => t.tenDiTich && t.tenDiTich.trim() !== ""); // loại bỏ các bản dịch không có tên)
        dataAdd(true);
    });
       
    async function dataAdd(isReturn) {
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let maDiTich = $('#maDiTich').val()?.trim() || null;
        let loaiHinhDiTich = $('#loaiHinhDiTich').val() || null;
        let capXepHang = $('#capXepHang').val() || null;
        let ngayCongNhan = $('#ngayCongNhan').val()?.trim() || null;
        let tinhTrang = $('#tinhTrang').val() || null;
        let donViQuanLy = $('#donViQuanLy').val() || null;
        let thuTu = $('#thuTu').val() || 1;
        let trangThai = $("input[name='trangThai']:checked").val();
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null
        let DiaDiemID = $('#DiaDiemCoSanAdd').val() || null

        var tenTiengViet = translations.find(el => el.maNgonNgu === 'vi')?.tenDiTich || null
        if (translations?.length <= 0 || tenTiengViet == null 
            || (anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien))
            || checkEmptyBlank(loaiHinhDiTich)
            || checkEmptyBlank(ngayCongNhan)
            || checkEmptyBlank(donViQuanLy)){
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        let thongTinChung = {
            diTichID: diTichId || "00000000-0000-0000-0000-000000000000",
            maDinhDanh: maDiTich,
            anhDaiDien: urlAnhDaiDien,
            xepHangID: capXepHang,
            ngayCongNhan: ngayCongNhan != null ? formatDateToSearch(ngayCongNhan) : null,
            trangThaiID: tinhTrang,
            toChucQuanLyID: donViQuanLy,
            loaiHinhID: loaiHinhDiTich,
            thuTu: thuTu,
            diaDiemID: DiaDiemID,
            suDung: trangThai == "1" ? true : false,
        };

        let formData = new FormData()
        formData.append("DiTich", JSON.stringify(thongTinChung));
        formData.append("DiTich_NoiDung", JSON.stringify(translations));

        if (anhDaiDien != null) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        if (checkEmptyBlank(diTichId)) {
            try {
                const res = await fetch('/api/DiTichApi/ThemMoi', {
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
                    diTichId = data.value.diTichID
                    if (isReturn == true) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/DiSanVanHoaVatThe#di-tich';
                        }, 2000)
                        return;
                    }
                    initTableDaPhuongTien(diTichId);
                    initTableTrungTu(diTichId);
                    initTableVanBanTaiLieu(diTichId);
                    initTableTLTT()
                    initThongTinChung()
                    reloadAccess()
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/DiTichApi/ChinhSua/${diTichId}`, {
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
                    if (isReturn == true) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/DiSanVanHoaVatThe#di-tich';
                        }, 2000)
                        return;
                    }
                    diTichId = data.value.diTichID
                    reloadAccess()
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
            $("#showhinhAnhDPT").attr("src","");
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

    $('#btnAddDaPhuongTien').on('click',  function () {
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
        if (diTichId == null || diTichId == guidEmpty) {
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
            DoiTuongSoHuuID: diTichId,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "VH_DiTich",
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
        if (diTichId == null || diTichId == guidEmpty) {
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
        formData.append("doiTuongSoHuuID", diTichId);
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

    //#region TRÙNG TU DI TÍCH

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslationTT() {
        let maNgonNgu = $("#ngonNguTT").val();
        let congViec = $("#congViecTT").val()?.trim();
        let toChucThucHien = $("#toChucThucHienTT").val()?.trim();
        let thoiGian = $("#thoiGianTT").val()?.trim();
        let mucDich = $("#mucDichTT").val()?.trim();
       
        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let exist = translationsTT.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.congViec = congViec;
            exist.toChucThucHien = toChucThucHien;
            exist.thoiGian = thoiGian;
            exist.mucDich = mucDich;
        } else {
            translationsTT.push({
                maNgonNgu: maNgonNgu,
                congViec: congViec,
                toChucThucHien: toChucThucHien,
                thoiGian: thoiGian,
                mucDich: mucDich
            });
        }
        console.log("Lưu tạm:", translationsTT);
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#congViecTT, #toChucThucHienTT, #thoiGianTT, #mucDichTT")
        .on("blur", function () {
            console.log('Blur và lưu tạm')
            saveTempTranslationTT();
        });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguTT").on("change", function () {
        let maNgonNgu = $(this).val();

        let exist = translationsTT.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            $("#congViecTT").val(exist.congViec)
            $("#toChucThucHienTT").val(exist.toChucThucHien)
            $("#thoiGianTT").val(exist.thoiGian)
            $("#mucDichTT").val(exist.mucDich)
        } else {
            $("#congViecTT").val("")
            $("#toChucThucHienTT").val("")
            $("#thoiGianTT").val("")
            $("#mucDichTT").val("")
        }
        console.log("Sau khi đổi ngôn ngữ:", translationsTT);
    });

    function toggleForm(isShow) {
        if (isShow) {
            // Hiện form thêm/sửa 
            $("#formTrungTu").show();
            $("#danhSachTrungTu").hide();
            $("#btnAction").hide();

        } else {
            translationsTT = [];
            // Chỉ reset vùng inputs của form chính
            const $form = $("#formInputs_TT");
            $form.find('input[type=text], input[type=number], input[type=file], textarea').val('');
            $form.find('select').val('vi').trigger('change');
            $form.find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);

            // Ẩn form thông tin chung + tài liệu truyền thông, hiện danh sách
            $("#formTrungTu").hide();
            $("#danhSachTrungTu").show();
            $("#btnAction").show();
        }
        scrollTop();
    }
    $("#btnAddTrungTu").on('click', function () {
        toggleForm(true)
        $('#dataGridTLTT').DataTable().ajax.reload();
    })
    $("#btnCancelTrungTu").on('click', function () {
        toggleForm(false)
        $('#dataGridTLTT').DataTable().ajax.reload();
    })
    async function initTableTrungTu(id) {
        const tableApi = {
            url: `${baseUrl}/api/TrungTuDiTichApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    diTichID: id || guidEmpty,
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    banDichTT = data.value
                    return data.value.filter(e => e.maNgonNgu == 'vi');
                }
                return [];
            },
        };

        const tableDefs = [
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
            { "data": "congViec", "width": "", "class": "left-align" },
            { "data": "toChucThucHien", "width": "15%", "class": "left-align" },
            { "data": "thoiGian", "width": "15%", "class": "left-align" },
            { "data": "mucDich", "width": "20%", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        initDataTableConfigNoSearch('dataGridTrungTu', tableApi, tableDefs, tableCols);

        $('#dataGridTrungTu tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridTrungTu').DataTable().row(id).data();

            $("#idTT").val(data.id)
            console.log("data edit tt:", data);
            translationsTT = banDichTT.filter(f => f.lanTrungTu === data.lanTrungTu);
            
            let tiengViet = banDichTT.find(t => t.maNgonNgu === 'vi' && t.lanTrungTu == data.lanTrungTu);
            $("#congViecTT").val(tiengViet.congViec || '');
            $("#toChucThucHienTT").val(tiengViet.toChucThucHien || '');
            $("#thoiGianTT").val(tiengViet.thoiGian || '');
            $("#mucDichTT").val(tiengViet.mucDich || '');

            // reload lại file tài liệu trùng tu
            $('#dataGridTLTT').DataTable().ajax.reload();
            toggleForm(true)
        });
        $('#dataGridTrungTu tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridTrungTu').DataTable().row(id).data();

            $('#idDelete').val(data.lanTrungTu);
            $('#nameDelete').text(`${data.congViec}`);
            $('#idTypeDelete').val(2);

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

    $('#btnSaveTT').on('click', async function (e) {
        e.preventDefault();

        translationsTT = translationsTT.filter(t => !checkEmptyBlank(t.congViec)
            && !checkEmptyBlank(t.toChucThucHien)
            && !checkEmptyBlank(t.thoiGian)
            && !checkEmptyBlank(t.mucDich)
        );
        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
            await dataAddTrungTu()
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
    async function dataAddTrungTu() {
        if (diTichId == null || diTichId == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin di tích trước khi thêm văn bản tài liệu')
            return;
        }
        let idTrungTu = $('#idTT').val()?.trim();
        let exist = translationsTT.find(t => t.maNgonNgu === 'vi');
        if (!exist) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        var lanTrungTu = $('#dataGridTrungTu').DataTable().rows().count();

        if (checkEmptyBlank(idTrungTu)) {
            lanTrungTu = lanTrungTu + 1;
        }

        translationsTT = translationsTT.map(item => ({
            ...item,
            diTichID: diTichId,
            lanTrungTu: lanTrungTu
        }));

        let formData = new FormData()
        formData.append("data", JSON.stringify(translationsTT));

        try {
            const res = await fetch('/api/TrungTuDiTichApi/ThemMoi', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value && data.value.length > 0) {
                translationsTT = []
                showNotification(1, 'Chỉnh sửa thành công')
                if (objTLTT?.length > 0) {
                    for (const item of objTLTT) {
                        item.doiTuongSoHuuID = data.value[0].id
                        dataAddTLTT(item)
                    }
                }
                $('#modalAddTrungTu').modal('hide');
                $('#dataGridTrungTu').DataTable().ajax.reload();

                toggleForm(false)
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    }
    async function dataDeleteTrungTu() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/TrungTuDiTichApi/Xoa/${id}/${diTichId}`, {
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
                $('#dataGridTrungTu').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    //Tài liệu đi kèm với thông tin trùng tu 
    async function initTableTLTT() {
        const tableApi = {
            url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    doiTuongSoHuuID: $('#idTT').val() || guidEmpty,
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
                    return html
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

        initDataTableConfigNoSearch('dataGridTLTT', tableApi, tableDefs, tableCols);

        $('#dataGridTLTT tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridTLTT').DataTable().row(id).data();
            console.log("data tl tt", data)
            $('#idTLTT').val(data.vanBanID);
            $('#modalAddTitleTT').text(`Chỉnh sửa văn bản trùng tu ${data.soKyHieu}`)

            if (data.duongDanFile) {
                data.duongDanFile.split(";").forEach(url => {
                    pondTLTT.addFile(`${baseUrl}/${url}`);
                })
                $("#duongDanFileTLTT").val(data.duongDanFile);
            }

            if (data.file && data.file.length > 0) {
                data.file.forEach(file => {
                    pondTLTT.addFile(file)
                });
            }

            $("#trichYeuTLTT").val(data.trichYeu || '');
            $("#soKyHieuTLTT").val(data.soKyHieu || '');
            $("#nguoiKyTLTT").val(data.nguoiKy || '');
            $("#noiDungTLTT").val(data.noiDung || '');
            $("#ngayBanHanhTLTT").val(data.ngayBanHanh != null ? formatShortDate(data.ngayBanHanh) : "");
            $("#ngayHieuLucTLTT").val(data.ngayHieuLuc != null ? formatShortDate(data.ngayHieuLuc) : "");
            $("#coQuanBanHanhTLTT").val(data.coQuanBanHanhID || '').trigger('change');

            $('#modalAddTLTT').modal('show');
        });

        $('#dataGridTLTT tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridTLTT').DataTable().row(id).data();

            $('#idDelete').val(data.vanBanID);
            $('#nameDelete').text(`${data.trichYeu}`);
            $('#idTypeDelete').val(4);

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
    $('#btnSaveTLTT').on('click', function () {
        const id = $('#idTLTT').val()?.trim();

        if (id && !id.startsWith("temp_")) {
            var obj = createObjTLTT();
            console.log("obj tltt edit:", obj)
            dataAddTLTT(obj);
           
        } else {
            dataAddTLTT_Temp();
        }
    });

    // Thêm mới file tài liệu trùng tu tạm thời
    async function dataAddTLTT_Temp() {
        let idTLTT = $('#idTLTT').val()?.trim();
        let duongDanFileTLTT = $('#duongDanFileTLTT').val()?.trim();
        let fileTLTT = pondTLTT.getFiles();
        let soKyHieuTLTT = $('#soKyHieuTLTT').val()?.trim();
        let trichYeuTLTT = $('#trichYeuTLTT').val()?.trim();
        let nguoiKyTLTT = $('#nguoiKyTLTT').val()?.trim();
        let noiDungTLTT = $('#noiDungTLTT').val()?.trim();
        let coQuanBanHanhTLTT = $('#coQuanBanHanhTLTT').val();
        let ngayBanHanhTLTT = $('#ngayBanHanhTLTT').val();
        let ngayHieuLucTLTT = $('#ngayHieuLucTLTT').val();

        let idTrungTu = $('#idTT').val() // đối tượng sở hữu của tài liệu trùng tu

        if ((fileTLTT.length <= 0 && checkEmptyBlank(duongDanFileTLTT))
            || checkEmptyBlank(soKyHieuTLTT)
            || checkEmptyBlank(coQuanBanHanhTLTT)
            || checkEmptyBlank(ngayBanHanhTLTT)
            || checkEmptyBlank(ngayHieuLucTLTT)
            || checkEmptyBlank(trichYeuTLTT)) {

            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)');
            return;
        }

        if (fileTLTT.length > 0) {
            const invalidFiles = fileTLTT.some(f => {
                const fileExt = "." + f.file.name.split(".").pop().toLowerCase();
                return !allowedExtensions[4].includes(fileExt);
            });
            if (invalidFiles) {
                showNotification(0, `Có file không đúng định dạng!`);
                return false;
            }
        }

        let checkDate = validateFromToDates(ngayBanHanhTLTT, ngayHieuLucTLTT, "Ngày ban hành phải nhỏ hơn ngày có hiệu lực")
        if (!checkDate.valid) {
            showNotification(0, checkDate.message)
            return;
        }

        let urls = duongDanFileTLTT?.split(";")
        // lọc lại những phải không tồn tại trong đường dẫn
        let files = fileTLTT.filter(f => {
            return !urls.some(url => url.endsWith(f.file.name));
        }).map(f => f.file);

        // lọc lại đường dẫn loại bỏ những file không còn tồn tại trong filePond
        duongDanFileTLTT = urls.filter(url => {
            return fileTLTT.some(f => url.endsWith(f.file.name))
        })?.join(";");


        let obj = {
            vanBanID: idTLTT,
            doiTuongSoHuuID: idTrungTu,
            duongDanFile: duongDanFileTLTT,
            soKyHieu: soKyHieuTLTT,
            trichYeu: trichYeuTLTT,
            nguoiKy: nguoiKyTLTT,
            noiDung: noiDungTLTT,
            coQuanBanHanhID: coQuanBanHanhTLTT,
            ngayBanHanh: ngayBanHanhTLTT != "" ? formatDateToSearch(ngayBanHanhTLTT) : null,
            ngayHieuLuc: ngayHieuLucTLTT != "" ? formatDateToSearch(ngayHieuLucTLTT) : null,
            file: files
        };

        if (checkEmptyBlank(idTLTT)) {
            obj.vanBanID = `temp_${Date.now()}`; // id tạm để quản lý
            obj.stt = objTLTT.length + 1;
            obj.tenCoQuanBanHanh = $('#coQuanBanHanhTLTT option:selected').text();
            objTLTT.push(obj);
            // Thêm vào bảng
            $('#dataGridTLTT').DataTable().row.add(obj).draw(false);
            showNotification(1, 'Thêm mới thành công')
        } else {
            // Cập nhật lại nếu đã tồn tại - trùng vanBanID
            let existIndex = objTLTT.findIndex(e => e.vanBanID === idTLTT);
            if (existIndex !== -1) {
                objTLTT[existIndex] = obj;
                // Tìm dòng tương ứng trong DataTable và cập nhật
                let table = $('#dataGridTLTT').DataTable();
                let row = table.row(function (idx, data) {
                    return data.vanBanID === idTLTT;
                });

                if (row) {
                    row.data(obj).draw(false);
                }
            }
            showNotification(1, 'Chỉnh sửa thành công')
        }
       
        $('#modalAddTLTT').modal('hide');
    }
    async function dataDeleteTLTT() {
        let id = $('#idDelete').val();

        if (id && !id.startsWith("temp_")) {
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
                    $('#dataGridTLTT').DataTable().ajax.reload();
                    $('#modalDelete').modal('hide');
                } else {
                    console.log(data.error)
                }
            }
            catch (err) {
                showNotification(0, err.message)
            }
        } else {
            objTLTT = objTLTT.filter(e => e.id != id)
            $('#dataGridTLTT').DataTable().ajax.reload();
            $('#modalDelete').modal('hide');
        }
    }
    async function dataAddTLTT(obj) {
        let formData = new FormData();

        // Nếu vanBanID có chứa 'temp_' thì gán null
        if (obj.vanBanID && obj.vanBanID.toString().startsWith("temp_")) {
            obj.vanBanID = "";
        }

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];

                // Nếu null hoặc undefined thì append chuỗi rỗng để C# nhận null
                if (value === null || value === undefined) {
                    formData.append(key, "");
                }
                // Nếu là FileList hoặc mảng file
                else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                    value.forEach(f => formData.append(key, f));
                }
                // Nếu là File hoặc Blob đơn lẻ
                else if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                }
                // Nếu là object (Date, Guid, object con, …) thì stringify
                else if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                }
                // Primitive (string, number, bool)
                else {
                    formData.append(key, value);
                }
            }
        }

        try {
            let url = "";
            let method = "";

            if (checkEmptyBlank(obj.vanBanID)) {
                url = "/api/VanBanTaiLieuApi/ThemMoi";
                method = "POST";
            } else {
                url = `/api/VanBanTaiLieuApi/ChinhSua/${obj.vanBanID}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method: method,
                body: formData
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Cập nhật văn bản trùng tu thành công');
                $('#dataGridTLTT').DataTable().ajax.reload()
                $('#modalAddTLTT').modal('hide')
            } else {
                showNotification(0, data.error);
            }
        } catch (err) {
            console.error(err.message);
            showNotification(0, err.message);
        }
    }

    function createObjTLTT() {
        let idTLTT = $('#idTLTT').val();
        let duongDanFileTLTT = $('#duongDanFileTLTT').val()?.trim();
        let fileTLTT = pondTLTT.getFiles();
        let soKyHieuTLTT = $('#soKyHieuTLTT').val()?.trim();
        let trichYeuTLTT = $('#trichYeuTLTT').val()?.trim();
        let nguoiKyTLTT = $('#nguoiKyTLTT').val()?.trim();
        let noiDungTLTT = $('#noiDungTLTT').val()?.trim();
        let coQuanBanHanhTLTT = $('#coQuanBanHanhTLTT').val();
        let ngayBanHanhTLTT = $('#ngayBanHanhTLTT').val();
        let ngayHieuLucTLTT = $('#ngayHieuLucTLTT').val();

        let idTrungTu = $('#idTT').val() // đối tượng sở hữu của tài liệu trùng tu

        if ((fileTLTT.length < 0 && checkEmptyBlank(duongDanFileTLTT))
            || checkEmptyBlank(soKyHieuTLTT)
            || checkEmptyBlank(coQuanBanHanhTLTT)
            || checkEmptyBlank(ngayBanHanhTLTT)
            || checkEmptyBlank(ngayHieuLucTLTT)
            || checkEmptyBlank(trichYeuTLTT)) {

            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt');
            return;
        }

        if (fileTLTT.length > 0) {
            const invalidFiles = fileTLTT.some(f => {
                const fileExt = "." + f.file.name.split(".").pop().toLowerCase();
                return !allowedExtensions[4].includes(fileExt);
            });
            if (invalidFiles) {
                showNotification(0, `Có file không đúng định dạng!`);
                return false;
            }
        }

        let checkDate = validateFromToDates(ngayBanHanhTLTT, ngayHieuLucTLTT, "Ngày ban hành phải nhỏ hơn ngày có hiệu lực")
        if (!checkDate.valid) {
            showNotification(0, checkDate.message)
            return;
        }

        let urls = duongDanFileTLTT?.split(";")
        // lọc lại những phải không tồn tại trong đường dẫn
        let files = fileTLTT.filter(f => {
            return !urls.some(url => url.endsWith(f.file.name));
        }).map(f => f.file);

        // lọc lại đường dẫn loại bỏ những file không còn tồn tại trong filePond
        duongDanFileTLTT = urls.filter(url => {
            return fileTLTT.some(f => url.endsWith(f.file.name))
        })?.join(";");

        let obj = {
            vanBanID: idTLTT,
            doiTuongSoHuuID: idTrungTu, // id của trùng tu không phải di tích
            duongDanFile: duongDanFileTLTT,
            soKyHieu: soKyHieuTLTT,
            trichYeu: trichYeuTLTT,
            nguoiKy: nguoiKyTLTT,
            noiDung: noiDungTLTT,
            coQuanBanHanhID: coQuanBanHanhTLTT,
            ngayBanHanh: ngayBanHanhTLTT != "" ? formatDateToSearch(ngayBanHanhTLTT) : null,
            ngayHieuLuc: ngayHieuLucTLTT != "" ? formatDateToSearch(ngayHieuLucTLTT) : null,
            file: files
        };
        return obj;
    }

    $("#modalAddTLTT").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=number], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAddTitleTT').text('Thêm mới văn bản trùng tu')
        pondTLTT.removeFiles()

    });
    $("#modalAddTrungTu").on('hidden.bs.modal', function () {
        translationsTT = []
        $(this).find('input[type=text], input[type=number], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAddTitle').text('Thêm mới trùng tu')
    });
   
    //#endregion TRÙNG TU DI TÍCH

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

    async function initLoaiHinhDiTich() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 18,
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
                    $("#loaiHinhDiTich").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                    $("#capXepHang").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                    $("#coQuanBanHanhTLTT").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initDonViQuanLy() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 122,
                    maNgonNgu: 'vi'
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#donViQuanLy").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initTinhTrangDiTich() {
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
                    $("#tinhTrang").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
        if (checkEmptyBlank(diTichId)) {
            $("#thong-tin-dia-diem-tab").closest("li").hide();
            $("#thong-tin-da-phuong-tien-tab").closest("li").hide();
            $("#thong-tin-trung-tu-tab").closest("li").hide();
            $("#van-ban-tai-lieu-tab").closest("li").hide();
        } else {
            $("#thong-tin-dia-diem-tab").closest("li").show();
            $("#thong-tin-da-phuong-tien-tab").closest("li").show();
            $("#thong-tin-trung-tu-tab").closest("li").show();
            $("#van-ban-tai-lieu-tab").closest("li").show();
        }
        scrollTop()
    }
    //#endregion

    //#region binding event
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        let target = $(e.target).attr("href");
        console.log("Tab vừa được hiển thị:", target);

        if (target === "#thong-tin-chung" || target === "#thong-tin-da-phuong-tien"
            || target === "#van-ban-tai-lieu" || target === "#thong-tin-dia-diem") {
            $("#btnAction").show();
        } else if (target == "#thong-tin-trung-tu") {
            if ($("#formTrungTu").is(":visible")) {
                $("#btnAction").hide();
            } else {
                $("#btnAction").show();
            }
        }
    });
    //#endregion binding event
})

//#region Function Xử lý thông tin tọa độ, vị trí bản đồ
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}
//endregion Function Xử lý thông tin tọa độ, vị trí bản đồ

