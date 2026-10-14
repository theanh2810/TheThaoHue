const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    // Áp dụng validation cho các trường inpu
    //initValidation();

    //function initValidation() {
    //    // Validation cho form Add vÃ  Edit
    //    CheckLengthEach('#tenDanhMucAdd, #tenDanhMucEdit', 255, null); // Giới hạn 255 ký tự cho tên danh mục  
    //    CheckLengthEach('#moTaAdd, #moTaEdit', 500, null);  // Giới hạn 500 ký tự cho mô tả
    //    CheckLengthEach('#thuTuAdd, #thuTuEdit', 10, null); // Giới hạn 10 ký tự cho thứ tự
    //}
    let translations = [];

    (async function () {
        await initNgonNgu();
        initTable();
    })();

    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val("");
        //$('#ngon-ngu-search').val('vi').trigger('change');
        //$('#trang-thai-search').val("-1").trigger('change');
        initTable()
    });


    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/DanhMucChungApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#trang-thai-search').val()
                return JSON.stringify({
                    loaiDanhMucID: loaiDanhMuc,
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    //maNgonNgu: $('#ngon-ngu-search').val() || null,
                    //trangThai: suDung == '-1' ? null : (suDung == "1" ? true : false)
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
            //{
            //    targets: 1,
            //    render: function (data, type, row, meta) {
            //        return `<span class="break-word">${data}</span>`;
            //    }
            //},
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    if (row.trangThai) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    }
                    return html
                }
            }
        ];
