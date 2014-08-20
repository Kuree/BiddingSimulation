var connection = undefined
var count = 1
var currentProject = {}
var bondCapacity = []

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
                break;
            case "assign_firm":
                firmList = value["firmList"];
                bondCapacity = value["bondCapacity"];
                break;
            case "send_offer":
                firmList = value["firmList"];
                bondCapacity = value["bondCapacity"];
                break;
            case "update_info":
                firmList = value["firmList"];
                offer = value["offer"];
                bondCapacity = value["bondCapacity"];
                currentProject = value["currentPorject"];
                count = value["count"];
                break;
            default:
                break;
        }
    }

}