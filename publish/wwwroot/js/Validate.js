//Check null input
function checkEmptyBlank(str) {
    return str == null || String(str).trim().length === 0;
}

//File accept
//const filesAccept = ['docx', 'doc', 'pdf', 'xlsx', 'xls']


//Check tag html
function checkTagHtml(input) {
    var re = /<[^>]*>/g;
    return !re.test(input);
}
function getRootLink() {
    const url = window.location;
    const APIURL = url.protocol + "//" + url.hostname + ":" + url.port;

    return APIURL;
}
function formatDate(date = new Date()) {
    const year = date.toLocaleString('default', { year: 'numeric' });
    const month = date.toLocaleString('default', {
        month: '2-digit',
    });
    const day = date.toLocaleString('default', { day: '2-digit' });

    return [day, month, year].join('/');
}

function getDataWithApi(method, uri, data) {
    const APIURL = getRootLink();

    if (data) {
        return $.ajax({
            type: method,
            contentType: 'application/json; charset=utf-8',
            url: APIURL + uri,
            data: data
        });
    }

    return $.ajax({
        type: method,
        contentType: 'application/json; charset=utf-8',
        url: APIURL + uri,
    });
};

function getApiAjaxAuthorizeToken(url, type, token) {
    //let urlBase = getUrlCurrent()



    return $.ajax({
        type: type,
        url: url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Token', token);
        },
    });
}
function getApiAjaxAuthorize(url, type, token) {
    let urlBase = getRootLink()

    
        return $.ajax({
            type: type,
            url: urlBase + url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization',
                    "Bearer " + token);
            },
            
        });
    

    return $.ajax({
        type: type,
        url: urlBase + url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization',
                "Bearer " + token);
        },
    });
}

function getApiAjax(url, type, data) {
    let urlBase = getRootLink()

    if (data) {
        return $.ajax({
            type: type,
            url: urlBase + url,
            contentType: "application/json; charset=utf-8",
            data: data,
        });
    }

    return $.ajax({
        type: type,
        url: urlBase + url,
    });
}

function isCheckStringEmpty(str) {
    // Deprecated: Use checkEmptyBlank instead
    return checkEmptyBlank(str);
}
function isCheckLengthNumber(number, min, max) {
    if (number >= min && number <= max) {
        return true
    }
    return false
}