1576
        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "maSo", "width": "120px", "class": "left-align" },
            { "data": "tenDanhMuc", "width": "25%", "class": "left-align" },
            { "data": "moTaDanhMuc", "class": "left-align" },
            { "data": "thuTu", "width": "120px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        $('#dataGrid tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDanhMucAdd').val(data.danhMucID);
            $('#thuTuAdd').val(data.thuTu);
            $('#maSoAdd').val(data.maSo);
            $(`input[name="trangThaiAdd"][value=${data.trangThai ? "1" : "0"}]`).prop('checked', true);

            translations = []
            const res = await fetch(`/api/DanhMucChungApi/BanDich/${data.danhMucID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            let resultBanDich = await res.json();

            if (resultBanDich && resultBanDich.isSuccess && resultBanDich.value) {
                translations = resultBanDich.value
            } else {
                console.log(resultBanDich.error)
            }
            $('#ngonNguAdd').val('vi').trigger('change');

            $('#labelTenDanhMuc').html('Tên chức danh <span class="text-red">*</span>')
            $("#tenDanhMucAdd").attr("placeholder", "Nhập tên chức danh");
            $('#modalAddTitle').text(`Chỉnh sửa chức danh ${data.tenDanhMuc}`)
            $('#maSoHide').removeClass('d-none')
            $('#modalAdd').modal('show');
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.danhMucID);
            $('#nameDelete').text(`${data.tenDanhMuc}`);

            $('#modalDelete').modal('show');
        });  
       
    }

    document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            initTable()
        }
    });

    $('#openModalAdd').on("click", function () {
        $('#labelTenDanhMuc').html('Tên chức danh <span class="text-red">*</span>')
        $("#tenDanhMucAdd").attr("placeholder", "Nhập tên chức danh");
        $('#modalAddTitle').text("Thêm mới chức danh")
        $('#maSoHide').removeClass('d-none')

        $('#modalAdd').modal('show')
    });

    // hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslation() {
        let maNgonNgu = $("#ngonNguAdd").val();
        let ten = $("#tenDanhMucAdd").val().trim();
        let moTa = $("#moTaAdd").val().trim();

        if (!maNgonNgu || !ten) return; // chưa chọn ngôn ngữ hoăc không nhập tên thì bỏ qua

        // kiểm tra đã có ngôn ngữ này trong mảng chưa
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.ten = ten?.trim();
            exist.moTa = moTa?.trim();
        } else {
            translations.push({
                maNgonNgu: maNgonNgu,
                ten: ten.trim(),
                moTa: moTa.trim(),
            });
        }
        //console.log("Lưu tạm:", translations);
    }

    // sự kiện blur trên input
    $("#tenDanhMucAdd, #moTaAdd").on("blur", function () {
        saveTempTranslation();
    });

    // sự kiện đổi ngôn ngữ → blind lại dữ liệu
    $("#ngonNguAdd").on("change", function () {
        // nếu đã có dữ liệu cho ngôn ngữ vừa chọn thì bind lại vào form
        let maNgonNgu = $(this).val();
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            $("#tenDanhMucAdd").val(exist.ten);
            $("#moTaAdd").val(exist.moTa);
        } else {
            // reset nếu chưa nhập gì cho ngôn ngữ đó
            $("#tenDanhMucAdd").val("");
            $("#moTaAdd").val("");
        }
    });

    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();

        translations = translations.filter(t => t.ten && t.ten.trim() !== ""); // loại bỏ các bản dịch không có tên
        // Disable submit button để tránh spam
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');
        
        try {
            // Gọi function xử lý
            await dataAdd();
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

    $("#formDelete").on("submit", async function (e) {
        e.preventDefault();
        
        // Disable submit button để tránh spam
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');
        
        try {
            // Gọi function xử lý
            await dataDelete();
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

    async function dataAdd() {
        let maSo = $('#maSoAdd').val();
        let id = $('#idDanhMucAdd').val();
        let thuTu = $('#thuTuAdd').val();
        let trangThai = $("input[name='trangThaiAdd']:checked").val()

        // Validation cho các trường bắt buộc
        //const requiredFields = ['#tenDanhMucAdd'];
        //if (checkEmptyBlankV2(requiredFields)) {
        //    showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!')
        //    return; // Dừng nếu có trường trống
        //}

        //// Kiểm tra có lỗi validation từ CheckLengthEach hay không
        //if (checkFalseInput(requiredFields)) {
        //    showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!')
        //    return; // Dừng nếu có lỗi validation
        //}

        //if (checkEmptyBlank(trangThai)) {
        //    showNotification(0, 'Vui lòng chọn trạng thái!')
        //    return;
        //}

        var tenTiengViet = translations.find(el => el.maNgonNgu === 'vi')?.ten || null
        if (translations?.length <= 0 || tenTiengViet == null) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        let dt = {
            "LoaiDanhMucID": loaiDanhMuc != "" ? Number(loaiDanhMuc) : 0,
            "ThuTu": Number(thuTu || 0) > 0 && Number(thuTu || 0) <= 255 ? Number(thuTu) : 1,
			"MaSo": maSo?.trim(),
            "TrangThai": trangThai == "1" ? true : false,
            "ten": tenTiengViet,
            "DanhMucChung_NoiDungs": translations
        };

        if (checkEmptyBlank(id)) {
            try {
                const res = await fetch('/api/DanhMucChungApi/ThemMoi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dt)
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công')
                    translations = []

                    $('#dataGrid').DataTable().ajax.reload(null, false);
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                dt.DanhMucID = parseInt(id);
                const res = await fetch(`/api/DanhMucChungApi/ChinhSua/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dt)
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công')
                    $('#dataGrid').DataTable().ajax.reload(null, false);
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
   
    // reset modal
    $("#modalAdd").on('hide.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], textarea').val('');
        $(this).find('input[type=number]').val('1');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/DanhMucChungApi/Xoa/${id}`, {
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
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
          
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
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
                //$("#ngon-ngu-search").empty();
                $("#ngonNguAdd").empty();
                //$("#ngon-ngu-search").append(`<option value="">Tất cả</option>`);
                data.value.forEach(lang => {
                    //$("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase() }">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                //$("#ngon-ngu-search").val('vi').trigger('change');
                $("#ngonNguAdd").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };
})

