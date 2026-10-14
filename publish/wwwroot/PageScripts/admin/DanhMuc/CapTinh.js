const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initTable();
    loadNgonNguData(); // Load dữ liệu ngôn ngữ

    let translations = [];
    // Áp dụng validation cho các trường input
    

    // Function để format mã tỉnh với số 0 đằng trước
    function formatMaTinh(value) {
        // Chỉ xử lý nếu là số và nhỏ hơn 10
        const num = parseInt(value);
        if (!isNaN(num) && num >= 0 && num < 10) {
            return '0' + num;
        }
        return value;
    }

    // hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslation() {
        let ngonNguID = $("#ngonNguAdd").val();
        let noiDung = $("#tenDonViAdd").val().trim();

        if (!ngonNguID || !noiDung) return; // chưa chọn ngôn ngữ hoăc không nhập tên thì bỏ qua

        // kiểm tra đã có ngôn ngữ này trong mảng chưa
        let exist = translations.find(t => t.ngonNguID === ngonNguID);
        if (exist) {
            exist.noiDung = noiDung?.trim();
        } else {
            translations.push({
                ngonNguID: ngonNguID,
                tenNgonNgu: $("#ngonNguAdd option:selected").text(),
                loaiDM: 2,
                noiDung: noiDung.trim(),
            });
        }
        //console.log("Lưu tạm:", translations);
    }

    // sự kiện blur trên input
    $("#tenDonViAdd").on("blur", function () {
        saveTempTranslation();
    });

    // sự kiện đổi ngôn ngữ → blind lại dữ liệu
    $("#ngonNguAdd").on("change", function () {
        // nếu đã có dữ liệu cho ngôn ngữ vừa chọn thì bind lại vào form
        let ngonNguID = $(this).val();
        let exist = translations.find(t => t.ngonNguID === ngonNguID);
        if (exist) {
            $("#tenDonViAdd").val(exist.noiDung);
        } else {
            // reset nếu chưa nhập gì cho ngôn ngữ đó
            $("#tenDonViAdd").val("");
        }
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/CapTinhApi/Gets`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccessed && data.resultObj && data.resultObj.length > 0) {
                    // Sử dụng dữ liệu cấp 1, giữ nguyên mảng daNgu
                    
                    let processedData = data.resultObj.map(item => ({
                        tinhID: item.tinhID,
                        maTinh: item.maTinh,
                        noiDung: item.noiDung,
                        sapXep: item.sapXep,
                        trangThai: item.trangThai,
                        daNgu: item.daNgu // Giữ nguyên mảng daNgu để sử dụng sau
                    }));
                    console.log(processedData)
                    
                    // Sắp xếp dữ liệu theo trường thứ tự (sapXep) trước, nếu trùng thì theo Mã tỉnh
                    processedData.sort((a, b) => {
                        const orderA = a.sapXep || 999999; // Nếu không có sapXep thì đặt cuối
                        const orderB = b.sapXep || 999999;
                        
                        // So sánh theo thứ tự trước
                        if (orderA !== orderB) {
                            return orderA - orderB; // Sắp xếp tăng dần theo thứ tự
                        }
                        
                        // Nếu thứ tự trùng nhau, sắp xếp theo Mã tỉnh (maTinh)
                        const codeA = (a.maTinh || '').toString().toLowerCase();
                        const codeB = (b.maTinh || '').toString().toLowerCase();
                        return codeA.localeCompare(codeB, 'vi', { numeric: true, sensitivity: 'base' });
                    });
                    
                    // Thêm Stt sau khi đã sắp xếp
                    processedData.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    
                    return processedData;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 1, // Cột mã tỉnh (index 1)
                render: function (data, type, row, meta) {
                    // Format mã tỉnh với số 0 đằng trước nếu cần
                    const num = parseInt(data);
                    if (!isNaN(num) && num >= 0 && num < 10) {
                        return '0' + num;
                    }
                    return data;
                }
            },
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
            { "data": "maTinh", "width": "15%", "class": "left-align" },
            { "data": "noiDung", "class": "left-align" },
            { "data": "sapXep", "width": "120px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfig('dataGrid', tableApi, tableDefs, tableCols);

        // Gắn sự kiện vào ô input tìm kiếm mặc định
        $('#dataGrid_wrapper .dt-search input')
            .unbind() // Bỏ event mặc định của DataTables
            .bind('keyup', function (e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    $('#dataGrid').DataTable().search(this.value).draw(); // Thực hiện search khi Enter
                }
            });
        $(".New_Table .dt-search input").prependTo(".New_Table .group-button").addClass("search-icon").attr("style", "width: 350px;")
        $(".New_Table .dt-search label").remove()

        $('#dataGrid tbody').on('click', '.edit-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            // Fill dữ liệu cơ bản
            $('#tinhID').val(data.tinhID);
            $("#maSoAdd").val(data.maTinh);
            $('#thuTuAdd').val(data.sapXep || 1);
            $(`input[name="trangThaiAdd"][value="${data.trangThai ? '1' : '0'}"]`).prop('checked', true);
            
          
            translations = data.daNgu || [];
            $('#ngonNguAdd').val('e0dcb168-3923-492e-9bdf-cbd5e1315be4').trigger('change');

            $('#modalAddTitle').text(`Chỉnh sửa đơn vị hành chính cấp tỉnh ${data.noiDung}`)
            $('#modalAdd').modal('show');
        });
        
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.tinhID);
            $('#nameDelete').text(`${data.noiDung}`);

            $('#modalDelete').modal('show');
        });  
    }

    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();

        translations = translations.filter(t => t.noiDung && t.noiDung.trim() !== ""); // Lọc bỏ các bản dịch trống
        // Disable submit button để tránh spam
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return; // Nếu button đã disabled, không làm gì cả
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
            return; // Nếu button đã disabled, không làm gì cả
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

    // Kiểm tra trùng lặp mã tỉnh và ngôn ngữ bằng API Gets - CHỈ DÀNH CHO MODAL ADD
    async function checkDuplicate(maTinh, ngonNguID) {
        try {
            const res = await fetch(`${baseUrl}/api/CapTinhApi/Gets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                console.error('Lỗi khi kiểm tra trùng lặp');
                return false; // Nếu API lỗi, cho phép tiếp tục
            }

            const data = await res.json();
            
            if (data && data.isSuccessed && data.resultObj) {
                const tableData = data.resultObj;
                
                // Kiểm tra trùng lặp cho thêm mới
                for (let i = 0; i < tableData.length; i++) {
                    const item = tableData[i];
                    
                    // Kiểm tra trùng mã tỉnh
                    if (item.maTinh == maTinh) {
                        // Nếu cả hai đều không có ngôn ngữ (null/empty)
                        if ((!ngonNguID || ngonNguID === '') && (!item.ngonNguID || item.ngonNguID === '')) {
                            return true;
                        }
                        // Nếu cả hai đều có ngôn ngữ và trùng nhau
                        if (ngonNguID && item.ngonNguID && ngonNguID === item.ngonNguID) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
            
        } catch (err) {
            console.error('Lỗi khi kiểm tra trùng lặp:', err);
            return false; // Nếu có lỗi, cho phép tiếp tục
        }
    }

    // Kiểm tra trùng lặp mã tỉnh và ngôn ngữ cho EDIT - loại trừ record hiện tại
    async function checkDuplicateForEdit(maTinh, ngonNguID, currentId) {
        try {
            const res = await fetch(`${baseUrl}/api/CapTinhApi/Gets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                console.error('Lỗi khi kiểm tra trùng lặp');
                return false; // Nếu API lỗi, cho phép tiếp tục
            }

            const data = await res.json();
            
            if (data && data.isSuccessed && data.resultObj) {
                const tableData = data.resultObj;
                
                // Kiểm tra trùng lặp cho chỉnh sửa (loại trừ record hiện tại)
                for (let i = 0; i < tableData.length; i++) {
                    const item = tableData[i];
                    
                    // Bỏ qua record hiện tại khi edit
                    if (currentId && item.tinhID == currentId) {
                        continue;
                    }
                    
                    // Kiểm tra trùng mã tỉnh
                    if (item.maTinh == maTinh) {
                        // Nếu cả hai đều không có ngôn ngữ (null/empty)
                        if ((!ngonNguID || ngonNguID === '') && (!item.ngonNguID || item.ngonNguID === '')) {
                            return true;
                        }
                        // Nếu cả hai đều có ngôn ngữ và trùng nhau
                        if (ngonNguID && item.ngonNguID && ngonNguID === item.ngonNguID) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
            
        } catch (err) {
            console.error('Lỗi khi kiểm tra trùng lặp cho edit:', err);
            return false; // Nếu có lỗi, cho phép tiếp tục
        }
    }

    // Function cho thêm mới
    async function dataAdd() {
        let id = $('#tinhID').val();
        let maSo = $('#maSoAdd').val();
        let trangThai = $("input[name='trangThaiAdd']:checked").val();
        let thuTu = $('#thuTuAdd').val();
       
        //// Sử dụng checkEmptyBlankV2 để validate tất cả các trường bắt buộc
        //const requiredFields = ['#maSoAdd', '#tenDonViAdd'];
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

        // Kiểm tra trùng lặp mã tỉnh và ngôn ngữ (không có id khi thêm mới)
        //const isDuplicate = await checkDuplicate(maSo, ngonNguID);
        //if (isDuplicate) {
        //    showNotification(0, 'Tỉnh đã tồn tại');
        //    return;
        //}
     
        var tenTiengViet = translations.find(el => el.tenNgonNgu === 'Việt Nam')?.noiDung || null
        if (translations?.length <= 0 || tenTiengViet == null || checkEmptyBlank(maSo)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        let dt = {
            "TinhID": id || null,
            "maTinh": formatMaTinh(maSo),
            "trangThai": trangThai == "1" ? true : false,
            "loaiDM": 2,
            "sapXep": !checkEmptyBlank(thuTu) ? parseInt(thuTu) : 1,
            "DanhSachDaNgu": translations
        };

        if (checkEmptyBlank(id)) {
            try {
                const res = await fetch('/api/CapTinhApi/Add', {
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
                    if (data.error.includes("IX_DM_DiaPhuongCapTinh")) {
                        showNotification(0, 'Mã tỉnh đã tồn tại')
                    }
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                dt.TinhID = id;
                const res = await fetch(`/api/CapTinhApi/Edit`, {
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
                    if (data.error.includes("IX_DM_DiaPhuongCapTinh")) {
                        showNotification(0, 'Mã tỉnh đã tồn tại')
                    }
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
        //// Thêm ngonNguID nếu có chọn
        //if (!checkEmptyBlank(ngonNguID)) {
        //    dt.ngonNguID = ngonNguID;
        //}

        //try {
        //    const res = await fetch('/api/CapTinhApi/Add', {
        //        method: 'POST',
        //        headers: {
        //            'Content-Type': 'application/json'
        //        },
        //        body: JSON.stringify(dt)
        //    })

        //    if (!res.ok) {
        //        var errText = await res.text();
        //        throw new Error(errText);
        //    }
        //    data = await res.json();

        //    if (data && data.isSuccessed && data.resultObj) {
        //        showNotification(1, 'Thêm mới thành công')
        //        $('#dataGrid').DataTable().ajax.reload(null, false);
        //        $('#modalAdd').modal('hide');
        //    } else {
        //        showNotification(0, data.message || 'Có lỗi xảy ra')
        //    }
        //}
        //catch (err) {
        //    showNotification(0, err.message)
        //}
    }

    // Function cho chỉnh sửa
    async function dataEdit() {
        let id = $('#idCapTinhEdit').val();
        let maSo = $('#maSoEdit').val();
        let tenDonVi = $('#tenDonViEdit').val();
        let trangThai = $("input[name='trangThaiEdit']:checked").val();
        let ngonNguID = $('#ngonNguEdit').val();
        let thuTu = $('#thuTuEdit').val();

        // Sử dụng checkEmptyBlankV2 để validate tất cả các trường bắt buộc
        const requiredFields = ['#maSoEdit', '#tenDonViEdit'];
        if (checkEmptyBlankV2(requiredFields)) {
            showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!')
            return; // Dừng nếu có trường trống
        }

        // Kiểm tra có lỗi validation từ CheckLengthEach hay không
        if (checkFalseInput(requiredFields)) {
            showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!')
            return; // Dừng nếu có lỗi validation
        }

        if (checkEmptyBlank(trangThai)) {
            showNotification(0, 'Vui lòng chọn trạng thái!')
            return;
        }

        if (checkEmptyBlank(id)) {
            showNotification(0, 'Không tìm thấy ID để chỉnh sửa!')
            return;
        }

        // Kiểm tra ngôn ngữ có tồn tại trong daNgu hay không
        const daNguArray = $('#modalEdit').data('daNguArray') || [];
        const existingDaNgu = daNguArray.find(item => item.ngonNguID === ngonNguID);
        const isNewLanguage = ngonNguID && !existingDaNgu;

        // Kiểm tra trùng lặp mã tỉnh và ngôn ngữ (loại trừ record hiện tại)
        const isDuplicate = await checkDuplicateForEdit(maSo, ngonNguID, id);
        if (isDuplicate) {
            showNotification(0, 'Mã tỉnh này đã tồn tại trong ngôn ngữ đã chọn!');
            return;
        }

        let dt = {
            "tinhID": id,
            "maTinh": maSo?.trim(),
            "noiDung": tenDonVi?.trim(),
            "trangThai": trangThai == "1" ? true : false,
            "loaiDM": 2,
            "sapXep": !checkEmptyBlank(thuTu) ? parseInt(thuTu) : 1
        };

        // Thêm ngonNguID nếu có chọn
        if (!checkEmptyBlank(ngonNguID)) {
            dt.ngonNguID = ngonNguID;
        }

        // Nếu là ngôn ngữ mới (không có trong daNgu), thêm noiDungID từ existingDaNgu nếu có
        /* if (existingDaNgu && existingDaNgu.noiDungID) {
            dt.noiDungID = existingDaNgu.noiDungID;
        } */

        try {
            // Chọn API dựa vào việc ngôn ngữ có tồn tại trong daNgu hay không
            const apiEndpoint = isNewLanguage ? '/api/CapTinhApi/Add' : '/api/CapTinhApi/Edit';
            const successMessage = isNewLanguage ? 'Thêm ngôn ngữ mới thành công' : 'Chỉnh sửa thành công';
            const notificationType = 2

            const res = await fetch(apiEndpoint, {
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

            if (data && data.isSuccessed) {
                showNotification(notificationType, successMessage)
                $('#dataGrid').DataTable().ajax.reload(null, false);
                $('#modalEdit').modal('hide');
            } else {
                showNotification(0, data.message || 'Có lỗi xảy ra')
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Load dữ liệu ngôn ngữ cho select
    // Load dữ liệu ngôn ngữ cho cả modalAdd và modalEdit
    async function loadNgonNguData() {
        try {
            const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "trangThai": true })
            });

            if (!res.ok) {
                throw new Error('Không thể tải dữ liệu ngôn ngữ');
            }

            const data = await res.json();
            
            if (data.isSuccess) {
                // Clear existing options cho modalAdd
                $('#ngonNguAdd').empty();
                // Clear existing options cho modalEdit  
                $('#ngonNguEdit').empty();
                
                // Add new options cho modalAdd
                data.value.forEach(item => {
                    $('#ngonNguAdd').append(`<option value="${item.ngonNguID}" data-symbol="${item.maNgonNgu}">${item.tenNgonNgu}</option>`);
                });
                
                // Add new options cho modalEdit
                data.value.forEach(item => {
                    $('#ngonNguEdit').append(`<option value="${item.ngonNguID}" data-symbol="${item.maNgonNgu}">${item.tenNgonNgu}</option>`);
                });

                // Trigger Select2 refresh if it's initialized
                if ($('#ngonNguAdd').hasClass('select2-hidden-accessible')) {
                    $('#ngonNguAdd').trigger('change');
                }
                if ($('#ngonNguEdit').hasClass('select2-hidden-accessible')) {
                    $('#ngonNguEdit').trigger('change');
                }
            }
        } catch (err) {
            console.error('Lỗi khi load dữ liệu ngôn ngữ:', err);
            showNotification(0, 'Không thể tải danh sách ngôn ngữ');
        }
    }

    // Event listener cho việc thay đổi ngôn ngữ trong modal Edit
    $(document).on('change', '#ngonNguEdit', function() {
        const selectedNgonNguID = $(this).val();
        const daNguArray = $('#modalEdit').data('daNguArray') || [];
        
        if (selectedNgonNguID && daNguArray.length > 0) {
            // Tìm dữ liệu tương ứng với ngôn ngữ đã chọn
            const selectedDaNgu = daNguArray.find(item => item.ngonNguID === selectedNgonNguID);
            
            if (selectedDaNgu) {
                // Cập nhật nội dung theo ngôn ngữ đã chọn
                $('#tenDonViEdit').val(selectedDaNgu.noiDung);
            } else {
                // Nếu không tìm thấy dữ liệu cho ngôn ngữ này, xóa nội dung
                $('#tenDonViEdit').val('');
            }
        } else {
            // Nếu không chọn ngôn ngữ, xóa nội dung
            $('#tenDonViEdit').val('');
        }
    });

    $('#openModalAdd').on("click", function () {
        $('#modalAddTitle').text("Thêm mới đơn vị hành chính cấp tỉnh")
        $('#modalAdd').modal('show')
    });

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
            const res = await fetch(`/api/CapTinhApi/Delete?id=${id}`, {
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

            if (data && data.isSuccessed && data.resultObj) {
                showNotification(1, 'Xóa thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.message || 'Có lỗi xảy ra')
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
})