//format dd/mm/yy
function formatDay(date) {
    if (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        return [day, month, year].join('/')
    }
    else {
        return ``
    }
}
//Format date update
function formatDateUpdate(date = new Date()) {
    const year = date.toLocaleString('default', { year: 'numeric' });
    const month = date.toLocaleString('default', {
        month: '2-digit',
    });
    const day = date.toLocaleString('default', { day: '2-digit' });

    return [year, month, day].join('-');
}
//format yy-mm-dd
function formatDateSql(date) {
    if (date) {
        var dateParts = date.split("/");
        var dateObject = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
        return dateObject;
    }
    else {
        return null
    }
}
function getDate() {
    const date = new Date();

    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();
    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day
    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}-${month}-${day}`;
    return currentDate;
}
//check validate
function checkEmail(str) {
    const emailRegex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return emailRegex.test(str);
}

function checkURL(str) {
    const urlRegex = /^https?:\/\//;
    return urlRegex.test(str);
}

function phonenumber(inputtxt) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(inputtxt);
}
function checkLength(e, value) {
    if (e >= value) {
        return false
    }
    return true
}
function checkLengthModal(e, value) {
    if (e.value.length == value) {
        ThongBao('warning', `Độ dài vượt quá ${value} ký tự cho phép!`);
    }
}
function checkHtmlInjection(e) {
    var hasHtmlTags = false;
    $(e).each(function () {
        var userInput = $(this).val();
        if (/<[ˆ>]*>/g.test(userInput)) {
            hasHtmlTags = true;
            $(this).focus();
            return false;
        }
    });
    if (hasHtmlTags) {
        return true;
    } else {
        return false;
    }
}
// Handle checkbox
function onlyOne(checkbox) {
    var checkboxes = document.getElementsByName('radio-LapLai')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
function onlyOneTrangThai(checkbox) {
    var checkboxes = document.getElementsByName('radio-TrangThai')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
// FUNCTION CHECK CHUỖI RỖNG HOẶC NULL
function checkEmptyBlankV2(e) {
    var Empty = false;
    
    // Handle both array of selectors and single selector
    if (Array.isArray(e)) {
        // If it's an array of selector strings, convert to jQuery objects
        e.forEach(function(selector) {
            $(selector).each(function () {
                var userInput = $(this).val();
                if (userInput == '' || String(userInput).trim().length == 0 || userInput == null) {
                    Empty = true;
                    AddFalseInput(this, "Trường bắt buộc không được để trống!")
                    $(this).focus();
                    return false; // Break out of forEach
                } else if ($(this).closest(".form-group").find(".input_Warning").length > 0) {
                    Empty = true;
                    $(this).focus();
                    return false;
                } else {
                    RemoveFalseInput(this)
                }
            });
            if (Empty) return false; // Break out of forEach if error found
        });
    } else {
        // Original logic for single selector or jQuery object
        $(e).each(function () {
            var userInput = $(this).val();
            if (userInput == '' || String(userInput).trim().length == 0 || userInput == null) {
                Empty = true;
                AddFalseInput(this, "Trường bắt buộc không được để trống!")
                $(this).focus();
            } else if ($(this).closest(".form-group").find(".input_Warning").length > 0) {
                Empty = true;
                $(this).focus();
                return false;
            } else {
                RemoveFalseInput(this)
            }
        });
    }
    
    if (Empty) {
        return true;
    } else {
        return false;
    }
}
function checkFalseInput(e) {
    var Error_input = false;
    
    // Handle both array of selectors and single selector
    if (Array.isArray(e)) {
        // If it's an array of selector strings, convert to jQuery objects
        e.forEach(function(selector) {
            $(selector).each(function () {
                if ($(this).closest(".form-group").find(".input_Warning").length > 0) {
                    Error_input = true;
                    $(this).focus();
                    return false;
                }
            });
            if (Error_input) return false; // Break out of forEach if error found
        });
    } else {
        // Original logic for single selector or jQuery object
        $(e).each(function () {
            if ($(this).closest(".form-group").find(".input_Warning").length > 0) {
                Error_input = true;
                $(this).focus();
                return false;
            }
        });
    }
    
    if (Error_input) {
        return true;
    } else {
        return false;
    }
}
function checkEmptyBlank(str) {
    return str == null || String(str).trim().length === 0;
}
function isDecimal(decimalPart, fullPart, input) {
    var regex = new RegExp($`/^(\d{1,${fullPart - decimalPart}}(\.\d{1,${decimalPart}})?|\d{${fullPart - decimalPart + 1}}(\.\d{1,${decimalPart}})?)/`);
    if (!regex.test(input)) {
        alert('Chữ số thập phân không hợp lệ')
        return e.value = ""
    }
}
function checkRangeNumber(e, begin, end) {
    if (Number(e.value) < begin || Number(e.value) > end) {
        alert(2, `Độ lớn phải lớn hơn hoặc bằng ${begin} hoặc nhỏ hơn hoặc bằng ${end}!`);
        return e.value = ""
    }
}

function AddFalseInput(e, string) {
    $(e).addClass("False_Input");
    $(e).closest(".form-group").find("label").addClass("False_Input");
    if ($(e).closest(".form-group").find(".input_Warning").length === 0) {
        $(e).closest(".form-group").append(`<span class="input_Warning">${string}</span>`);
    } else if ($(e).closest(".form-group").find(".input_Warning").text() != '') {
        $(e).closest(".form-group").find(".input_Warning").text(string);
    }
}

function RemoveFalseInput(e) {
    $(e).removeClass("False_Input");
    $(e).closest(".form-group").find("label").removeClass("False_Input");
    $(e).closest(".form-group").find(".input_Warning").remove();
}

// Global regex patterns for performance optimization
const REGEX_PATTERNS = {
    INT: /^\d+$/,
    DECIMAL_8_3: /^\d{1,5}(\.\d{0,3})?$/,
    DECIMAL_8_4: /^\d{1,4}(\.\d{0,4})?$/,
    DECIMAL_10_3: /^\d{1,7}(\.\d{0,3})?$/,
    DECIMAL_6_2: /^\d{1,4}(\.\d{0,3})?$/,
    DECIMAL_5_2: /^\d{1,3}(\.\d{0,2})?$/,
    DECIMAL_4_2: /^\d{1,2}(\.\d{0,2})?$/,
    HTML_TAGS: /<[^>]*>/g
};

function CheckLengthEach(selector, value, valuesub) {    
    if (valuesub === "date") {
        $(selector).on("change", function () {
            RemoveFalseInput(this);
        })
    } else if (valuesub === "select") {
        $(selector).on("change", function () {
            RemoveFalseInput(this);
        })
    }
    if (valuesub === "select") {
        $(selector).on("change", function () {
            if ($(this).val().length > 0) {
                RemoveFalseInput(this);
            }
        })
    }
    
    $(selector).on("input propertychange", function () {
        var LengthValue = $(this).val().length;
        var userInput = $(this).val();
        var hasHtmlTags = REGEX_PATTERNS.HTML_TAGS.test(userInput);
        
        if (hasHtmlTags) {
            AddFalseInput(this, "Nội dung nhập chứa chức năng bị cấm!!")
        } else if (value === null) {
            if (userInput != '') {
                RemoveFalseInput(this);
            }
        } else if (value == "reg4-2") {
            if (!REGEX_PATTERNS.DECIMAL_4_2.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "12.34"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "reg5-2") {
            if (!REGEX_PATTERNS.DECIMAL_5_2.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "123.45"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "reg6-2") {
            if (!REGEX_PATTERNS.DECIMAL_6_2.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "1234.56"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "reg8-3") {
            if (!REGEX_PATTERNS.DECIMAL_8_3.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "12345.678"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "reg8-4") {
            if (!REGEX_PATTERNS.DECIMAL_8_4.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "1234.5678"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "reg10-3") {
            if (!REGEX_PATTERNS.DECIMAL_10_3.test(userInput)) {
                AddFalseInput(this, 'Vui lòng nhập đúng định dạng, ví dụ: "1234567.890"')
            } else {
                RemoveFalseInput(this);
            }
        } else if (value == "onlyInt" || value == "IntvarChar") {
            if (!REGEX_PATTERNS.INT.test(userInput)) {
                AddFalseInput(this, 'Chỉ được nhập số!!')
            } else {
                RemoveFalseInput(this);
            }
        }
        else if (value === 'required') {
            if (LengthValue == 0) {
                console.log(1111)
                AddFalseInput(this, "Trường bắt buộc nhập")
            }
            else {
                console.log(2222)
                RemoveFalseInput(this)
            }
        }
        else if (!checkLength(LengthValue, value)) {
            AddFalseInput(this, "Đã đạt giới hạn ký tự!!");
        } else {
            RemoveFalseInput(this);
        }
    });
    $(selector).on('blur', function () {
        var LengthValue = $(this).val().length;
        var WarningLength = $(this).closest(".form-group").find(".input_Warning").length > 0;
        if (value === 'required') {
            if (LengthValue == 0) {
                AddFalseInput(this, "Trường bắt buộc nhập")
            }
            else if (WarningLength > 0) {
                return
            }
            else {
                RemoveFalseInput(this)
            }
        }
    })
}

// Sử dụng cho JqueryUI_Datepicker, dùng để giới hạn lại 2 ô input từ ngày / đến ngày
function CheckDateMinMax(startDateClass, endDateClass) {
    $(startDateClass).datepicker().on('change', function() {
        // Khi ngày thay đổi ở ô đầu tiên, cập nhật trạng thái ở ô thứ hai
        var selected = $(this).datepicker('getDate');
        var minDate = new Date(selected.getTime());
        minDate.setDate(minDate.getDate()); // Cộng thêm 1 ngày
        $(endDateClass).datepicker("option", "minDate", minDate);
        $(endDateClass).removeAttr('disabled');
    });

    $(endDateClass).datepicker().on('change', function() {
        // Khi ngày thay đổi ở ô thứ hai, cập nhật trạng thái ở ô đầu tiên
        var selected = $(this).datepicker('getDate');
        var maxDate = new Date(selected.getTime());
        maxDate.setDate(maxDate.getDate()); // Trừ 1 ngày
        $(startDateClass).datepicker("option", "maxDate", maxDate);
        $(startDateClass).removeAttr('disabled');
    });
}
function CheckDateMin(startDateClass) {
    $(startDateClass).datepicker().on('change', function () {
        // Khi ngày thay đổi ở ô đầu tiên, cập nhật trạng thái ở ô thứ hai
        var selected = $(this).datepicker('getDate');
        var minDate = new Date(selected.getTime());
        minDate.setDate(minDate.getDate());      
    });
}

