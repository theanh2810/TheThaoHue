const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initTable();

    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val("");
        $('#ngon-ngu-search').val("").trigger('change');
        initTable()
    });

    //$('.search-icon').on('click', function () {
    //    initTable()
    //});

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/NgonNguApi/DanhSach`,
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
                    data.value = data.value.filter(item => item.maNgonNgu != 'vi')
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
                targets: 4,
                render: function (data, type, row, meta) {
                    if (row.trangThai == false || row.trangThai == 0) {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                    else if (row.trangThai == true || row.trangThai == 1) {
                        return `<i class="hgi-icon hgi-check"></i>`; 
                    }
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    }
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "maNgonNgu", "class": "left-align" },
            { "data": "tenNgonNgu", "width": "33%", "class": "center-align" },
            { "data": "thuTu", "width": "19%", "class": "center-align" },
            { "data": "trangThai", "width": "19%", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        $(".New_Table .dt-search input").prependTo(".New_Table .group-button").addClass("search-icon").attr("style", "width: 350px;")
        $(".New_Table .dt-search label").remove()

        $('#dataGrid tbody').on('click', '.edit-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idNgonNgu').val(data.ngonNguID);
            $("#maNgonNguAdd").val(data.maNgonNgu);
            $('#tenNgonNguAdd').val(data.tenNgonNgu);
            $(`input[name="trangThaiAdd"][value=${data.trangThai ? '1' : '0'}]`).prop('checked', true);
            $('#thuTuAdd').val(data.thuTu);

            $('#modalAddTitle').text(`Chỉnh sửa ngôn ngữ ${data.tenNgonNgu}`)

            $('#modalAdd').modal('show');
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.ngonNguID);
            $('#nameDelete').text(`${data.tenNgonNgu}`);

            $('#modalDelete').modal('show');
        });  
    }

    document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            initTable()
        }
    });
    
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        
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
        let id = $('#idNgonNgu').val();
        let maNgonNgu = $('#maNgonNguAdd').val();
        let tenNgonNgu = $('#tenNgonNguAdd').val();
        let trangThai = $("input[name='trangThaiAdd']:checked").val()
        let thuTu = $('#thuTuAdd').val();

        if (checkEmptyBlank(maNgonNgu) || checkEmptyBlank(tenNgonNgu) || checkEmptyBlank(trangThai)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)')
            return;
        }

        let dt = {
            "MaNgonNgu": maNgonNgu?.trim(),
            "TenNgonNgu": tenNgonNgu?.trim(),
            "TrangThai": trangThai == "1" ? true : false,
            "ThuTu": Number(thuTu || 0) > 0 && Number(thuTu || 0) <= 255 ? Number(thuTu) : 1
        };

        if (checkEmptyBlank(id)) {
            try {
                const res = await fetch('/api/NgonNguApi/ThemMoi', {
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
                const res = await fetch(`/api/NgonNguApi/ChinhSua/${id}`, {
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
        $('#modalAddTitle').text('Thêm mới ngôn ngữ')
        $(this).find('input[type=text], textarea').val('');
        $(this).find('input[type=number]').val('1');
        $(this).find('select').val('').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/NgonNguApi/Xoa/${id}`, {
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
})
