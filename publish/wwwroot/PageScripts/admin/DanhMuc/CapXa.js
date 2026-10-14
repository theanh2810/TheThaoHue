const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initTable();
    loadNgonNguData(); // Load dữ liệu ngôn ngữ
    loadCapTinhData(); // Load dữ liệu cấp tỉnh
    let translations = [];
    //// Áp dụng validation cho các trường input
    //initValidation();

    //function initValidation() {
    //    // Validation cho form Add (cũng dùng cho Edit)
    //    CheckLengthEach('#maSoAdd, #maSoEdit', 50, null); // Giới hạn 50 ký tự cho mã số
    //    CheckLengthEach('#tenDonViAdd, #tenDonViEdit', 255, null); // Giới hạn 255 ký tự cho tên đơn vị
    //    CheckLengthEach('#thuTuAdd, #thuTuEdit', 10, null); // Giới hạn 10 ký tự cho thứ tự
    //}

    // Function để format mã xã với số 0 đằng trước thành 5 chữ số

    // Event listener cho việc format mã xã
    //$(document).on('blur', '#maSoAdd, #maSoEdit', function() {
    //    const currentValue = $(this).val().trim();
    //    if (currentValue) {
    //        const formattedValue = formatMaXa(currentValue);
    //        $(this).val(formattedValue);
    //    }
    //});

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
                loaiDM: 3,
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
            url: `${baseUrl}/api/CapXaApi/Gets`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccessed && data.resultObj && data.resultObj.length > 0) {
                    // Sử dụng dữ liệu cấp 1, giữ nguyên mảng daNgu
                    let processedData = data.resultObj.map(item => ({
                        id: item.xaID,
                        maXa: item.maXa,
                        noiDung: item.noiDung,
                        sapXep: item.sapXep,
                        trangThai: item.trangThai,
                        tinhID: item.tinhID,
                        tenTinh: item.tenTinh,
                        cap: item.cap,
                        maDinhDanh: item.maDinhDanh,
                        daNgu: item.daNgu // Giữ nguyên mảng daNgu để sử dụng sau
                    }));
                    console.log(processedData)
                    
                    // Sắp xếp dữ liệu theo trường thứ tự (sapXep) trước, nếu trùng thì theo Mã xã
                    processedData.sort((a, b) => {
                        const orderA = a.sapXep || 999999; // Nếu không có sapXep thì đặt cuối
                        const orderB = b.sapXep || 999999;
                        
                        // So sánh theo thứ tự trước
                        if (orderA !== orderB) {
                            return orderA - orderB; // Sắp xếp tăng dần theo thứ tự
                        }
                        
                        // Nếu thứ tự trùng nhau, sắp xếp theo Mã xã (maXa)
                        const codeA = (a.maXa || '').toString().toLowerCase();
                        const codeB = (b.maXa || '').toString().toLowerCase();
                        return codeA.localeCompare(codeB, 'vi', { numeric: true, sensitivity: 'base' });
                    });
                    
                    // Thêm Stt sau khi đã sắp xếp
                    processedData.forEach((item, index) => {
                        item.stt = index + 1;
                    });

                    console.log(processedData, "adasd");
                    
                    return processedData;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 1, // Cột mã xã (index 1)
                render: function (data, type, row, meta) {
                    if (data) {
                        return data;
                    } else {
                        return '-';
                    }
                }
            },
            {
                targets: 3, // Cột cấp
                render: function (data, type, row, meta) {
                    switch(data) {
                        case 1: return 'Phường';
                        case 2: return 'Xã';
                        case 3: return 'Đặc khu';
                        default: return data;
                    }
                }
            },
            {
                targets: 6,
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
                targets: 7,
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
            { "data": "maXa", "width": "10%", "class": "left-align" },
            { "data": "noiDung", "class": "left-align" },
            { "data": "cap", "width": "120px", "class": "left-align" },
            { "data": "tenTinh", "width": "15%", "class": "left-align" },
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
            $('#xaID').val(data.id);
            $("#maSoAdd").val(data.maXa);
            $('#thuTuAdd').val(data.sapXep || 1);
            $(`input[name="trangThaiAdd"][value="${data.trangThai ? 'true' : 'false'}"]`).prop('checked', true);

            $("#maDinhDanhAdd").val(data.maDinhDanh);
            
            // Set cấp
            $(`input[name="capXaAdd"][value="${data.cap}"]`).prop('checked', true);
            
            // Set tỉnh/thành phố
            $('#select_tinhAdd').val(data.tinhID).trigger('change');
            
            translations = data.daNgu || [];
            $('#ngonNguAdd').val('e0dcb168-3923-492e-9bdf-cbd5e1315be4').trigger('change');

            $('#modalAddTitle').text(`Chỉnh sửa đơn vị hành chính cấp xã ${data.noiDung}`)
            $('#modalAdd').modal('show');
        });
        
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.id);
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

    
    // Kiểm tra trùng lặp mã xã và ngôn ngữ bằng API Gets - CHỈ DÀNH CHO MODAL ADD
    async function checkDuplicate(maXa, ngonNguID, tinhID) {
        try {
            const res = await fetch(`${baseUrl}/api/CapXaApi/Gets`, {
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
                    
                    // Kiểm tra trùng mã xã và cùng tỉnh
                    if (item.maXa == maXa && item.tinhID == tinhID) {
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

    // Kiểm tra trùng lặp mã xã và ngôn ngữ cho EDIT - loại trừ record hiện tại
    async function checkDuplicateForEdit(maXa, ngonNguID, tinhID, currentId) {
        try {
            const res = await fetch(`${baseUrl}/api/CapXaApi/Gets`, {
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
                    if (currentId && item.id == currentId) {
                        continue;
                    }
                    
                    // Kiểm tra trùng mã xã và cùng tỉnh
                    if (item.maXa == maXa && item.tinhID == tinhID) {
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
        let id = $('#xaID').val();
        let maSo = $('#maSoAdd').val();
        let trangThai = $("input[name='trangThai']:checked").val();
        let thuTu = $('#thuTuAdd').val();
        let cap = $("input[name='capXa']:checked").val();
        let tinhID = $('#select_tinhAdd').val();
        let maDinhDanh = $('#maDinhDanhAdd').val();

       
        var tenTiengViet = translations.find(el => el.tenNgonNgu === 'Việt Nam')?.noiDung || null
        if (translations?.length <= 0 || tenTiengViet == null || checkEmptyBlank(maSo) || checkEmptyBlank(tinhID)
            || checkEmptyBlank(cap) ) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        let dt = {
            "xaID": id || null,
            "loaiDM": 3,
            "maXa": maSo,
            "trangThai": trangThai === "true",
            "sapXep": !checkEmptyBlank(thuTu) ? parseInt(thuTu) : 1,
            "tinhID": tinhID,
            "cap": parseInt(cap),
            "daNgu": translations,
            "maDinhDanh": maDinhDanh
        };

        if (checkEmptyBlank(id)) {
            try {
                const res = await fetch('/api/CapXaApi/Add', {
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
                    if (data.error.includes("IX_DM_DiaPhuongCapXa")) {
                        showNotification(0, 'Mã số đã tồn tại')
                    }
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/CapXaApi/Edit`, {
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
                    if (data.error.includes("IX_DM_DiaPhuongCapXa")) {
                        showNotification(0, 'Mã số đã tồn tại')
                    }
                }
            }
            catch (err) {
                console.log(err.message)
            }
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
               
                // Add new options cho modalAdd
                data.value.forEach(item => {
                    if (item.maNgonNgu == "vi") {
                        $('#ngonNguAdd').append(`<option selected value="${item.ngonNguID}" data-symbol="${item.maNgonNgu}">${item.tenNgonNgu}</option>`);
                    } else {
                        $('#ngonNguAdd').append(`<option value="${item.ngonNguID}" data-symbol="${item.maNgonNgu}">${item.tenNgonNgu}</option>`);

                    }
                });

                // Trigger Select2 refresh if it's initialized
                if ($('#ngonNguAdd').hasClass('select2-hidden-accessible')) {
                    $('#ngonNguAdd').trigger('change');
                }
            }
        } catch (err) {
            console.error('Lỗi khi load dữ liệu ngôn ngữ:', err);
            showNotification(0, 'Không thể tải danh sách ngôn ngữ');
        }
    }

    // Load dữ liệu cấp tỉnh cho select
    async function loadCapTinhData() {
        try {
            const res = await fetch(`${baseUrl}/api/CapTinhApi/Gets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error('Không thể tải dữ liệu cấp tỉnh');
            }

            const data = await res.json();
            
            if (data && data.isSuccessed && data.resultObj) {
                // Clear existing options cho modalAdd
                $('#select_tinhAdd').empty();
                $('#select_tinhAdd').append('<option value="">Chọn tỉnh/thành phố...</option>');
                
                // Clear existing options cho modalEdit  
                $('#select_tinhEdit').empty();
                $('#select_tinhEdit').append('<option value="">Chọn tỉnh/thành phố...</option>');
                
                // Add new options cho modalAdd
                data.resultObj.forEach(item => {
                    const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                    $('#select_tinhAdd').append(`<option value="${item.tinhID}">${displayText}</option>`);
                });
                
                // Add new options cho modalEdit
                data.resultObj.forEach(item => {
                    const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                    $('#select_tinhEdit').append(`<option value="${item.tinhID}">${displayText}</option>`);
                });

                // Trigger Select2 refresh if it's initialized
                if ($('#select_tinhAdd').hasClass('select2-hidden-accessible')) {
                    $('#select_tinhAdd').trigger('change');
                }
                if ($('#select_tinhEdit').hasClass('select2-hidden-accessible')) {
                    $('#select_tinhEdit').trigger('change');
                }
            }
        } catch (err) {
            console.error('Lỗi khi load dữ liệu cấp tỉnh:', err);
            showNotification(0, 'Không thể tải danh sách tỉnh/thành phố');
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
        $('#modalAddTitle').text("Thêm mới đơn vị hành chính cấp xã")
        $('#modalAdd').modal('show')
    });

    $("#modalAdd").on('show.bs.modal', function () {
        
        console.log("oepn modal")
        $("#ngonNguAdd").val("E0DCB168-3923-492E-9BDF-CBD5E1315BE4".toLowerCase()).trigger('change');
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
            const res = await fetch(`/api/CapXaApi/Delete?id=${id}`, {
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