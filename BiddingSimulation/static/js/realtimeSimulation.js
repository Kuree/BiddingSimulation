var connection = undefined

var timeRemaining = 180;
var timerID = 0;
var hasSubmit = false;


var loading;
var id = 0;

loading = loading ||  (function () {
    var pleaseWaitDiv = $('<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h1>Waiting For Other Users...</h1></div><div class="modal-body"><div class="progress progress-striped active"><div class="progress-bar" style="width: 100%;"></div></div></div></div></div></div>');
    return {
        show: function () {
            pleaseWaitDiv.modal('show');
        },
        hide: function () {
            pleaseWaitDiv.modal('hide');
        },

    };
})();

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

$(function () {
    loading.show()

    cookieTimeRemaining = $.cookie("timeRemaining");
    if (cookieTimeRemaining) { timeRemaining = cookieTimeRemaining;}

    id = $.cookie("userID");
    if (id == undefined) {
        id = ((Math.floor(Date.now())).toString() + (Math.floor(Math.random() * 2000000)).toString()).hashCode();
    }
    console.log(id)

    var url = document.domain;
    connection = new WebSocket("ws://" + url + "/realtimeSocket?id=" + id);
    connection.onmessage = onMessageReceived;


    // start bid function
    $('#bid').click(function () {
        sendBid()
    })
});

var dialogFinished = (function(){
    var original = dialogFinished;
    startTimer();
})

function onMessageReceived(evt) {
    var data = JSON.parse(evt.data)

    if (data["command"] != undefined) {
        var value = data["value"]
        switch (data["command"]) {
            case "set_cookie":
                $.cookie("userID", value);
                break;
            case "remove_cookie":
                var result = $.removeCookie('userID');
                break;
            case "debug":
                console.log(value);
                break;
            case "project":
                currentProject = value;
                setupUI();
                showFirmInfo();
                hasSubmit = false;
                loading.hide();
                break;
            case "connection_ready":
                if (!value) {
                    loading.show();
                } else {
                    loading.hide();
                }
                break;
            case "assign_firm":
                firmList = value["firmList"];
                userFirm = value["userFirm"];
                bondCapacity = value["bondCapacity"];
                setupTable();
                startTimer();
                break;
            case "update_info":
                firmList = value["firmList"];
                offer = value["offer"];
                bondCapacity = value["bondCapacity"];
                currentProject = value["currentPorject"];
                count = value["count"];
                updateUI();
                loading.hide();
                getProgressReport();
                break;
            default:

        }
    }

}

function startTimer() {
    timeRemaining = 180;
    if (timerID != 0) { clearInterval(timerID); }
    timerID = setInterval(function () {
        if (hasSubmit) { clearInterval(timerID);}
        if (timeRemaining <= 1) {
            if (!hasSubmit) {
                sendBid();
            }
            clearInterval(timerID);
            timerID = 0;
        }
        timeRemaining -= 1
        $.cookie("timeRemaining", timeRemaining);
        $('#timer').text(timeRemaining + " Seconds Left");
    }, 1000)
}

function setupUI() {
    // update the status
    var cost = currentProject["totalCost"];
    var firm = firmList[userFirm];
    var bondCost = (getBondCost(firm, cost, bondCapacity[userFirm])).toFixed(0);
    var ohCost = (firm["OHRatio"] * cost).toFixed(0);

    $('#invitation').val(count);
    $('#directCost').val(cost);
    $('#bondCost').val(bondCost);
    $('#ohCost').val(ohCost);
    updateTotalCost();

    // update contact info
    $('#fake_image').attr('src', currentProject["owner"]["ui"]);
    $('#owner-name').text("Name: " + currentProject["owner"]["name"]);
    $('#owner-email').text("Email: " + currentProject["owner"]["email"]);
    $('#owner-company').text("Company Name: " + currentProject["owner"]["company"]);
    $('#owner-Type').text("Owner Type: " + currentProject["owner"]["type"]);
    $('#info-cost').text("Bid direct cost: " + currentProject["quarterCost"].toFixed(0));
    $('#info-project-type').text("Project Type: " + currentProject["type"]);
    $('#info-project-size').text("Project Size: " + currentProject["size"]);
    $('#info-project-description').text("Project Description: " + currentProject["description"]);


    // show the G&A
    $('#TotalGA').val(firmList[userFirm]["GA"]);

}

function setupTable() {
    // initialize the firm list in UI
    var tableContent = "<thead>\
                                <tr>\
                                    <th>#</th>";
    var tableContentCost = "<thead>\
                                <tr>\
                                    <th>#</th>\
                                    <th>Total Cost</th>";

    $.each(firmList, function (i, firm) {
        tableContent += "<th>" + firm["name"] + "</th>"
        tableContentCost += "<th>" + firm["name"] + "</th>"
    });
    tableContent += "</tr>\
                            </thead>";
    tableContentCost += "</tr>\
                            </thead>";

    $('.firms').append(tableContent);
    $('.cost').append(tableContentCost);
}

function sendBid() {
    if (connection != undefined) {
        var offer = parseFloat($('#totalCost').val());
        if (!offer) { offer = 0xfffffff;} // give a max number!
        var profit = parseFloat($('#inputProfit').val());
        var ga = parseFloat($('#inputGA').val());
        connection.send(JSON.stringify({
            "command": "send_offer",
            "value": { "id": id, "offer": offer, "profit" : profit, "ga" : ga }
        }))
        hasSubmit = true;
        loading.show();
    }
}


