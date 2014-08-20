var connection = undefined

$(function () {
    var url = document.domain;
    connection = new WebSocket("ws://" + url + "/realtimeSocket?id=admin");
    connection.onmessage = onMessageReceived;
});

function onMessageReceived(evt) {
    var data = JSON.parse(evt.data)

    if (data["command"] != undefined) {
        var value = data["value"]
        switch (data["command"]) {
            case "debug":
                console.log(value);
                break;
            case "project":
                currentProject = value;
                setupUI();
                showFirmInfo();
                timeRemaining = 10;
                hasSubmit = false;
                startTimer();
                loading.hide();
                break;
            case "assign_firm":
                firmList = value["firmList"];
                userFirm = value["userFirm"];
                bondCapacity = value["bondCapacity"];
                setupTable();
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