const baseUrl = getRootLink();

$(function () {

    initSelect2();
    loadTable();
    loadDanhSachMenuNodeLa();

    function loadTable() {
        const tableData = {
            url: `${baseUrl}/api/AccountApi/GetAllRoles`,
            type: "Get",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            dataSrc: function (data) {
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        data[i].stt = i + 1
                    }
                    return data;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return `<span class="detail-command-btn cursor-pointer" id=n-"${meta.row}">${data}</span>`;
                }
            },
        ];

        const tableCols = [
            { "data": "stt", "width": "5%", "class": "center-align" },
            { "data": "name", "width": "25%", "class": "left-align" },
            { "data": "roleDescription", "width": "70%", "class": "center-align" },
        ];

        initDataTableDashboardConfig('dataGrid', tableData, tableDefs, tableCols)

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#tenRole').text(data.name);
            hienThiMenuPhanQuyen(data.name)
        })
    }

    $("#formAdd").submit(function (e) {
        e.preventDefault();
        dataAdd();
    });
    $("#modalAdd").on('hide.bs.modal', function () {
        $('#select_choPhepSua_Add').val(1).trigger('change')
        $('#select_choPhepXoa_Add').val(1).trigger('change')
        $('#select_choPhepDuyet_Add').val(1).trigger('change')
    })
 
    $('#btn-sua').on('click', async function () {
        let id = $('#permissionIdEdit').val();
        let rolename = $('#tenRole').text();
        let permitedDelete = $('#permitedEdit').val();
        let permitedEdit = $("#permitedDelete").val()
        let permitedApprove = $('#permitedApprove').val();
        let menuid = $('#menuidEdit').val();

        let dt = {
            Id : id,
            RoleName: rolename,
            MenuId: menuid,
            PermitedEdit: permitedEdit === "1" ? true : false,
            PermitedDelete: permitedDelete === "1" ? true : false,
            PermitedApprove: permitedApprove === "1" ? true : false
        }

        try {
            const res = await fetch('/api/AdminMenuApi/UpdateMenuPermission', {
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
            showNotification(1, 'Cập nhật phân quyền menu thành công')
            hienThiMenuPhanQuyen(rolename)
        }
        catch (err) {
            showNotification(0, err.message)
        }
    })
    $('#btn-xoa').on('click', async function () {
        let id = $('#permissionIdEdit').val();
        let rolename = $('#tenRole').text();

        try {
            const res = await fetch('/api/AdminMenuApi/DeleteMenuPermission/' + id, {
                method: 'DELETE'
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Xóa phân quyền menu thành công')
            hienThiMenuPhanQuyen(rolename)
            $('#data-details').addClass('hidden');
        }
        catch (err) {
            showNotification(0, err.message)
        }
    })
    async function dataAdd() {
        let rolename = $('#tenRole').text();
        let permitedEdit = $("#select_choPhepSua_Add").val()
        let permitedDelete = $('#select_choPhepXoa_Add').val();
        let permitedApprove = $('#select_choPhepDuyet_Add').val();
        let menuid = $('#select_Menu_Add').val();

        let dt = {
            RoleName: rolename,
            MenuId: menuid,
            PermitedEdit: permitedEdit === "true" ? true : false,
            PermitedDelete: permitedDelete === "true" ? true : false,
            PermitedApprove: permitedApprove === "true" ? true : false
        }

        try {
            const res = await fetch('/api/AdminMenuApi/AddMenuPermission', {
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
            showNotification(1, 'Thêm mới phân quyền menu thành công')
            $('#modalAdd').modal('hide');
            hienThiMenuPhanQuyen(rolename)
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    async function hienThiMenuPhanQuyen(rolename) {
        var data = await loadDanhSachMenuTheoRole(rolename)

        $(() => {
            $('#simple-treeview').dxTreeView({
                items: data,
                dataStructure: 'plain',
                parentIdExpr: 'parentId',
                keyExpr: 'id',
                displayExpr: 'title',
                width: 300,
                onItemClick(e) {
                    const item = e.itemData;
                    if (item.permitedEdit != null && item.permitedDelete != null && item.permitedApprove != null) {
                        $('#data-details').removeClass('hidden');
                        $('#permitedEdit').val(item.permitedEdit ? 1 : 0).trigger('change');
                        $('#permitedDelete').val(item.permitedDelete ? 1 : 0).trigger('change');
                        $('#permitedApprove').val(item.permitedApprove ? 1 : 0).trigger('change');

                        $('#menuidEdit').val(item.id);
                        $('#permissionIdEdit').val(item.permissionId);
                    } else {
                        $('#data-details').addClass('hidden');
                    }
                },
            });
        });
    }

    async function loadDanhSachMenuTheoRole(rolename) {
        try {
            const res = await fetch(`/api/AdminMenuApi/DanhSachMenuTheoRole/${rolename}`, {
                method: 'Get'
            })
            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            var data = await res.json()

            $("#show_ThemMoi").empty();
            $("#show_ThemMoi").append(`<button style="float: right; margin-right: 10px" type="button" class="btn btn-success" data-toggle="modal" data-target="#modalAdd">Thêm mới</button>`)

            return data
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function loadDanhSachMenuNodeLa(rolename) {
        try {
            const res = await fetch(`/api/AdminMenuApi/DanhSachNodeLa`, {
                method: 'Get'
            })
            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            var data = await res.json()

            $('#select_Menu_Add').empty();
            for (let i = 0; i < data.length; i++) {
                $('#select_Menu_Add').append(`<option value="${data[i].id}">${data[i].title}</option>`)
            }

            return data
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
})