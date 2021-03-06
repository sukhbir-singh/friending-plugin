$(document).on('click', '#friend_user_create_button', function(event) {
    if(this.className.indexOf(" disabled") == -1){
        this.style.display = "inline-block";
        this.nextSibling.style.display = "inline-block";
        this.nextSibling.disabled = true;
        this.previousSibling.style.display = "";
        this.className = this.className + " disabled";
        return true;
    }else{
        return false;
    }
});

$(document).on('ajax:success', '#new-user-form', function(event, results) {
    var spinner = this.querySelector(".spinner");
    spinner.style.display = "none";

    var btn = this.querySelector("#friend_user_create_button");
    btn.className = btn.className.replace(" disabled","");

    var messages_span = this.querySelector("#response_message");
    messages_span.innerHTML = results["message"];
    response_message.style.display = "inline-block";

    if(results["success"]){
        messages_span.style.color="green";

        // add new row in table
        var fr_divs = document.getElementsByClassName("friend_request_div");
        if(fr_divs.length > 0){
            var requests_table = document.getElementById("requests-table");
            var div_element = getRequestElement(results);
            for(var j=0; j<div_element.childNodes.length; j++){
                requests_table.appendChild(div_element.childNodes[j]);
            }

            // for adding ajax:success trigger to newly created form
            var last_div = requests_table.lastElementChild;
            $(last_div).on('ajax:success', function(event, results){
                deleteRequestAjaxSuccess(this, results);
            });

        }else{
            setTimeout(function(){
                window.location.reload();
            }, 2000);
        }

    }else{
        messages_span.style.color = "#a44";
    }

    var cancel_btn = this.querySelector(".cancel-link");
    cancel_btn.disabled = false;

    setTimeout(function(){
        messages_span.style.display="none";
        cancel_btn.click();
        var add_btn = document.getElementById("new-user-to-step1");
        add_btn.style.display = "";
    }, 4000);
});

$(document).on('click', '.cancel-link', function(event) {
    setTimeout(function(){
        var add_btn = document.getElementById("new-user-to-step1");
        add_btn.style.display = "";
    }, 30);
});

function getRequestElement(results){
    var node = document.createElement('div');

    node.innerHTML = "<div class='user friend_request_div' id='whole_request_"+results["request"]["id"]+"'> <table class='settings stretchtoggle'> <tbody> <tr> <td class='settings-col1'>"+ results["request"]["email"] +"</td> <td class='ml-4 last_requested_at_container' id='custom-width-fr-table' style='padding-left: 32px; width: 234px;'>"+ results["parsed_time"] +"</td> <td class='ml-4' style='padding-left: 32px;'>"+ results["request"]["status_txt"] +"</td> <td class='settings-col1'> <form class='request-delete-form form-inline' id='request-delete-form-id-"+ results["request"]["id"] +"' action='/tab/friends/frnd/request' accept-charset='UTF-8' data-remote='true' method='post'> <input name='utf8' type='hidden' value='✓'> <input type='hidden' name='_method' value='delete'> <input class='d-none' name='id' value='"+ results["request"]["id"] +"'> <input class='d-none' name='email' value='"+results["request"]["email"]+"'> <input type='submit' name='commit' value='Delete' onclick='deleteRequestBtn(this);' class='mr-2 mt-1 mb-1 delete-request-btn btnn btn-create btn btn-info btn-sm left-margin-10' data-disable-with='Delete'> <input type='submit' name='commit' value='Resend' onclick='resendRequestBtn(this);' class='mt-1 mb-1 resend-request-btn btnn btn-create btn btn-info btn-sm left-margin-10' data-disable-with='Resend'> <span class='spinner ' style='display: none'> </span></form></td></tr></tbody></table></div>";

    return node;
}

$(".delete-request-btn").on('click', function(event){
    deleteRequestBtn(event.target);
});

$(".resend-request-btn").on('click', function(event){
    resendRequestBtn(event.target);
});

function deleteRequestBtn(element){
    if(confirm('Are you sure you want to delete this friend request ?')){
        var btn = element;
        var form = element.parentElement;
        form.querySelector(".spinner").style.display = "";
        $(form).trigger('submit.rails');
    }
}

function resendRequestBtn(element){
    if(confirm('Are you sure you want to resend this friend request ?')){
        var btn = element;
        var form = element.parentElement;
        form.querySelector(".spinner").style.display = "";

        var status_element = form.parentElement.previousSibling;
        status_element.innerHTML = "Active";

        var method_element = form.querySelector("input[name='_method']");
        method_element.value = "put";
        $(form).trigger('submit.rails');
        method_element.value = "delete";
    }
}

$(".request-delete-form").on('ajax:success', function(event, results){
    deleteRequestAjaxSuccess(this, results);
});

function deleteRequestAjaxSuccess(element, results){
    var spinner = element.querySelector(".spinner");
    spinner.style.display = "none";

    if(results["success"]){
        if(results["last_request_at"]){
            // resent request
            var div = document.getElementById("whole_request_"+results["id"]);
            div.querySelector(".last_requested_at_container").innerHTML = results["last_request_at"];

        }else{
            // deletion request
            var fr_divs = document.getElementsByClassName("friend_request_div");
            if(fr_divs.length == 1){
                window.location.reload();
            }else{
                var div = document.getElementById("whole_request_"+results["id"]);
                div.parentElement.removeChild(div);
            }
        }
    }
}

$(".remote-user-delete").on('ajax:success', function(event, results){
    if(results["success"]){
        var friends = document.getElementsByClassName("friend_user_div").length;
        if(friends <= 1){
            window.location.reload();
        }else{
            this.closest(".friend_user_div").remove();
        }
    }else{
        this.previousSibling.style.display="none";
        this.style.display="";
    }
});

$(".share_checkbox").on('change', function(event){
    var element = event.target;
    var spinner = this.nextSibling.nextSibling;
    spinner.style.display = "";
    element.disabled = true;

    var form = this.closest(".toggle-permission-form");
    $(form).trigger('submit.rails');
});

$(".toggle-permission-form").on('ajax:success', function(event, results){
    var spinner = this.querySelector(".spinner");
    spinner.style.display = "none";
    check_box = this.querySelector(".share_checkbox")
    check_box.disabled = false;
    check_box.checked = results["updated_value"]
});

$('.stale_user_icon').popover();
