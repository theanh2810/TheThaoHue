const baseUrl = getRootLink();

$(function () {
    let treeViewDropdownBox;
    let dataLinhVuc = [];
    initSelect2();
    loadTable();
    loadDanhSachMenuNodeLa();
    const itemDropdownBoxRenderedHandler = (evt) => {
        const { itemData, itemElement } = evt;
        const [htmlElement] = itemElement;
        if (!itemData.isLeaf) {
            const checkBoxItem = htmlElement.parentNode.querySelector(".dx-checkbox");
            if (checkBoxItem) checkBoxItem.classList.add("dx-state-disabled");
            const treeViewItem =
                htmlElement.parentNode.querySelector(".dx-treeview-item");
            if (treeViewItem) treeViewItem.classList.add("dx-state-disabled");
        }
    };

    const syncTreeViewSelection = function (treeViewInstance, value) {
        if (!value) {
            treeViewInstance.unselectAll();
        } else {
            treeViewInstance.selectItem(value);
        }
    };

    const dropdownBox = $("#dropdownBox")
        .dxDropDownBox({
            items: [],
            valueExpr: "id",
            displayExpr: "title",
            placeholder: "Hãy chọn menu",
            showClearButton: true,
            //inputAttr: { "aria-label": "Owner" },
            elementAttr: {
                class: "form-control",
            },
            contentTemplate(e) {
                const $treeView = $("<div>").dxTreeView({
                    dataSource: e.component.getDataSource(),
                    dataStructure: "plain",
                    parentIdExpr: "parentId",
                    keyExpr: "id",
                    displayExpr: "title",
                    selectionMode: "single",
                    showCheckBoxesMode: "none",
                    selectNodesRecursive: false,
                    selectByClick: true,
                    onContentReady(args) {
                        const value = e.component.option("value");
                        syncTreeViewSelection(args.component, value);
                    },
                    onItemSelectionChanged(args) {
                        const selectedKeys = args.component.getSelectedNodeKeys();
                        e.component.option("value", selectedKeys);
                    },
                    onItemRendered: itemDropdownBoxRenderedHandler,
                });

                treeViewDropdownBox = $treeView.dxTreeView("instance");

                e.component.on("valueChanged", (args) => {
                    syncTreeViewSelection(treeViewDropdownBox, args.value);
                    e.component.close();
                });

                return $treeView;
            },
        })
        .dxDropDownBox("instance");


    fetch(`${baseUrl}/api/adminmenuapi/danhsachmenu`)
        .then((res) => res.json())
        .then((data) => {
            dropdownBox.option("items", data);
        })
        .catch((err) => {
            console.log(err);
        });

    const itemRenderedHandler = (evt) => {
        const { itemData, itemElement } = evt;
        const [htmlElement] = itemElement;
        if (!itemData.isPermission) {
            const checkBoxItem = htmlElement.parentNode.querySelector(".dx-checkbox");
            const treeViewItem =
                htmlElement.parentNode.querySelector(".dx-treeview-item");
            if (checkBoxItem) checkBoxItem.style.display = "none";
            if (treeViewItem) {
                treeViewItem.style.paddingLeft = "10px";
            }
        }
    };

    const treeViewPermission = $("#treeViewPermission")
        .dxTreeView({
            items: [],
            width: "100%",
            height: "100%",
            dataStructure: "plain",
            parentIdExpr: "parentId",
            keyExpr: "id",
            displayExpr: "title",
            selectedExpr: "hasPermission",
            showCheckBoxesMode: "normal",
            selectNodesRecursive: false,
            //collapseIcon: "minus",
            //expandIcon: "plus", 
            //expandIcon: "https://path/to/the/expand_icon.svg", 
            itemTemplate(item) {
                //console.log(item);
                if (item.isPermission) {
                    return `<span>${item.title}</span>`
                }
                const roleName = $('#tenRole').text();
                return `<div class='custom-treeview-item'><span>${item.title}</span><i class="icon-fluent icon_fluent_subtract_circle_regular del-node text-red" data-menuid='${item.id}' data-rolename='${roleName}'></i></div>`;
            },
            onItemRendered: itemRenderedHandler,
        })
        .dxTreeView("instance");


    async function loadTable() {
        await loadDanhSachLinhVuc()
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
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    let linhVuc = dataLinhVuc?.find(lv => lv.linhVucID === data)?.ten ?? "";
                    return `<span class="left-align">${linhVuc}</span>`;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit > 0) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path opacity="0.4" d="M3.26538 21.9613L3.54536 21.9686C5.6032 22.0224 6.63212 22.0493 7.56806 21.6837C8.504 21.3182 9.25287 20.5969 10.7506 19.1543L19.655 10.5779L13.5 4.5L4.78943 13.9445C3.57944 15.2555 2.97444 15.9109 2.62371 16.7182C2.27297 17.5255 2.20301 18.4235 2.06308 20.2197L2.03608 20.5662C1.98636 21.2043 1.9615 21.5234 2.14359 21.73C2.32567 21.9367 2.63891 21.9449 3.26538 21.9613Z" fill="#FFB900"></path>
                                <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                <path d="M13 4L20 11" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                <path d="M14 22H22" stroke="#FFB900" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </i>`
                    }
                    if (permitedDelete > 0) {
                        html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red" id=n-"${meta.row}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path opacity="0.4" d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5H19.5Z" fill="#E31400"></path>
                                <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                <path d="M21 5.5H3" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                <path d="M16.0575 5.5L15.3748 4.09173C14.9213 3.15626 14.6946 2.68852 14.3035 2.39681C14.2167 2.3321 14.1249 2.27454 14.0288 2.2247C13.5957 2 13.0759 2 12.0363 2C10.9706 2 10.4377 2 9.99745 2.23412C9.89986 2.28601 9.80675 2.3459 9.71906 2.41317C9.3234 2.7167 9.10239 3.20155 8.66037 4.17126L8.05469 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                <path d="M9.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                <path d="M14.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                            </svg>
                        </i>`;
                    }
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "5%", "class": "center-align" },
            { "data": "name", "width": "25%", "class": "left-align text-blue" },
            { "data": "roleDescription", "class": "left-align" },
            { "data": "linhVucID", "width": "25%", "class": "left-align" },
            { "data": "", "width": "10%", "class": "center-align" },
        ];

        initDataTableDashboardConfig('dataGrid', tableData, tableDefs, tableCols)

        $('#dataGrid tbody').on('click', '.edit-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#vaiTroID').val(data.id);
            $('#txtTenVaiTro').val(data.name);
            $('#txtMoTa').val(data.roleDescription);
            $('#select_LinhVuc').val(data.linhVucID).trigger('change');

            $('#modalAddRole').modal('show');
            $('#titleModalRole').text(`Chỉnh sửa vai trò ${data.name}`);

        });

        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.id);
            $('#nameDelete').text(data.name);
            $('#modalDelete').modal('show');
        });

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#tenRole').text(data.name);
            hienThiMenuPhanQuyen(data.name)
        })
                
    }

    $("#formAdd").on('submit', evt => {
        evt.preventDefault();
        dataAdd()
    })

    $("#formEdit").on('submit', e => {
        e.preventDefault();

        const arrNodes = treeViewPermission.getNodes();
        const arrNodeUpdate = [];
        arrNodes.forEach((node) => {
            const { items: nodeItems, itemData } = node;
            if (itemData.isLeaf) {
                const permission = {
                    permissionId: itemData.permissionId,
                };
                nodeItems.forEach((el) => {
                    const { itemData: elData, selected } = el;
                    switch (elData.permissionType) {
                        case 1:
                            permission.permitedEdit = selected;
                            break;
                        case 2:
                            permission.permitedDelete = selected;
                            break;
                        case 3:
                            permission.permitedApprove = selected;
                            break;
                        case 4:
                            permission.permitedCreate = selected;
                            break;
                    }
                });
                arrNodeUpdate.push({ ...permission });
            } else {
                nodeItems.forEach((nodeItem) => {
                    const { items: permissionItems, itemData: nodeItemData } = nodeItem;
                    const permission = {
                        permissionId: nodeItemData.permissionId,
                    };
                    permissionItems.forEach((el) => {
                        const { itemData: elData, selected } = el;
                        switch (elData.permissionType) {
                            case 1:
                                permission.permitedEdit = selected;
                                break;
                            case 2:
                                permission.permitedDelete = selected;
                                break;
                            case 3:
                                permission.permitedApprove = selected;
                                break;
                            case 4:
                                permission.permitedCreate = selected;
                                break;
                        }
                    });
                    arrNodeUpdate.push({ ...permission });
                });
            }
        });

        //console.log(arrNodeUpdate);
        //return;
        fetch("/api/adminmenuapi/updatepermissionbatch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                permission: arrNodeUpdate,
            }),
        })
            .then((res) => res.text())
            .then((data) => {
                //console.log(data);
                const rowUpdated = +data;
                if (rowUpdated != arrNodeUpdate.length) {
                    throw new Error("Cập nhật không thành công");
                }
                showNotification(1, 'Cập nhật phân quyền menu thành công')
            })
            .catch((err) => {
                //console.log(err);
                showNotification(0, err.message);
                $('#modalEdit').modal('hide');
            });
    });

    $("#formDelete").on('submit', evt => {
        evt.preventDefault();
        dataDelete();
    });
    $("#modalAdd").on('hide.bs.modal', function () {
        $('#select_choPhepTao_Add').val("false").trigger('change')
        $('#select_choPhepSua_Add').val("false").trigger('change')
        $('#select_choPhepXoa_Add').val("false").trigger('change')
        $('#select_choPhepDuyet_Add').val("false").trigger('change')
        dropdownBox.option('value', null);
    })

    $("#modalAddRole").on('hide.bs.modal', function () {
        $('#vaiTroID').val('');
        $('#txtTenVaiTro').val('');
        $('#txtMoTa').val('');
        $('#select_LinhVuc').val('').trigger('change');
    })
    $("#modalAddRole").on('show.bs.modal', function () {
        $('#titleModalRole').text('Thêm mới vai trò');
    })
    $("#modalDelete").on('hide.bs.modal', function () {
        $('#nameDelete').text('');
        $('#idDelete').text('');
    })

  
    $('#btn-sua').on('click', async function () {
        let id = $('#permissionIdEdit').val();
        let rolename = $('#tenRole').text();
        let permitedDelete = $('#permitedEdit').val();
        let permitedEdit = $("#permitedDelete").val()
        let permitedApprove = $('#permitedApprove').val();
        let menuid = $('#menuidEdit').val();

        let dt = {
            Id: id,
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
            });

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

    $('#btn-save-role').on('click', async function () {
        let roleId = $('#vaiTroID').val();
        let tenVaiTro = $('#txtTenVaiTro').val();
        let moTa = $("#txtMoTa").val()
        let linhVucID = $('#select_LinhVuc').val();
        let dt = {
            Name: tenVaiTro,
            RoleDescription: moTa,
            linhVucID: linhVucID || null
        }
        if (checkEmptyBlank(roleId)) {
            try {
                const res = await fetch('/api/AccountApi/CreateRole', {
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
                showNotification(1, 'Thêm mới vai trò thành công')
                $('#dataGrid').DataTable().ajax.reload(null, false);
                $('#modalAddRole').modal('hide');
            }
            catch (err) {
                showNotification(0, err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/AccountApi/UpdateRole/${roleId}`, {
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
                showNotification(1, 'Cập nhật vai trò thành công')
                $('#dataGrid').DataTable().ajax.reload(null, false);
                $('#modalAddRole').modal('hide');
            }
            catch (err) {
                showNotification(0, err.message)
            }
        }
    })

    async function dataDelete() {
        let roleId = $('#idDelete').val();
        if (!checkEmptyBlank(roleId)) {
            try {
                const res = await fetch('/api/AccountApi/DeleteRole/' + roleId, {
                    method: 'DELETE'
                });

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                showNotification(1, 'Xoá vai trò thành công')
                $('#dataGrid').DataTable().ajax.reload(null, false);
                $('#modalDelete').modal('hide');
            }
            catch (err) {
                showNotification(0, err.message)
            }
        }
    }

    document.getElementById('treeViewPermission').addEventListener('click', evt => {
        const { target } = evt;
        if (!target.classList.contains('del-node')) {
            return;
        }
        const menuid = target.dataset.menuid;
        const rolename = target.dataset.rolename;

        //console.log(`${menuid}: ${rolename}`);
        fetch(`/api/AdminMenuApi/deletepermissiontree/${menuid}/${rolename}`, {
            method: 'DELETE'
        })
            .then(res => res.text())
            .then(data => {
                showNotification(1, 'Cập nhật thành công')
                hienThiMenuPhanQuyen(rolename);
            })
            .catch(err => {
                showNotification(0, err.message)
            });
    })

    async function dataAdd() {
        let rolename = $('#tenRole').text();
        let permitedCreate = $("#select_choPhepTao_Add").val()
        let permitedEdit = $("#select_choPhepSua_Add").val()
        let permitedDelete = $('#select_choPhepXoa_Add').val();
        let permitedApprove = $('#select_choPhepDuyet_Add').val();
        //let menuid = $('#select_Menu_Add').val();

        const arrMenuSelected = dropdownBox.option('value');
        if (!arrMenuSelected) {
            showNotification(0, "Hãy chọn menu để phân quyền");
            return;
        }
        const [menuid] = arrMenuSelected;

        let dt = {
            RoleName: rolename,
            MenuId: menuid,
            PermitedCreate: permitedCreate === "true" ? true : false,
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
    function hienThiMenuPhanQuyen(rolename) {
        fetch(
            `/api/adminmenuapi/danhsachmenutheorole/${rolename}`
        )
            .then((res) => {
                // console.log(res);
                return res.json();
            })
            .then((data) => {
                 //console.log(data);
                treeViewPermission.option("items", data);
                treeViewPermission.expandAll();
                // treeView.expandAll();
                $('#modalEdit').modal('show');
            })
            .catch((err) => {
                console.log(err);
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

    async function loadDanhSachLinhVuc() {
        try {
            const res = await fetch(`/api/LinhVucApi/Gets`, {
                method: 'Get'
            })
            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            var data = await res.json()
            dataLinhVuc = data.value;

            $('#select_LinhVuc').empty();
            for (let i = 0; i < data.value.length; i++) {
                $('#select_LinhVuc').append(`<option value="${data.value[i].linhVucID}">${data.value[i].ten}</option>`)
            }

            return data
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
})