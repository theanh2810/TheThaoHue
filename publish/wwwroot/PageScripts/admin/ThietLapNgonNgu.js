const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
   
    (async function () {
        await initNgonNgu();
        initTable();
    })();

    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val("");
        $('#ngon-ngu-search').val(-1).trigger('change');
        initTable()
    });


    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/ThietLapNgonNguApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || null
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
            //{
            //    targets: 6,
            //    render: function (data, type, row, meta) {
            //        if (row.lockoutEnabled == 0) {
            //            return `<span class='TrangThai green-text'>Đã xác thực</span>`;
            //        }
            //        else if (row.lockoutEnabled == 1) {
            //            return `<span class='TrangThai red-text'>Chưa xác thực</span>`; 
            //        }
            //    }
            //},
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.4" d="M3.26538 21.9613L3.54536 21.9686C5.6032 22.0224 6.63212 22.0493 7.56806 21.6837C8.504 21.3182 9.25287 20.5969 10.7506 19.1543L19.655 10.5779L13.5 4.5L4.78943 13.9445C3.57944 15.2555 2.97444 15.9109 2.62371 16.7182C2.27297 17.5255 2.20301 18.4235 2.06308 20.2197L2.03608 20.5662C1.98636 21.2043 1.9615 21.5234 2.14359 21.73C2.32567 21.9367 2.63891 21.9449 3.26538 21.9613Z" fill="#FFB900"></path>
                                        <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                        <path d="M13 4L20 11" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                        <path d="M14 22H22" stroke="#FFB900" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.4" d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5H19.5Z" fill="#E31400"></path>
                                        <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                        <path d="M21 5.5H3" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                        <path d="M16.0575 5.5L15.3748 4.09173C14.9213 3.15626 14.6946 2.68852 14.3035 2.39681C14.2167 2.3321 14.1249 2.27454 14.0288 2.2247C13.5957 2 13.0759 2 12.0363 2C10.9706 2 10.4377 2 9.99745 2.23412C9.89986 2.28601 9.80675 2.3459 9.71906 2.41317C9.3234 2.7167 9.10239 3.20155 8.66037 4.17126L8.05469 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                        <path d="M9.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                        <path d="M14.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                    </svg>
                                </i>`
                    }

                    return html
                }
            }
        ];
1576
        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "khoa", "width": "13%", "class": "left-align" },
            { "data": "giaTriDich", "class": "left-align" },
            { "data": "maNgonNgu", "width": "19%", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        $('#dataGrid tbody').on('click', '.edit-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idThietLap').val(data.id);
            $("#tuKhoaAdd").val(data.khoa);
            $('#giaTriDichAdd').val(data.giaTriDich);
            $('#selectNgonNguAdd').val(data.maNgonNgu).trigger('change');
            $('#moTaAdd').val(data.moTa);
           
            $('#modalAdd').modal('show');
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.id);
            $('#nameDelete').text(`${data.khoa}`);

            $('#modalDelete').modal('show');
        });  
       
    }

    document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            initTable()
        }
    });
    
    $("#formAdd").on("submit", function (e) {
        e.preventDefault();
        dataAdd();
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataAdd() {
        let id = $('#idThietLap').val();
        let tuKhoa = $('#tuKhoaAdd').val();
        let giaTriDich = $('#giaTriDichAdd').val();
        let maNgonNgu = $("#selectNgonNguAdd").val()
        let moTa = $('#moTaAdd').val();

        if (checkEmptyBlank(tuKhoa) || checkEmptyBlank(giaTriDich) || checkEmptyBlank(maNgonNgu)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)')
            return;
        }

        let dt = {
            "Khoa": tuKhoa.trim(),
            "GiaTriDich": giaTriDich.trim(),
            "MaNgonNgu": maNgonNgu,
            "MoTa": moTa.trim()
        };

        if (checkEmptyBlank(id)) {
            try {
                const res = await fetch('/api/ThietLapNgonNguApi/ThemMoi', {
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
                    $('#dataGrid').DataTable().ajax.reload(null, false);
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                showNotification(0, err.message)
            }
        } else {
            try {
                dt.id = parseInt(id);
                const res = await fetch(`/api/ThietLapNgonNguApi/ChinhSua/${id}`, {
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
                showNotification(0, err.message)
            }
        }
    }
   
    // reset modal
    $("#modalAdd").on('hide.bs.modal', function () {
        $(this).find('input, textarea').val('');
        $(this).find('select').val('').trigger('change');
    });

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/ThietLapNgonNguApi/Xoa/${id}`, {
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
                showNotification(0, data.error)
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
                $("#ngon-ngu-search").empty();
                $("#selectNgonNguAdd").empty();
                $("#ngon-ngu-search").append(`<option value="">Tất cả</option>`);
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu}">${lang.tenNgonNgu}</option>`);
                    $("#selectNgonNguAdd").append(`<option value="${lang.maNgonNgu}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngon-ngu-search").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };
})