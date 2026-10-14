const baseUrl = getRootLink();

$(document).ready(function () {
    let dataTable = []
    let dataToChuc = []

    let toChucCache = [];
    let phuongXaCache = [];

    initSelect2();
    getRolesSelect();

    // Đợi load xong danh mục phường xã và tổ chức rồi mới hiển thị danh sách người dùng
   

    async function main() {
        await Promise.all([getPhuongXaSelect(), getToChucSelect()]);
        displayUser();
    }
    main();
    
    //#region Toggle Tổ chức / Phường xã
    function toggleLoaiDonVi(prefix) {
        // prefix: 'Add' hoặc 'Edit'
        const loai = $(`input[name="loaiDonVi${prefix}"]:checked`).val();
        console.log(loai, "loai o day la gi")
        if (loai === 'phuongXa') {
            $(`#groupToChuc${prefix}`).addClass('d-none');
            $(`#groupPhuongXa${prefix}`).removeClass('d-none');
            // reset select tổ chức khi chuyển sang phường xã
            $(`#select_toChuc${prefix}`).val(null).trigger('change');
        } else {
            $(`#groupPhuongXa${prefix}`).addClass('d-none');
            $(`#groupToChuc${prefix}`).removeClass('d-none');
            // reset select phường xã khi chuyển sang tổ chức
            $(`#select_phuongXa${prefix}`).val(null).trigger('change');
        }
    }

    $('input[name="loaiDonViAdd"]').on('change', function () {
        toggleLoaiDonVi('Add');
    });

    $('input[name="loaiDonViEdit"]').on('change', function () {
        toggleLoaiDonVi('Edit');
    });

    // Load danh sách phường xã - API sẽ được bổ sung sau
    async function getPhuongXaSelect() {
        $('#select_phuongXaAdd').empty();
        $('#select_phuongXaEdit').empty();

        $('#select_phuongXaAdd').append(`<option value="" selected>---Chọn---</option>`);
        $('#select_phuongXaEdit').append(`<option value="" selected>---Chọn---</option>`);

        var maTinhHue = '4c83f134-1cbe-4854-8c51-3e3092e66709';

        try {
            // TODO: thay đổi endpoint/tham số cho đúng API phường xã của bạn
            const res = await fetch(`/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${maTinhHue}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
                //body: JSON.stringify({})
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                phuongXaCache = data.value;
                data.value.forEach(el => {
                    // TODO: chỉnh lại tên field (id, tên) cho đúng model phường xã
                    $('#select_phuongXaAdd').append(`<option value="${el.xaID}">${el.noiDung}</option>`);
                    $('#select_phuongXaEdit').append(`<option value="${el.xaID}">${el.noiDung}</option>`);
                });
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }
    //#endregion

    async function buildData() {
        let tuKhoa = $('#tu-khoa').val();
        let macoquan = $('#org-search').val();
        let trangthai = $('#stt-search').val();

        let request = {
            tuKhoa,
            macoquan,
            trangthai
        }

        $('#org-search').val(macoquan).trigger('change');
        $('#stt-search').val(trangthai).trigger('status');

        return request
    };

    $('#tim-kiem').on('click', async function () {
        displayUser()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa').val("");
        $('#org-search').val(-1).trigger('change');
        displayUser()
    });

    $('.showPassword').on('click', function () {
        let typeInput = $(this).parent().siblings('input.field-input').attr('type')
        if (typeInput === 'password') {
            $(this).parent().siblings('input.field-input').attr('type', 'text')
            $(this).removeClass('icon_fluent_eye_off_filled')
            $(this).addClass('icon_fluent_eye_filled')
        }
        else {
            $(this).parent().siblings('input.field-input').attr('type', 'password')
            $(this).removeClass('icon_fluent_eye_filled')
            $(this).addClass('icon_fluent_eye_off_filled')
        }
    });

    async function displayUser() {
        var param = await buildData();
        const tableData = {
            url: `${baseUrl}/api/AccountApi/GetAllUsersRoles?keyword=${param.tuKhoa}&macoquan=${param.macoquan == null ? '' : param.macoquan}&trangthai=${param.trangthai}`,
            type: "Post",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.length > 0) {
                    let dt = [];

                    console.log(data, "data user");

                    for (let i = 0; i < data.length; i++) {
                        data[i].user.stt = i + 1
                        data[i].user.toChuc = ""
                    }

                    data.forEach(e => {
                        //dataToChuc.forEach(org => {
                        //    if (e.user.orgUniqueCode === org.orgUniqueCode) {
                        //        e.user.toChuc = org.show
                        //    }
                        //});

                        if (e.user.organizationID != null) {
                            toChucCache.forEach(org => {
                                if (e.user.organizationID === org.toChucID) {
                                    console.log(org, "org trùng")
                                    e.user.toChuc = org.tenToChuc
                                }
                            });
                        }

                        if (e.user.phuongXaID != null) {
                            phuongXaCache.forEach(org => {
                                if (e.user.phuongXaID === org.xaID) {
                                    console.log(org, "px trùng")
                                    e.user.toChuc = org.noiDung
                                }
                            });
                        }

                        const abc = e.roles;
                        let ie = e.user;

                        ie.roles = abc;
                        dt.push(ie);
                    });

                    dataTable = dt;
                    return dt;
                }

                return [];
            },
        };

        const tableDefs = [
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return `<span class="break-word">${data}</span>`;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (row.lockoutEnabled == 0) {
                        return `<span class='TrangThai green-text'>Đã xác thực</span>`;
                    }
                    else if (row.lockoutEnabled == 1) {
                        return `<span class='TrangThai red-text'>Chưa xác thực</span>`;
                    }
                }
            },
            {
                targets: 7,
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
                                </i>
                                <i data-toggle="tooltip" title="Đổi mật khẩu" class="change-pass-command-btn text-green" id=n-"${meta.row}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.4" d="M12.75 16.5H11.25C10.0772 16.5 9.49082 16.5 9.08686 16.19C8.98286 16.1102 8.88977 16.0171 8.80997 15.9131C8.5 15.5092 8.5 14.9228 8.5 13.75C8.5 12.5772 8.5 11.9908 8.80997 11.5869C8.88977 11.4829 8.98286 11.3898 9.08686 11.31C9.49082 11 10.0772 11 11.25 11H12.75C13.9228 11 14.5092 11 14.9131 11.31C15.0171 11.3898 15.1102 11.4829 15.19 11.5869C15.5 11.9908 15.5 12.5772 15.5 13.75C15.5 14.9228 15.5 15.5092 15.19 15.9131C15.1102 16.0171 15.0171 16.1102 14.9131 16.19C14.5092 16.5 13.9228 16.5 12.75 16.5Z" fill="#1447E6"></path>
                                        <path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75334 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75334 2.5 12 2.5C15.8956 2.5 19.2436 4.84478 20.7095 8.2M21.5 5.5L21.025 8.675L18 8" stroke="#1447E6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                        <path d="M10 11V9.5C10 8.39543 10.8954 7.5 12 7.5C13.1046 7.5 14 8.39543 14 9.5V11M11.25 16.5H12.75C13.9228 16.5 14.5092 16.5 14.9131 16.19C15.0171 16.1102 15.1102 16.0171 15.19 15.9131C15.5 15.5092 15.5 14.9228 15.5 13.75C15.5 12.5772 15.5 11.9908 15.19 11.5869C15.1102 11.4829 15.0171 11.3898 14.9131 11.31C14.5092 11 13.9228 11 12.75 11H11.25C10.0772 11 9.49082 11 9.08686 11.31C8.98286 11.3898 8.88977 11.4829 8.80997 11.5869C8.5 11.9908 8.5 12.5772 8.5 13.75C8.5 14.9228 8.5 15.5092 8.80997 15.9131C8.88977 16.0171 8.98286 16.1102 9.08686 16.19C9.49082 16.5 10.0772 16.5 11.25 16.5Z" stroke="#1447E6" stroke-width="1.5" stroke-linejoin="round"></path>
                                    </svg>
                                </i>`;
                    }
                    if (permitedDelete) {
                        if (row.lockoutEnabled == 0) {
                            html += `<i data-toggle="tooltip" title="Khóa" class="lock-command-btn text-red" id=n-"${meta.row}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path opacity="0.4" d="M4.26782 18.8447C4.4927 20.515 5.87613 21.8235 7.55966 21.9009C8.97628 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97628 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26782 12.1553C4.12105 13.2453 4 14.3624 4 15.5C4 16.6376 4.12105 17.7547 4.26782 18.8447Z" fill="#E31400"></path>
                                            <path d="M12 16.5V14.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                            <path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97628 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.8789 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97628 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12105 13.2453 4 14.3624 4 15.5C4 16.6376 4.12105 17.7547 4.26781 18.8447Z" stroke="#E31400" stroke-width="1.5"></path>
                                            <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" stroke="#E31400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg>
                                    </i>`;
                        }
                        else if (row.lockoutEnabled == 1) {
                            html += `<i data-toggle="tooltip" title="Mở khóa" class="icon-fluent icon_fluent_lock_open_filled unlock-command-btn text-azure" id=n-"${meta.row}"></i>`;
                        }
                    }

                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "60px", "class": "center-align" },
            { "data": "userName", "width": "13%", "class": "left-align" },
            { "data": "displayName", "width": "16%", "class": "left-align" },
            { "data": "email", "width": "19%", "class": "left-align" },
            { "data": "toChuc", "width": "13%", "class": "left-align " },
            { "data": "roles", "width": "13%", "class": "left-align " },
            { "data": "", "width": "10%", "class": "center-align group-icon-action" },
            { "data": "", "width": "88px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableData, tableDefs, tableCols);
        saveDataTablePage('dataGrid', 'TaiKhoan');

        $('#dataGrid tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            try {
                const res = await fetch('/api/AccountApi/GetUserDetail/' + data.id, {
                    method: 'GET',
                })

                if (!res.ok) {
                    var errText = res.text();
                    throw new Error(errText);
                }

                var result = await res.json();

                console.log(result, "result detail")

                $("#ttcEdit").text(result.displayName);
                $('#tenTruyCapEdit').val(result.userName);
                $('#hoTenEdit').val(result.displayName);
                $('#hopThuEdit').val(result.email);

                //loai don vi
                if (result.organizationID != null) {
                    $("#loaiDonViToChucEdit").prop("checked", true).trigger("change");;
                    $('#select_toChucEdit').val(result.organizationID).trigger('change');
                }
                if (result.phuongXaID != null) {
                    $("#loaiDonViPhuongXaEdit").prop("checked", true).trigger("change");;
                    $('#select_phuongXaEdit').val(result.phuongXaID).trigger('change');
                }

                $('#select_vaiTroEdit').val(result.roles != null ? result.roles.split(',') : null).trigger('change');

                $('#modalEdit').modal('show');
            }
            catch (err) {
                showNotification(0, err.message)
            }
        });

        $('#dataGrid tbody').on('click', '.change-pass-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#ttcReset').text(data.displayName)
            $("#tenTruyCapReset").val(data.userName);

            $('#modalResetPass').modal('show');
        });

        $('#dataGrid tbody').on('click', '.lock-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#tenLock').text(data.displayName)
            $("#userNameLock").val(data.userName);

            $('#modalLock').modal('show');
        });
        $('#dataGrid tbody').on('click', '.unlock-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#tenUnLock').text(data.displayName)
            $("#userNameUnLock").val(data.userName);

            $('#modalUnLock').modal('show');
        });

        $('#select_vaiTroEdit').on('select2:unselect', async function (e) {
            let userName = $('#tenTruyCapEdit').val();

            var roleName = e.params.data.text;
            try {
                const res = await fetch(`/api/AccountApi/RemoveRoleFromAccount/${userName}/${roleName}`, {
                    method: 'DELETE'
                });

                if (!res.ok) {
                    var errText = res.text();
                    throw new Error(errText);
                }
            }
            catch (err) {
                showNotification(0, err.message)
            }
        });

        $('#select_vaiTroEdit').on('select2:select', async function (e) {
            let userName = $('#tenTruyCapEdit').val();

            var roleName = e.params.data.text;
            try {
                const res = await fetch(`/api/AccountApi/AddRoleToAccount/${userName}/${roleName}`, {
                    method: 'PUT'
                });

                if (!res.ok) {
                    var errText = res.text();
                    throw new Error(errText);
                }
            }
            catch (err) {
                showNotification(0, err.message)
            }
        });
    }

    document.getElementById("tu-khoa").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            displayUser()
        }
    });

    $("#formAdd").submit(function (e) {
        e.preventDefault();
        dataAdd();
    });

    $("#formEdit").submit(function (e) {
        e.preventDefault();
        dataEdit();
    });

    $("#formResetPass").submit(function (e) {
        e.preventDefault();
        dataResetPass();
    });

    $("#formLock").submit(function (e) {
        e.preventDefault();
        dataLock();
    });

    $("#formUnLock").submit(function (e) {
        e.preventDefault();
        dataUnLock();
    });

    async function dataAdd() {
        let tenTruyCap = $('#tenTruyCapAdd').val();
        let matKhau = $('#matKhauAdd').val();
        let hoTen = $("#hoTenAdd").val()
        let hopThu = $('#hopThuAdd').val();
        let toChuc = $('#select_toChucAdd').val();
        let phuongXa = $('#select_phuongXaAdd').val();
        let vaiTro = $('#select_vaiTroAdd').val();

        var isTrungTen = dataTable.filter(e => e.userName.toLowerCase() === tenTruyCap.trim().toLowerCase());
        if (checkEmptyBlank(tenTruyCap)) {
            $('#notifi_tenTruyCapAdd').removeClass("d-none");
            $('#notifi_tenTruyCapAdd').html('Vui lòng nhập thông tin!');
            $('#tenTruyCapAdd').focus();
            return;
        }
        else if (isTrungTen.length > 0) {
            $('#notifi_tenTruyCapAdd').removeClass("d-none");
            $('#notifi_tenTruyCapAdd').html('Tên truy cập đã tồn tại!');
            $('#tenTruyCapAdd').focus();
            return;
        }
        else {
            $('#notifi_tenTruyCapAdd').addClass('d-none');
        }

        if (checkEmptyBlank(matKhau)) {
            $('#notifi_matKhauAdd').removeClass("d-none");
            $('#notifi_matKhauAdd').html('Vui lòng nhập thông tin!');
            $('#matKhauAdd').focus();
            return;
        }
        else {
            $('#notifi_matKhauAdd').addClass('d-none');
        }

        if (checkEmptyBlank(hoTen)) {
            $('#notifi_hoTenAdd').removeClass("d-none");
            $('#notifi_hoTenAdd').html('Vui lòng nhập thông tin!');
            $('#hoTenAdd').focus();
            return;
        }
        else {
            $('#notifi_hoTenAdd').addClass('d-none');
        }

        //var isTrungEmail = dataTable.filter(e => e.email.toLowerCase() === hopThu.trim().toLowerCase());
        if (checkEmptyBlank(hopThu)) {
            $('#notifi_hopThuAdd').removeClass("d-none");
            $('#notifi_hopThuAdd').html('Vui lòng nhập thông tin!');
            $('#hopThuAdd').focus();
            return;
        }
        //else if (isTrungEmail.length > 0) {
        //    $('#notifi_hopThuAdd').removeClass("d-none");
        //    $('#notifi_hopThuAdd').html('* Hộp thư đã tồn tại');
        //    $('#hopThuAdd').focus();
        //    return;
        //}
        else {
            $('#notifi_hopThuAdd').addClass('d-none');
        }

        const dt = {
            "UserName": tenTruyCap.trim(),
            "Password": matKhau.trim(),
            "Email": hopThu.trim(),
            "DisplayName": hoTen.trim(),
            "OrganizationID": toChuc,
            "PhuongXaID": phuongXa,
            "Roles": vaiTro.toString()
        };

        try {
            const res = await fetch('/api/AccountApi/CreateNewAccount', {
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

            showNotification(1, 'Thêm mới người dùng thành công')
            $('#modalAdd').modal('hide');
            $('#dataGrid').DataTable().ajax.reload().draw();
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    async function dataEdit() {
        let tenTruyCap = $('#tenTruyCapEdit').val();
        let hoTen = $("#hoTenEdit").val()
        let hopThu = $('#hopThuEdit').val();
        let toChuc = $('#select_toChucEdit').val();
        let phuongXa = $('#select_phuongXaEdit').val();

        //var isTrungEmail = dataTable.filter(e => e.email.toLowerCase() === hopThu.trim().toLowerCase());
        if (checkEmptyBlank(hoTen)) {
            $('#notifi_hoTenEdit').removeClass("d-none");
            $('#notifi_hoTenEdit').html('Vui lòng nhập thông tin!');
            $('#hoTenEdit').focus();
            return;
        }
        else {
            $('#notifi_hoTenEdit').addClass('d-none');
        }

        if (checkEmptyBlank(hopThu)) {
            $('#notifi_hopThuEdit').removeClass("d-none");
            $('#notifi_hopThuEdit').html('Vui lòng nhập thông tin!');
            $('#hopThuEdit').focus();
            return;
        }
        //else if (isTrungEmail.length > 0) {
        //    $('#notifi_hopThuEdit').removeClass("d-none");
        //    $('#notifi_hopThuEdit').html('* Hộp thư đã tồn tại');
        //    $('#hopThuEdit').focus();
        //    return;
        //}
        else {
            $('#notifi_hopThuEdit').addClass('d-none');
        }

        const dt = {
            "UserName": tenTruyCap.trim(),
            "Email": hopThu.trim(),
            "DisplayName": hoTen.trim(),
            "OrganizationID": toChuc,
            "PhuongXaID": phuongXa
        };

        console.log(dt, "data edit");
        //return;

        try {
            const res = await fetch('/api/AccountApi/UpdateAccount', {
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

            showNotification(1, 'Cập nhật người dùng thành công')
            $('#modalEdit').modal('hide');
            $('#dataGrid').DataTable().ajax.reload(function () {
                setDataTablePage('dataGrid', 'TaiKhoan');
            });
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function dataResetPass() {
        let tenTruyCap = $('#tenTruyCapReset').val();
        let matKhau = $('#matKhauReset').val();

        const dt = {
            "UserName": tenTruyCap.trim(),
            "Password": matKhau.trim(),
        };

        try {
            const res = await fetch('/api/AccountApi/UpdateAccountPassword', {
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

            showNotification(1, 'Đổi mật khẩu người dùng thành công')
            $('#modalResetPass').modal('hide');
            $('#dataGrid').DataTable().ajax.reload(function () {
                setDataTablePage('dataGrid', 'TaiKhoan');
            });
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function dataLock() {
        let userName = $('#userNameLock').val();

        try {
            const res = await fetch(`/api/AccountApi/DisableUser/${userName}`, {
                method: 'POST'
            });

            if (!res.ok) {
                var errText = res.text();
                throw new Error(errText);
            }

            showNotification(1, 'Khóa tài khoản người dùng thành công')
            $('#modalLock').modal('hide');
            $('#dataGrid').DataTable().ajax.reload(function () {
                setDataTablePage('dataGrid', 'TaiKhoan');
            });
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function dataUnLock() {
        let userName = $('#userNameUnLock').val();

        try {
            const res = await fetch(`/api/AccountApi/ActiveUser/${userName}`, {
                method: 'POST'
            });

            if (!res.ok) {
                var errText = res.text();
                throw new Error(errText);
            }

            showNotification(1, 'Mở khóa tài khoản người dùng thành công')
            $('#modalUnLock').modal('hide');
            $('#dataGrid').DataTable().ajax.reload(function () {
                setDataTablePage('dataGrid', 'TaiKhoan');
            });
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset modal
    $("#modalAdd").on('hide.bs.modal', function () {
        $('#tenTruyCapAdd').val("");
        $('#hoTenAdd').val("");
        $('#hopThuAdd').val("");
        $('#matKhauAdd').val("");
        $('#select_toChucAdd').val(null).trigger('change');
        $('#select_phuongXaAdd').val(null).trigger('change');
        $('#select_vaiTroAdd').val(null).trigger('change');

        // reset về mặc định Tổ chức
        $('#loaiDonViToChucAdd').prop('checked', true);
        toggleLoaiDonVi('Add');

        $('#notifi_tenTruyCapAdd').addClass('d-none');
        $('#notifi_hoTenAdd').addClass('d-none')
        $('#notifi_hopThuAdd').addClass('d-none')
        $('#notifi_matKhauAdd').addClass('d-none')
    });

    $("#modalEdit").on('hide.bs.modal', function () {
        $('#notifi_tenTruyCapEdit').addClass('d-none');
        $('#notifi_hoTenEdit').addClass('d-none')
        $('#notifi_hopThuEdit').addClass('d-none')
        $('#notifi_matKhauEdit').addClass('d-none')

        $('#select_toChucEdit').val(null).trigger('change')
        $('#select_phuongXaEdit').val(null).trigger('change')
        $('#select_vaiTroEdit').val(null).trigger('change')

        // reset về mặc định Tổ chức
        $('#loaiDonViToChucEdit').prop('checked', true);
        toggleLoaiDonVi('Edit');
    });

    $("#modalResetPass").on('hide.bs.modal', function () {
        $('#notifi_matKhauReset').addClass('d-none')

        $('#matKhauReset').val('')
    });

    $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#tttDelete').text(`${data.typeName}`);
        $('#modalDelete').modal('show');
    });

    $("#formDelete").submit(function (e) {
        e.preventDefault();
        dataDelete();
    });

    function dataDelete() {
        let id = $('#idDelete').val();

        $.ajax({
            type: 'DELETE',
            async: false,
            url: `${baseUrl}/api/DataTypeApi/Delete?id=` + id,
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data.value != 0) {
                    showNotification(1, "Xóa kiểu dữ liệu thành công")
                    $('#modalDelete').modal('hide');
                    $('#dataGrid').DataTable().ajax.reload().draw();
                }
                else {
                    showNotification(3, 'Kiểu dữ liệu đang sử dụng, không thể xóa')
                }
            },
            error: function (err) {
                showNotification(0, 'Lỗi. Xóa thuộc tính thất bại')
            }
        });
    }

    async function getToChucSelect(callback) {
        $('#org-search').empty();
        $('#select_toChucAdd').empty();
        $('#select_toChucEdit').empty();

        $('#org-search').append(`<option value="">Tất cả</option>`);
        $('#select_toChucAdd').append(`<option value="" selected>---Chọn---</option>`);
        $('#select_toChucEdit').append(`<option value="" selected>---Chọn---</option>`);

        if (toChucCache != null && toChucCache.length > 0) {
            setToChucSelect(toChucCache)
        }
        else {
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
                    toChucCache = data.value;
                    setToChucSelect(toChucCache)
                } else {
                    toChucCache = [];
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    };

    function setToChucSelect(data) {
        data.forEach(el => {
            $("#select_toChucAdd").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
            $("#select_toChucEdit").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
            $("#org-search").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
        });
    }

    function getRolesSelect() {
        getDataWithApi('GET', `/api/AccountApi/GetAllRoles`)
            .then((data) => {
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (isAdmin) {
                            $('#select_vaiTroAdd').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                            $('#select_vaiTroEdit').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                        }
                        else {
                            if (data[i].name.toUpperCase() != "HOST" && data[i].name.toUpperCase() != "SYSTEMADMIN") {
                                $('#select_vaiTroAdd').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                                $('#select_vaiTroEdit').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                            }
                        }
                    }
                }
            })
    };
})